import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ActivityItem = ({ log, index, totalItems, onAddNote }) => (
  <View style={styles.activityItem}>
    <View style={styles.activityItemLeft}>
      <View style={styles.activityDotSmall} />
      {index < totalItems - 1 && <View style={styles.activityLine} />}
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityTime}>
        {new Date(log.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
      <Text style={styles.activityDate}>
        {new Date(log.timestamp).toLocaleDateString()}
      </Text>
      {log.hasNote ? (
        <Text style={styles.activityNote} numberOfLines={1}>
          📝 {log.note}
        </Text>
      ) : (
        <TouchableOpacity onPress={() => onAddNote(log.id)}>
          <Text style={styles.activityNoNote}>+ Add note</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  activityItemLeft: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  activityDotSmall: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366F1',
    zIndex: 2,
  },
  activityLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
    marginTop: 4,
  },
  activityContent: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  activityTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  activityNote: {
    fontSize: 14,
    color: '#475569',
  },
  activityNoNote: {
    fontSize: 14,
    color: '#6366F1',
    fontStyle: 'italic',
  },
});

export default ActivityItem;