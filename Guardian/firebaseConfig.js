import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBXBsafiUtCjgMRlvxqpZ2kRzCAxqT2V7E",
    authDomain: "guardian-7f3ff.firebaseapp.com",
    projectId: "guardian-7f3ff",
    storageBucket: "guardian-7f3ff.firebasestorage.app",
    messagingSenderId: "568644128034",
    appId: "1:568644128034:web:2ab11f980555e1a99e297b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);