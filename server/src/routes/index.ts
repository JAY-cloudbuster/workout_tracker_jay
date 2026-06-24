import { Router } from 'express';
import authRoutes from './auth.routes';
import workoutRoutes from './workout.routes';
import exerciseRoutes from './exercise.routes';
import programRoutes from './program.routes';
import recoveryRoutes from './recovery.routes';
import folderRoutes from './folder.routes';
import exportRoutes from './export.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/workouts', workoutRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/programs', programRoutes);
router.use('/recovery', recoveryRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/folders', folderRoutes);
router.use('/export', exportRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'GymTracker Pro API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
