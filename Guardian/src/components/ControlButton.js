import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const ControlButton = ({ 
  icon, 
  text, 
  onPress, 
  type = 'connect',
  isConnected = false 
}) => {
  const getButtonStyle = () => {
    switch (type) {
      case 'connect':
        return styles.connectButton;
      case 'test':
        return styles.testButton;
      default:
        return styles.connectButton;
    }
  };

  const getIcon = () => {
    if (type === 'connect') {
      return isConnected ? '🔌' : '🔗';
    }
    return icon || '🎯';
  };

  const getText = () => {
    if (type === 'connect') {
      return isConnected ? 'Disconnect' : 'Connect Sensor';
    }
    return text || 'Test Trigger';
  };

  return (
    <TouchableOpacity
      style={[styles.controlButton, getButtonStyle()]}
      onPress={onPress}
    >
      <Text style={styles.controlIcon}>{getIcon()}</Text>
      <Text style={styles.controlText}>{getText()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  connectButton: {
    backgroundColor: '#10B981',
  },
  testButton: {
    backgroundColor: '#F59E0B',
  },
  controlIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  controlText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ControlButton;