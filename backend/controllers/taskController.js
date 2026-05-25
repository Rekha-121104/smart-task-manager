const Task = require('../models/Task');
const Activity = require('../models/Activity');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all tasks for user
// @route   GET /api/tasks
exports.getTasks = async (req, res) => {
  const {
    status, priority, category, search,
    page = 1, limit = 10, sort = '-createdAt',
    dueDate, tags,
  } = req.query;

  const query = { user: req.user._id, isArchived: false };

  if (status && status !== 'all') query.status = status;
  if (priority && priority !== 'all') query.priority = priority;
  if (category) query.category = new RegExp(category, 'i');
  if (tags) query.tags = { $in: tags.split(',') };
  if (dueDate) {
    const date = new Date(dueDate);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    query.dueDate = { $gte: date, $lt: nextDay };
  }

  if (search) {
    query.$text = { $search: search };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Task.countDocuments(query);

  const tasks = await Task.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean({ virtuals: true });

  // Stats
  const stats = await Task.aggregate([
    { $match: { user: req.user._id, isArchived: false } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const statusCounts = { pending: 0, 'in-progress': 0, completed: 0 };
  stats.forEach(s => { statusCounts[s._id] = s.count; });

  res.json({
    success: true,
    tasks,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit),
    },
    stats: statusCounts,
  });
};

// @desc    Get single task
// @route   GET /api/tasks/:id
exports.getTask = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  res.json({ success: true, task });
};

// @desc    Create task
// @route   POST /api/tasks
exports.createTask = async (req, res) => {
  req.body.user = req.user._id;
  const task = await Task.create(req.body);

  await Activity.create({
    user: req.user._id,
    action: 'task_created',
    description: `Created task: "${task.title}"`,
    taskId: task._id,
    metadata: { taskTitle: task.title, priority: task.priority },
  });

  const io = req.app.get('io');
  io?.to(`user:${req.user._id}`).emit('task:created', task);

  res.status(201).json({ success: true, task });
};

// @desc    Update task
// @route   PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  let task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const prevStatus = task.status;
  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  let action = 'task_updated';
  let description = `Updated task: "${task.title}"`;
  if (prevStatus !== task.status) {
    if (task.status === 'completed') {
      action = 'task_completed';
      description = `Completed task: "${task.title}"`;
    } else if (prevStatus === 'completed') {
      action = 'task_reopened';
      description = `Reopened task: "${task.title}"`;
    }
  }

  await Activity.create({
    user: req.user._id,
    action,
    description,
    taskId: task._id,
    metadata: { taskTitle: task.title },
  });

  const io = req.app.get('io');
  io?.to(`user:${req.user._id}`).emit('task:updated', task);

  res.json({ success: true, task });
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  // Delete attachments from Cloudinary
  for (const att of task.attachments) {
    await deleteFromCloudinary(att.public_id);
  }

  await task.deleteOne();

  await Activity.create({
    user: req.user._id,
    action: 'task_deleted',
    description: `Deleted task: "${task.title}"`,
    metadata: { taskTitle: task.title },
  });

  const io = req.app.get('io');
  io?.to(`user:${req.user._id}`).emit('task:deleted', { taskId: req.params.id });

  res.json({ success: true, message: 'Task deleted' });
};

// @desc    Update task order (drag and drop)
// @route   PUT /api/tasks/reorder
exports.reorderTasks = async (req, res) => {
  const { tasks } = req.body; // [{ id, order }]

  const bulkOps = tasks.map(({ id, order }) => ({
    updateOne: {
      filter: { _id: id, user: req.user._id },
      update: { $set: { order } },
    },
  }));

  await Task.bulkWrite(bulkOps);

  const io = req.app.get('io');
  io?.to(`user:${req.user._id}`).emit('tasks:reordered', tasks);

  res.json({ success: true, message: 'Tasks reordered' });
};

// @desc    Add note to task
// @route   POST /api/tasks/:id/notes
exports.addNote = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

  task.notes.push({ content: req.body.content });
  await task.save();

  res.json({ success: true, task });
};

// @desc    Delete note from task
// @route   DELETE /api/tasks/:id/notes/:noteId
exports.deleteNote = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

  task.notes = task.notes.filter(n => n._id.toString() !== req.params.noteId);
  await task.save();

  res.json({ success: true, task });
};

// @desc    Upload attachment to task
// @route   POST /api/tasks/:id/attachments
exports.addAttachment = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  task.attachments.push({
    public_id: req.file.filename,
    url: req.file.path,
    filename: req.file.originalname,
    fileType: req.file.mimetype,
    size: req.file.size,
  });
  await task.save();

  res.json({ success: true, task });
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/dashboard
exports.getDashboardStats = async (req, res) => {
  const userId = req.user._id;

  const [statusStats, priorityStats, recentTasks, upcomingTasks, weeklyStats] = await Promise.all([
    // Status breakdown
    Task.aggregate([
      { $match: { user: userId, isArchived: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Priority breakdown
    Task.aggregate([
      { $match: { user: userId, isArchived: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),

    // Recent tasks
    Task.find({ user: userId }).sort('-createdAt').limit(5).lean(),

    // Upcoming due tasks (next 7 days)
    Task.find({
      user: userId,
      dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      status: { $ne: 'completed' },
    }).sort('dueDate').limit(5).lean(),

    // Tasks created in last 7 days (daily count)
    Task.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          created: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const total = await Task.countDocuments({ user: userId, isArchived: false });
  const completed = statusStats.find(s => s._id === 'completed')?.count || 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  res.json({
    success: true,
    stats: {
      total,
      completionRate,
      byStatus: statusStats,
      byPriority: priorityStats,
    },
    recentTasks,
    upcomingTasks,
    weeklyStats,
  });
};

// @desc    Get categories
// @route   GET /api/tasks/categories
exports.getCategories = async (req, res) => {
  const categories = await Task.distinct('category', { user: req.user._id });
  res.json({ success: true, categories });
};
