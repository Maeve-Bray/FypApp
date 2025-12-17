import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const TimeRangeButton = ({ range, label, currentRange, onPress }) => (
  <TouchableOpacity
    style={[
      styles.timeRangeButton,
      currentRange === range && styles.timeRangeButtonActive,
    ]}
    onPress={() => onPress(range)}
  >
    <Text
      style={[
        styles.timeRangeButtonText,
        currentRange === range && styles.timeRangeButtonTextActive,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#6366F1',
  },
  timeRangeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  timeRangeButtonTextActive: {
    color: 'white',
  },
});

export default TimeRangeButton;