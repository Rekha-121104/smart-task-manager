const express = require('express');
const router = express.Router();
const { updateProfile, uploadAvatar, changePassword, deleteAccount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar: multerUpload } = require('../config/cloudinary');

router.use(protect);
router.put('/profile', updateProfile);
router.put('/avatar', multerUpload.single('avatar'), uploadAvatar);
router.put('/change-password', changePassword);
router.delete('/me', deleteAccount);

module.exports = router;
