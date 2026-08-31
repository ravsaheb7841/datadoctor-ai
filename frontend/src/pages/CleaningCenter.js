import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../App';
import {
  AlertTriangle, CheckCircle2, Download, Wand2, RefreshCw,
  Database, Filter, ChevronDown, TrendingUp, Trash2, Edit3, Activity
} from 'lucide-react';
import LoadingState from '../components/LoadingState';

const OPERATION_GROUPS = {
  missing_values: {
    label: 'Missing Values',
    methods: ['mean', 'median', 'mode', 'custom_value', 'forward_fill', 'backward_fill', 'drop_rows'],
  },
  text_cleaning: {
    label: 'Text Cleaning',
    methods: ['trim_whitespace', 'remove_extra_spaces', 'lowercase', 'uppercase', 'title_case', 'find_replace', 'remove_special_chars'],
  },
  categorical: {
    label: 'Categorical',
    methods: ['normalize_categories', 'replace_category', 'group_rare'],
  },
  numeric_ops: {
    label: 'Numeric',
    methods: ['round', 'absolute_value', 'remove_commas', 'remove_currency'],
  },
  outliers: {
    label: 'Outliers',
    methods: ['remove_outliers', 'cap_outliers', 'replace_median'],
  },
  datetime: {
    label: 'Date & Time',
    methods: ['convert_to_date', 'extract_year', 'extract_month', 'extract_day', 'extract_quarter', 'extract_weekday'],
  },
  duplicates: {
    label: 'Duplicates',
    methods: ['remove_duplicates_keep_first', 'remove_duplicates_keep_last'],
  },
  data_type: {
    label: 'Data Type',
    methods: ['convert_to_int', 'convert_to_float', 'convert_to_text', 'convert_to_date'],
  },
};
const OPERATION_LABELS = {
  mean: 'Mean', median: 'Median', mode: 'Mode',
  custom_value: 'Custom Value', forward_fill: 'Forward Fill', backward_fill: 'Backward Fill',
  drop_rows: 'Drop Rows',
  trim_whitespace: 'Trim Whitespace', remove_extra_spaces: 'Remove Extra Spaces',
  lowercase: 'lowercase', uppercase: 'UPPERCASE', title_case: 'Title Case',
  find_replace: 'Find & Replace', remove_special_chars: 'Remove Special Characters',
  normalize_categories: 'Normalize Categories', replace_category: 'Replace Category',
  group_rare: 'Group Rare to Other',
  round: 'Round', absolute_value: 'Absolute Value',
  remove_commas: 'Remove Commas', remove_currency: 'Remove Currency Symbols',
  remove_outliers: 'Remove Outliers', cap_outliers: 'Cap/Winsorize',
  replace_median: 'Replace with Median',
  convert_to_date: 'Convert to Date',
  extract_year: 'Extract Year', extract_month: 'Extract Month', extract_day: 'Extract Day',
  extract_quarter: 'Extract Quarter', extract_weekday: 'Extract Day of Week',
  remove_duplicates_keep_first: 'Keep First', remove_duplicates_keep_last: 'Keep Last',
  convert_to_int: 'Float to Integer', convert_to_float: 'Integer to Float',
  convert_to_text: 'Numeric to Text',
};

