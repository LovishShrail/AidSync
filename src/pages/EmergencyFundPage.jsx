import React, { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../context/Web3Context';
import EmergencyFundCard from '../components/emergency-fund/EmergencyFundCard';
import EmergencyDonationForm from '../components/emergency-fund/EmergencyDonationForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import { ethers } from 'ethers';


const EmergencyFundPage = () => {
  const { contract, account, isAdmin } = useContext(Web3Context);
  const [fundBalance, setFundBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donationSuccess, setDonationSuccess] = useState(false);

  useEffect(() => {
    const fetchFundBalance = async () => {
      if (contract) {
        try {
          setIsLoading(true);
          const balance = await contract.getEmergencyReliefFund();
          setFundBalance(Number(ethers.formatEther(balance)));
        } catch (err) {
          console.error("Error fetching emergency fund:", err);
          setError("Failed to load emergency fund data");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchFundBalance();
  }, [contract, donationSuccess]);

  const handleDonationSuccess = () => {
    setDonationSuccess(true);
    setTimeout(() => setDonationSuccess(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading emergency fund..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Fund Overview */}
          <div className="lg:col-span-2 space-y-6">
            <EmergencyFundCard balance={fundBalance} />
            
            {/* Donation Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Contribute to Emergency Fund</h3>
              {donationSuccess && (
                <Alert 
                  type="success" 
                  message="Thank you for your donation to the emergency fund!" 
                  onClose={() => setDonationSuccess(false)} 
                />
              )}
              <EmergencyDonationForm onSuccess={handleDonationSuccess} />
            </div>
          </div>
          
          {/* Right Column - Info and Admin */}
          <div className="space-y-6">
            {/* Fund Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">About the Emergency Fund</h3>
              <p className="text-gray-600 mb-4">
                The Emergency Relief Fund allows us to respond immediately to new disasters before 
                specific fundraising campaigns can be established.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Provides immediate resources for first responders</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Supports disasters that don't get media attention</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>100% of funds go directly to relief efforts</span>
                </li>
              </ul>
            </div>
            
            {/* Admin Controls */}
            {isAdmin && (
              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Admin Controls</h3>
                <p className="text-gray-600 mb-4">
                  Withdraw funds to approved relief organizations for emergency response.
                </p>
                <button
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                  onClick={() => {
                    // Implement withdrawal functionality
                  }}
                >
                  Withdraw Funds
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyFundPage;
