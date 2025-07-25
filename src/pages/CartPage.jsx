import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useCart } from '../store/hooks.js';
import { 
  fetchCart, 
  updateCartItem, 
  removeCartItem, 
  clearCart,
  optimisticUpdateQuantity,
  optimisticRemoveItem 
} from '../store/slices/cartSlice.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart, items, totalItems, totalAmount, loading, error } = useCart();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Fetch cart on mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Handle quantity update
  const handleQuantityUpdate = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Optimistic update
    dispatch(optimisticUpdateQuantity({ itemId, quantity: newQuantity }));
    
    try {
      await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
    } catch (error) {
      // Revert on error by fetching cart again
      dispatch(fetchCart());
    }
  };

  // Handle item removal
  const handleRemoveItem = async (itemId) => {
    // Optimistic update
    dispatch(optimisticRemoveItem(itemId));
    
    try {
      await dispatch(removeCartItem(itemId)).unwrap();
    } catch (error) {
      // Revert on error by fetching cart again
      dispatch(fetchCart());
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    try {
      await dispatch(clearCart()).unwrap();
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  if (loading && !cart) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">Shopping Cart</h1>
              
              {/* Navigation Links */}
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Products
                </button>
              </nav>
            </div>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.6 8H19M7 13v8a2 2 0 002 2h8a2 2 0 002-2v-8m0 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <button
              onClick={() => navigate('/products')}
              className="btn-primary"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Cart Items ({totalItems})
                    </h2>
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
                
                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex space-x-4">
                        {/* Product Image Placeholder */}
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.product.description}
                          </p>
                          <p className="text-sm text-gray-900 mt-2">
                            ${item.product.price} each
                          </p>
                        </div>
                        
                        {/* Quantity and Actions */}
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            <button
                              onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                              disabled={item.quantity <= 1}
                            >
                              <span className="text-gray-600">−</span>
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const newValue = parseInt(e.target.value) || 1;
                                if (newValue > 0) {
                                  handleQuantityUpdate(item.id, newValue);
                                }
                              }}
                              className="w-16 text-center border border-gray-300 rounded-md px-2 py-1"
                              min="1"
                            />
                            <button
                              onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            >
                              <span className="text-gray-600">+</span>
                            </button>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 mb-2">
                            ${item.subtotal.toFixed(2)}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                    <span className="text-gray-900">${totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">Free</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-primary-600">${totalAmount}</span>
                    </div>
                  </div>
                </div>
                
                <button className="btn-primary w-full mb-3">
                  Proceed to Checkout
                </button>
                
                <button
                  onClick={() => navigate('/products')}
                  className="btn-secondary w-full"
                >
                  Continue Shopping
                </button>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Free Shipping</span> on all orders!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear Cart?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCart}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;