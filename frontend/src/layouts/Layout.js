import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext, ThemeContext } from '../App';
import { 
  LayoutDashboard, Database, Upload, History, Settings, LogOut,
  Sun, Moon, Stethoscope, Wand2, BarChart3, Bot, MessageSquare, 
  FileText
} from 'lucide-react';

const Layout = ({ currentDataset, setCurrentDataset }) => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Datasets', path: '/datasets', icon: Database },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'History', path: '/history', icon: History },
  ];

  const datasetNav = currentDataset ? [
    { name: 'Data Quality', path: `/datasets/${currentDataset}/doctor`, icon: Stethoscope },
    { name: 'Cleaning', path: `/datasets/${currentDataset}/cleaning`, icon: Wand2 },
    { name: 'EDA', path: `/datasets/${currentDataset}/eda`, icon: BarChart3 },
    { name: 'AI Insights', path: `/datasets/${currentDataset}/insights`, icon: Bot },
    { name: 'Data Chat', path: `/datasets/${currentDataset}/chat`, icon: MessageSquare },
    { name: 'Reports', path: `/datasets/${currentDataset}/reports`, icon: FileText },
  ] : [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) => {
    return `flex items-center px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 border-l-2 border-primary-600'
        : `${darkMode ? 'text-gray-300 hover:bg-gray-700/50' : 'text-gray-600 hover:bg-gray-100'}`
    }`;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className={`w-64 flex-shrink-0 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-r`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center px-5 py-5 border-b border-gray-200 dark:border-gray-800">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">DataDoctor</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI Data Quality</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {navigation.map((item) => (
              <NavLink key={item.path} to={item.path} className={navLinkClass}>
                <item.icon className="w-4 h-4 mr-3" />
                {item.name}
              </NavLink>
            ))}
            
            {currentDataset && (
              <>
                <div className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Current Dataset
                </div>
                {datasetNav.map((item) => (
                  <NavLink key={item.path} to={item.path} className={navLinkClass}>
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </NavLink>
                ))}
              </>
            )}
          </nav>
          
          {/* Bottom section */}
          <div className={`px-3 py-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <NavLink to="/settings" className={navLinkClass}>
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </NavLink>
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
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <div className={`flex items-center justify-between px-6 py-3 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
          <div className="flex items-center space-x-4">
            {currentDataset && (
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-gray-400" />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Dataset: <span className="font-medium">{currentDataset}</span>
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
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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