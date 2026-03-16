import * as Notifications from 'expo-notifications';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Configure notification display behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Request permission and get Expo push token
export const registerForPushNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
    return token;
};

// Fire an immediate local notification for a fall event
export const sendFallNotification = async (sensorData) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Fall Detected!',
            body: `A fall event was detected. Severity: ${sensorData?.severity || 'unknown'}`,
            sound: true,
        },
        trigger: null, // send immediately
    });
};

// Save a carer's push token to Firestore so a backend can target them
export const saveCarerToken = async (carerId, token) => {
    await addDoc(collection(db, 'carerTokens'), {
        carerId,
        token,
        timestamp: serverTimestamp(),
    });
};
