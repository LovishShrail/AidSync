import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';
import DisasterDetail from '../components/disasters/DisasterDetail';
import DonationForm from '../components/donations/DonationForm';
import RecentDonations from '../components/donations/RecentDonations';
import LeaderboardTable from '../components/donations/LeaderboardTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import { ethers } from 'ethers';

const DisasterDetailPage = () => {
  const { id } = useParams();
  const { contract, account } = useContext(Web3Context);
  const [disaster, setDisaster] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [topDonors, setTopDonors] = useState({ addresses: [], amounts: [] });

  useEffect(() => {
    const fetchDisaster = async () => {
      if (!contract) {
        setError('Contract not connected');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Convert id to number for smart contract
        const disasterId = parseInt(id);
        if (isNaN(disasterId)) {
          throw new Error('Invalid disaster ID');
        }

        const disasterData = await contract.getDisaster(disasterId);

        // Check if disaster exists (empty name would indicate non-existent)
        if (!disasterData.disasterName || disasterData.disasterName === '') {
          throw new Error('Disaster not found');
        }

        // Process contract data to match component expectations
        const processedDisaster = {
          id: disasterId,
          name: disasterData.disasterName,
          type: disasterData.disasterType,
          severity: disasterData.severity,
          description: disasterData.description,
          affectedAreas: disasterData.affectedAreas,
          affectedPeopleCount: disasterData.affectedPeopleCount,
          targetAmount: parseFloat(ethers.formatEther(disasterData.targetCollectionAmount)),
          collectedAmount: parseFloat(ethers.formatEther(disasterData.totalCollectedAmount)),
          reliefOrganizations: disasterData.reliefOrganizations,
          topDonors: disasterData.topDonors
        };

        setDisaster(processedDisaster);

        const [addresses, amounts] = await contract.getTopDonors(id);
        setTopDonors({ addresses, amounts });

      } catch (err) {
        console.error("Error fetching disaster:", err);
        setError(err.message.includes('revert') ? 'Disaster not found' : err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDisaster();
  }, [id, contract, donationSuccess]);

  const handleDonationSuccess = () => {
    setDonationSuccess(true);
    setTimeout(() => setDonationSuccess(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading disaster details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert type="error" message={error} />
        <div className="mt-4">
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to disasters list
          </button>
        </div>
      </div>
    );
  }


  if (!disaster) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert type="error" message="Disaster details could not be loaded" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Disaster Details */}
          <div className="lg:col-span-2 space-y-6">
            <DisasterDetail disaster={disaster} />

            {/* Donation Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Make a Donation</h3>

              {donationSuccess && (
                <Alert
                  type="success"
                  message="Thank you for your donation!"
                  onClose={() => setDonationSuccess(false)}
                />
              )}
              <DonationForm
                disasterId={id}
                organizations={disaster.reliefOrganizations.map(addr => ({
                  address: addr,
                  name: addr // Placeholder, ideally fetch organization name
                }))}
                onSuccess={handleDonationSuccess}
              />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            {/* <div className="bg-white rounded-lg shadow-md p-6"> */}
              {/* <h3 className="text-xl font-bold text-gray-800 mb-4">Top Donors</h3> */}
              <LeaderboardTable donors={topDonors.addresses}
                amounts={topDonors.amounts}
                contract={contract} />
            {/* </div> */}

            {/* Recent Donations */}
            {/* <div className="bg-white rounded-lg shadow-md p-6"> */}
              {/* <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Donations</h3> */}
              <RecentDonations disasterId={id} />
            {/* </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterDetailPage;