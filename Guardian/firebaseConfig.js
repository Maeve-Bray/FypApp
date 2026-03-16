import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyBXBsafiUtCjgMRlvxqpZ2kRzCAxqT2V7E",
    authDomain: "guardian-7f3ff.firebaseapp.com",
    projectId: "guardian-7f3ff",
    storageBucket: "guardian-7f3ff.firebasestorage.app",
    messagingSenderId: "568644128034",
    appId: "1:568644128034:web:2ab11f980555e1a99e297b",
    databaseURL: "https://guardian-7f3ff-default-rtdb.europe-west1.firebasedatabase.app/",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
