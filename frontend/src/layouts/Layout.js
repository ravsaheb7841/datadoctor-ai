import React, { useContext, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext, ThemeContext } from '../App';
import { 
  LayoutDashboard, Database, Upload, History, Settings, LogOut,
  Sun, Moon, Stethoscope, Wand2, BarChart3, Bot, MessageSquare, 
  FileText, ShieldCheck, FileSearch, Menu, X
} from 'lucide-react';

const Layout = ({ currentDataset, setCurrentDataset }) => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navGroups = [
    {
      label: 'Data',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Datasets', path: '/datasets', icon: Database },
        { name: 'Upload', path: '/upload', icon: Upload },
      ]
    },
    ...(currentDataset ? [{
      label: 'Analysis',
      items: [
        { name: 'Data Profile', path: `/datasets/${currentDataset}`, icon: FileSearch },
        { name: 'Data Quality', path: `/datasets/${currentDataset}/doctor`, icon: ShieldCheck },
        { name: 'EDA', path: `/datasets/${currentDataset}/eda`, icon: BarChart3 },
        { name: 'AI Insights', path: `/datasets/${currentDataset}/insights`, icon: Bot },
      ]
    }] : []),
    ...(currentDataset ? [{
      label: 'Actions',
      items: [
        { name: 'Cleaning Center', path: `/datasets/${currentDataset}/cleaning`, icon: Wand2 },
        { name: 'Data Chat', path: `/datasets/${currentDataset}/chat`, icon: MessageSquare },
        { name: 'Reports', path: `/datasets/${currentDataset}/reports`, icon: FileText },
      ]
    }] : []),
    {
      label: 'System',
      items: [
        { name: 'History', path: '/history', icon: History },
        { name: 'Settings', path: '/settings', icon: Settings },
      ]
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) => {
    return `flex items-center px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-l-3 border-blue-600'
        : `${darkMode ? 'text-gray-300 hover:bg-gray-700/50' : 'text-gray-600 hover:bg-gray-100'}`
    }`;
  };

  const sidebar = (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Logo */}
      <div className="flex items-center px-5 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">DataDoctor</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">AI Data Quality</p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group, idx) => (
          <div key={idx} className="mb-4">
            <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {group.label}
            </div>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={navLinkClass}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      
      {/* Bottom section */}
      <div className={`px-3 py-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            darkMode ? 'text-gray-300 hover:bg-gray-700/50' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className={`hidden lg:block w-64 flex-shrink-0 border-r ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        {sidebar}
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed left-0 top-0 h-full w-64 z-50">
            {sidebar}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <div className={`flex items-center justify-between px-6 py-3 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {currentDataset && (
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-gray-400" />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {currentDataset}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className={`hidden md:inline text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {user?.name || 'User'}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;