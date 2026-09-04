import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import {
  Stethoscope, Bot, Wand2, AlertCircle, CheckCircle2,
  RefreshCw, Activity, ArrowRight, Copy, Check, Filter,
  ArrowUpRight, ShieldCheck, TrendingUp, TrendingDown, Layers
} from 'lucide-react';
import LoadingState from '../components/LoadingState';

const API_URL = 'https://datadoctor-ai.onrender.com';

const DataDoctor = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [issues, setIssues] = useState([]);
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [diagnosing, setDiagnosing] = useState(false);
  const [healthScore, setHealthScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [copiedDiagnosis, setCopiedDiagnosis] = useState(false);
  const [strengths, setStrengths] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [healthDetails, setHealthDetails] = useState({});
  const navigate = useNavigate();
  const scoreTimerRef = useRef(null);

  useEffect(() => {
    if (id && token) {
      fetchIssues();
      fetchHealthScore();
    }
    return () => {
      if (scoreTimerRef.current) clearInterval(scoreTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  useEffect(() => {
    if (healthScore > 0) {
      let current = 0;
      scoreTimerRef.current = setInterval(() => {
        current += 1;
        if (current >= healthScore) {
          clearInterval(scoreTimerRef.current);
        }
        setDisplayScore(Math.min(current, healthScore));
      }, 15);
    }
    return () => {
      if (scoreTimerRef.current) clearInterval(scoreTimerRef.current);
    };
  }, [healthScore]);

  const fetchHealthScore = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/datasets/${id}/health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHealthScore(data.score || 0);
        setStrengths(data.strengths || []);
        setWarnings(data.warnings || []);
        setHealthDetails(data.details || data.scores || {});
      }
    } catch (error) {
      console.error('Failed to fetch health score:', error);
    }
  }, [id, token]);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/datasets/${id}/issues`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      const data = await response.json();
      setIssues(data.issues || []);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      setError('Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  const runDiagnosis = async () => {
    setDiagnosing(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/datasets/${id}/diagnose`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      const data = await response.json();
      setDiagnosis(data);
    } catch (error) {
      setError('AI diagnosis failed');
    } finally {
      setDiagnosing(false);
    }
  };

  const copyDiagnosis = () => {
    if (diagnosis?.diagnosis) {
      navigator.clipboard.writeText(diagnosis.diagnosis);
      setCopiedDiagnosis(true);
      setTimeout(() => setCopiedDiagnosis(false), 2000);
    }
  };

  const filteredIssues = issues.filter(i => severityFilter === 'all' || i.severity === severityFilter);

  if (loading) return <LoadingState message="Loading diagnosis..." />;

  const getHealthStyle = (score) => {
    if (score >= 80) return { text: 'text-emerald-600', ring: '#10B981', bg: 'from-emerald-500 to-teal-600', label: 'Excellent', desc: 'Your data is in great shape.' };
    if (score >= 60) return { text: 'text-amber-600', ring: '#F59E0B', bg: 'from-amber-500 to-orange-600', label: 'Fair', desc: 'Some issues detected. Cleaning recommended.' };
    return { text: 'text-red-600', ring: '#EF4444', bg: 'from-red-500 to-rose-600', label: 'Needs Attention', desc: 'Multiple issues found. Immediate cleaning advised.' };
  };

  const health = getHealthStyle(displayScore);

  const severityStyles = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  };

  const severityCounts = {
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-300" />
                <span className="text-blue-300 text-sm font-medium">Data Quality Diagnosis</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Data Doctor</h1>
              <p className="mt-1.5 text-slate-300 text-sm">Detect issues and get AI-powered recommendations</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={runDiagnosis}
              disabled={diagnosing}
              className="btn-press group inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-[1.02] disabled:opacity-60 transition-all"
            >
              {diagnosing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5" />
                  AI Diagnosis
                </>
              )}
            </button>
            <button
              onClick={() => navigate(`/datasets/${id}/cleaning`)}
              className="btn-press group inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-800 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <Wand2 className="w-5 h-5" />
              Clean Data
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 animate-slide-down">
          <AlertCircle className="w-5 h-5" />
          {error}
          <button onClick={() => setError('')} className="ml-auto hover:opacity-70">x</button>
        </div>
      )}

      {/* Health Score + Strengths/Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Ring */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 flex flex-col items-center justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-40 h-40" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-700" />
              <circle
                cx="50" cy="50" r="42" fill="none" stroke={health.ring} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(displayScore / 100) * 264} 264`} transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dasharray 0.4s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${health.text}`}>{displayScore}</span>
              <span className="text-xs text-gray-400 font-medium">/ 100</span>
            </div>
          </div>
          <p className={`text-xl font-bold mt-4 ${health.text}`}>{health.label}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">{health.desc}</p>
        </div>

        {/* Strengths */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Strengths</h3>
          </div>
          {strengths.length > 0 ? (
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No strengths detected yet.</p>
          )}
        </div>

        {/* Warnings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Warnings</h3>
          </div>
          {warnings.length > 0 ? (
            <ul className="space-y-2">
              {warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  {w}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No warnings detected.</p>
          )}
        </div>
      </div>

      {/* AI Diagnosis */}
      {diagnosis && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Diagnosis</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {diagnosis.source === 'ai' ? 'Powered by AI' : 'Rule-based analysis'}
                </p>
              </div>
            </div>
            <button
              onClick={copyDiagnosis}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy diagnosis"
            >
              {copiedDiagnosis ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {diagnosis.diagnosis}
            </p>
          </div>
        </div>
      )}

      {/* Issues */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detected Issues</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {filteredIssues.length} of {issues.length} issues shown
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All ({issues.length})</option>
              <option value="critical">Critical ({severityCounts.critical})</option>
              <option value="high">High ({severityCounts.high})</option>
              <option value="medium">Medium ({severityCounts.medium})</option>
              <option value="low">Low ({severityCounts.low})</option>
            </select>
            <button
              onClick={fetchIssues}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="py-16 text-center animate-scale-in">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {issues.length === 0 ? 'No issues detected' : 'No matching issues'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {issues.length === 0 ? 'Your data looks clean and healthy.' : 'Try changing the filter.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredIssues.map((issue, index) => (
              <div
                key={index}
                className="stagger-item group p-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${severityStyles[issue.severity] || severityStyles.low}`}>
                        {issue.severity?.toUpperCase() || 'UNKNOWN'}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {issue.type?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{issue.issue}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {issue.affected_rows} rows affected ({issue.percentage_affected}%)
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/datasets/${id}/cleaning`)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    title="Fix this issue"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataDoctor;