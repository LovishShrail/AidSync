// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useWallet } from '../hooks/useWallet';
// import { useContract } from '../hooks/useContract';

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [username, setUsername] = useState('');
//   const { account } = useWallet();
//   const { contract } = useContract();

//   useEffect(() => {
//     const checkAdminStatus = async () => {
//       if (!account || !contract) return;
      
//       try {
//         const owner = await contract.owner();
//         setIsAdmin(account.toLowerCase() === owner.toLowerCase());
        
//         // Try to get username if it exists
//         try {
//           const name = await contract.getDonorName(account);
//           if (name && name !== '') {
//             setUsername(name);
//           }
//         } catch (error) {
//           console.log('User may not have a username yet');
//         }
//       } catch (error) {
//         console.error('Error checking admin status:', error);
//         setIsAdmin(false);
//       }
//     };

//     checkAdminStatus();
//   }, [account, contract]);

//   const setUserName = async (name) => {
//     // This doesn't directly save the name to the contract
//     // It would be saved when making a donation
//     setUsername(name);
//   };

//   return (
//     <AuthContext.Provider value={{ isAdmin, username, setUserName }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWeb3 } from './Web3Context';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState('');
  const { account, contract, isOwner } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!account || !contract) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to get username if it exists
        try {
          const name = await contract.getDonorName(account);
          if (name && name !== '') {
            setUsername(name);
          }
        } catch (error) {
          // It's okay if this fails - user might not have a username yet
          console.log('User may not have a username yet');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [account, contract]);

  const setUserName = async (name) => {
    setUsername(name);
    // Note: This just updates UI state
    // The actual name will be saved when making a donation
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAdmin: isOwner, // Use isOwner from Web3Context
        username, 
        setUserName,
        isLoading,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}