import { useSensorLogs } from '../hooks/useSensorLogs';

// Simple wrapper hook to expose sensor log data to the app
export const useAppData = () => {
    return useSensorLogs();
};
