// src/components/user/ProfileSettings.js
import React, { useState, useContext } from 'react';
import { useContractFunctions } from '../../hooks/useContractFunctions';
import Alert from '../common/Alert';
import LoadingSpinner from '../common/LoadingSpinner';
import { Web3Context } from '../../context/Web3Context';


const ProfileSettings = ({ username: initialUsername, onUpdate  }) => {

  const {  account } = useContext(Web3Context);
  const { updateUsername } = useContractFunctions();
  const [username, setUsername] = useState(initialUsername || '');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const success = await onUpdate(username);
      if (success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to update username");
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-800 mb-4">Profile Settings</h3>
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      {success && <Alert type="success" message="Profile updated successfully!" className="mb-4" />}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Display Name
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your display name"
          />
          <p className="mt-1 text-sm text-gray-500">
            This name will be displayed alongside your donations.
          </p>
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center"
          >
            {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Save Changes
          </button>
        </div>
      </form>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-md font-medium text-gray-800 mb-4">Connected Wallet</h4>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-mono text-sm">{account}</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Connected
            </span>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          This is the wallet you're currently using to interact with the platform.
        </p>
      </div>
    </div>
  );
};

export default ProfileSettings;