import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Upload } from 'lucide-react';
import DatasetHistory from './DatasetHistory';

const Datasets = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Database className="w-6 h-6 mr-2 text-blue-600" />
          Datasets
        </h1>
        <button
          onClick={() => navigate('/upload')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload New
        </button>
      </div>
      <DatasetHistory />
    </div>
  );
};

export default Datasets;