import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

const fallDetection = async (sensorData) => {
    try {
        const docRef = await addDoc(collection(db, 'fallLogs'), {
        timestamp: serverTimestamp(),
        userId: 'patient-123', 
        sensorData: sensorData,
        acknowledged: false,
        carerNotified: true
        });
        console.log('Fall logged with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error logging fall:', error);
    }
};