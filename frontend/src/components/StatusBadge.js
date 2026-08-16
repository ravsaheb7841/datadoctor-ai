import React from 'react';

const StatusBadge = ({ severity, label, type }) => {
  const styles = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    info: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    numeric: 'bg-blue-100 text-blue-800 border-blue-200',
    categorical: 'bg-green-100 text-green-800 border-green-200',
    text: 'bg-gray-100 text-gray-800 border-gray-200',
    datetime: 'bg-purple-100 text-purple-800 border-purple-200',
    identifier: 'bg-orange-100 text-orange-800 border-orange-200',
    boolean: 'bg-teal-100 text-teal-800 border-teal-200',
    ordinal: 'bg-pink-100 text-pink-800 border-pink-200',
    binary: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[severity] || styles[type] || styles.info
      }`}
    >
      {label || severity || type}
    </span>
  );
};

export default StatusBadge;
