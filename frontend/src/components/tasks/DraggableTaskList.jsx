import { useState } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RiDraggable, RiEditLine, RiDeleteBin2Line, RiCheckLine, RiCalendarLine } from 'react-icons/ri';
import { useTask } from '../../context/TaskContext';
import { formatDate, isOverdue, priorityConfig, statusConfig } from '../../utils/helpers';

function SortableTask({ task, onEdit }) {
  const { updateTask, deleteTask } = useTask();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card p-4 flex items-center gap-3 group hover:shadow-md transition-all ${isDragging ? 'shadow-glow z-50' : ''}`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
      >
        <RiDraggable className="text-lg" />
      </button>

      {/* Checkbox */}
      <button
        onClick={() => updateTask(task._id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          task.status === 'completed'
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-slate-300 dark:border-slate-600 hover:border-primary-500'
        }`}
      >
        {task.status === 'completed' && <RiCheckLine className="text-white text-xs" />}
      </button>

      {/* Priority dot */}
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityConfig[task.priority]?.dot}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          {task.category && (
            <span className="text-xs text-slate-400">{task.category}</span>
          )}
          {task.dueDate && (
            <span className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-500' : 'text-slate-400'}`}>
              <RiCalendarLine className="text-xs" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        <span className={`badge ${priorityConfig[task.priority]?.color} text-xs`}>
          {priorityConfig[task.priority]?.label}
        </span>
        <span className={`badge ${statusConfig[task.status]?.color} text-xs`}>
          {statusConfig[task.status]?.label}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-400 hover:text-primary-600 transition-colors"
        >
          <RiEditLine className="text-sm" />
        </button>
        <button
          onClick={() => { if (confirm('Delete this task?')) deleteTask(task._id); }}
          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
        >
          <RiDeleteBin2Line className="text-sm" />
        </button>
      </div>
    </div>
  );
}

export default function DraggableTaskList({ tasks, onEdit }) {
  const { reorderTasks } = useTask();
  const [items, setItems] = useState(tasks);

  // Sync when tasks prop changes
  if (tasks.length !== items.length || tasks[0]?._id !== items[0]?._id) {
    setItems(tasks);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(t => t._id === active.id);
    const newIndex = items.findIndex(t => t._id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    reorderTasks(newItems);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(t => t._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 animate-stagger">
          {items.map(task => (
            <SortableTask key={task._id} task={task} onEdit={onEdit} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
