import React from 'react';

const LoadingState = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        <span className="text-gray-500 dark:text-gray-400">{message}</span>
      </div>
    </div>
  );
};

export default LoadingState;
