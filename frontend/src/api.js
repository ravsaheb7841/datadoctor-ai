// frontend/src/services/api.js
const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
  getToken: () => localStorage.getItem('token'),
  
  headers: () => ({
    'Authorization': `Bearer ${api.getToken()}`,
    'Content-Type': 'application/json'
  }),

  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: this.headers()
    });
    return response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async upload(endpoint, formData) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${api.getToken()}` },
      body: formData
    });
    return response.json();
  },

  async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.headers()
    });
    return response.json();
  }
};