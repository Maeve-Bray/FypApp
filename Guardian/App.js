import React, { useState, useEffect } from 'react';
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
  getActivityMessage,
  getActivityColor,
} from './src/utils/logStorage';
import { useAppData } from './src/handlers/useAppData';
import { createHandlers } from './src/handlers/appHandlers';
import { registerForPushNotifications, sendFallNotification } from './src/services/notificationsDetection';
import { startSensorListener, stopSensorListener } from './src/services/sensorListener';
import { fallDetection } from './src/services/fallDetection';
import StatCard from './src/components/StatCard';
import ActivityItem from './src/components/ActivityItem';
import AllLogsScreen from './src/screens/AllLogsScreen';
import AllActivityScreen from './src/screens/AllActivityScreen';
import TimeRangeButton from './src/components/TimeRangeButton';
import Header from './src/components/Header';
import EmptyState from './src/components/EmptyState';
import ControlButton from './src/components/ControlButton';
import ActionButton from './src/components/ActionButton';

const { width } = Dimensions.get('window');

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [timeRange, setTimeRange] = useState('today');
  
  const { logs, stats, addLogEntry, updateNote, clearAllLogs } = useAppData();

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  useEffect(() => {
    if (isConnected) {
      startSensorListener(async () => {
        const sensorData = { type: 'Motion Detected', severity: 'high', source: 'PIR Sensor' };
        const newLog = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: 'Motion Detected',
          severity: 'high',
          note: '',
        };
        addLogEntry(newLog);
        try {
          await fallDetection(sensorData);
          await sendFallNotification(sensorData);
        } catch (e) {
          console.error('Sensor fall processing error:', e);
        }
      });
    } else {
      stopSensorListener();
    }
    return () => stopSensorListener();
  }, [isConnected]);

  // Simple screen navigation
  const [currentScreen, setCurrentScreen] = useState('home');

  // Create handlers 
  const handlers = createHandlers({
    addLogEntry,
    updateNote,
    clearAllLogs,
    setIsConnected,
    setCurrentScreen,
  });

  const activityLevel = getActivityLevel(stats.triggersToday);
  const activityColor = getActivityColor(activityLevel);
  const activityMessage = getActivityMessage(activityLevel);

  // rendering navigation
  if (currentScreen === 'allLogs') {
    return (
      <AllLogsScreen
        logs={logs}
        onBack={() => setCurrentScreen('home')}
        onAddNote={handlers.handleAddNote}
        clearAllLogs={handlers.handleClearAllLogs}
      />
    );
  }

  if (currentScreen === 'allActivity') {
    return (
      <AllActivityScreen
        logs={logs}
        onBack={() => setCurrentScreen('home')}
      />
    );
  }

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

            <TouchableOpacity onPress={handlers.viewAllActivity} style={styles.viewGraphsButton}>
              <Text style={styles.viewGraphsText}>View graphs ↗</Text>
            </TouchableOpacity>

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
              onPress={isConnected ? handlers.disconnectFromSensor : handlers.connectToSensor}
            />
            
            <ControlButton
              type="test"
              onPress={handlers.handleAddLogEntry}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={handlers.viewDetailedLogs}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {logs.slice(0, 3).map((log, index) => (
            <ActivityItem
              key={log.id}
              log={log}
              index={index}
              totalItems={Math.min(logs.length, 3)}
              onAddNote={handlers.handleAddNote}
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
              onPress={handlers.viewDetailedLogs}
            />

            <ActionButton
              icon="🗑️"
              text="Clear Logs"
              onPress={handlers.handleClearAllLogs}
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
  viewGraphsButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewGraphsText: {
    color: '#6366F1',
    fontWeight: '600',
  },
});