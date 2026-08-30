export const enterDemoMode = () => localStorage.setItem('datadoctor_demo', '1');

export const DEMO_DATASET = {
  _id: 'demo',
  filename: 'sample_sales.csv',
  rows: 1012,
  columns: 8,
  health_score: 71,
  issue_count: 5,
  status: 'completed',
};

export const DEMO_ISSUES = [
  { severity: 'high', type: 'missing_values', issue: 'Missing values in age', affected_rows: 11, percentage_affected: 1.09 },
  { severity: 'high', type: 'missing_values', issue: 'Missing values in email', affected_rows: 11, percentage_affected: 1.09 },
  { severity: 'medium', type: 'duplicates', issue: 'Duplicate customer IDs found', affected_rows: 8, percentage_affected: 0.79 },
  { severity: 'medium', type: 'outliers', issue: 'Outliers in Unit_Price', affected_rows: 14, percentage_affected: 1.38 },
  { severity: 'low', type: 'inconsistent_format', issue: 'Inconsistent dates in order_date', affected_rows: 6, percentage_affected: 0.59 },
];

export const getDemoChatReply = (query) => {
  const q = (query || '').toLowerCase();
  if (q.includes('row')) return 'The sample dataset has 1,012 rows and 8 columns.';
  if (q.includes('missing')) return 'Yes. Age and email have 11 missing values each (1.09%).';
  if (q.includes('average') || q.includes('mean') || q.includes('price')) return 'Average Unit_Price is 249.50. Median is 199.00.';
  if (q.includes('duplicate')) return 'There are 8 duplicate customer IDs (0.79% of rows).';
  if (q.includes('health')) return 'Demo health score is 71/100 (Fair). Sign up to run a full diagnosis.';
  return 'This is a demo chat on sample_sales.csv (1,012 rows). Ask about rows, missing values, price, or duplicates. Sign up to chat with your own data.';
};
