import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  RiTaskLine, RiCheckboxCircleLine, RiTimeLine, RiTrophyLine,
  RiFireLine, RiAlarmWarningLine, RiArrowRightLine,
} from 'react-icons/ri';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, timeAgo, priorityConfig } from '../utils/helpers';
import SkeletonCard from '../components/common/SkeletonCard';

const StatCard = ({ icon: Icon, label, value, color, sub, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="card p-6 flex items-start gap-4"
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="text-xl" />
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <p className="text-3xl font-display font-bold text-slate-900 dark:text-white mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  </motion.div>
);

const PRIORITY_COLORS = { urgent: '#a855f7', high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const STATUS_COLORS = { pending: '#94a3b8', 'in-progress': '#3b82f6', completed: '#10b981', archived: '#64748b' };

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: res } = await api.get('/tasks/dashboard');
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 skeleton w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const byStatus = data?.stats?.byStatus || [];
  const byPriority = data?.stats?.byPriority || [];

  const statusPieData = byStatus.map(s => ({
    name: s._id.replace('-', ' '),
    value: s.count,
    color: STATUS_COLORS[s._id] || '#94a3b8',
  }));

  const priorityPieData = byPriority.map(p => ({
    name: p._id,
    value: p.count,
    color: PRIORITY_COLORS[p._id] || '#94a3b8',
  }));

  const weeklyData = data?.weeklyStats?.map(d => ({
    date: d._id.slice(5),
    created: d.created,
    completed: d.completed,
  })) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
          {greeting}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening with your tasks today.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={RiTaskLine}
          label="Total Tasks"
          value={stats.total || 0}
          color="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
          delay={0}
        />
        <StatCard
          icon={RiCheckboxCircleLine}
          label="Completed"
          value={byStatus.find(s => s._id === 'completed')?.count || 0}
          color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
          delay={0.05}
        />
        <StatCard
          icon={RiTimeLine}
          label="In Progress"
          value={byStatus.find(s => s._id === 'in-progress')?.count || 0}
          color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          delay={0.1}
        />
        <StatCard
          icon={RiTrophyLine}
          label="Completion Rate"
          value={`${stats.completionRate || 0}%`}
          color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
          sub={stats.completionRate >= 80 ? '🎯 Great job!' : 'Keep going!'}
          delay={0.15}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 lg:col-span-2"
        >
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="cgCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cgCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }}
              />
              <Area type="monotone" dataKey="created" stroke="#6366f1" fill="url(#cgCreated)" strokeWidth={2} name="Created" />
              <Area type="monotone" dataKey="completed" stroke="#10b981" fill="url(#cgCompleted)" strokeWidth={2} name="Completed" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Priority Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-6"
        >
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">By Priority</h3>
          {priorityPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={priorityPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {priorityPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
                <Legend formatter={v => <span style={{ color: '#94a3b8', textTransform: 'capitalize', fontSize: '12px' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No tasks yet</div>
          )}
        </motion.div>
      </div>

      {/* Recent & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Recent Tasks</h3>
            <Link to="/tasks" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              View all <RiArrowRightLine />
            </Link>
          </div>
          <div className="space-y-3">
            {data?.recentTasks?.length > 0 ? data.recentTasks.map(task => (
              <div key={task._id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${priorityConfig[task.priority]?.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'} truncate`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{timeAgo(task.createdAt)}</p>
                </div>
                <span className={`badge ${task.status === 'completed' ? 'status-completed' : 'status-pending'} text-xs`}>
                  {task.status}
                </span>
              </div>
            )) : (
              <p className="text-sm text-slate-400 text-center py-6">No tasks yet. Create your first task!</p>
            )}
          </div>
        </motion.div>

        {/* Upcoming Due */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <RiAlarmWarningLine className="text-amber-500 text-lg" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Due Soon</h3>
          </div>
          <div className="space-y-3">
            {data?.upcomingTasks?.length > 0 ? data.upcomingTasks.map(task => (
              <div key={task._id} className="flex items-start gap-3 p-3 rounded-xl border border-amber-200/50 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10">
                <RiFireLine className="text-amber-500 text-lg flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{task.title}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Due {formatDate(task.dueDate)}</p>
                </div>
                <span className={`badge ${priorityConfig[task.priority]?.color}`}>{task.priority}</span>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <RiCheckboxCircleLine className="text-4xl text-emerald-500 mb-2" />
                <p className="text-sm">No upcoming due tasks!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
