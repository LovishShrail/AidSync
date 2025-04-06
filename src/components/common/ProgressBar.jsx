import React from 'react';

const ProgressBar = ({ progress, text, color = 'bg-blue-500' }) => {
  // Ensure progress is capped between 0 and 100
  const cappedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className="w-full">
      <div className="relative h-4 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${cappedProgress}%` }}
        />
      </div>
      {text && (
        <div className="mt-1 text-xs text-gray-600 font-medium">
          {text}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;