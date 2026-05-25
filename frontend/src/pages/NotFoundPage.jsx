import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiArrowLeftLine, RiHome2Line } from 'react-icons/ri';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-9xl font-display font-bold text-gradient mb-4">404</div>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">Page not found</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => window.history.back()} className="btn-secondary">
            <RiArrowLeftLine /> Go Back
          </button>
          <Link to="/dashboard" className="btn-primary">
            <RiHome2Line /> Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
