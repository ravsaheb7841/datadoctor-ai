import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Database, Download, Stethoscope, TrendingUp, FileText, Rows3, Columns3, HeartPulse, AlertTriangle } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-500">Loading dataset...</span>
        </div>
      </div>
    );
  }

  if (!dataset) {
    return <div className="text-center py-12">Dataset not found</div>;
  }

  const healthScore = dataset.health_score || 0;
  const healthColor = healthScore >= 80 ? 'text-green-600' : healthScore >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{dataset.filename}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Uploaded on {new Date(dataset.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? 'Downloading...' : 'Download'}
          </button>
          <button
            onClick={() => navigate(`/datasets/${id}/doctor`)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <Stethoscope className="w-4 h-4 mr-2" />
            Data Doctor
          </button>
          <button
            onClick={() => navigate(`/datasets/${id}/eda`)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            EDA
          </button>
          <button
            onClick={() => navigate(`/datasets/${id}/reports`)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Reports
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center mb-2">
            <Rows3 className="w-4 h-4 text-blue-600 mr-2" />
            <div className="text-sm text-gray-500">Rows</div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{dataset.rows?.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center mb-2">
            <Columns3 className="w-4 h-4 text-indigo-600 mr-2" />
            <div className="text-sm text-gray-500">Columns</div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{dataset.columns}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center mb-2">
            <HeartPulse className="w-4 h-4 text-green-600 mr-2" />
            <div className="text-sm text-gray-500">Health Score</div>
          </div>
          <div className={`text-2xl font-bold ${healthColor}`}>{healthScore}/100</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
            <div className="text-sm text-gray-500">Issues</div>
          </div>
          <div className="text-2xl font-bold text-orange-600">{dataset.issue_count || 0}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Preview</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-2 text-left text-sm text-gray-500">#</th>
                {dataset.column_names?.map((col) => (
                  <th key={col} className="px-4 py-2 text-left text-sm text-gray-500">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataset.data_preview?.slice(0, 20).map((row, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-2 text-sm text-gray-400">{index + 1}</td>
                  {dataset.column_names?.map((col) => (
                    <td key={col} className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                      {row[col] !== null && row[col] !== undefined ? String(row[col]) : ''}
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