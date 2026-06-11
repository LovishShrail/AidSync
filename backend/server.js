import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { ethers } from 'ethers';
import FormData from 'form-data';
import fs from 'fs';
import { connectDB, Disaster, Donation, UserNonce } from './database.js';
const DisasterDonateABI = JSON.parse(
  fs.readFileSync(new URL('../frontend/src/contract/DisasterDonate.json', import.meta.url))
);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'aidsync_jwt_signing_secret_987654321';

app.use(cors());
app.use(express.json());

// Setup Multer for temp file uploads
const upload = multer({ dest: 'uploads/' });

// Initialize database
connectDB();

// Setup Ethers provider & contract listener
const providerUrl = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
const contractAddress = process.env.CONTRACT_ADDRESS || '0xF0d2bdAB7F99400a62bE6d20D5F4A0963470dEbE';

let provider;
let contract;

const initBlockchain = () => {
  try {
    provider = new ethers.JsonRpcProvider(providerUrl);
    contract = new ethers.Contract(contractAddress, DisasterDonateABI.abi, provider);
    console.log('Connected to Sepolia blockchain at:', contractAddress);

    // Sync existing data on boot
    syncDisastersFromBlockchain();

    // Setup live listeners
    listenToEvents();
  } catch (err) {
    console.error('Failed to initialize blockchain connection:', err.message);
  }
};

const syncDisastersFromBlockchain = async () => {
  if (!contract) return;
  console.log('Syncing disasters from blockchain...');
  try {
    const disastersData = await contract.getAllDisasterData();
    for (let i = 0; i < disastersData.length; i++) {
      const disaster = disastersData[i];
      const targetEth = Number(ethers.formatEther(disaster.targetCollectionAmount));
      const collectedEth = Number(ethers.formatEther(disaster.totalCollectedAmount));

      await Disaster.findOneAndUpdate(
        { disasterId: i },
        {
          disasterId: i,
          name: disaster.disasterName,
          type: disaster.disasterType,
          severity: disaster.severity,
          description: disaster.description,
          affectedAreas: disaster.affectedAreas,
          affectedPeopleCount: Number(disaster.affectedPeopleCount),
          targetAmount: targetEth,
          collectedAmount: collectedEth,
          reliefOrganizations: disaster.reliefOrganizations,
          topDonors: disaster.topDonors
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Synced ${disastersData.length} disasters successfully.`);
  } catch (error) {
    console.error('Error syncing blockchain data:', error);
  }
};

const listenToEvents = () => {
  if (!contract) return;
  
  try {
    if (contract.interface.hasEvent('Donated')) {
      // Listen to new donations to update collectedAmount and log history
      contract.on('Donated', async (disasterId, organization, donor, amount, event) => {
        try {
          console.log(`Event detected: Donation of ${ethers.formatEther(amount)} ETH to disaster #${disasterId}`);
          
          const amountEth = Number(ethers.formatEther(amount));
          const disId = Number(disasterId);

          // Create donation log
          await Donation.create({
            disasterId: disId,
            donor: donor,
            amount: amountEth,
            organization: organization,
            timestamp: new Date()
          });

          // Update cached disaster amount
          const disasterData = await contract.getDisaster(disId);
          await Disaster.findOneAndUpdate(
            { disasterId: disId },
            { 
              collectedAmount: Number(ethers.formatEther(disasterData.totalCollectedAmount)),
              topDonors: disasterData.topDonors
            }
          );
          console.log(`Updated cache for disaster #${disId}`);
        } catch (err) {
          console.error('Error handling Donated event:', err);
        }
      });
      console.log('Active event listeners registered.');
    } else {
      console.warn('Event "Donated" not found in contract ABI. Off-chain API calls will sync database cache.');
    }
  } catch (err) {
    console.error('Failed to check or register event listeners:', err);
  }
};

// ==========================================
// API ROUTES
// ==========================================

// 1. SIWE Auth - Get Nonce challenge
app.get('/api/auth/nonce', async (req, res) => {
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'Address is required' });

  try {
    const nonce = `Sign in to AidSync3D. Nonce: ${Math.random().toString(36).substring(2, 15)}`;
    await UserNonce.findOneAndUpdate(
      { address: address.toLowerCase() },
      { address: address.toLowerCase(), nonce, createdAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ nonce });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate nonce' });
  }
});

// 2. SIWE Auth - Verify Signature
app.post('/api/auth/verify', async (req, res) => {
  const { address, signature, nonce } = req.body;
  if (!address || !signature || !nonce) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const cachedRecord = await UserNonce.findOne({ address: address.toLowerCase() });
    if (!cachedRecord || cachedRecord.nonce !== nonce) {
      return res.status(400).json({ error: 'Challenge expired or invalid' });
    }

    // Recover address from signature
    const recoveredAddress = ethers.verifyMessage(nonce, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ error: 'Signature verification failed' });
    }

    // Delete nonce after successful signature
    await UserNonce.deleteOne({ address: address.toLowerCase() });

    // Generate JWT Token
    const token = jwt.sign({ address: address.toLowerCase() }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, success: true });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({ error: 'Failed to verify signature' });
  }
});

