import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { Web3Context } from '../context/Web3Context';
import DisasterList from '../components/disasters/DisasterList';
import EmergencyFundCard from '../components/emergency-fund/EmergencyFundCard';
import LeaderboardTable from '../components/donations/LeaderboardTable';
import RecentDonations from '../components/donations/RecentDonations';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const { 
    contract, 
    isLoading, 
    error, 
    account, 
    connectWallet,
    networkId,
    switchToSepolia
  } = useContext(Web3Context);

  const [disasters, setDisasters] = useState([]);
  const [featuredDisasters, setFeaturedDisasters] = useState([]);
  const [emergencyFund, setEmergencyFund] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!contract || !account) {
        setIsLoadingData(false);
        return;
      }

      try {
        setIsLoadingData(true);
        setFetchError(null);
        
        // Verify contract is connected
        if (!contract.runner) {
          throw new Error("Contract not connected properly");
        }

        // Fetch data
        const [disastersData, emergencyFundBalance] = await Promise.all([
          contract.getAllDisasterData(),
          contract.getEmergencyReliefFund()
        ]);

        // Process data
        const processedDisasters = disastersData.map((disaster, index) => ({
          id: index,
          name: disaster.disasterName,
          type: disaster.disasterType,
          severity: disaster.severity,
          description: disaster.description,
          affectedAreas: disaster.affectedAreas,
          affectedPeopleCount: Number(disaster.affectedPeopleCount),
          targetAmount: Number(ethers.formatEther(disaster.targetCollectionAmount)),
          collectedAmount: Number(ethers.formatEther(disaster.totalCollectedAmount)),
          reliefOrganizations: disaster.reliefOrganizations,
          topDonors: disaster.topDonors
        }));

        setDisasters(processedDisasters);
        setEmergencyFund(Number(ethers.formatEther(emergencyFundBalance)));

        // Get featured disasters
        const featured = [...processedDisasters]
          .sort((a, b) => {
            const severityOrder = { 'Critical': 3, 'High': 2, 'Medium': 1, 'Low': 0 };
            const aSeverity = severityOrder[a.severity] || 0;
            const bSeverity = severityOrder[b.severity] || 0;
            
            if (aSeverity !== bSeverity) return bSeverity - aSeverity;
            
            const aProgress = a.collectedAmount / a.targetAmount;
            const bProgress = b.collectedAmount / b.targetAmount;
            
            return bProgress - aProgress;
          })
          .slice(0, 3);
        
        setFeaturedDisasters(featured);
      } catch (err) {
        console.error("Error fetching data:", err);
        setFetchError(err.message || "Failed to fetch data from contract");
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchData();
  }, [contract, account]);

  if (isLoading) {
    return <LoadingSpinner message="Connecting to blockchain..." />;
  }

  if (error || networkId !== 11155111) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-center max-w-md mx-auto mt-12">
        <h2 className="text-red-700 text-lg font-bold mb-2">Connection Error</h2>
        <p className="text-red-600 mb-4">
          {networkId !== 11155111 
            ? `Please connect to Sepolia testnet (Chain ID: 11155111)`
            : error}
        </p>
        <div className="flex flex-col space-y-2">
          <button 
            onClick={connectWallet}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Connect Wallet
          </button>
          {networkId !== 11155111 && (
            <button 
              onClick={switchToSepolia}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Switch to Sepolia
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Support Disaster Relief Efforts</h1>
          <p className="text-xl mb-10 max-w-3xl mx-auto">
            Make transparent, blockchain-powered donations to help communities affected by disasters worldwide.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/disasters" 
              className="bg-white text-blue-700 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
            >
              View All Disasters
            </Link>
            
            {!account && (
              <button 
                onClick={connectWallet} 
                className="bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-blue-700 transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </section>
      
      {/* Featured Disasters */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Urgent Appeals</h2>
            <Link to="/disasters" className="text-blue-600 hover:text-blue-800 font-medium">
              View All →
            </Link>
          </div>
          
          {isLoadingData ? (
            <LoadingSpinner message="Loading disasters..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredDisasters.map(disaster => (
                <div 
                  key={disaster.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className={`h-2 ${
                    disaster.severity === 'Critical' ? 'bg-red-600' :
                    disaster.severity === 'High' ? 'bg-orange-500' :
                    disaster.severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{disaster.name}</h3>
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                          {disaster.type}
                        </span>
                      </div>
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        disaster.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                        disaster.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                        disaster.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {disaster.severity}
                      </span>
                    </div>
                    
                    <p className="mt-4 text-gray-600 line-clamp-2">
                      {disaster.description}
                    </p>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Funding Progress</span>
                        <span>{Math.round((disaster.collectedAmount / disaster.targetAmount) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((disaster.collectedAmount / disaster.targetAmount) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">{disaster.collectedAmount.toFixed(2)} ETH</span> raised of {disaster.targetAmount.toFixed(2)} ETH goal
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Link 
                        to={`/disasters/${disaster.id}`}
                        className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Donate Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Emergency Fund Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Emergency Relief Fund</h2>
              <p className="text-gray-600 mb-6">
                Your contribution to our Emergency Relief Fund allows us to respond immediately to new disasters, 
                before specific fundraising campaigns can be established. This fund enables critical first response 
                efforts when time is of the essence.
              </p>
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Current Fund Balance</h3>
                <p className="text-3xl font-bold text-blue-600 mb-6">{emergencyFund.toFixed(4)} ETH</p>
                <Link
                  to="/emergency-fund"
                  className="block w-full text-center bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition-colors"
                >
                  Contribute to Emergency Fund
                </Link>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Emergency Responses</h3>
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <ul className="space-y-4">
                  <li className="pb-4 border-b border-gray-100">
                    <h4 className="font-medium text-gray-800">Ecuador Earthquake Response</h4>
                    <p className="text-sm text-gray-600">
                      Deployed 0.5 ETH for immediate medical supplies
                    </p>
                    <span className="text-xs text-gray-500">3 days ago</span>
                  </li>
                  <li className="pb-4 border-b border-gray-100">
                    <h4 className="font-medium text-gray-800">Thailand Flooding</h4>
                    <p className="text-sm text-gray-600">
                      Deployed 0.7 ETH for evacuation transportation
                    </p>
                    <span className="text-xs text-gray-500">1 week ago</span>
                  </li>
                  <li>
                    <h4 className="font-medium text-gray-800">Somalia Drought Relief</h4>
                    <p className="text-sm text-gray-600">
                      Deployed 1.2 ETH for water purification systems
                    </p>
                    <span className="text-xs text-gray-500">2 weeks ago</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Global Stats */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Our Global Impact</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-100">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {disasters.length}
              </div>
              <p className="text-gray-600">Active Disasters</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-100">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {disasters.reduce((total, disaster) => total + disaster.collectedAmount, 0).toFixed(4)} ETH
              </div>
              <p className="text-gray-600">Total Funds Raised</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-100">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {disasters.reduce((total, disaster) => total + disaster.affectedPeopleCount, 0).toLocaleString()}
              </div>
              <p className="text-gray-600">People Supported</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;




// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import DisasterList from '../components/disasters/DisasterList';
// import EmergencyFundCard from '../components/emergency-fund/EmergencyFundCard';
// import DisasterStats from '../components/disasters/DisasterStats';
// import RecentDonations from '../components/donations/RecentDonations';
// import LoadingSpinner from '../components/common/LoadingSpinner';
// import useContract from '../hooks/useContract';
// import { formatEther } from '../utils/formatters';

// const Home = () => {
//   const [loading, setLoading] = useState(true);
//   const [disasters, setDisasters] = useState([]);
//   const [stats, setStats] = useState({});
//   const { contract } = useContract();
  
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (!contract) return;
        
//         setLoading(true);
        
//         // Fetch all disasters
//         const disastersData = await contract.getAllDisasterData();
//         setDisasters(disastersData);
        
//         // Calculate stats
//         let totalDonations = 0;
//         let totalAffected = 0;
//         const disasterTypes = {};
        
//         disastersData.forEach(disaster => {
//           totalDonations += Number(formatEther(disaster.totalCollectedAmount.toString()));
//           totalAffected += Number(disaster.affectedPeopleCount);
          
//           // Count disaster types
//           if (disasterTypes[disaster.disasterType]) {
//             disasterTypes[disaster.disasterType]++;
//           } else {
//             disasterTypes[disaster.disasterType] = 1;
//           }
//         });
        
//         // Find most common disaster type
//         let topType = 'N/A';
//         let maxCount = 0;
        
//         for (const [type, count] of Object.entries(disasterTypes)) {
//           if (count > maxCount) {
//             maxCount = count;
//             topType = type;
//           }
//         }
        
//         // Get emergency fund balance
//         const emergencyFund = await contract.getEmergencyReliefFund();
        
//         setStats({
//           totalDisasters: disastersData.length,
//           activeDisasters: disastersData.length, // Assuming all disasters are active
//           totalDonations: totalDonations.toFixed(2),
//           totalAffected,
//           topDisasterType: topType,
//           emergencyFund: formatEther(emergencyFund.toString())
//         });
        
//         setLoading(false);
//       } catch (err) {
//         console.error("Failed to load home data:", err);
//         setLoading(false);
//       }
//     };
    
//     fetchData();
//   }, [contract]);
  
//   if (loading) {
//     return <LoadingSpinner size="large" />;
//   }
  
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <section className="mb-12 text-center">
//         <h1 className="text-4xl font-bold text-gray-900 mb-4">Disaster Relief Platform</h1>
//         <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//           Support disaster relief efforts worldwide through transparent, blockchain-powered donations.
//         </p>
//         <div className="mt-8 flex justify-center space-x-4">
//           <Link
//             to="/disasters"
//             className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
//           >
//             View All Disasters
//           </Link>
//           <Link
//             to="/emergency-fund"
//             className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition"
//           >
//             Emergency Fund
//           </Link>
//         </div>
//       </section>
      
//       <DisasterStats stats={stats} />
      
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Disasters</h2>
//           <DisasterList 
//             disasters={disasters.slice(0, 3)} 
//             compact={true} 
//           />
//           {disasters.length > 3 && (
//             <div className="mt-4 text-center">
//               <Link 
//                 to="/disasters" 
//                 className="text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 View All {disasters.length} Disasters →
//               </Link>
//             </div>
//           )}
//         </div>
        
//         <div>
//           <div className="mb-8">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6">Emergency Fund</h2>
//             <EmergencyFundCard />
//           </div>
          
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Donations</h2>
//             <RecentDonations limit={5} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;