import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope, Bot, Wand2, AlertCircle, Activity, ArrowRight,
  Lock, X, CheckCircle2, Database, Rows3, HeartPulse,
  Sparkles, ShieldCheck, FileSpreadsheet, Clock, Eye
} from 'lucide-react';

const DEMO_ISSUES = [
  { severity: 'high', type: 'missing_values', column: 'age', issue: 'Missing values in age', affected_rows: 11, percentage_affected: 1.09, recommended: 'Fill with median age' },
  { severity: 'high', type: 'missing_values', column: 'email', issue: 'Missing values in email', affected_rows: 11, percentage_affected: 1.09, recommended: 'Drop rows or use custom value' },
  { severity: 'medium', type: 'duplicates', column: 'customer_id', issue: 'Duplicate customer IDs found', affected_rows: 8, percentage_affected: 0.79, recommended: 'Remove duplicates keeping first' },
  { severity: 'medium', type: 'outliers', column: 'unit_price', issue: 'Outliers detected in Unit_Price', affected_rows: 14, percentage_affected: 1.38, recommended: 'Cap outliers using IQR method' },
  { severity: 'low', type: 'inconsistent_format', column: 'order_date', issue: 'Inconsistent date formats in order_date', affected_rows: 6, percentage_affected: 0.59, recommended: 'Convert all dates to ISO format' },
];

const DEMO_COLUMNS = [
  { name: 'customer_id', type: 'identifier', quality: 'good' },
  { name: 'age', type: 'numeric', quality: 'warning' },
  { name: 'email', type: 'text', quality: 'warning' },
  { name: 'city', type: 'categorical', quality: 'good' },
  { name: 'unit_price', type: 'numeric', quality: 'warning' },
  { name: 'order_date', type: 'datetime', quality: 'warning' },
];

const Demo = () => {
  const navigate = useNavigate();
  const [lockOpen, setLockOpen] = useState(false);
  const [lockFeature, setLockFeature] = useState('');
  const [activeTab, setActiveTab] = useState('issues');
  const [showColumns, setShowColumns] = useState(false);

  const openLock = (name) => {
    setLockFeature(name);
    setLockOpen(true);
  };

  const severityStyles = {
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  };

  const typeStyles = {
    numeric: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    categorical: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    text: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    datetime: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    identifier: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  };

  const qualityStyles = {
    good: 'text-emerald-500',
    warning: 'text-amber-500',
    poor: 'text-red-500',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold leading-tight">DataDoctor AI</p>
              <p className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                <Eye className="w-3 h-3" /> Demo Mode · Read only
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
              Login
            </button>
            <button onClick={() => navigate('/register')} className="btn-press px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25 transition-all">
              Create Free Account
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Demo Banner */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-slide-down">
          <p className="text-sm text-amber-200">
            You are exploring a sample dataset. Cleaning, chat, reports and uploads unlock after you sign up.
          </p>
          <button onClick={() => navigate('/register')} className="btn-press inline-flex items-center gap-1.5 text-sm font-semibold text-amber-100 hover:text-white">
            Unlock all features <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-blue-300" />
                  <span className="text-blue-300 text-sm font-medium">Data Quality Diagnosis</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">Data Doctor</h1>
                <p className="mt-1.5 text-slate-300 text-sm">Sample sales dataset · 1,012 rows</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => openLock('AI Diagnosis')}
                className="btn-press inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all"
              >
                <Lock className="w-4 h-4" />
                AI Diagnosis
              </button>
              <button
                onClick={() => openLock('Clean Data')}
                className="btn-press inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-800 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Lock className="w-4 h-4" />
                Clean Data
              </button>
            </div>
          </div>
        </div>

        {/* Stats + Health Score */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Ring */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${0.71 * 264} 264`} transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-amber-500">71</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 mt-2 mb-1">Data Health Score</p>
            <p className="text-xl font-bold text-amber-500">Fair</p>
            <p className="text-xs text-slate-500 mt-2 text-center max-w-xs">
              Some issues detected. Create an account to clean this dataset.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Rows3, label: 'Rows', value: '1,012', color: 'text-blue-400' },
              { icon: Database, label: 'Columns', value: '6', color: 'text-purple-400' },
              { icon: AlertCircle, label: 'Issues', value: '5', color: 'text-amber-400' },
              { icon: ShieldCheck, label: 'Demo', value: 'Read Only', color: 'text-emerald-400' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="stagger-item bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center gap-3" style={{ animationDelay: `${i * 0.05}s` }}>
                  <Icon className={`w-6 h-6 ${item.color} flex-shrink-0`} />
                  <div>
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="font-bold">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column Preview */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Column Summary</h3>
              <button
                onClick={() => setShowColumns(!showColumns)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                {showColumns ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {DEMO_COLUMNS.map((col, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${qualityStyles[col.quality]}`}></span>
                    <span className="text-sm font-medium">{col.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeStyles[col.type]}`}>
                    {col.type.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {['issues', 'columns'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'issues' ? `Issues (${DEMO_ISSUES.length})` : `Columns (${DEMO_COLUMNS.length})`}
            </button>
          ))}
        </div>

        {/* Issues List */}
        {activeTab === 'issues' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Detected Issues</h2>
                <p className="text-sm text-slate-400 mt-0.5">{DEMO_ISSUES.length} sample issues · read only</p>
              </div>
              <button
                onClick={() => openLock('Fix Issues')}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Lock className="w-3 h-3" /> Locked
              </button>
            </div>
            <div className="divide-y divide-slate-800">
              {DEMO_ISSUES.map((issue, index) => (
                <div key={index} className="stagger-item p-5 hover:bg-slate-800/50 transition-colors" style={{ animationDelay: `${index * 0.04}s` }}>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${severityStyles[issue.severity]}`}>
                      {issue.severity.toUpperCase()}
                    </span>
                    <span className="font-semibold">
                      {issue.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                    <span className="text-sm text-slate-500">on {issue.column}</span>
                  </div>
                  <p className="text-slate-300 text-sm">{issue.issue}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {issue.affected_rows} rows affected ({issue.percentage_affected}%)
                  </p>
                  <div className="mt-3 bg-slate-800/50 rounded-lg px-3 py-2">
                    <p className="text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">Recommended: </span>
                      {issue.recommended}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Columns List */}
        {activeTab === 'columns' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800">
              <h2 className="text-lg font-semibold">Column Details</h2>
              <p className="text-sm text-slate-400 mt-0.5">Semantic types detected by AI</p>
            </div>
            <div className="divide-y divide-slate-800">
              {DEMO_COLUMNS.map((col, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${qualityStyles[col.quality]}`}></span>
                    <span className="font-medium">{col.name}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeStyles[col.type]}`}>
                    {col.type.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Footer */}
        <div className="text-center py-6">
          <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-3" />
          <p className="text-slate-400 text-sm mb-4">Ready to clean your own data?</p>
          <button
            onClick={() => navigate('/register')}
            className="btn-press inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lock Modal */}
      {lockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <button onClick={() => setLockOpen(false)} className="p-2 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-xl font-bold mb-2">{lockFeature} is locked in demo</h3>
            <p className="text-slate-400 text-sm mb-6">
              Create a free account to clean data, run AI diagnosis, chat with your dataset and download reports.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/register')}
                className="btn-press flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold"
              >
                Create Account
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex-1 py-3 rounded-xl border border-slate-600 font-medium hover:bg-slate-800 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Demo;