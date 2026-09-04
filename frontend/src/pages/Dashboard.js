import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import {
  Database, Rows3, HeartPulse, AlertTriangle, Wand2, Plus,
  TrendingUp, ArrowRight, Activity, FileSpreadsheet,
  Search, RefreshCw, CircleCheck, CircleX, Clock, BarChart3,
  ChevronRight, Star, ShieldCheck, Zap, Layers
} from 'lucide-react';
import LoadingState from '../components/LoadingState';

const API_URL = 'https://datadoctor-ai.onrender.com';

const Dashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [datasets, setDatasets] = useState([]);
  const [stats, setStats] = useState({
    totalDatasets: 0,
    totalRows: 0,
    avgHealth: 0,
    totalIssues: 0,
    cleanedDatasets: 0,
    criticalIssues: 0,
    highIssues: 0,
    lastUploaded: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchDatasets = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/datasets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch datasets');
      const data = await response.json();
      const datasetsList = data.datasets || [];
      setDatasets(datasetsList);

      const total = datasetsList.length;
      const totalRows = datasetsList.reduce((sum, ds) => sum + (ds.rows || 0), 0);
      const avgHealth = total > 0 ? Math.round(datasetsList.reduce((sum, ds) => sum + (ds.health_score || 0), 0) / total) : 0;
      const totalIssues = datasetsList.reduce((sum, ds) => sum + (ds.issue_count || 0), 0);
      const cleanedDatasets = datasetsList.filter(ds => (ds.version || 1) > 1).length;
      const criticalIssues = datasetsList.reduce((sum, ds) => sum + (ds.critical_issues || 0), 0);
      const highIssues = datasetsList.reduce((sum, ds) => sum + (ds.high_issues || 0), 0);
      const lastUploaded = datasetsList.length > 0 ? datasetsList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] : null;

      setStats({ totalDatasets: total, totalRows, avgHealth, totalIssues, cleanedDatasets, criticalIssues, highIssues, lastUploaded });
    } catch (err) {
      console.error(err);
      setError('Failed to load datasets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const filteredDatasets = useMemo(() => {
    let result = [...datasets];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(ds => (ds.filename || '').toLowerCase().includes(s));
    }
    if (healthFilter === 'good') result = result.filter(ds => (ds.health_score || 0) >= 80);
    if (healthFilter === 'warning') result = result.filter(ds => (ds.health_score || 0) >= 60 && (ds.health_score || 0) < 80);
    if (healthFilter === 'poor') result = result.filter(ds => (ds.health_score || 0) < 60);
    return result;
  }, [datasets, searchTerm, healthFilter]);

  if (loading) return <LoadingState message="Loading dashboard..." />;

  const getHealthColor = (score) => {
    if (score >= 80) return { bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400', ring: 'stroke-green-500', label: 'Good', badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' };
    if (score >= 60) return { bg: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', ring: 'stroke-yellow-500', label: 'Warning', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' };
    return { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400', ring: 'stroke-red-500', label: 'Poor', badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' };
  };

  const statCards = [
    { icon: Database, label: 'Total Datasets', value: stats.totalDatasets, color: 'from-blue-500 to-blue-600 shadow-blue-500/25', sub: `${stats.cleanedDatasets} cleaned` },
    { icon: Rows3, label: 'Rows Analyzed', value: stats.totalRows.toLocaleString(), color: 'from-indigo-500 to-indigo-600 shadow-indigo-500/25', sub: 'Total data processed' },
    { icon: HeartPulse, label: 'Avg Health', value: `${stats.avgHealth}/100`, color: stats.avgHealth >= 80 ? 'from-emerald-500 to-emerald-600 shadow-emerald-500/25' : stats.avgHealth >= 60 ? 'from-amber-500 to-amber-600 shadow-amber-500/25' : 'from-red-500 to-red-600 shadow-red-500/25', sub: 'Overall quality' },
    { icon: AlertTriangle, label: 'Issues Found', value: stats.totalIssues, color: 'from-amber-500 to-amber-600 shadow-amber-500/25', sub: `${stats.criticalIssues} critical` },
    { icon: Wand2, label: 'Cleaned', value: stats.cleanedDatasets, color: 'from-purple-500 to-purple-600 shadow-purple-500/25', sub: 'Datasets optimized' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-200" />
              <span className="text-blue-200 text-sm font-medium">Data Quality Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back{user?.name ? `, ${user.name}` : ''}
            </h1>
            <p className="mt-2 text-blue-100 max-w-md">
              Monitor health, detect issues and clean your datasets in one place.
            </p>
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
              className="btn-press group inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <Plus className="w-5 h-5" />
              Upload Dataset
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 animate-slide-down">
          <AlertTriangle className="w-5 h-5" />
          {error}
          <button onClick={() => setError('')} className="ml-auto hover:opacity-70">x</button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="stagger-item group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`}></div>
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">{item.value}</p>
              {item.sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{item.sub}</p>}
            </div>
          );
        })}
      </div>

      {/* Recent Datasets */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Datasets</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {filteredDatasets.length} of {datasets.length} datasets shown
              </p>
            </div>
            <button
              onClick={() => navigate('/datasets')}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search datasets..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              />
            </div>
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
          </div>
        </div>

        {filteredDatasets.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
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
                className="btn-press inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Upload Dataset
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredDatasets.slice(0, 10).map((ds, index) => {
              const health = ds.health_score || 0;
              const colors = getHealthColor(health);
              const isCleaned = (ds.version || 1) > 1;
              return (
                <div
                  key={ds._id}
                  onClick={() => navigate(`/datasets/${ds._id}`)}
                  className="group flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-all duration-200"
                >
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                    <Database className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {ds.filename}
                      </p>
                      {isCleaned && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 flex items-center gap-1 flex-shrink-0">
                          <Wand2 className="w-3 h-3" /> Cleaned
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                      <span>{(ds.rows || 0).toLocaleString()} rows</span>
                      <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                      <span className="hidden sm:inline">
                        {ds.created_at ? new Date(ds.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
                      </span>
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-12 h-12 relative">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                        <path className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className={colors.ring} strokeWidth="3" strokeLinecap="round" fill="none" strokeDasharray={`${health}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-xs font-bold ${colors.text}`}>{health}</span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col items-end gap-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{ds.issue_count || 0} issues</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${colors.badge}`}>{colors.label}</span>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Summary Footer */}
      {stats.lastUploaded && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs text-gray-500">Last Upload</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{stats.lastUploaded.filename}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs text-gray-500">Best Health</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{Math.max(...datasets.map(d => d.health_score || 0))}/100</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
            <Star className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-xs text-gray-500">Total Cleaned</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{stats.cleanedDatasets} datasets</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;