import { Outlet, Link } from 'react-router-dom';
import { RiTaskLine } from 'react-icons/ri';
import { useTheme } from '../context/ThemeContext';
import { RiSunLine, RiMoonLine } from 'react-icons/ri';

export default function AuthLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-950 via-surface-900 to-primary-900 dark:from-surface-950 dark:via-surface-950 dark:to-primary-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-glow">
            <RiTaskLine className="text-white text-lg" />
          </div>
          <span className="font-display font-bold text-white text-lg">Smart Task Manager</span>
        </Link>
        <button onClick={toggleTheme} className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          {theme === 'dark' ? <RiSunLine className="text-xl" /> : <RiMoonLine className="text-xl" />}
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-slide-up">
          <Outlet />
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-900/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
