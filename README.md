# Guardian

**Guardian** is a React Native mobile app built with Expo for monitoring motion detection events from a PIR sensor connected to a DFRobot FireBeetle ESP32. It logs incidents, visualises activity trends, and sends push notifications to carers — designed with elderly fall detection in mind.

## Features

- **Home Dashboard** — Activity level indicator (Low/Medium/High), quick stats (total triggers, this week, last trigger time, notes), sensor connect/disconnect controls, and recent activity list
- **All Logs** — Full chronological list of sensor trigger events with per-entry note support and clear-all functionality
- **Activity Analytics** — Bar chart visualisation of activity aggregated by Daily/Weekly/Monthly/Yearly periods, with peak, average, and trend stats
- **Push Notifications** — Alerts sent to registered carers on motion detection via Expo Notifications and Firebase Cloud Functions
- **Offline Support** — All logs persisted locally via AsyncStorage; synced to Firebase Firestore when available

## Tech Stack

| Layer             | Technology                            |
| ----------------- | ------------------------------------- |
| Framework         | React Native 0.81 + Expo 54           |
| Cloud Database    | Firebase Firestore                    |
| Real-time Events  | Firebase Realtime Database            |
| Auth              | Firebase Anonymous Auth               |
| Local Storage     | AsyncStorage                          |
| Notifications     | Expo Notifications                    |
| Charts            | react-native-chart-kit                |
| Backend Functions | Firebase Cloud Functions (Node.js)    |
| Hardware          | DFRobot FireBeetle ESP32 + PIR sensor |

## Project Structure

```
FypApp/
└── Guardian/
    ├── App.js                         # Navigation hub and home dashboard
    ├── firebaseConfig.js              # Firebase SDK initialisation (Firestore, RTDB, Auth)
    ├── index.js                       # Expo entry point
    ├── app.json                       # Expo project config
    ├── eas.json                       # EAS build config
    ├── firebase.json                  # Firebase deployment config
    ├── firestore.rules                # Firestore security rules
    ├── database.rules.json            # Realtime Database security rules
    ├── assets/                        # App icons and splash images
    ├── src/
    │   ├── components/                # Reusable UI components
    │   │   ├── Header.js              # App title + connection status indicator
    │   │   ├── StatCard.js            # Metric display with gradient background
    │   │   ├── ActivityItem.js        # Timeline log entry with note support
    │   │   ├── ControlButton.js       # Connect/Disconnect sensor buttons
    │   │   ├── ActionButton.js        # Quick action grid buttons
    │   │   └── EmptyState.js          # No-logs placeholder
    │   ├── screens/
    │   │   ├── AllLogsScreen.js       # Full chronological log list
    │   │   └── AllActivityScreen.js   # Analytics and bar chart screen
    │   ├── handlers/
    │   │   └── appHandlers.js         # Event handlers (connect, add log, update note, clear)
    │   ├── hooks/
    │   │   └── useSensorLogs.js       # Central state management hook (logs, stats)
    │   ├── services/
    │   │   ├── sensorListener.js      # Firebase RTDB listener for ESP32 motion events
    │   │   ├── fallDetection.js       # Firestore logging operations
    │   │   └── notificationsDetection.js  # Push notification registration and dispatch
    │   └── utils/
    │       └── logStorage.js          # AsyncStorage persistence and stats calculations
    ├── functions/
    │   └── index.js                   # Cloud Function: sends push notifications on motion
    └── esp32/
        └── FirebeetlePIR.ino          # Arduino firmware for FireBeetle ESP32 + PIR sensor
```

## Data Flow

```
ESP32 (PIR Sensor)
  └─▶ Firebase RTDB: /sensorTrigger/lastTriggered
        ├─▶ Cloud Function: onMotionDetected
        │     └─▶ Fetches carer tokens from Firestore
        │           └─▶ Sends push notifications via Expo API
        └─▶ Mobile App (sensorListener.js)
              ├─▶ Logs event to Firestore: fallLogs
              ├─▶ Caches locally in AsyncStorage
              └─▶ Fires local push notification
```

## Setup & Run

### Mobile App

1. Install dependencies:

   ```bash
   cd Guardian
   npm install
   ```

2. Start Expo dev server:

   ```bash
   npx expo start
   ```

3. Open on device via the **Expo Go** app (scan QR code), or press `a` for Android emulator / `i` for iOS simulator.

### Firebase Cloud Functions

1. Install function dependencies:

   ```bash
   cd Guardian/functions
   npm install
   ```

2. Deploy to Firebase:

   ```bash
   firebase deploy --only functions
   ```

   The `onMotionDetected` function triggers on writes to `/sensorTrigger/lastTriggered`, fetches all carer tokens from Firestore, and sends push notifications via the Expo API. It runs in the `europe-west1` region.

### ESP32 Firmware

1. Open [Guardian/esp32/FirebeetlePIR.ino](Guardian/esp32/FirebeetlePIR.ino) in Arduino IDE.
2. Install required libraries: **Firebase ESP Client** (Mobizt), **ArduinoJson** (Benoit Blanchon).
3. Update the WiFi SSID/password and Firebase API key + database URL in the sketch.
4. Wire the PIR sensor: OUT → GPIO14 (D6), VCC → 3.3V, GND → GND.
5. Upload to the FireBeetle ESP32.

The ESP32 writes a motion timestamp to `/sensorTrigger/lastTriggered` on each detection event, with a 10-second cooldown between triggers.

## Firebase Collections

| Collection    | Purpose                                                                  |
| ------------- | ------------------------------------------------------------------------ |
| `fallLogs`    | Sensor trigger events — timestamp, userId, notes, acknowledgement status |
| `carerTokens` | Expo push tokens for registered carer devices                            |
