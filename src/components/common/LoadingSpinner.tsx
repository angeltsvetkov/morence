import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-sky-300 via-blue-200 to-blue-300">
      <div className="relative">
        {/* Sun */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full animate-pulse shadow-lg shadow-yellow-300/50">
            {/* Sun rays */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
              <div className="absolute w-1 h-6 bg-yellow-400 rounded-full -top-7 left-1/2 transform -translate-x-1/2"></div>
              <div className="absolute w-1 h-6 bg-yellow-400 rounded-full -bottom-7 left-1/2 transform -translate-x-1/2"></div>
              <div className="absolute w-6 h-1 bg-yellow-400 rounded-full -left-7 top-1/2 transform -translate-y-1/2"></div>
              <div className="absolute w-6 h-1 bg-yellow-400 rounded-full -right-7 top-1/2 transform -translate-y-1/2"></div>
              <div className="absolute w-1 h-4 bg-yellow-400 rounded-full -top-5 -left-5 transform rotate-45"></div>
              <div className="absolute w-1 h-4 bg-yellow-400 rounded-full -top-5 -right-5 transform -rotate-45"></div>
              <div className="absolute w-1 h-4 bg-yellow-400 rounded-full -bottom-5 -left-5 transform -rotate-45"></div>
              <div className="absolute w-1 h-4 bg-yellow-400 rounded-full -bottom-5 -right-5 transform rotate-45"></div>
            </div>
          </div>
        </div>

        {/* Main container with waves */}
        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-b from-transparent to-blue-400">
          {/* Animated waves */}
          <div className="absolute bottom-0 left-0 w-full h-full">
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-full transform animate-bounce" style={{ animationDuration: '2s' }}></div>
            <div className="absolute bottom-2 left-0 w-full h-6 bg-gradient-to-t from-blue-400 to-blue-300 rounded-full transform animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }}></div>
            <div className="absolute bottom-4 left-0 w-full h-4 bg-gradient-to-t from-blue-300 to-blue-200 rounded-full transform animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.6s' }}></div>
          </div>

          {/* Beach ball */}
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-500 animate-bounce" style={{ animationDuration: '1.5s' }}>
            <div className="absolute top-0 left-1/2 w-1/2 h-full bg-gradient-to-br from-white to-red-200 rounded-r-full"></div>
            <div className="absolute top-1/2 left-0 w-full h-1/2 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-b-full"></div>
          </div>

          {/* Palm tree */}
          <div className="absolute bottom-8 left-4">
            <div className="w-1 h-6 bg-amber-700 rounded-full"></div>
            <div className="absolute -top-1 -left-2 w-2 h-3 bg-green-500 rounded-full transform rotate-12"></div>
            <div className="absolute -top-1 -right-2 w-2 h-3 bg-green-500 rounded-full transform -rotate-12"></div>
            <div className="absolute -top-2 -left-1 w-2 h-3 bg-green-600 rounded-full transform rotate-6"></div>
            <div className="absolute -top-2 -right-1 w-2 h-3 bg-green-600 rounded-full transform -rotate-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
