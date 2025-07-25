import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../services/index.js';


const initialState = {
  cart: null,
  allCarts: [], 
  allCartsPagination: null,
  loading: false,
  adminLoading: false,
  error: null,
  adminError: null,
  lastAction: null, 
};


export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const result = await cartService.getCart();
      
      if (result.success) {
        return result.cart;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const result = await cartService.addToCart(productId, quantity);
      
      if (result.success) {
        return {
          cartItem: result.cartItem,
          message: result.message,
        };
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const result = await cartService.updateCartItem(itemId, quantity);
      
      if (result.success) {
        return {
          itemId,
          quantity,
          message: result.message,
        };
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update cart item');
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const result = await cartService.removeCartItem(itemId);
      
      if (result.success) {
        return {
          itemId,
          message: result.message,
        };
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove cart item');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const result = await cartService.clearCart();
      
      if (result.success) {
        return result.message;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to clear cart');
    }
  }
);

export const fetchAllCarts = createAsyncThunk(
  'cart/fetchAllCarts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await cartService.getAllCarts(params);
      
      if (result.success) {
        return {
          carts: result.carts,
          pagination: result.pagination,
        };
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch all carts');
    }
  }
);


const calculateCartTotals = (cart) => {
  if (!cart || !cart.items) return cart;

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    ...cart,
    totalItems,
    totalAmount: totalAmount.toFixed(2),
  };
};


const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.adminError = null;
    },
    
    
    clearLastAction: (state) => {
      state.lastAction = null;
    },
    
    
    clearCartState: (state) => {
      state.cart = null;
      state.error = null;
      state.lastAction = null;
    },
    
    
    optimisticUpdateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      if (state.cart && state.cart.items) {
        const item = state.cart.items.find(item => item.id === itemId);
        if (item) {
          item.quantity = quantity;
          item.subtotal = item.product.price * quantity;
          state.cart = calculateCartTotals(state.cart);
        }
      }
    },
    
    
    optimisticRemoveItem: (state, action) => {
      const itemId = action.payload;
      if (state.cart && state.cart.items) {
        state.cart.items = state.cart.items.filter(item => item.id !== itemId);
        state.cart = calculateCartTotals(state.cart);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = calculateCartTotals(action.payload);
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastAction = 'adding';
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.lastAction = 'added';
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.lastAction = 'error';
      });

    
    builder
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastAction = 'updating';
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.lastAction = 'updated';
        state.error = null;
        
        if (state.cart && state.cart.items) {
          const item = state.cart.items.find(item => item.id === action.payload.itemId);
          if (item) {
            item.quantity = action.payload.quantity;
            item.subtotal = item.product.price * action.payload.quantity;
            state.cart = calculateCartTotals(state.cart);
          }
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.lastAction = 'error';
      });

    
    builder
      .addCase(removeCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastAction = 'removing';
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.lastAction = 'removed';
        state.error = null;
        
        if (state.cart && state.cart.items) {
          state.cart.items = state.cart.items.filter(item => item.id !== action.payload.itemId);
          state.cart = calculateCartTotals(state.cart);
        }
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.lastAction = 'error';
      });

  
    builder
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastAction = 'clearing';
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.lastAction = 'cleared';
        state.error = null;
        state.cart = {
          ...state.cart,
          items: [],
          totalItems: 0,
          totalAmount: '0.00',
        };
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.lastAction = 'error';
      });

    
    builder
      .addCase(fetchAllCarts.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAllCarts.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.allCarts = action.payload.carts;
        state.allCartsPagination = action.payload.pagination;
        state.adminError = null;
      })
      .addCase(fetchAllCarts.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      });
  },
});


export const { 
  clearError, 
  clearLastAction, 
  clearCartState, 
  optimisticUpdateQuantity, 
  optimisticRemoveItem 
} = cartSlice.actions;

export const selectCart = (state) => state.cart.cart;
export const selectCartItems = (state) => state.cart.cart?.items || [];
export const selectCartTotalItems = (state) => state.cart.cart?.totalItems || 0;
export const selectCartTotalAmount = (state) => state.cart.cart?.totalAmount || '0.00';
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectCartLastAction = (state) => state.cart.lastAction;
export const selectAllCarts = (state) => state.cart.allCarts;
export const selectAllCartsLoading = (state) => state.cart.adminLoading;
export const selectAllCartsError = (state) => state.cart.adminError;
export const selectAllCartsPagination = (state) => state.cart.allCartsPagination;


export default cartSlice.reducer;