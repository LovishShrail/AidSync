import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Web3Context } from '../../context/Web3Context';
import { formatEther, formatAddress } from '../../utils/formatters';
import { LoadingSpinner } from '../common/LoadingSpinner';

const OrganizationProfile = () => {
  const { organizationAddress } = useParams();
  const { contract } = useContext(Web3Context);
  
  const [organization, setOrganization] = useState(null);
  const [relatedDisasters, setRelatedDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        // Fetch organization details
        const [name, totalDonations] = await contract.getOrganization(organizationAddress);
        
        setOrganization({
          address: organizationAddress,
          name,
          totalDonations,
          // These would come from additional storage not in the current contract
          description: "This organization provides emergency relief, medical aid, and resources to disaster-affected areas.",
          website: "https://example.org",
          established: "2015"
        });
        
        // Fetch all disasters to find ones this organization is part of
        const disasters = await contract.getAllDisasterData();
        
        const related = disasters.filter(disaster => 
          disaster.reliefOrganizations.includes(organizationAddress)
        );
        
        setRelatedDisasters(related);
      } catch (error) {
        console.error('Error fetching organization details:', error);
        setError('Failed to load organization details');
      } finally {
        setLoading(false);
      }
    };

    if (contract && organizationAddress) {
      fetchOrganizationData();
    }
  }, [contract, organizationAddress]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-md my-4">
        {error}
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="bg-yellow-100 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md my-4">
        Organization not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-bold text-4xl">{organization.name.charAt(0)}</span>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{organization.name}</h2>
            <p className="text-gray-500 mb-2">{formatAddress(organization.address)}</p>
            {organization.website && (
              <a 
                href={organization.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                {organization.website}
              </a>
            )}
          </div>
          
          <div className="ml-auto bg-green-50 px-4 py-3 rounded-md">
            <div className="text-sm text-gray-600">Total Donations Received</div>
            <div className="text-2xl font-bold text-green-600">
              {formatEther(organization.totalDonations)} ETH
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-lg font-semibold mb-3">About this Organization</h3>
          <p className="text-gray-700 mb-4">{organization.description}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm text-gray-600">Established</div>
              <div className="font-medium">{organization.established}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm text-gray-600">Areas Served</div>
              <div className="font-medium">Global</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Related Disasters</h3>
        {relatedDisasters.length > 0 ? (
          <ul className="space-y-4">
            {relatedDisasters.map((disaster, index) => (
              <li key={index} className="p-4 bg-gray-50 rounded-md">
                <h4 className="text-md font-semibold text-gray-900">{disaster.disasterName}</h4>
                <p className="text-gray-600">Type: {disaster.disasterType}</p>
                <p className="text-gray-600">Severity: {disaster.severity}</p>
                <p className="text-gray-600">Total Collected: {formatEther(disaster.totalCollectedAmount)} ETH</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No related disasters found for this organization.</p>
        )}
      </div>
    </div>
  );
};

export default OrganizationProfile;