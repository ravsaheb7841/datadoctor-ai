import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import {
  Database, Download, TrendingUp, FileText,
  Rows3, Columns3, HeartPulse, AlertTriangle, Wand2, Bot,
  ShieldCheck, MessageSquare, ArrowRight, Activity
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingState from '../components/LoadingState';

const DatasetOverview = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDataset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDataset = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/datasets/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDataset(data);
    } catch (error) {
      console.error('Failed to fetch dataset:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/datasets/${id}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cleaned_${dataset?.filename || 'dataset'}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <LoadingState message="Loading dataset..." />;

  if (!dataset) {
    return (
      <div className="text-center py-20">
        <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Dataset not found</p>
      </div>
    );
  }

  const healthScore = dataset.health_score || 0;
  const getHealthColor = (score) => {
    if (score >= 80) return { text: 'text-emerald-600', ring: 'stroke-emerald-500', bg: 'from-emerald-500 to-emerald-600' };
    if (score >= 60) return { text: 'text-amber-600', ring: 'stroke-amber-500', bg: 'from-amber-500 to-amber-600' };
    return { text: 'text-red-600', ring: 'stroke-red-500', bg: 'from-red-500 to-red-600' };
  };
  const health = getHealthColor(healthScore);

  const quickActions = [
    {
      icon: Wand2,
      title: 'Clean Data',
      description: 'Review and fix detected data quality issues',
      path: `/datasets/${id}/cleaning`,
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20'
    },
    {
      icon: TrendingUp,
      title: 'Explore EDA',
      description: 'Understand distributions, relationships and trends',
      path: `/datasets/${id}/eda`,
      gradient: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/20'
    },
    {
      icon: ShieldCheck,
      title: 'Data Doctor',
      description: 'View detected issues and health score',
      path: `/datasets/${id}/doctor`,
      gradient: 'from-orange-500 to-amber-600',
      shadow: 'shadow-orange-500/20'
    },
    {
      icon: Bot,
      title: 'AI Insights',
      description: 'Get AI-powered analysis and recommendations',
      path: `/datasets/${id}/insights`,
      gradient: 'from-purple-500 to-violet-600',
      shadow: 'shadow-purple-500/20'
    },
    {
      icon: MessageSquare,
      title: 'Data Chat',
      description: 'Ask questions about your data in natural language',
      path: `/datasets/${id}/chat`,
      gradient: 'from-indigo-500 to-blue-600',
      shadow: 'shadow-indigo-500/20'
    },
    {
      icon: FileText,
      title: 'Generate Report',
      description: 'Create a professional PDF report',
      path: `/datasets/${id}/reports`,
      gradient: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-500/20'
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Datasets', to: '/datasets' },
          { label: dataset.filename },
          { label: 'Overview' }
        ]}
      />

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-400/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
              <Database className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-300" />
                <span className="text-blue-300 text-sm font-medium">Dataset Overview</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-all">
                {dataset.filename}
              </h1>
              <p className="mt-1.5 text-slate-300 text-sm">
                Uploaded on {new Date(dataset.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-press group inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-800 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-60"
          >
            <Download className="w-5 h-5" />
            {downloading ? 'Downloading...' : 'Download CSV'}
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Rows3, label: 'Rows', value: dataset.rows?.toLocaleString() || 0, color: 'blue' },
          { icon: Columns3, label: 'Columns', value: dataset.columns || 0, color: 'indigo' },
          { icon: HeartPulse, label: 'Health Score', value: `${healthScore}/100`, color: 'green', isHealth: true },
          { icon: AlertTriangle, label: 'Issues', value: dataset.issue_count || 0, color: 'amber' },
        ].map((item, i) => {
          const colorMap = {
            blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
            indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/20',
            green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
            amber: 'from-amber-500 to-amber-600 shadow-amber-500/20',
          };
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="stagger-item group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colorMap[item.color]} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`}></div>

              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${colorMap[item.color]} text-white shadow-lg mb-3`}>
                <Icon className="w-5 h-5" />
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{item.label}</p>
              
              {item.isHealth ? (
                <div className="flex items-center gap-3 mt-1">
                  <p className={`text-2xl font-bold ${health.text}`}>{item.value}</p>
                  <div className="w-10 h-10 relative">
                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                      <path className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="3" fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className={health.ring} strokeWidth="3" strokeLinecap="round" fill="none"
                        strokeDasharray={`${healthScore}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                  </div>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">
                  {item.value}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          What would you like to do?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={() => navigate(action.path)}
                className="stagger-item group relative overflow-hidden text-left rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${0.1 + idx * 0.06}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-lg ${action.shadow} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {action.description}
                </p>

                <div className="mt-4 flex items-center text-sm font-medium text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Open
                  <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data Preview</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">First 10 rows of your dataset</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-5 py-3.5 font-medium w-12">#</th>
                {dataset.column_names?.map((col) => (
                  <th key={col} className="px-5 py-3.5 font-medium whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {dataset.data_preview?.slice(0, 10).map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors"
                >
                  <td className="px-5 py-3 text-sm text-gray-400 font-medium">{index + 1}</td>
                  {dataset.column_names?.map((col) => (
                    <td key={col} className="px-5 py-3 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {row[col] !== null && row[col] !== undefined ? String(row[col]) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DatasetOverview;