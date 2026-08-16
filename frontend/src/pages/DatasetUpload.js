import React, { useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Database, Target } from 'lucide-react';

const DatasetUpload = () => {
  const { token } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
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
      return;
    }
    
    if (uploadedFile.size > 100 * 1024 * 1024) {
      setError('File size exceeds 100MB limit.');
      return;
    }
    
    setFile(uploadedFile);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:8000/api/datasets/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setProgress(100);
        setTimeout(() => {
          navigate(`/datasets/${data._id}`);
        }, 500);
      } else {
        setError(data.detail || 'Upload failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const loadDemo = async () => {
    setUploading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/datasets/demo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        navigate(`/datasets/${data._id}`);
      } else {
        setError(data.detail || 'Failed to load demo');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Upload className="w-6 h-6 mr-2 text-blue-600" />
          Upload Dataset
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Upload your data for analysis and cleaning</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'
          } ${file ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {!file ? (
            <>
              <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Drag and drop your dataset here
              </h3>
              <p className="text-gray-500 mb-4">or click to browse</p>
              <p className="text-xs text-gray-400 mb-4">Supports CSV, XLSX, XLS (max 100MB)</p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Browse Files
              </label>
            </>
          ) : (
            <>
              <div className="mx-auto w-16 h-16 bg-green-50 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{file.name}</h3>
              <p className="text-gray-500 mb-4">{(file.size / 1024).toFixed(2)} KB</p>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="inline-flex items-center px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Processing...' : 'Upload and Analyze'}
              </button>
            </>
          )}
        </div>

        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">Analyzing your dataset...</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Or try with sample data</p>
          <button
            onClick={loadDemo}
            disabled={uploading}
            className="inline-flex items-center px-6 py-2.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Target className="w-4 h-4 mr-2" />
            Try Demo Dataset
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatasetUpload;