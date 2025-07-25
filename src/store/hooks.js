import { useDispatch, useSelector } from 'react-redux';

// Custom hooks for typed usage
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Auth-specific hooks
export const useAuth = () => {
  return useAppSelector((state) => ({
    user: state.auth.user,
    token: state.auth.token,
    isAuthenticated: state.auth.isAuthenticated,
    loading: state.auth.loading,
    error: state.auth.error,
    loginAttempted: state.auth.loginAttempted,
  }));
};

// Cart-specific hooks
export const useCart = () => {
  return useAppSelector((state) => ({
    items: state.cart.items,
    totalItems: state.cart.totalItems,
    totalAmount: state.cart.totalAmount,
    loading: state.cart.loading,
    error: state.cart.error,
  }));
};

// Products-specific hooks
export const useProducts = () => {
  return useAppSelector((state) => ({
    products: state.products.products,
    currentProduct: state.products.currentProduct,
    loading: state.products.loading,
    error: state.products.error,
    pagination: state.products.pagination,
  }));
};

// Permission hooks based on user role
export const usePermissions = () => {
  const { user } = useAuth();
  
  return {
    // Role checks
    isSuperAdmin: user?.role === 'superadmin',
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    
    // Permission checks
    canCreateProduct: user?.role === 'admin' || user?.role === 'superadmin',
    canEditProduct: user?.role === 'admin' || user?.role === 'superadmin',
    canDeleteProduct: user?.role === 'admin' || user?.role === 'superadmin',
    canViewUsers: user?.role === 'superadmin',
    canCreateUser: user?.role === 'superadmin',
    canEditUser: user?.role === 'superadmin',
    canDeleteUser: user?.role === 'superadmin',
  };
};