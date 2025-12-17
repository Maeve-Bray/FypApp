import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadLogs = async () => {
  try {
    const savedLogs = await AsyncStorage.getItem('@sensor_logs');
    return savedLogs ? JSON.parse(savedLogs) : [];
  } catch (error) {
    console.error('Error loading logs:', error);
    return [];
  }
};

export const saveLogs = async (logs) => {
  try {
    await AsyncStorage.setItem('@sensor_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving logs:', error);
  }
};

export const calculateStats = (logData) => {
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

  return {
    totalTriggers: logData.length,
    triggersToday,
    triggersThisWeek,
    notesAdded,
    lastTrigger,
  };
};

export const getActivityLevel = (triggersToday) => {
  if (triggersToday === 0) return 'low';
  if (triggersToday <= 5) return 'medium';
  return 'high';
};

export const getActivityColor = (activityLevel) => {
  switch (activityLevel) {
    case 'low': return '#4CAF50';
    case 'medium': return '#FF9800';
    case 'high': return '#F44336';
    default: return '#4CAF50';
  }
};

export const getActivityMessage = (activityLevel) => {
  switch (activityLevel) {
    case 'low': return 'Quiet day';
    case 'medium': return 'Normal activity';
    case 'high': return 'Busy day!';
    default: return 'No data';
  }
};