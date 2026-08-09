import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import useAdmin from '../../hooks/useAdmin';
import { Web3Context } from '../../context/Web3Context';

const AdminControls = ({ disasterId }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Media states
  const [videoFile, setVideoFile] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);

  const { contract } = useAdmin();
  const { authToken, loginWithSignature } = useContext(Web3Context);
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/disasters/${disasterId}`);
  };

  const handleAddOrganization = () => {
    navigate(`/disasters/${disasterId}/add-organization`);
  };

  const uploadToIPFS = async (file) => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);

    const response = await fetch(`${apiBase}/api/upload`, {
      method: 'POST',
      credentials: 'include',
      body: bodyFormData
    });

    if (!response.ok) {
      throw new Error(`Failed to upload ${file.name} to IPFS`);
    }

    const data = await response.json();
    return data.ipfsUrl;
  };

  const handleUpdateMedia = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadProgress(null);
    
    try {
      if (!videoFile && !modelFile) {
        throw new Error("Please select a video or a 3D model file to upload.");
      }

      let currentToken = authToken;
      if (!currentToken) {
        setUploadProgress("Authenticating wallet with signature...");
        await loginWithSignature();
      }

      let videoUrl = '';
      let modelUrl = '';

      if (videoFile) {
        setUploadProgress(`Uploading drone video "${videoFile.name}" to IPFS...`);
        videoUrl = await uploadToIPFS(videoFile);
      }

      if (modelFile) {
        setUploadProgress(`Uploading 3D model "${modelFile.name}" to IPFS...`);
        modelUrl = await uploadToIPFS(modelFile);
      }

      setUploadProgress("Syncing media URLs to database cache...");
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const payload = {};
      if (videoUrl) payload.videoUrl = videoUrl;
      if (modelUrl) payload.modelUrl = modelUrl;

      const res = await fetch(`${apiBase}/api/disasters/${disasterId}/media`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to update media links in the database cache.");
      }

      setSuccess("Media updated successfully!");
      setLoading(false);
      setUploadProgress(null);
      setVideoFile(null);
      setModelFile(null);
      
      setTimeout(() => {
        setShowMediaModal(false);
        setSuccess(null);
        window.location.reload();
      }, 1500);

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update media.");
      setLoading(false);
      setUploadProgress(null);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tx = await contract.deleteDisaster(disasterId);
      await tx.wait();
      
      setSuccess("Disaster deleted successfully!");
      setLoading(false);
      setShowDeleteModal(false);
      
      // Refresh page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      console.error("Failed to delete disaster:", err);
      setError("Failed to delete disaster: " + (err.message || err));
      setLoading(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={handleViewDetails}
        className="text-blue-600 hover:text-blue-800"
        title="View Details"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
      </button>
      
      <button
        onClick={handleAddOrganization}
        className="text-green-600 hover:text-green-800"
        title="Add Organization"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
      </button>

      <button
        onClick={() => setShowMediaModal(true)}
        className="text-indigo-600 hover:text-indigo-800"
        title="Upload Media (Video/3D)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
      </button>
      
      <button
        onClick={() => setShowDeleteModal(true)}
        className="text-red-600 hover:text-red-800"
        title="Delete Disaster"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
      
      {/* Upload Media Modal */}
      <Modal
        isOpen={showMediaModal}
        onClose={() => { if (!loading) setShowMediaModal(false); }}
        title="Update Disaster Media"
      >
        <form onSubmit={handleUpdateMedia} className="p-6 space-y-4">
          <p className="text-sm text-gray-500">
            Upload a drone video or a 3D terrain mesh model for this disaster. This directly updates the off-chain cache and does not require gas.
          </p>

          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
          {success && <Alert type="success" message={success} />}
          {uploadProgress && <div className="text-sm text-blue-600 font-semibold animate-pulse">{uploadProgress}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Drone Video (.mp4)</label>
            <input 
              type="file" 
              accept="video/mp4"
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="w-full text-sm text-gray-500 border border-gray-300 rounded p-2"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">3D Terrain model (.glb)</label>
            <input 
              type="file" 
              accept=".glb"
              onChange={(e) => setModelFile(e.target.files[0])}
              className="w-full text-sm text-gray-500 border border-gray-300 rounded p-2"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowMediaModal(false)}
              className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Save Media"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
      >
        <div className="p-6">
          <p className="mb-4 text-red-600">Are you sure you want to delete this disaster? This action cannot be undone.</p>
          
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}
          
          {success && (
            <Alert
              type="success"
              message={success}
              onClose={() => setSuccess(null)}
            />
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="small" /> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div> 
  );
};

export default AdminControls;