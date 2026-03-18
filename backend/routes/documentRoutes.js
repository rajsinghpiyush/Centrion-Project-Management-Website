import express from 'express';
import { getDocuments, getDocument, createDocument, updateDocument, deleteDocument } from '../controller/documentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getDocuments);
router.post('/', protect, createDocument);
router.get('/:id', protect, getDocument);
router.put('/:id', protect, updateDocument);
router.delete('/:id', protect, deleteDocument);

export default router;
