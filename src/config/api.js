import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL?.trim() || '';

const adminApi = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    // This allows the browser to send/receive cookies automatically
    withCredentials: true 
});

// Since the token is in an HttpOnly cookie, we do NOT need 
// to read it via JS or inject it into the headers.
// The browser handles this automatically.

adminApi.interceptors.request.use((config) => {
    // If you still need to send the 'x-admin-id' for business logic, 
    // it is best practice to move that to a cookie as well.
    // If you must send it via header, keep only that part:
    
    // Example: Getting ID from a cookie if absolutely necessary
    const adminId = document.cookie.split('; ').find(row => row.startsWith('admin_id='))?.split('=')[1];
    
    if (adminId) {
        config.headers['x-admin-id'] = decodeURIComponent(adminId);
    }

    if (config.data instanceof FormData && config.headers) {
        delete config.headers['Content-Type'];
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default adminApi;