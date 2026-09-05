import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Datasets from './pages/Datasets';
import DatasetUpload from './pages/DatasetUpload';
import DatasetOverview from './pages/DatasetOverview';
import DataDoctor from './pages/DataDoctor';
import CleaningCenter from './pages/CleaningCenter';
import EDA from './pages/EDA';
import AIInsights from './pages/AIInsights';
import DataChat from './pages/DataChat';
import Reports from './pages/Reports';
import DatasetHistory from './pages/DatasetHistory';
import Settings from './pages/Settings';
import Layout from './layouts/Layout';
import DemoLayout from './layouts/DemoLayout';
import DemoDashboard from './pages/DemoDashboard';
import DemoEDA from './pages/DemoEDA';
import DemoChat from './pages/DemoChat';

export const AuthContext = createContext();
export const ThemeContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [currentDataset, setCurrentDataset] = useState(null);

  useEffect(() => {
    if (token) {
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCurrentDataset(null);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
        <Router>
          <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
            <Routes>
              <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" />} />
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

              <Route path="/demo" element={<DemoLayout />}>
                <Route index element={<DemoDashboard />} />
                <Route path="eda" element={<DemoEDA />} />
                <Route path="chat" element={<DemoChat />} />
              </Route>

              <Route element={<Layout currentDataset={currentDataset} setCurrentDataset={setCurrentDataset} />}>
                <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/datasets" element={user ? <Datasets /> : <Navigate to="/login" />} />
                <Route path="/upload" element={user ? <DatasetUpload /> : <Navigate to="/login" />} />
                <Route path="/datasets/:id" element={user ? <DatasetOverview /> : <Navigate to="/login" />} />
                <Route path="/datasets/:id/doctor" element={user ? <DataDoctor /> : <Navigate to="/login" />} />
                <Route path="/datasets/:id/cleaning" element={user ? <CleaningCenter /> : <Navigate to="/login" />} />
                <Route path="/datasets/:id/eda" element={user ? <EDA /> : <Navigate to="/login" />} />
                <Route path="/datasets/:id/insights" element={user ? <AIInsights /> : <Navigate to="/login" />} />
                <Route path="/datasets/:id/chat" element={user ? <DataChat /> : <Navigate to="/login" />} />
                <Route path="/datasets/:id/reports" element={user ? <Reports /> : <Navigate to="/login" />} />
                <Route path="/history" element={user ? <DatasetHistory /> : <Navigate to="/login" />} />
                <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;