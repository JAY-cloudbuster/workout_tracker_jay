import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import exportController from '../controllers/export.controller';

const router = Router();

router.use(authenticate);

router.get('/csv', exportController.exportCSV);

export default router;
