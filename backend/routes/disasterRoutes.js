import { Router } from 'express';
import { getDisasters, getDisasterById, updateDisasterMedia } from '../controllers/disasterController.js';
import { verifySoftAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getDisasters);
router.get('/:id', getDisasterById);
router.put('/:id/media', verifySoftAuth, updateDisasterMedia);

export default router;
