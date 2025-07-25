import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks.js';
import {
  fetchProducts,
  searchProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  clearSearchResults,
  clearError
} from '../store/slices/productsSlice.js';
import { addToCart } from '../store/slices/cartSlice.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const ProductsPage = () => {
  const dispatch = useAppDispatch();
  const {
    products,
    searchResults,
    pagination,
    searchPagination,
    loading,
    searchLoading,
    error
  } = useAppSelector((state) => state.products);

  // Local state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [addingToCart, setAddingToCart] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the display data (either search results or regular products)
  const displayProducts = isSearchMode ? searchResults : products;
  const displayPagination = isSearchMode ? searchPagination : pagination;

  // Fetch products on mount
  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim() && !priceFilter.min && !priceFilter.max) {
      // Clear search if no filters
      dispatch(clearSearchResults());
      setIsSearchMode(false);
      setCurrentPage(1);
      dispatch(fetchProducts({ page: 1, limit: 10 }));
      return;
    }

    const searchParams = {
      q: searchQuery.trim(),
      minPrice: priceFilter.min || undefined,
      maxPrice: priceFilter.max || undefined,
      page: 1,
      limit: 10
    };

    dispatch(searchProducts(searchParams));
    setIsSearchMode(true);
    setCurrentPage(1);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setPriceFilter({ min: '', max: '' });
    dispatch(clearSearchResults());
    setIsSearchMode(false);
    setCurrentPage(1);
    dispatch(fetchProducts({ page: 1, limit: 10 }));
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (isSearchMode) {
      const searchParams = {
        q: searchQuery.trim(),
        minPrice: priceFilter.min || undefined,
        maxPrice: priceFilter.max || undefined,
        page,
        limit: 10
      };
      dispatch(searchProducts(searchParams));
    } else {
      dispatch(fetchProducts({ page, limit: 10 }));
    }
  };

  // Add to Cart Handler
  const handleAddToCart = async (product) => {
    try {
      setAddingToCart(product.id);
      
      await dispatch(addToCart({
        productId: product.id,
        quantity: 1
      })).unwrap();

      // Success feedback (optional)
      console.log(`✅ Added ${product.name} to cart`);
      
    } catch (error) {
      console.error('❌ Failed to add to cart:', error);
      // You could add a toast notification here
    } finally {
      setAddingToCart(null);
    }
  };

  // Form functions
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      image_url: ''
    });
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price ? parseFloat(product.price).toString() : '',
      stock: product.stock ? product.stock.toString() : '',
      image_url: product.image_url || ''
    });
    setFormErrors({});
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    resetForm();
    setIsSubmitting(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'Price must be a positive number';
      }
    }

    if (!formData.stock) {
      newErrors.stock = 'Stock quantity is required';
    } else {
      const stock = parseInt(formData.stock);
      if (isNaN(stock) || stock < 0) {
        newErrors.stock = 'Stock must be a non-negative integer';
      }
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image_url: formData.image_url.trim() || null
      };

      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct.id, productData: submitData })).unwrap();
      } else {
        await dispatch(createProduct(submitData)).unwrap();
      }

      // Success - close modal and refresh
      closeModal();
      if (isSearchMode) {
        handleSearch();
      } else {
        dispatch(fetchProducts({ page: currentPage, limit: 10 }));
      }
    } catch (error) {
      // Handle specific error cases
      if (error.includes && error.includes('already exists')) {
        setFormErrors({ name: 'A product with this name already exists' });
      } else {
        setFormErrors({ submit: error || 'An error occurred while saving the product' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (deletingProduct) {
      await dispatch(deleteProduct(deletingProduct.id));
      setDeletingProduct(null);
      
      // Refresh current view
      if (isSearchMode) {
        handleSearch();
      } else {
        dispatch(fetchProducts({ page: currentPage, limit: 10 }));
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', class: 'bg-red-100 text-red-800' };
    if (stock <= 10) return { text: 'Low Stock', class: 'bg-yellow-100 text-yellow-800' };
    return { text: 'In Stock', class: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Product Management
              </h1>
              <p className="text-sm text-gray-500">
                {displayPagination ? `${displayPagination.total} products` : 'Loading...'}
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="btn-primary flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Products
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Product name or description..."
                className="input w-full"
              />
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price
              </label>
              <input
                type="number"
                value={priceFilter.min}
                onChange={(e) => setPriceFilter(prev => ({ ...prev, min: e.target.value }))}
                placeholder="0.00"
                className="input w-full"
                min="0"
                step="0.01"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price
              </label>
              <input
                type="number"
                value={priceFilter.max}
                onChange={(e) => setPriceFilter(prev => ({ ...prev, max: e.target.value }))}
                placeholder="999.99"
                className="input w-full"
                min="0"
                step="0.01"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-2 items-end">
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="btn-primary flex-1 flex items-center justify-center"
              >
                {searchLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </>
                )}
              </button>
              
              {isSearchMode && (
                <button
                  onClick={clearSearch}
                  className="btn-secondary"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {isSearchMode && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                🔍 Showing search results 
                {searchQuery && ` for "${searchQuery}"`}
                {(priceFilter.min || priceFilter.max) && (
                  <span>
                    {' '}with price range {priceFilter.min && `$${priceFilter.min}`}
                    {priceFilter.min && priceFilter.max && ' - '}
                    {priceFilter.max && `$${priceFilter.max}`}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={() => dispatch(clearError())}
                  className="text-red-600 hover:text-red-500 text-sm underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <LoadingSpinner />
              <p className="text-gray-500 mt-2">Loading products...</p>
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isSearchMode ? 'No products found' : 'No products yet'}
              </h3>
              <p className="text-gray-500">
                {isSearchMode 
                  ? 'Try adjusting your search criteria'
                  : 'Get started by creating your first product'
                }
              </p>
              {!isSearchMode && (
                <button
                  onClick={openAddModal}
                  className="btn-primary mt-4"
                >
                  Add Your First Product
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayProducts.map((product) => {
                      const stockStatus = getStockStatus(product.stock);
                      const isOutOfStock = product.stock === 0;
                      const isAddingThisProduct = addingToCart === product.id;
                      
                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                  {product.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatPrice(product.price)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {product.stock.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.class}`}>
                              {stockStatus.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(product.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              {/* Add to Cart Button */}
                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={isOutOfStock || isAddingThisProduct}
                                className={`p-2 rounded-lg transition-colors ${
                                  isOutOfStock 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                                }`}
                                title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
                              >
                                {isAddingThisProduct ? (
                                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.6 8H19M7 13v8a2 2 0 002 2h8a2 2 0 002-2v-8m0 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4z" />
                                  </svg>
                                )}
                              </button>
                              
                              <button
                                onClick={() => openEditModal(product)}
                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                title="Edit product"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setDeletingProduct(product)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Delete product"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* SIMPLE INLINE MODAL - Same as before */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button 
                  onClick={closeModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.5rem'
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleFormSubmit}>
                {/* Product Name */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Enter product name"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.name && (
                    <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Enter product description"
                    disabled={isSubmitting}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Price and Stock */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      placeholder="0.00"
                      disabled={isSubmitting}
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                    {formErrors.price && (
                      <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {formErrors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Stock *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleFormChange}
                      placeholder="0"
                      disabled={isSubmitting}
                      min="0"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                    {formErrors.stock && (
                      <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {formErrors.stock}
                      </p>
                    )}
                  </div>
                </div>

                {/* Image URL */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleFormChange}
                    placeholder="https://example.com/image.jpg"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Error Message */}
                {formErrors.submit && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>
                      {formErrors.submit}
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      opacity: isSubmitting ? 0.5 : 1
                    }}
                  >
                    {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingProduct && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '400px'
            }}>
              {/* Icon */}
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  backgroundColor: '#fee2e2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  marginBottom: '1rem'
                }}>
                  <svg style={{ width: '1.5rem', height: '1.5rem', color: '#dc2626' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
                  Delete Product
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 1.5rem 0' }}>
                  Are you sure you want to delete "{deletingProduct.name}"? This action cannot be undone.
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  onClick={() => setDeletingProduct(null)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductsPage;