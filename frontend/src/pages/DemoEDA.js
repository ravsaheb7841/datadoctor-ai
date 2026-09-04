import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { DEMO_DATASET } from '../utils/demo';
import {
  Database, Rows3, AlertCircle, Copy, TrendingUp, TrendingDown,
  ArrowRight, Zap, Sparkles, Lock, Activity, Target
} from 'lucide-react';

const priceData = [
  { range: '0-100', count: 120 },
  { range: '100-200', count: 280 },
  { range: '200-300', count: 310 },
  { range: '300-400', count: 190 },
  { range: '400+', count: 112 },
];

const categoryData = [
  { name: 'Electronics', value: 340 },
  { name: 'Home', value: 220 },
  { name: 'Fashion', value: 180 },
  { name: 'Sports', value: 150 },
  { name: 'Other', value: 122 },
];

const monthlyTrend = [
  { month: 'Jan', sales: 420 },
  { month: 'Feb', sales: 380 },
  { month: 'Mar', sales: 520 },
  { month: 'Apr', sales: 610 },
  { month: 'May', sales: 580 },
  { month: 'Jun', sales: 720 },
  { month: 'Jul', sales: 690 },
  { month: 'Aug', sales: 780 },
  { month: 'Sep', sales: 750 },
  { month: 'Oct', sales: 850 },
  { month: 'Nov', sales: 920 },
  { month: 'Dec', sales: 1010 },
];

const statusData = [
  { name: 'Delivered', value: 620 },
  { name: 'Processing', value: 180 },
  { name: 'Cancelled', value: 120 },
  { name: 'Pending', value: 92 },
];

const PIE_COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B'];

const correlationData = [
  { pair: 'Quantity vs Unit_Price', value: -0.56, strength: 'Moderate Negative' },
  { pair: 'Age vs Purchase Amount', value: 0.31, strength: 'Weak Positive' },
  { pair: 'Discount vs Sales', value: 0.68, strength: 'Strong Positive' },
];

const DemoEDA = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { icon: Rows3, label: 'Rows', value: DEMO_DATASET.rows.toLocaleString(), color: 'text-blue-400' },
    { icon: Database, label: 'Columns', value: DEMO_DATASET.columns, color: 'text-purple-400' },
    { icon: AlertCircle, label: 'Missing', value: '22 (1.1%)', color: 'text-amber-400' },
    { icon: Copy, label: 'Duplicates', value: '8', color: 'text-rose-400' },
  ];

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'numerical', label: 'Numerical' },
    { key: 'categorical', label: 'Categorical' },
    { key: 'correlation', label: 'Correlation' },
  ];

  return (
    <div className="animate-fade-in space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Exploratory Data Analysis</h1>
            <p className="text-slate-400 text-sm mt-1">Sample analysis on {DEMO_DATASET.filename}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/register')}
          className="btn-press inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:border-blue-500 transition-all"
        >
          <Lock className="w-4 h-4 text-amber-400" />
          Full EDA locked
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stagger-item bg-slate-800 border border-slate-700 rounded-2xl p-4 hover:border-slate-600 transition-colors" style={{ animationDelay: `${i * 0.05}s` }}>
              <Icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className="text-sm text-slate-400">{s.label}</p>
              <p className="text-xl font-bold mt-0.5">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Price Distribution */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-blue-500/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Unit Price Distribution</h3>
                <span className="text-xs text-slate-500">Histogram</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-purple-500/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Category Breakdown</h3>
                <span className="text-xs text-slate-500">Top 5</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={90} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-emerald-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Monthly Sales Trend</h3>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Upward
              </span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Numerical Tab */}
      {activeTab === 'numerical' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <h3 className="font-semibold mb-4">Quantity Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                <Bar dataKey="count" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <h3 className="font-semibold mb-4">Age Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Categorical Tab */}
      {activeTab === 'categorical' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <h3 className="font-semibold mb-4">Order Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <h3 className="font-semibold mb-4">Top Categories</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={90} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                <Bar dataKey="value" fill="#EC4899" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Correlation Tab */}
      {activeTab === 'correlation' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <h3 className="font-semibold mb-4">Correlation Analysis</h3>
          <div className="space-y-3">
            {correlationData.map((corr, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                <div>
                  <p className="font-medium">{corr.pair}</p>
                  <p className="text-xs text-slate-500">{corr.strength}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${corr.value > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {corr.value.toFixed(2)}
                  </span>
                  <TrendingUp className={`w-4 h-4 ${corr.value > 0 ? 'text-emerald-400' : 'text-rose-400 rotate-180'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/30 rounded-2xl p-6 text-center">
        <Sparkles className="w-6 h-6 text-blue-400 mx-auto mb-3" />
        <h3 className="font-semibold mb-2">Want full EDA on your own data?</h3>
        <p className="text-slate-400 text-sm mb-4">Upload your dataset and get complete analysis, correlations, and insights.</p>
        <button
          onClick={() => navigate('/register')}
          className="btn-press inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
        >
          <Zap className="w-4 h-4" />
          Unlock Full EDA
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DemoEDA;