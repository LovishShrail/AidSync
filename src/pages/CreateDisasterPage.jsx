import React from 'react';
import DisasterForm from '../components/disasters/DisasterForm';

const CreateDisasterPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <DisasterForm />
      </div>
    </div>
  );
};
  
export default CreateDisasterPage;