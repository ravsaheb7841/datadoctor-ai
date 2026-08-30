import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DEMO_DATASET } from '../utils/demo';

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

const DemoEDA = () => (
  <div className="animate-fade-in space-y-6 text-white">
    <div>
      <h1 className="text-2xl font-bold">Exploratory Data Analysis</h1>
      <p className="text-slate-400 text-sm mt-1">Basic EDA on {DEMO_DATASET.filename}</p>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        ['Rows', DEMO_DATASET.rows.toLocaleString()],
        ['Columns', DEMO_DATASET.columns],
        ['Missing', '22 (1.1%)'],
        ['Duplicates', '8'],
      ].map(([label, value]) => (
        <div key={label} className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-xl font-bold mt-1">{value}</p>
        </div>
      ))}
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
        <h3 className="font-semibold mb-4">Unit_Price distribution</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
            <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
        <h3 className="font-semibold mb-4">Category breakdown</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={categoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#94a3b8" fontSize={11} />
            <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={90} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
            <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

export default DemoEDA;
