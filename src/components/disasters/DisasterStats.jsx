import React from 'react';

const DisasterStats = ({ stats = {} }) => {
  const {
    totalDisasters = 0,
    activeDisasters = 0,
    totalDonations = '0',
    totalAffected = 0,
    topDisasterType = 'N/A',
    emergencyFund = '0'
  } = stats;

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Disaster Relief Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-blue-600 text-3xl font-bold mb-2">{totalDisasters}</div>
          <div className="text-gray-600 text-sm">Total Disasters</div>
          <div className="text-blue-500 font-medium mt-1">
            {activeDisasters} active currently
          </div>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-green-600 text-3xl font-bold mb-2">{totalDonations} ETH</div>
          <div className="text-gray-600 text-sm">Total Donations</div>
          <div className="text-green-500 font-medium mt-1">
            {emergencyFund} ETH in emergency fund
          </div>
        </div>
        
        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="text-yellow-600 text-3xl font-bold mb-2">{totalAffected.toLocaleString()}</div>
          <div className="text-gray-600 text-sm">People Affected</div>
          <div className="text-yellow-500 font-medium mt-1">
            Most common: {topDisasterType}
          </div>
        </div>
      </div>
      
      <div className="mt-6 border-t pt-4">
        <p className="text-sm text-gray-500">
          These statistics are updated in real-time based on blockchain data. 
          Every donation makes a difference in the lives of those affected by disasters.
        </p>
      </div>
    </div>
  );
};

export default DisasterStats;