import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Force Node.js runtime to use Google and Cloudflare DNS resolvers
// This bypasses ISP DNS hijacking or blocking of _mongodb._tcp SRV records.
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aidsync';

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// 1. Disaster Schema
const disasterSchema = new mongoose.Schema({
  disasterId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  severity: { type: String, required: true },
  description: { type: String },
  affectedAreas: { type: String },
  affectedPeopleCount: { type: Number, default: 0 },
  targetAmount: { type: Number, required: true },
  collectedAmount: { type: Number, default: 0 },
  reliefOrganizations: [{ type: String }],
  topDonors: [{ type: String }],
  videoUrl: { type: String },
  modelUrl: { type: String }
}, { timestamps: true });

// 2. Donation Schema
const donationSchema = new mongoose.Schema({
  disasterId: { type: Number, required: true },
  donor: { type: String, required: true },
  amount: { type: Number, required: true },
  organization: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// 3. UserNonce Schema (cryptographic challenge for SIWE)
const userNonceSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true, lowercase: true },
  nonce: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // 10 minutes expiration
});

export const Disaster = mongoose.model('Disaster', disasterSchema);
export const Donation = mongoose.model('Donation', donationSchema);
export const UserNonce = mongoose.model('UserNonce', userNonceSchema);
