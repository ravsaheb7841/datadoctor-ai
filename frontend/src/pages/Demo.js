import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope, Bot, Wand2, AlertCircle, Activity, ArrowRight, Lock, X
} from 'lucide-react';

const DEMO_ISSUES = [
  { severity: 'high', type: 'missing_values', issue: 'Missing values in age', affected_rows: 11, percentage_affected: 1.09 },
  { severity: 'high', type: 'missing_values', issue: 'Missing values in email', affected_rows: 11, percentage_affected: 1.09 },
  { severity: 'medium', type: 'duplicates', issue: 'Duplicate customer IDs found', affected_rows: 8, percentage_affected: 0.79 },
  { severity: 'medium', type: 'outliers', issue: 'Outliers detected in Unit_Price', affected_rows: 14, percentage_affected: 1.38 },
  { severity: 'low', type: 'inconsistent_format', issue: 'Inconsistent date formats in order_date', affected_rows: 6, percentage_affected: 0.59 },
];

const Demo = () => {
  const navigate = useNavigate();
  const [lockOpen, setLockOpen] = useState(false);
  const [lockFeature, setLockFeature] = useState('');

  const openLock = (name) => {
    setLockFeature(name);
    setLockOpen(true);
  };

  const severityStyles = {
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold leading-tight">DataDoctor AI</p>
              <p className="text-[11px] text-amber-400 font-medium">Demo Mode · Read only</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm text-slate-300 hover:text-white">
              Login
            </button>
            <button onClick={() => navigate('/register')} className="btn-press px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
              Create Free Account
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-amber-200">
            You are exploring a sample dataset. Cleaning, chat, reports and uploads unlock after you sign up.
          </p>
          <button onClick={() => navigate('/register')} className="btn-press inline-flex items-center gap-1.5 text-sm font-semibold text-amber-100 hover:text-white">
            Unlock all features <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
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
              <button onClick={() => openLock('AI Diagnosis')} className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-semibold">
                <Lock className="w-4 h-4" />
                AI Diagnosis
              </button>
              <button onClick={() => openLock('Clean Data')} className="inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-800 rounded-xl font-semibold">
                <Lock className="w-4 h-4" />
                Clean Data
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 flex flex-col sm:flex-row items-center justify-center gap-10">
          <div className="relative w-40 h-40">
            <svg className="w-40 h-40" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${0.71 * 264} 264`} transform="rotate(-90 50 50)" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-amber-500">71</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm text-slate-400 mb-1">Data Health Score</p>
            <p className="text-2xl font-bold text-amber-500">Fair</p>
            <p className="text-sm text-slate-400 mt-2 max-w-xs">
              Some issues detected. Create an account to clean this dataset.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800">
            <h2 className="text-lg font-semibold">Detected Issues</h2>
            <p className="text-sm text-slate-400 mt-0.5">{DEMO_ISSUES.length} sample issues · read only</p>
          </div>
          <div className="divide-y divide-slate-800">
            {DEMO_ISSUES.map((issue, index) => (
              <div key={index} className="p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${severityStyles[issue.severity]}`}>
                    {issue.severity.toUpperCase()}
                  </span>
                  <span className="font-semibold">
                    {issue.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>
                <p className="text-slate-300 text-sm">{issue.issue}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {issue.affected_rows} rows affected ({issue.percentage_affected}%)
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {lockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <button onClick={() => setLockOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-xl font-bold mb-2">{lockFeature} is locked in demo</h3>
            <p className="text-slate-400 text-sm mb-6">
              Create a free account to clean data, run AI diagnosis, chat with your dataset and download reports.
            </p>
            <div className="flex gap-3">
              <button onClick={() => navigate('/register')} className="btn-press flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold">
                Create Account
              </button>
              <button onClick={() => navigate('/login')} className="flex-1 py-3 rounded-xl border border-slate-600 font-medium">
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
