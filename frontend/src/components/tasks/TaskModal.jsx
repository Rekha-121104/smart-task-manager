import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RiCloseLine, RiAddLine, RiDeleteBin2Line, RiSaveLine,
  RiCalendarLine, RiPriceTag3Line, RiAlertLine,
} from 'react-icons/ri';
import { useTask } from '../../context/TaskContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/api';

const defaultForm = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  category: 'General',
  dueDate: '',
  tags: [],
};

export default function TaskModal({ task, onClose }) {
  const { createTask, updateTask, categories } = useTask();
  const [form, setForm] = useState(defaultForm);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        category: task.category || 'General',
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
        tags: task.tags || [],
      });
      setNotes(task.notes || []);
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setLoading(true);
    try {
      const data = { ...form, dueDate: form.dueDate || null };
      if (task) {
        await updateTask(task._id, data);
      } else {
        await createTask(data);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(',', '');
      if (!form.tags.includes(tag) && form.tags.length < 10) {
        setForm(f => ({ ...f, tags: [...f.tags, tag] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

  const addNote = async () => {
    if (!noteInput.trim() || !task) return;
    try {
      const { data } = await api.post(`/tasks/${task._id}/notes`, { content: noteInput });
      setNotes(data.task.notes);
      setNoteInput('');
      toast.success('Note added');
    } catch { toast.error('Failed to add note'); }
  };

  const deleteNote = async (noteId) => {
    try {
      const { data } = await api.delete(`/tasks/${task._id}/notes/${noteId}`);
      setNotes(data.task.notes);
    } catch { toast.error('Failed to delete note'); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-100 dark:border-surface-800 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-100 dark:border-surface-800">
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="btn-ghost p-2">
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        {/* Tabs (only when editing) */}
        {task && (
          <div className="flex border-b border-surface-100 dark:border-surface-800 px-6">
            {['details', 'notes'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 pt-3 px-4 text-sm font-medium border-b-2 transition-colors capitalize -mb-px ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab}
                {tab === 'notes' && notes.length > 0 && (
                  <span className="ml-2 badge bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs">
                    {notes.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' ? (
            <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className="label">Title *</label>
                <input
                  className="input"
                  placeholder="What needs to be done?"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input min-h-[80px] resize-none"
                  placeholder="Add details..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Row: Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select
                    className="input"
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Row: Category & Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <input
                    className="input"
                    placeholder="e.g. Work, Personal..."
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    list="categories-list"
                  />
                  <datalist id="categories-list">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="label">Due Date</label>
                  <div className="relative">
                    <RiCalendarLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      className="input pl-10"
                      value={form.dueDate}
                      onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="label">Tags</label>
                <div className="input flex flex-wrap gap-2 cursor-text" onClick={() => document.getElementById('tag-input').focus()}>
                  {form.tags.map(tag => (
                    <span key={tag} className="badge bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                      <RiPriceTag3Line className="text-xs" />
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500 transition-colors">×</button>
                    </span>
                  ))}
                  <input
                    id="tag-input"
                    className="flex-1 min-w-24 bg-transparent outline-none text-sm placeholder:text-slate-400"
                    placeholder={form.tags.length === 0 ? "Add tags (press Enter)..." : ""}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Press Enter or comma to add a tag</p>
              </div>
            </form>
          ) : (
            /* Notes tab */
            <div className="space-y-4">
              <div className="flex gap-2">
                <textarea
                  className="input flex-1 resize-none"
                  placeholder="Add a note..."
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  rows={2}
                />
                <button onClick={addNote} className="btn-primary self-end px-4">
                  <RiAddLine />
                </button>
              </div>

              {notes.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">No notes yet. Add your first note!</div>
              ) : (
                <div className="space-y-3">
                  {[...notes].reverse().map(note => (
                    <div key={note._id} className="card p-4 flex gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-slate-700 dark:text-slate-300">{note.content}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(note.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => deleteNote(note._id)} className="text-slate-400 hover:text-red-500 transition-colors self-start">
                        <RiDeleteBin2Line />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'details' && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-100 dark:border-surface-800">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button
              type="submit"
              form="task-form"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : <RiSaveLine />}
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
