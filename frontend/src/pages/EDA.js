import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Database, TrendingUp, AlertTriangle, Key, Calendar, ListFilter, RefreshCw } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="text-gray-500">Generating EDA...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button onClick={fetchEDA} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  if (!eda) {
    return <div className="text-center py-12">No EDA data available</div>;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57'];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
          Exploratory Data Analysis
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Semantic-type-aware data visualization</p>
      </div>

      {/* Dataset Summary */}
      {eda.summary && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <Database className="w-5 h-5 mr-2 text-blue-600" />
            Dataset Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-500">Rows</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{eda.summary.rows?.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-500">Columns</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{eda.summary.columns}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-500">Missing Values</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {eda.summary.missing_values} ({eda.summary.missing_percentage}%)
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-500">Duplicate Rows</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{eda.summary.duplicate_rows}</div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            {eda.summary.numeric_columns > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Numeric: {eda.summary.numeric_columns}
              </span>
            )}
            {eda.summary.categorical_columns > 0 && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Categorical: {eda.summary.categorical_columns}
              </span>
            )}
            {eda.summary.datetime_columns > 0 && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                Datetime: {eda.summary.datetime_columns}
              </span>
            )}
            {eda.summary.identifier_columns > 0 && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                Identifiers: {eda.summary.identifier_columns}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Identifier Summary */}
      {eda.identifier_summary && eda.identifier_summary.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <Key className="w-5 h-5 mr-2 text-orange-600" />
            Identifier Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                  <th className="pb-2">Column</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Unique Values</th>
                  <th className="pb-2">Missing</th>
                </tr>
              </thead>
              <tbody>
                {eda.identifier_summary.map((idInfo, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2 font-medium text-gray-900 dark:text-white">{idInfo.column}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-300">{idInfo.dtype}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-300">{idInfo.unique_count}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-300">{idInfo.missing_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Numerical Analysis */}
      {eda.numerical_analysis && eda.numerical_analysis.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Numerical Distributions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {eda.numerical_analysis.map((num, index) => {
              if (num.semantic_type === 'ordinal') {
                return (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {num.column} <span className="text-xs text-pink-500">(Ordinal)</span>
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div>Range: {num.min} to {num.max}</div>
                      <div>Unique values: {num.unique_count}</div>
                    </div>
                  </div>
                );
              }
              
              const chartData = num.histogram.bins.slice(0, -1).map((bin, i) => ({
                range: `${Math.round(bin)}`,
                count: num.histogram.counts[i]
              }));
              
              return (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{num.column}</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="count" fill={COLORS[index % COLORS.length]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-500">
                    <div>Mean: {num.stats.mean?.toFixed(2)}</div>
                    <div>Median: {num.stats.median?.toFixed(2)}</div>
                    <div>Std: {num.stats.std?.toFixed(2)}</div>
                    <div>Min: {num.stats.min?.toFixed(2)}</div>
                    <div>Max: {num.stats.max?.toFixed(2)}</div>
                    <div>Q1-Q3: {num.stats.q25?.toFixed(2)}-{num.stats.q75?.toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Categorical Analysis */}
      {eda.categorical_analysis && eda.categorical_analysis.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <ListFilter className="w-5 h-5 mr-2 text-green-600" />
            Categorical Analysis
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {eda.categorical_analysis.map((cat, index) => {
              const chartData = Object.entries(cat.top_categories).slice(0, 10).map(([name, value]) => ({
                name: String(name).substring(0, 20),
                value,
                percentage: cat.percentages?.[name] || 0
              }));
              
              return (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {cat.column} <span className="text-xs text-gray-500">({cat.unique_count} unique)</span>
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" fontSize={10} />
                      <YAxis type="category" dataKey="name" fontSize={10} width={80} />
                      <Tooltip />
                      <Bar dataKey="value" fill={COLORS[index % COLORS.length]} />
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
            Correlation Analysis
          </h2>
          <div className="space-y-3">
            {eda.correlation_analysis.strong_correlations.map((corr, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300">
                  {corr.col1} and {corr.col2}
                </span>
                <span className={`font-medium ${
                  Math.abs(corr.correlation) > 0.7 ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {corr.correlation.toFixed(3)} ({corr.strength} {corr.direction})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outlier Analysis */}
      {eda.outlier_analysis && eda.outlier_analysis.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
            Outlier Analysis
          </h2>
          <div className="space-y-3">
            {eda.outlier_analysis.map((outlier, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">{outlier.column}</span>
                  <span className="text-sm text-red-600">
                    {outlier.outlier_count} outliers ({outlier.outlier_percentage}%)
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2 text-xs text-gray-500">
                  <div>Q1: {outlier.q1?.toFixed(2)}</div>
                  <div>Q3: {outlier.q3?.toFixed(2)}</div>
                  <div>Lower: {outlier.lower_bound?.toFixed(2)}</div>
                  <div>Upper: {outlier.upper_bound?.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Analysis */}
      {eda.time_analysis && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
            Time Analysis
          </h2>
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-900 dark:text-white">{eda.time_analysis.column}</span>
            <span className="ml-2">
              Range: {eda.time_analysis.min_date} to {eda.time_analysis.max_date}
            </span>
          </div>
          
          {eda.time_analysis.monthly_distribution && Object.keys(eda.time_analysis.monthly_distribution).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Monthly Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={Object.entries(eda.time_analysis.monthly_distribution).map(([month, count]) => ({
                  month: `Month ${month}`,
                  count
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
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