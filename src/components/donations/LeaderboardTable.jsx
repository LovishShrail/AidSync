import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../../context/Web3Context';
import { ethers } from 'ethers';
import { formatAddress } from '../../utils/formatters';

const LeaderboardTable = ({ donors = [], amounts = [], title = "Top Donors" }) => {
  const { contract } = useContext(Web3Context);
  const [donorsWithNames, setDonorsWithNames] = useState([]);
  const [isLoading, setIsLoading] = useState(true)
  // Ensure donors and amounts are arrays and have the same length

  const validDonors = Array.isArray(donors) ? donors : [];
  const validAmounts = Array.isArray(amounts) ? amounts : [];
  useEffect(() => {
    const fetchDonorNames = async () => {
      if (!contract || validDonors.length === 0 || validAmounts.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const donorsData = await Promise.all(
          validDonors.map(async (donorAddress, index) => {
            let donorName = 'Anonymous';
            
            try {
              // Fetch the username from the contract
              const name = await contract.getDonorName(donorAddress);
              donorName = name && name.trim() !== '' ? name : 'Anonymous';
            } catch (error) {
              console.error(`Error fetching name for ${donorAddress}:`, error);
            }
            
            return {
              address: donorAddress,
              name: donorName,
              amount: validAmounts[index]
            };
          })
        );
        
        setDonorsWithNames(donorsData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching donor names:", error);
        setIsLoading(false);
      }
    };

    fetchDonorNames();
  }, [contract, validDonors, validAmounts]);


  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      
      {isLoading ? (
        <p className="text-gray-500 text-center py-8">Loading donor information...</p>
      ) : donorsWithNames.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No donations yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount (ETH)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {donorsWithNames.map((donor, index) => (
                <tr key={index} className={index < 3 ? "bg-blue-50" : ""}>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index < 3 ? (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 
                          ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                            index === 1 ? 'bg-gray-200 text-gray-700' : 
                            'bg-amber-700 text-amber-100'}`}>
                          {index === 0 ? (
                            <span className="text-lg">🥇</span>
                          ) : index === 1 ? (
                            <span className="text-lg">🥈</span>
                          ) : (
                            <span className="text-lg">🥉</span>
                          )}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                          <span className="text-gray-700 font-medium">{index + 1}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {donor.name || 'Anonymous'} 
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatAddress(donor.address)}
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className={`text-sm font-bold ${
                      index === 0 ? 'text-yellow-600' : 
                      index === 1 ? 'text-gray-600' : 
                      index === 2 ? 'text-amber-600' : 
                      'text-gray-900'
                    }`}>
                      {ethers.formatEther ? 
                        ethers.formatEther(donor.amount) : 
                        ethers.formatEther(donor.amount)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable;