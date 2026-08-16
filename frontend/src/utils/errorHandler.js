// Create a utility for error handling
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // If it's a string
  if (typeof error === 'string') return error;
  
  // If it's a FastAPI validation error
  if (Array.isArray(error)) {
    return error.map(err => err.msg || 'Invalid input').join(', ');
  }
  
  // If it's an object with a detail property
  if (error.detail) {
    if (typeof error.detail === 'string') return error.detail;
    if (Array.isArray(error.detail)) {
      return error.detail.map(err => err.msg || 'Invalid input').join(', ');
    }
  }
  
  // If it's an Error object
  if (error.message) return error.message;
  
  // Fallback
  return 'An error occurred';
};

export const handleApiError = (error) => {
  console.error('API Error:', error);
  return getErrorMessage(error);
};