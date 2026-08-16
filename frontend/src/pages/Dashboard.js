import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Database, Rows3, HeartPulse, AlertTriangle, Wand2, Plus } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [datasets, setDatasets] = useState([]);
  const [stats, setStats] = useState({
    totalDatasets: 0,
    totalRows: 0,
    avgHealth: 0,
    totalIssues: 0,
    cleanedDatasets: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/datasets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch datasets');
      
      const data = await response.json();
      const datasetsList = data.datasets || [];
      setDatasets(datasetsList);
      
      const total = datasetsList.length;
      const totalRows = datasetsList.reduce((sum, ds) => sum + (ds.rows || 0), 0);
      const avgHealth = total > 0 
        ? Math.round(datasetsList.reduce((sum, ds) => sum + (ds.health_score || 0), 0) / total) 
        : 0;
      const totalIssues = datasetsList.reduce((sum, ds) => sum + (ds.issue_count || 0), 0);
      
      setStats({
        totalDatasets: total,
        totalRows,
        avgHealth,
        totalIssues,
        cleanedDatasets: datasetsList.filter(ds => (ds.version || 1) > 1).length
      });
    } catch (error) {
      console.error('Failed to fetch datasets:', error);
      setError('Failed to load datasets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading dashboard..." />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Your data quality at a glance</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">{error}</div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard
          icon={Database}
          label="Total Datasets"
          value={stats.totalDatasets}
          color="blue"
        />
        <MetricCard
          icon={Rows3}
          label="Rows Analyzed"
          value={stats.totalRows.toLocaleString()}
          color="indigo"
        />
        <MetricCard
          icon={HeartPulse}
          label="Avg Health Score"
          value={`${stats.avgHealth}/100`}
          color="green"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Issues Detected"
          value={stats.totalIssues}
          color="yellow"
        />
        <MetricCard
          icon={Wand2}
          label="Cleaned Datasets"
          value={stats.cleanedDatasets}
          color="purple"
        />
      </div>

      {/* Recent Datasets */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Datasets</h2>
          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload New
          </button>
        </div>

        {datasets.length === 0 ? (
          <EmptyState
            icon={Database}
            title="No datasets yet"
            description="Upload your first dataset to get started with data analysis and cleaning."
            actionLabel="Upload Dataset"
            onAction={() => navigate('/upload')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-3">Dataset</th>
                  <th className="px-6 py-3">Rows</th>
                  <th className="px-6 py-3">Health</th>
                  <th className="px-6 py-3">Issues</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {datasets.slice(0, 10).map((dataset) => (
                  <tr
                    key={dataset._id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/datasets/${dataset._id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{dataset.filename}</div>
                      <div className="text-xs text-gray-500">
                        {dataset.created_at ? new Date(dataset.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {(dataset.rows || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (dataset.health_score || 0) >= 80 ? 'bg-green-100 text-green-800' :
                        (dataset.health_score || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {dataset.health_score || 'N/A'}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{dataset.issue_count || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        dataset.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {dataset.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;