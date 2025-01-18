"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  auth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "../app/lib/firebase";
import { supabase } from "../app/lib/supabase";

const UserAuthContext = createContext();

export function useUserAuth() {
  return useContext(UserAuthContext);
}

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await syncUserToSupabase(firebaseUser);
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const syncUserToSupabase = async (firebaseUser) => {
    const { uid, email } = firebaseUser;

    // Generate a unique username (based on email)
    const username = email.split("@")[0];

    const { error } = await supabase.from("users").upsert({
      firebase_uid: uid, // Use Firebase UID as the identifier
      username,
      created_at: new Date().toISOString(), // Add created_at timestamp
    });

    if (error) {
      console.error("Error syncing user to Supabase:", error.message);
    }
  };

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      await syncUserToSupabase(firebaseUser);
      return firebaseUser;
    } catch (error) {
      console.error("Google Sign-In Error:", error.message);
      throw error;
    }
  };

  const signUp = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await syncUserToSupabase(result.user);
    } catch (error) {
      console.error("Sign-Up Error:", error.message);
      throw error;
    }
  };

  const logIn = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error("Log-In Error:", error.message);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error.message);
    }
  };

  return (
    <UserAuthContext.Provider
      value={{ user, googleSignIn, signUp, logIn, logOut }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}
