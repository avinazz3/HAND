// src/lib/firebase.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBTzfrDJO-7NRm1vwmltPFbLe7D8X_dhi0",
  authDomain: "handshake-5dd27.firebaseapp.com",
  projectId: "handshake-5dd27",
  storageBucket: "handshake-5dd27.firebasestorage.app",
  messagingSenderId: "1077724196561",
  appId: "1:1077724196561:web:f306515649e08173389ff0",
  measurementId: "G-J5Q4ZR4TQD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export the required modules
export {
  auth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
};
