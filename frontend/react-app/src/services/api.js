import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'https://allstay.rest'}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach auth token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Global response handler — centralises 401 redirect & error normalisation
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Only hard-redirect from protected pages — public pages (Hotels, Home, etc.)
      // must remain accessible even when a stale token triggers a 401 on profile load.
      const path = window.location.pathname;
      const isProtected =
        path.startsWith('/admin') ||
        path.startsWith('/user/') ||
        path.startsWith('/staff/') ||
        path === '/dashboard';
      if (isProtected) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
