import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../App';
import { FileText, Download, FileSpreadsheet, FileJson, FileDown, ScrollText, Package, CheckCircle2 } from 'lucide-react';

const Reports = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const downloadFile = async (url, filename) => {
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
      setMessage(`${filename} downloaded successfully`);
      setError('');
    } catch (err) {
      setError(`Failed to download: ${err.message}`);
      setMessage('');
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
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
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
          <p className="text-gray-500 mb-6">Download a comprehensive data quality report</p>
          <div className="space-y-3">
            <button
              onClick={() => downloadFile(`http://localhost:8000/api/datasets/${id}/report?format=pdf`, `report_${id}.pdf`)}
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF Report
            </button>
            <button
              onClick={() => downloadFile(`http://localhost:8000/api/datasets/${id}/report?format=csv`, `report_${id}.csv`)}
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              CSV Report
            </button>
            <button
              onClick={() => downloadFile(`http://localhost:8000/api/datasets/${id}/report?format=json`, `report_${id}.json`)}
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              <FileJson className="w-4 h-4 mr-2" />
              JSON Report
            </button>
          </div>
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
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Health score breakdown</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Issue summary</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Column profiling</li>
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Cleaned Dataset</h3>
            <ul className="text-sm text-gray-500 space-y-1">
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> All cleaning applied</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Missing values handled</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Duplicates removed</li>
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Cleaning Log</h3>
            <ul className="text-sm text-gray-500 space-y-1">
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Operation history</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Timestamps</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Before/after stats</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;