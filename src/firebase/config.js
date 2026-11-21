// Firebase Configuration for TAJ WATCH (taj-watch-1c74b)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: "AIzaSyAVKSUTJX8A-YLNJ8Do6VWnImyMyq4EnN4",
  authDomain: "taj-watch-1c74b.firebaseapp.com",
  projectId: "taj-watch-1c74b",
  storageBucket: "taj-watch-1c74b.firebasestorage.app",
  messagingSenderId: "171983629621",
  appId: "1:171983629621:web:1a5d29784042e9f80cf07c",
  measurementId: "G-WKVXSM8Q9S"
};

// Initialize Firebase Core
export const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Analytics safely
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}
