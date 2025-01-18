"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import "../globals.css";
import { useEffect, useState } from "react";
import {
  UserAuthContextProvider,
  useUserAuth,
} from "../context/UserAuthContext";
import NavigationBar from "../../components/navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={darkMode ? "dark-mode" : ""}>
      <body>
        <UserAuthContextProvider>
          <div className="d-flex justify-content-between align-items-center p-3">
            <h1>Auth App</h1>
            <button className="btn btn-secondary" onClick={toggleDarkMode}>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
          <div className="container">{children}</div>
        </UserAuthContextProvider>
      </body>
    </html>
  );
}

function AuthenticatedLayout({ children, darkMode, toggleDarkMode }) {
  const { user } = useUserAuth(); // Access user authentication state

  return (
    <>
      {/* Render Navbar only for authenticated users */}
      {user && <NavigationBar />}

      <div className="d-flex justify-content-between align-items-center p-3">
        <h1>{user ? "Welcome Back!" : "Auth App"}</h1>
        <button className="btn btn-secondary" onClick={toggleDarkMode}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <div className="container">{children}</div>
    </>
  );
}
