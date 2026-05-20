import { Router } from 'express';
import { getRFPs, getRFP, uploadRFP, analyzeRFPHandler, generateProposalHandler, complianceHandler, reviewHandler, deleteRFP } from '../controllers/rfpController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadRFP as uploadMiddleware, handleUploadError } from '../middleware/upload.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// All RFP routes require authentication
router.use(authenticate);

router.get('/', getRFPs);
router.get('/:id', getRFP);
router.post('/upload', uploadMiddleware, handleUploadError, uploadRFP);
router.delete('/:id', deleteRFP);

// AI agent endpoints (rate limited)
router.post('/:id/analyze', aiLimiter, analyzeRFPHandler);
router.post('/:id/generate', aiLimiter, generateProposalHandler);
router.post('/:id/compliance', aiLimiter, complianceHandler);
router.post('/:id/review', aiLimiter, reviewHandler);

export default router;
