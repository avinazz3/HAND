import axios from "axios";
import { auth } from "../lib/firebase";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add request interceptor to add Firebase token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      
      if (user) {
        // Get fresh token and force refresh if it's expired
        const token = await user.getIdToken(true);
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Redirect to login if no user
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('No authenticated user'));
      }
      
      return config;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      // Redirect to login on auth errors
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const user = auth.currentUser;
        if (user) {
          // Force token refresh
          const token = await user.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        } else {
          // Redirect to login if no user
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        // Redirect to login on refresh error
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    const errorMessage = error.response.data?.detail || error.response.data?.message || "An error occurred";
    console.error("API Error:", {
      status: error.response.status,
      message: errorMessage,
      url: originalRequest.url,
    });
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;
