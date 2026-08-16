import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Stethoscope, Bot, Wand2, AlertCircle, CheckCircle2, RefreshCw, Info } from 'lucide-react';

const DataDoctor = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [issues, setIssues] = useState([]);
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [diagnosing, setDiagnosing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id && token) {
      fetchIssues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const fetchIssues = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:8000/api/datasets/${id}/issues`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Failed to fetch issues: ${response.status}`);
      const data = await response.json();
      setIssues(data.issues || []);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      setError('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const runDiagnosis = async () => {
    setDiagnosing(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:8000/api/datasets/${id}/diagnose`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Diagnosis failed: ${response.status}`);
      const data = await response.json();
      setDiagnosis(data);
    } catch (error) {
      console.error('Diagnosis failed:', error);
      setError('AI diagnosis failed');
    } finally {
      setDiagnosing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-500">Loading issues...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Stethoscope className="w-6 h-6 mr-2 text-blue-600" />
            Data Doctor
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Diagnose data quality issues</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={runDiagnosis}
            disabled={diagnosing}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Bot className="w-4 h-4 mr-2" />
            {diagnosing ? 'Analyzing...' : 'AI Diagnosis'}
          </button>
          <button
            onClick={() => navigate(`/datasets/${id}/cleaning`)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Clean Data
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {diagnosis && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center mb-4">
            <Bot className="w-6 h-6 mr-3 text-purple-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Diagnosis</h2>
              <p className="text-xs text-gray-500">
                {diagnosis.source === 'ai' ? 'Powered by DeepSeek AI' : 'Rule-based analysis'}
              </p>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{diagnosis.diagnosis}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Detected Issues ({issues.length})
          </h2>
          <button
            onClick={fetchIssues}
            className="inline-flex items-center px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>
        
        {issues.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-green-50 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No issues detected</h3>
            <p className="text-gray-500">Your data looks clean.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      issue.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      issue.severity === 'low' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {issue.severity?.toUpperCase()}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {issue.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{issue.issue}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {issue.affected_rows} rows affected ({issue.percentage_affected}%)
                </p>
                {issue.recommended_action && (
                  <div className="mt-3 bg-gray-50 dark:bg-gray-700 rounded p-3 flex items-start">
                    <Info className="w-4 h-4 mr-2 text-blue-500 mt-0.5" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Recommended:</strong> {issue.recommended_action}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataDoctor;