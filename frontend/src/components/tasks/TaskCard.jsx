import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiEditLine, RiDeleteBin2Line, RiCheckLine, RiCalendarLine,
  RiMoreLine, RiPriceTag3Line, RiAttachment2, RiChatQuoteLine,
} from 'react-icons/ri';
import { useTask } from '../../context/TaskContext';
import { formatDate, isOverdue, priorityConfig, statusConfig, truncate } from '../../utils/helpers';

export default function TaskCard({ task, onEdit }) {
  const { updateTask, deleteTask } = useTask();
  const [showMenu, setShowMenu] = useState(false);

  const handleToggleComplete = async (e) => {
    e.stopPropagation();
    await updateTask(task._id, {
      status: task.status === 'completed' ? 'pending' : 'completed',
    });
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (confirm('Delete this task?')) await deleteTask(task._id);
  };

  const overdue = isOverdue(task.dueDate, task.status);
  const priorityCfg = priorityConfig[task.priority];
  const statusCfg = statusConfig[task.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={`card p-5 cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group ${
        task.status === 'completed' ? 'opacity-70' : ''
      }`}
      onClick={() => onEdit(task)}
    >
      {/* Priority indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl ${
        task.priority === 'urgent' ? 'bg-purple-500' :
        task.priority === 'high' ? 'bg-red-500' :
        task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
      }`} />

      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all mt-0.5 ${
            task.status === 'completed'
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-slate-300 dark:border-slate-600 hover:border-primary-500'
          }`}
        >
          {task.status === 'completed' && <RiCheckLine className="text-white text-xs" />}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm leading-snug ${
            task.status === 'completed'
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-800 dark:text-slate-200'
          }`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
              {truncate(task.description, 80)}
            </p>
          )}
        </div>

        {/* Menu */}
        <div className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-100 dark:hover:bg-surface-800 text-slate-400 hover:text-slate-600 transition-all"
          >
            <RiMoreLine />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 rounded-xl shadow-xl z-10 w-36 overflow-hidden">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(task); setShowMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-surface-50 dark:hover:bg-surface-700 text-slate-700 dark:text-slate-300"
              >
                <RiEditLine /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
              >
                <RiDeleteBin2Line /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map(tag => (
            <span key={tag} className="badge bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs">
              <RiPriceTag3Line className="text-xs" />
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="badge bg-surface-100 dark:bg-surface-800 text-slate-500 text-xs">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-surface-100 dark:border-surface-800">
        <div className="flex items-center gap-2">
          <span className={`badge ${priorityCfg?.color} text-xs`}>
            <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg?.dot}`} />
            {priorityCfg?.label}
          </span>
          <span className={`badge ${statusCfg?.color} text-xs`}>{statusCfg?.label}</span>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          {task.notes?.length > 0 && (
            <span className="flex items-center gap-1 text-xs"><RiChatQuoteLine className="text-sm" />{task.notes.length}</span>
          )}
          {task.attachments?.length > 0 && (
            <span className="flex items-center gap-1 text-xs"><RiAttachment2 className="text-sm" />{task.attachments.length}</span>
          )}
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-500' : ''}`}>
              <RiCalendarLine className="text-sm" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
