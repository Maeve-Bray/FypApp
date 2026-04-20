/*
 * Guardian - DFRobot FireBeetle ESP32 + PIR Sensor
 *
 * Wiring:
 *   PIR OUT  → GPIO14 (D6 on FireBeetle)
 *   PIR VCC  → 3.3V
 *   PIR GND  → GND
 *
 * No external libraries required — uses built-in WiFi + HTTPClient
 */

#include <WiFi.h>
#include <HTTPClient.h>

// ── Configuration ────────────────────────────────────────────
#define WIFI_SSID "SKY5FNUK"
#define WIFI_PASSWORD "M36quJGHxEas"

#define FIREBASE_DB_URL "https://guardian-7f3ff-default-rtdb.europe-west1.firebasedatabase.app"

#define PIR_PIN 14                // GPIO14 = D6 on FireBeetle
#define TRIGGER_COOLDOWN_MS 3000 // 3 s between triggers
// ─────────────────────────────────────────────────────────────

unsigned long lastTriggerTime = 0;

void setup()
{
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected: " + WiFi.localIP().toString());
}

void loop()
{
  bool motionDetected = digitalRead(PIR_PIN) == HIGH;
  unsigned long now = millis();

  if (motionDetected && (now - lastTriggerTime > TRIGGER_COOLDOWN_MS))
  {
    lastTriggerTime = now;
    Serial.println("Motion detected — sending to Firebase");

    if (WiFi.status() == WL_CONNECTED)
    {
      HTTPClient http;
      String url = String(FIREBASE_DB_URL) + "/sensorTrigger/lastTriggered.json";
      http.begin(url);
      http.addHeader("Content-Type", "application/json");
      int responseCode = http.PUT(String(now));
      if (responseCode > 0)
      {
        Serial.println("Trigger sent, response: " + String(responseCode));
      }
      else
      {
        Serial.println("HTTP error: " + String(responseCode));
      }
      http.end();
    }
  }

  delay(200);
}