// 3. IPFS Media Upload - Multer + Pinata API (with fallback if keys are missing)
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const pinataJwt = process.env.PINATA_JWT;
  
  // If Pinata JWT is not configured, fallback to simulated IPFS hash for testing
  if (!pinataJwt || pinataJwt === 'your_pinata_jwt_here') {
    console.log('Pinata JWT not configured. Using mock IPFS upload...');
    // Clean up temp file
    fs.unlinkSync(req.file.path);
    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    return res.json({
      ipfsHash: mockHash,
      ipfsUrl: `https://ipfs.io/ipfs/${mockHash}`,
      isMock: true
    });
  }

  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const blob = new globalThis.Blob([fileBuffer], { type: req.file.mimetype });

    const nativeFormData = new globalThis.FormData();
    nativeFormData.append('file', blob, req.file.originalname);

    const metadata = JSON.stringify({ name: req.file.originalname });
    nativeFormData.append('pinataMetadata', metadata);

    const pinataOptions = JSON.stringify({ cidVersion: 0 });
    nativeFormData.append('pinataOptions', pinataOptions);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pinataJwt}`
      },
      body: nativeFormData
    });

    const pinataRes = await response.json();
    
    // Clean up temp file
    fs.unlinkSync(req.file.path);

    if (!response.ok) {
      console.error('Pinata upload error response:', pinataRes);
      return res.status(response.status).json({ error: pinataRes.error || 'Pinata upload failed' });
    }

    res.json({
      ipfsHash: pinataRes.IpfsHash,
      ipfsUrl: `https://ipfs.io/ipfs/${pinataRes.IpfsHash}`
    });
  } catch (error) {
    console.error('IPFS upload failed:', error);
    // Ensure temp file is cleaned up on error
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload to IPFS' });
  }
});

// 4. Platform Analytics (aggregation query)
app.get('/api/analytics', async (req, res) => {
  try {
    // 1. Group donations by type
    const disasters = await Disaster.find({});
    
    const typeGroup = {};
    const severityCount = { Critical: 0, High: 0, Medium: 0, Low: 0 };

    disasters.forEach(d => {
      // Category aggregation
      const type = d.type || 'Other';
      typeGroup[type] = (typeGroup[type] || 0) + d.collectedAmount;

      // Severity aggregation
      const sev = d.severity;
      if (severityCount[sev] !== undefined) {
        severityCount[sev]++;
      }
    });

    const categoryData = Object.keys(typeGroup).map(key => ({
      name: key,
      value: typeGroup[key]
    }));

    const severityData = Object.keys(severityCount).map(key => ({
      name: key,
      value: severityCount[key]
    }));

    // 2. Fetch last 10 donations for timeline
    const recentDonations = await Donation.find({})
      .sort({ timestamp: -1 })
      .limit(10);
    
    const donationTimeline = recentDonations.reverse().map(don => ({
      name: new Date(don.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: don.amount
    }));

    res.json({
      categoryData,
      severityData,
      donationTimeline
    });
  } catch (error) {
    console.error('Analytics aggregation error:', error);
    res.status(500).json({ error: 'Failed to aggregate analytics' });
  }
});

// 5. Get cached disasters
app.get('/api/disasters', async (req, res) => {
  try {
    const disasters = await Disaster.find({});
    res.json(disasters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cached disasters' });
  }
});

// 6. Update cached disaster with media URLs (JWT authenticated)
app.put('/api/disasters/:id/media', async (req, res) => {
  const { id } = req.params;
  const { videoUrl, modelUrl } = req.body;

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
  }

  try {
    const updated = await Disaster.findOneAndUpdate(
      { disasterId: Number(id) },
      { videoUrl, modelUrl },
      { new: true, upsert: true }
    );
    res.json({ success: true, disaster: updated });
  } catch (error) {
    console.error('Failed to update disaster media:', error);
    res.status(500).json({ error: 'Failed to update disaster media' });
  }
});

// 7. Get cached disaster detail by ID
app.get('/api/disasters/:id', async (req, res) => {
  try {
    const disaster = await Disaster.findOne({ disasterId: Number(req.params.id) });
    if (!disaster) return res.status(404).json({ error: 'Disaster not found' });
    res.json(disaster);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cached disaster' });
  }
});

// 8. Log a donation (called off-chain to sync database cache)
app.post('/api/donations', async (req, res) => {
  const { disasterId, donor, amount, organization } = req.body;
  if (disasterId === undefined || !donor || amount === undefined || !organization) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const donation = await Donation.create({
      disasterId: Number(disasterId),
      donor,
      amount: Number(amount),
      organization,
      timestamp: new Date()
    });

    // Also update cached disaster's collectedAmount
    await Disaster.findOneAndUpdate(
      { disasterId: Number(disasterId) },
      { $inc: { collectedAmount: Number(amount) } }
    );

    res.json({ success: true, donation });
  } catch (error) {
    console.error('Failed to log donation:', error);
    res.status(500).json({ error: 'Failed to log donation' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  initBlockchain();
});
