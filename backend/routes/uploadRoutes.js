import { Router } from 'express';
import { uploadToIPFS } from '../controllers/uploadController.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/', upload.single('file'), uploadToIPFS);

export default router;
