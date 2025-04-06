import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import useAdmin from '../../hooks/useAdmin';

const AdminControls = ({ disasterId }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { contract } = useAdmin();
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/disasters/${disasterId}`);
  };

  const handleAddOrganization = () => {
    navigate(`/disasters/${disasterId}/add-organization`);
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
        onClick={() => setShowDeleteModal(true)}
        className="text-red-600 hover:text-red-800"
        title="Delete Disaster"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
      
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