import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Changed from Web3Context
import { useWeb3 } from '../context/Web3Context'; // For account
import AdminDashboard from '../components/admin/AdminDashboard';
import WithdrawForm from '../components/admin/WithdrawForm';
import AdminControls from '../components/admin/AdminControls';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import { ethers } from 'ethers';

const AdminPage = () => {
  const { account,isLoading  } = useWeb3();
  const { isAdmin } = useAuth(); // Now using AuthContext
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState(null);
  const [tabLoading, setTabLoading] = useState({
    disasters: false,
    withdraw: false,
    organizations: false
  });
  


  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Access Required</h2>
          <p className="text-gray-600">
            Please connect your wallet to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unauthorized Access</h2>
          <p className="text-gray-600">
            Connected account: {account}<br />
            This account does not have admin privileges.
          </p>
        </div>
      </div>
    );
  }

  // if (isLoading) {
  //   return <LoadingSpinner />;
  // }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTabLoading(prev => ({...prev, [tab]: true}));
    
    // Here you would typically load data for the tab
    setTimeout(() => {
      setTabLoading(prev => ({...prev, [tab]: false}));
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Admin Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="opacity-90">Manage disaster relief funds and organizations</p>
          </div>
          
          {/* Admin Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => handleTabChange('dashboard')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => handleTabChange('withdraw')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'withdraw'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Fund Withdrawal
              </button>
              <button
                onClick={() => setActiveTab('controls')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'controls'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                System Controls
              </button>
            </nav>
          </div>
          
          {/* Admin Content */}
          <div className="p-6">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        
        {/* Check if the specific tab is loading */}
        {tabLoading[activeTab] ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'withdraw' && <WithdrawForm />}
            {activeTab === 'controls' && <AdminControls />}
          </>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;