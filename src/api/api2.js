import axios from 'axios';

// Prefer env var; fall back to localhost:5000
const BASE_URL =import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  // withCredentials: true, // uncomment if your backend sets cookies
});

export default api;
