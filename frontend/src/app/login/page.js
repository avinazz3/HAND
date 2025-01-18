"use client";

import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useUserAuth } from "../../context/UserAuthContext";
import { useRouter } from "next/navigation";
import GoogleButton from "react-google-button";

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
      await googleSignIn();
      router.push("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: "100vh",
        backgroundColor: "#121212",
        color: "#ffffff",
      }}
    >
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
              className="placeholder-white"
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
              className="placeholder-white"
            />
          </Form.Group>
          <Button type="submit" variant="primary" className="w-100 mb-3">
            Log In
          </Button>
          <div className="d-flex justify-content-center mb-3">
            <GoogleButton
              type="dark"
              onClick={handleGoogleSignIn}
              style={{ width: "100%" }}
            />
          </div>
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
