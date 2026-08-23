import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Database, TrendingUp, AlertTriangle, Key, Calendar,
  ListFilter, RefreshCw, Activity
} from 'lucide-react';
import LoadingState from '../components/LoadingState';

const EDA = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [eda, setEda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEDA();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchEDA = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:8000/api/datasets/${id}/eda`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`Failed to fetch EDA: ${response.status}`);

      const data = await response.json();
      setEda(data);
    } catch (error) {
      console.error('Failed to fetch EDA:', error);
      setError('Failed to load EDA data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Generating EDA..." />;

  if (error) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="text-red-600 dark:text-red-400 mb-4 text-lg">{error}</div>
        <button
          onClick={fetchEDA}
          className="btn-press inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!eda) {
    return (
      <div className="text-center py-20 text-gray-500">
        No EDA data available
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 via-blue-800 to-cyan-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-400/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>

        <div className="relative z-10 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 flex-shrink-0">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-cyan-200" />
              <span className="text-cyan-200 text-sm font-medium">Exploratory Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Exploratory Data Analysis
            </h1>
            <p className="mt-1.5 text-blue-100 text-sm max-w-lg">
              Semantic-type-aware visualizations and statistical insights
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Summary */}
      {eda.summary && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dataset Summary</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">High-level overview of your data</p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              {[
                { label: 'Rows', value: eda.summary.rows?.toLocaleString() },
                { label: 'Columns', value: eda.summary.columns },
                { label: 'Missing Values', value: `${eda.summary.missing_values} (${eda.summary.missing_percentage}%)` },
                { label: 'Duplicate Rows', value: eda.summary.duplicate_rows },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className="stagger-item bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {eda.summary.numeric_columns > 0 && (
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full text-xs font-semibold">
                  Numeric: {eda.summary.numeric_columns}
                </span>
              )}
              {eda.summary.categorical_columns > 0 && (
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full text-xs font-semibold">
                  Categorical: {eda.summary.categorical_columns}
                </span>
              )}
              {eda.summary.datetime_columns > 0 && (
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 rounded-full text-xs font-semibold">
                  Datetime: {eda.summary.datetime_columns}
                </span>
              )}
              {eda.summary.identifier_columns > 0 && (
                <span className="px-3 py-1.5 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 rounded-full text-xs font-semibold">
                  Identifiers: {eda.summary.identifier_columns}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Identifier Summary */}
      {eda.identifier_summary?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Identifier Summary</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Key and ID columns</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
                  <th className="px-6 py-3.5 font-medium">Column</th>
                  <th className="px-6 py-3.5 font-medium">Type</th>
                  <th className="px-6 py-3.5 font-medium">Unique Values</th>
                  <th className="px-6 py-3.5 font-medium">Missing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {eda.identifier_summary.map((idInfo, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-gray-900 dark:text-white">{idInfo.column}</td>
                    <td className="px-6 py-3.5 text-gray-600 dark:text-gray-300">{idInfo.dtype}</td>
                    <td className="px-6 py-3.5 text-gray-600 dark:text-gray-300">{idInfo.unique_count}</td>
                    <td className="px-6 py-3.5 text-gray-600 dark:text-gray-300">{idInfo.missing_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Numerical Analysis */}
      {eda.numerical_analysis?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Numerical Distributions</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Histograms and statistics</p>
            </div>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-6">
            {eda.numerical_analysis.map((num, index) => {
              if (num.semantic_type === 'ordinal') {
                return (
                  <div key={index} className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-gray-50/50 dark:bg-gray-700/20">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                      {num.column} <span className="text-xs text-pink-500 font-medium">(Ordinal)</span>
                    </h3>
                    <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <div>Range: {num.min} to {num.max}</div>
                      <div>Unique values: {num.unique_count}</div>
                    </div>
                  </div>
                );
              }

              const chartData = num.histogram?.bins?.slice(0, -1).map((bin, i) => ({
                range: `${Math.round(bin)}`,
                count: num.histogram.counts[i]
              })) || [];

              return (
                <div key={index} className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">{num.column}</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="range" fontSize={10} tick={{ fill: '#9ca3af' }} />
                      <YAxis fontSize={10} tick={{ fill: '#9ca3af' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="count" fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div>Mean: <span className="font-medium text-gray-700 dark:text-gray-300">{num.stats?.mean?.toFixed(2)}</span></div>
                    <div>Median: <span className="font-medium text-gray-700 dark:text-gray-300">{num.stats?.median?.toFixed(2)}</span></div>
                    <div>Std: <span className="font-medium text-gray-700 dark:text-gray-300">{num.stats?.std?.toFixed(2)}</span></div>
                    <div>Min: <span className="font-medium text-gray-700 dark:text-gray-300">{num.stats?.min?.toFixed(2)}</span></div>
                    <div>Max: <span className="font-medium text-gray-700 dark:text-gray-300">{num.stats?.max?.toFixed(2)}</span></div>
                    <div>Q1-Q3: <span className="font-medium text-gray-700 dark:text-gray-300">{num.stats?.q25?.toFixed(2)}-{num.stats?.q75?.toFixed(2)}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Categorical Analysis */}
      {eda.categorical_analysis?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <ListFilter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Categorical Analysis</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Top categories distribution</p>
            </div>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-6">
            {eda.categorical_analysis.map((cat, index) => {
              const chartData = Object.entries(cat.top_categories || {})
                .slice(0, 10)
                .map(([name, value]) => ({
                  name: String(name).substring(0, 20),
                  value,
                  percentage: cat.percentages?.[name] || 0
                }));

              return (
                <div key={index} className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    {cat.column}{' '}
                    <span className="text-xs text-gray-500 font-normal">({cat.unique_count} unique)</span>
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" fontSize={10} tick={{ fill: '#9ca3af' }} />
                      <YAxis type="category" dataKey="name" fontSize={10} width={80} tick={{ fill: '#9ca3af' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="value" fill={COLORS[index % COLORS.length]} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Correlation Analysis */}
      {eda.correlation_analysis?.strong_correlations?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Correlation Analysis</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Strong relationships between columns</p>
            </div>
          </div>

          <div className="p-5 space-y-2">
            {eda.correlation_analysis.strong_correlations.map((corr, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {corr.col1} <span className="text-gray-400">↔</span> {corr.col2}
                </span>
                <span
                  className={`font-semibold text-sm px-2.5 py-1 rounded-full ${
                    Math.abs(corr.correlation) > 0.7
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                  }`}
                >
                  {corr.correlation.toFixed(3)} · {corr.strength} {corr.direction}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outlier Analysis */}
      {eda.outlier_analysis?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Outlier Analysis</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Detected anomalies using IQR method</p>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {eda.outlier_analysis.map((outlier, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900 dark:text-white">{outlier.column}</span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {outlier.outlier_count} outliers ({outlier.outlier_percentage}%)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <div>Q1: <span className="font-medium text-gray-700 dark:text-gray-300">{outlier.q1?.toFixed(2)}</span></div>
                  <div>Q3: <span className="font-medium text-gray-700 dark:text-gray-300">{outlier.q3?.toFixed(2)}</span></div>
                  <div>Lower: <span className="font-medium text-gray-700 dark:text-gray-300">{outlier.lower_bound?.toFixed(2)}</span></div>
                  <div>Upper: <span className="font-medium text-gray-700 dark:text-gray-300">{outlier.upper_bound?.toFixed(2)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Analysis */}
      {eda.time_analysis && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Time Analysis</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">{eda.time_analysis.column}</span>
                {' · '}
                {eda.time_analysis.min_date} → {eda.time_analysis.max_date}
              </p>
            </div>
          </div>

          {eda.time_analysis.monthly_distribution &&
            Object.keys(eda.time_analysis.monthly_distribution).length > 0 && (
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Monthly Distribution
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={Object.entries(eda.time_analysis.monthly_distribution).map(([month, count]) => ({
                      month: `Month ${month}`,
                      count
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" fontSize={10} tick={{ fill: '#9ca3af' }} />
                    <YAxis fontSize={10} tick={{ fill: '#9ca3af' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default EDA;