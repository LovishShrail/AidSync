// src/pages/ProfilePage.js
import React, { useState, useContext } from 'react';
import { Web3Context } from '../context/Web3Context';
import UserProfile from '../components/user/UserProfile';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';

const ProfilePage = () => {
    const { account, connectWallet, isLoading: isWeb3Loading, error } = useContext(Web3Context);

    if (isWeb3Loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 flex justify-center items-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }
    

    if (!account) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Access</h2>
                    <p className="text-gray-600 mb-6">
                        Connect your wallet to view and manage your profile.
                    </p>
                    <button
                        onClick={connectWallet}
                        disabled={isWeb3Loading}
                        className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                    >
                        {isWeb3Loading ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                    {error && (
                        <div className="mt-4">
                            <Alert type="error" message={error} />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <UserProfile />
            </div>
        </div>
    );
};

export default ProfilePage;