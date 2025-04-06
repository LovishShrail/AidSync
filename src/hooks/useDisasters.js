import { useState, useEffect, useCallback } from 'react';
import { useContract } from './useContract';
import { ethers } from 'ethers';

export function useDisasters() {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAllDisasters, getDisasterById, isLoading: contractLoading } = useContract();

  const fetchAllDisasters = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const disasterData = await getAllDisasters();
      
      // Transform contract data to more usable format
      const formattedDisasters = disasterData.map((disaster, index) => ({
        id: index,
        name: disaster.disasterName,
        severity: disaster.severity,
        type: disaster.disasterType,
        description: disaster.description,
        affectedAreas: disaster.affectedAreas,
        affectedPeopleCount: disaster.affectedPeopleCount.toNumber(),
        targetAmount: ethers.utils.formatEther(disaster.targetCollectionAmount),
        collectedAmount: ethers.utils.formatEther(disaster.totalCollectedAmount),
        progress: parseFloat(
          (ethers.utils.formatEther(disaster.totalCollectedAmount) / 
           ethers.utils.formatEther(disaster.targetCollectionAmount) * 100).toFixed(2)
        ),
        reliefOrganizations: disaster.reliefOrganizations,
        topDonors: disaster.topDonors
      }));
      
      setDisasters(formattedDisasters);
    } catch (err) {
      console.error('Error fetching disasters:', err);
      setError('Failed to load disasters. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [getAllDisasters]);

  const fetchDisasterById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const disaster = await getDisasterById(id);
      
      if (!disaster) {
        setError('Disaster not found');
        setLoading(false);
        return null;
      }
      
      return {
        id: parseInt(id),
        name: disaster.disasterName,
        severity: disaster.severity,
        type: disaster.disasterType,
        description: disaster.description,
        affectedAreas: disaster.affectedAreas,
        affectedPeopleCount: disaster.affectedPeopleCount.toNumber(),
        targetAmount: ethers.utils.formatEther(disaster.targetCollectionAmount),
        collectedAmount: ethers.utils.formatEther(disaster.totalCollectedAmount),
        progress: parseFloat(
          (ethers.utils.formatEther(disaster.totalCollectedAmount) / 
           ethers.utils.formatEther(disaster.targetCollectionAmount) * 100).toFixed(2)
        ),
        reliefOrganizations: disaster.reliefOrganizations,
        topDonors: disaster.topDonors
      };
    } catch (err) {
      console.error('Error fetching disaster details:', err);
      setError('Failed to load disaster details. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getDisasterById]);

  // Load disasters on mount
  useEffect(() => {
    fetchAllDisasters();
  }, [fetchAllDisasters]);

  const filterDisastersByType = (type) => {
    if (!type || type === 'All') return disasters;
    return disasters.filter(disaster => disaster.type === type);
  };

  const filterDisastersBySeverity = (severity) => {
    if (!severity || severity === 'All') return disasters;
    return disasters.filter(disaster => disaster.severity === severity);
  };

  const sortDisasters = (criteria) => {
    const sortedDisasters = [...disasters];
    
    switch (criteria) {
      case 'nameAsc':
        return sortedDisasters.sort((a, b) => a.name.localeCompare(b.name));
      case 'nameDesc':
        return sortedDisasters.sort((a, b) => b.name.localeCompare(a.name));
      case 'progressAsc':
        return sortedDisasters.sort((a, b) => a.progress - b.progress);
      case 'progressDesc':
        return sortedDisasters.sort((a, b) => b.progress - a.progress);
      case 'targetAmountAsc':
        return sortedDisasters.sort((a, b) => parseFloat(a.targetAmount) - parseFloat(b.targetAmount));
      case 'targetAmountDesc':
        return sortedDisasters.sort((a, b) => parseFloat(b.targetAmount) - parseFloat(a.targetAmount));
      case 'severityHigh':
        const severityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
        return sortedDisasters.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
      case 'severityLow':
        const severityOrderReverse = { 'Critical': 3, 'High': 2, 'Medium': 1, 'Low': 0 };
        return sortedDisasters.sort((a, b) => severityOrderReverse[a.severity] - severityOrderReverse[b.severity]);
      default:
        return sortedDisasters;
    }
  };

  return {
    disasters,
    loading: loading || contractLoading,
    error,
    fetchAllDisasters,
    fetchDisasterById,
    filterDisastersByType,
    filterDisastersBySeverity,
    sortDisasters
  };
}