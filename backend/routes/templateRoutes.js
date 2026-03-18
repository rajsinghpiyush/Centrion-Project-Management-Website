import express from 'express';
import { getTemplates, createTemplate, getTemplate, deleteTemplate } from '../controller/templateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getTemplates)
    .post(protect, createTemplate);

router.route('/:id')
    .get(protect, getTemplate)
    .delete(protect, deleteTemplate);

export default router;
