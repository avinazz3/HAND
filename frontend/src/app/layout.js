// src/app/layout.js
"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import "../globals.css";
import { useEffect, useState } from "react";
import { UserAuthContextProvider } from "../context/UserAuthContext";

export default function RootLayout({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark mode and persist preference in localStorage
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", JSON.stringify(newMode));
  };

  // Load dark mode preference from localStorage on initial render
  useEffect(() => {
    const savedMode = JSON.parse(localStorage.getItem("darkMode"));
    if (savedMode) {
      setDarkMode(savedMode);
    }
  }, []);

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
