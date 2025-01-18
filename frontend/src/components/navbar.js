"use client";

import React from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function NavigationBar() {
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      className="shadow-sm"
      style={{ zIndex: 10 }}
    >
      <Container>
        {/* Brand / Logo */}
        <Navbar.Brand
          onClick={() => handleNavigation("/")}
          style={{ cursor: "pointer", fontWeight: "bold" }}
        >
          Handshake
        </Navbar.Brand>

        {/* Toggler for smaller screens */}
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            {/* Navigation Links */}
            <Nav.Link onClick={() => handleNavigation("/")} className="px-3">
              Home
            </Nav.Link>
            <Nav.Link
              onClick={() => handleNavigation("/my-bets")}
              className="px-3"
            >
              Top Bets
            </Nav.Link>
            <Nav.Link
              onClick={() => handleNavigation("/groups")}
              className="px-3"
            >
              Public Groups
            </Nav.Link>
            <Nav.Link
              onClick={() => handleNavigation("/profile")}
              className="px-3"
            >
              My Groups
            </Nav.Link>

            <Nav.Link
              onClick={() => handleNavigation("/profile")}
              className="px-3"
            >
              Create Group
            </Nav.Link>

            {/* Optional Dropdown Menu */}
            <NavDropdown
              title="Account"
              id="basic-nav-dropdown"
              className="px-3"
              align="end"
            >
              <NavDropdown.Item onClick={() => handleNavigation("/settings")}>
                Settings
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={() => handleNavigation("/logout")}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
