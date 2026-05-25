import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiUserLine, RiDeleteBin2Line, RiShieldLine, RiSearchLine,
  RiBarChartLine, RiTeamLine, RiTaskLine, RiCheckboxCircleLine,
} from 'react-icons/ri';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { timeAgo, getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchData = async () => {
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users'),
      ]);
      setAnalytics(analyticsRes.data.analytics);
      setUsers(usersRes.data.users);
      setPagination(usersRes.data.pagination);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users', { params: { search } });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch {}
  };

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Delete user "${userName}" and all their data?`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(u => u.filter(x => x._id !== userId));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle-status`);
      setUsers(u => u.map(x => x._id === userId ? data.user : x));
      toast.success(data.message);
    } catch { toast.error('Action failed'); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const a = analytics || {};

  const statCards = [
    { icon: RiTeamLine, label: 'Total Users', value: a.totalUsers || 0, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
    { icon: RiUserLine, label: 'Active Users', value: a.activeUsers || 0, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
    { icon: RiTaskLine, label: 'Total Tasks', value: a.totalTasks || 0, color: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' },
    {
      icon: RiCheckboxCircleLine,
      label: 'Completed Tasks',
      value: a.tasksByStatus?.find(s => s._id === 'completed')?.count || 0,
      color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <RiShieldLine className="text-primary-500" /> Admin Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage users and view system analytics</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-surface-100 dark:border-surface-800">
        {['overview', 'users'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 pt-1 px-5 text-sm font-medium border-b-2 transition-colors capitalize -mb-px ${
              activeTab === tab
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'overview' ? <span className="flex items-center gap-2"><RiBarChartLine />Overview</span>
              : <span className="flex items-center gap-2"><RiTeamLine />Users ({pagination.total})</span>}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ icon: Icon, label, value, color }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="text-lg" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Growth Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Task Growth (Monthly)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={a.taskGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="_id" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Created" />
                <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-100 dark:border-surface-800">
                    {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-50 dark:divide-surface-800">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                            {u.avatar?.url ? <img src={u.avatar.url} alt={u.name} className="w-full h-full object-cover" /> : getInitials(u.name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge text-xs ${u.role === 'admin' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-surface-100 dark:bg-surface-800 text-slate-600 dark:text-slate-400'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge text-xs ${u.isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">{timeAgo(u.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {u.role !== 'admin' && (
                            <>
                              <button
                                onClick={() => handleToggleStatus(u._id)}
                                className="text-xs px-2.5 py-1 rounded-lg border border-surface-200 dark:border-surface-700 text-slate-600 dark:text-slate-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                              >
                                {u.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDelete(u._id, u.name)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <RiDeleteBin2Line className="text-sm" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm">No users found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
