import axios from 'axios';

const apiBaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
  'http://localhost:5000/api';

const api = axios.create({
  baseURL: apiBaseUrl
});

export default api;
