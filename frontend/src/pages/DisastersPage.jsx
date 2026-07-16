import React from 'react';
import DisasterList from '../components/disasters/DisasterList';

const DisastersPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <DisasterList />
      </div>
    </div>
  );
};

export default DisastersPage;