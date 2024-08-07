import { StatusBar } from 'expo-status-bar';
import { icons, images } from './constants';
import { Coordinates, CalculationMethod, PrayerTimes, Qibla } from 'adhan';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { ActivityIndicator, Dimensions, Linking, Button, TouchableOpacity, Image, View, Text, Animated, Easing, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error(e);
  }
};

const getDeviceFontSize = () => {
  const { width } = Dimensions.get('window');
  
  if (width < 360) {
    return 20;
  } else if (width >= 360 && width < 768) {
    return 25;
  } else {
    return 30;
  }
};

// Retrieve data
const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    console.error(e);
  };
};

const CustomFontedText = ({children, size=getDeviceFontSize(), textColor}) => {
  return (
    <Text style={{fontFamily: 'Roboto', fontSize: size, fontWeight: 'bold', color: textColor}}>{children}</Text>
  )
};

const NamazRow = ({icon, name, time, current}) => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');

    let timeFormatted = `${hours}:${minutes}`;
    let textColor = current ? '#FEA81B' : '#000';
    return (
          <View className="flex-row">
            <View style={{width: '1%'}}></View>
            <View style={{width: '7%', borderBottomWidth: 1}}><Image source={icon} style={{height: 30, width: 30, tintColor: textColor}} /></View>
            <View style={{width: '43%', borderRightWidth: 1, borderBottomWidth: 1}}><CustomFontedText textColor={textColor}>   {name}</CustomFontedText></View>
            <View style={{width: '30%', borderBottomWidth: 1}}><CustomFontedText textColor={textColor}>  {timeFormatted}</CustomFontedText></View>
          </View>
    );
};

const requestNotificationPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
};

const getSecondsUntilXminutesBefore = (targetDate, xMinutes) => {
  const now = new Date();
  const tenMinutesBefore = new Date(targetDate.getTime() - (xMinutes * 60 * 1000)); // Subtract 10 minutes in milliseconds
  const differenceInMilliseconds = tenMinutesBefore - now;
  const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);
  return differenceInSeconds;
};

const scheduleNotification = async (seconds, title, body) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
    },
    trigger: {
      seconds: seconds
    },
  });
};

const goToSettings = () => Linking.openSettings();

