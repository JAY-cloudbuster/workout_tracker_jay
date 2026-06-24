import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import folderController from '../controllers/folder.controller';

const router = Router();

router.use(authenticate);

router.post('/', folderController.create);
router.get('/', folderController.getAll);
router.put('/:id', folderController.update);
router.delete('/:id', folderController.delete);

export default router;
