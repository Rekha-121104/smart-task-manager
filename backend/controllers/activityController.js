const Activity = require('../models/Activity');

// @desc    Get user activities
// @route   GET /api/activities
exports.getActivities = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const total = await Activity.countDocuments({ user: req.user._id });
  const activities = await Activity.find({ user: req.user._id })
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit))
    .populate('taskId', 'title');

  res.json({
    success: true,
    activities,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
  });
};

// @desc    Clear all activities
// @route   DELETE /api/activities
exports.clearActivities = async (req, res) => {
  await Activity.deleteMany({ user: req.user._id });
  res.json({ success: true, message: 'Activity log cleared' });
};
