import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Rows3, HeartPulse, AlertTriangle, BarChart3, MessageSquare } from 'lucide-react';
import { DEMO_DATASET, DEMO_ISSUES } from '../utils/demo';

const DemoDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Datasets', value: '1', icon: Database, color: 'from-blue-500 to-indigo-600' },
    { label: 'Rows', value: DEMO_DATASET.rows.toLocaleString(), icon: Rows3, color: 'from-cyan-500 to-blue-600' },
    { label: 'Health', value: `${DEMO_DATASET.health_score}/100`, icon: HeartPulse, color: 'from-amber-500 to-orange-600' },
    { label: 'Issues', value: String(DEMO_ISSUES.length), icon: AlertTriangle, color: 'from-rose-500 to-red-600' },
  ];

  return (
    <div className="animate-fade-in space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-bold">Demo Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Sample dataset preview. Sign up to use your own files.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${s.color} mb-3`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-sm text-slate-400">{s.label}</p>
            <p className="text-xl font-bold mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <button onClick={() => navigate('/demo/eda')} className="text-left bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-blue-500 transition-colors">
          <BarChart3 className="w-6 h-6 text-blue-400 mb-3" />
          <h3 className="font-semibold">Exploratory Analysis</h3>
          <p className="text-sm text-slate-400 mt-1">View charts and stats for the sample dataset.</p>
        </button>
        <button onClick={() => navigate('/demo/chat')} className="text-left bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-purple-500 transition-colors">
          <MessageSquare className="w-6 h-6 text-purple-400 mb-3" />
          <h3 className="font-semibold">Data Chat</h3>
          <p className="text-sm text-slate-400 mt-1">Ask questions about the sample sales data.</p>
        </button>
      </div>

      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="font-semibold">Sample dataset</h2>
        </div>
        <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">{DEMO_DATASET.filename}</p>
            <p className="text-sm text-slate-400">{DEMO_DATASET.rows.toLocaleString()} rows · {DEMO_DATASET.columns} columns</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400">
            {DEMO_DATASET.health_score}/100 Fair
          </span>
        </div>
      </div>
    </div>
  );
};

export default DemoDashboard;
