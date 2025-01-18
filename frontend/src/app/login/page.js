"use client";

import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useUserAuth } from "../../context/UserAuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import GoogleButton from "react-google-button"; // Official Google button

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { logIn, googleSignIn, user } = useUserAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await logIn(email, password);
      router.push("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      const firebaseUser = await googleSignIn();
      if (firebaseUser) {
        router.push("/"); // Redirect to homepage after successful sign-in
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{
        height: "100vh",
        backgroundColor: "#121212",
        color: "#ffffff",
      }}
    >
      {/* Logo */}
      <Image
        src="/img/logo.png"
        alt="Handshake Logo"
        width={360} // Increased by 20% from 300
        height={168} // Increased by 20% from 140
        style={{
          marginBottom: "20px", // Reduced margin to bring closer to form
        }}
      />

      <div
        className="p-4 shadow-sm rounded card"
        style={{ width: "400px", backgroundColor: "#1e1e1e" }}
      >
        <h2
          className="mb-4 text-center"
          style={{ color: "#ffffff", fontWeight: "bold" }}
        >
          Log In
        </h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formEmail" className="mb-3">
            <Form.Control
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                backgroundColor: "#2e2e2e",
                color: "#ffffff",
                caretColor: "#ffffff",
              }}
              className="text-white placeholder-white"
            />
          </Form.Group>
          <Form.Group controlId="formPassword" className="mb-3">
            <Form.Control
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                backgroundColor: "#2e2e2e",
                color: "#ffffff",
                caretColor: "#ffffff",
              }}
              className="text-white placeholder-white"
            />
          </Form.Group>
          <Button type="submit" variant="primary" className="w-100 mb-3">
            Log In
          </Button>
          <GoogleButton
            onClick={handleGoogleSignIn}
            style={{ width: "100%" }} // Make the button fit the form width
          />
        </Form>
        <div className="text-center mt-3">
          <p style={{ color: "#ffffff" }}>
            Don’t have an account?{" "}
            <a
              href="/signup"
              style={{
                color: "#4caf50",
                textDecoration: "none",
              }}
              onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
              onMouseOut={(e) => (e.target.style.textDecoration = "none")}
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
