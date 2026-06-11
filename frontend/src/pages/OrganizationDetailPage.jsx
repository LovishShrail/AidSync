import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import { ethers } from 'ethers';

const OrganizationDetailPage = () => {
  const { address } = useParams();
  const { contract } = useContext(Web3Context);
  const [organization, setOrganization] = useState(null);
  const [disasters, setDisasters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!contract) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch organization details using getOrganization()
        const [name, totalDonations] = await contract.getOrganization(address);
        
        setOrganization({
          address,
          name,
          totalDonations: ethers.formatEther(totalDonations)
        });
        
        // Fetch all disasters and filter for this organization
        const allDisasters = await contract.getAllDisasterData();
        
        const orgDisasters = allDisasters
          .map((disaster, index) => ({
            id: index,
            name: disaster.disasterName,
            type: disaster.disasterType,
            severity: disaster.severity,
            description: disaster.description,
            affectedAreas: disaster.affectedAreas,
            affectedPeopleCount: Number(disaster.affectedPeopleCount),
            targetAmount: ethers.formatEther(disaster.targetCollectionAmount),
            collectedAmount: ethers.formatEther(disaster.totalCollectedAmount),
            reliefOrganizations: disaster.reliefOrganizations,
            progress: (Number(ethers.formatEther(disaster.totalCollectedAmount)) / 
                     Number(ethers.formatEther(disaster.targetCollectionAmount)) * 100).toFixed(1)
          }))
          .filter(disaster => 
            disaster.reliefOrganizations.some(org => org.toLowerCase() === address.toLowerCase())
          );
        
        setDisasters(orgDisasters);
      } catch (err) {
        console.error("Error fetching organization:", err);
        setError("Failed to load organization details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [address, contract]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner message="Loading organization details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error" message={error} />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="warning" message="Organization not found" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{organization.name}</h1>
        <div className="mb-4 text-gray-500">
          <p>Address: {address}</p>
        </div>
        <div className="flex items-center mb-2">
          <span className="text-xl font-semibold">Total Donations:</span>
          <span className="text-2xl font-bold text-green-600 ml-2">
            {organization.totalDonations} ETH
          </span>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Associated Disasters</h2>
      
      {disasters.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-gray-600">This organization is not associated with any active disasters yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disasters.map((disaster) => (
            <div key={disaster.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className={`py-2 px-4 text-white text-center ${getSeverityColor(disaster.severity)}`}>
                {disaster.severity} Severity
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{disaster.name}</h3>
                <p className="text-gray-600 mb-2">Type: {disaster.type}</p>
                <p className="text-gray-600 mb-4">Affected Areas: {disaster.affectedAreas}</p>
                
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress:</span>
                    <span className="font-medium">{disaster.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, disaster.progress)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm mb-4">
                  <span>Collected: {disaster.collectedAmount} ETH</span>
                  <span>Target: {disaster.targetAmount} ETH</span>
                </div>
                
                <Link 
                  to={`/disasters/${disaster.id}`} 
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-md transition duration-200"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to determine color based on severity
const getSeverityColor = (severity) => {
  switch (severity.toLowerCase()) {
    case 'critical':
    case 'severe':
      return 'bg-red-600';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

export default OrganizationDetailPage;