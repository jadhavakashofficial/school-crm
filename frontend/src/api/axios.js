// frontend/src/api/axios.js

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://school-crm-8uq8.onrender.com/api', // Backend URL
  withCredentials: true, // Send cookies with requests
});

export default axiosInstance;
