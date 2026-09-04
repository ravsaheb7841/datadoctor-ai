import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import {
  Database, Trash2, FolderOpen, Upload, Activity, Calendar, Rows3,
  Search, RefreshCw, HeartPulse, CheckCircle2, AlertTriangle, X
} from 'lucide-react';
import LoadingState from '../components/LoadingState';

const API_URL = 'https://datadoctor-ai.onrender.com';

const DatasetHistory = () => {
  const { token } = useContext(AuthContext);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

  const fetchDatasets = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/datasets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setDatasets(data.datasets || []);
    } catch (error) {
      console.error('Failed to fetch datasets:', error);
      setError('Failed to load datasets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const deleteDataset = async (datasetId) => {
    if (!window.confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) return;
    setDeletingId(datasetId);
    try {
      const response = await fetch(`${API_URL}/api/datasets/${datasetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchDatasets(true);
      }
    } catch (error) {
      console.error('Failed to delete dataset:', error);
      setError('Failed to delete dataset');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDatasets = useMemo(() => {
    let result = [...datasets];
    
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(ds => (ds.filename || '').toLowerCase().includes(s));
    }
    
    if (healthFilter === 'good') result = result.filter(ds => (ds.health_score || 0) >= 80);
    if (healthFilter === 'warning') result = result.filter(ds => (ds.health_score || 0) >= 60 && (ds.health_score || 0) < 80);
    if (healthFilter === 'poor') result = result.filter(ds => (ds.health_score || 0) < 60);
    
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (sortBy === 'oldest') result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (sortBy === 'name') result.sort((a, b) => (a.filename || '').localeCompare(b.filename || ''));
    if (sortBy === 'health') result.sort((a, b) => (b.health_score || 0) - (a.health_score || 0));
    if (sortBy === 'rows') result.sort((a, b) => (b.rows || 0) - (a.rows || 0));
    
    return result;
  }, [datasets, searchTerm, healthFilter, sortBy]);

  if (loading) return <LoadingState message="Loading datasets..." />;

  const getHealthStyle = (score) => {
    if (score >= 80) return { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', ring: 'stroke-emerald-500' };
    if (score >= 60) return { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', ring: 'stroke-amber-500' };
    return { badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400', ring: 'stroke-red-500' };
  };

  return (
    <div className="animate-fade-in space-y-6">
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
              <p className="mt-1.5 text-slate-300 text-sm">{datasets.length} dataset{datasets.length !== 1 ? 's' : ''} in your library</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchDatasets(true)}
              disabled={refreshing}
              className="btn-press inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="btn-press group inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-800 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <Upload className="w-5 h-5" />
              Upload New
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 animate-slide-down">
          <AlertTriangle className="w-5 h-5" />
          {error}
          <button onClick={() => setError('')} className="ml-auto hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search datasets by name..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Health</option>
              <option value="good">Good (80+)</option>
              <option value="warning">Warning (60-79)</option>
              <option value="poor">Poor (&lt;60)</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="health">Highest Health</option>
              <option value="rows">Most Rows</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dataset List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {filteredDatasets.length === 0 ? (
          <div className="py-16 text-center animate-scale-in">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {datasets.length === 0 ? 'No datasets yet' : 'No matching datasets'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              {datasets.length === 0 ? 'Upload your first dataset to start analyzing.' : 'Try adjusting your search or filter.'}
            </p>
            {datasets.length === 0 && (
              <button
                onClick={() => navigate('/upload')}
                className="btn-press inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
              >
                <Upload className="w-4 h-4" />
                Upload Dataset
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredDatasets.map((dataset, index) => {
              const health = dataset.health_score || 0;
              const healthStyle = getHealthStyle(health);
              const isDeleting = deletingId === dataset._id;
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
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                          {dataset.created_at
                            ? new Date(dataset.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'N/A'}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                          {(dataset.rows || 0).toLocaleString()} rows
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                          {(dataset.columns || 0)} columns
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Health Ring */}
                  <div className="hidden md:flex items-center gap-2">
                    <div className="w-10 h-10 relative">
                      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                        <path className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className={healthStyle.ring} strokeWidth="3" strokeLinecap="round" fill="none" strokeDasharray={`${health}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-[10px] font-bold ${healthStyle.badge.split(' ')[1]}`}>{health}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/datasets/${dataset._id}`)}
                      className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                      title="Open dataset"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Open
                    </button>
                    <button
                      onClick={() => deleteDataset(dataset._id)}
                      disabled={isDeleting}
                      className="btn-press inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete dataset"
                    >
                      {isDeleting ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 justify-center">
        <span className="flex items-center gap-1.5">
          <Database className="w-4 h-4" /> {datasets.length} total datasets
        </span>
        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
        <span className="flex items-center gap-1.5">
          <Rows3 className="w-4 h-4" /> {datasets.reduce((sum, d) => sum + (d.rows || 0), 0).toLocaleString()} total rows
        </span>
        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
        <span className="flex items-center gap-1.5">
          <HeartPulse className="w-4 h-4" /> {datasets.length > 0 ? Math.round(datasets.reduce((sum, d) => sum + (d.health_score || 0), 0) / datasets.length) : 0}/100 avg health
        </span>
      </div>
    </div>
  );
};

export default DatasetHistory;