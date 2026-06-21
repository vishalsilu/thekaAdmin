// import axios from 'axios';

// const API_ROOT = import.meta.env.VITE_API_URL;

// const authApi = axios.create({
//   baseURL: API_ROOT,
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // Simple cookie helpers (fallback to localStorage)
// const setCookie = (name, value, days = 365) => {
//   const expires = new Date(Date.now() + days * 864e5).toUTCString();
//   document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
// };

// const getCookie = (name) => {
//   return document.cookie.split('; ').reduce((r, v) => {
//     const parts = v.split('=');
//     return parts[0] === name ? decodeURIComponent(parts[1]) : r;
//   }, '');
// };

// const getStoredToken = () => {
//   return localStorage.getItem('admin_token') || getCookie('admin_token') || '';
// };

// const getStoredAdminId = () => {
//   return localStorage.getItem('admin_id') || getCookie('admin_id') || '';
// };

// authApi.interceptors.request.use((config) => {
//   const token = getStoredToken();
//   const adminId = getStoredAdminId();
//   if (token) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   if (adminId) {
//     config.headers = config.headers || {};
//     config.headers['x-admin-id'] = adminId;
//   }
//   if (config.data instanceof FormData && config.headers) delete config.headers['Content-Type'];
//   return config;
// }, (error) => Promise.reject(error));

// // expose helpers for storing token from login flow
// export const persistAdminSession = (token, adminId) => {
//   try {
//     localStorage.setItem('admin_token', token);
//     localStorage.setItem('admin_id', adminId);
//     setCookie('admin_token', token, 365);
//     setCookie('admin_id', adminId, 365);
//   } catch (err) {
//     // noop
//   }
// };

// export const clearAdminSession = () => {
//   try {
//     localStorage.removeItem('admin_token');
//     localStorage.removeItem('admin_id');
//     setCookie('admin_token', '', -1);
//     setCookie('admin_id', '', -1);
//   } catch (err) {}
// };

// export default authApi;



import axios from 'axios';

const API_ROOT = import.meta.env.VITE_API_URL || '';

const authApi = axios.create({
  baseURL: API_ROOT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper to set cookie with the name 'token' as expected by your backend
const setCookie = (name, value, days = 365) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  // Name set to 'token' to match backend's req.cookies.token
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=None; Secure`;
};

const getStoredToken = () => localStorage.getItem('admin_token') || '';
const getStoredAdminId = () => localStorage.getItem('admin_id') || '';

// --- Request Interceptor ---
authApi.interceptors.request.use((config) => {
  const token = getStoredToken();
  const adminId = getStoredAdminId();

  // Inject Authorization header for Header-based Auth (Bypasses cookie restrictions)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (adminId) {
    config.headers['x-admin-id'] = adminId;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
}, (error) => Promise.reject(error));


// --- NEW: Response Interceptor ---
// Catches expired sessions globally and redirects to login
authApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      // Wipe the stale session data
      clearAdminSession();
      
      // Redirect to login only if we aren't already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);


// Persist session using the 'token' key
export const persistAdminSession = (token, adminId) => {
  try {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_id', adminId);
    setCookie('token', token, 365); // Changed from 'admin_token' to 'token'
    setCookie('admin_id', adminId, 365);
  } catch (err) {
    console.error("Session persistence failed", err);
  }
};

export const clearAdminSession = () => {
  try {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_id');
    setCookie('token', '', -1);
    setCookie('admin_id', '', -1);
  } catch (err) {}
};

export default authApi;