import React, { useState, useEffect } from 'react';
import DisasterCard from './DisasterCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { useContract } from '../../hooks/useContract';
import StatusBadge from '../common/StatusBadge';

const DisasterList = () => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const { contract } = useContract();

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const disastersData = await contract.getAllDisasterData();
        setDisasters(disastersData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch disasters:", error);
        setLoading(false);
      }
    };

    if (contract) {
      fetchDisasters();
    }
  }, [contract]);

  const filterDisasters = (disasters) => {
    if (filter === 'all') return disasters;
    
    return disasters.filter(disaster => 
      disaster.disasterType.toLowerCase() === filter.toLowerCase()
    );
  };

  const sortDisasters = (disasters) => {
    const sortedDisasters = [...disasters];
    
    switch (sort) {
      case 'targetAmount':
        return sortedDisasters.sort((a, b) => 
          Number(b.targetCollectionAmount) - Number(a.targetCollectionAmount)
        );
      case 'progress':
        return sortedDisasters.sort((a, b) => {
          const progressA = Number(a.totalCollectedAmount) / Number(a.targetCollectionAmount);
          const progressB = Number(b.totalCollectedAmount) / Number(b.targetCollectionAmount);
          return progressB - progressA;
        });
      case 'severity':
        // Sorting by severity (Critical > High > Medium > Low)
        const severityValues = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return sortedDisasters.sort((a, b) => 
          severityValues[b.severity] - severityValues[a.severity]
        );
      case 'newest':
      default:
        // By default, we'll assume newest on top
        return sortedDisasters;
    }
  };

  const displayedDisasters = sortDisasters(filterDisasters(disasters));

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold mb-4 md:mb-0">Active Disasters</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center">
            <label htmlFor="filter" className="mr-2 text-gray-700">Filter:</label>
            <select 
              id="filter"
              className="border rounded p-2"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
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
          
          <div className="flex items-center">
            <label htmlFor="sort" className="mr-2 text-gray-700">Sort by:</label>
            <select 
              id="sort"
              className="border rounded p-2"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="targetAmount">Highest Target</option>
              <option value="progress">Highest Progress</option>
              <option value="severity">Severity</option>
            </select>
          </div>
        </div>
      </div>

      {displayedDisasters.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          <p className="text-lg text-gray-600">No disasters found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedDisasters.map((disaster, index) => (
            <DisasterCard key={index} disaster={disaster} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DisasterList;