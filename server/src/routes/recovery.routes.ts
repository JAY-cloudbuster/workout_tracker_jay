import { Router } from 'express';
import recoveryController from '../controllers/recovery.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  createRecoveryLogSchema,
  updateRecoveryLogSchema,
  createBodyMeasurementSchema,
  updateBodyMeasurementSchema,
} from '../validators/workout.validator';

const router = Router();

router.use(authenticate);

// Recovery Logs
router.route('/logs')
  .get(recoveryController.getRecoveryLogs)
  .post(validateBody(createRecoveryLogSchema), recoveryController.createRecoveryLog);

router.get('/logs/latest', recoveryController.getLatestRecoveryLog);

router.route('/logs/:id')
  .patch(validateBody(updateRecoveryLogSchema), recoveryController.updateRecoveryLog)
  .delete(recoveryController.deleteRecoveryLog);

// Body Measurements
router.route('/measurements')
  .get(recoveryController.getMeasurements)
  .post(validateBody(createBodyMeasurementSchema), recoveryController.createMeasurement);

router.get('/measurements/latest', recoveryController.getLatestMeasurement);

router.route('/measurements/:id')
  .patch(validateBody(updateBodyMeasurementSchema), recoveryController.updateMeasurement)
  .delete(recoveryController.deleteMeasurement);

// Personal Records
router.get('/records', recoveryController.getPersonalRecords);
router.get('/records/latest', recoveryController.getLatestPRs);

// Muscle Recovery
router.get('/muscle-recovery', recoveryController.getMuscleRecovery);

export default router;
