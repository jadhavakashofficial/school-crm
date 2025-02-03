// frontend/src/api/axios.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://school-crm-8uq8.onrender.com/api", // ensure this is correct
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // This ensures cookies are sent with each request
});

// Add a request interceptor to attach the Authorization header if a token exists
axiosInstance.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export default axiosInstance;
