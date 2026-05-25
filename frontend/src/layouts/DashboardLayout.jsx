import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiDashboardLine, RiTaskLine, RiCalendarLine, RiUserLine,
  RiAdminLine, RiMenuLine, RiCloseLine, RiSunLine, RiMoonLine,
  RiLogoutBoxLine, RiNotification2Line, RiBellLine,
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getInitials } from '../utils/helpers';

const navItems = [
  { to: '/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/tasks', icon: RiTaskLine, label: 'My Tasks' },
  { to: '/calendar', icon: RiCalendarLine, label: 'Calendar' },
  { to: '/profile', icon: RiUserLine, label: 'Profile' },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-surface-100 dark:border-surface-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-glow">
            <RiTaskLine className="text-white text-lg" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-tight">Smart Task</h1>
            <p className="text-xs text-slate-500 dark:text-slate-500">Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider mb-3 px-4">Menu</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon className="text-lg flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="border-t border-surface-100 dark:border-surface-800 my-3" />
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider mb-3 px-4">Admin</p>
            <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <RiAdminLine className="text-lg flex-shrink-0" />
              <span>Admin Panel</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-surface-100 dark:border-surface-800">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer" onClick={() => navigate('/profile')}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              getInitials(user?.name)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full mt-2 btn-ghost text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 justify-start"
        >
          <RiLogoutBoxLine className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-50 bg-white dark:bg-surface-900 border-r border-surface-100 dark:border-surface-800 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
          <button
            className="lg:hidden btn-ghost p-2"
            onClick={() => setSidebarOpen(true)}
          >
            <RiMenuLine className="text-xl" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button className="btn-ghost p-2 relative">
              <RiBellLine className="text-xl" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
            </button>

            <button
              onClick={toggleTheme}
              className="btn-ghost p-2"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <RiSunLine className="text-xl text-amber-400" /> : <RiMoonLine className="text-xl" />}
            </button>

            <div
              className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer overflow-hidden"
              onClick={() => navigate('/profile')}
            >
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
              ) : getInitials(user?.name)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
