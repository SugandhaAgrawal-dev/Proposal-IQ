import { Router } from 'express';
import { exportDOCX, exportExcel } from '../controllers/exportController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/:id/docx', exportDOCX);
router.get('/:id/excel', exportExcel);

export default router;
