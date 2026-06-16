import axios from 'axios';

const API_ROOT = import.meta.env.VITE_API_URL;

const authApi = axios.create({
  baseURL: API_ROOT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Simple cookie helpers (fallback to localStorage)
const setCookie = (name, value, days = 365) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
};

const getCookie = (name) => {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
};

const getStoredToken = () => {
  return localStorage.getItem('admin_token') || getCookie('admin_token') || '';
};

const getStoredAdminId = () => {
  return localStorage.getItem('admin_id') || getCookie('admin_id') || '';
};

authApi.interceptors.request.use((config) => {
  const token = getStoredToken();
  const adminId = getStoredAdminId();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (adminId) {
    config.headers = config.headers || {};
    config.headers['x-admin-id'] = adminId;
  }
  if (config.data instanceof FormData && config.headers) delete config.headers['Content-Type'];
  return config;
}, (error) => Promise.reject(error));

// expose helpers for storing token from login flow
export const persistAdminSession = (token, adminId) => {
  try {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_id', adminId);
    setCookie('admin_token', token, 365);
    setCookie('admin_id', adminId, 365);
  } catch (err) {
    // noop
  }
};

export const clearAdminSession = () => {
  try {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_id');
    setCookie('admin_token', '', -1);
    setCookie('admin_id', '', -1);
  } catch (err) {}
};

export default authApi;
