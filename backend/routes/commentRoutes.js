import express from 'express';
import { getComments, addComment, deleteComment } from '../controller/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/task/:taskId', protect, getComments);
router.post('/', protect, addComment);
router.delete('/:id', protect, deleteComment);

export default router;
