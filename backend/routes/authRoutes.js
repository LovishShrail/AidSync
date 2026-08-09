import { Router } from 'express';
import { getNonce, verifySignature, logout } from '../controllers/authController.js';

const router = Router();

router.get('/nonce', getNonce);
router.post('/verify', verifySignature);
router.post('/logout', logout);

export default router;