export default function App() {
  const [location, setLocation] = useState(false);
  const [direction, setDirection] = useState(0);
  const [reminder, setReminders] = useState(false);
  const [reminderIcon, setReminderIcon] = useState(reminder == false ? icons.remindersOff : icons.remindersOn);
  const [locationPerms, setLocationPerms] = useState(false);
  const [notiPerms, setNotiPerms] = useState(null);
  const [currentLanguage, setLanguage] = useState("en");
  const [initializing, setInitializing] = useState(true);
  let languageChoices = ['қаз', 'рус', 'en'];
  useEffect(() => {
    const fetchData = async () => {
      if (await getData("language") == null) await storeData("language", "en");
      const languageS = await getData('language');
      const reminderS = await getData("reminder");
      setReminders(reminderS != "on" ? true : false);
      setReminderIcon(reminder != false ? icons.remindersOff : icons.remindersOn);
      setInitializing(false);
      setLanguage(languageChoices.indexOf(languageS) != -1 ? languageS : 'en');
    };

    if (initializing) fetchData();
  }, []);

  useEffect(() => {
    const getPermission = async () => {
      const status = await requestNotificationPermission();
      if (status === 'denied' && notiPerms != 'denied') {
        Alert.alert(
          'Notification Permission',
          'You will not receive prayer time reminders if you refuse notifications permission. You can later give Azan notification permissions and receive reminders.',
          [{ text: 'OK' }]
        );
        setNotiPerms('denied');
      } else if (status === 'granted') {
        setNotiPerms('allowed');
      }
    };
    getPermission();
  }, []);
  const getPermissions = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationPerms('notgranted');
    };
    let currentLocation = await Location.getLastKnownPositionAsync({});
    setLocation(currentLocation);
    setLocationPerms('granted');
  };
  if (!location) getPermissions();
  if (locationPerms == 'notgranted') {
    return (
      <View className="bg-white items-center justify-center min-h-full">
        <CustomFontedText>Allow Location permissions to get access to Namaz times and qibla. </CustomFontedText>
        <CustomFontedText>We only need "While in Use" permissions. </CustomFontedText>
        <Button onPress={() => goToSettings()} title="Go to settings" accessibilityLabel="Button to go to Azan App Settings" />
      </View>
    );
  };

  Location.watchHeadingAsync((e) => {
    setDirection(e.magHeading);
  });

  if (location == false || direction == false) {
    return (
      <View className="bg-white flex-1 items-center justify-center min-h-full">
        <ActivityIndicator size="large" />
        <CustomFontedText>Waiting for Location</CustomFontedText>
      </View>
    );
  };
  const coordinates = new Coordinates(location.coords.latitude, location.coords.longitude);
  const params = CalculationMethod.MuslimWorldLeague();
  const date = new Date();
  const prayerTimes = new PrayerTimes(coordinates, date, params);
  var qiblaDirection = Qibla(coordinates);
  let qiblaNeedleDirection = qiblaDirection - direction;
  const qiblaNeedleRotation = new Animated.Value(qiblaNeedleDirection);
  const directionRotation = new Animated.Value(direction);

  Animated.timing(qiblaNeedleRotation, {
    toValue: qiblaNeedleDirection,
    duration: 100, // Duration of the animation in milliseconds
    easing: Easing.linear, // Animation easing function
    useNativeDriver: true, // Use native driver for better performance
  }).start();
  Animated.timing(directionRotation, {
    toValue: direction,
    duration: 100, // Duration of the animation in milliseconds
    easing: Easing.linear, // Animation easing function
    useNativeDriver: true, // Use native driver for better performance
  }).start();

  var currentPrayer = prayerTimes.currentPrayer();  
  let languages = {
    қаз: ['Намаз уақыттары', 'Таң', 'Бесін', 'Екінті', 'Ақшам', 'Құптан', 'Қыбла', 'Намаз', '  Уақыты', 'Азан', 'Намаз ескертулер қойылды'],
    en: ['Namaz Timing', 'Fajr', 'Zuhr', 'Asr', 'Maghrib', 'Isha', 'Qibla', 'Namaz', '  Time', 'Alarm/Azan', 'Salah reminders set!'],
    рус: ['Врема намаза', 'Фаджр', 'Зухр', 'Аср', 'Магриб', 'Иша', 'Кибла', 'Намаз', '  Врема', 'Будильник', 'Намаз напоминания установлены!']
  };
  const ChangeLangOnPress = () => {
    setLanguage(languageChoices[Number(languageChoices.indexOf(currentLanguage) + 1) % languageChoices.length]);
    storeData("language", languageChoices[Number(languageChoices.indexOf(currentLanguage) + 1) % languageChoices.length]);
  };

  const toggleReminder = async () => {
    setReminders(!reminder);
    if (notiPerms == "denied") setReminders("noPerms");
    if (reminder == false) {
      await storeData("reminder", "off");
      setReminderIcon(icons.remindersOff);
      await Notifications.cancelAllScheduledNotificationsAsync();
    } else if (reminder == true){
      await storeData("reminder", "on");
      setReminderIcon(icons.remindersOn);
      Alert.alert(
        languages[currentLanguage][10],
        languages[currentLanguage][10],
        [{ text: 'OK' }]
      );
      if (new Date(prayerTimes.fajr.getTime() - (10 * 60 * 1000)) > new Date()) scheduleNotification(getSecondsUntilXminutesBefore(prayerTimes.fajr, 10), "Fajr Reminder", "Pray fajr salah");
      if (new Date(prayerTimes.dhuhr.getTime() - (10 * 60 * 1000)) > new Date()) scheduleNotification(getSecondsUntilXminutesBefore(prayerTimes.dhuhr, 10), "Dhuhr Reminder", "Pray dhuhr salah");
      if (new Date(prayerTimes.asr.getTime() - (10 * 60 * 1000)) > new Date()) scheduleNotification(getSecondsUntilXminutesBefore(prayerTimes.asr, 10), "Asr Reminder", "Pray asr salah");
      if (new Date(prayerTimes.maghrib.getTime() - (10 * 60 * 1000)) > new Date()) scheduleNotification(getSecondsUntilXminutesBefore(prayerTimes.maghrib, 10), "Maghrib Reminder", "Pray maghrib salah");
      if (new Date(prayerTimes.isha.getTime() - (10 * 60 * 1000)) > new Date() )scheduleNotification(getSecondsUntilXminutesBefore(prayerTimes.isha, 10), "Isha Reminder", "Pray isha salah");
    } else {
      setReminderIcon(icons.remindersOff);
      await storeData("reminder", "off");
    };
  };

  return (
    <SafeAreaProvider>
    <SafeAreaView className="min-h-full" style={{fontFamily: 'Roboto'}}>
      <View className="items-center">
        <StatusBar style="auto" />
        <CustomFontedText>{languages[currentLanguage][0]}</CustomFontedText>
        <View className="flex-row">
          <View style={{width: '1%'}}></View>
          <View style={{width: '50%', borderRightWidth: 1, borderBottomWidth: 1}}>
            <CustomFontedText>
              {languages[currentLanguage][7]}
            </CustomFontedText>
          </View>
          <View style={{width: '30%', borderBottomWidth: 1}}>
            <CustomFontedText>
              {languages[currentLanguage][8]}
            </CustomFontedText>
          </View>
        </View>
        <NamazRow icon={icons.fajr} name={languages[currentLanguage][1]} time={prayerTimes.fajr} current={currentPrayer == 'fajr'}/>
        <NamazRow icon={icons.zuhr} name={languages[currentLanguage][2]} time={prayerTimes.dhuhr} current={currentPrayer == 'dhuhr' || currentPrayer == 'sunrise'}/>
        <NamazRow icon={icons.asr} name={languages[currentLanguage][3]} time={prayerTimes.asr} current={currentPrayer == 'asr'}/>
        <NamazRow icon={icons.maghrib} name={languages[currentLanguage][4]} time={prayerTimes.maghrib} current={currentPrayer == 'maghrib'}/>
        <NamazRow icon={icons.isha} name={languages[currentLanguage][5]} time={prayerTimes.isha} current={currentPrayer == 'isha'}/>
        <View style={{marginTop: 20}}></View>
        <CustomFontedText>{languages[currentLanguage][6]}</CustomFontedText>

        <Animated.Image className="absolute" source={images.qiblaNeedle} style={{width: 350, height: 350, top: '95%', tintColor: '#FEA81B', transform: [
          {
            rotate:
              qiblaNeedleRotation.interpolate({
                inputRange: [-180, 180],
                outputRange: ['-180deg', '180deg'],
              })
          }
          ]
        }} />
        <Animated.Image className="absolute" source={images.compass} style={{width: 350, height: 350, top: '95%', transform: [
          {
            rotate: 
              directionRotation.interpolate({
                inputRange: [-180, 180],
                outputRange: ['180deg', '-180deg'],
              })
          }
          ]
        }} />
        <Image className="absolute" source={icons.kaaba} style={{width: 60, height: 60, top: '91%', marginTop: 145}} />
      </View>
      <View className="absolute" style={{bottom: '5%', maxWidth: '70px', right: '85%'}}>
        <Button onPress={ChangeLangOnPress} title={currentLanguage.toUpperCase()} color="black" />
      </View>
      <TouchableOpacity onPress={toggleReminder} className="mx-6 absolute" style={{bottom: '6%', left: '80%'}}>
        <Image source={reminderIcon} style={{height: 20, width: 20}} />
      </TouchableOpacity>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}