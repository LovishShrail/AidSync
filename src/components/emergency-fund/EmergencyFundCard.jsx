import React, { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../../context/Web3Context';
import { ethers } from 'ethers';

const EmergencyFundCard = ({ balance }) => {
  // Use balance passed from parent component (EmergencyFundPage)
  
  // Create a simple progress bar representation
  const progressPercentage = Math.min((balance / 10) * 100, 100); // Assuming 10 ETH is target

  return (
    <div className="p-6 shadow-md rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-red-100">
      <h3 className="text-xl font-bold text-red-800 mb-4">Emergency Relief Fund</h3>
      <p className="text-gray-700 mb-4">
        Support our rapid response capability to address emerging disasters worldwide with your contribution to our Emergency Relief Fund.
      </p>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Current Fund Balance</span>
          <span className="text-sm font-bold text-red-800">{balance.toFixed(4)} ETH</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-red-600 h-2.5 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-700">
        <p>Funds available for immediate disaster response</p>
      </div>
    </div>
  );
};

export default EmergencyFundCard;