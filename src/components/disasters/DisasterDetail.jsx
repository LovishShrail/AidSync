import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContract } from '../../hooks/useContract';
import { useWallet } from '../../hooks/useWallet';
import StatusBadge from '../common/StatusBadge';
import ProgressBar from '../common/ProgressBar';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import DonationForm from '../donations/DonationForm';
import RecentDonations from '../donations/RecentDonations';
import LeaderboardTable from '../donations/LeaderboardTable';
import { formatEther } from '../../utils/formatters';
import { ethers } from 'ethers';

const DisasterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contract } = useContract();
  const { connected, address } = useWallet();
  
  const [disaster, setDisaster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [topDonors, setTopDonors] = useState({ addresses: [], amounts: [] });
  
  useEffect(() => {
    const fetchDisasterDetails = async () => {
      try {
        // Fetch the disaster detail
        const disasterData = await contract.getDisaster(id);
        setDisaster(disasterData);
        
        // Fetch organization names
        const orgPromises = disasterData.reliefOrganizations.map(async (orgAddress) => {
          const [name] = await contract.getOrganization(orgAddress);
          return { address: orgAddress, name };
        });
        
        const orgsWithNames = await Promise.all(orgPromises);
        setOrganizations(orgsWithNames);
        
        // Fetch top donors
        const [addresses, amounts] = await contract.getTopDonors(id);
        setTopDonors({ addresses, amounts });
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch disaster details:", error);
        setLoading(false);
      }
    };
    
    if (contract && id !== undefined) {
      fetchDisasterDetails();
    }
  }, [contract, id]);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!disaster) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Disaster Not Found</h2>
        <p className="text-gray-600 mb-6">The disaster you're looking for doesn't exist or has been deleted.</p>
        <button 
          onClick={() => navigate('/disasters')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Disasters
        </button>
      </div>
    );
  }
  
  const progress = disaster.totalCollectedAmount > 0 
    ? (Number(disaster.totalCollectedAmount) / Number(disaster.targetCollectionAmount)) * 100
    : 0;
    
  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{disaster.disasterName}</h1>
              <div className="flex items-center space-x-3">
                <StatusBadge 
                  label={disaster.severity} 
                  color={getSeverityColor(disaster.severity)} 
                />
                <span className="text-gray-500">{disaster.disasterType}</span>
              </div>
            </div>
            <button
              onClick={() => setShowDonationModal(true)}
              className="mt-4 md:mt-0 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            >
              Donate Now
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{disaster.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Affected Areas</h3>
                <p className="text-gray-700">{disaster.affectedAreas}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Affected People</h3>
                <p className="text-gray-700">{disaster.affectedPeopleCount.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Donation Progress</h3>
              <ProgressBar 
                progress={progress} 
                text={`${formatEther(disaster.totalCollectedAmount)} of ${formatEther(disaster.targetCollectionAmount)} ETH (${progress.toFixed(1)}%)`} 
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Relief Organizations</h3>
              <div className="flex flex-wrap gap-2">
                {organizations.map((org) => (
                  <div key={org.address} className="bg-gray-100 rounded-full px-3 py-1 text-sm">
                    {org.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Top donors and leaderboard */}
        {/* <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Top Donors</h2>
          <LeaderboardTable 
            donors={topDonors.addresses} 
            amounts={topDonors.amounts} 
            contract={contract}
          />
        </div> */}
        
        {/* Recent donations */}
        {/* <div>
          <h2 className="text-2xl font-bold mb-4">Recent Donations</h2>
          <RecentDonations disasterId={id} />
        </div> */}
      </div>
      
      {/* Donation Modal */}
      <Modal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        title="Make a Donation"
      >
        {!connected ? (
          <div className="py-4 text-center">
            <p className="mb-4 text-gray-700">Please connect your wallet to make a donation.</p>
            <button 
              onClick={() => {/* Connect wallet logic */}}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <DonationForm 
            disasterId={id} 
            organizations={organizations}
            onSuccess={() => setShowDonationModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default DisasterDetail;