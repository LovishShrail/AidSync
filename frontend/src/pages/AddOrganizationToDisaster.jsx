import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';

const AddOrganizationToDisaster = () => {
  const { disasterId } = useParams();
  const navigate = useNavigate();
  const { contract, account } = React.useContext(Web3Context);
  
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [existingOrgs, setExistingOrgs] = useState([]);

  // Fetch data when contract becomes available
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!contract || !account) return;
      
      try {
        if (isMounted) setIsLoading(true);
        if (isMounted) setError(null);
        
        // Check ownership first
        const contractOwner = await contract.owner();
        if (!isMounted) return;
        
        const ownerStatus = contractOwner.toLowerCase() === account.toLowerCase();
        if (isMounted) setIsOwner(ownerStatus);
        
        if (!ownerStatus) {
          if (isMounted) setError("Only the contract owner can add organizations to disasters");
          if (isMounted) setIsLoading(false);
          return;
        }

        // Get all organizations
        const orgsData = await contract.getAllOrganizations();
        if (!isMounted) return;
        
        if (!orgsData) {
          throw new Error("Failed to retrieve organizations data");
        }
        
        const [addresses, names, donations] = orgsData;
        const orgs = addresses.map((address, index) => ({
          address,
          name: names[index],
          donations: donations[index]
        }));
        if (isMounted) setOrganizations(orgs);
        
        // Handle disaster ID carefully - it comes from URL as a string
        // Instead of validating it as a number right away, we'll let the contract do that
        // and handle any resulting errors
        try {
          const disasterData = await contract.getDisaster(disasterId);
          if (!isMounted) return;
          
          if (disasterData && disasterData.reliefOrganizations) {
            if (isMounted) setExistingOrgs(disasterData.reliefOrganizations);
          }
        } catch (disasterErr) {
          console.error("Error fetching disaster:", disasterErr);
          if (isMounted) setError("Could not load disaster data. Please verify the disaster ID is valid.");
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        if (isMounted) setError(err.message || "Failed to load data");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (contract && account) {
      fetchData();
    }
    
    return () => {
      isMounted = false;
    };
  }, [contract, account, disasterId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedOrg) {
      setError("Please select an organization");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Check if contract is available
      if (!contract) {
        throw new Error("Web3 connection not available");
      }

      // For Solidity and ethers.js, directly pass the disasterId
      // The contract will validate and convert it appropriately
      const tx = await contract.addOrganizationToDisaster(disasterId, selectedOrg);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      setSuccess("Organization added to disaster successfully!");
      setTimeout(() => navigate(`/disasters/${disasterId}`), 2000);
    } catch (err) {
      console.error("Failed to add organization:", err);
      
      // More comprehensive error message extraction
      let errorMessage;
      if (err.reason) {
        errorMessage = err.reason;
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        if (err.message.includes("Invalid disaster id")) {
          errorMessage = "The disaster ID is invalid or does not exist";
        } else if (err.message.includes("Relief organization does not exist")) {
          errorMessage = "The selected organization doesn't exist in the contract";
        } else if (err.message.includes("Organization already added")) {
          errorMessage = "This organization is already added to the disaster";
        } else if (err.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected in your wallet";
        } else {
          errorMessage = err.message;
        }
      } else {
        errorMessage = "Failed to add organization to disaster";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter organizations that are not already part of this disaster
  const availableOrganizations = organizations.filter(org => 
    !existingOrgs.some(existingAddr => 
      existingAddr && org.address && 
      existingAddr.toLowerCase() === org.address.toLowerCase()
    )
  );

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Wallet Not Connected</h2>
        <p className="text-gray-600">
          You must connect your wallet to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Add Organization to Disaster #{disasterId}
      </h2>
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
      
      {!isOwner && (
        <Alert 
          type="warning" 
          message="Only the contract owner can add organizations to disasters. Your current wallet address does not have permission." 
        />
      )}
      
      {isLoading && <LoadingSpinner />}
      
      {!isLoading && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="organization">
              Select Organization
            </label>
            {availableOrganizations.length === 0 ? (
              <Alert 
                type="info" 
                message="No available organizations to add. Either all organizations are already part of this disaster or no organizations exist." 
              />
            ) : (
              <select
                id="organization"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!isOwner}
              >
                <option value="">-- Select an organization --</option>
                {availableOrganizations.map((org) => (
                  <option key={org.address} value={org.address}>
                    {org.name} ({org.address.slice(0, 6)}...{org.address.slice(-4)})
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/disasters/${disasterId}`)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !isOwner || availableOrganizations.length === 0 || !selectedOrg}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Organization
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddOrganizationToDisaster;