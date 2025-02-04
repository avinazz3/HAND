import axios from "axios";
import { getAuth } from "firebase/auth";
import { auth } from "../lib/firebase"; // Import the pre-initialized auth instance

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
});

// Add request interceptor to add Firebase token
axiosInstance.interceptors.request.use(
  async (config) => {
    console.log("Making request to:", config.baseURL + config.url);

    // Use the imported auth instance
    const user = auth.currentUser;

    if (user) {
      // Get fresh token
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("Response error:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url,
      });
    } else if (error.request) {
      console.error("Network error - no response received");
    } else {
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
