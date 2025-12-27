// components/dashboard/StatsCard.jsx
import React from 'react';

const StatsCard = ({ icon: Icon, label, value, change, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <span className="text-2xl font-bold text-gray-900">
          {value}
        </span>
      </div>
      <h3 className="text-gray-700 font-medium mb-1">{label}</h3>
      <p className="text-sm text-gray-500">{change}</p>
    </div>
  );
};

export default StatsCard;