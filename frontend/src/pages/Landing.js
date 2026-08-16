import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { 
  Stethoscope, Search, Wand2, BarChart3, Bot, MessageSquare, 
  FileText, ArrowRight, Database, TrendingUp
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
      description: 'Instantly profile your datasets with comprehensive statistics and distribution analysis.'
    },
    {
      icon: Stethoscope,
      title: 'AI Data Diagnosis',
      description: 'Let AI analyze your data quality issues and provide intelligent recommendations.'
    },
    {
      icon: Wand2,
      title: 'Smart Data Cleaning',
      description: 'Fix missing values, duplicates, and outliers with semantic-aware operations.'
    },
    {
      icon: BarChart3,
      title: 'Exploratory Analysis',
      description: 'Generate professional visualizations and discover patterns automatically.'
    },
    {
      icon: TrendingUp,
      title: 'Business Insights',
      description: 'Uncover actionable insights powered by AI analysis of your data.'
    },
    {
      icon: MessageSquare,
      title: 'Natural Language Chat',
      description: 'Ask questions about your data in plain English and get instant answers.'
    },
    {
      icon: FileText,
      title: 'Professional Reports',
      description: 'Generate comprehensive data quality reports in multiple formats.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DataDoctor AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Diagnose. Clean. Understand.<br />
              <span className="text-blue-600">Your Data.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10">
              Upload your dataset and let AI detect quality problems, recommend fixes, 
              clean your data, and uncover meaningful business insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Analyze My Data
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              <button
                onClick={handleDemo}
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 rounded-lg font-medium border border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Try Demo Dataset
              </button>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { icon: Database, label: 'Health Score', value: '87/100', color: 'green' },
                { icon: Search, label: 'Issues Detected', value: '12', color: 'yellow' },
                { icon: BarChart3, label: 'Rows Analyzed', value: '1,254', color: 'blue' },
                { icon: Bot, label: 'AI Insights', value: '24', color: 'purple' },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4">
                  <stat.icon className="w-5 h-5 text-gray-400 mb-2" />
                  <div className="text-sm text-gray-500">{stat.label}</div>
                  <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                </div>
              ))}
            </div>
            <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
              <BarChart3 className="w-12 h-12 text-gray-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Everything you need to understand, clean, and analyze your data
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold">DataDoctor AI</span>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Free
            </button>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© 2024 DataDoctor AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;