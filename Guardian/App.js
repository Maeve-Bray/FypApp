import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  getActivityLevel, 
  getActivityColor, 
  getActivityMessage 
} from './src/utils/logStorage';
import { useSensorLogs } from './src/hooks/useSensorLogs';
import StatCard from './src/components/StatCard';
import ActivityItem from './src/components/ActivityItem';
import TimeRangeButton from './src/components/TimeRangeButton';
import Header from './src/components/Header';
import EmptyState from './src/components/EmptyState';
import ControlButton from './src/components/ControlButton';
import ActionButton from './src/components/ActionButton';

const { width } = Dimensions.get('window');

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [timeRange, setTimeRange] = useState('today');
  
  const {
    logs,
    stats,
    addLogEntry,
    updateNote,
    clearAllLogs,
  } = useSensorLogs();

  // Add a new log when sensor triggers
  const handleAddLogEntry = () => {
    addLogEntry();
    // Show visual feedback
    Alert.alert('Motion Detected!', 'Sensor was triggered');
  };

  // Update note for a log
  const handleUpdateNote = (logId, text) => {
    updateNote(logId, text);
  };

  // Simulate sensor connection
  const connectToSensor = () => {
    setIsConnected(true);
    Alert.alert('Connected', 'Sensor is now connected and monitoring');
  };

  const disconnectFromSensor = () => {
    setIsConnected(false);
    Alert.alert('Disconnected', 'Sensor is no longer connected');
  };

  // Navigate to detailed logs view
  const viewDetailedLogs = () => {
    Alert.alert('Navigation', 'This would open the detailed logs screen');
  };

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

  // Add note handler
  const handleAddNote = (logId) => {
    Alert.prompt(
      'Add Note',
      'Why was the sensor triggered?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: (note) => handleUpdateNote(logId, note || '')
        },
      ]
    );
  };

  const activityLevel = getActivityLevel(stats.triggersToday);
  const activityColor = getActivityColor(activityLevel);
  const activityMessage = getActivityMessage(activityLevel);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header title="Guardian" isConnected={isConnected} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Activity Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Overview</Text>
          <LinearGradient
            colors={[activityColor + '30', activityColor + '10']}
            style={styles.activityCard}
          >
            <View style={styles.activityHeader}>
              <Text style={styles.activityLevel}>{activityMessage}</Text>
              <View style={styles.activityIndicator}>
                <View
                  style={[
                    styles.activityDot,
                    { backgroundColor: activityColor },
                  ]}
                />
                <Text style={styles.activityCount}>{stats.triggersToday}</Text>
              </View>
            </View>
            <Text style={styles.activitySubtitle}>
              Triggers today • {activityLevel.toUpperCase()} ACTIVITY
            </Text>
          </LinearGradient>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Triggers"
              value={stats.totalTriggers}
              color="#6366F1"
            />
            <StatCard
              title="This Week"
              value={stats.triggersThisWeek}
              color="#10B981"
            />
            <StatCard
              title="Notes Added"
              value={stats.notesAdded}
              subtitle={`${Math.round((stats.notesAdded / stats.totalTriggers) * 100) || 0}%`}
              color="#F59E0B"
            />
            <StatCard
              title="Last Trigger"
              value={stats.lastTrigger ? new Date(stats.lastTrigger).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              color="#EF4444"
            />
          </View>
        </View>

        {/* Sensor Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sensor Controls</Text>
          <View style={styles.controlsGrid}>
            <ControlButton
              type="connect"
              isConnected={isConnected}
              onPress={isConnected ? disconnectFromSensor : connectToSensor}
            />
            
            <ControlButton
              type="test"
              onPress={handleAddLogEntry}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={viewDetailedLogs}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {logs.slice(0, 3).map((log, index) => (
            <ActivityItem
              key={log.id}
              log={log}
              index={index}
              totalItems={Math.min(logs.length, 3)}
              onAddNote={handleAddNote}
            />
          ))}

          {logs.length === 0 && <EmptyState />}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              icon="📋"
              text="View All Logs"
              onPress={viewDetailedLogs}
            />
            
            <ActionButton
              icon="🗑️"
              text="Clear Logs"
              onPress={handleClearAllLogs}
            />
            
            <ActionButton
              icon="📤"
              text="Export Data"
              onPress={() => Alert.alert('Export', 'Export functionality would go here')}
            />
            
            <ActionButton
              icon="⚙️"
              text="Settings"
              onPress={() => Alert.alert('Settings', 'Settings would open here')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 60,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  activityCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityLevel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  activityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  activityCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  controlsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});