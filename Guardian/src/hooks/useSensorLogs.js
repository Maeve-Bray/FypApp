import { useState, useEffect } from 'react';
import { loadLogs, saveLogs, calculateStats } from '../utils/logStorage';

export const useSensorLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalTriggers: 0,
    triggersToday: 0,
    triggersThisWeek: 0,
    notesAdded: 0,
    lastTrigger: null,
  });

  // Load logs when hook initializes
  useEffect(() => {
    loadInitialLogs();
  }, []);

  // Calculate stats when logs change
  useEffect(() => {
    const newStats = calculateStats(logs);
    setStats(newStats);
  }, [logs]);

  const loadInitialLogs = async () => {
    const loadedLogs = await loadLogs();
    setLogs(loadedLogs);
  };

  const addLogEntry = () => {
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      note: '',
      hasNote: false
    };
    
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveLogs(updatedLogs);
    return updatedLogs;
  };

  const updateNote = (logId, text) => {
    const updatedLogs = logs.map(log => 
      log.id === logId ? { ...log, note: text, hasNote: !!text } : log
    );
    setLogs(updatedLogs);
    saveLogs(updatedLogs);
  };

  const clearAllLogs = () => {
    setLogs([]);
    saveLogs([]);
  };

  return {
    logs,
    stats,
    addLogEntry,
    updateNote,
    clearAllLogs,
  };
};