import React from 'react';

const PageHeader = ({ icon: Icon, title, description, actions }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div className="flex items-start">
        {Icon && (
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg mr-3">
            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {description && (
            <p className="text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;