import React, { useState, useContext } from 'react';
import { AuthContext, ThemeContext } from '../App';
import { Settings as SettingsIcon, Sun, Moon, Bot, User, Database, Trash2 } from 'lucide-react';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [message, setMessage] = useState('');

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This will delete all your data permanently.')) return;
    setMessage('Account deletion requested. Please contact support.');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <SettingsIcon className="w-6 h-6 mr-2 text-blue-600" />
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      {message && (
        <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg mb-4">{message}</div>
      )}

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Profile
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Name</label>
              <p className="text-gray-900 dark:text-white">{user?.name || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Email</label>
              <p className="text-gray-900 dark:text-white">{user?.email || 'Not set'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Theme</h3>
              <p className="text-sm text-gray-500">Toggle between light and dark mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                darkMode 
                  ? 'bg-gray-700 text-yellow-400' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
            <Bot className="w-5 h-5 mr-2 text-purple-600" />
            AI Configuration
          </h2>
          <div>
            <label className="block text-sm text-gray-500 mb-1">AI Provider</label>
            <p className="text-gray-900 dark:text-white">DeepSeek AI</p>
            <p className="text-xs text-gray-400 mt-1">
              AI features are powered by DeepSeek. If unavailable, rule-based analysis will be used.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-900 p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">
            Permanently delete your account and all associated data
          </p>
          <button
            onClick={handleDeleteAccount}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;