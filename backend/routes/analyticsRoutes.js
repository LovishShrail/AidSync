import { Router } from 'express';
import { getAnalytics } from '../controllers/disasterController.js';

const router = Router();

router.get('/', getAnalytics);

export default router;
