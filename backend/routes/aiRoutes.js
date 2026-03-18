import express from 'express';
import { convertNotesToTasks, rewriteToUserStory, generateKanbanStructure, getWorkspaceInsights } from '../controller/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/meeting-to-tasks', protect, convertNotesToTasks);
router.post('/rewrite-task', protect, rewriteToUserStory);
router.post('/generate-kanban', protect, generateKanbanStructure);
router.get('/insights/:workspaceId', protect, getWorkspaceInsights);

export default router;
