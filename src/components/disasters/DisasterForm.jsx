import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Web3Context } from '../../context/Web3Context';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import { ethers } from 'ethers';

const DisasterForm = () => {
  const { contract, account } = useContext(Web3Context);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    disasterName: '',
    severity: 'Medium',
    disasterType: 'Earthquake',
    description: '',
    affectedAreas: '',
    affectedPeopleCount: '',
    targetCollectionAmount: '', 
    reliefOrganizations: []
  });
  
  const [availableOrgs, setAvailableOrgs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const disasterTypes = [
    'Earthquake', 'Flood', 'Hurricane', 'Wildfire',
    'Tornado', 'Tsunami', 'Drought', 'Volcanic Eruption',
    'Landslide', 'Pandemic', 'Conflict', 'Other'
  ];

  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (contract) {
        try {
          // Properly handle the tuple returned by getAllOrganizations
          const [addresses, names, donations] = await contract.getAllOrganizations();
          
          // Process into an array of organization objects
          const orgs = addresses.map((address, index) => ({
            address: address,
            name: names[index],
            totalDonations: donations[index]
          }));
          
          setAvailableOrgs(orgs);
        } catch (err) {
          console.error("Error fetching organizations:", err);
          setError("Failed to load organizations");
        }
      }
    };
    
    fetchOrganizations();
  }, [contract]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOrgSelect = (orgAddress) => {
    setFormData(prev => {
      const alreadySelected = prev.reliefOrganizations.includes(orgAddress);
      return {
        ...prev,
        reliefOrganizations: alreadySelected
          ? prev.reliefOrganizations.filter(addr => addr !== orgAddress)
          : [...prev.reliefOrganizations, orgAddress]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const tx = await contract.createDisaster(
        formData.disasterName,
        formData.severity,
        formData.disasterType,
        formData.description,
        formData.affectedAreas,
        formData.affectedPeopleCount,
        ethers.parseEther(formData.targetCollectionAmount),
        formData.reliefOrganizations
      );
      
      await tx.wait();
      setSuccess(true);
      setTimeout(() => navigate('/disasters'), 2000);
    } catch (err) {
      console.error("Error creating disaster:", err);
      setError(err.message || "Failed to create disaster");
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Access Required</h2>
        <p className="text-gray-600">
          You must be connected with an admin account to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Disaster</h2>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message="Disaster created successfully!" />}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="disasterName">
              Disaster Name
            </label>
            <input
              type="text"
              id="disasterName"
              name="disasterName"
              value={formData.disasterName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="severity">
              Severity
            </label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {severityLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="disasterType">
              Disaster Type
            </label>
            <select
              id="disasterType"
              name="disasterType"
              value={formData.disasterType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {disasterTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="affectedPeopleCount">
              Affected People Count
            </label>
            <input
              type="number"
              id="affectedPeopleCount"
              name="affectedPeopleCount"
              value={formData.affectedPeopleCount}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="affectedAreas">
            Affected Areas
          </label>
          <input
            type="text"
            id="affectedAreas"
            name="affectedAreas"
            value={formData.affectedAreas}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="targetCollectionAmount">
            Target Amount (ETH)
          </label>
          <input
            type="number"
            id="targetCollectionAmount"
            name="targetCollectionAmount"
            value={formData.targetCollectionAmount}
            onChange={handleChange}
            step="0.01"
            min="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">
            Relief Organizations
          </label>
          {availableOrgs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableOrgs.map(org => (
                <div key={org.address} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`org-${org.address}`}
                    checked={formData.reliefOrganizations.includes(org.address)}
                    onChange={() => handleOrgSelect(org.address)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`org-${org.address}`} className="ml-2 text-gray-700">
                    {org.name} ({org.address.slice(0, 6)}...{org.address.slice(-4)})
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No organizations available. Please create organizations first.</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/disasters')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner size="small" /> : 'Create Disaster'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DisasterForm;