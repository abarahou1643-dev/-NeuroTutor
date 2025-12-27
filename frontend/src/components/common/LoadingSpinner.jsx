// LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Chargement...' }) => {
  const sizes = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizes[size] || sizes.medium}`}></div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;