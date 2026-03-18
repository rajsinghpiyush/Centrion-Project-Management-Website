import express from 'express';
import { getProjectMessages, getDirectMessages, sendMessage } from '../controller/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/project/:projectId', protect, getProjectMessages);
router.get('/direct/:userId', protect, getDirectMessages);
router.post('/', protect, sendMessage);

export default router;
