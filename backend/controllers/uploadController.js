import fs from 'fs';

export const uploadToIPFS = async (req, res) => {
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
};
