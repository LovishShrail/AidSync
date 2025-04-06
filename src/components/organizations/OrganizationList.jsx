import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Web3Context } from '../../context/Web3Context';
import { ethers } from 'ethers';
import LoadingSpinner from '../common/LoadingSpinner';

const OrganizationList = () => {
  const { contract } = useContext(Web3Context);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!contract) {
        setLoading(false);
        setError('Contract not connected');
        return;
      }

      try {
        // Use the getAllOrganizations function from the contract
        const [addresses, names, donations] = await contract.getAllOrganizations();
        
        const orgsData = addresses.map((address, index) => ({
          id: index,
          address: address,
          name: names[index],
          totalDonations: donations[index]
        }));
        
        setOrganizations(orgsData);
        setError('');
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setError('Failed to load organizations');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [contract]);

  // Format ETH amount with ethers
  const formatEther = (value) => {
    try {
      return ethers.utils.formatEther(value);
    } catch (error) {
      console.error('Error formatting ether value:', error);
      return '0';
    }
  };

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

  if (organizations.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 px-4 py-3 rounded-md my-4">
        No organizations found.
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {organizations.map((org) => (
        <Link 
          key={org.id} 
          to={`/organizations/${org.address}`}
          className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-bold text-xl">
                  {org.name && org.name.length > 0 ? org.name.charAt(0) : '?'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{org.name || 'Unknown Organization'}</h3>
                <p className="text-sm text-gray-500 break-all">{org.address}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Donations:</span>
                <span className="font-bold text-green-600">{formatEther(org.totalDonations)} ETH</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default OrganizationList;