import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../App';
import {
  Bot,
  TrendingUp,
  Link2,
  Lightbulb,
  Sparkles,
  Activity,
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Target,
  Star,
  Award,
  BarChart3
} from 'lucide-react';
import LoadingState from '../components/LoadingState';

// Backend API URL from environment variable
const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AIInsights = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);

  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [error, setError] = useState('');

  const fetchInsights = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        const response = await fetch(
          `${API_URL}/api/datasets/${id}/insights`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed: ${response.status}`);
        }

        const data = await response.json();
        setInsights(data);
      } catch (error) {
        console.error('Failed to fetch insights:', error);
        setError('Failed to load insights');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, token]
  );

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const toggleSection = (key) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return <LoadingState message="Generating AI insights..." />;
  }

  const importanceStyles = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800',
    medium:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800'
  };

  const importanceIcons = {
    high: Star,
    medium: Award,
    low: Target
  };

  const hasContent =
    insights?.ai_insights ||
    insights?.key_findings?.length > 0 ||
    insights?.relationships?.length > 0;

  const SectionHeader = ({
    icon,
    title,
    subtitle,
    color,
    sectionKey,
    count,
    children
  }) => {
    const Icon = icon;
    const isCollapsed = collapsedSections[sectionKey];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>

            <div className="text-left">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {count && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {count}
              </span>
            )}

            {isCollapsed ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>

        {!isCollapsed && children}
      </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 via-purple-800 to-indigo-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-fuchsia-500/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>

        <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-400/15 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/30 flex-shrink-0">
              <Bot className="w-7 h-7 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-fuchsia-300" />

                <span className="text-fuchsia-200 text-sm font-medium">
                  AI Powered Analysis
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                AI Business Insights
              </h1>

              <p className="mt-1.5 text-purple-200 text-sm max-w-lg">
                Intelligent analysis, key findings and hidden relationships
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchInsights(true)}
            disabled={refreshing}
            className="btn-press inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />

            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 animate-slide-down">
          <Activity className="w-5 h-5" />
          {error}
        </div>
      )}

      {!hasContent ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 py-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mb-4">
            <Bot className="w-8 h-8 text-purple-500" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            No insights available yet
          </h3>

          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Insights will appear here once the analysis is complete.
          </p>
        </div>
      ) : (
        <>
          {/* AI Generated Insights */}
          {insights?.ai_insights && (
            <SectionHeader
              icon={Bot}
              title="AI-Generated Insights"
              subtitle="Comprehensive analysis by AI"
              color="from-purple-500 to-indigo-600"
              sectionKey="ai_insights"
            >
              <div className="p-6">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-purple-100 dark:border-purple-800/40">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {insights.ai_insights}
                  </p>
                </div>
              </div>
            </SectionHeader>
          )}

          {/* Key Findings */}
          {insights?.key_findings?.length > 0 && (
            <SectionHeader
              icon={Lightbulb}
              title="Key Findings"
              subtitle={`${insights.key_findings.length} important discoveries`}
              color="from-amber-500 to-orange-600"
              sectionKey="key_findings"
              count={insights.key_findings.length}
            >
              <div className="p-5 space-y-3">
                {insights.key_findings.map((finding, index) => {
                  const ImportanceIcon =
                    importanceIcons[finding.importance] || Target;

                  return (
                    <div
                      key={index}
                      className="stagger-item group flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-700/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      style={{
                        animationDelay: `${index * 0.06}s`
                      }}
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white font-medium leading-relaxed">
                          {finding.finding}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                              importanceStyles[finding.importance] ||
                              importanceStyles.medium
                            }`}
                          >
                            <ImportanceIcon className="w-3 h-3" />

                            {finding.importance || 'medium'} importance
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionHeader>
          )}

          {/* Key Relationships */}
          {insights?.relationships?.length > 0 && (
            <SectionHeader
              icon={Link2}
              title="Key Relationships"
              subtitle="Correlations found in your data"
              color="from-indigo-500 to-blue-600"
              sectionKey="relationships"
              count={insights.relationships.length}
            >
              <div className="p-5 space-y-3">
                {insights.relationships.map((rel, index) => (
                  <div
                    key={index}
                    className="stagger-item group p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    style={{
                      animationDelay: `${index * 0.06}s`
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-gray-900 dark:text-white font-medium leading-relaxed flex-1">
                        {rel.finding}
                      </p>

                      {rel.correlation !== undefined && (
                        <div className="flex-shrink-0 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-semibold">
                            <Zap className="w-3.5 h-3.5" />

                            {rel.correlation?.toFixed(3)}
                          </span>

                          <p className="text-[10px] text-gray-400 mt-1">
                            correlation
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionHeader>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Lightbulb,
                label: 'Key Findings',
                value: insights?.key_findings?.length || 0,
                color: 'text-amber-500'
              },
              {
                icon: Link2,
                label: 'Relationships',
                value: insights?.relationships?.length || 0,
                color: 'text-indigo-500'
              },
              {
                icon: BarChart3,
                label: 'Data Points',
                value: insights?.data_points || 'N/A',
                color: 'text-emerald-500'
              }
            ].map((item, i) => {
              const Icon = item.icon;

              return (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3"
                >
                  <Icon className={`w-6 h-6 ${item.color}`} />

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.label}
                    </p>

                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AIInsights;