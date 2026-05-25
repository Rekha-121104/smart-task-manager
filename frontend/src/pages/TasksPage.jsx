import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiAddLine, RiSearchLine, RiFilterLine, RiGridLine,
  RiListUnordered, RiRefreshLine,
} from 'react-icons/ri';
import { useTask } from '../context/TaskContext';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import TaskFilters from '../components/tasks/TaskFilters';
import DraggableTaskList from '../components/tasks/DraggableTaskList';
import SkeletonCard from '../components/common/SkeletonCard';
import Pagination from '../components/common/Pagination';
import { debounce } from '../utils/helpers';

export default function TasksPage() {
  const { tasks, pagination, stats, filters, isLoading, fetchTasks, setFilters, fetchCategories } = useTask();
  const [viewMode, setViewMode] = useState('list'); // list | grid | kanban
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    fetchTasks({ page: 1 });
    fetchCategories();
  }, [filters]);

  const debouncedSearch = useCallback(
    debounce((val) => setFilters({ search: val }), 400),
    []
  );

  const handleSearch = (e) => {
    setSearchVal(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handlePageChange = (page) => fetchTasks({ page });

  const openCreate = () => { setEditTask(null); setShowModal(true); };
  const openEdit = (task) => { setEditTask(task); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditTask(null); };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">My Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {pagination.total} total · {stats.completed} completed · {stats.pending} pending
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary self-start sm:self-auto">
          <RiAddLine className="text-lg" />
          New Task
        </button>
      </div>

      {/* Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search tasks..."
            value={searchVal}
            onChange={handleSearch}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary gap-2 ${showFilters ? 'border-primary-500 text-primary-600' : ''}`}
          >
            <RiFilterLine />
            Filters
            {(filters.status !== 'all' || filters.priority !== 'all' || filters.category) && (
              <span className="w-2 h-2 bg-primary-500 rounded-full" />
            )}
          </button>

          <div className="flex items-center bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
            {[
              { mode: 'list', icon: RiListUnordered },
              { mode: 'grid', icon: RiGridLine },
            ].map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-white dark:bg-surface-700 shadow text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <Icon className="text-lg" />
              </button>
            ))}
          </div>

          <button onClick={() => fetchTasks()} className="btn-ghost p-2.5">
            <RiRefreshLine className={`text-lg ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <TaskFilters />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List */}
      {isLoading ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-16 flex flex-col items-center justify-center text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
            <RiGridLine className="text-4xl text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No tasks found</h3>
          <p className="text-slate-400 text-sm mb-6">
            {filters.search || filters.status !== 'all' || filters.priority !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first task to get started!'}
          </p>
          <button onClick={openCreate} className="btn-primary">
            <RiAddLine />
            Create Task
          </button>
        </motion.div>
      ) : viewMode === 'list' ? (
        <DraggableTaskList tasks={tasks} onEdit={openEdit} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
          {tasks.map(task => (
            <TaskCard key={task._id} task={task} onEdit={openEdit} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          limit={pagination.limit}
          onChange={handlePageChange}
        />
      )}

      {/* Task Modal */}
      <AnimatePresence>
        {showModal && (
          <TaskModal task={editTask} onClose={closeModal} />
        )}
      </AnimatePresence>
    </div>
  );
}
