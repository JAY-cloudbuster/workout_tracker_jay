import { Router } from 'express';
import exerciseController from '../controllers/exercise.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createExerciseSchema, updateExerciseSchema } from '../validators/workout.validator';

const router = Router();

// Public routes (with optional auth for custom exercises)
router.get('/', optionalAuth, exerciseController.getAll);
router.get('/search', exerciseController.search);
router.get('/muscle/:muscleGroup', exerciseController.getByMuscle);
router.get('/:id', exerciseController.getOne);

// Protected routes
router.use(authenticate);
router.post('/', validateBody(createExerciseSchema), exerciseController.create);
router.patch('/:id', validateBody(updateExerciseSchema), exerciseController.update);
router.delete('/:id', exerciseController.delete);
router.post('/:id/favorite', exerciseController.toggleFavorite);

export default router;
