import React, { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../context/Web3Context';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import { ethers } from 'ethers';




const LeaderboardPage = () => {
  const { contract, account } = useContext(Web3Context);
  const [topDonors, setTopDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('total');
  const [totalDonations, setTotalDonations] = useState(0);
  const [disasterContributions, setDisasterContributions] = useState({});

  
const fetchTopDonors = async () => {
  if (contract) {
    try {
      setIsLoading(true);

      // Get all disasters to calculate contributions across all disasters
      const allDisasters = await contract.getAllDisasterData();

      // Track donor contributions across disasters
      const donorContributions = {};
      const disasterCount = {};

      // Process each disaster's top donors
      for (let i = 0; i < allDisasters.length; i++) {
        // Use getTopDonors function from contract to get donors and amounts
        const [donorAddresses, donorAmounts] = await contract.getTopDonors(i);

        // Process each donor in this disaster
        for (let j = 0; j < donorAddresses.length; j++) {
          const address = donorAddresses[j];
          const amount = donorAmounts[j];

          // Initialize donor if we haven't seen them before
          if (!donorContributions[address]) {
            donorContributions[address] = {
              address: address,
              amount: 0,
              disastersSupported: 0
            };
          }

          // Add this disaster's amount to their total
          donorContributions[address].amount =
            donorContributions[address].amount + Number(ethers.formatEther(amount));

          // Count unique disasters supported
          if (!disasterCount[address]) {
            disasterCount[address] = new Set();
          }
          disasterCount[address].add(i);
        }
      }

      // Convert to array and get usernames
      const processedDonors = await Promise.all(
        Object.values(donorContributions).map(async (donor) => {
          const username = await contract.getDonorName(donor.address);
          return {
            ...donor,
            username: username || 'Anonymous',
            disastersSupported: disasterCount[donor.address]?.size || 0
          };
        })
      );

      // Sort donors by total amount donated
      processedDonors.sort((a, b) => b.amount - a.amount);

      // Calculate total donations
      const total = processedDonors.reduce((sum, donor) => sum + donor.amount, 0);

      setTopDonors(processedDonors);
      setTotalDonations(total);

      // Store disaster contributions for each donor
      setDisasterContributions(disasterCount);
    } catch (err) {
      console.error("Error fetching top donors:", err);
      setError("Failed to load leaderboard data");
    } finally {
      setIsLoading(false);
    }
  }
};


  useEffect(() => {
   
    fetchTopDonors();
  }, [contract]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);

    // Sort donors based on selection
    setTopDonors(prevDonors => {
      const sorted = [...prevDonors];
      if (e.target.value === 'total') {
        sorted.sort((a, b) => b.amount - a.amount);
      } else if (e.target.value === 'disasters') {
        sorted.sort((a, b) => b.disastersSupported - a.disastersSupported);
      }
      return sorted;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading leaderboard..." />
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Donor Leaderboard</h1>
              <p className="text-gray-600 mt-2">
                Recognizing the most generous contributors to disaster relief efforts
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="total">Sort by Total Donated</option>
                <option value="disasters">Sort by Disasters Supported</option>
              </select>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Total Community Donations</p>
              <p className="text-2xl font-bold text-blue-800">
                {totalDonations.toFixed(5)} ETH
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Top Donor Contribution</p>
              <p className="text-2xl font-bold text-green-800">
                {topDonors[0]?.amount.toFixed(5) || '0.00'} ETH
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-700 font-medium">Average Donation</p>
              <p className="text-2xl font-bold text-purple-800">
                {(totalDonations / (topDonors.length || 1)).toFixed(5)} ETH
              </p>
            </div>
          </div>

          {/* Top 3 Donors Badges */}
          {topDonors.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {topDonors.slice(0, 3).map((donor, index) => (
                <div
                  key={donor.address}
                  className={`p-6 rounded-lg text-center border-2 ${index === 0
                      ? 'bg-yellow-50 border-yellow-300'
                      : index === 1
                        ? 'bg-gray-50 border-gray-300'
                        : 'bg-orange-50 border-orange-300'
                    }`}
                >
                  <div className="text-5xl font-bold mb-2">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {donor.username || `${donor.address.slice(0, 6)}...${donor.address.slice(-4)}`}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {donor.disastersSupported} disasters supported
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {donor.amount.toFixed(5)} ETH
                  </p>
                  {account === donor.address && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      You
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Donated
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disasters Supported
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topDonors.map((donor, index) => (
                  <tr
                    key={donor.address}
                    className={`${account === donor.address ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {donor.username ? donor.username.charAt(0).toUpperCase() : 'A'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {donor.username || `${donor.address.slice(0, 6)}...${donor.address.slice(-4)}`}
                            {account === donor.address && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {donor.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {donor.amount.toFixed(5)} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {donor.disastersSupported}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {topDonors.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No donors yet</h3>
              <p className="mt-1 text-gray-500">
                Be the first to donate to a disaster relief effort!
              </p>
              <div className="mt-6">
                <a
                  href="/disasters"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Disasters
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Community Impact Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Community Impact</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Emergency Relief Fund</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-blue-600">
                    <span id="emergencyFund">0.00</span> ETH
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Available for immediate response</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      // Get emergency fund amount if contract has this method
                      if (contract && contract.getEmergencyReliefFund) {
                        const fund = await contract.getEmergencyReliefFund();
                        document.getElementById('emergencyFund').textContent =
                          Number(ethers.formatEther(fund)).toFixed(2);
                      }
                    } catch (err) {
                      console.error("Error fetching emergency fund:", err);
                    }
                  }}
                  className="px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Refresh
                </button>
              </div>
              <div className="mt-4">
                <a
                  href="/emergency-fund"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Contribute to Emergency Fund
                </a>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Relief Organizations</h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Reliable organizations working on the ground to provide disaster relief
                </p>
                <div className="flex justify-center">
                  <a
                    href="/organizations"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View All Organizations
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;