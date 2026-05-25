// routes/admin.js
const express = require('express');
const router = express.Router();
const { getAllUsers, getUserDetails, deleteUser, toggleUserStatus, getAnalytics } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/analytics', getAnalytics);

module.exports = router;
