import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { Web3Context } from '../context/Web3Context';
import DisasterList from '../components/disasters/DisasterList';
import EmergencyFundCard from '../components/emergency-fund/EmergencyFundCard';
import LeaderboardTable from '../components/donations/LeaderboardTable';
import RecentDonations from '../components/donations/RecentDonations';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

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
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  useEffect(() => {
    const fetchCachedData = async () => {
      try {
        setIsLoadingData(true);
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/api/disasters`);
        if (res.ok) {
          const dbData = await res.json();
          const processed = dbData.map((d) => ({
            id: d.disasterId,
            name: d.name || '',
            type: d.type || '',
            severity: d.severity || '',
            description: d.description || '',
            affectedAreas: d.affectedAreas || '',
            affectedPeopleCount: Number(d.affectedPeopleCount || 0),
            targetAmount: Number(d.targetAmount || 0),
            collectedAmount: Number(d.collectedAmount || 0),
            reliefOrganizations: d.reliefOrganizations || [],
            topDonors: d.topDonors || { addresses: [], amounts: [] }
          }));

          setDisasters(processed);
          
          const featured = [...processed]
            .sort((a, b) => {
              const severityOrder = { 'Critical': 3, 'High': 2, 'Medium': 1, 'Low': 0 };
              const aSeverity = severityOrder[a.severity] || 0;
              const bSeverity = severityOrder[b.severity] || 0;
              if (aSeverity !== bSeverity) return bSeverity - aSeverity;
              const aProgress = a.targetAmount > 0 ? a.collectedAmount / a.targetAmount : 0;
              const bProgress = b.targetAmount > 0 ? b.collectedAmount / b.targetAmount : 0;
              return bProgress - aProgress;
            })
            .slice(0, 3);
          setFeaturedDisasters(featured);
        }
      } catch (err) {
        console.warn("Failed to load featured disasters from cache:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchCachedData();
  }, []);

  useEffect(() => {
    const fetchBlockchainData = async () => {
      if (!contract) return;

      try {
        // Fetch emergency fund balance and on-chain disasters in parallel
        const [disastersData, emergencyFundBalance] = await Promise.all([
          contract.getAllDisasterData(),
          contract.getEmergencyReliefFund()
        ]);

        setEmergencyFund(Number(ethers.formatEther(emergencyFundBalance)));

        const processed = disastersData.map((disaster, index) => ({
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

        setDisasters(processed);

        const featured = [...processed]
          .sort((a, b) => {
            const severityOrder = { 'Critical': 3, 'High': 2, 'Medium': 1, 'Low': 0 };
            const aSeverity = severityOrder[a.severity] || 0;
            const bSeverity = severityOrder[b.severity] || 0;
            if (aSeverity !== bSeverity) return bSeverity - aSeverity;
            const aProgress = a.targetAmount > 0 ? a.collectedAmount / a.targetAmount : 0;
            const bProgress = b.targetAmount > 0 ? b.collectedAmount / b.targetAmount : 0;
            return bProgress - aProgress;
          })
          .slice(0, 3);
        
        setFeaturedDisasters(featured);
      } catch (err) {
        console.error("Error reconciling blockchain data:", err);
      }
    };

    fetchBlockchainData();
  }, [contract]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoadingAnalytics(true);
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/api/analytics`);
        if (!res.ok) throw new Error("Backend offline");
        const data = await res.json();
        setAnalyticsData(data);
      } catch (err) {
        console.warn("Failed to fetch analytics from backend, generating from blockchain data...", err);
        // Fallback: generate from local disasters state
        if (disasters.length > 0) {
          const typeGroup = {};
          const severityCount = { Critical: 0, High: 0, Medium: 0, Low: 0 };

          disasters.forEach(d => {
            const type = d.type || 'Other';
            typeGroup[type] = (typeGroup[type] || 0) + d.collectedAmount;

            const sev = d.severity;
            if (severityCount[sev] !== undefined) {
              severityCount[sev]++;
            }
          });

          const categoryData = Object.keys(typeGroup).map(key => ({
            name: key,
            value: Number(typeGroup[key].toFixed(4))
          }));

          const severityData = Object.keys(severityCount).map(key => ({
            name: key,
            value: severityCount[key]
          }));

          // Mock timeline fallback based on disasters
          const donationTimeline = disasters.slice(0, 5).map((d, i) => ({
            name: `Appeal #${d.id}`,
            amount: d.collectedAmount
          }));

          setAnalyticsData({
            categoryData,
            severityData,
            donationTimeline
          });
        }
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    if (disasters.length > 0) {
      fetchAnalytics();
    }
  }, [disasters]);

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
            disabled={isLoading}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-red-400"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Connecting...</span>
              </>
            ) : (
              'Connect Wallet'
            )}
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
                disabled={isLoading}
                className="bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 min-w-[180px]"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Connecting...</span>
                  </>
                ) : (
                  'Connect Wallet'
                )}
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

      {/* Platform Impact Analytics */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Platform Impact Analytics</h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            Real-time off-chain database cache synchronized with live blockchain event data.
          </p>

          {isLoadingAnalytics || !analyticsData ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner message="Aggregating analytics..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Chart 1: Category Distribution */}
              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex justify-between items-center">
                  <span>Funds Raised by Category (ETH)</span>
                  <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-mono">Bar Chart</span>
                </h3>
                <div className="h-72">
                  {analyticsData.categoryData && analyticsData.categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#818cf8" stopOpacity={0.6} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                          labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
                        />
                        <Bar dataKey="value" fill="url(#barGrad)" radius={[8, 8, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col justify-center items-center h-full text-gray-400">
                      <p className="text-sm">No category data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Chart 2: Severity breakdown */}
              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex justify-between items-center">
                  <span>Severity Distribution</span>
                  <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-mono">Donut Chart</span>
                </h3>
                <div className="h-72 flex items-center justify-center">
                  {analyticsData.severityData && analyticsData.severityData.length > 0 ? (
                    <>
                      <div className="w-1/2 h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.severityData}
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {analyticsData.severityData.map((entry, index) => {
                                const colors = {
                                  Critical: '#ef4444',
                                  High: '#f97316',
                                  Medium: '#eab308',
                                  Low: '#22c55e'
                                };
                                return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#6366f1'} />;
                              })}
                            </Pie>
                            <Tooltip
                              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-1/2 flex flex-col space-y-3 pl-4">
                        {analyticsData.severityData.map((entry) => {
                          const colors = {
                            Critical: 'bg-red-500',
                            High: 'bg-orange-500',
                            Medium: 'bg-yellow-500',
                            Low: 'bg-green-500'
                          };
                          return (
                            <div key={entry.name} className="flex items-center text-sm">
                              <span className={`w-3.5 h-3.5 rounded-full ${colors[entry.name] || 'bg-indigo-500'} mr-2.5`} />
                              <span className="font-medium text-gray-700 w-16">{entry.name}:</span>
                              <span className="text-gray-500 font-semibold">{entry.value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 text-sm">No severity data available</div>
                  )}
                </div>
              </div>

              {/* Chart 3: Live donation timeline */}
              <div className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex justify-between items-center">
                  <span>Recent Donation Timeline (ETH)</span>
                  <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-mono">Area Chart</span>
                </h3>
                <div className="h-64">
                  {analyticsData.donationTimeline && analyticsData.donationTimeline.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.donationTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#areaGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col justify-center items-center h-full text-gray-400">
                      <p className="text-sm">No donations logged yet</p>
                      <p className="text-xs mt-1">Donations will populate this graph as they are made on-chain.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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