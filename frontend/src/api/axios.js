import axios from 'axios';

function getDynamicApiUrl() {
  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;
    // If accessed over LAN IP (e.g. 10.40.137.218 or 192.168.x.x) or cloud host
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      if (hostname.endsWith('.vercel.app') || hostname.endsWith('.render.com')) {
        return `${protocol}//${hostname}/api`;
      }
      return `${protocol}//${hostname}:5000/api`;
    }
  }

  const envUrl =
    (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL)) ||
    (typeof process !== 'undefined' && process.env && (process.env.VITE_API_URL || process.env.REACT_APP_API_URL));

  if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('http')) {
    return envUrl;
  }

  return 'http://localhost:5000/api';
}


const api = axios.create({
  baseURL: getDynamicApiUrl(),
  timeout: 15000 // 15 second timeout to prevent infinite loading screens
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('[DINEVO API Warning]', error?.config?.url, error?.message);
    return Promise.reject(error);
  }
);

export default api;
