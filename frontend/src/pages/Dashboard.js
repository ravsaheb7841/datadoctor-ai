import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import {
  Database, Rows3, HeartPulse, AlertTriangle, Wand2, Plus,
  TrendingUp, ArrowRight, Activity, FileSpreadsheet
} from 'lucide-react';
import LoadingState from '../components/LoadingState';

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [datasets, setDatasets] = useState([]);
  const [stats, setStats] = useState({
    totalDatasets: 0,
    totalRows: 0,
    avgHealth: 0,
    totalIssues: 0,
    cleanedDatasets: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/datasets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch datasets');
      const data = await response.json();
      const datasetsList = data.datasets || [];
      setDatasets(datasetsList);

      const total = datasetsList.length;
      const totalRows = datasetsList.reduce((sum, ds) => sum + (ds.rows || 0), 0);
      const avgHealth = total > 0
        ? Math.round(datasetsList.reduce((sum, ds) => sum + (ds.health_score || 0), 0) / total)
        : 0;
      const totalIssues = datasetsList.reduce((sum, ds) => sum + (ds.issue_count || 0), 0);

      setStats({
        totalDatasets: total,
        totalRows,
        avgHealth,
        totalIssues,
        cleanedDatasets: datasetsList.filter(ds => (ds.version || 1) > 1).length
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load datasets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading dashboard..." />;

  const getHealthColor = (score) => {
    if (score >= 80) return { bg: 'bg-green-500', text: 'text-green-600', ring: 'stroke-green-500' };
    if (score >= 60) return { bg: 'bg-yellow-500', text: 'text-yellow-600', ring: 'stroke-yellow-500' };
    return { bg: 'bg-red-500', text: 'text-red-600', ring: 'stroke-red-500' };
  };

  return (
    <div className="animate-fade-in space-y-8">
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
              Dashboard Overview
            </h1>
            <p className="mt-2 text-blue-100 max-w-md">
              Monitor health, detect issues and clean your datasets in one place.
            </p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="btn-press group inline-flex items-center gap-2 px-5 py-3 bg-white text-blue-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Plus className="w-5 h-5" />
            Upload Dataset
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 animate-slide-down">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: Database, label: 'Total Datasets', value: stats.totalDatasets, color: 'blue' },
          { icon: Rows3, label: 'Rows Analyzed', value: stats.totalRows.toLocaleString(), color: 'indigo' },
          { icon: HeartPulse, label: 'Avg Health', value: `${stats.avgHealth}/100`, color: 'green' },
          { icon: AlertTriangle, label: 'Issues Found', value: stats.totalIssues, color: 'amber' },
          { icon: Wand2, label: 'Cleaned', value: stats.cleanedDatasets, color: 'purple' },
        ].map((item, i) => {
          const colorMap = {
            blue: 'from-blue-500 to-blue-600 shadow-blue-500/25',
            indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/25',
            green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/25',
            amber: 'from-amber-500 to-amber-600 shadow-amber-500/25',
            purple: 'from-purple-500 to-purple-600 shadow-purple-500/25',
          };
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="stagger-item group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorMap[item.color]} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`}></div>
              
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${colorMap[item.color]} text-white shadow-lg mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Datasets */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Datasets</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Click to open any dataset</p>
          </div>
          <button
            onClick={() => navigate('/datasets')}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {datasets.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No datasets yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Upload your first dataset to start analyzing and cleaning your data.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="btn-press inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Upload Dataset
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {datasets.slice(0, 8).map((ds, index) => {
              const health = ds.health_score || 0;
              const colors = getHealthColor(health);
              return (
                <div
                  key={ds._id}
                  onClick={() => navigate(`/datasets/${ds._id}`)}
                  className="group flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-all duration-200"
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                    <Database className="w-5 h-5" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {ds.filename}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {(ds.rows || 0).toLocaleString()} rows · {ds.created_at ? new Date(ds.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}
                    </p>
                  </div>

                  {/* Health */}
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${colors.text}`}>{health}/100</p>
                      <p className="text-xs text-gray-400">Health</p>
                    </div>
                    <div className="w-12 h-12 relative">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="stroke-gray-200 dark:stroke-gray-700"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={colors.ring}
                          strokeWidth="3"
                          strokeLinecap="round"
                          fill="none"
                          strokeDasharray={`${health}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Issues + Status */}
                  <div className="hidden md:flex items-center gap-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {ds.issue_count || 0} issues
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      ds.status === 'completed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                    }`}>
                      {ds.status || 'pending'}
                    </span>
                  </div>

                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;