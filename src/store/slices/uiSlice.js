import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  // Loading states
  globalLoading: false,
  
  // Notifications/Toast messages
  notifications: [],
  
  // Modals
  modals: {
    productForm: { open: false, mode: 'create', product: null },
    userForm: { open: false, mode: 'create', user: null },
    confirmDialog: { open: false, title: '', message: '', onConfirm: null },
    cartModal: { open: false },
  },
  
  // Sidebar/Navigation
  sidebarOpen: true,
  mobileMenuOpen: false,
  
  // Theme
  theme: 'light',
  
  // Filters and search
  filters: {
    products: {
      search: '',
      minPrice: '',
      maxPrice: '',
      category: '',
    },
    users: {
      search: '',
      role: '',
    },
  },
  
  // Pagination
  currentPage: {
    products: 1,
    users: 1,
    carts: 1,
  },
  
  // View preferences
  viewMode: {
    products: 'grid', // 'grid' or 'list'
    users: 'table',
  },
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Global loading
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    
    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: action.payload.type || 'info', // 'success', 'error', 'warning', 'info'
        title: action.payload.title,
        message: action.payload.message,
        duration: action.payload.duration || 5000,
        createdAt: Date.now(),
      };
      state.notifications.push(notification);
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Modals
    openModal: (state, action) => {
      const { modalName, data = {} } = action.payload;
      if (state.modals[modalName]) {
        state.modals[modalName] = { ...state.modals[modalName], open: true, ...data };
      }
    },
    
    closeModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals[modalName]) {
        state.modals[modalName] = { ...initialState.modals[modalName] };
      }
    },
    
    closeAllModals: (state) => {
      state.modals = { ...initialState.modals };
    },
    
    // Product form modal
    openProductForm: (state, action) => {
      const { mode = 'create', product = null } = action.payload || {};
      state.modals.productForm = { open: true, mode, product };
    },
    
    closeProductForm: (state) => {
      state.modals.productForm = { open: false, mode: 'create', product: null };
    },
    
    // User form modal
    openUserForm: (state, action) => {
      const { mode = 'create', user = null } = action.payload || {};
      state.modals.userForm = { open: true, mode, user };
    },
    
    closeUserForm: (state) => {
      state.modals.userForm = { open: false, mode: 'create', user: null };
    },
    
    // Confirm dialog
    openConfirmDialog: (state, action) => {
      const { title, message, onConfirm } = action.payload;
      state.modals.confirmDialog = { open: true, title, message, onConfirm };
    },
    
    closeConfirmDialog: (state) => {
      state.modals.confirmDialog = { open: false, title: '', message: '', onConfirm: null };
    },
    
    // Sidebar and navigation
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    
    // Theme
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Filters
    setProductFilters: (state, action) => {
      state.filters.products = { ...state.filters.products, ...action.payload };
    },
    
    setUserFilters: (state, action) => {
      state.filters.users = { ...state.filters.users, ...action.payload };
    },
    
    clearProductFilters: (state) => {
      state.filters.products = initialState.filters.products;
    },
    
    clearUserFilters: (state) => {
      state.filters.users = initialState.filters.users;
    },
    
    clearAllFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
    
    // Pagination
    setCurrentPage: (state, action) => {
      const { section, page } = action.payload;
      if (state.currentPage[section] !== undefined) {
        state.currentPage[section] = page;
      }
    },
    
    resetPagination: (state, action) => {
      const section = action.payload;
      if (state.currentPage[section] !== undefined) {
        state.currentPage[section] = 1;
      }
    },
    
    resetAllPagination: (state) => {
      state.currentPage = { ...initialState.currentPage };
    },
    
    // View mode
    setViewMode: (state, action) => {
      const { section, mode } = action.payload;
      if (state.viewMode[section] !== undefined) {
        state.viewMode[section] = mode;
      }
    },
    
    // Reset UI state (for logout)
    resetUIState: (state) => {
      return {
        ...initialState,
        theme: state.theme, // Keep theme preference
      };
    },
  },
});

// Export actions
export const {
  // Loading
  setGlobalLoading,
  
  // Notifications
  addNotification,
  removeNotification,
  clearNotifications,
  
  // Modals
  openModal,
  closeModal,
  closeAllModals,
  openProductForm,
  closeProductForm,
  openUserForm,
  closeUserForm,
  openConfirmDialog,
  closeConfirmDialog,
  
  // Navigation
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  
  // Theme
  setTheme,
  toggleTheme,
  
  // Filters
  setProductFilters,
  setUserFilters,
  clearProductFilters,
  clearUserFilters,
  clearAllFilters,
  
  // Pagination
  setCurrentPage,
  resetPagination,
  resetAllPagination,
  
  // View mode
  setViewMode,
  
  // Reset
  resetUIState,
} = uiSlice.actions;

// Export selectors
export const selectGlobalLoading = (state) => state.ui.globalLoading;
export const selectNotifications = (state) => state.ui.notifications;
export const selectModals = (state) => state.ui.modals;
export const selectProductFormModal = (state) => state.ui.modals.productForm;
export const selectUserFormModal = (state) => state.ui.modals.userForm;
export const selectConfirmDialog = (state) => state.ui.modals.confirmDialog;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen;
export const selectTheme = (state) => state.ui.theme;
export const selectProductFilters = (state) => state.ui.filters.products;
export const selectUserFilters = (state) => state.ui.filters.users;
export const selectCurrentPage = (state) => state.ui.currentPage;
export const selectViewMode = (state) => state.ui.viewMode;

// Helper action creators for common notifications
export const showSuccessNotification = (message, title = 'Success') => 
  addNotification({ type: 'success', title, message });

export const showErrorNotification = (message, title = 'Error') => 
  addNotification({ type: 'error', title, message });

export const showWarningNotification = (message, title = 'Warning') => 
  addNotification({ type: 'warning', title, message });

export const showInfoNotification = (message, title = 'Info') => 
  addNotification({ type: 'info', title, message });

// Export reducer
export default uiSlice.reducer;