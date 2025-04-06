import React, { useState, useContext, useEffect } from 'react';
import { ethers } from 'ethers';
import { Web3Context } from '../../context/Web3Context';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Modal } from '../common/Modal';

const DonationForm = ({ disasterId, organizations, onSuccess }) => {
  const { contract, account } = useContext(Web3Context);
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [donation, setDonation] = useState(null);
  const [orgNames, setOrgNames] = useState({});

  useEffect(() => {
    const fetchOrgNames = async () => {
      if (!contract) return;
      
      const names = {};
      for (const orgAddress of organizations) {
        try {
          // Check if orgAddress is a string (address) or an object with address property
          const addressToUse = typeof orgAddress === 'string' ? orgAddress : orgAddress.address;
          const name = await contract.getOrganization(addressToUse);
          names[addressToUse] = name;
        } catch (err) {
          const addressToUse = typeof orgAddress === 'string' ? orgAddress : orgAddress.address;
          console.error(`Failed to fetch name for org ${addressToUse}:`, err);
          names[addressToUse] = addressToUse.slice(0, 6) + '...' + addressToUse.slice(-4);
        }
      }
      setOrgNames(names);
    };

    fetchOrgNames();
  }, [contract, organizations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid donation amount');
      return;
    }
    
    if (!selectedOrg) {
      setError('Please select a relief organization');
      return;
    }
    
    try {
      setLoading(true);
      
      const etherAmount = ethers.parseEther(amount);
      const tx = await contract.donate(
        disasterId,
        selectedOrg,
        donorName || 'Anonymous',
        { value: etherAmount }
      );
      
      await tx.wait();
      
      setDonation({
        amount,
        organization: orgNames[selectedOrg] || selectedOrg,
        donor: donorName || 'Anonymous'
      });
      
      setShowConfirmation(true);
      setAmount('');
      setDonorName('');
      setSelectedOrg('');
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to process donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* <h3 className="text-xl font-bold mb-4">Make a Donation</h3> */}
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="organization" className="block text-gray-700 font-medium mb-1">
            Select Organization
          </label>
          <select
            id="organization"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            required
          >
            <option value="">Select an organization</option>
            {organizations.map((org) => {
              // Handle both string addresses and objects with address property
              const orgAddress = typeof org === 'string' ? org : org.address;
              const displayName = orgNames[orgAddress] || (typeof org === 'string' ? org : org.name || orgAddress);
              
              return (
                <option key={orgAddress} value={orgAddress}>
                  {displayName}
                </option>
              );
            })}
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="amount" className="block text-gray-700 font-medium mb-1">
            Donation Amount (ETH)
          </label>
          <input
            type="number"
            id="amount"
            step="0.001"
            min="0.001"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.1"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
            Your Name (Optional)
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="Anonymous"
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Donate Now'}
        </button>
      </form>
      
      {showConfirmation && donation && (
        <Modal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          title="Donation Confirmed!"
        >
          <div className="p-4">
            <p className="mb-2">Thank you for your donation of {donation.amount} ETH!</p>
            <p className="mb-2">To: {donation.organization}</p>
            <p>From: {donation.donor}</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DonationForm;