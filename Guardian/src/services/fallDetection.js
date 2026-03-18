import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export const fallDetection = async (sensorData) => {
    try {
        const docRef = await addDoc(collection(db, 'fallLogs'), {
            timestamp: serverTimestamp(),
            userId: 'patient-123',
            sensorData: sensorData,
            acknowledged: false,
            carerNotified: true,
            note: '',
            hasNote: false,
        });
        console.log('Fall logged with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error logging fall:', error);
        throw error;
    }
};

export const updateNoteInFirestore = async (firestoreId, note) => {
    const logRef = doc(db, 'fallLogs', firestoreId);
    await updateDoc(logRef, { note, hasNote: !!note });
};
