import React from 'react';

const LoadingSpinner = ({ size = 'large', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        {/* Spinner */}
        <div 
          className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4`}
        ></div>
        
        {/* Message */}
        <p className="text-gray-600 font-medium">{message}</p>
        
        {/* App name */}
        <p className="text-sm text-gray-400 mt-2">
          Product & Cart Management
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;