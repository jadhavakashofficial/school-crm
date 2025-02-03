// frontend/src/api/axios.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://school-crm-8uq8.onrender.com/api", // ensure this is correct
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // This ensures cookies are sent with each request
});

export default axiosInstance;
