import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../App';
import { 
  AlertTriangle, CheckCircle2, Download, Wand2, RefreshCw, 
  Database, Filter, ChevronDown, Info, TrendingUp, Trash2, Edit3
} from 'lucide-react';

const METHOD_OPTIONS = {
  mean: { label: 'Mean (Average)', icon: TrendingUp },
  median: { label: 'Median (Middle)', icon: Filter },
  mode: { label: 'Mode (Most Common)', icon: Database },
  forward_fill: { label: 'Forward Fill (Previous)', icon: ChevronDown },
  backward_fill: { label: 'Backward Fill (Next)', icon: ChevronDown },
  drop_rows: { label: 'Drop Rows', icon: Trash2 },
  custom: { label: 'Custom Value', icon: Edit3 },
};

const TYPE_COLORS = {
  numeric: 'bg-blue-100 text-blue-800',
  categorical: 'bg-green-100 text-green-800',
  text: 'bg-gray-100 text-gray-800',
  datetime: 'bg-purple-100 text-purple-800',
  identifier: 'bg-orange-100 text-orange-800',
  boolean: 'bg-teal-100 text-teal-800',
  ordinal: 'bg-pink-100 text-pink-800',
  binary: 'bg-indigo-100 text-indigo-800',
};

const CleaningCenter = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [issues, setIssues] = useState([]);
  const [columnTypes, setColumnTypes] = useState({});
  const [beforeAfter, setBeforeAfter] = useState(null);
  const [cleaningLog, setCleaningLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [cleaningIssueId, setCleaningIssueId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [selectedOperations, setSelectedOperations] = useState({});
  const [userOverrides, setUserOverrides] = useState({});

  useEffect(() => {
    fetchData();
    fetchColumnTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [issuesRes, logRes] = await Promise.all([
        fetch(`http://localhost:8000/api/datasets/${id}/issues`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://localhost:8000/api/datasets/${id}/cleaning-log`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const issuesData = await issuesRes.json();
      const logData = await logRes.json();
      
      setIssues(issuesData.issues || []);
      setCleaningLog(logData.operations || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchColumnTypes = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/datasets/${id}/column-types`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const typesMap = {};
        data.columns.forEach(col => {
          typesMap[col.column] = {
            semantic_type: col.semantic_type,
            label: col.semantic_type_label,
            methods: col.suggested_methods,
            dtype: col.dtype
          };
        });
        setColumnTypes(typesMap);
      }
    } catch (error) {
      console.error('Failed to fetch column types:', error);
    }
  };

  const getColumnType = (columnName) => {
    if (userOverrides[columnName]) {
      return userOverrides[columnName];
    }
    return columnTypes[columnName]?.semantic_type || 'numeric';
  };

  const getAllowedMethods = (columnName) => {
    const type = getColumnType(columnName);
    const methodsMap = {
      numeric: ['mean', 'median', 'mode', 'forward_fill', 'backward_fill', 'drop_rows', 'custom'],
      categorical: ['mode', 'forward_fill', 'backward_fill', 'drop_rows', 'custom'],
      text: ['forward_fill', 'backward_fill', 'drop_rows', 'custom'],
      datetime: ['forward_fill', 'backward_fill', 'drop_rows', 'custom'],
      identifier: ['forward_fill', 'backward_fill', 'drop_rows', 'custom'],
      boolean: ['mode', 'forward_fill', 'backward_fill', 'drop_rows', 'custom'],
      ordinal: ['median', 'mode', 'forward_fill', 'backward_fill', 'drop_rows', 'custom'],
      binary: ['mode', 'forward_fill', 'backward_fill', 'drop_rows', 'custom'],
    };
    return methodsMap[type] || ['drop_rows', 'custom'];
  };

  const getDefaultMethod = (columnName) => {
    const type = getColumnType(columnName);
    const defaults = {
      numeric: 'mean',
      categorical: 'mode',
      text: 'drop_rows',
      datetime: 'forward_fill',
      identifier: 'forward_fill',
      boolean: 'mode',
      ordinal: 'median',
      binary: 'mode',
    };
    return defaults[type] || 'drop_rows';
  };

  const handleTypeOverride = (columnName, newType) => {
    setUserOverrides(prev => ({
      ...prev,
      [columnName]: newType
    }));
    setSelectedOperations(prev => {
      const newPrev = { ...prev };
      Object.keys(newPrev).forEach(key => {
        if (key.includes(columnName)) {
          delete newPrev[key];
        }
      });
      return newPrev;
    });
  };

  const handleClean = async (issue, index) => {
    setCleaning(true);
    setCleaningIssueId(index);
    setMessage('');
    setError('');
    
    const issueKey = `${issue.type}-${issue.column}-${index}`;
    const selectedOp = selectedOperations[issueKey] || getDefaultMethod(issue.column);
    
    let operation = { type: '', column: issue.column };
    
    switch (issue.type) {
      case 'missing_values':
        operation.type = 'fill_missing';
        operation.method = selectedOp;
        break;
      case 'duplicates':
      case 'duplicate_ids':
        operation.type = 'remove_duplicates';
        operation.keep = 'first';
        break;
      case 'outliers':
        operation.type = selectedOp === 'remove_outliers' ? 'remove_outliers' : 'cap_outliers';
        break;
      default:
        operation.type = 'fill_missing';
        operation.method = selectedOp;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/datasets/${id}/clean`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(operation)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setBeforeAfter(data);
        setMessage('Cleaning operation applied successfully');
        setIssues(prevIssues => prevIssues.filter((_, i) => i !== index));
        
        const newLogEntry = {
          operation: operation.type,
          column: operation.column,
          method: operation.method,
          timestamp: new Date().toISOString(),
        };
        setCleaningLog(prevLog => [newLogEntry, ...prevLog]);
      } else {
        setError(data.detail || 'Cleaning operation failed');
      }
    } catch (error) {
      console.error('Cleaning failed:', error);
      setError('Network error. Please try again.');
    } finally {
      setCleaning(false);
      setCleaningIssueId(null);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/datasets/${id}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cleaned_dataset_${id}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setMessage('Cleaned dataset downloaded successfully');
      }
    } catch (error) {
      setError('Failed to download cleaned dataset');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="text-gray-500">Loading cleaning center...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Wand2 className="w-6 h-6 mr-2 text-blue-600" />
          Cleaning Center
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Fix data quality issues with semantic-aware methods</p>
      </div>

      {message && (
        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg mb-4 flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          {message}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {cleaningLog.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Data Cleaning Complete
              </h2>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                {cleaningLog.length} operation(s) applied. Download your cleaned dataset now.
              </p>
            </div>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloading ? 'Downloading...' : 'Download Cleaned File'}
            </button>
          </div>
        </div>
      )}

      {beforeAfter && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Before & After</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Rows</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {beforeAfter.before?.rows?.toLocaleString()} to {beforeAfter.after?.rows?.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Missing Values</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {beforeAfter.before?.missing?.toLocaleString()} to {beforeAfter.after?.missing?.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Health Score</div>
              <div className="text-lg font-bold text-green-600">{beforeAfter.health_score}/100</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Data Quality Issues ({issues.length})
          </h2>
          <button
            onClick={fetchData}
            className="inline-flex items-center px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>
        
        {issues.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No issues to clean</h3>
            <p className="text-gray-500">Your data looks clean.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue, index) => {
              const issueKey = `${issue.type}-${issue.column}-${index}`;
              const colType = getColumnType(issue.column);
              const allowedMethods = getAllowedMethods(issue.column);
              const selectedOp = selectedOperations[issueKey] || getDefaultMethod(issue.column);
              
              return (
                <div key={issueKey} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                        <span className="text-sm text-gray-500">on {issue.column}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2 mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[colType] || 'bg-gray-100 text-gray-800'}`}>
                          {colType.toUpperCase()}
                        </span>
                        <select
                          value={colType}
                          onChange={(e) => handleTypeOverride(issue.column, e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        >
                          <option value="numeric">Numeric</option>
                          <option value="categorical">Categorical</option>
                          <option value="text">Text</option>
                          <option value="datetime">Datetime</option>
                          <option value="identifier">Identifier</option>
                          <option value="boolean">Boolean</option>
                          <option value="ordinal">Ordinal</option>
                          <option value="binary">Binary</option>
                        </select>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{issue.issue}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {issue.affected_rows} rows affected ({issue.percentage_affected}%)
                      </p>
                      
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Cleaning Method:
                        </label>
                        <select
                          value={selectedOp}
                          onChange={(e) => {
                            setSelectedOperations(prev => ({
                              ...prev,
                              [issueKey]: e.target.value
                            }));
                          }}
                          className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={cleaning}
                        >
                          {allowedMethods.map(method => (
                            <option key={method} value={method}>
                              {METHOD_OPTIONS[method]?.label || method}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleClean(issue, index)}
                      disabled={cleaning}
                      className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        cleaningIssueId === index
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {cleaningIssueId === index ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Fixing...
                        </span>
                      ) : (
                        'Fix Issue'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CleaningCenter;