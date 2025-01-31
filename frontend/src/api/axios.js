// frontend/src/api/axios.js

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001/api', // Backend URL
  withCredentials: true, // Send cookies with requests
});

export default axiosInstance;
