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
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function App() {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [timeRange, setTimeRange] = useState('today');

  // Stats state
  const [stats, setStats] = useState({
    totalTriggers: 0,
    triggersToday: 0,
    triggersThisWeek: 0,
    notesAdded: 0,
    lastTrigger: null,
  });

  // Load logs when app starts
  useEffect(() => {
    loadLogs();
  }, []);

  // Calculate stats when logs change
  useEffect(() => {
    calculateStats(logs);
  }, [logs]);

  const loadLogs = async () => {
    try {
      const savedLogs = await AsyncStorage.getItem('@sensor_logs');
      if (savedLogs) {
        setLogs(JSON.parse(savedLogs));
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const saveLogs = async (updatedLogs) => {
    try {
      await AsyncStorage.setItem('@sensor_logs', JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Error saving logs:', error);
    }
  };

  // Add a new log when sensor triggers
  const addLogEntry = () => {
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      note: '',
      hasNote: false
    };
  //test 
  
    
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveLogs(updatedLogs);
    
    // Show visual feedback
    Alert.alert('Motion Detected!', 'Sensor was triggered');
  };

  // Update note for a log
  const updateNote = (logId, text) => {
    const updatedLogs = logs.map(log => 
      log.id === logId ? { ...log, note: text, hasNote: !!text } : log
    );
    setLogs(updatedLogs);
    saveLogs(updatedLogs);
  };

  const calculateStats = (logData) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const triggersToday = logData.filter(log => 
      new Date(log.timestamp) >= today
    ).length;

    const triggersThisWeek = logData.filter(log => 
      new Date(log.timestamp) >= weekAgo
    ).length;

    const notesAdded = logData.filter(log => log.hasNote).length;

    const lastTrigger = logData.length > 0 ? logData[0].timestamp : null;

    setStats({
      totalTriggers: logData.length,
      triggersToday,
      triggersThisWeek,
      notesAdded,
      lastTrigger,
    });
  };

  const getActivityLevel = () => {
    if (stats.triggersToday === 0) return 'low';
    if (stats.triggersToday <= 5) return 'medium';
    return 'high';
  };

  const getActivityColor = () => {
    const level = getActivityLevel();
    switch (level) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      default: return '#4CAF50';
    }
  };

  const getActivityMessage = () => {
    const level = getActivityLevel();
    switch (level) {
      case 'low': return 'Quiet day';
      case 'medium': return 'Normal activity';
      case 'high': return 'Busy day!';
      default: return 'No data';
    }
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

  // Clear all logs
  const clearAllLogs = () => {
    Alert.alert(
      'Clear All Logs',
      'Are you sure you want to delete all logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            setLogs([]);
            saveLogs([]);
            Alert.alert('Cleared', 'All logs have been deleted');
          }
        },
      ]
    );
  };

  // Stat Card Component
  const StatCard = ({ title, value, subtitle, color = '#6366F1' }) => (
    <LinearGradient
      colors={[color + '20', color + '10']}
      style={styles.statCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </LinearGradient>
  );

  // Time Range Button Component
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

  // Activity Item Component
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

  // Add note handler
  const handleAddNote = (logId) => {
    Alert.prompt(
      'Add Note',
      'Why was the sensor triggered?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: (note) => updateNote(logId, note || '')
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Guardian</Text>
        <View style={styles.connectionStatus}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isConnected ? '#4CAF50' : '#F44336' },
            ]}
          />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Activity Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Overview</Text>
          <LinearGradient
            colors={[getActivityColor() + '30', getActivityColor() + '10']}
            style={styles.activityCard}
          >
            <View style={styles.activityHeader}>
              <Text style={styles.activityLevel}>{getActivityMessage()}</Text>
              <View style={styles.activityIndicator}>
                <View
                  style={[
                    styles.activityDot,
                    { backgroundColor: getActivityColor() },
                  ]}
                />
                <Text style={styles.activityCount}>{stats.triggersToday}</Text>
              </View>
            </View>
            <Text style={styles.activitySubtitle}>
              Triggers today • {getActivityLevel().toUpperCase()} ACTIVITY
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
            <TouchableOpacity
              style={[styles.controlButton, styles.connectButton]}
              onPress={isConnected ? disconnectFromSensor : connectToSensor}
            >
              <Text style={styles.controlIcon}>
                {isConnected ? '🔌' : '🔗'}
              </Text>
              <Text style={styles.controlText}>
                {isConnected ? 'Disconnect' : 'Connect Sensor'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, styles.testButton]}
              onPress={addLogEntry}
            >
              <Text style={styles.controlIcon}>🎯</Text>
              <Text style={styles.controlText}>Test Trigger</Text>
            </TouchableOpacity>
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

          {logs.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No activity recorded yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Connect sensor and trigger motion to see logs here
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={viewDetailedLogs}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionText}>View All Logs</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={clearAllLogs}
            >
              <Text style={styles.actionIcon}>🗑️</Text>
              <Text style={styles.actionText}>Clear Logs</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Export', 'Export functionality would go here')}
            >
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.actionText}>Export Data</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Settings', 'Settings would open here')}
            >
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
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
  statCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  controlsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
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