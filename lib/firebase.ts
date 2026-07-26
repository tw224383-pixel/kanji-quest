import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBl37z_L8hpMM-5gBblj-7ROlCe9_jdrfA",
  authDomain: "kanji-quest-b1a45.firebaseapp.com",
  projectId: "kanji-quest-b1a45",
  storageBucket: "kanji-quest-b1a45.firebasestorage.app",
  messagingSenderId: "433385293218",
  appId: "1:433385293218:web:34e0a27ac41b8e2d3edefb",
  measurementId: "G-ZJ4TCB45TP"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
