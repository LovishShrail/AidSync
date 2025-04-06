import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Web3Context } from '../../context/Web3Context';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

const OrganizationForm = () => {
  const { contract, account, isAdmin } = useContext(Web3Context);
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!name.trim()) {
      setError('Please enter an organization name');
      return;
    }
    
    if (!address.trim() || !address.startsWith('0x')) {
      setError('Please enter a valid Ethereum address');
      return;
    }
    
    try {
      setLoading(true);
      
      const tx = await contract.createOrganization(name, address);
      await tx.wait();
      
      setSuccess('Organization created successfully!');
      
      // Reset the form
      setName('');
      setAddress('');
      setDescription('');
      setWebsite('');
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/organizations');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  // Check if the current user is admin
  if (!isAdmin) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <Alert 
          type="error" 
          message="You don't have permission to create organizations. Only the contract admin can perform this action." 
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Register New Relief Organization</h2>
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      {success && <Alert type="success" message={success} className="mb-4" />}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
            Organization Name *
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Red Cross"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="address" className="block text-gray-700 font-medium mb-1">
            Ethereum Address *
          </label>
          <input
            type="text"
            id="address"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows="4"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the organization and its mission..."
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="website" className="block text-gray-700 font-medium mb-1">
            Website URL
          </label>
          <input
            type="url"
            id="website"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://www.example.org"
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Register Organization'}
        </button>
      </form>
    </div>
  );
};

export default OrganizationForm;