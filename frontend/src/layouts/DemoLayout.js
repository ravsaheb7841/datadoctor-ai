import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, MessageSquare, Wand2, Bot, FileText,
  Settings, Stethoscope, Lock, X, ArrowRight, LogOut
} from 'lucide-react';

const DemoLayout = () => {
  const navigate = useNavigate();
  const [lockOpen, setLockOpen] = useState(false);
  const [lockFeature, setLockFeature] = useState('');

  const openLock = (name) => {
    setLockFeature(name);
    setLockOpen(true);
  };

  const openItems = [
    { name: 'Dashboard', path: '/demo', icon: LayoutDashboard, end: true },
    { name: 'EDA', path: '/demo/eda', icon: BarChart3 },
    { name: 'Data Chat', path: '/demo/chat', icon: MessageSquare },
  ];

  const lockedItems = [
    { name: 'Cleaning Center', icon: Wand2 },
    { name: 'AI Diagnosis', icon: Bot },
    { name: 'Reports / Download', icon: FileText },
    { name: 'Settings', icon: Settings },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center px-3 py-2.5 mb-1 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
        : 'text-gray-300 hover:bg-gray-800'
    }`;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white">
      <div className="hidden lg:flex w-64 flex-shrink-0 flex-col border-r border-slate-800 bg-slate-950">
        <div className="flex items-center px-5 py-5 border-b border-slate-800">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">DataDoctor</h1>
            <p className="text-[11px] text-amber-400 font-medium">Demo Mode</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Available</div>
          {openItems.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.end} className={linkClass}>
              <item.icon className="w-4 h-4 mr-3" />
              {item.name}
            </NavLink>
          ))}

          <div className="px-3 mt-5 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Locked</div>
          {lockedItems.map((item) => (
            <button
              key={item.name}
              onClick={() => openLock(item.name)}
              className="w-full flex items-center px-3 py-2.5 mb-1 rounded-xl text-sm text-slate-500 hover:bg-slate-800/80"
            >
              <item.icon className="w-4 h-4 mr-3" />
              <span className="flex-1 text-left">{item.name}</span>
              <Lock className="w-3.5 h-3.5" />
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Exit Demo
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400">
            Demo · sample_sales.csv
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/login')} className="px-3 py-1.5 text-sm text-slate-300 hover:text-white">
              Login
            </button>
            <button onClick={() => navigate('/register')} className="btn-press px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
              Create Account
            </button>
          </div>
        </div>

        <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 text-sm text-amber-200 flex items-center justify-between gap-3">
          <span>You are in demo mode. Cleaning, AI diagnosis, reports and downloads are locked.</span>
          <button onClick={() => navigate('/register')} className="inline-flex items-center gap-1 font-semibold whitespace-nowrap">
            Unlock all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-6 bg-slate-900">
          <Outlet />
        </main>
      </div>

      {lockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <button onClick={() => setLockOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-xl font-bold mb-2">{lockFeature} is locked</h3>
            <p className="text-slate-400 text-sm mb-6">
              Create a free account to clean data, run AI diagnosis, download reports and manage settings.
            </p>
            <div className="flex gap-3">
              <button onClick={() => navigate('/register')} className="btn-press flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold">
                Create Account
              </button>
              <button onClick={() => navigate('/login')} className="flex-1 py-3 rounded-xl border border-slate-600 font-medium">
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoLayout;
