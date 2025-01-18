"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { UserAuthContextProvider } from "../context/UserAuthContext";
import NavigationBar from "../components/navbar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Define the routes where the navbar should not appear
  const noNavbarRoutes = ["/login", "/signup"];

  return (
    <html lang="en">
      <body style={{ backgroundColor: "#121212", color: "#ffffff" }}>
        <UserAuthContextProvider>
          {/* Conditionally render the navbar */}
          {!noNavbarRoutes.includes(pathname) && <NavigationBar />}
          <div className="container">{children}</div>
        </UserAuthContextProvider>
      </body>
    </html>
  );
}
