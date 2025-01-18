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
    const { uid: firebase_uid, email } = firebaseUser;

    // Check if the user already exists in the Supabase table
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("firebase_uid")
      .eq("firebase_uid", firebase_uid)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking existing user:", fetchError.message);
      throw fetchError;
    }

    if (!existingUser) {
      // If the user does not exist, insert a new row
      const { error: insertError } = await supabase.from("users").insert({
        firebase_uid,
        email,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Error inserting new user:", insertError.message);
        throw insertError;
      }
    } else {
      console.log("User already exists in Supabase.");
    }
  };
  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Sync the user to Supabase
      await syncUserToSupabase(firebaseUser);

      // Log the user in
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
      if (
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new Error("This email is already in use. Please log in instead.");
      }
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
