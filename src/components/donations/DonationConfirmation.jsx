import React from 'react';

const DonationConfirmation = ({ donation, disasterName }) => {
  return (
    <div className="text-center p-4">
      <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h3 className="text-xl font-bold mb-2">Thank You For Your Generosity!</h3>
      <p className="text-gray-600 mb-4">
        Your donation will help those affected by {disasterName}.
      </p>
      
      <div className="bg-gray-100 rounded-lg p-4 mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Amount:</span>
          <span className="font-bold">{donation.amount} ETH</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Organization:</span>
          <span className="font-medium">{donation.organization}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Donor:</span>
          <span>{donation.donor}</span>
        </div>
      </div>
      
      <div className="flex space-x-4 justify-center">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
          View Receipt
        </button>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors">
          Share
        </button>
      </div>
    </div>
  );
};

export default DonationConfirmation;