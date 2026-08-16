import React from 'react';
import { CircleX } from 'lucide-react';

const ErrorState = ({ title = 'Error', description, onRetry }) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
        <CircleX className="w-8 h-8 text-red-500" />
      </div>

      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
          {description}
        </p>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
