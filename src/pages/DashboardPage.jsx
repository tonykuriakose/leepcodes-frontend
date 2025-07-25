import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAuth, useCart, usePermissions } from '../store/hooks.js';
import { logoutUser } from '../store/slices/authSlice.js';
import { fetchCart } from '../store/slices/cartSlice.js';

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading } = useAuth();
  const { totalItems, totalAmount } = useCart();
  const permissions = usePermissions();

  // Fetch cart on mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Navigate anyway
      navigate('/login', { replace: true });
    }
  };

  // Navigation handlers
  const navigateToProducts = () => {
    navigate('/products');
  };

  const navigateToCart = () => {
    navigate('/cart');
  };

  const navigateToUsers = () => {
    navigate('/users');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Product & Cart Management
                </h1>
              </div>
              
              {/* Navigation Links */}
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={navigateToProducts}
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Products
                </button>
                <button
                  onClick={navigateToCart}
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors relative"
                >
                  Cart
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
                {permissions.canViewUsers && (
                  <button
                    onClick={navigateToUsers}
                    className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Users
                  </button>
                )}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role === 'superadmin' ? 'Super Admin' : user?.role}
                  </p>
                </div>
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}! 👋
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your {user?.role === 'superadmin' ? 'system' : 'products'} today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Cart Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.6 8H19M7 13v8a2 2 0 002 2h8a2 2 0 002-2v-8m0 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Your Cart</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalItems} items
                </p>
                <p className="text-sm text-gray-500">${totalAmount}</p>
              </div>
            </div>
          </div>

          {/* Role Badge */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Access Level</p>
                <p className="text-2xl font-semibold text-gray-900 capitalize">
                  {user?.role === 'superadmin' ? 'Super Admin' : user?.role}
                </p>
                <p className="text-sm text-gray-500">
                  {permissions.isSuperAdmin ? 'Full Access' : 'Product Management'}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-2xl font-semibold text-green-600">Online</p>
                <p className="text-sm text-gray-500">All systems operational</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Products Management */}
          <div 
            onClick={navigateToProducts}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer group"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">Products</h3>
                <p className="text-sm text-gray-500">
                  {permissions.canCreateProduct ? 'Manage inventory' : 'View products'}
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              {permissions.canCreateProduct 
                ? 'Create, edit, and organize your product catalog.'
                : 'Browse and view product information.'
              }
            </p>
            <div className="btn-primary w-full text-center">
              {permissions.canCreateProduct ? 'Manage Products' : 'View Products'}
            </div>
          </div>

          {/* Cart Management */}
          <div 
            onClick={navigateToCart}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer group"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.6 8H19M7 13v8a2 2 0 002 2h8a2 2 0 002-2v-8m0 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">My Cart</h3>
                <p className="text-sm text-gray-500">
                  {totalItems} items • ${totalAmount}
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Manage your shopping cart and review selected items.
            </p>
            <div className="btn-primary w-full text-center">
              View Cart
            </div>
          </div>

          {/* User Management (Super Admin Only) */}
          {permissions.canViewUsers && (
            <div 
              onClick={navigateToUsers}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.025C15.766 15.97 14.926 16 14 16s-1.766-.03-2.5-.142" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">Users</h3>
                  <p className="text-sm text-gray-500">Manage admin accounts</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Create and manage admin user accounts and permissions.
              </p>
              <div className="btn-primary w-full text-center">
                Manage Users
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-500">Common tasks</p>
              </div>
            </div>
            <div className="space-y-2">
              <button 
                onClick={navigateToProducts}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                ➕ Add New Product
              </button>
              <button 
                onClick={navigateToCart}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                🛒 View Shopping Cart
              </button>
              {permissions.canViewUsers && (
                <button 
                  onClick={navigateToUsers}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  👥 Manage Users
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Debug Info (Development Only) */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">🔧 Debug Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <strong>User:</strong>
                <pre className="mt-1 text-gray-600">{JSON.stringify(user, null, 2)}</pre>
              </div>
              <div>
                <strong>Permissions:</strong>
                <pre className="mt-1 text-gray-600">
                  {JSON.stringify({
                    canCreateProduct: permissions.canCreateProduct,
                    canDeleteProduct: permissions.canDeleteProduct,
                    canViewUsers: permissions.canViewUsers,
                    isSuperAdmin: permissions.isSuperAdmin,
                    isAdmin: permissions.isAdmin
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;