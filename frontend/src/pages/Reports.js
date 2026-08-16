import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../App';
import { 
  FileText, Download, FileSpreadsheet, FileJson, FileDown, 
  Package, CheckCircle2, FileCheck, Lock, X, AlertCircle 
} from 'lucide-react';

const Reports = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [hasCleaned, setHasCleaned] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    checkCleaningStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const checkCleaningStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/datasets/${id}/cleaning-log`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHasCleaned(data.total > 0);
      }
    } catch (error) {
      console.error('Failed to check cleaning status:', error);
    }
  };

  const showToast = (msg, type = 'success') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const downloadFile = async (url, filename) => {
    setLoading(true);
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
    }
  };

  const handleGenerateReport = async (reportType) => {
    setGenerating(true);
    setError('');
    try {
      const response = await fetch(
        `http://localhost:8000/api/datasets/${id}/report?format=pdf&report_type=${reportType}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (!response.ok) throw new Error('Report generation failed');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Get filename from Content-Disposition header
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
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <FileText className="w-6 h-6 mr-2 text-blue-600" />
          Reports and Downloads
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Generate reports and export your data</p>
      </div>

      {message && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg shadow-lg flex items-center animate-fade-in">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <Download className="w-5 h-5 mr-2 text-green-600" />
            Download Cleaned Data
          </h2>
          <p className="text-gray-500 mb-6">Download your cleaned dataset in various formats</p>
          <div className="space-y-3">
            <button
              onClick={() => downloadFile(`http://localhost:8000/api/datasets/${id}/download`, `cleaned_dataset_${id}.csv`)}
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Download as CSV
            </button>
            <button
              onClick={() => downloadFile(`http://localhost:8000/api/datasets/${id}/download/xlsx`, `cleaned_dataset_${id}.xlsx`)}
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Download as Excel
            </button>
            <button
              onClick={() => downloadFile(`http://localhost:8000/api/datasets/${id}/download/json`, `cleaned_dataset_${id}.json`)}
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <FileJson className="w-4 h-4 mr-2" />
              Download as JSON
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <FileText className="w-5 h-5 mr-2 text-red-600" />
            Generate Report
          </h2>
          <p className="text-gray-500 mb-6">Generate a comprehensive data quality report</p>
          <button
            onClick={() => {
              checkCleaningStatus();
              setShowModal(true);
            }}
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF Report
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
          <Package className="w-5 h-5 mr-2 text-gray-600" />
          What's Included
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Data Quality Report</h3>
            <ul className="text-sm text-gray-500 space-y-1">
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Health score and quality summary</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Issue detection and resolution</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Column profiling</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Before vs After comparison</li>
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Cleaned Dataset</h3>
            <ul className="text-sm text-gray-500 space-y-1">
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> All applied cleaning operations</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Missing values handled</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Duplicates removed</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Corrected data types</li>
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Cleaning Log</h3>
            <ul className="text-sm text-gray-500 space-y-1">
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Operation history</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Affected columns</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Timestamps</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Before/after statistics</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Report Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-red-600" />
                Generate PDF Report
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Choose which version of the report you want to generate.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleGenerateReport('before')}
                disabled={generating}
                className="w-full flex items-start p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
              >
                <FileText className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Before Cleaning</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Initial data quality report showing the dataset's condition before any cleaning operations.
                  </p>
                </div>
              </button>
              
              <button
                onClick={() => hasCleaned && handleGenerateReport('after')}
                disabled={!hasCleaned || generating}
                className={`w-full flex items-start p-4 border rounded-lg transition-colors text-left ${
                  hasCleaned
                    ? 'border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                }`}
              >
                {hasCleaned ? (
                  <FileCheck className="w-6 h-6 mr-3 text-green-600 flex-shrink-0" />
                ) : (
                  <Lock className="w-6 h-6 mr-3 text-gray-400 flex-shrink-0" />
                )}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                    After Cleaning
                    {!hasCleaned && (
                      <span className="ml-2 text-xs text-gray-400 flex items-center">
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Final data quality report including cleaning results and before/after comparison.
                  </p>
                  {!hasCleaned && (
                    <p className="text-xs text-gray-400 mt-1">
                      Perform at least one cleaning operation to unlock this report.
                    </p>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;