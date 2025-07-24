import api from './api.js';

const productService = {
  getAllProducts: async (params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const response = await api.get('/products', {
        params: { page, limit }
      });
      
      return {
        success: true,
        data: response.data,
        products: response.data.products,
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

  
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      
      return {
        success: true,
        data: response.data,
        product: response.data.product
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errors: error.errors
      };
    }
  },


  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      
      return {
        success: true,
        data: response.data,
        product: response.data.product,
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


  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      
      return {
        success: true,
        data: response.data,
        product: response.data.product,
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


  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      
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


  searchProducts: async (searchParams) => {
    try {
      const { q, minPrice, maxPrice, page = 1, limit = 10 } = searchParams;
      const response = await api.get('/products/search', {
        params: { q, minPrice, maxPrice, page, limit }
      });
      
      return {
        success: true,
        data: response.data,
        products: response.data.products,
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

  
  getLowStockProducts: async (threshold = 10) => {
    try {
      const response = await api.get('/products/admin/low-stock', {
        params: { threshold }
      });
      
      return {
        success: true,
        data: response.data,
        products: response.data.products,
        threshold: response.data.threshold
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

export default productService;