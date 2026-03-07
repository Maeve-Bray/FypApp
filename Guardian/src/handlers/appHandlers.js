import { Alert } from 'react-native';
import { fallDetection } from '../services/fallDetection';


export const createHandlers = ({
    addLogEntry,
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

        // Log fall event to Firestore
            try {
        await fallDetection({
            type: 'Motion Detected',
            severity: 'high',
            localId: newLog.id,
        });
        Alert.alert('Success', 'Fall event logged');
        } catch (error) {
        Alert.alert('Warning', 'Logged locally but cloud sync failed');
        }
    }

    const handleUpdateNote = (logId, text) => {
        updateNote(logId, text);
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
