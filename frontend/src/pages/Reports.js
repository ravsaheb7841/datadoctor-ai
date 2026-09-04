import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../App';
import {
  FileText, Download, FileSpreadsheet, FileJson, FileDown,
  Package, CheckCircle2, FileCheck, Lock, X, AlertCircle,
  Activity, Copy, ExternalLink, RefreshCw, Clock, ShieldCheck,
  Zap, TrendingUp, Database, Layers
} from 'lucide-react';

const API_URL = 'https://datadoctor-ai.onrender.com';

const Reports = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [hasCleaned, setHasCleaned] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState('');
  const [downloadingFile, setDownloadingFile] = useState('');
  const [cleaningLogCount, setCleaningLogCount] = useState(0);

  const checkCleaningStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/datasets/${id}/cleaning-log`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHasCleaned(data.total > 0);
        setCleaningLogCount(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to check cleaning status:', error);
    }
  }, [id, token]);

  useEffect(() => {
    checkCleaningStatus();
  }, [checkCleaningStatus]);

  const showToast = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }, []);

  const downloadFile = async (url, filename, fileType) => {
    setLoading(true);
    setDownloadingFile(fileType);
    setError('');
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      showToast(`${filename} downloaded successfully`);
    } catch (err) {
      setError(`Failed to download: ${err.message}`);
    } finally {
      setLoading(false);
      setDownloadingFile('');
    }
  };

  const handleGenerateReport = async (reportType) => {
    setGenerating(true);
    setGeneratingType(reportType);
    setError('');
    try {
      const response = await fetch(
        `${API_URL}/api/datasets/${id}/report?format=pdf&report_type=${reportType}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Report generation failed');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `datadoctor_${reportType}_cleaning.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=(.+)/);
        if (match) filename = match[1];
      }
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      setShowModal(false);
      showToast('PDF report downloaded successfully');
    } catch (err) {
      setError(`Failed to generate report: ${err.message}`);
    } finally {
      setGenerating(false);
      setGeneratingType('');
    }
  };

  const downloadCleaningLog = async () => {
    setLoading(true);
    setDownloadingFile('log');
    try {
      const response = await fetch(`${API_URL}/api/datasets/${id}/cleaning-log`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch cleaning log');
      const data = await response.json();
      const operations = data.operations || [];
      let csvContent = 'Timestamp,Operation,Column,Method,Rows Affected\n';
      operations.forEach(op => {
        csvContent += `"${op.timestamp || ''}","${op.operation || ''}","${op.column || ''}","${op.method || ''}","${op.rows_affected || ''}"\n`;
      });
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cleaning_log_${id}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('Cleaning log downloaded');
    } catch (err) {
      setError('Failed to download cleaning log');
    } finally {
      setLoading(false);
      setDownloadingFile('');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-700 via-red-800 to-orange-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-400/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-300/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-lg shadow-rose-500/30 flex-shrink-0">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-rose-200" />
                <span className="text-rose-200 text-sm font-medium">Export Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reports & Downloads</h1>
              <p className="mt-1.5 text-rose-100 text-sm">Generate reports and export your cleaned data</p>
            </div>
          </div>
          {/* Status Badge */}
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5">
            {hasCleaned ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span className="text-emerald-200 text-sm font-medium">{cleaningLogCount} operations applied</span>
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 text-amber-300" />
                <span className="text-amber-200 text-sm font-medium">No cleaning yet</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {message && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-50 dark:bg-emerald-900/80 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-200 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-slide-down">
          <CheckCircle2 className="w-5 h-5" />
          {message}
          <button onClick={() => setMessage('')} className="ml-2 p-1 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-2 animate-slide-down">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto p-1 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Download Cleaned Data */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <Download className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Download Cleaned Data</h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Export your cleaned dataset in the format you need</p>

          <div className="space-y-3">
            {[
              { icon: FileSpreadsheet, label: 'Download as CSV', color: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-500/20', type: 'csv', action: () => downloadFile(`${API_URL}/api/datasets/${id}/download`, `cleaned_dataset_${id}.csv`, 'csv') },
              { icon: FileDown, label: 'Download as Excel', color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/20', type: 'xlsx', action: () => downloadFile(`${API_URL}/api/datasets/${id}/download/xlsx`, `cleaned_dataset_${id}.xlsx`, 'xlsx') },
              { icon: FileJson, label: 'Download as JSON', color: 'from-purple-600 to-violet-600', shadow: 'shadow-purple-500/20', type: 'json', action: () => downloadFile(`${API_URL}/api/datasets/${id}/download/json`, `cleaned_dataset_${id}.json`, 'json') },
            ].map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.type}
                  onClick={btn.action}
                  disabled={loading}
                  className={`btn-press w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${btn.color} text-white rounded-xl font-medium shadow-lg ${btn.shadow} hover:shadow-xl hover:scale-[1.01] disabled:opacity-50 transition-all`}
                >
                  {downloadingFile === btn.type ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  {btn.label}
                </button>
              );
            })}
          </div>

          {/* Cleaning Log Download */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={downloadCleaningLog}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all disabled:opacity-50"
            >
              <Layers className="w-4 h-4" />
              Download Cleaning Log
            </button>
          </div>
        </div>

        {/* Generate Report */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generate Report</h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Create a professional PDF data quality report</p>

          <button
            onClick={() => { checkCleaningStatus(); setShowModal(true); }}
            disabled={loading}
            className="btn-press mt-auto w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-xl font-semibold shadow-lg shadow-rose-500/25 hover:shadow-xl hover:scale-[1.01] disabled:opacity-50 transition-all"
          >
            <FileText className="w-4 h-4" />
            Generate PDF Report
            <ExternalLink className="w-4 h-4 opacity-70" />
          </button>
        </div>
      </div>

      {/* What's Included */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-md">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">What's Included</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Everything packed into your export</p>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-3 gap-4">
          {[
            { title: 'Data Quality Report', icon: TrendingUp, items: ['Health score and quality summary', 'Issue detection and resolution', 'Column profiling', 'Before vs After comparison'] },
            { title: 'Cleaned Dataset', icon: Database, items: ['All applied cleaning operations', 'Missing values handled', 'Duplicates removed', 'Corrected data types'] },
            { title: 'Cleaning Log', icon: Layers, items: ['Operation history', 'Affected columns', 'Timestamps', 'Before/after statistics'] },
          ].map((block) => {
            const Icon = block.icon;
            return (
              <div key={block.title} className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-5 border border-gray-100 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-600 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{block.title}</h3>
                </div>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                  {block.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600" />
                Generate PDF Report
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Choose which version of the report you want to generate.</p>

            <div className="space-y-3">
              {/* Before Cleaning */}
              <button
                onClick={() => handleGenerateReport('before')}
                disabled={generating}
                className="w-full flex items-start p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left disabled:opacity-50"
              >
                <FileText className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Before Cleaning</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Initial data quality report showing the dataset before any cleaning.</p>
                </div>
                {generatingType === 'before' && (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </button>

              {/* After Cleaning */}
              <button
                onClick={() => hasCleaned && handleGenerateReport('after')}
                disabled={!hasCleaned || generating}
                className={`w-full flex items-start p-4 border rounded-xl transition-all text-left ${
                  hasCleaned
                    ? 'border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                }`}
              >
                {hasCleaned ? (
                  <FileCheck className="w-6 h-6 mr-3 text-emerald-600 flex-shrink-0" />
                ) : (
                  <Lock className="w-6 h-6 mr-3 text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    After Cleaning
                    {!hasCleaned && (
                      <span className="ml-2 text-xs text-gray-400 flex items-center">
                        <Lock className="w-3 h-3 mr-1" /> Locked
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Final report including cleaning results and before/after comparison.</p>
                  {!hasCleaned && (
                    <p className="text-xs text-gray-400 mt-1">Perform at least one cleaning operation to unlock this report.</p>
                  )}
                </div>
                {generatingType === 'after' && (
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </button>
            </div>

            {/* Generating indicator */}
            {generating && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                Generating {generatingType} report...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;