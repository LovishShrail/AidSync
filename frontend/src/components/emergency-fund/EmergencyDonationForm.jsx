import React, { useState } from 'react';
import { useContext } from 'react';
import { Web3Context } from '../../context/Web3Context';
import { ethers } from 'ethers';
import Alert from '../common/Alert';
import LoadingSpinner from '../common/LoadingSpinner';

const EmergencyDonationForm = ({ onSuccess }) => {
  const { contract, account } = useContext(Web3Context);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleDonate = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid donation amount');
      return;
    }
    
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const tx = await contract.addToEmergencyReliefFund({
        value: ethers.parseEther(amount)
      });
      
      await tx.wait();
      setAmount('');
      onSuccess(); // Call the success callback from parent component
    } catch (err) {
      console.error('Donation error:', err);
      setError(err.message || 'Failed to process donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <p className="text-gray-700 mb-6">
        Your contribution to our Emergency Relief Fund enables us to respond rapidly to 
        emerging crises around the world, providing immediate support when disasters strike.
      </p>
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      <form onSubmit={handleDonate}>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Donation Amount (ETH)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
            step="0.01"
            min="0.001"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !account}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
        >
          {isSubmitting ? (
            <LoadingSpinner size="sm" /> 
          ) : !account ? (
            'Connect Wallet to Donate'
          ) : (
            'Donate Now'
          )}
        </button>
      </form>
      
      <div className="mt-6 text-sm text-gray-600">
        <p className="font-medium">Why donate to the Emergency Fund?</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Enables immediate response when disasters strike</li>
          <li>Supports communities before specific disaster campaigns are launched</li>
          <li>Helps fund preparedness and resilience initiatives</li>
        </ul>
      </div>
    </div>
  );
};

export default EmergencyDonationForm;