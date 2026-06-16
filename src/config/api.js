import axios from 'axios';

// Ensure URL normalization matches the client API
const rawApiUrl = String(import.meta.env.VITE_API_URL || '').trim();
const apiBaseUrl = rawApiUrl.replace(/\/+$/, '') + (/\/api$/i.test(rawApiUrl) ? '' : '/api');

const adminApi = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for cookie-based auth
});

// Helper to save token if you still need localStorage persistence
const saveResumeToken = (token) => {
  if (!token) return;
  try {
    localStorage.setItem('x-session-token', token);
  } catch (err) {
    console.error("Failed to save token to localStorage", err);
  }
};

adminApi.interceptors.request.use(
  (config) => {
    const cartToken = localStorage.getItem('x-cart-token');
    
    // Handle FormData Content-Type removal
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Pass cart token if available
    if (cartToken) {
      config.headers['x-cart-token'] = cartToken;
    }

    // Logic to inject admin-specific ID if needed
    const adminId = document.cookie.split('; ').find(row => row.startsWith('admin_id='))?.split('=')[1];
    if (adminId) {
        config.headers['x-admin-id'] = decodeURIComponent(adminId);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

adminApi.interceptors.response.use(
  (response) => {
    // If the backend returns a session token in header or data, save it
    const fallbackToken = response.data?.sessionToken || response.headers['x-debug-session-token'];
    if (fallbackToken) {
      saveResumeToken(fallbackToken);
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default adminApi;