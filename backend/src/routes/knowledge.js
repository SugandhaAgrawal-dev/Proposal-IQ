import { Router } from 'express';
import { getDocuments, uploadDocument, deleteDocument } from '../controllers/knowledgeController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadKnowledge, handleUploadError } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.get('/', getDocuments);
router.post('/upload', uploadKnowledge, handleUploadError, uploadDocument);
router.delete('/:id', deleteDocument);

export default router;
