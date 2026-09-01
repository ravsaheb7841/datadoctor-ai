import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import {
  Stethoscope, Search, Wand2, BarChart3, Bot, MessageSquare,
  FileText, ArrowRight, Database, TrendingUp, Sparkles, ShieldCheck,
  Globe, Mail, Heart, Zap, Stars
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const handleDemo = () => {
    navigate('/demo');
  };

  const { login } = useContext(AuthContext);

  const features = [
    {
      icon: Search,
      title: 'Automated Data Profiling',
      description: 'Instantly profile your datasets with comprehensive statistics and distribution analysis.',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Stethoscope,
      title: 'AI Data Diagnosis',
      description: 'Let AI analyze your data quality issues and provide intelligent recommendations.',
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      icon: Wand2,
      title: 'Smart Data Cleaning',
      description: 'Fix missing values, duplicates, and outliers with semantic-aware operations.',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      icon: BarChart3,
      title: 'Exploratory Analysis',
      description: 'Generate professional visualizations and discover patterns automatically.',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'Business Insights',
      description: 'Uncover actionable insights powered by AI analysis of your data.',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      icon: MessageSquare,
      title: 'Natural Language Chat',
      description: 'Ask questions about your data in plain English and get instant answers.',
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      icon: FileText,
      title: 'Professional Reports',
      description: 'Generate comprehensive data quality reports in multiple formats.',
      gradient: 'from-rose-500 to-pink-600'
    },
    {
      icon: ShieldCheck,
      title: 'Health Scoring',
      description: 'Track data quality with a live health score and issue severity breakdown.',
      gradient: 'from-teal-500 to-emerald-600'
    },
  ];

  const previewStats = [
    { icon: Database, label: 'Health Score', value: '87/100', color: 'from-emerald-500 to-teal-600' },
    { icon: Search, label: 'Issues Detected', value: '12', color: 'from-amber-500 to-orange-600' },
    { icon: BarChart3, label: 'Rows Analyzed', value: '1,254', color: 'from-blue-500 to-indigo-600' },
    { icon: Bot, label: 'AI Insights', value: '24', color: 'from-purple-500 to-violet-600' },
  ];

  const footerLinks = {
    Product: ['Features', 'Demo', 'Pricing', 'Documentation'],
    Company: ['About', 'Careers', 'Blog', 'Press'],
    Resources: ['Help Center', 'API Reference', 'Guides', 'Community'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'],
  };

  const socialLinks = [
    { icon: Globe, href: '#', label: 'Website' },
    { icon: Mail, href: 'mailto:support@datadoctor.ai', label: 'Email' },
    { icon: Zap, href: '#', label: 'Quick Start' },
    { icon: Stars, href: '#', label: 'Features' },
    { icon: Heart, href: '#', label: 'Community' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">
      {/* Navigation */}
      <nav className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md fixed w-full z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-blue-500/25">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                DataDoctor AI
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="btn-press bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-indigo-50/40 to-white dark:from-gray-900 dark:via-indigo-950/40 dark:to-gray-950"></div>
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-indigo-400/15 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-powered data quality platform
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
              Diagnose. Clean. Understand.
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Your Data.
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload your dataset and let AI detect quality problems, recommend fixes,
              clean your data, and uncover meaningful business insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="btn-press group inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                Analyze My Data
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleDemo}
                className="btn-press inline-flex items-center justify-center px-8 py-3.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-xl font-semibold border-2 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                Try Demo Dataset
              </button>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl shadow-blue-500/10 border border-gray-200 dark:border-gray-700 p-6 sm:p-8 animate-slide-up">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {previewStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="stagger-item rounded-xl p-4 bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600 hover:-translate-y-1 hover:shadow-md transition-all"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white mb-3 shadow-md`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stat.value}</div>
                  </div>
                );
              })}
            </div>

            <div className="relative bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950/40 rounded-xl h-52 overflow-hidden flex items-end px-6 pb-6 gap-2">
              {[40, 65, 45, 80, 55, 90, 70, 50, 75, 60, 85, 48].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-blue-600 to-indigo-400 opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${h}%`, animationDelay: `${i * 0.05}s` }}
                ></div>
              ))}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm">
                  Live data quality dashboard
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Powerful Features
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to understand, clean, and analyze your data
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="stagger-item group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Band */}
      <div className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-10 sm:p-14 text-center text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <h2 className="relative text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            Ready to heal your data?
          </h2>
          <p className="relative text-blue-100 mb-8 max-w-xl mx-auto">
            Start free. Upload a dataset in seconds and get AI diagnosis instantly.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="relative btn-press inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-700 font-semibold rounded-xl shadow-lg hover:scale-[1.02] transition-all"
          >
            Start Free
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Main Footer */}
          <div className="py-10 sm:py-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

              {/* Brand */}
              <div className="max-w-sm">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>

                  <span className="ml-3 text-xl font-bold text-gray-900">
                    DataDoctor AI
                  </span>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed">
                  Diagnose, clean, and understand your data with AI-powered
                  data quality analysis and intelligent insights.
                </p>
              </div>

              {/* Footer Links */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm">
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Login
                </button>

                <button
                  onClick={() => navigate('/register')}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Get Started
                </button>

                <button
                  onClick={() => navigate('/demo')}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Try Demo
                </button>
              </div>

              {/* Social / CTA */}
              <div className="flex items-center gap-3">

                <a
                  href="https://github.com/ravsaheb7841"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm transition-all"
                  aria-label="GitHub"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.28-.01-1.02-.02-2-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.22.7.82.58A12.01 12.01 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </a>

                <a
                  href="https://www.linkedin.com/in/ravsaheb-bansode/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all"
                  aria-label="LinkedIn"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46C23.21 24 24 23.23 24 22.27V1.73C24 .77 23.21 0 22.23 0z" />
                  </svg>
                </a>

                <a
                  href="mailto:hello@datadoctor.ai"
                  className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>

              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-100 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} DataDoctor AI. All rights reserved.
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>AI-powered data quality platform</span>
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;


