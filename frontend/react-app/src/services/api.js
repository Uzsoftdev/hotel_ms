import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1`,
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
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log('[API Request] Auth header:', config.headers.Authorization || 'none');
    return config;
  },
  (error) => Promise.reject(error),
);

// Global response handler — centralises 401 redirect & error normalisation
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(`[API Error] ${error.response?.status} ${error.config?.url}`, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