const TYPE_COLORS = {
  numeric: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  categorical: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  text: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  datetime: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  identifier: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  boolean: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  ordinal: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  binary: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
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
  const [customValues, setCustomValues] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
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

      if (!issuesRes.ok) throw new Error(`Failed to fetch issues: ${issuesRes.status}`);

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
  }, [id, token]);

  const fetchColumnTypes = useCallback(async () => {
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
  }, [id, token]);

  useEffect(() => {
    fetchData();
    fetchColumnTypes();
  }, [fetchData, fetchColumnTypes, refreshKey]);

  const getColumnType = (columnName) => {
    if (userOverrides[columnName]) return userOverrides[columnName];
    return columnTypes[columnName]?.semantic_type || 'numeric';
  };

  const getAllowedMethods = (columnName) => {
    const type = getColumnType(columnName);

    const typeMethodMap = {
      numeric: [
        'mean', 'median', 'mode', 'custom_value', 'forward_fill', 'backward_fill', 'drop_rows',
        'round', 'absolute_value', 'remove_commas', 'remove_currency',
        'remove_outliers', 'cap_outliers', 'replace_median',
        'convert_to_int', 'convert_to_float', 'convert_to_text'
      ],

      categorical: [
        'mode', 'custom_value', 'forward_fill', 'backward_fill', 'drop_rows',
        'trim_whitespace', 'remove_extra_spaces',
        'lowercase', 'uppercase', 'title_case',
        'find_replace', 'remove_special_chars',
        'normalize_categories', 'replace_category', 'group_rare'
      ],

      text: [
        'custom_value', 'forward_fill', 'backward_fill', 'drop_rows',
        'trim_whitespace', 'remove_extra_spaces',
        'lowercase', 'uppercase', 'title_case',
        'find_replace', 'remove_special_chars'
      ],

      datetime: [
        'custom_value', 'forward_fill', 'backward_fill', 'drop_rows',
        'convert_to_date',
        'extract_year', 'extract_month', 'extract_day',
        'extract_quarter', 'extract_weekday'
      ],

      identifier: [
        'custom_value', 'forward_fill', 'backward_fill', 'drop_rows',
        'remove_duplicates_keep_first', 'remove_duplicates_keep_last'
      ],

      boolean: [
        'mode', 'custom_value', 'forward_fill', 'backward_fill', 'drop_rows'
      ],

      ordinal: [
        'median', 'mode', 'custom_value',
        'forward_fill', 'backward_fill', 'drop_rows',
        'replace_category', 'group_rare'
      ],

      binary: [
        'mode', 'custom_value',
        'forward_fill', 'backward_fill', 'drop_rows'
      ],
    };

    return typeMethodMap[type] || ['drop_rows', 'custom_value'];
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
    setUserOverrides(prev => ({ ...prev, [columnName]: newType }));
    setSelectedOperations(prev => {
      const newPrev = { ...prev };
      Object.keys(newPrev).forEach(key => {
        if (key.includes(columnName)) delete newPrev[key];
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
        if (selectedOp === 'custom_value') {
          const customVal = customValues[issueKey] || '';
          if (!customVal) {
            setError('Please enter a custom value');
            setCleaning(false);
            setCleaningIssueId(null);
            return;
          }
          operation.value = customVal;
        }
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
        setRefreshKey(prev => prev + 1);
        await fetchData();
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

  if (loading) return <LoadingState message="Loading cleaning center..." />;

  const severityStyles = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-teal-800 to-cyan-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-400/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-300/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>

        <div className="relative z-10 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
            <Wand2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-emerald-200" />
              <span className="text-emerald-200 text-sm font-medium">Data Cleaning Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Cleaning Center</h1>
            <p className="mt-1.5 text-teal-100 text-sm max-w-lg">
              Fix data quality issues with smart, semantic-aware methods
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 animate-slide-down">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-2 animate-slide-down">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Cleaning Complete Banner */}
      {cleaningLog.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/30">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                  Data Cleaning Complete
                </h2>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {cleaningLog.length} operation(s) applied. Download your cleaned dataset now.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn-press inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Downloading...' : 'Download Cleaned File'}
            </button>
          </div>
        </div>
      )}

      {/* Issues Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Data Quality Issues
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {issues.length} issue{issues.length !== 1 ? 's' : ''} remaining
            </p>
          </div>
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {issues.length === 0 ? (
          <div className="py-16 text-center animate-scale-in">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              No Data Quality Issues
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Your dataset has been successfully cleaned.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {issues.map((issue, index) => {
              const issueKey = `${issue.type}-${issue.column}-${index}`;
              const colType = getColumnType(issue.column);
              const allowedMethods = getAllowedMethods(issue.column);
              const selectedOp = selectedOperations[issueKey] || getDefaultMethod(issue.column);

              return (
                <div
                  key={issueKey}
                  className="stagger-item p-5 sm:p-6 hover:bg-gray-50/80 dark:hover:bg-gray-700/20 transition-colors"
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${severityStyles[issue.severity] || severityStyles.low}`}>
                          {issue.severity?.toUpperCase() || 'UNKNOWN'}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {issue.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          on <span className="font-medium text-gray-700 dark:text-gray-300">{issue.column}</span>
                        </span>
                      </div>

                      {/* Type selector */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[colType] || TYPE_COLORS.text}`}>
                          {colType.toUpperCase()}
                        </span>
                        <select
                          value={colType}
                          onChange={(e) => handleTypeOverride(issue.column, e.target.value)}
                          className="text-xs px-2.5 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500/40"
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

                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {issue.issue}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                        {issue.affected_rows} rows affected ({issue.percentage_affected}%)
                      </p>

                      {/* Method selector */}
                      {issue.type !== 'high_cardinality' && (
                        <div className="mt-4">
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                            Cleaning Method
                          </label>
                          <select
                            value={selectedOp}
                            onChange={(e) => {
                              setSelectedOperations(prev => ({
                                ...prev,
                                [issueKey]: e.target.value
                              }));
                            }}
                            className="w-full sm:w-72 px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                            disabled={cleaning}
                          >
                            {Object.entries(OPERATION_GROUPS).map(([groupKey, group]) => {
                            const availableMethods = group.methods.filter(m =>
                              !allowedMethods?.length || allowedMethods.includes(m)
                            );
                            if (availableMethods.length === 0) return null;
                            return (
                              <optgroup key={groupKey} label={group.label}>
                                {availableMethods.map(method => (
                                  <option key={method} value={method}>
                                    {OPERATION_LABELS[method] || method}
                                  </option>
                                ))}
                              </optgroup>
                            );
                          })}
                          </select>

                          {selectedOp === 'custom_value' && (
                            <div className="mt-3">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Enter Custom Value
                              </label>
                              <input
                                type="text"
                                value={customValues[issueKey] || ''}
                                onChange={(e) => {
                                  setCustomValues(prev => ({
                                    ...prev,
                                    [issueKey]: e.target.value
                                  }));
                                }}
                                placeholder="Enter value to fill missing data"
                                className="w-full sm:w-72 px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {issue.type === 'high_cardinality' && (
                        <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Unique Values: <strong>{issue.unique_count || issue.unique || 'N/A'}</strong>
                            <br />
                            Cardinality: <strong>{issue.cardinality_percentage || issue.percentage_affected || 'N/A'}%</strong>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            High cardinality is informational and does not require a cleaning operation.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Fix Button */}
                    {issue.type !== 'high_cardinality' && (
                      <button
                        onClick={() => handleClean(issue, index)}
                        disabled={cleaning}
                        className={`btn-press flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                          cleaningIssueId === index
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:scale-[1.02]'
                        }`}
                      >
                        {cleaningIssueId === index ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Fixing...
                          </span>
                        ) : (
                          'Fix Issue'
                        )}
                      </button>
                    )}
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