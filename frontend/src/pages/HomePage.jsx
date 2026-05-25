import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiTaskLine, RiBarChartLine, RiTeamLine, RiShieldLine,
  RiCheckLine, RiArrowRightLine, RiSunLine, RiMoonLine,
} from 'react-icons/ri';
import { useTheme } from '../context/ThemeContext';

const features = [
  { icon: RiTaskLine, title: 'Smart Task Management', desc: 'Create, organize, and prioritize tasks with drag-and-drop simplicity.' },
  { icon: RiBarChartLine, title: 'Productivity Analytics', desc: 'Track your progress with beautiful charts and insights.' },
  { icon: RiTeamLine, title: 'Team-Ready', desc: 'Built with collaboration in mind, ready to scale with your team.' },
  { icon: RiShieldLine, title: 'Secure & Private', desc: 'JWT authentication and bcrypt encryption keep your data safe.' },
];

const perks = [
  'Drag & drop task reordering',
  'Dark & light mode',
  'Calendar view',
  'File attachments',
  'Real-time updates',
  'Email notifications',
  'Admin dashboard',
  'Mobile responsive',
];

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-950 via-surface-900 to-primary-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
            <RiTaskLine className="text-white text-lg" />
          </div>
          <span className="font-display font-bold text-lg">Smart Task Manager</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            {theme === 'dark' ? <RiSunLine /> : <RiMoonLine />}
          </button>
          <Link to="/login" className="text-white/70 hover:text-white text-sm font-medium transition-colors">Sign In</Link>
          <Link to="/signup" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-300 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
            Full-Stack MERN Application
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
            Manage Tasks
            <br />
            <span className="text-gradient">Smarter, Faster</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            A professional task management system with real-time updates, analytics, drag-and-drop, and everything you need to stay productive.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary text-base px-8 py-3.5">
              Start For Free <RiArrowRightLine />
            </Link>
            <Link to="/login" className="px-8 py-3.5 rounded-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-all font-medium">
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4">
                <Icon className="text-primary-400 text-xl" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Perks */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-primary-900/40 to-violet-900/40 border border-primary-500/20 rounded-3xl p-10"
        >
          <h2 className="text-3xl font-display font-bold text-center mb-10">Everything Included</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {perks.map((perk, i) => (
              <div key={perk} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <RiCheckLine className="text-white text-xs" />
                </div>
                <span className="text-sm text-white/80">{perk}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-4xl font-display font-bold mb-4">Ready to get organized?</h2>
        <p className="text-white/50 mb-8">Join thousands of productive people using Smart Task Manager.</p>
        <Link to="/signup" className="btn-primary text-base px-10 py-4">
          Create Free Account <RiArrowRightLine />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-white/30 text-sm">
        <p>© 2025 Smart Task Manager. Built with React, Node.js, MongoDB.</p>
      </footer>

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
