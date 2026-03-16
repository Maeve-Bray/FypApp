import { ref, onValue, off } from 'firebase/database';
import { rtdb } from '../../firebaseConfig';

let unsubscribe = null;

// Listens to /sensorTrigger/lastTriggered in RTDB.
// Calls onFallDetected(timestamp) whenever the ESP32 writes a new value.
export const startSensorListener = (onFallDetected) => {
    const triggerRef = ref(rtdb, 'sensorTrigger/lastTriggered');
    let initialized = false;

    unsubscribe = onValue(triggerRef, (snapshot) => {
        // Skip the initial value emitted when the listener first attaches
        if (!initialized) {
            initialized = true;
            return;
        }
        if (snapshot.exists()) {
            onFallDetected(snapshot.val());
        }
    });
};

export const stopSensorListener = () => {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }
};
