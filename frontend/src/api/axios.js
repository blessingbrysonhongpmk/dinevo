import axios from 'axios';

export const RENDER_PRODUCTION_API_URL = 'https://dinevo.onrender.com/api';

function getDynamicApiUrl() {
  // 1. Environment Variable (VITE_API_URL || REACT_APP_API_URL)
  const envUrl =
    (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL)) ||
    (typeof process !== 'undefined' && process.env && (process.env.VITE_API_URL || process.env.REACT_APP_API_URL));

  if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('http')) {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }

  // 2. Production Browser Environment (Vercel / Render / Cloud domain)
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;

    // If running on production Vercel or cloud domain, use Render production backend
    if (hostname && (hostname.endsWith('.vercel.app') || hostname.endsWith('.render.com') || (hostname !== 'localhost' && hostname !== '127.0.0.1' && !/^\d+\.\d+\.\d+\.\d+$/.test(hostname)))) {
      return RENDER_PRODUCTION_API_URL;
    }

    // If running on local LAN IP (e.g. 10.40.137.218:3000), point to local backend
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:5000/api`;
    }
  }

  // 3. Default fallback for local development
  return 'http://localhost:5000/api';
}

const api = axios.create({
  baseURL: getDynamicApiUrl(),
  timeout: 15000 // 15 second timeout to prevent infinite loading screens
});

api.interceptors.request.use(
  (config) => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('dinevo_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('[DINEVO API Warning]', error?.config?.url, error?.message);
    return Promise.reject(error);
  }
);


export default api;

