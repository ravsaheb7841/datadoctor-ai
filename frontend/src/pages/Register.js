import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import {
  Stethoscope,
  UserPlus,
  Mail,
  Lock,
  User,
  Sparkles,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  AlertCircle
} from 'lucide-react';

const API_URL = 'https://datadoctor-ai.onrender.com';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        if (typeof data.detail === 'string') {
          setError(data.detail);
        } else if (Array.isArray(data.detail)) {
          setError(
            data.detail
              .map(err => err.msg || 'Invalid input')
              .join(', ')
          );
        } else {
          setError('Registration failed. Please try again.');
        }
      }
    } catch (err) {
      setError(
        'Network error. Please make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 overflow-hidden bg-slate-50 dark:bg-gray-950">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 dark:from-gray-950 dark:via-indigo-950/40 dark:to-gray-950"></div>

      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-violet-400/20 rounded-full blur-3xl"></div>

      <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-blue-400/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-md w-full animate-fade-in">

        {/* Logo */}
        <div className="text-center mb-8">

          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            DataDoctor AI
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-violet-500" />
            Create your account to get started
          </p>

        </div>

        {/* Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2 animate-slide-down">

              <AlertCircle className="w-4 h-4 flex-shrink-0" />

              {error}

            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>

              <div className="relative">

                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  required
                  placeholder="Your name"
                  autoComplete="name"
                />

              </div>
            </div>

            {/* Email */}
            <div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>

              <div className="relative">

                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  required
                  placeholder="your@email.com"
                  autoComplete="email"
                />

              </div>
            </div>

            {/* Password */}
            <div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>

              <div className="relative">

                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-11 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  required
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  style={{
                    WebkitAppearance: 'none',
                    appearance: 'none'
                  }}
                />

                {/* ONE EYE ICON ONLY */}
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-transparent border-0"
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

              </div>
            </div>

            {/* Confirm Password */}
            <div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>

              <div className="relative">

                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />

                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-11 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  required
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  style={{
                    WebkitAppearance: 'none',
                    appearance: 'none'
                  }}
                />

                {/* ONE EYE ICON ONLY */}
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(prev => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-transparent border-0"
                  aria-label={
                    showConfirmPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-press w-full inline-flex items-center justify-center px-4 py-3 mt-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100"
            >

              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}

            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">

            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>

            <span className="text-xs text-gray-400 font-medium">
              OR
            </span>

            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>

          </div>

          {/* Demo */}
          <button
            onClick={() => navigate('/demo')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
          >

            <Zap className="w-4 h-4" />

            Try Demo Without Account

          </button>

          {/* Login */}
          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">

            Already have an account?{' '}

            <Link
              to="/login"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold"
            >
              Login
            </Link>

          </p>

        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400 dark:text-gray-500">

          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure
          </span>

          <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>

          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Free
          </span>

          <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>

          <span>
            Demo available
          </span>

        </div>

      </div>
    </div>
  );
};

export default Register;