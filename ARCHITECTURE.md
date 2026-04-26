# Guardian — Software Architecture

## System Overview

```mermaid
graph TB
    subgraph HW["Hardware Layer"]
        PIR["PIR Motion Sensor\n(GPIO 14)"]
        ESP["ESP32 FireBeetle\n(Arduino C++)"]
        PIR -->|trigger signal| ESP
    end

    subgraph FIREBASE["Firebase (Google Cloud — europe-west1)"]
        RTDB["Realtime Database\n/sensorTrigger/lastTriggered"]
        FS["Firestore\ncollections: fallLogs · carerTokens"]
        AUTH["Anonymous Auth"]
        CF["Cloud Function\nonMotionDetected\n(Node.js 22)"]
        RTDB -->|onValueWritten trigger| CF
    end

    subgraph EXPO_SVC["Expo Services"]
        EAS["EAS Build & CI/CD"]
        EXPOPUSH["Expo Push API\nexp.host/--/api/v2/push/send"]
    end

    subgraph APP["Mobile App — React Native / Expo 54"]
        direction TB

        subgraph ENTRY["Entry"]
            IDX["index.js"]
            APPJS["App.js\n(navigation hub + dashboard)"]
            FBCFG["firebaseConfig.js\n(SDK init)"]
        end

        subgraph SCREENS["Screens"]
            HOME["Home Dashboard\n(stats, recent activity, controls)"]
            LOGS["AllLogsScreen\n(full chronological log)"]
            ACTIVITY["AllActivityScreen\n(bar charts, analytics)"]
        end

        subgraph SERVICES["Services"]
            SL["sensorListener.js\n(RTDB onValue listener)"]
            FD["fallDetection.js\n(Firestore writer)"]
            ND["notificationsDetection.js\n(push token + local notify)"]
        end

        subgraph HOOKS["Hooks / State"]
            USL["useSensorLogs\n(logs array, stats, AsyncStorage)"]
        end

        subgraph HANDLERS["Handlers"]
            AH["appHandlers.js\n(connect · add log · clear · note)"]
        end

        subgraph COMPONENTS["UI Components"]
            SC["StatCard"]
            AC["ActivityCard"]
            AI["ActivityItem"]
            CB["ControlButton"]
            AB["ActionButton"]
            SEG["SegmentControl"]
        end

        subgraph LOCAL["Local Storage"]
            AS["AsyncStorage\n@sensor_logs"]
        end

        IDX --> APPJS
        APPJS --> HOME & LOGS & ACTIVITY
        HOME --> SC & AC & AI & CB & AB
        ACTIVITY --> SEG & SC
        APPJS --> SL & FD & ND & AH
        AH --> USL
        USL --> AS
    end

    %% Hardware → Firebase
    ESP -->|WiFi · write timestamp| RTDB

    %% Firebase ↔ App
    RTDB -->|streaming updates| SL
    SL -->|motion event callback| APPJS
    FD -->|write fallLogs doc| FS
    ND -->|register token| FS
    FBCFG --> RTDB & FS & AUTH

    %% Cloud Function → Expo Push
    CF -->|read carerTokens| FS
    CF -->|POST batch push| EXPOPUSH
    EXPOPUSH -->|push notification| APP

    %% Local notification
    ND -->|local notification| APP

    style HW fill:#fef3c7,stroke:#d97706
    style FIREBASE fill:#dbeafe,stroke:#2563eb
    style APP fill:#dcfce7,stroke:#16a34a
    style EXPO_SVC fill:#f3e8ff,stroke:#9333ea
```

---

## Data Flow — Motion Detection Event

```mermaid
sequenceDiagram
    participant PIR as PIR Sensor
    participant ESP as ESP32
    participant RTDB as Firebase RTDB
    participant CF as Cloud Function
    participant FS as Firestore
    participant EXPO as Expo Push API
    participant APP as Mobile App
    participant AS as AsyncStorage

    PIR->>ESP: GPIO 14 HIGH (motion)
    ESP->>RTDB: write /sensorTrigger/lastTriggered = <timestamp>

    par Cloud Function path
        RTDB->>CF: onValueWritten trigger
        CF->>FS: query carerTokens
        FS-->>CF: [token1, token2, ...]
        CF->>EXPO: POST /push/send (batch)
        EXPO-->>APP: remote push notification
    and Mobile App listener path
        RTDB->>APP: onValue update (sensorListener.js)
        APP->>FS: write fallLogs doc (fallDetection.js)
        APP->>APP: local push notification (notificationsDetection.js)
        APP->>AS: persist log (useSensorLogs)
        APP->>APP: re-render dashboard stats
    end
```

---

## Component & State Hierarchy

```mermaid
graph TD
    APP["App.js\nnav state · sensor connected flag"]

    APP --> HOME["Home Dashboard"]
    APP --> LOGS["AllLogsScreen"]
    APP --> ACT["AllActivityScreen"]

    HOME --> SC1["StatCard ×4\n(Today · Week · Month · Total)"]
    HOME --> AC["ActivityCard\n(activity level)"]
    HOME --> CB["ControlButton\n(connect / disconnect / test)"]
    HOME --> AI1["ActivityItem ×3\n(3 most recent)"]
    HOME --> AB["ActionButton grid"]

    LOGS --> AI2["ActivityItem[]\n(all logs, add note)"]

    ACT --> SEG["SegmentControl\n(Day/Week/Month/Year)"]
    ACT --> SC2["StatCard ×3\n(Total · Peak · Average)"]
    ACT --> CHART["BarChart\n(react-native-chart-kit)"]
    ACT --> INS["InsightCards\n(busiest period, active count)"]

    style APP fill:#bbf7d0,stroke:#15803d
    style HOME fill:#e0f2fe,stroke:#0369a1
    style LOGS fill:#e0f2fe,stroke:#0369a1
    style ACT fill:#e0f2fe,stroke:#0369a1
```

---

## Firestore Schema

| Collection | Field | Type | Notes |
|---|---|---|---|
| **fallLogs** | `timestamp` | Timestamp | serverTimestamp |
| | `userId` | string | `"patient-123"` (hardcoded) |
| | `type` | string | `"Motion Detected"` |
| | `severity` | string | `"high"` |
| | `note` | string | Carer-added annotation |
| | `hasNote` | boolean | |
| | `acknowledged` | boolean | |
| | `carerNotified` | boolean | |
| **carerTokens** | `carerId` | string | `"default"` |
| | `token` | string | `ExponentPushToken[...]` |
| | `timestamp` | Timestamp | serverTimestamp |

**RTDB path**: `/sensorTrigger/lastTriggered` → `<unix-ms timestamp>`

---

## Deployment Targets

| Component | How deployed |
|---|---|
| Mobile app (dev) | `npx expo start` → Expo Go on device |
| Mobile app (prod) | `eas build` → App Store / Play Store |
| Cloud Functions | `firebase deploy --only functions` |
| Firestore / RTDB rules | `firebase deploy --only firestore,database` |
| ESP32 firmware | Arduino IDE → USB upload |
