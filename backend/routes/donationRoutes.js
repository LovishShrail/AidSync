import { Router } from 'express';
import { logDonation } from '../controllers/donationController.js';

const router = Router();

router.post('/', logDonation);

export default router;
