import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      await login('demo@example.com', 'demo1234');
      navigate('/dashboard');
    } catch {
      toast.error('Demo account unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 dark:bg-surface-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-surface-700 p-8 shadow-2xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-display font-bold text-white mb-2">Welcome back</h2>
        <p className="text-white/60 mb-8">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label text-white/70">Email</label>
            <div className="relative">
              <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
              <input
                type="email"
                className="input bg-white/10 dark:bg-surface-800 border-white/20 dark:border-surface-700 text-white placeholder:text-white/40 pl-11"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="label text-white/70">Password</label>
            <div className="relative">
              <RiLockLine className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
              <input
                type={showPw ? 'text' : 'password'}
                className="input bg-white/10 dark:bg-surface-800 border-white/20 dark:border-surface-700 text-white placeholder:text-white/40 pl-11 pr-11"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPw ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-transparent text-white/40">or</span>
          </div>
        </div>

        <button
          onClick={handleDemo}
          className="w-full py-3 rounded-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-all font-medium text-sm"
          disabled={loading}
        >
          Try Demo Account
        </button>

        <p className="text-center text-white/50 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
            Sign up free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
