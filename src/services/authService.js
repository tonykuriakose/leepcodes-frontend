import api, { setAuthToken } from './api.js';

const authService = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      
      return {
        success: true,
        data: response.data,
        user: response.data.user,
        token: response.data.token
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: error.errors
      };
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      
      return {
        success: true,
        data: response.data,
        user: response.data.user,
        token: response.data.token
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: error.errors
      };
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      
      return {
        success: true,
        data: response.data,
        user: response.data.user
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: error.errors
      };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      
      setAuthToken(null);
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      setAuthToken(null);
      
      return {
        success: false,
        message: error.message
      };
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: error.errors
      };
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId,
        role: payload.role,
        exp: payload.exp
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  isTokenExpired: () => {
    const user = authService.getCurrentUser();
    if (!user) return true;

    const currentTime = Date.now() / 1000;
    return user.exp < currentTime;
  }
};

export default authService;