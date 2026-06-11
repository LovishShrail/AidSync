import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Web3Context } from '../../context/Web3Context';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import { ethers } from 'ethers';

const DisasterForm = () => {
  const { contract, account, authToken, loginWithSignature } = useContext(Web3Context);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    disasterName: '',
    severity: 'Medium',
    disasterType: 'Earthquake',
    description: '',
    affectedAreas: '',
    affectedPeopleCount: '',
    targetCollectionAmount: '', 
    reliefOrganizations: []
  });
  
  const [availableOrgs, setAvailableOrgs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [videoFile, setVideoFile] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [videoDragOver, setVideoDragOver] = useState(false);
  const [modelDragOver, setModelDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  const disasterTypes = [
    'Earthquake', 'Flood', 'Hurricane', 'Wildfire',
    'Tornado', 'Tsunami', 'Drought', 'Volcanic Eruption',
    'Landslide', 'Pandemic', 'Conflict', 'Other'
  ];

  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (contract) {
        try {
          const [addresses, names, donations] = await contract.getAllOrganizations();
          
          const orgs = addresses.map((address, index) => ({
            address: address,
            name: names[index],
            totalDonations: donations[index]
          }));
          
          setAvailableOrgs(orgs);
        } catch (err) {
          console.error("Error fetching organizations:", err);
          setError("Failed to load organizations");
        }
      }
    };
    
    fetchOrganizations();
  }, [contract]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOrgSelect = (orgAddress) => {
    setFormData(prev => {
      const alreadySelected = prev.reliefOrganizations.includes(orgAddress);
      return {
        ...prev,
        reliefOrganizations: alreadySelected
          ? prev.reliefOrganizations.filter(addr => addr !== orgAddress)
          : [...prev.reliefOrganizations, orgAddress]
      };
    });
  };

  const handleDragOver = (e, setDragOver) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e, setDragOver) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e, setFile, setDragOver) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const uploadToIPFS = async (file) => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);

    const headers = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${apiBase}/api/upload`, {
      method: 'POST',
      headers,
      body: bodyFormData
    });

    if (!response.ok) {
      throw new Error(`Failed to upload ${file.name} to IPFS`);
    }

    const data = await response.json();
    return data.ipfsUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUploadProgress(null);
    
    try {
      let videoUrl = '';
      let modelUrl = '';

      if (videoFile || modelFile) {
        let currentToken = authToken;
        if (!currentToken) {
          setUploadProgress("Authenticating wallet with signature...");
          currentToken = await loginWithSignature();
        }

        if (videoFile) {
          setUploadProgress(`Uploading drone video "${videoFile.name}" to IPFS...`);
          videoUrl = await uploadToIPFS(videoFile);
        }

        if (modelFile) {
          setUploadProgress(`Uploading 3D model "${modelFile.name}" to IPFS...`);
          modelUrl = await uploadToIPFS(modelFile);
        }
      }

      setUploadProgress("Confirm transaction in your wallet...");

      const tx = await contract.createDisaster(
        formData.disasterName,
        formData.severity,
        formData.disasterType,
        formData.description,
        formData.affectedAreas,
        formData.affectedPeopleCount,
        ethers.parseEther(formData.targetCollectionAmount),
        formData.reliefOrganizations
      );
      
      setUploadProgress("Waiting for transaction confirmation...");
      await tx.wait();

      if (videoUrl || modelUrl) {
        setUploadProgress("Syncing media URLs to database cache...");
        try {
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const disastersData = await contract.getAllDisasterData();
          const newDisasterId = disastersData.length - 1;

          const headers = { 'Content-Type': 'application/json' };
          const storedToken = localStorage.getItem('authToken');
          if (storedToken) {
            headers['Authorization'] = `Bearer ${storedToken}`;
          }

          const response = await fetch(`${apiBase}/api/disasters/${newDisasterId}/media`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ videoUrl, modelUrl })
          });

          if (!response.ok) {
            console.error("Failed to sync media URLs to backend");
          }
        } catch (syncErr) {
          console.error("Failed to sync media URLs:", syncErr);
        }
      }

      setUploadProgress(null);
      setSuccess(true);
      setTimeout(() => navigate('/disasters'), 2000);
    } catch (err) {
      console.error("Error creating disaster:", err);
      setError(err.message || "Failed to create disaster");
      setUploadProgress(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Access Required</h2>
        <p className="text-gray-600">
          You must be connected with an admin account to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Disaster</h2>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message="Disaster created successfully!" />}
      
      {uploadProgress && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm font-medium flex items-center space-x-3">
          <LoadingSpinner size="small" message="" />
          <span>{uploadProgress}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="disasterName">
              Disaster Name
            </label>
            <input
              type="text"
              id="disasterName"
              name="disasterName"
              value={formData.disasterName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="severity">
              Severity
            </label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {severityLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="disasterType">
              Disaster Type
            </label>
            <select
              id="disasterType"
              name="disasterType"
              value={formData.disasterType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {disasterTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="affectedPeopleCount">
              Affected People Count
            </label>
            <input
              type="number"
              id="affectedPeopleCount"
              name="affectedPeopleCount"
              value={formData.affectedPeopleCount}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="affectedAreas">
            Affected Areas
          </label>
          <input
            type="text"
            id="affectedAreas"
            name="affectedAreas"
            value={formData.affectedAreas}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="targetCollectionAmount">
            Target Amount (ETH)
          </label>
          <input
            type="number"
            id="targetCollectionAmount"
            name="targetCollectionAmount"
            value={formData.targetCollectionAmount}
            onChange={handleChange}
            step="0.01"
            min="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Media Uploads */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
          <h3 className="text-md font-semibold text-gray-800">Visual Evidence (Decentralized IPFS Storage)</h3>
          <p className="text-xs text-gray-500 mt-1">Upload drone footage or 3D terrain models to back this claim. Files are pinned securely to IPFS.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Drone Video Upload Zone */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Drone Video Footage
              </label>
              <div
                onDragOver={(e) => handleDragOver(e, setVideoDragOver)}
                onDragLeave={(e) => handleDragLeave(e, setVideoDragOver)}
                onDrop={(e) => handleDrop(e, setVideoFile, setVideoDragOver)}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                  videoDragOver ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 hover:border-blue-400 bg-white'
                }`}
                onClick={() => document.getElementById('videoFileInput').click()}
              >
                <input
                  type="file"
                  id="videoFileInput"
                  accept="video/*"
                  onChange={(e) => e.target.files?.[0] && setVideoFile(e.target.files[0])}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {videoFile ? (
                    <div className="text-sm text-gray-700 font-medium">
                      Selected: <span className="text-blue-600 font-semibold">{videoFile.name}</span>
                      <span className="text-xs text-gray-400 block mt-0.5">({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Drag & drop drone video here, or <span className="text-blue-600">browse</span></p>
                      <p className="text-xs text-gray-400 mt-1">Supports MP4, MOV, AVI, etc.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3D Model Upload Zone */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                3D Terrain Model (GLB/GLTF)
              </label>
              <div
                onDragOver={(e) => handleDragOver(e, setModelDragOver)}
                onDragLeave={(e) => handleDragLeave(e, setModelDragOver)}
                onDrop={(e) => handleDrop(e, setModelFile, setModelDragOver)}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                  modelDragOver ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 hover:border-blue-400 bg-white'
                }`}
                onClick={() => document.getElementById('modelFileInput').click()}
              >
                <input
                  type="file"
                  id="modelFileInput"
                  accept=".glb,.gltf,.obj"
                  onChange={(e) => e.target.files?.[0] && setModelFile(e.target.files[0])}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  {modelFile ? (
                    <div className="text-sm text-gray-700 font-medium">
                      Selected: <span className="text-blue-600 font-semibold">{modelFile.name}</span>
                      <span className="text-xs text-gray-400 block mt-0.5">({(modelFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Drag & drop 3D model here, or <span className="text-blue-600">browse</span></p>
                      <p className="text-xs text-gray-400 mt-1">Supports GLB, GLTF, OBJ, etc.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">
            Relief Organizations
          </label>
          {availableOrgs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableOrgs.map(org => (
                <div key={org.address} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`org-${org.address}`}
                    checked={formData.reliefOrganizations.includes(org.address)}
                    onChange={() => handleOrgSelect(org.address)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`org-${org.address}`} className="ml-2 text-gray-700">
                    {org.name} ({org.address.slice(0, 6)}...{org.address.slice(-4)})
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No organizations available. Please create organizations first.</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/disasters')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner size="small" /> : 'Create Disaster'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DisasterForm;