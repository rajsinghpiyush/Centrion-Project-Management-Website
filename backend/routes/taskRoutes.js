import express from 'express';
import {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    moveTask
} from '../controller/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getTasks)
    .post(protect, createTask);

router.route('/:id')
    .get(protect, getTask)
    .put(protect, updateTask)
    .delete(protect, deleteTask);

router.put('/:id/move', protect, moveTask);

export default router;
