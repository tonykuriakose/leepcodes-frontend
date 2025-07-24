import api from './api.js';

const cartService = {
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      
      return {
        success: true,
        data: response.data,
        cart: response.data.cart
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: error.errors
      };
    }
  },

  
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await api.post('/cart/add', {
        product_id: productId,
        quantity
      });
      
      return {
        success: true,
        data: response.data,
        cartItem: response.data.cartItem,
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

  
  updateCartItem: async (itemId, quantity) => {
    try {
      const response = await api.put(`/cart/item/${itemId}`, {
        quantity
      });
      
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

  
  removeCartItem: async (itemId) => {
    try {
      const response = await api.delete(`/cart/item/${itemId}`);
      
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

  
  clearCart: async () => {
    try {
      const response = await api.delete('/cart/clear');
      
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

  
  getAllCarts: async (params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const response = await api.get('/cart/admin/all', {
        params: { page, limit }
      });
      
      return {
        success: true,
        data: response.data,
        carts: response.data.carts,
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

export default cartService;