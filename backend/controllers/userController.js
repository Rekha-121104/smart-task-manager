const User = require('../models/User');
const Activity = require('../models/Activity');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Update profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  const allowedFields = ['name', 'preferences'];
  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  await Activity.create({
    user: req.user._id,
    action: 'profile_updated',
    description: 'Profile information updated',
  });

  res.json({ success: true, user });
};

// @desc    Upload avatar
// @route   PUT /api/users/avatar
exports.uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image provided' });
  }

  const user = await User.findById(req.user._id);

  // Delete old avatar from Cloudinary
  if (user.avatar?.public_id) {
    await deleteFromCloudinary(user.avatar.public_id);
  }

  user.avatar = {
    public_id: req.file.filename,
    url: req.file.path,
  };
  await user.save();

  await Activity.create({
    user: req.user._id,
    action: 'avatar_updated',
    description: 'Profile picture updated',
  });

  res.json({ success: true, user });
};

// @desc    Change password
// @route   PUT /api/users/change-password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  await Activity.create({
    user: req.user._id,
    action: 'password_changed',
    description: 'Password changed',
  });

  res.json({ success: true, message: 'Password changed successfully' });
};

// @desc    Delete own account
// @route   DELETE /api/users/me
exports.deleteAccount = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.avatar?.public_id) {
    await deleteFromCloudinary(user.avatar.public_id);
  }

  await user.deleteOne();
  res.json({ success: true, message: 'Account deleted' });
};
