import React from 'react';

const StatusBadge = ({ label, color }) => {
  return (
    <span 
      className={`inline-block ${color} text-white text-xs font-semibold px-2 py-1 rounded-full`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;