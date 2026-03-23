# Guardian (FYP Project)

**Guardian** is a React Native mobile app (built with Expo) for monitoring motion detection events from a PIR sensor connected to a DFRobot FireBeetle ESP32 microcontroller. It logs incidents, visualises activity trends, and sends push notifications to carers — designed with elderly fall detection in mind.

## Features

- **Home Dashboard** — Activity overview with level indicator (Low/Medium/High), quick stats (total triggers, this week, last trigger time, notes %), sensor connect/disconnect controls, and recent activity list
- **All Logs** — Full chronological list of sensor trigger events with per-entry note support and clear-all functionality
- **Activity Analytics** — Bar chart visualisation of activity aggregated by Daily/Weekly/Monthly/Yearly periods, with peak, average, and trend stats
- **Push Notifications** — Alerts sent to registered carers on motion detection via Expo Notifications
- **Offline Support** — All logs persisted locally via AsyncStorage; synced to Firebase when available

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81 + Expo 54 |
| Cloud Database | Firebase Firestore |
| Real-time Events | Firebase Realtime Database |
| Auth | Firebase Anonymous Auth |
| Local Storage | AsyncStorage |
| Notifications | Expo Notifications |
| Charts | react-native-chart-kit |
| Hardware | DFRobot FireBeetle ESP32 + PIR sensor |

## Project Structure

```
Guardian/
├── App.js                        # Navigation and app entry point
├── firebaseConfig.js             # Firebase initialisation
├── esp32/
│   └── FirebeetlePIR.ino         # Arduino firmware for ESP32 + PIR sensor
├── src/
│   ├── components/               # Reusable UI (ActionButton, StatCard, Header, etc.)
│   ├── screens/
│   │   ├── AllLogsScreen.js      # Full log list screen
│   │   └── AllActivityScreen.js  # Analytics and chart screen
│   ├── handlers/                 # UI event handlers
│   ├── hooks/
│   │   └── useSensorLogs.js      # Main data management hook
│   ├── services/
│   │   ├── sensorListener.js     # Firebase RTDB listener for ESP32 events
│   │   ├── fallDetection.js      # Firestore logging operations
│   │   └── notificationsDetection.js  # Push notification registration & dispatch
│   └── utils/
│       └── logStorage.js         # AsyncStorage operations and stats calculations
└── functions/                    # Firebase Cloud Functions
```

## Setup & Run

### Mobile App

1. Install dependencies:

   ```bash
   cd Guardian
   npm install
   ```

2. Start Expo:

   ```bash
   npx expo start
   ```

3. Open on device via the **Expo Go** app (scan QR code), or press `a` for Android emulator / `i` for iOS simulator.

### ESP32 Firmware

1. Open `esp32/FirebeetlePIR.ino` in Arduino IDE.
2. Install required libraries: **Firebase ESP Client**, **ArduinoJson**.
3. Update the WiFi SSID/password and Firebase credentials in the sketch.
4. Connect the PIR sensor to **GPIO14 (D6)** on the FireBeetle board.
5. Upload to the FireBeetle ESP32.

The ESP32 posts to `/sensorTrigger/lastTriggered` in Firebase Realtime Database on each motion event (10-second cooldown between triggers). The app listens for changes and logs each event to Firestore, updates local storage, and fires a push notification.

## Firebase Collections

| Collection | Purpose |
|---|---|
| `fallLogs` | Stores each sensor trigger event with timestamp, userId, notes, and acknowledgement status |
| `carerTokens` | Stores Expo push tokens for carer notification targeting |
