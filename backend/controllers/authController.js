import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { UserNonce } from '../database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aidsync_jwt_signing_secret_987654321';

export const getNonce = async (req, res) => {
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
};

export const verifySignature = async (req, res) => {
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
};
