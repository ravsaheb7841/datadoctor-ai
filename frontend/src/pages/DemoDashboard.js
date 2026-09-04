import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database, Rows3, HeartPulse, AlertTriangle, BarChart3,
  MessageSquare, ArrowRight, Sparkles, ShieldCheck, Zap,
  FileSpreadsheet, Eye, Lock, TrendingUp
} from 'lucide-react';
import { DEMO_DATASET, DEMO_ISSUES } from '../utils/demo';

const DemoDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Datasets', value: '1', icon: Database, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/25' },
    { label: 'Rows', value: DEMO_DATASET.rows.toLocaleString(), icon: Rows3, color: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/25' },
    { label: 'Health', value: `${DEMO_DATASET.health_score}/100`, icon: HeartPulse, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25' },
    { label: 'Issues', value: String(DEMO_ISSUES.length), icon: AlertTriangle, color: 'from-rose-500 to-red-600', shadow: 'shadow-rose-500/25' },
  ];

  const lockedFeatures = [
    { icon: Lock, label: 'Upload Dataset', desc: 'Use your own CSV/Excel files' },
    { icon: Lock, label: 'Clean Data', desc: 'Fix issues automatically' },
    { icon: Lock, label: 'AI Diagnosis', desc: 'Get AI recommendations' },
    { icon: Lock, label: 'Reports', desc: 'Download PDF reports' },
  ];

  return (
    <div className="animate-fade-in space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Demo Mode · Read Only</span>
          </div>
          <h1 className="text-2xl font-bold">Demo Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Sample dataset preview. Sign up to use your own files.</p>
        </div>
        <button
          onClick={() => navigate('/register')}
          className="btn-press inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          <Zap className="w-4 h-4" />
          Unlock Full Access
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="stagger-item group relative overflow-hidden bg-slate-800/80 border border-slate-700 rounded-2xl p-4 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${s.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`}></div>
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${s.color} shadow-lg ${s.shadow} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm text-slate-400">{s.label}</p>
              <p className="text-xl font-bold mt-0.5">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Explore Sample Data</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* EDA */}
          <button
            onClick={() => navigate('/demo/eda')}
            className="group text-left bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold">Exploratory Analysis</h3>
            <p className="text-sm text-slate-400 mt-1">View charts and stats for the sample dataset.</p>
            <span className="inline-flex items-center gap-1 text-blue-400 text-sm mt-3 font-medium">
              View EDA <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Chat */}
          <button
            onClick={() => navigate('/demo/chat')}
            className="group text-left bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25 mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold">Data Chat</h3>
            <p className="text-sm text-slate-400 mt-1">Ask questions about the sample sales data.</p>
            <span className="inline-flex items-center gap-1 text-purple-400 text-sm mt-3 font-medium">
              Open Chat <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Issues */}
          <button
            onClick={() => navigate('/demo/doctor')}
            className="group text-left bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 mb-4 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold">Data Doctor</h3>
            <p className="text-sm text-slate-400 mt-1">See detected issues in sample data.</p>
            <span className="inline-flex items-center gap-1 text-amber-400 text-sm mt-3 font-medium">
              View Issues <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>

      {/* Dataset Info */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            <h2 className="font-semibold">Sample Dataset</h2>
          </div>
          <span className="text-xs text-slate-500">Read Only</span>
        </div>
        <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">{DEMO_DATASET.filename}</p>
            <p className="text-sm text-slate-400 mt-1">
              {DEMO_DATASET.rows.toLocaleString()} rows · {DEMO_DATASET.columns} columns
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-500">Health Score</p>
              <p className="font-bold text-amber-400">{DEMO_DATASET.health_score}/100</p>
            </div>
            <div className="w-12 h-12 relative">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <path className="stroke-slate-700" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="stroke-amber-500" strokeWidth="3" strokeLinecap="round" fill="none" strokeDasharray={`${DEMO_DATASET.health_score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Locked Features */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Locked Features</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {lockedFeatures.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <button
                key={i}
                onClick={() => navigate('/register')}
                className="stagger-item group bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-left hover:border-amber-500/50 hover:bg-slate-800 transition-all duration-300"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  <Lock className="w-3 h-3 text-slate-600" />
                </div>
                <p className="font-medium text-sm">{feature.label}</p>
                <p className="text-xs text-slate-500 mt-1">{feature.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-4">
        <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-3" />
        <p className="text-slate-400 text-sm mb-4">Ready to unlock full data cleaning power?</p>
        <button
          onClick={() => navigate('/register')}
          className="btn-press inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          <Zap className="w-4 h-4" />
          Create Free Account
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DemoDashboard;