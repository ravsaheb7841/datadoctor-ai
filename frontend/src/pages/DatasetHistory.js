import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Database, Trash2, FolderOpen, Upload } from 'lucide-react';

const DatasetHistory = () => {
  const { token } = useContext(AuthContext);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDatasets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/datasets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDatasets(data.datasets || []);
    } catch (error) {
      console.error('Failed to fetch datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDataset = async (datasetId) => {
    if (!window.confirm('Are you sure you want to delete this dataset?')) return;
    try {
      await fetch(`http://localhost:8000/api/datasets/${datasetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDatasets();
    } catch (error) {
      console.error('Failed to delete dataset:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-500">Loading datasets...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Database className="w-6 h-6 mr-2 text-blue-600" />
          Dataset History
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">All your uploaded datasets</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {datasets.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No datasets</h3>
            <p className="text-gray-500 mb-4">Upload your first dataset to get started</p>
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Dataset
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Upload Date</th>
                  <th className="pb-3">Rows</th>
                  <th className="pb-3">Health</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((dataset) => (
                  <tr key={dataset._id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{dataset.filename}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">
                      {dataset.created_at ? new Date(dataset.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">{(dataset.rows || 0).toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (dataset.health_score || 0) >= 80 ? 'bg-green-100 text-green-800' :
                        (dataset.health_score || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {dataset.health_score || 'N/A'}/100
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/datasets/${dataset._id}`)}
                          className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                          title="Open dataset"
                        >
                          <FolderOpen className="w-4 h-4 mr-1" />
                          Open
                        </button>
                        <button
                          onClick={() => deleteDataset(dataset._id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-700 transition-colors"
                          title="Delete dataset"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatasetHistory;