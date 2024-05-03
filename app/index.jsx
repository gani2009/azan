import { StatusBar } from 'expo-status-bar';
import { icons, images } from '../constants';
import { Coordinates, CalculationMethod, PrayerTimes, Qibla } from 'adhan';
import { useState } from 'react';
import * as Location from 'expo-location';
import { ActivityIndicator, Linking, Button, TouchableOpacity, Image, View, Text, Animated, Easing } from 'react-native';
import { DeviceMotion } from 'expo-sensors';


const NamazRow = ({icon, name, time, current}) => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');

    let timeFormatted = `${hours}:${minutes}`;
    let textColor = current ? '#FEA81B' : '#000';
    return (
          <View className="flex-row">
            <View style={{width: '1%'}}></View>
            <View style={{width: '7%', borderBottomWidth: 1}}><Image source={icon} style={{height: 30, width: 30, tintColor: textColor}} /></View>
            <View style={{width: '43%', borderRightWidth: 1, borderBottomWidth: 1}}><Text className="font-pbold text-2xl" style={{color: textColor}}>   {name}</Text></View>
            <View style={{width: '30%', borderBottomWidth: 1}}><Text className="font-pbold text-2xl" style={{color: textColor}}>  {timeFormatted}</Text></View>
          </View>
    );
};

const goToSettings = () => Linking.openSettings();

export default function App () {
  const [location, setLocation] = useState(false);
  const [direction, setDirection] = useState(0);
  const [locationPerms, setLocationPerms] = useState(false);
  const [currentLanguage, setLanguage] = useState('en');

  const getPermissions = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationPerms('notgranted');
    };
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
    setLocationPerms('granted');
  };
  if (!location) getPermissions();

  if (locationPerms == 'notgranted') {
    return (
      <View className="bg-white items-center justify-center min-h-full">
        <Text className="font-pbold">Allow Location permissions to get access to Namaz times and qibla. </Text>
        <Text className="font-pbold">We only need "While in Use" permissions. </Text>
        <Button onPress={() => goToSettings()} title="Go to settings" accessibilityLabel="Button to go to Azan App Settings" />
      </View>
    );
  };
    // useEffect not used to improve compass smoothmess over using set update rate
    let deviceMotionSubscription = DeviceMotion.addListener( async ({ rotation }) => {
      let alpha = rotation.alpha;

      let calculatedHeading = alpha !== null ? 360 - (alpha * 180 / Math.PI) : 0;
      setDirection(calculatedHeading);
    });

  if (location == false || direction == false) {
    return (
      <View className="bg-white flex-1 items-center justify-center min-h-full">
        <ActivityIndicator size="large" />
        <Text className="font-pbold items-center">Waiting for Location</Text>
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
    kz: ['Намаз уақыттары', 'Таң', 'Бесін', 'Екінті', 'Ақшам', 'Құптан', 'Қыбла', 'Намаз', 'Уақыты', 'Азан'],
    en: ['Namaz Timing', 'Fajr', 'Zuhr', 'Asr', 'Maghrib', 'Isha', 'Qibla', 'Namaz', 'Time', 'Alarm/Azan'],
    ru: ['Врема намаза', 'Фаджр', 'Зухр', 'Аср', 'Магриб', 'Иша', 'Кибла', 'Намаз', 'Врема', 'Будильник']
  };
  let languageChoices = ['kz', 'ru', 'en'];
  const ChangeLangOnPress = () => setLanguage(languageChoices[Number(languageChoices.indexOf(currentLanguage) + 1) % languageChoices.length]);

  return (
    <View className="bg-white min-h-full">
      <View className="items-center">
        <StatusBar style="auto" />
        <Text className="font-pbold text-3xl primary mt-5">{languages[currentLanguage][0]}</Text>
        <View className="flex-row">
          <View style={{width: '1%'}}></View>
          <View style={{width: '50%', borderRightWidth: 1, borderBottomWidth: 1}}>
            <Text className="font-pbold pl-10">
              {languages[currentLanguage][7]}
            </Text>
          </View>
          <View style={{width: '30%', borderBottomWidth: 1}}>
            <Text className="font-pbold pl-2">
              {languages[currentLanguage][8]}
            </Text>
          </View>
        </View>
        <NamazRow icon={icons.fajr} name={languages[currentLanguage][1]} time={prayerTimes.fajr} current={currentPrayer == 'fajr'}/>
        <NamazRow icon={icons.zuhr} name={languages[currentLanguage][2]} time={prayerTimes.dhuhr} current={currentPrayer == 'dhuhr'}/>
        <NamazRow icon={icons.asr} name={languages[currentLanguage][3]} time={prayerTimes.asr} current={currentPrayer == 'asr'}/>
        <NamazRow icon={icons.maghrib} name={languages[currentLanguage][4]} time={prayerTimes.maghrib} current={currentPrayer == 'maghrib'}/>
        <NamazRow icon={icons.isha} name={languages[currentLanguage][5]} time={prayerTimes.isha} current={currentPrayer == 'isha'}/>
        <Text className="font-pbold text-3xl mt-8">{languages[currentLanguage][6]}</Text>

        <Animated.Image className="absolute" source={images.qiblaNeedle} style={{width: 350, height: 350, top: '91%', tintColor: '#FEA81B', transform: [
          {
            rotate: 
              qiblaNeedleRotation.interpolate({
                inputRange: [-180, 180],
                outputRange: ['-180deg', '180deg'],
              })
          }
          ]
        }} />
        <Animated.Image className="absolute" source={images.compass} style={{width: 350, height: 350, top: '91%', transform: [
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
      <TouchableOpacity onPress={ChangeLangOnPress} className="mx-6 absolute" style={{top: '90%'}}>
        <Image source={icons.world} style={{height: 60, width: 60, tintColor: '#FEA81B'}} />
      </TouchableOpacity>
    </View>
  );
};
