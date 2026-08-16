import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { 
  Database, Download, Stethoscope, TrendingUp, FileText, 
  Rows3, Columns3, HeartPulse, AlertTriangle, Wand2, Bot,
  ShieldCheck, MessageSquare
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import PageHeader from '../components/PageHeader';
import QuickActionCard from '../components/QuickActionCard';

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

  const quickActions = [
    {
      icon: Wand2,
      title: 'Clean Data',
      description: 'Review and fix detected data quality issues',
      onClick: () => navigate(`/datasets/${id}/cleaning`),
      color: 'green'
    },
    {
      icon: TrendingUp,
      title: 'Explore EDA',
      description: 'Understand distributions, relationships and trends',
      onClick: () => navigate(`/datasets/${id}/eda`),
      color: 'blue'
    },
    {
      icon: ShieldCheck,
      title: 'Data Quality',
      description: 'View detected issues and health score',
      onClick: () => navigate(`/datasets/${id}/doctor`),
      color: 'orange'
    },
    {
      icon: Bot,
      title: 'AI Insights',
      description: 'Get AI-powered analysis and recommendations',
      onClick: () => navigate(`/datasets/${id}/insights`),
      color: 'purple'
    },
    {
      icon: MessageSquare,
      title: 'Data Chat',
      description: 'Ask questions about your data in natural language',
      onClick: () => navigate(`/datasets/${id}/chat`),
      color: 'indigo'
    },
    {
      icon: FileText,
      title: 'Generate Report',
      description: 'Create a professional PDF report',
      onClick: () => navigate(`/datasets/${id}/reports`),
      color: 'red'
    },
  ];

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Datasets', to: '/datasets' },
          { label: dataset.filename },
          { label: 'Overview' }
        ]}
      />

      <PageHeader
        icon={Database}
        title={dataset.filename}
        description={`Uploaded on ${new Date(dataset.created_at).toLocaleDateString()}`}
        actions={
          <>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloading ? 'Downloading...' : 'Download'}
            </button>
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          What would you like to do?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, idx) => (
            <QuickActionCard key={idx} {...action} />
          ))}
        </div>
      </div>

      {/* Data Preview */}
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
              {dataset.data_preview?.slice(0, 10).map((row, index) => (
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