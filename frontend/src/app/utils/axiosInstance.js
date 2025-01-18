import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to log URLs
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("Making request to:", config.baseURL + config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
