import * as Notifications from 'expo-notifications';

    // Configure notification behavior
    Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
    });

    // Request permission and get push token
    const registerForPushNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        alert('Permission for notifications not granted!');
        return;
    }
    
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
    return token;
    };

    // Store tokens in Firestore
    const saveCarerToken = async (carerId, token) => {
    await addDoc(collection(db, 'carerTokens'), {
        carerId: carerId,
        token: token,
        timestamp: serverTimestamp()
    });
};