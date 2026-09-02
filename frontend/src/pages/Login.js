import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Stethoscope, LogIn, Mail, Lock, Sparkles } from 'lucide-react';

const API_URL = 'https://datadoctor-ai.onrender.com';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        if (typeof data.detail === 'string') {
          setError(data.detail);
        } else if (Array.isArray(data.detail)) {
          setError(data.detail.map(err => err.msg || 'Invalid input').join(', '));
        } else {
          setError('Login failed. Please try again.');
        }
      }
    } catch (err) {
      setError('Network error. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-slate-50 dark:bg-gray-950">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-gray-950 dark:via-indigo-950/40 dark:to-gray-950"></div>
      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-blue-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-indigo-400/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-md w-full animate-fade-in">
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

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-5 text-sm animate-slide-down">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  required
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                  required
                  placeholder="Your password"
                />
              </div>
            </div>

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
                </>
              )}
            </button>
          </form>

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
      </div>
    </div>
  );
};

export default Login;