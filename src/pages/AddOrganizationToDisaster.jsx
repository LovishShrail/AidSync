import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';

const AddOrganizationToDisaster = () => {
  const { disasterId } = useParams();
  const navigate = useNavigate();
  const { contract, account } = useContext(Web3Context);
  
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [existingOrgs, setExistingOrgs] = useState([]);

  // Fetch data when contract becomes available
  React.useEffect(() => {
    const fetchData = async () => {
      if (!contract || !account) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Check ownership first
        const contractOwner = await contract.owner();
        const ownerStatus = contractOwner.toLowerCase() === account.toLowerCase();
        setIsOwner(ownerStatus);
        
        if (!ownerStatus) {
          setError("Only the contract owner can add organizations to disasters");
          return;
        }

        // Get all organizations
        const [addresses, names, donations] = await contract.getAllOrganizations();
        const orgs = addresses.map((address, index) => ({
          address,
          name: names[index],
          donations: donations[index]
        }));
        setOrganizations(orgs);
        
        // Get disaster data
        const disasterData = await contract.getDisaster(disasterId);
        if (disasterData && disasterData.reliefOrganizations) {
          setExistingOrgs(disasterData.reliefOrganizations);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [contract, account, disasterId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!selectedOrg) {
        throw new Error("Please select an organization");
      }

      const tx = await contract.addOrganizationToDisaster(disasterId, selectedOrg);
      await tx.wait();
      
      setSuccess("Organization added to disaster successfully!");
      setTimeout(() => navigate(`/disasters/${disasterId}`), 2000);
    } catch (err) {
      console.error("Failed to add organization:", err);
      // Improved error message extraction
      const errorMessage = err.data?.message || err.reason || err.message;
      setError(errorMessage || "Failed to add organization to disaster");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter organizations that are not already part of this disaster
  const availableOrganizations = organizations.filter(org => 
    !existingOrgs.includes(org.address)
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

  if (isLoading) {
    return <LoadingSpinner />;
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
            disabled={isLoading || !isOwner || availableOrganizations.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner size="small" /> : 'Add Organization'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddOrganizationToDisaster;