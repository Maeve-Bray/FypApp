import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Configure notification display behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Request permission, get Expo push token, and save it to Firestore
export const registerForPushNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
    }

    const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

    if (!projectId) {
        console.warn('No Expo projectId found — run "eas init" or add it to app.json extra.eas.projectId');
        return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Push token:', token);
    await saveCarerToken('default', token);
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

// Save a carer's push token to Firestore (skip if already stored)
export const saveCarerToken = async (carerId, token) => {
    const existing = await getDocs(query(collection(db, 'carerTokens'), where('token', '==', token)));
    if (!existing.empty) return;
    await addDoc(collection(db, 'carerTokens'), {
        carerId,
        token,
        timestamp: serverTimestamp(),
    });
};
