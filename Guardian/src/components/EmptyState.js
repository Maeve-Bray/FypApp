import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmptyState = () => {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No activity recorded yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Connect sensor and trigger motion to see logs here
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
});

export default EmptyState;