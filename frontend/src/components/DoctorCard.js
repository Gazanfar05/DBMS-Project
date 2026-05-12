import React from 'react';
import { FiPhone, FiMail, FiMapPin, FiStar } from 'react-icons/fi';

const DoctorCard = ({ doctor, distance, userLocation }) => {
  return (
    <div className="card-hover bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-5 hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{doctor.name}</h3>
          <p className="text-sm text-blue-600 font-semibold">{doctor.specialization}</p>
        </div>
        <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full">
          <FiStar className="text-yellow-400 fill-current" size={16} />
          <span className="text-sm font-bold text-gray-800">{doctor.rating}</span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <FiMapPin size={16} className="text-blue-500 flex-shrink-0" />
          <span>{doctor.location}</span>
          {distance && <span className="ml-auto text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-semibold">{distance} km away</span>}
        </div>
        <div className="flex items-center gap-2">
          <FiPhone size={16} className="text-green-500 flex-shrink-0" />
          <span>{doctor.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <FiMail size={16} className="text-red-500 flex-shrink-0" />
          <span className="truncate">{doctor.email}</span>
        </div>
      </div>

      <button className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition">
        Contact Doctor
      </button>
    </div>
  );
};

export default DoctorCard;
