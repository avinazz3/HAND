"use client";

import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useUserAuth } from "../../context/UserAuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { signUp } = useUserAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await signUp(email, password);
      router.push("/login");
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
          Sign Up
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
          <Form.Group controlId="formConfirmPassword" className="mb-3">
            <Form.Control
              type="password"
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            Sign Up
          </Button>
        </Form>
        <div className="text-center mt-3">
          <p style={{ color: "#ffffff" }}>
            Already have an account?{" "}
            <a
              href="/login"
              style={{
                color: "#4caf50",
                textDecoration: "none",
              }}
              onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
              onMouseOut={(e) => (e.target.style.textDecoration = "none")}
            >
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
