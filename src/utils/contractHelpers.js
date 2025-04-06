import { ethers } from 'ethers';
import DisasterDonate from '../contract/DisasterDonate.json';

export const loadContract = async (provider, contractAddress) => {
  const contract = new ethers.Contract(
    contractAddress,
    DisasterDonate.abi,
    provider.getSigner()
  );
  return contract;
};

export const formatDonationAmount = (amount) => {
  return parseFloat(ethers.utils.formatEther(amount)).toFixed(4);
};

export const parseDonationAmount = (amount) => {
  return ethers.parseEther(amount.toString());
};

export const getContractAddress = () => {
  return process.env.REACT_APP_CONTRACT_ADDRESS;
};