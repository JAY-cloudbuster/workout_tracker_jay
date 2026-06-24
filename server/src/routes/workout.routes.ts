import { Router } from 'express';
import workoutController from '../controllers/workout.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createWorkoutSchema, updateWorkoutSchema } from '../validators/workout.validator';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(workoutController.getAll)
  .post(validateBody(createWorkoutSchema), workoutController.create);

router.get('/calendar', workoutController.getCalendar);
router.get('/recent', workoutController.getRecent);

router.route('/:id')
  .get(workoutController.getOne)
  .patch(validateBody(updateWorkoutSchema), workoutController.update)
  .delete(workoutController.delete);

router.post('/:id/duplicate', workoutController.duplicate);

export default router;
