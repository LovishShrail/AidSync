import { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context'; // ✅ Correct import

export function useWallet() {
  const {
    provider,
    signer,
    account,
    networkId,
    connectWallet
  } = useWeb3(); 

  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      await connectWallet();
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getEthBalance = async () => {
    if (!provider || !account) return null;

    try {
      const balance = await provider.getBalance(account);
      return ethers.utils.formatEther(balance);
    } catch (err) {
      console.error('Error getting ETH balance:', err);
      return null;
    }
  };

  return {
    provider,
    signer,
    account,
    networkId,
    isConnecting,
    error,
    connect,
    formatAddress,
    getEthBalance
  };
}
