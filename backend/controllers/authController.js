const User = require('../models/User');
const Activity = require('../models/Activity');
const { sendEmail } = require('../utils/emailService');
const crypto = require('crypto');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateAuthToken();
  const userObj = user.toObject();
  delete userObj.password;

  res.status(statusCode).json({
    success: true,
    token,
    user: userObj,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password });

  await Activity.create({
    user: user._id,
    action: 'logged_in',
    description: 'Account created and logged in',
  });

  // Welcome email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Welcome to Smart Task Manager!',
      template: 'welcome',
      data: { name: user.name },
    });
  } catch (err) {
    console.error('Welcome email failed:', err.message);
  }

  sendTokenResponse(user, 201, res);
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account has been deactivated' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  await Activity.create({
    user: user._id,
    action: 'logged_in',
    description: 'User logged in',
  });

  // Emit socket event
  const io = req.app.get('io');
  io?.to(`user:${user._id}`).emit('user:login', { userId: user._id });

  sendTokenResponse(user, 200, res);
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
};

// @desc    Logout
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  await Activity.create({
    user: req.user._id,
    action: 'logged_out',
    description: 'User logged out',
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'No account with that email' });
  }

  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'resetPassword',
      data: { name: user.name, resetUrl },
    });
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({ success: false, message: 'Email could not be sent' });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
};
