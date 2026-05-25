import { format, formatDistanceToNow, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM d, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
};

export const timeAgo = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'completed') return false;
  const d = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return isPast(d);
};

export const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };

export const priorityConfig = {
  urgent: { label: 'Urgent', color: 'priority-urgent', dot: 'bg-purple-500' },
  high: { label: 'High', color: 'priority-high', dot: 'bg-red-500' },
  medium: { label: 'Medium', color: 'priority-medium', dot: 'bg-amber-500' },
  low: { label: 'Low', color: 'priority-low', dot: 'bg-emerald-500' },
};

export const statusConfig = {
  pending: { label: 'Pending', color: 'status-pending' },
  'in-progress': { label: 'In Progress', color: 'status-in-progress' },
  completed: { label: 'Completed', color: 'status-completed' },
  archived: { label: 'Archived', color: 'status-archived' },
};

export const truncate = (str, n = 80) => str?.length > n ? str.substring(0, n) + '...' : str;

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

export const cn = (...classes) => classes.filter(Boolean).join(' ');
