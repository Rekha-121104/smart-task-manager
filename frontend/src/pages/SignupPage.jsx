import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiUserLine, RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiCheckLine } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const requirements = [
  { test: v => v.length >= 6, label: 'At least 6 characters' },
  { test: v => /[A-Z]/.test(v), label: 'One uppercase letter' },
  { test: v => /[0-9]/.test(v), label: 'One number' },
];

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 dark:bg-surface-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-surface-700 p-8 shadow-2xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-display font-bold text-white mb-2">Get started</h2>
        <p className="text-white/60 mb-8">Create your free account today</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label text-white/70">Full Name</label>
            <div className="relative">
              <RiUserLine className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
              <input
                type="text"
                className="input bg-white/10 dark:bg-surface-800 border-white/20 dark:border-surface-700 text-white placeholder:text-white/40 pl-11"
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
          </div>

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
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                {showPw ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>

            {form.password && (
              <div className="mt-3 space-y-1">
                {requirements.map(req => (
                  <div key={req.label} className="flex items-center gap-2 text-xs">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${req.test(form.password) ? 'bg-emerald-500' : 'bg-white/20'}`}>
                      {req.test(form.password) && <RiCheckLine className="text-white text-xs" />}
                    </div>
                    <span className={req.test(form.password) ? 'text-emerald-400' : 'text-white/40'}>{req.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-white/40 text-xs mt-6">
          By signing up, you agree to our{' '}
          <span className="text-primary-400">Terms of Service</span> and{' '}
          <span className="text-primary-400">Privacy Policy</span>
        </p>

        <p className="text-center text-white/50 text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
