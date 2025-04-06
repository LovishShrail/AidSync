import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { Web3Context } from '../../context/Web3Context';
import { formatAddress, timeAgo } from '../../utils/formatters';

const RecentDonations = ({ disasterId }) => {
  const { contract } = useContext(Web3Context);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentDonations = async () => {
      try {
        if (!contract || disasterId === undefined) return;
        
        // Get top donors from the contract based on your implementation
        const [donors, amounts] = await contract.getTopDonors(disasterId);
        
        // Create donations array with additional information
        const donationsWithNames = await Promise.all(
          donors.map(async (address, index) => {
            // Get donor name from contract
            let name = 'Anonymous';
            try {
              name = await contract.getDonorName(address);
              if (!name) name = 'Anonymous';
            } catch (error) {
              console.error('Error fetching donor name:', error);
            }
            
            // Generate a fake timestamp for demo purposes
            // In a production app, you'd want to get this from event logs
            const timestamp = Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
            
            return {
              id: index,
              donor: name,
              address,
              amount: amounts[index],
              timestamp
            };
          })
        );
        
        setDonations(donationsWithNames);
      } catch (error) {
        console.error('Error fetching recent donations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (contract && disasterId !== undefined) {
      fetchRecentDonations();
    }
  }, [contract, disasterId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Recent Donations</h3>
        <div className="flex justify-center py-8">
          <div className="animate-pulse w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center mb-4">
                <div className="bg-gray-200 rounded-full h-10 w-10 mr-3"></div>
                <div className="flex-1">
                  <div className="bg-gray-200 h-4 rounded w-1/3 mb-2"></div>
                  <div className="bg-gray-200 h-3 rounded w-1/4"></div>
                </div>
                <div className="bg-gray-200 h-5 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Recent Donations</h3>
      
      {donations.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No donations yet. Be the first to contribute!</p>
      ) : (
        <div className="space-y-4">
          {donations.map((donation) => (
            <div key={donation.id} className="flex items-center border-b border-gray-100 pb-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-medium">
                  {donation.donor && donation.donor.length > 0 
                    ? donation.donor.charAt(0).toUpperCase() 
                    : 'A'}
                </span>
              </div>
              
              <div className="flex-1">
                <div className="font-medium">{donation.donor}</div>
                <div className="text-sm text-gray-500">{formatAddress(donation.address)} • {timeAgo(donation.timestamp)}</div>
              </div>
              
              <div className="font-bold text-green-600">
                {ethers.formatEther(donation.amount)} ETH
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentDonations;