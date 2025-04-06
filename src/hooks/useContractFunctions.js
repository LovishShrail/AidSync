// src/hooks/useContractFunctions.js
import { useState, useEffect,useContext } from 'react';
import { Web3Context } from '../context/Web3Context';
import { formatEther } from '../utils/formatters';

export const useContractFunctions = () => {
  const { contract, account } = useContext(Web3Context);
  const [userDonations, setUserDonations] = useState([]);
  const [totalDonated, setTotalDonated] = useState(0);
  const [disastersSupported, setDisastersSupported] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all disasters with user's donations
  const fetchUserDonations = async () => {
    if (!contract || !account) return;

    setIsLoading(true);
    setError(null);
    try {
      const allDisasters = await contract.getAllDisasterData();
      const orgData = await contract.getAllOrganizations();
      const orgMap = orgData[0].reduce((acc, addr, i) => {
        acc[addr.toLowerCase()] = orgData[1][i];
        return acc;
      }, {});

      const donations = [];
      let total = 0;
      let supportedCount = 0;

      for (let i = 0; i < allDisasters.length; i++) {
        const [donors, amounts] = await contract.getTopDonors(i);
        const userIndex = donors.findIndex(d => d.toLowerCase() === account.toLowerCase());
        
        if (userIndex !== -1) {
          const amount = amounts[userIndex];
          donations.push({
            disasterId: i,
            disasterName: allDisasters[i].disasterName,
            amount: amount,
            organization: allDisasters[i].reliefOrganizations[0],
            timestamp: Date.now() // Note: Contract doesn't store timestamps
          });
          total += Number(formatEther(amount));
          supportedCount++;
        }
      }

      // Format donations with org names
      const formattedDonations = donations.map(d => ({
        ...d,
        organization: orgMap[d.organization.toLowerCase()] || d.organization,
        amount: formatEther(d.amount)
      }));

      setUserDonations(formattedDonations);
      setTotalDonated(total);
      setDisastersSupported(supportedCount);
    } catch (err) {
      console.error("Error fetching donations:", err);
      setError("Failed to load donation data");
    } finally {
      setIsLoading(false);
    }
  };

  // Update username
  const updateUsername = async (username) => {
    if (!contract || !account) return;

    setIsLoading(true);
    setError(null);
    try {
      // Note: Your contract doesn't have an updateUsername function yet
      // We'll need to add this to the contract
      const tx = await contract.updateUsername(username);
      await tx.wait();
      return true;
    } catch (err) {
      console.error("Error updating username:", err);
      setError(err.message || "Failed to update username");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userDonations,
    totalDonated,
    disastersSupported,
    isLoading,
    error,
    fetchUserDonations,
    updateUsername
  };
};