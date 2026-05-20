import { Router } from 'express';
import { getThemes, getActiveTheme, createTheme, updateTheme, deleteTheme, activateTheme } from '../controllers/themeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public - get active theme (needed for all users to render UI)
router.get('/active', getActiveTheme);

// Protected - list themes (admins)
router.get('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), getThemes);

// SUPER_ADMIN only
router.post('/', authenticate, authorize('SUPER_ADMIN'), createTheme);
router.put('/:id', authenticate, authorize('SUPER_ADMIN'), updateTheme);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), deleteTheme);
router.post('/:id/activate', authenticate, authorize('SUPER_ADMIN'), activateTheme);

export default router;
