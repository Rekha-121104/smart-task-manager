const User = require('../models/User');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  const { page = 1, limit = 10, search, role } = req.query;
  const query = {};
  if (search) query.$or = [
    { name: new RegExp(search, 'i') },
    { email: new RegExp(search, 'i') },
  ];
  if (role) query.role = role;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit));

  res.json({
    success: true,
    users,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
  });
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
exports.getUserDetails = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const taskStats = await Task.aggregate([
    { $match: { user: user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({ success: true, user, taskStats });
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (user.role === 'admin') {
    return res.status(403).json({ success: false, message: 'Cannot delete admin users' });
  }

  if (user.avatar?.public_id) {
    await deleteFromCloudinary(user.avatar.public_id);
  }

  await Task.deleteMany({ user: user._id });
  await Activity.deleteMany({ user: user._id });
  await user.deleteOne();

  res.json({ success: true, message: 'User and all associated data deleted' });
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
exports.toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.isActive = !user.isActive;
  await user.save();

  res.json({ success: true, user, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
};

// @desc    Get analytics
// @route   GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  const [
    totalUsers, activeUsers, totalTasks,
    tasksByStatus, tasksByPriority,
    userGrowth, taskGrowth,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Task.countDocuments(),

    Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),

    User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),

    Task.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),
  ]);

  res.json({
    success: true,
    analytics: {
      totalUsers,
      activeUsers,
      totalTasks,
      tasksByStatus,
      tasksByPriority,
      userGrowth,
      taskGrowth,
    },
  });
};
