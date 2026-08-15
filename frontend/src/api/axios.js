import axios from 'axios';

export const RENDER_PRODUCTION_API_URL = 'https://dinevo.onrender.com/api';

export function getSocketServerUrl() {
  const apiUrl = getDynamicApiUrl();
  const socketUrl = apiUrl.replace(/\/api\/?$/, '');
  return socketUrl || (typeof window !== 'undefined' ? window.location.origin : '');
}

export function getDynamicApiUrl() {
  const envUrl =
    (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL)) ||
    (typeof process !== 'undefined' && process.env && (process.env.VITE_API_URL || process.env.REACT_APP_API_URL));

  if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('http') && !envUrl.includes('localhost')) {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;

    // Check if running on cloud production domains
    if (hostname.includes('vercel.app') || hostname.includes('onrender.com') || hostname.includes('netlify.app')) {
      return RENDER_PRODUCTION_API_URL;
    }

    // Localhost development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/api';
    }

    // Local Network / Wi-Fi IP access (e.g. 192.168.x.x, 10.x.x.x or .local)
    const isIpAddress = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname) || hostname.endsWith('.local');
    if (isIpAddress) {
      return '/api';
    }
  }

  return '/api';
}

const api = axios.create({
  baseURL: getDynamicApiUrl(),
  timeout: 15000
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
  async (error) => {
    // If local request fails due to network error, retry automatically with production Render backend
    if (!error.response && error.config && !error.config._retry && error.config.url) {
      error.config._retry = true;
      try {
        const fallbackUrl = RENDER_PRODUCTION_API_URL + (error.config.url.startsWith('/') ? error.config.url : `/${error.config.url}`);
        return await axios({
          ...error.config,
          url: fallbackUrl
        });
      } catch (fallbackErr) {
        return Promise.reject(fallbackErr);
      }
    }
    console.warn('[DINEVO API Warning]', error?.config?.url, error?.message);
    return Promise.reject(error);
  }
);



export default api;

