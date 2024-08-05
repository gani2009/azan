# Azan App

A React Native app for calculating Namaz timings and Qibla direction using Expo and React Native.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)
- [Links](#links)

## Installation
**Note**: This app should not be modified or built for redistribution. Use the provided links for installation and privacy information.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20.12.2 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Steps

1. Clone the repository:

    ```sh
    git clone https://github.com/gani2009/azan.git
    cd azan
    ```

2. Install the dependencies:

    ```sh
    npm install
    ```

3. Start the development server:

    ```sh
    npm start
    ```

4. Use the Expo app on your device or an emulator to scan the QR code and run the app.

## Usage

This app calculates Namaz timings and Qibla direction based on your current location. Make sure to grant the necessary permissions for location access and notifications.

### Permissions

The app requests the following permissions:
- Location: To determine your current location for accurate prayer times and Qibla direction.
- Notifications: To send prayer time reminders.

### Functions

- **Prayer Times Calculation**: Calculates the prayer times based on your current location.
- **Qibla Direction**: Provides the direction of the Qibla from your current location.
- **Notifications**: Sends reminders for prayer times.

## Dependencies

| **Dependency**            | **Version** | **Description**                     |
|---------------------------|-------------|-------------------------------------|
| `react`                   | 18.3.1      | Core React library                  |
| `react-native`            | 0.74.4      | Core React Native library           |
| `expo`                    | ^51.0.24    | Expo framework                      |
| `expo-status-bar`         | ^1.12.1     | Expo status bar component           |
| `expo-location`           | ^17.0.1     | Expo location services              |
| `expo-notifications`      | ^0.28.14    | Expo notifications service          |
| `expo-sensors`            | ^13.0.9     | Expo sensors                        |
| `react-native-safe-area-context` | 4.10.5  | Safe area context for React Native   |
| `react-native-screens`    | 3.31.1      | Navigation screens for React Native |
| `@react-native-async-storage/async-storage` | ^1.24.0 | Async storage for React Native |
| `adhan`                   | ^4.4.3      | Library for Islamic prayer times    |

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have any improvements or bug fixes.

### Steps to Contribute

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request.

## License

This project is licensed under the BSD-3-Clause License. See the [LICENSE](LICENSE) file for details.

## Links

- [Install on Play Store](https://play.google.com/apps/testing/com.edgarni.azan)
- [Privacy Policy](https://gani2009.github.io/azan-privacy-policy/)

