import { Router } from 'express';
import { getActivityLogs, getDashboardStats } from '../controllers/activityController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getActivityLogs);
router.get('/stats', getDashboardStats);

export default router;
