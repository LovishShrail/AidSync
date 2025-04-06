// import { useAuth } from '../context/AuthContext';
// import { useWeb3 } from '../context/Web3Context';
// import { useContract } from './useContract';
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useNotification } from '../context/NotificationContext';

// export function useAdmin() {
//   const { isAdmin } = useAuth();
//   const { account } = useWeb3();
  
//   const { 
//     createDisaster,
//     createOrganization,
//     withdraw,
//     deleteDisaster,
//     isLoading
//   } = useContract();
//   const [adminActionLoading, setAdminActionLoading] = useState(false);
//   const navigate = useNavigate();
//   const notification = useNotification();

//   const handleCreateDisaster = async (disasterData) => {
//     if (!isAdmin) {
//       notification.error('Only admin can create disasters');
//       return false;
//     }
    
//     setAdminActionLoading(true);
//     try {
//       await createDisaster(disasterData);
//       notification.success('Disaster created successfully');
//       setAdminActionLoading(false);
//       navigate('/disasters');
//       return true;
//     } catch (err) {
//       console.error('Error creating disaster:', err);
//       setAdminActionLoading(false);
//       return false;
//     }
//   };

//   const handleCreateOrganization = async (name, address) => {
//     if (!isAdmin) {
//       notification.error('Only admin can create organizations');
//       return false;
//     }
    
//     setAdminActionLoading(true);
//     try {
//       await createOrganization(name, address);
//       notification.success('Organization created successfully');
//       setAdminActionLoading(false);
//       return true;
//     } catch (err) {
//       console.error('Error creating organization:', err);
//       setAdminActionLoading(false);
//       return false;
//     }
//   };

  

//   const handleWithdraw = async () => {
//     if (!isAdmin) {
//       notification.error('Only admin can withdraw funds');
//       return false;
//     }
    
//     setAdminActionLoading(true);
//     try {
//       await withdraw();
//       notification.success('Funds withdrawn successfully');
//       setAdminActionLoading(false);
//       return true;
//     } catch (err) {
//       console.error('Error withdrawing funds:', err);
//       setAdminActionLoading(false);
//       return false;
//     }
//   };

//   const handleDeleteDisaster = async (disasterId) => {
//     if (!isAdmin) {
//       notification.error('Only admin can delete disasters');
//       return false;
//     }
    
//     setAdminActionLoading(true);
//     try {
//       await deleteDisaster(disasterId);
//       notification.success('Disaster deleted successfully');
//       setAdminActionLoading(false);
//       return true;
//     } catch (err) {
//       console.error('Error deleting disaster:', err);
//       setAdminActionLoading(false);
//       return false;
//     }
//   };

//   return {
//     isAdmin,
//     adminAccount: isAdmin ? account : null,
//     isLoading: isLoading || adminActionLoading,
//     handleCreateDisaster,
//     handleCreateOrganization,
//     handleWithdraw,
//     handleDeleteDisaster
//   };

  
// }


// export default useAdmin;


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { useWeb3 } from '../context/Web3Context';

export function useAdmin() {
  const { account, contract, isOwner: isAdmin } = useWeb3();
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const notification = useNotification();

  const handleAdminAction = async (action, successMessage, ...args) => {
    if (!isAdmin) {
      const errorMsg = 'Only admin can perform this action';
      notification.error(errorMsg);
      setError(errorMsg);
      return false;
    }

    if (!contract) {
      const errorMsg = 'No contract connection available';
      notification.error(errorMsg);
      setError(errorMsg);
      return false;
    }

    setAdminActionLoading(true);
    setError(null);

    try {
      await action(...args);
      notification.success(successMessage);
      return true;
    } catch (err) {
      console.error(`Error performing admin action: ${err.message || err}`);
      notification.error(err.message || 'Transaction failed');
      setError(err.message || 'Transaction failed');
      return false;
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleCreateDisaster = async (disasterData) => {
    const result = await handleAdminAction(
      async () => {
        await contract.createDisaster(
          disasterData.name,
          disasterData.description,
          disasterData.location,
          disasterData.imageUrl
        );
      },
      'Disaster created successfully'
    );
    
    if (result) navigate('/disasters');
    return result;
  };

  const handleCreateOrganization = async (name, address) => {
    return handleAdminAction(
      async () => {
        await contract.addOrganization(name, address);
      },
      'Organization created successfully'
    );
  };

  const handleWithdraw = async () => {
    return handleAdminAction(
      async () => {
        await contract.withdraw();
      },
      'Funds withdrawn successfully'
    );
  };

  const handleDeleteDisaster = async (disasterId) => {
    return handleAdminAction(
      async () => {
        await contract.removeDisaster(disasterId);
      },
      'Disaster deleted successfully'
    );
  };

  return {
    isAdmin,
    adminAccount: isAdmin ? account : null,
    isLoading: adminActionLoading,
    error,
    handleCreateDisaster,
    handleCreateOrganization,
    handleWithdraw,
    handleDeleteDisaster
  };
}

export default useAdmin;