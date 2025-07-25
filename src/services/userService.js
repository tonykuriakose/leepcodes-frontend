import api from './api.js';

const userService = {
  // Get all users
  getAllUsers: async (params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const response = await api.get('/users', {
        params: { page, limit }
      });
      
      return {
        success: true,
        data: response.data,
        users: response.data.users,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: error.errors
      };
    }
  },

  // Get user by ID 
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      
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

  // Create admin user 
  createAdmin: async (userData) => {
    try {
      const response = await api.post('/users/create-admin', userData);
      
      return {
        success: true,
        data: response.data,
        user: response.data.user,
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

  // Update user role 
  updateUserRole: async (id, role) => {
    try {
      const response = await api.put(`/users/${id}/role`, { role });
      
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

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      
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

  // Update own profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      
      return {
        success: true,
        data: response.data,
        user: response.data.user,
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

  
  getUserStats: async () => {
    try {
      const response = await api.get('/users/stats');
      
      return {
        success: true,
        data: response.data,
        stats: response.data.stats
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: error.errors
      };
    }
  },

  
  searchUsers: async (searchParams) => {
    try {
      const { q, role, page = 1, limit = 10 } = searchParams;
      const response = await api.get('/users/search', {
        params: { q, role, page, limit }
      });
      
      return {
        success: true,
        data: response.data,
        users: response.data.users,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: error.errors
      };
    }
  }
};

export default userService;