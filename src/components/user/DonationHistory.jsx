import React from 'react';
import { useContractFunctions } from '../../hooks/useContractFunctions';
import LoadingSpinner from '../common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const DonationHistory = () => {
  const { 
    userDonations, 
    isLoading, 
    error,
    fetchUserDonations 
  } = useContractFunctions();

  React.useEffect(() => {
    fetchUserDonations();
  }, []);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md flex items-start">
        <AlertCircle className="text-red-500 mr-3 mt-0.5" size={18} />
        <span className="text-red-800">{error}</span>
      </div>
    );
  }

  if (userDonations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-gray-100 p-6 rounded-lg inline-block mb-4">
          <svg 
            className="w-12 h-12 text-gray-400 mx-auto" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Donations Yet</h3>
        <p className="text-gray-600 mb-4">You haven't made any donations yet.</p>
        <Link 
          to="/disasters" 
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Browse Disasters
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-800 mb-4">Your Donation History</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Disaster
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organization
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {userDonations.map((donation, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link 
                    to={`/disasters/${donation.disasterId}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {donation.disasterName}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {donation.organization}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {donation.amount} ETH
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(donation.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Link 
                    to={`/disasters/${donation.disasterId}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View Disaster
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Note: Timestamps are approximate as they're not stored on-chain.</p>
      </div>
    </div>
  );
};

export default DonationHistory;