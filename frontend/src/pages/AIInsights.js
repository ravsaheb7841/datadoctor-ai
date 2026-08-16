import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../App';
import { Bot, TrendingUp, Link2, Lightbulb, Database } from 'lucide-react';

const AIInsights = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchInsights = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/datasets/${id}/insights`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-500">Loading insights...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Bot className="w-6 h-6 mr-2 text-purple-600" />
          AI Business Insights
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Intelligent analysis and recommendations</p>
      </div>

      {insights?.ai_insights && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center mb-4">
            <Bot className="w-6 h-6 mr-3 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Generated Insights</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{insights.ai_insights}</p>
        </div>
      )}

      {insights?.key_findings?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
            Key Findings
          </h2>
          <div className="space-y-3">
            {insights.key_findings.map((finding, index) => (
              <div key={index} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <TrendingUp className="w-5 h-5 mr-3 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-gray-900 dark:text-white">{finding.finding}</p>
                  <span className="text-xs text-gray-500 capitalize">{finding.importance} importance</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights?.relationships?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <Link2 className="w-5 h-5 mr-2 text-indigo-600" />
            Key Relationships
          </h2>
          <div className="space-y-3">
            {insights.relationships.map((rel, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-900 dark:text-white">{rel.finding}</p>
                <span className="text-xs text-gray-500">Correlation: {rel.correlation?.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;