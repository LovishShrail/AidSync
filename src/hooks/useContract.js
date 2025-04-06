import { useWeb3 } from '../context/Web3Context';
import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useNotification } from '../context/NotificationContext';

export function useContract() {
  const { contract, signer, account } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const notification = useNotification();

  const executeTransaction = async (method, args = [], value = null) => {
    if (!contract || !signer) {
      notification.error('Wallet not connected');
      throw new Error('Wallet not connected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const options = value ? { value: ethers.utils.parseEther(value.toString()) } : {};
      const tx = await contract[method](...args, options);
      
      notification.info(`Transaction submitted: ${tx.hash.substring(0, 10)}...`);
      
      const receipt = await tx.wait();
      
      notification.success('Transaction confirmed');
      setIsLoading(false);
      return receipt;
    } catch (err) {
      console.error(`Error in ${method}:`, err);
      let errorMessage = err.message || 'Transaction failed';
      
      // Try to extract a more user-friendly error message
      if (err.error && err.error.message) {
        errorMessage = err.error.message;
      } else if (err.data && err.data.message) {
        errorMessage = err.data.message;
      }
      
      // Clean up common error messages
      if (errorMessage.includes('user rejected transaction')) {
        errorMessage = 'Transaction was rejected';
      } else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      }
      
      setError(errorMessage);
      notification.error(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const getAllDisasters = useCallback(async () => {
    if (!contract) return [];
    
    try {
      setIsLoading(true);
      const disasters = await contract.getAllDisasterData();
      setIsLoading(false);
      return disasters;
    } catch (err) {
      console.error('Error getting disasters:', err);
      setError(err.message || 'Failed to load disasters');
      setIsLoading(false);
      return [];
    }
  }, [contract]);

  const getDisasterById = useCallback(async (id) => {
    if (!contract) return null;
    
    try {
      setIsLoading(true);
      const disaster = await contract.getDisaster(id);
      setIsLoading(false);
      return disaster;
    } catch (err) {
      console.error('Error getting disaster:', err);
      setError(err.message || 'Failed to load disaster details');
      setIsLoading(false);
      return null;
    }
  }, [contract]);

  const getTopDonors = useCallback(async (disasterId) => {
    if (!contract) return { donors: [], amounts: [] };
    
    try {
      setIsLoading(true);
      const result = await contract.getTopDonors(disasterId);
      setIsLoading(false);
      return {
        donors: result[0],
        amounts: result[1].map(amount => ethers.utils.formatEther(amount))
      };
    } catch (err) {
      console.error('Error getting top donors:', err);
      setError(err.message || 'Failed to load top donors');
      setIsLoading(false);
      return { donors: [], amounts: [] };
    }
  }, [contract]);

  const getEmergencyFund = useCallback(async () => {
    if (!contract) return '0';
    
    try {
      const fund = await contract.getEmergencyReliefFund();
      return ethers.utils.formatEther(fund);
    } catch (err) {
      console.error('Error getting emergency fund:', err);
      return '0';
    }
  }, [contract]);

  const createDisaster = async (disasterData) => {
    const {
      disasterName,
      severity,
      disasterType,
      description,
      affectedAreas,
      affectedPeopleCount,
      targetCollectionAmount,
      reliefOrganizations
    } = disasterData;
    
    return executeTransaction('createDisaster', [
      disasterName,
      severity,
      disasterType,
      description,
      affectedAreas,
      affectedPeopleCount,
      ethers.utils.parseEther(targetCollectionAmount.toString()),
      reliefOrganizations
    ]);
  };

  const createOrganization = async (name, address) => {
    return executeTransaction('createOrganization', [name, address]);
  };

  const donate = async (disasterId, organization, donorName, amount) => {
    return executeTransaction('donate', [disasterId, organization, donorName], amount);
  };

  const addToEmergencyFund = async (amount) => {
    return executeTransaction('addToEmergencyReliefFund', [], amount);
  };

  const withdraw = async () => {
    return executeTransaction('withdraw', []);
  };

  const deleteDisaster = async (disasterId) => {
    return executeTransaction('deleteDisaster', [disasterId]);
  };

  return {
    contract,
    account,
    isLoading,
    error,
    getAllDisasters,
    getDisasterById,
    getTopDonors,
    getEmergencyFund,
    createDisaster,
    createOrganization,
    donate,
    addToEmergencyFund,
    withdraw,
    deleteDisaster
  };
}