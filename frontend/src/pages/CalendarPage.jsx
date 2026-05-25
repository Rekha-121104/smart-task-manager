import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import { format, isSameDay, parseISO } from 'date-fns';
import { RiCalendarLine, RiTimeLine } from 'react-icons/ri';
import { useTask } from '../context/TaskContext';
import { priorityConfig } from '../utils/helpers';
import 'react-calendar/dist/Calendar.css';

export default function CalendarPage() {
  const { tasks, fetchTasks, isLoading } = useTask();
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchTasks({ limit: 100, status: 'all' });
  }, []);

  const tasksWithDue = tasks.filter(t => t.dueDate);

  const getTasksForDate = (date) =>
    tasksWithDue.filter(t => isSameDay(parseISO(t.dueDate), date));

  const selectedTasks = getTasksForDate(selectedDate);

  const tileContent = ({ date }) => {
    const dayTasks = getTasksForDate(date);
    if (!dayTasks.length) return null;
    return (
      <div className="flex justify-center gap-0.5 mt-0.5">
        {dayTasks.slice(0, 3).map((t, i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              t.priority === 'urgent' ? 'bg-purple-500' :
              t.priority === 'high' ? 'bg-red-500' :
              t.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <RiCalendarLine className="text-primary-500" /> Calendar View
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Visualize your tasks by due date</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 card p-5"
        >
          <style>{`
            .react-calendar { width: 100%; background: transparent; border: none; font-family: inherit; }
            .react-calendar__tile { padding: 12px 6px; border-radius: 10px; font-size: 14px; color: inherit; }
            .react-calendar__tile:hover { background: rgba(99,102,241,0.1) !important; }
            .react-calendar__tile--active { background: #6366f1 !important; color: white !important; }
            .react-calendar__tile--now { background: rgba(99,102,241,0.1); }
            .react-calendar__navigation button { color: inherit; font-size: 15px; font-weight: 600; border-radius: 10px; }
            .react-calendar__navigation button:hover { background: rgba(99,102,241,0.1) !important; }
            .react-calendar__month-view__weekdays { font-size: 12px; font-weight: 600; color: #94a3b8; }
            .react-calendar__month-view__weekdays abbr { text-decoration: none; }
          `}</style>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
          />
        </motion.div>

        {/* Selected Day Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <RiTimeLine className="text-primary-500" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-14 skeleton rounded-xl" />)}
            </div>
          ) : selectedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <RiCalendarLine className="text-4xl mb-3 opacity-40" />
              <p className="text-sm">No tasks due on this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedTasks.map(task => (
                <div
                  key={task._id}
                  className={`p-3.5 rounded-xl border-l-4 ${
                    task.priority === 'urgent' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' :
                    task.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                    task.priority === 'medium' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10' :
                    'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10'
                  }`}
                >
                  <p className={`text-sm font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`badge ${priorityConfig[task.priority]?.color} text-xs`}>
                      {priorityConfig[task.priority]?.label}
                    </span>
                    <span className="text-xs text-slate-400 capitalize">{task.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-surface-100 dark:border-surface-800">
            <p className="text-xs text-slate-400 font-medium mb-3 uppercase tracking-wider">Priority Legend</p>
            <div className="space-y-2">
              {[
                { color: 'bg-purple-500', label: 'Urgent' },
                { color: 'bg-red-500', label: 'High' },
                { color: 'bg-amber-500', label: 'Medium' },
                { color: 'bg-emerald-500', label: 'Low' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
