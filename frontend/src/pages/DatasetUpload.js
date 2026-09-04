import React, { useState, useCallback, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import {
  Upload, FileSpreadsheet, AlertCircle, CheckCircle2,
  Target, Activity, CloudUpload, X, FileText, Clock,
  ShieldCheck, Zap, Loader2
} from 'lucide-react';

const API_URL = 'https://datadoctor-ai.onrender.com';

const DatasetUpload = () => {
  const { token } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (uploadedFile) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = '.' + uploadedFile.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      setError('Invalid file format. Please upload CSV or Excel files.');
      setFile(null);
      return;
    }
    if (uploadedFile.size > 100 * 1024 * 1024) {
      setError('File size exceeds 100MB limit.');
      setFile(null);
      return;
    }
    if (uploadedFile.size === 0) {
      setError('File is empty. Please upload a valid file.');
      setFile(null);
      return;
    }

    setFile(uploadedFile);
    setError('');
    setUploadSuccess(false);
  };

  const simulateProgress = () => {
    const steps = [10, 25, 40, 55, 70, 85, 95];
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setProgress(steps[stepIndex]);
        stepIndex++;
      } else {
        clearInterval(interval);
      }
    }, 300);
    return interval;
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError('');

    const progressInterval = simulateProgress();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/datasets/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();

      if (response.ok) {
        clearInterval(progressInterval);
        setProgress(100);
        setUploadSuccess(true);
        setTimeout(() => {
          navigate(`/datasets/${data._id}`);
        }, 800);
      } else {
        clearInterval(progressInterval);
        setError(data.detail || 'Upload failed');
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const loadDemo = async () => {
    setUploading(true);
    setError('');
    setProgress(0);

    const progressInterval = simulateProgress();
    try {
      const response = await fetch(`${API_URL}/api/datasets/demo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        clearInterval(progressInterval);
        setProgress(100);
        setUploadSuccess(true);
        setTimeout(() => {
          navigate(`/datasets/${data._id}`);
        }, 500);
      } else {
        clearInterval(progressInterval);
        setError(data.detail || 'Failed to load demo');
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'csv') return 'CSV';
    if (ext === 'xlsx' || ext === 'xls') return 'XLS';
    return 'FILE';
  };

  const getFileSizeLabel = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-300/15 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg flex-shrink-0">
            <CloudUpload className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-200" />
              <span className="text-blue-200 text-sm font-medium">Get Started</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Upload Dataset</h1>
            <p className="mt-1.5 text-blue-100 text-sm max-w-lg">Upload your CSV or Excel file to begin analysis and cleaning</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 animate-slide-down">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto p-1 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {uploadSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2 animate-slide-down">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          Upload successful! Redirecting...
        </div>
      )}

      {/* Upload Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 sm:p-8">
        <div
          className={`relative border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all duration-300 cursor-pointer ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01] shadow-lg'
              : file
              ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/30'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          {!file ? (
            <div className="animate-scale-in">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30 mb-6">
                <FileSpreadsheet className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Drag & drop your dataset here
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-1">or click to browse files</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">Supports CSV, XLSX, XLS · Max 100MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                onClick={(e) => e.stopPropagation()}
                className="btn-press inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.02] cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4" />
                Browse Files
              </label>
            </div>
          ) : (
            <div className="animate-scale-in" onClick={(e) => e.stopPropagation()}>
              {/* File Icon */}
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-6">
                {uploadSuccess ? (
                  <CheckCircle2 className="w-10 h-10 text-white" />
                ) : (
                  <FileText className="w-10 h-10 text-white" />
                )}
              </div>

              {/* File Name */}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 truncate max-w-md mx-auto">
                {file.name}
              </h3>

              {/* File Info */}
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold">
                  {getFileIcon(file.name)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {getFileSizeLabel(file.size)}
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Ready
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-press inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 transition-all"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Upload & Analyze
                    </>
                  )}
                </button>
                <button
                  onClick={() => { setFile(null); setProgress(0); }}
                  disabled={uploading}
                  className="px-5 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Choose different file
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-6 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Uploading...</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
              Analyzing your dataset...
            </p>
          </div>
        )}

        {/* Demo Section */}
        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">Don't have a file? Try with sample data</p>
          <button
            onClick={loadDemo}
            disabled={uploading}
            className="btn-press inline-flex items-center gap-2 px-6 py-2.5 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-xl font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-50 transition-all"
          >
            <Target className="w-4 h-4" />
            Try Demo Dataset
          </button>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: FileSpreadsheet, title: 'Multiple Formats', desc: 'CSV, XLSX, XLS files supported' },
          { icon: ShieldCheck, title: 'Secure Upload', desc: 'Files processed securely on server' },
          { icon: Zap, title: 'Instant Analysis', desc: 'AI diagnosis starts immediately' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="stagger-item bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DatasetUpload;