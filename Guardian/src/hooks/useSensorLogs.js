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

  const addLogEntry = (log) => {
    const newLog = log || {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      note: '',
      hasNote: false,
    };
    setLogs(prevLogs => {
      const updatedLogs = [newLog, ...prevLogs];
      saveLogs(updatedLogs);
      return updatedLogs;
    });
    return newLog;
  };

  const updateFirestoreId = (logId, firestoreId) => {
    setLogs(prevLogs => {
      const updatedLogs = prevLogs.map(log =>
        log.id === logId ? { ...log, firestoreId } : log
      );
      saveLogs(updatedLogs);
      return updatedLogs;
    });
  };

  const updateNote = (logId, text) => {
    setLogs(prevLogs => {
      const updatedLogs = prevLogs.map(log =>
        log.id === logId ? { ...log, note: text, hasNote: !!text } : log
      );
      saveLogs(updatedLogs);
      return updatedLogs;
    });
  };

  const clearAllLogs = () => {
    setLogs([]);
    saveLogs([]);
  };

  return {
    logs,
    stats,
    addLogEntry,
    updateFirestoreId,
    updateNote,
    clearAllLogs,
  };
};