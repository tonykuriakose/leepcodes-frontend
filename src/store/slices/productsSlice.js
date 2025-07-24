import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services/index.js';

// Initial state
const initialState = {
  products: [],
  currentProduct: null,
  lowStockProducts: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  searchResults: [],
  searchPagination: null,
  loading: false,
  searchLoading: false,
  error: null,
  searchError: null,
};

// Async thunks for product operations
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await productService.getAllProducts(params);
      
      if (result.success) {
        return {
          products: result.products,
          pagination: result.pagination,
        };
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const result = await productService.getProductById(id);
      
      if (result.success) {
        return result.product;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch product');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const result = await productService.createProduct(productData);
      
      if (result.success) {
        return result.product;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const result = await productService.updateProduct(id, productData);
      
      if (result.success) {
        return result.product;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      const result = await productService.deleteProduct(id);
      
      if (result.success) {
        return id;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete product');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (searchParams, { rejectWithValue }) => {
    try {
      const result = await productService.searchProducts(searchParams);
      
      if (result.success) {
        return {
          products: result.products,
          pagination: result.pagination,
        };
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Search failed');
    }
  }
);

export const fetchLowStockProducts = createAsyncThunk(
  'products/fetchLowStockProducts',
  async (threshold = 10, { rejectWithValue }) => {
    try {
      const result = await productService.getLowStockProducts(threshold);
      
      if (result.success) {
        return result.products;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch low stock products');
    }
  }
);

// Products slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Clear current product
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    
    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.searchError = null;
    },
    
    // Clear search results
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchPagination = null;
      state.searchError = null;
    },
    
    // Update product in list (after edit)
    updateProductInList: (state, action) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    
    // Remove product from list (after delete)
    removeProductFromList: (state, action) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch single product
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create product
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload); // Add to beginning
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update product
    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct && state.currentProduct.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete product
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(p => p.id !== action.payload);
        if (state.currentProduct && state.currentProduct.id === action.payload) {
          state.currentProduct = null;
        }
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Search products
    builder
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.products;
        state.searchPagination = action.payload.pagination;
        state.searchError = null;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      });

    // Fetch low stock products
    builder
      .addCase(fetchLowStockProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLowStockProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.lowStockProducts = action.payload;
        state.error = null;
      })
      .addCase(fetchLowStockProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { 
  clearCurrentProduct, 
  clearError, 
  clearSearchResults, 
  updateProductInList, 
  removeProductFromList 
} = productsSlice.actions;

// Export selectors
export const selectProducts = (state) => state.products.products;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectLowStockProducts = (state) => state.products.lowStockProducts;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;
export const selectProductsPagination = (state) => state.products.pagination;
export const selectSearchResults = (state) => state.products.searchResults;
export const selectSearchLoading = (state) => state.products.searchLoading;
export const selectSearchError = (state) => state.products.searchError;
export const selectSearchPagination = (state) => state.products.searchPagination;

// Export reducer
export default productsSlice.reducer;