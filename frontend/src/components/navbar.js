"use client";
import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap"; // Import Button here
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/context/UserAuthContext";
import Image from "next/image";

export default function NavigationBar({ onNavigate, onCreateGroup }) {
  const { user, logOut } = useUserAuth();
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      await logOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Navbar
      style={{
        backgroundColor: "#343a40", // Dark gray background
        zIndex: 1050,
        top: 0,
        left: 0,
        height: "70px", // Navbar height
        padding: "0 15px",
      }}
      variant="dark"
      expand="lg"
      className="shadow-sm position-fixed w-100"
    >
      <Container style={{ display: "flex", alignItems: "center" }}>
        {/* Brand / Logo */}
        <Navbar.Brand
          onClick={() => handleNavigation("/")}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Image
            src="/img/logo.png"
            alt="Handshake Logo"
            width={150} // Larger width
            height={70} // Matches the navbar height
            priority
            style={{
              objectFit: "contain",
            }}
          />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto" style={{ alignItems: "center" }}>
            <Nav.Link
              onClick={onNavigate?.topBets}
              className="px-3"
              style={{ color: "#2CC5B4" }}
            >
              Top Bets
            </Nav.Link>
            <Nav.Link
              onClick={onNavigate?.publicGroups}
              className="px-3"
              style={{ color: "#2CC5B4" }}
            >
              Public Groups
            </Nav.Link>
            <Nav.Link
              onClick={onNavigate?.myGroups}
              className="px-3"
              style={{ color: "#2CC5B4" }}
            >
              My Groups
            </Nav.Link>
            <Nav.Link
              onClick={onCreateGroup}
              className="px-3"
              style={{
                color: "#2CC5B4",
                border: "2px solid #2CC5B4",
                borderRadius: "5px",
                padding: "5px 15px",
              }}
            >
              Create Group
            </Nav.Link>
            {/* Logout Button */}
            <Nav.Link className="px-3">
              <Button
                variant="danger"
                className="px-4 py-2"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
