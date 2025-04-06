// src/components/user/UserProfile.js
import React, { useState, useContext,useEffect } from 'react';
import { Web3Context } from '../../context/Web3Context';
import { useContractFunctions } from '../../hooks/useContractFunctions';
import DonationHistory from './DonationHistory';
import ProfileSettings from './ProfileSettings';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatAddress } from '../../utils/formatters';
import { User, Award, History, Settings } from 'lucide-react';

const UserProfile = () => {
  const { account, connectWallet, balance, contract, isLoading: isWeb3Loading } = useContext(Web3Context);
  // console.log('Web3Context values:', {
  //   account,
  //   balance,
  //   contract,
  //   isWeb3Loading
  // });
  const { 
    userDonations, 
    totalDonated, 
    disastersSupported, 
    isLoading, 
    updateUsername, 
    fetchUserDonations 
  } = useContractFunctions();
  const [activeTab, setActiveTab] = useState('overview');
  const [username, setUsername] = useState('');
  const [isFetchingUsername, setIsFetchingUsername] = useState(false);

  const fetchUsername = async () => {
    if (contract && account) {
      try {
        setIsFetchingUsername(true);
        const name = await contract.getDonorName(account);
        setUsername(name || 'Anonymous Donor');
      } catch (err) {
        console.error("Error fetching username:", err);
        setUsername('Anonymous Donor');
      } finally {
        setIsFetchingUsername(false);
      }
    }
  };

  useEffect(() => {
    if (account) {
      fetchUserDonations();
      fetchUsername();
    }
  }, [account, contract]);

  const handleUsernameUpdate = async (newUsername) => {
    const success = await updateUsername(newUsername);
    if (success) {
      await fetchUsername(); // Refresh the username after update
    }
    return success;
  };

  if (!account) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <User size={64} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-6">
          Connect your wallet to view your profile and donation history.
        </p>
        <button
          onClick={connectWallet}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-md flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }



  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-teal-500 p-5 rounded-full text-white">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {username || 'Anonymous Donor'}
            </h2>
            <p className="text-gray-600">{formatAddress(account)}</p>
            <div className="mt-1 text-sm font-medium text-gray-500">
              Wallet Balance: {balance !== null && balance !== undefined ? 
                `${parseFloat(balance).toFixed(4)} ETH` : 
                'Loading...'}
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-4 text-sm font-medium flex items-center ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Award size={16} className="mr-2" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-4 text-sm font-medium flex items-center ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <History size={16} className="mr-2" /> Donation History
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-4 text-sm font-medium flex items-center ${
              activeTab === 'settings'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Settings size={16} className="mr-2" /> Settings
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Donor Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Total Donations</div>
                <div className="text-2xl font-bold mt-1">{totalDonated.toFixed(4)} ETH</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Disasters Supported</div>
                <div className="text-2xl font-bold mt-1">{disastersSupported}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Donor Rank</div>
                <div className="text-2xl font-bold mt-1">
                  {userDonations.length > 0 ? 'Top Donor' : 'Not Ranked'}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && <DonationHistory />}
        {activeTab === 'settings' && <ProfileSettings 
          username={username} 
          onUpdate={handleUsernameUpdate}
        />}
      </div>
    </div>
  );
};

export default UserProfile;