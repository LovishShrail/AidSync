import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './database.js';
import { initBlockchain } from './services/blockchain.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import disasterRoutes from './routes/disasterRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize database
connectDB();

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  initBlockchain();
});
