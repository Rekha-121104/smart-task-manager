import { useTask } from '../../context/TaskContext';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priority' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default function TaskFilters() {
  const { filters, setFilters, categories } = useTask();

  const handleReset = () => setFilters({ status: 'all', priority: 'all', category: '', search: '' });

  return (
    <div className="card p-4 flex flex-wrap gap-3 items-end">
      <div>
        <label className="label text-xs">Status</label>
        <select
          className="input py-2 text-sm"
          value={filters.status}
          onChange={e => setFilters({ status: e.target.value })}
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div>
        <label className="label text-xs">Priority</label>
        <select
          className="input py-2 text-sm"
          value={filters.priority}
          onChange={e => setFilters({ priority: e.target.value })}
        >
          {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {categories.length > 0 && (
        <div>
          <label className="label text-xs">Category</label>
          <select
            className="input py-2 text-sm"
            value={filters.category}
            onChange={e => setFilters({ category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      <button onClick={handleReset} className="btn-ghost text-sm py-2">
        Reset Filters
      </button>
    </div>
  );
}
