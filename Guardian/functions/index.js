const { onValueWritten } = require('firebase-functions/v2/database');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();

// Triggered whenever the ESP32 writes a new value to /sensorTrigger/lastTriggered
exports.onMotionDetected = onValueWritten(
  {
    ref: '/sensorTrigger/lastTriggered',
    region: 'europe-west1',
  },
  async (event) => {
    if (!event.data.after.exists()) return null;

    const tokensSnapshot = await getFirestore().collection('carerTokens').get();
    if (tokensSnapshot.empty) {
      console.log('No push tokens found');
      return null;
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.data().token).filter(Boolean);
    if (tokens.length === 0) return null;

    const messages = tokens.map(token => ({
      to: token,
      title: 'Motion Detected!',
      body: 'Movement has been detected by the Guardian sensor.',
      sound: 'default',
      priority: 'high',
    }));

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log('Expo push result:', JSON.stringify(result));
    return null;
  }
);
