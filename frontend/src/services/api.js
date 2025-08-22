import axios from 'axios';

// API Configuration
const API_BASE_URL = 'https://bookstorebackend-0n75.onrender.com/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
const isDevelopment = import.meta.env.DEV;

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (isDevelopment) console.log('🔐 JWT token attached to request:', config.url);
    } else {
      if (isDevelopment) console.log('⚠️ No JWT token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - let the calling code handle this
      if (isDevelopment) console.log('🔒 401 error in API interceptor');
      sessionStorage.removeItem('authToken');
      // Don't automatically redirect - let the component handle it
    }
    return Promise.reject(error);
  }
);

export default api; 