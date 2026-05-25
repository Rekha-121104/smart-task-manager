const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'task_created', 'task_updated', 'task_deleted',
      'task_completed', 'task_reopened', 'task_archived',
      'profile_updated', 'password_changed', 'avatar_updated',
      'logged_in', 'logged_out',
    ],
  },
  description: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
}, {
  timestamps: true,
});

activitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
