"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, GoogleAuthProvider, signInWithPopup } from "../lib/firebase";
import { supabase } from "../lib/supabase";

const UserAuthContext = createContext();

export function useUserAuth() {
  return useContext(UserAuthContext);
}

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
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
    const { uid, email, displayName } = firebaseUser;

    // Generate a unique username (could use part of the email or Firebase display name)
    const username = email.split("@")[0];

    const { error } = await supabase.from("users").upsert({
      id: uid, // Use Firebase UID as the primary key
      username,
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
      const result = await auth.createUserWithEmailAndPassword(
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
      const result = await auth.signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return result.user;
    } catch (error) {
      console.error("Log-In Error:", error.message);
      throw error;
    }
  };

  const logOut = async () => {
    await auth.signOut();
    setUser(null);
  };

  return (
    <UserAuthContext.Provider
      value={{ user, googleSignIn, signUp, logIn, logOut }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}
