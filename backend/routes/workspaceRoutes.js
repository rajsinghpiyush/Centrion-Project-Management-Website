import express from 'express';
import {
    getWorkspaces,
    getWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
} from '../controller/workspaceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getWorkspaces)
    .post(protect, createWorkspace);

router.route('/:id')
    .get(protect, getWorkspace)
    .put(protect, updateWorkspace)
    .delete(protect, deleteWorkspace);

export default router;
