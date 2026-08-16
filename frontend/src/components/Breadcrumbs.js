import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
          {item.to ? (
            <Link
              to={item.to}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {index === 0 && <Home className="w-3.5 h-3.5 inline mr-1" />}
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;