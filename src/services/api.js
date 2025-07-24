import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }

    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('API Error:', error.response?.data || error.message);
    }
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          localStorage.removeItem('token');
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;

        case 403:
          console.error('Access denied:', data.message);
          break;

        case 404:
          console.error('Resource not found:', data.message);
          break;

        case 422:
          console.error('Validation errors:', data.errors);
          break;

        case 500:
          console.error('Server error:', data.message);
          break;

        default:
          console.error('Unexpected error:', data.message || 'Something went wrong');
      }
      return Promise.reject({
        status,
        message: data.message || 'An error occurred',
        errors: data.errors || null,
        data: data
      });
    }


    if (error.request) {
      const networkError = {
        status: 0,
        message: 'Network error - please check your connection',
        errors: null,
        data: null
      };
      return Promise.reject(networkError);
    }

    
    return Promise.reject({
      status: 0,
      message: error.message || 'Request failed',
      errors: null,
      data: null
    });
  }
);


export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const clearAuth = () => {
  setAuthToken(null);
};

export default api;