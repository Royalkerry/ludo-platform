// src/utils/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // Automatically prepends to every request
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⛔ No token found, request may fail");
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// ✅ Global error interceptor for suspended/blocked users
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const errMsg = error.response?.data?.error || "";

    if (errMsg.includes("suspended")) {
      alert("⏸️ You are suspended and cannot perform this action.\nPlease contact your uplink.");
    }

    if (errMsg.includes("blocked")) {
      alert("🚫 Your account has been blocked.\nPlease contact support.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
