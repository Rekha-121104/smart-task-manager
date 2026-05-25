const express = require('express');
const router = express.Router();
const {
  getTasks, getTask, createTask, updateTask, deleteTask,
  reorderTasks, addNote, deleteNote, addAttachment,
  getDashboardStats, getCategories,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAttachment } = require('../config/cloudinary');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/categories', getCategories);
router.put('/reorder', reorderTasks);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

router.post('/:id/notes', addNote);
router.delete('/:id/notes/:noteId', deleteNote);
router.post('/:id/attachments', uploadAttachment.single('file'), addAttachment);

module.exports = router;
