import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxied by Vite to backend
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lostlink_token');
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
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('lostlink_token');
      // Dispatch custom event to let authStore know
      window.dispatchEvent(new Event('unauthorized_access'));
    }
    
    return Promise.reject({
      message: error.response?.data?.error || error.message || 'An unexpected error occurred',
      status: error.response?.status,
      fields: error.response?.data?.fields
    });
  }
);

export default api;
