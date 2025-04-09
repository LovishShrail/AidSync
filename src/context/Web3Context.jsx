import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import DisasterDonateContract from '../contract/DisasterDonate.json';

export const Web3Context = createContext();

const SEPOLIA_CHAIN_ID = 11155111;
// const contractAddress = "0xEC50dfc5313892c9B9A628fed6B3d73C459c698f";
const contractAddress = "0xF0d2bdAB7F99400a62bE6d20D5F4A0963470dEbE";

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkId, setNetworkId] = useState(null);

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
              chainName: 'Sepolia Test Network',
              nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://rpc.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/']
            }]
          });
          return true;
        } catch (addError) {
          setError("Failed to add Sepolia network");
          return false;
        }
      }
      setError("Failed to switch to Sepolia");
      return false;
    }
  };

  const checkOwnerStatus = async (address, contract) => {
    if (address && contract) {
      try {
        const ownerAddress = await contract.owner();
        setIsOwner(ownerAddress.toLowerCase() === address.toLowerCase());
      } catch (err) {
        console.error("Error checking owner status:", err);
      }
    }
  };

  const fetchBalance = async (address) => {
    if (!provider || !address) {
      
      return "0";
    }
    try {
      
      const balance = await provider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);
      
      return formattedBalance;
    } catch (err) {
      console.error("Error fetching balance:", err);
      return "0";
    }
  };


  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!window.ethereum) {
        setError("Please install MetaMask");
        return null;
      }

      // Request accounts first
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // Verify network
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== BigInt(SEPOLIA_CHAIN_ID)) {
        const switched = await switchToSepolia();
        if (!switched) return null;
        window.location.reload();
        return;
      }

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        DisasterDonateContract.abi,
        signer
      );

      const balance = await fetchBalance(accounts[0]);
      console.log("Setting balance:", balance);

      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setAccount(accounts[0]);
      setBalance(balance);
      setNetworkId(Number(network.chainId));

      await checkOwnerStatus(accounts[0], contract);


      return accounts[0];
    } catch (error) {
      console.error("Wallet connection error:", error);
      setError(error.message || "Failed to connect wallet");
      return null;
    } finally {
      setIsLoading(false);
    }


  };

  useEffect(() => {
    const init = async () => {
      try {
        if (!window.ethereum) {
          setError("Please install MetaMask");
          setIsLoading(false);
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();

        if (network.chainId !== BigInt(SEPOLIA_CHAIN_ID)) {
          setError(`Please connect to Sepolia testnet (Chain ID: ${SEPOLIA_CHAIN_ID})`);
          setIsLoading(false);
          return;
        }

        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          DisasterDonateContract.abi,
          signer
        );

        setProvider(provider);
        setSigner(signer);
        setContract(contract);
        setNetworkId(Number(network.chainId));

        // Check initial connection
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const balance = await fetchBalance(accounts[0]);
         
          
          setProvider(provider);
          setSigner(signer);
          setContract(contract);
          setAccount(accounts[0]);
          setBalance(balance); // Make sure this is set
          setNetworkId(Number(network.chainId));
          await checkOwnerStatus(accounts[0], contract);
        } else {
          // Initialize without account but with provider
          setProvider(provider);
          setSigner(null);
          setContract(null);
          setAccount(null);
          setBalance("0");
          setNetworkId(Number(network.chainId));
        }

        // Set up event listeners
        window.ethereum.on('accountsChanged', async (accounts) => {
          if (accounts.length > 0) {
            const balance = await fetchBalance(accounts[0]);
           
            setAccount(accounts[0]);
            setBalance(balance);
            checkOwnerStatus(accounts[0], contract);
          } else {
            setAccount(null);
            setBalance("0");
            setIsOwner(false);
          }
        });

        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });

      } catch (error) {
        ;
        setError(error.message || "Failed to initialize web3");
      } finally {
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  useEffect(() => {
    const updateBalance = async () => {
      if (account && provider) {
        const newBalance = await fetchBalance(account);
        setBalance(newBalance);
      }
    };
    
    updateBalance();
  }, [account, provider]);

  return (
    <Web3Context.Provider
      value={{
        account,
        isOwner,
        provider,
        signer,
        contract,
        isLoading,
        error,
        networkId,
        balance,
        connectWallet,
        switchToSepolia
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);

export default Web3Provider;