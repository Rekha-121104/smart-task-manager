import { createContext, useContext, useReducer, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const TaskContext = createContext(null);

const initialState = {
  tasks: [],
  pagination: { total: 0, page: 1, pages: 1, limit: 10 },
  stats: { pending: 0, 'in-progress': 0, completed: 0 },
  filters: { status: 'all', priority: 'all', search: '', category: '' },
  isLoading: false,
  categories: [],
};

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, isLoading: action.payload };
    case 'SET_TASKS': return { ...state, tasks: action.payload.tasks, pagination: action.payload.pagination, stats: action.payload.stats, isLoading: false };
    case 'ADD_TASK': return { ...state, tasks: [action.payload, ...state.tasks], stats: { ...state.stats, [action.payload.status]: (state.stats[action.payload.status] || 0) + 1 } };
    case 'UPDATE_TASK': return { ...state, tasks: state.tasks.map(t => t._id === action.payload._id ? action.payload : t) };
    case 'DELETE_TASK': return { ...state, tasks: state.tasks.filter(t => t._id !== action.payload) };
    case 'SET_FILTERS': return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_CATEGORIES': return { ...state, categories: action.payload };
    case 'REORDER_TASKS': return { ...state, tasks: action.payload };
    default: return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const fetchTasks = useCallback(async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await api.get('/tasks', { params: { ...state.filters, ...params } });
      dispatch({ type: 'SET_TASKS', payload: data });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch tasks');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.filters]);

  const createTask = useCallback(async (taskData) => {
    const { data } = await api.post('/tasks', taskData);
    dispatch({ type: 'ADD_TASK', payload: data.task });
    toast.success('Task created!');
    return data.task;
  }, []);

  const updateTask = useCallback(async (id, updates) => {
    const { data } = await api.put(`/tasks/${id}`, updates);
    dispatch({ type: 'UPDATE_TASK', payload: data.task });
    toast.success('Task updated!');
    return data.task;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await api.delete(`/tasks/${id}`);
    dispatch({ type: 'DELETE_TASK', payload: id });
    toast.success('Task deleted');
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const fetchCategories = useCallback(async () => {
    const { data } = await api.get('/tasks/categories');
    dispatch({ type: 'SET_CATEGORIES', payload: data.categories });
  }, []);

  const reorderTasks = useCallback(async (reorderedTasks) => {
    dispatch({ type: 'REORDER_TASKS', payload: reorderedTasks });
    const orderData = reorderedTasks.map((t, i) => ({ id: t._id, order: i }));
    await api.put('/tasks/reorder', { tasks: orderData });
  }, []);

  return (
    <TaskContext.Provider value={{
      ...state,
      fetchTasks,
      createTask,
      updateTask,
      deleteTask,
      setFilters,
      fetchCategories,
      reorderTasks,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTask must be used within TaskProvider');
  return ctx;
};
