import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/index.js';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  loginAttempted: false,
};


export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        return {
          user: result.user,
          token: result.token,
        };
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        return {
          user: result.user,
          token: result.token,
        };
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authService.getProfile();
      
      if (result.success) {
        return result.user;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get profile');
    }
  }
);


export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { isAuthenticated: false };
      }

      const result = await authService.getProfile();
      
      if (result.success) {
        return {
          isAuthenticated: true,
          user: result.user,
          token: token
        };
      } else {
        localStorage.removeItem('token');
        return { isAuthenticated: false };
      }
    } catch (error) {
      localStorage.removeItem('token');
      return { isAuthenticated: false };
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authService.logout();
      return result;
    } catch (error) {
      return { success: true };
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const result = await authService.changePassword(passwordData);
      
      if (result.success) {
        return result.message;
      } else {
        return rejectWithValue(result.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Password change failed');
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loginAttempted = false;
    },
    
    
    clearError: (state) => {
      state.error = null;
    },
    
    
    setUserFromToken: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loginAttempted = true;
    },
    
  
    setLoginAttempted: (state) => {
      state.loginAttempted = true;
    },
    
    
    updateProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loginAttempted = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.loginAttempted = true;
      });

  
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    
    builder
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loginAttempted = true;
      })
      .addCase(getProfile.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.loginAttempted = true;
        state.user = null;
        state.token = null;
      });

    
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.loginAttempted = true;
        
        if (action.payload.isAuthenticated) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.loginAttempted = true;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });

    
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });

    
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});


export const { clearAuth, clearError, setUserFromToken, setLoginAttempted, updateProfile } = authSlice.actions;


export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.user?.role;


export default authSlice.reducer;