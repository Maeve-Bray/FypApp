import { Alert } from 'react-native';

export const createHandlers = ({
    addLogEntry,
    updateNote,
    clearAllLogs,
    setIsConnected,
    setCurrentScreen,
}) => {
    const handleAddLogEntry = () => {
        addLogEntry();
        Alert.alert('Motion Detected!', 'Sensor was triggered');
    };

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
