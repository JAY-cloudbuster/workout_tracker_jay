import { Router } from 'express';
import programController from '../controllers/program.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createProgramSchema, updateProgramSchema } from '../validators/workout.validator';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(programController.getAll)
  .post(validateBody(createProgramSchema), programController.create);

router.get('/active', programController.getActive);

router.route('/:id')
  .get(programController.getOne)
  .patch(validateBody(updateProgramSchema), programController.update)
  .delete(programController.delete);

router.post('/:id/activate', programController.activate);
router.post('/:id/advance', programController.advance);

export default router;
