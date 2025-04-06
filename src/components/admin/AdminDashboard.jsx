import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Web3Context } from '../../context/Web3Context';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import StatusBadge from '../common/StatusBadge';
import WithdrawForm from './WithdrawForm';
import AdminControls from './AdminControls';
import { ethers } from 'ethers';

const AdminDashboard = () => {
  const [disasters, setDisasters] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { contract, account } = useContext(Web3Context);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!contract) {
          throw new Error("Contract not connected");
        }
        

        // Fetch all data with proper error handling
        const [allDisasters, orgData] = await Promise.all([
          contract.getAllDisasterData()
            .catch(err => { throw new Error(`Failed to load disasters: ${err.message}`); }),
          contract.getAllOrganizations()
            .catch(err => { throw new Error(`Failed to load organizations: ${err.message}`); })
        ]);

        


        // Process disasters
        const processedDisasters = allDisasters.map(disaster => ({
          disasterName: disaster[0] || 'Unknown',
          severity: disaster[1] || 'Unknown',
          disasterType: disaster[2] || 'Unknown',
          totalCollectedAmount: ethers.formatEther(disaster[5] || 0),
          targetCollectionAmount: ethers.formatEther(disaster[6] || 0)
        }));

        console.log("Raw disaster data structure:", allDisasters[0]);

        

        // Process organizations
        const [orgAddresses, orgNames, orgDonations] = orgData;
        const orgsData = orgAddresses.map((address, index) => ({
          address,
          name: orgNames[index],
          totalDonations: ethers.formatEther(orgDonations[index])
        }));

        setDisasters(processedDisasters);
        setOrganizations(orgsData);
      } catch (err) {
        console.error("Admin data load failed:", err);
        setError(err.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    if (contract) {
      fetchData();
    }
  }, [contract]);

  // Redirect if not admin (contract will handle owner checks)
  if (!account) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <Alert
          type="error"
          message="Please connect your wallet to access this page."
        />
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Active Disasters</h2>
          <p className="text-4xl font-bold text-blue-600">{disasters.length}</p>
          <div className="mt-4">
            <button
              onClick={() => navigate('/admin/create-disaster')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create New Disaster
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Relief Organizations</h2>
          <p className="text-4xl font-bold text-green-600">{organizations.length}</p>
          <div className="mt-4">
            <button
              onClick={() => navigate('/admin/manage-organizations')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add Organization
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Emergency Fund</h2>
          <WithdrawForm />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Disaster Management</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disaster Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funding
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {disasters.map((disaster, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {disaster.disasterName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {disaster.disasterType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge
                      type={(disaster.severity || '').toLowerCase()}
                      text={disaster.severity || 'Unknown'}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {disaster.totalCollectedAmount} / {disaster.targetCollectionAmount} ETH
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (Number(disaster.totalCollectedAmount) / Number(disaster.targetCollectionAmount)) * 100,
                            100
                          )}%`
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AdminControls disasterId={index} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Organization Management</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Donations
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organizations.map((org, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {org.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {org.address.substring(0, 8)}...{org.address.substring(org.address.length - 6)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {org.totalDonations} ETH
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;