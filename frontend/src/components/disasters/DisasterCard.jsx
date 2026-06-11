// import React from 'react';
// import { Link } from 'react-router-dom';
// import StatusBadge from '../common/StatusBadge';
// import ProgressBar from '../common/ProgressBar';
// import { ethers } from 'ethers';
// import { formatEther } from '../../utils/formatters';

// const DisasterCard = ({ disaster, index }) => {
//   const progress = disaster.totalCollectedAmount > 0 
//     ? (Number(disaster.totalCollectedAmount) / Number(disaster.targetCollectionAmount)) * 100
//     : 0;

//   // Get the severity color
//   const getSeverityColor = (severity) => {
//     switch (severity.toLowerCase()) {
//       case 'critical':
//         return 'bg-red-500';
//       case 'high':
//         return 'bg-orange-500';
//       case 'medium':
//         return 'bg-yellow-500';
//       case 'low':
//       default:
//         return 'bg-blue-500';
//     }
//   };

//   // Get the disaster type icon
//   const getDisasterTypeIcon = (type) => {
//     switch (type.toLowerCase()) {
//       case 'earthquake':
//         return '🌋';
//       case 'flood':
//         return '🌊';
//       case 'hurricane':
//         return '🌀';
//       case 'wildfire':
//         return '🔥';
//       case 'drought':
//         return '☀️';
//       default:
//         return '🆘';
//     }
//   };

//   return (
//     <Link to={`/disaster/${index}`} className="block">
//       <div className="rounded-lg shadow-md border border-gray-200 overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
//         <div className="relative">
//           <div className="h-48 bg-gray-200 flex justify-center items-center">
//             <span className="text-6xl" aria-hidden="true">
//               {getDisasterTypeIcon(disaster.disasterType)}
//             </span>
//           </div>
//           <div className="absolute top-4 right-4">
//             <StatusBadge
//               label={disaster.severity}
//               color={getSeverityColor(disaster.severity)}
//             />
//           </div>
//         </div>
        
//         <div className="p-4">
//           <div className="flex justify-between items-start mb-2">
//             <h3 className="text-xl font-semibold">{disaster.disasterName}</h3>
//             <span className="text-sm bg-gray-100 rounded px-2 py-1">
//               {disaster.disasterType}
//             </span>
//           </div>
          
//           <p className="text-gray-700 text-sm mb-4 line-clamp-2">
//             {disaster.description}
//           </p>
          
//           <div className="mb-4">
//             <ProgressBar 
//               progress={progress} 
//               text={`${progress.toFixed(1)}% funded`} 
//             />
//           </div>
          
//           <div className="flex justify-between text-sm text-gray-600">
//             <span>Goal: {formatEther(disaster.targetCollectionAmount)} ETH</span>
//             <span>Raised: {formatEther(disaster.totalCollectedAmount)} ETH</span>
//           </div>
          
//           <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
//             <div className="text-gray-600 text-sm">
//               <span>👥 {disaster.affectedPeopleCount.toLocaleString()} affected</span>
//             </div>
//             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors">
//               Donate Now
//             </button>
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// };

// export default DisasterCard;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import ProgressBar from '../common/ProgressBar';
import { ethers } from 'ethers';


const DisasterCard = ({ disaster, index }) => {
  const navigate = useNavigate();
  
  // Convert BigNumber values to readable numbers
  const targetAmount = ethers.formatEther(disaster.targetCollectionAmount);
  const collectedAmount = ethers.formatEther(disaster.totalCollectedAmount);
  const progress = disaster.totalCollectedAmount > 0 
    ? (Number(collectedAmount) / Number(targetAmount)) * 100
    : 0;

  // Get the severity color
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

  // Get the disaster type icon
  const getDisasterTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'earthquake':
        return '🌋';
      case 'flood':
        return '🌊';
      case 'hurricane':
        return '🌀';
      case 'wildfire':
        return '🔥';
      case 'drought':
        return '☀️';
      default:
        return '🆘';
    }
  };

  // Handle card click (navigate to detail page)
  const handleCardClick = (e) => {
    // If click came from the donate button, let it handle navigation
    if (e.target.closest('.donate-button')) {
      return;
    }
    navigate(`/disasters/${index}`);
  };

  // Handle donate button click (navigate to donation form)
  const handleDonateClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/disasters/${index}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="rounded-lg shadow-md border border-gray-200 overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
    >
      <div className="relative">
        <div className="h-48 bg-gray-200 flex justify-center items-center">
          <span className="text-6xl" aria-hidden="true">
            {getDisasterTypeIcon(disaster.disasterType)}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <StatusBadge
            label={disaster.severity}
            color={getSeverityColor(disaster.severity)}
          />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{disaster.disasterName}</h3>
          <span className="text-sm bg-gray-100 rounded px-2 py-1">
            {disaster.disasterType}
          </span>
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {disaster.description}
        </p>
        
        <div className="mb-4">
          <ProgressBar 
            progress={progress} 
            text={`${progress.toFixed(1)}% funded`} 
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>Goal: {targetAmount} ETH</span>
          <span>Raised: {collectedAmount} ETH</span>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
          <div className="text-gray-600 text-sm">
            <span>👥 {disaster.affectedPeopleCount.toLocaleString()} affected</span>
          </div>
          <button 
            onClick={handleDonateClick}
            className="donate-button px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            Donate Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisasterCard;