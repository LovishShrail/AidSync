import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../../context/Web3Context';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import { formatEther } from '../../utils/formatters';

const WithdrawForm = () => {
  const [balance, setBalance] = useState('0');
  const [emergencyFundBalance, setEmergencyFundBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawingEmergencyFund, setWithdrawingEmergencyFund] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  
  const { contract, account, provider } = useContext(Web3Context);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        if (!contract || !provider) return;
        
        setLoading(true);
        
        // Get contract ETH balance using provider
        const contractAddress = await contract.getAddress();
        const contractBalance = await provider.getBalance(contractAddress);
        
        // Get emergency fund balance from contract
        const emergencyFund = await contract.getEmergencyReliefFund();
        
        setBalance(formatEther(contractBalance));
        setEmergencyFundBalance(formatEther(emergencyFund));
        setLoading(false);
      } catch (err) {
        console.error("Failed to load balances:", err);
        setError("Failed to load contract balances");
        setLoading(false);
      }
    };

    fetchBalances();
  }, [contract, provider, success]);

  const handleWithdraw = async () => {
    try {
      setWithdrawing(true);
      setError(null);
      setSuccess(null);
      
      const tx = await contract.withdraw();
      await tx.wait();
      
      setSuccess("Main funds withdrawn successfully!");
      setWithdrawing(false);
    } catch (err) {
      console.error("Withdrawal failed:", err);
      setError("Failed to withdraw main funds: " + (err.message || err));
      setWithdrawing(false);
    }
  };

  const handleWithdrawEmergencyFund = async () => {
    try {
      setWithdrawingEmergencyFund(true);
      setError(null);
      setSuccess(null);
      
      // Get the full emergency fund balance
      const emergencyFund = await contract.getEmergencyReliefFund();
      
      // Withdraw the entire emergency fund
      const tx = await contract.withdrawEmergencyFund(emergencyFund);
      await tx.wait();
      
      setSuccess("Emergency funds withdrawn successfully!");
      setWithdrawingEmergencyFund(false);
    } catch (err) {
      console.error("Emergency fund withdrawal failed:", err);
      setError("Failed to withdraw emergency funds: " + (err.reason || err.message));
      setWithdrawingEmergencyFund(false);
    }
  };

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Access Required</h2>
        <p className="text-gray-600">
          You must be connected with an admin account to access this page.
        </p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Withdraw Funds</h2>
        
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Contract Balance
          </label>
          <div className="mt-1 text-2xl font-bold text-blue-600">
            {balance} ETH
          </div>
        </div>
        
        <button
          disabled={withdrawing || parseFloat(balance) === 0}
          onClick={handleWithdraw}
          className={`w-full mt-4 py-2 px-4 rounded-md text-white ${
            withdrawing || parseFloat(balance) === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {withdrawing ? <LoadingSpinner size="small" /> : 'Withdraw Main Funds'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Emergency Fund
          </label>
          <div className="mt-1 text-xl font-semibold text-green-600">
            {emergencyFundBalance} ETH
          </div>
          <p className="text-sm text-gray-500 mt-1">
            These funds are reserved for emergency relief and can only be withdrawn by the admin.
          </p>
        </div>
        
        <button
          disabled={withdrawingEmergencyFund || parseFloat(emergencyFundBalance) === 0}
          onClick={handleWithdrawEmergencyFund}
          className={`w-full mt-4 py-2 px-4 rounded-md text-white ${
            withdrawingEmergencyFund || parseFloat(emergencyFundBalance) === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {withdrawingEmergencyFund ? <LoadingSpinner size="small" /> : 'Withdraw Emergency Funds'}
        </button>
      </div>
    </div>
  );
};

export default WithdrawForm;