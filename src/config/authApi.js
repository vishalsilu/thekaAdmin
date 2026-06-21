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

// Helper to set cookie for non-sensitive data (like admin_id)
const setCookie = (name, value, days = 365) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
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


// --- Response Interceptor ---
// Catches expired sessions globally and redirects to login
authApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only wipe session strictly on 401 Unauthorized. 
    // 403 is often just a permissions error, logging out on 403 can cause loops.
    if (error.response && error.response.status === 401) {
      
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


// Persist session
export const persistAdminSession = (token, adminId) => {
  try {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_id', adminId);
    
    // NOTE: We DO NOT set the 'token' cookie here anymore. 
    // Your backend's processUserSession already sets an httpOnly cookie named 'token'.
    // Setting it here creates a duplicate that causes the mobile login loop.
    
    setCookie('admin_id', adminId, 365);
  } catch (err) {
    console.error("Session persistence failed", err);
  }
};

export const clearAdminSession = () => {
  try {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_id');
    
    // NOTE: We DO NOT clear the 'token' cookie here anymore.
    // The backend's /logout route handles clearing the httpOnly cookie.
    
    setCookie('admin_id', '', -1);
  } catch (err) {}
};

export default authApi;