import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../App';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Wand2,
  RefreshCw,
  Activity,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Filter,
  Sparkles,
  Zap,
  Settings2,
  Database,
  PenLine,
  ListFilter,
  Calculator,
  Calendar,
  Copy,
  CheckCircle,
  Circle,
  Loader2,
  ArrowUpDown,
  Eye,
  EyeOff
} from 'lucide-react';
import LoadingState from '../components/LoadingState';

const API_URL = 'https://datadoctor-ai.onrender.com';

const FILL_METHODS = [
  'mean',
  'median',
  'mode',
  'custom_value',
  'forward_fill',
  'backward_fill',
  'drop_rows'
];

const OPERATION_GROUPS = {
  missing_values: {
    label: 'Missing Values',
    icon: Database,
    color: 'text-blue-500',
    methods: [
      'mean',
      'median',
      'mode',
      'custom_value',
      'forward_fill',
      'backward_fill',
      'drop_rows'
    ]
  },
  text_cleaning: {
    label: 'Text Cleaning',
    icon: PenLine,
    color: 'text-purple-500',
    methods: [
      'trim_whitespace',
      'remove_extra_spaces',
      'lowercase',
      'uppercase',
      'title_case',
      'find_replace',
      'remove_special_chars'
    ]
  },
  categorical: {
    label: 'Categorical',
    icon: ListFilter,
    color: 'text-emerald-500',
    methods: [
      'normalize_categories',
      'replace_category',
      'merge_categories',
      'group_rare'
    ]
  },
  numeric: {
    label: 'Numeric',
    icon: Calculator,
    color: 'text-orange-500',
    methods: [
      'convert_to_numeric',
      'remove_commas',
      'remove_currency',
      'round',
      'absolute_value'
    ]
  },
  outliers: {
    label: 'Outliers',
    icon: AlertTriangle,
    color: 'text-red-500',
    methods: [
      'iqr_detect',
      'zscore_detect',
      'remove_outliers',
      'cap_outliers',
      'replace_median'
    ]
  },
  datetime: {
    label: 'Date & Time',
    icon: Calendar,
    color: 'text-indigo-500',
    methods: [
      'convert_to_date',
      'extract_year',
      'extract_month',
      'extract_day',
      'extract_quarter',
      'extract_weekday'
    ]
  },
  duplicates: {
    label: 'Duplicates',
    icon: Copy,
    color: 'text-pink-500',
    methods: [
      'remove_duplicates_keep_first',
      'remove_duplicates_keep_last'
    ]
  },
  data_type: {
    label: 'Data Type',
    icon: RefreshCw,
    color: 'text-teal-500',
    methods: [
      'text_to_numeric',
      'numeric_to_text',
      'text_to_date',
      'int_to_float',
      'float_to_int'
    ]
  }
};

const COLUMN_GROUP_KEYS = {
  numeric: ['missing_values', 'numeric', 'outliers', 'data_type'],
  text: ['missing_values', 'text_cleaning', 'categorical', 'data_type'],
  categorical: ['missing_values', 'text_cleaning', 'categorical'],
  datetime: ['missing_values', 'datetime', 'data_type'],
  identifier: ['missing_values', 'text_cleaning', 'duplicates'],
  boolean: ['missing_values', 'data_type'],
  ordinal: ['missing_values', 'categorical', 'data_type'],
  binary: ['missing_values', 'categorical']
};

