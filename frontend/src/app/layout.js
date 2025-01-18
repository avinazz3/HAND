"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { UserAuthContextProvider } from "../context/UserAuthContext";
import NavigationBar from "../components/navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#121212", color: "#ffffff" }}>
        <UserAuthContextProvider>
          <NavigationBar />
          <div className="container">{children}</div>
        </UserAuthContextProvider>
      </body>
    </html>
  );
}
