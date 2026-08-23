import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import {
  Database, Trash2, FolderOpen, Upload, Activity, Calendar, Rows3
} from 'lucide-react';
import LoadingState from '../components/LoadingState';

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

  if (loading) return <LoadingState message="Loading datasets..." />;

  const getHealthStyle = (score) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
    if (score >= 60) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
              <Database className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-300" />
                <span className="text-blue-300 text-sm font-medium">Your Data Library</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dataset History</h1>
              <p className="mt-1.5 text-slate-300 text-sm">
                All your uploaded datasets in one place
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/upload')}
            className="btn-press group inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-800 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Upload className="w-5 h-5" />
            Upload New
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {datasets.length === 0 ? (
          <div className="py-16 text-center animate-scale-in">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              No datasets yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Upload your first dataset to start analyzing and cleaning your data.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="btn-press inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
            >
              <Upload className="w-4 h-4" />
              Upload Dataset
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {datasets.map((dataset, index) => {
              const health = dataset.health_score || 0;
              return (
                <div
                  key={dataset._id}
                  className="stagger-item group flex flex-col sm:flex-row sm:items-center gap-4 px-5 sm:px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-200"
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  {/* Icon + Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Database className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {dataset.filename}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {dataset.created_at
                            ? new Date(dataset.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })
                            : 'N/A'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Rows3 className="w-3.5 h-3.5" />
                          {(dataset.rows || 0).toLocaleString()} rows
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Health */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getHealthStyle(health)}`}>
                      {health || 'N/A'}/100
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/datasets/${dataset._id}`)}
                        className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Open
                      </button>
                      <button
                        onClick={() => deleteDataset(dataset._id)}
                        className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatasetHistory;