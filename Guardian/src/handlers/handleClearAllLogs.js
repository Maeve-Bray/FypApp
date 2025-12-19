import React from 'react';
import{ Text, Alert } from 'react-native';

// Clear all logs with confirmation
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
            }
        },
        ]
        );
};