const OPERATION_LABELS = {
  mean: 'Mean',
  median: 'Median',
  mode: 'Mode',
  custom_value: 'Custom Value',
  forward_fill: 'Forward Fill',
  backward_fill: 'Backward Fill',
  drop_rows: 'Drop Rows',
  trim_whitespace: 'Trim Whitespace',
  remove_extra_spaces: 'Remove Extra Spaces',
  lowercase: 'lowercase',
  uppercase: 'UPPERCASE',
  title_case: 'Title Case',
  find_replace: 'Find & Replace',
  remove_special_chars: 'Remove Special Characters',
  normalize_categories: 'Normalize Categories',
  replace_category: 'Replace Category',
  merge_categories: 'Merge Categories',
  group_rare: 'Group Rare to Other',
  convert_to_numeric: 'Convert to Numeric',
  convert_to_text: 'Convert to Text',
  remove_commas: 'Remove Commas',
  remove_currency: 'Remove Currency Symbols',
  round: 'Round',
  absolute_value: 'Absolute Value',
  iqr_detect: 'IQR Detect',
  zscore_detect: 'Z-Score Detect',
  remove_outliers: 'Remove Outliers',
  cap_outliers: 'Cap/Winsorize',
  replace_median: 'Replace with Median',
  convert_to_date: 'Convert to Date',
  extract_year: 'Extract Year',
  extract_month: 'Extract Month',
  extract_day: 'Extract Day',
  extract_quarter: 'Extract Quarter',
  extract_weekday: 'Extract Day of Week',
  remove_duplicates_keep_first: 'Keep First',
  remove_duplicates_keep_last: 'Keep Last',
  text_to_numeric: 'Text to Numeric',
  numeric_to_text: 'Numeric to Text',
  text_to_date: 'Text to Date',
  int_to_float: 'Integer to Float',
  float_to_int: 'Float to Integer'
};

const TYPE_METHOD_MAP = {
  numeric: ['mean', 'median', 'mode', 'custom_value', 'forward_fill', 'backward_fill', 'drop_rows', 'convert_to_numeric', 'remove_commas', 'remove_currency', 'round', 'absolute_value', 'iqr_detect', 'zscore_detect', 'remove_outliers', 'cap_outliers', 'replace_median', 'text_to_numeric', 'numeric_to_text', 'text_to_date', 'int_to_float', 'float_to_int'],
  text: ['mode', 'custom_value', 'forward_fill', 'backward_fill', 'drop_rows', 'trim_whitespace', 'remove_extra_spaces', 'lowercase', 'uppercase', 'title_case', 'find_replace', 'remove_special_chars', 'normalize_categories', 'replace_category', 'merge_categories', 'group_rare', 'text_to_numeric', 'numeric_to_text', 'text_to_date', 'int_to_float', 'float_to_int'],
  categorical: ['mode', 'custom_value', 'forward_fill', 'backward_fill', 'drop_rows', 'trim_whitespace', 'remove_extra_spaces', 'lowercase', 'uppercase', 'title_case', 'find_replace', 'remove_special_chars', 'normalize_categories', 'replace_category', 'merge_categories', 'group_rare'],
  datetime: ['mode', 'custom_value', 'forward_fill', 'backward_fill', 'drop_rows', 'convert_to_date', 'extract_year', 'extract_month', 'extract_day', 'extract_quarter', 'extract_weekday', 'text_to_numeric', 'numeric_to_text', 'text_to_date', 'int_to_float', 'float_to_int'],
  identifier: ['mode', 'custom_value', 'forward_fill', 'backward_fill', 'drop_rows', 'trim_whitespace', 'remove_extra_spaces', 'lowercase', 'uppercase', 'title_case', 'find_replace', 'remove_special_chars', 'remove_duplicates_keep_first', 'remove_duplicates_keep_last'],
  boolean: ['mode', 'custom_value', 'forward_fill', 'backward_fill', 'drop_rows', 'text_to_numeric', 'numeric_to_text', 'text_to_date', 'int_to_float', 'float_to_int'],
  ordinal: ['median', 'mode', 'custom_value', 'forward_fill', 'backward_fill', 'drop_rows', 'normalize_categories', 'replace_category', 'merge_categories', 'group_rare', 'text_to_numeric', 'numeric_to_text', 'text_to_date', 'int_to_float', 'float_to_int'],
  binary: ['mode', 'custom_value', 'forward_fill', 'backward_fill', 'drop_rows', 'normalize_categories', 'replace_category', 'merge_categories', 'group_rare']
};

const TYPE_COLORS = {
  numeric: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  categorical: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  text: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  datetime: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  identifier: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  boolean: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  ordinal: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  binary: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
};

