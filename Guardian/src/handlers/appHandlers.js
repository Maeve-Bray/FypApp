import { Alert } from 'react-native';
import { fallDetection, updateNoteInFirestore } from '../services/fallDetection';
import { sendFallNotification } from '../services/notificationsDetection';

export const createHandlers = ({
    logs,
    addLogEntry,
    updateFirestoreId,
    updateNote,
    clearAllLogs,
    setIsConnected,
    setCurrentScreen,
}) => {
    const handleAddLogEntry = async () => {
        const newLog = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            type: 'Motion Detected',
            severity: 'high',
            note: '',
        };
        addLogEntry(newLog);

        const sensorData = { type: 'Motion Detected', severity: 'high', localId: newLog.id };

        // Notification always fires regardless of Firestore
        await sendFallNotification(sensorData);

        // Log to Firestore and store the returned doc ID on the local log
        try {
            const firestoreId = await fallDetection(sensorData);
            if (firestoreId) updateFirestoreId(newLog.id, firestoreId);
        } catch (error) {
            console.warn('Cloud sync failed:', error);
        }
    };

    const handleUpdateNote = async (logId, text) => {
        updateNote(logId, text);

        // Sync note to Firestore if this log has a linked doc
        const log = logs.find(l => l.id === logId);
        if (log?.firestoreId) {
            try {
                await updateNoteInFirestore(log.firestoreId, text);
            } catch (e) {
                console.warn('Note cloud sync failed:', e);
            }
        }
    };

    const connectToSensor = () => {
        setIsConnected(true);
        Alert.alert('Connected', 'Sensor is now connected and monitoring');
    };

    const disconnectFromSensor = () => {
        setIsConnected(false);
        Alert.alert('Disconnected', 'Sensor is no longer connected');
    };

    const viewDetailedLogs = () => {
        setCurrentScreen('allLogs');
    };

    const viewAllActivity = () => {
        setCurrentScreen('allActivity');
    };

    const handleClearAllLogs = () => {
        Alert.alert(
            'Clear All Logs',
            'Are you sure you want to delete all logs?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => {
                        clearAllLogs();
                        Alert.alert('Cleared', 'All logs have been deleted');
                    },
                },
            ]
        );
    };

    const handleAddNote = (logId) => {
        Alert.prompt(
            'Add Note',
            'Why was the sensor triggered?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Save',
                    onPress: (note) => handleUpdateNote(logId, note || ''),
                },
            ]
        );
    };

    return {
        handleAddLogEntry,
        handleUpdateNote,
        connectToSensor,
        disconnectFromSensor,
        viewDetailedLogs,
        viewAllActivity,
        handleClearAllLogs,
        handleAddNote,
    };
};
