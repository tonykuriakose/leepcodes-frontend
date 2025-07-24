import { useDispatch, useSelector } from 'react-redux';


export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;


export const useAuth = () => {
  return useAppSelector((state) => ({
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated,
    loading: state.auth.loading,
    error: state.auth.error,
    loginAttempted: state.auth.loginAttempted,
    role: state.auth.user?.role,
  }));
};

export const useProducts = () => {
  return useAppSelector((state) => ({
    products: state.products.products,
    currentProduct: state.products.currentProduct,
    lowStockProducts: state.products.lowStockProducts,
    loading: state.products.loading,
    error: state.products.error,
    pagination: state.products.pagination,
    searchResults: state.products.searchResults,
    searchLoading: state.products.searchLoading,
    searchError: state.products.searchError,
    searchPagination: state.products.searchPagination,
  }));
};

export const useCart = () => {
  return useAppSelector((state) => ({
    cart: state.cart.cart,
    items: state.cart.cart?.items || [],
    totalItems: state.cart.cart?.totalItems || 0,
    totalAmount: state.cart.cart?.totalAmount || '0.00',
    loading: state.cart.loading,
    error: state.cart.error,
    lastAction: state.cart.lastAction,
    allCarts: state.cart.allCarts,
    adminLoading: state.cart.adminLoading,
    adminError: state.cart.adminError,
    allCartsPagination: state.cart.allCartsPagination,
  }));
};

export const useUI = () => {
  return useAppSelector((state) => ({
    globalLoading: state.ui.globalLoading,
    notifications: state.ui.notifications,
    modals: state.ui.modals,
    sidebarOpen: state.ui.sidebarOpen,
    mobileMenuOpen: state.ui.mobileMenuOpen,
    theme: state.ui.theme,
    filters: state.ui.filters,
    currentPage: state.ui.currentPage,
    viewMode: state.ui.viewMode,
  }));
};


export const useProductModal = () => {
  return useAppSelector((state) => state.ui.modals.productForm);
};

export const useUserModal = () => {
  return useAppSelector((state) => state.ui.modals.userForm);
};

export const useConfirmDialog = () => {
  return useAppSelector((state) => state.ui.modals.confirmDialog);
};


export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();
  
  return {
    canCreateProduct: isAuthenticated && ['superadmin', 'admin'].includes(user?.role),
    canUpdateProduct: isAuthenticated && ['superadmin', 'admin'].includes(user?.role),
    canDeleteProduct: isAuthenticated && user?.role === 'superadmin',
    canViewUsers: isAuthenticated && user?.role === 'superadmin',
    canCreateAdmin: isAuthenticated && user?.role === 'superadmin',
    canManageUsers: isAuthenticated && user?.role === 'superadmin',
    canViewAllCarts: isAuthenticated && user?.role === 'superadmin',
    isSuperAdmin: isAuthenticated && user?.role === 'superadmin',
    isAdmin: isAuthenticated && ['superadmin', 'admin'].includes(user?.role),
  };
};