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
  const { login } = useContext(AuthContext);

  const handleDemo = async () => {
    try {
      const email = `demo${Date.now()}@datadoctor.ai`;
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Demo User',
          email: email,
          password: 'Demo@123456',
          confirm_password: 'Demo@123456'
        })
      });

      if (response.ok) {
        const data = await response.json();
        login(data.token, data.user);

        const demoResponse = await fetch('http://localhost:8000/api/datasets/demo', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${data.token}` }
        });

        if (demoResponse.ok) {
          const demoData = await demoResponse.json();
          navigate(`/datasets/${demoData._id}/doctor`);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Demo login failed:', error);
    }
  };

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
      <footer className="bg-gray-950 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">DataDoctor AI</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-sm">
                AI-powered data quality and analysis platform. Diagnose, clean, and understand your data with confidence.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social, i) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={i}
                      href={social.href}
                      aria-label={social.label}
                      title={social.label}
                      className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors duration-200"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                  {category}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-400">
                © 2026 DataDoctor AI. All rights reserved.
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                Made with <Heart className="w-4 h-4 mx-1 text-red-500 fill-current" /> for data teams
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;