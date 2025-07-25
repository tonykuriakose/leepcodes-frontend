import { useDispatch, useSelector } from 'react-redux';
import { selectCart,selectCartItems,selectCartTotalItems,selectCartTotalAmount,selectCartLoading,selectCartError} from './slices/cartSlice.js';


export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Auth hook
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

// hook for cart
export const useCart = () => {
  const cart = useSelector(selectCart);
  const items = useSelector(selectCartItems);
  const totalItems = useSelector(selectCartTotalItems);
  const totalAmount = useSelector(selectCartTotalAmount);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  
  return {
    cart,
    items,
    totalItems,
    totalAmount,
    loading,
    error
  };
};

// Products hook
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
    isSuperAdmin: user?.role === 'superadmin',
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    canCreateProduct: user?.role === 'admin' || user?.role === 'superadmin',
    canEditProduct: user?.role === 'admin' || user?.role === 'superadmin',
    canDeleteProduct: user?.role === 'admin' || user?.role === 'superadmin',
    canViewUsers: user?.role === 'superadmin',
    canCreateUser: user?.role === 'superadmin',
    canEditUser: user?.role === 'superadmin',
    canDeleteUser: user?.role === 'superadmin',
  };
};