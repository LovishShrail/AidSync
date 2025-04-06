import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';
import DisasterList from '../components/disasters/DisasterList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import { ethers } from 'ethers';

const DisastersPage = () => {
  const { contract, account, isAdmin } = useContext(Web3Context);
  const [disasters, setDisasters] = useState([]);
  const [filteredDisasters, setFilteredDisasters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    severity: 'all',
    status: 'all'
  });

  useEffect(() => {
    const fetchDisasters = async () => {
      if (contract) {
        try {
          setIsLoading(true);
          const disastersData = await contract.getAllDisasterData();

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
          setFilteredDisasters(processedDisasters);
        } catch (err) {
          console.error("Error fetching disasters:", err);
          setError("Failed to load disasters");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDisasters();
  }, [contract]);

  useEffect(() => {
    let result = [...disasters];

    if (filters.type !== 'all') {
      result = result.filter(d => d.type === filters.type);
    }

    if (filters.severity !== 'all') {
      result = result.filter(d => d.severity === filters.severity);
    }

    if (filters.status !== 'all') {
      if (filters.status === 'active') {
        result = result.filter(d => d.collectedAmount < d.targetAmount);
      } else if (filters.status === 'completed') {
        result = result.filter(d => d.collectedAmount >= d.targetAmount);
      }
    }

    setFilteredDisasters(result);
  }, [filters, disasters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading disasters..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">All Disasters</h1>

          {isAdmin && (
            <Link
              to="/disasters/create"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create New Disaster
            </Link>
          )}
        </div> */}

        {/* Filters */}
        {/* <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Disaster Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Types</option>
                <option value="earthquake">Earthquake</option>
                <option value="flood">Flood</option>
                <option value="hurricane">Hurricane</option>
                <option value="wildfire">Wildfire</option>
                <option value="drought">Drought</option>
                <option value="other">Tsunami</option>
                <option value="other">Tornado</option>
                <option value="other">Volcanic Eruption</option>
                <option value="other">Pandemic</option>
                <option value="other">Landslide</option>
                <option value="other">Conflict</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Severity</label>
              <select
                name="severity"
                value={filters.severity}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div> */}

        {/* Disaster List */}
        {filteredDisasters.length > 0 ? (
          <DisasterList disasters={filteredDisasters} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-medium text-gray-700">No disasters match your filters</h3>
            <button
              onClick={() => setFilters({
                type: 'all',
                severity: 'all',
                status: 'all'
              })}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisastersPage;