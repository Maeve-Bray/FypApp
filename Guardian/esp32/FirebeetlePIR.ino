/*
 * Guardian - DFRobot FireBeetle ESP32 + PIR Sensor
 *
 * Wiring:
 *   PIR OUT  → GPIO14 (D6 on FireBeetle)
 *   PIR VCC  → 3.3V
 *   PIR GND  → GND
 *
 * Libraries required (install via Arduino Library Manager):
 *   - Firebase ESP Client  (by Mobizt)
 *   - ArduinoJson          (by Benoit Blanchon)
 */

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"

// ── Configuration ────────────────────────────────────────────
#define WIFI_SSID       "YOUR_WIFI_SSID"
#define WIFI_PASSWORD   "YOUR_WIFI_PASSWORD"

#define FIREBASE_API_KEY   "AIzaSyBXBsafiUtCjgMRlvxqpZ2kRzCAxqT2V7E"
#define FIREBASE_DB_URL    "https://guardian-7f3ff-default-rtdb.firebaseio.com"

#define PIR_PIN         14      // GPIO14 = D6 on FireBeetle
#define TRIGGER_COOLDOWN_MS 10000  // 10 s between triggers
// ─────────────────────────────────────────────────────────────

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long lastTriggerTime = 0;
bool firebaseReady = false;

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected: " + WiFi.localIP().toString());

  // Configure Firebase
  config.api_key = FIREBASE_API_KEY;
  config.database_url = FIREBASE_DB_URL;
  config.token_status_callback = tokenStatusCallback;

  // Sign in anonymously (enable Anonymous auth in Firebase Console)
  Firebase.signUp(&config, &auth, "", "");
  Firebase.begin(&config, &fbdo);
  Firebase.reconnectWiFi(true);

  firebaseReady = true;
  Serial.println("Firebase ready");
}

void loop() {
  if (!firebaseReady || !Firebase.ready()) return;

  bool motionDetected = digitalRead(PIR_PIN) == HIGH;
  unsigned long now = millis();

  if (motionDetected && (now - lastTriggerTime > TRIGGER_COOLDOWN_MS)) {
    lastTriggerTime = now;
    Serial.println("Motion detected — sending to Firebase");

    // Write the current timestamp to /sensorTrigger/lastTriggered
    // The app listens for changes to this value
    if (Firebase.RTDB.setInt(&fbdo, "/sensorTrigger/lastTriggered", (int)now)) {
      Serial.println("Trigger sent: " + String(now));
    } else {
      Serial.println("Firebase error: " + fbdo.errorReason());
    }
  }

  delay(200);
}
