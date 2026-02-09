import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token and store_id
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const storeId = localStorage.getItem('store_id');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add store_id to request body for POST/PUT requests
  if (storeId && (config.method === 'post' || config.method === 'put')) {
    config.data = {
      ...config.data,
      store_id: storeId,
    };
  }

  // Add store_id as query param for GET requests
  if (storeId && config.method === 'get') {
    config.params = {
      ...config.params,
      store_id: storeId,
    };
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('store_id');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
