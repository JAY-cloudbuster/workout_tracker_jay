import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/+$/, '') + (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.endsWith('/api/v1') ? '/api/v1' : ''),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For refresh token cookie
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const baseURL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/+$/, '') + (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.endsWith('/api/v1') ? '/api/v1' : '');
        const { data } = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        
        const { accessToken } = data.data;
        localStorage.setItem('accessToken', accessToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, force logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
