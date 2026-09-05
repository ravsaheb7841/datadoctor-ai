import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import {
  Stethoscope,
  LogIn,
  Mail,
  Lock,
  Sparkles,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        if (typeof data.detail === 'string') {
          setError(data.detail);
        } else if (Array.isArray(data.detail)) {
          setError(
            data.detail
              .map((err) => err.msg || 'Invalid input')
              .join(', ')
          );
        } else {
          setError('Login failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        'Network error. Please make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-slate-50 dark:bg-gray-950">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-gray-950 dark:via-indigo-950/40 dark:to-gray-950"></div>

      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-blue-400/20 rounded-full blur-3xl"></div>

      <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-indigo-400/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-md w-full animate-fade-in">

        {/* Logo */}
        <div className="text-center mb-8">

          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            DataDoctor AI
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Welcome back. Please login to continue.
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

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>

              <div className="relative">

                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

                {/* Lock icon */}
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="password-input w-full pl-10 pr-11 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  required
                  placeholder="Your password"
                  autoComplete="current-password"
                />

                {/* ONE Eye Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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

            {/* Remember Me + Forgot */}
            <div className="flex items-center justify-between text-sm">

              <label className="flex items-center gap-2 cursor-pointer">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                />

                <span className="text-gray-600 dark:text-gray-400">
                  Remember me
                </span>

              </label>

              <button
                type="button"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium"
              >
                Forgot password?
              </button>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-press w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100"
            >

              {loading ? (

                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

              ) : (

                <>
                  <LogIn className="w-4 h-4 mr-2" />

                  Login

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

          {/* Demo Button */}
          <button
            type="button"
            onClick={() => navigate('/demo')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
          >

            <Zap className="w-4 h-4" />

            Try Demo Without Account

          </button>

          {/* Register Link */}
          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">

            Don't have an account?{' '}

            <Link
              to="/register"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold"
            >
              Register
            </Link>

          </p>

        </div>

        {/* Trust */}
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

      {/* Hide browser built-in password reveal buttons */}
      <style>{`
        input.password-input::-ms-reveal,
        input.password-input::-ms-clear {
          display: none;
        }

        input.password-input::-webkit-credentials-auto-fill-button {
          visibility: hidden;
          display: none !important;
          pointer-events: none;
        }

        input.password-input::-webkit-textfield-decoration-container {
          display: none;
        }
      `}</style>

    </div>
  );
};

export default Login;