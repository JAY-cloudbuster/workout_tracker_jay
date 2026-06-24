import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Dashboard/Stats
router.get('/dashboard', analyticsController.getConventionalStats);

// Volume
router.get('/volume/weekly', analyticsController.getWeeklyVolume);
router.get('/volume/monthly', analyticsController.getMonthlyVolume);
router.get('/volume/muscle', analyticsController.getVolumePerMuscle);

// Strength
router.get('/strength/:exerciseId', analyticsController.getStrengthTrends);

// Metrics
router.get('/frequency', analyticsController.getTrainingFrequency);
router.get('/consistency', analyticsController.getConsistencyScore);
router.get('/density', analyticsController.getTrainingDensity);
router.get('/readiness', analyticsController.getReadinessScore);

// Body
router.get('/body-weight', analyticsController.getBodyWeightTrend);

// Heatmap
router.get('/heatmap', analyticsController.getHeatmap);

export default router;