const CleaningCenter = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);

  const [issues, setIssues] = useState([]);
  const [columnTypes, setColumnTypes] = useState({});
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
  const [extraParams, setExtraParams] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [typePickerOpen, setTypePickerOpen] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [expandedIssues, setExpandedIssues] = useState({});
  const [sortBy, setSortBy] = useState('default');
  const [showAllColumns, setShowAllColumns] = useState(true);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [issuesRes, logRes] = await Promise.all([
        fetch(`${API_URL}/api/datasets/${id}/issues`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/datasets/${id}/cleaning-log`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      if (!issuesRes.ok) throw new Error(`Failed: ${issuesRes.status}`);
      if (!logRes.ok) throw new Error(`Failed: ${logRes.status}`);
      const issuesData = await issuesRes.json();
      const logData = await logRes.json();
      setIssues(issuesData.issues || []);
      setCleaningLog(logData.operations || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  const fetchColumnTypes = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/datasets/${id}/column-types`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const typesMap = {};
        (data.columns || []).forEach((col) => {
          typesMap[col.column] = {
            semantic_type: col.semantic_type,
            label: col.semantic_type_label,
            methods: col.recommended_operations || col.suggested_methods || [],
            sample_head: col.sample_head || col.samples || col.example_values || [],
            dtype: col.dtype
          };
        });
        setColumnTypes(typesMap);
      }
    } catch (err) {
      console.error('Column types error:', err);
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
    const rec = columnTypes[columnName]?.methods;
    if (rec && rec.length) return rec;
    return TYPE_METHOD_MAP[type] || ['drop_rows', 'custom_value'];
  };

  const getMethodsForIssue = (issue) => {
    const type = getColumnType(issue.column);
    const issueType = issue.type || '';
    const issueText = `${issue.issue || ''} ${issue.type || ''}`.toLowerCase();
    
    if (issueType === 'high_cardinality') return [];
    if (issueText.includes('whitespace') || issueText.includes('extra space')) {
      return ['trim_whitespace', 'remove_extra_spaces'];
    }
    if (issueText.includes('capitaliz') || issueText.includes('inconsistent case')) {
      return ['lowercase', 'uppercase', 'title_case', 'normalize_categories'];
    }

    const matrix = {
      missing_values: {
        identifier: ['drop_rows', 'custom_value'],
        numeric: ['mean', 'median', 'mode', 'custom_value', 'forward_fill', 'backward_fill', 'drop_rows'],
        categorical: ['mode', 'custom_value', 'forward_fill', 'backward_fill', 'drop_rows'],
        text: ['custom_value', 'forward_fill', 'backward_fill', 'drop_rows'],
        datetime: ['forward_fill', 'backward_fill', 'drop_rows', 'custom_value'],
        boolean: ['mode', 'custom_value', 'forward_fill', 'backward_fill', 'drop_rows'],
        ordinal: ['median', 'mode', 'custom_value', 'forward_fill', 'backward_fill', 'drop_rows'],
        binary: ['mode', 'custom_value', 'forward_fill', 'backward_fill', 'drop_rows']
      },
      duplicates: { default: ['remove_duplicates_keep_first', 'remove_duplicates_keep_last'] },
      duplicate_ids: { default: ['remove_duplicates_keep_first', 'remove_duplicates_keep_last'] },
      outliers: { numeric: ['iqr_detect', 'zscore_detect', 'remove_outliers', 'cap_outliers', 'replace_median'], default: ['remove_outliers', 'cap_outliers', 'replace_median'] },
      category_inconsistency: { default: ['normalize_categories', 'replace_category', 'merge_categories', 'group_rare'] },
      type_mismatch: {
        numeric: ['convert_to_numeric', 'text_to_numeric', 'round', 'int_to_float', 'float_to_int'],
        datetime: ['convert_to_date', 'text_to_date', 'forward_fill', 'drop_rows'],
        default: ['text_to_numeric', 'numeric_to_text', 'text_to_date', 'int_to_float', 'float_to_int']
      },
      invalid_values: {
        numeric: ['replace_median', 'custom_value', 'drop_rows', 'cap_outliers'],
        datetime: ['convert_to_date', 'drop_rows', 'custom_value'],
        default: ['custom_value', 'drop_rows', 'find_replace']
      },
      constant_column: { default: ['drop_column', 'drop_rows'] },
      near_constant_column: { default: ['drop_column', 'drop_rows'] },
      high_cardinality: { default: [] }
    };

    const byIssue = matrix[issueType];
    if (byIssue) {
      const result = byIssue[type] || byIssue.default || getAllowedMethods(issue.column);
      return result.length > 0 ? result : ['drop_rows', 'custom_value'];
    }

    // Fallback for unhandled issue types
    const fallbackMethods = getAllowedMethods(issue.column);
    return fallbackMethods.length > 0 ? fallbackMethods : ['drop_rows', 'custom_value'];
  };

  const getDefaultMethod = (issue) => {
    const methods = getMethodsForIssue(issue);
    const type = getColumnType(issue.column);
    const preferredByIssue = {
      missing_values: { identifier: 'drop_rows', numeric: 'median', categorical: 'mode', text: 'custom_value', datetime: 'forward_fill', boolean: 'mode', ordinal: 'median', binary: 'mode' },
      duplicates: 'remove_duplicates_keep_first',
      duplicate_ids: 'remove_duplicates_keep_first',
      outliers: 'cap_outliers',
      category_inconsistency: 'normalize_categories',
      type_mismatch: 'convert_to_date',
      invalid_values: 'custom_value'
    };
    let preferred = preferredByIssue[issue.type];
    if (preferred && typeof preferred === 'object') preferred = preferred[type];
    if (preferred && methods.includes(preferred)) return preferred;
    return methods[0] || 'drop_rows';
  };

  const updateExtra = (issueKey, field, value) => {
    setExtraParams((prev) => ({ ...prev, [issueKey]: { ...(prev[issueKey] || {}), [field]: value } }));
  };

  const handleTypeOverride = (columnName, newType) => {
    setUserOverrides((prev) => ({ ...prev, [columnName]: newType }));
    setSelectedOperations((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => { if (key.includes(columnName)) delete next[key]; });
      return next;
    });
    setTypePickerOpen((prev) => ({ ...prev, [columnName]: false }));
  };

  const handleClean = async (issue, index) => {
    setCleaning(true);
    setCleaningIssueId(index);
    setMessage('');
    setError('');

    const issueKey = `${issue.type}-${issue.column}-${index}`;
    let selectedOp = selectedOperations[issueKey] || getDefaultMethod(issue);

    const extra = extraParams[issueKey] || {};
    const operation = { column: issue.column, method: selectedOp };

    if (FILL_METHODS.includes(selectedOp)) {
      operation.type = 'fill_missing';
      if (selectedOp === 'custom_value') {
        const customVal = customValues[issueKey] || extra.value || '';
        if (!customVal) { setError('Please enter a custom value'); setCleaning(false); setCleaningIssueId(null); return; }
        operation.value = customVal;
      }
    } else {
      operation.type = selectedOp;
    }

    if (selectedOp === 'find_replace') {
      if (!extra.find) { setError('Enter value to find'); setCleaning(false); setCleaningIssueId(null); return; }
      operation.find = extra.find;
      operation.replace = extra.replace || '';
    }
    if (selectedOp === 'replace_category') {
      if (!extra.old_value) { setError('Enter category to replace'); setCleaning(false); setCleaningIssueId(null); return; }
      operation.old_value = extra.old_value;
      operation.new_value = extra.new_value || '';
    }
    if (selectedOp === 'group_rare') operation.threshold = Number(extra.threshold || 5);
    if (selectedOp === 'merge_categories') {
      if (!(extra.from_values || extra.old_value) || !extra.new_value) {
        setError('Enter categories to merge'); setCleaning(false); setCleaningIssueId(null); return;
      }
      operation.from_values = extra.from_values || extra.old_value;
      operation.new_value = extra.new_value;
    }

    try {
      const response = await fetch(`${API_URL}/api/datasets/${id}/clean`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(operation)
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Cleaning operation applied successfully');
        setRefreshKey((prev) => prev + 1);
        await fetchData();
      } else {
        setError(data.detail || 'Cleaning operation failed');
      }
    } catch (err) {
      console.error('Clean error:', err);
      setError('Network error. Please try again.');
    } finally {
      setCleaning(false);
      setCleaningIssueId(null);
    }
  };

  const handleBatchClean = async () => {
    const selectedKeys = Object.keys(selectedIssues).filter(k => selectedIssues[k]);
    if (selectedKeys.length === 0) return;
    setCleaning(true);
    setError('');
    
    let successCount = 0;
    let failCount = 0;

    for (const key of selectedKeys) {
      const [type, column, idx] = key.split('__');
      const issue = { type, column };
      const index = parseInt(idx, 10);
      
      const issueKey = key;
      let selectedOp = selectedOperations[issueKey] || getDefaultMethod(issue);
      const extra = extraParams[issueKey] || {};
      const operation = { column: issue.column, method: selectedOp };

      if (FILL_METHODS.includes(selectedOp)) {
        operation.type = 'fill_missing';
        if (selectedOp === 'custom_value') {
          const customVal = customValues[issueKey] || extra.value || '';
          if (!customVal) { failCount++; continue; }
          operation.value = customVal;
        }
      } else {
        operation.type = selectedOp;
      }

      try {
        const response = await fetch(`${API_URL}/api/datasets/${id}/clean`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(operation)
        });
        if (response.ok) successCount++;
        else failCount++;
      } catch (err) {
        failCount++;
      }
    }

    setMessage(`Batch cleaning: ${successCount} successful, ${failCount} failed`);
    setBatchMode(false);
    setSelectedIssues({});
    setRefreshKey((prev) => prev + 1);
    await fetchData();
    setCleaning(false);
  };

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/datasets/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
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
      } else {
        setError('Failed to download');
      }
    } catch (err) {
      setError('Failed to download');
    } finally {
      setDownloading(false);
    }
  };

  const toggleIssueSelection = (issueKey) => {
    setSelectedIssues(prev => ({ ...prev, [issueKey]: !prev[issueKey] }));
  };

  const toggleAllIssues = () => {
    const allSelected = filteredIssues.every(i => selectedIssues[`${i.type}__${i.column}__${issues.indexOf(i)}`]);
    const newSelection = {};
    filteredIssues.forEach(i => {
      const key = `${i.type}__${i.column}__${issues.indexOf(i)}`;
      newSelection[key] = !allSelected;
    });
    setSelectedIssues(newSelection);
  };

  const filteredIssues = useMemo(() => {
    let result = [...issues];
    
    if (severityFilter !== 'all') {
      result = result.filter(i => i.severity === severityFilter);
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(i => 
        i.column.toLowerCase().includes(searchLower) ||
        i.type.toLowerCase().includes(searchLower) ||
        (i.issue || '').toLowerCase().includes(searchLower)
      );
    }
    
    if (sortBy === 'severity') {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      result.sort((a, b) => (order[a.severity] || 4) - (order[b.severity] || 4));
    } else if (sortBy === 'column') {
      result.sort((a, b) => a.column.localeCompare(b.column));
    } else if (sortBy === 'affected') {
      result.sort((a, b) => (b.affected_rows || 0) - (a.affected_rows || 0));
    }
    
    return result;
  }, [issues, severityFilter, searchTerm, sortBy]);

  if (loading) {
    return <LoadingState message="Loading cleaning center..." />;
  }

  const severityStyles = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
  };

  const severityCounts = {
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
  };

  const selectedCount = Object.values(selectedIssues).filter(Boolean).length;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-teal-800 to-cyan-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-400/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-300/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
            <Wand2 className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-emerald-200" />
              <span className="text-emerald-200 text-sm font-medium">Data Cleaning Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Cleaning Center</h1>
            <p className="mt-1.5 text-teal-100 text-sm max-w-lg">Fix data quality issues with smart, semantic-aware methods</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-bold">{issues.length}</div>
              <div className="text-xs text-teal-200">Issues</div>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-bold">{cleaningLog.length}</div>
              <div className="text-xs text-teal-200">Fixed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 animate-slide-down">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          {message}
          <button onClick={() => setMessage('')} className="ml-auto p-1 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-2 animate-slide-down">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto p-1 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Cleaning Complete */}
      {cleaningLog.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/30">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-emerald-800 dark:text-emerald-200">Data Cleaning Complete</h2>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">{cleaningLog.length} operation(s) applied.</p>
              </div>
            </div>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn-press inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Downloading...' : 'Download Cleaned File'}
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search issues..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All ({issues.length})</option>
                <option value="critical">Critical ({severityCounts.critical})</option>
                <option value="high">High ({severityCounts.high})</option>
                <option value="medium">Medium ({severityCounts.medium})</option>
                <option value="low">Low ({severityCounts.low})</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="default">Default Sort</option>
                <option value="severity">Sort by Severity</option>
                <option value="column">Sort by Column</option>
                <option value="affected">Sort by Affected Rows</option>
              </select>
            </div>
          </div>
          
          {/* Batch Mode */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setBatchMode(!batchMode); setSelectedIssues({}); }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                batchMode ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              {batchMode ? 'Exit Batch Mode' : 'Batch Mode'}
            </button>
            {batchMode && (
              <div className="flex items-center gap-3">
                <button onClick={toggleAllIssues} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  Select All ({filteredIssues.length})
                </button>
                <span className="text-sm text-gray-500">{selectedCount} selected</span>
                <button
                  onClick={handleBatchClean}
                  disabled={selectedCount === 0 || cleaning}
                  className="btn-press inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-all"
                >
                  {cleaning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Apply to Selected
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data Quality Issues</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {filteredIssues.length} of {issues.length} shown
            </p>
          </div>
          <button
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="py-14 text-center animate-scale-in">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {issues.length === 0 ? 'No Data Quality Issues' : 'No matching issues'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {issues.length === 0 ? 'Your dataset has been successfully cleaned.' : 'Try adjusting filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredIssues.map((issue) => {
              const originalIndex = issues.indexOf(issue);
              const issueKey = `${issue.type}__${issue.column}__${originalIndex}`;
              const colType = getColumnType(issue.column);
              const allowedMethods = getMethodsForIssue(issue);
              const selectedOp = selectedOperations[issueKey] || getDefaultMethod(issue);
              const extra = extraParams[issueKey] || {};
              const isExpanded = expandedIssues[issueKey] !== false;
              const isSelected = selectedIssues[issueKey] || false;

              return (
                <div
                  key={issueKey}
                  className="stagger-item p-5 sm:p-6 hover:bg-gray-50/80 dark:hover:bg-gray-700/20 transition-colors"
                  style={{ animationDelay: `${originalIndex * 0.03}s` }}
                >
                  <div className="flex items-start gap-3">
                    {/* Batch Checkbox */}
                    {batchMode && (
                      <button
                        onClick={() => toggleIssueSelection(issueKey)}
                        className={`mt-1 p-1 rounded-full border-2 transition-colors ${
                          isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-gray-600 text-transparent'
                        }`}
                      >
                        {isSelected ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      </button>
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${severityStyles[issue.severity] || severityStyles.low}`}>
                          {issue.severity?.toUpperCase() || 'UNKNOWN'}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {issue.type?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          on <span className="font-medium text-gray-700 dark:text-gray-300">{issue.column}</span>
                        </span>
                        <button
                          onClick={() => setExpandedIssues(prev => ({ ...prev, [issueKey]: !isExpanded }))}
                          className="ml-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Type Badge */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${TYPE_COLORS[colType] || TYPE_COLORS.text}`}>
                          {colType.toUpperCase()}
                        </span>
                        {userOverrides[issue.column] ? (
                          <span className="text-[11px] text-gray-500">Manual</span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI Detected
                          </span>
                        )}
                        <button
                          onClick={() => setTypePickerOpen(prev => ({ ...prev, [issue.column]: !prev[issue.column] }))}
                          className="text-[11px] text-gray-500 hover:text-emerald-700 flex items-center gap-1"
                        >
                          <Settings2 className="w-3 h-3" />
                          Change
                        </button>
                      </div>

                      {/* Type Picker */}
                      {typePickerOpen[issue.column] && (
                        <select
                          value={colType}
                          onChange={(e) => handleTypeOverride(issue.column, e.target.value)}
                          className="mb-2 text-xs px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300"
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
                      )}

                      {/* Samples */}
                      {(() => {
                        const rawSamples = (issue.sample_values || issue.samples || columnTypes[issue.column]?.sample_head || []).slice(0, 8);
                        const samples = rawSamples.map(v => v === null || v === undefined || v === '' ? null : String(v)).filter(Boolean);
                        if (!samples.length) return null;
                        return (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-4xl mb-1">
                            Samples: {samples.join(', ')}{rawSamples.length >= 8 ? '...' : ''}
                          </p>
                        );
                      })()}

                      {/* Affected */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{issue.affected_rows} rows affected</span>
                        <span>-</span>
                        <span className="font-medium">{issue.percentage_affected}%</span>
                      </div>

                      {/* Cleaning Controls */}
                      {isExpanded && issue.type !== 'high_cardinality' && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                            <div className="flex-1 max-w-md">
                              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Cleaning Method</label>
                              <select
                                value={selectedOp}
                                onChange={(e) => setSelectedOperations(prev => ({ ...prev, [issueKey]: e.target.value }))}
                                className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                disabled={cleaning}
                              >
                                {((COLUMN_GROUP_KEYS[colType] || ['missing_values']).length > 0 
                    ? COLUMN_GROUP_KEYS[colType] 
                    : ['missing_values']
                  ).map(groupKey => {
                                  const group = OPERATION_GROUPS[groupKey];
                                  if (!group) return null;
                                  let availableMethods = group.methods.filter(m => allowedMethods.includes(m));
                                  if (availableMethods.length === 0) {
                                    // Fallback: show all methods in this group
                                    availableMethods = group.methods;
                                  }
                                  const GroupIcon = group.icon;
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
                            </div>
                            <button
                              onClick={() => handleClean(issue, originalIndex)}
                              disabled={cleaning}
                              className={`btn-press flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                cleaningIssueId === originalIndex
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:shadow-lg hover:scale-[1.01]'
                              }`}
                            >
                              {cleaningIssueId === originalIndex ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Fixing...</>
                              ) : (
                                <><Zap className="w-4 h-4" /> Fix Issue</>
                              )}
                            </button>
                          </div>

                          {/* Dynamic Inputs */}
                          {selectedOp === 'custom_value' && (
                            <div className="mt-3">
                              <input
                                type="text"
                                value={customValues[issueKey] || ''}
                                onChange={(e) => setCustomValues(prev => ({ ...prev, [issueKey]: e.target.value }))}
                                placeholder="Enter custom value"
                                className="w-full sm:w-96 px-3.5 py-2.5 border rounded-xl text-sm"
                              />
                            </div>
                          )}
                          {selectedOp === 'find_replace' && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl">
                              <input type="text" value={extra.find || ''} onChange={(e) => updateExtra(issueKey, 'find', e.target.value)} placeholder="Find" className="input" />
                              <input type="text" value={extra.replace || ''} onChange={(e) => updateExtra(issueKey, 'replace', e.target.value)} placeholder="Replace with" className="input" />
                            </div>
                          )}
                          {selectedOp === 'replace_category' && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl">
                              <input type="text" value={extra.old_value || ''} onChange={(e) => updateExtra(issueKey, 'old_value', e.target.value)} placeholder="Old category" className="input" />
                              <input type="text" value={extra.new_value || ''} onChange={(e) => updateExtra(issueKey, 'new_value', e.target.value)} placeholder="New category" className="input" />
                            </div>
                          )}
                          {selectedOp === 'merge_categories' && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl">
                              <input type="text" value={extra.from_values || ''} onChange={(e) => updateExtra(issueKey, 'from_values', e.target.value)} placeholder="Categories (comma-separated)" className="input" />
                              <input type="text" value={extra.new_value || ''} onChange={(e) => updateExtra(issueKey, 'new_value', e.target.value)} placeholder="New name" className="input" />
                            </div>
                          )}
                          {selectedOp === 'group_rare' && (
                            <div className="mt-3">
                              <input type="number" min="1" value={extra.threshold || 5} onChange={(e) => updateExtra(issueKey, 'threshold', e.target.value)} className="input w-32" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* High Cardinality */}
                      {issue.type === 'high_cardinality' && (
                        <div className="mt-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                          <div className="flex gap-2 mb-2">
                            <span className="badge">Unique: {issue.unique_count || issue.unique || 'N/A'}</span>
                            <span className="badge">Cardinality: {issue.cardinality_percentage || 'N/A'}%</span>
                          </div>
                          <p className="text-xs text-gray-500">Informational - no cleaning required.</p>
                        </div>
                      )}
                    </div>
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