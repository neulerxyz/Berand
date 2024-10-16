// ./src/signup/components/AllSetPage.js
import React from 'react';

const AllSetPage = ({
  isLogging,
  onToggleLogging,
  registerMinerButtonVisible
}) => {



  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold text-white text-center mb-8">You're all set!</h1>
      
      <div className="w-48 h-48 mx-auto mb-8 relative">
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-1">
          {[...Array(144)].map((_, i) => (
            <div
              key={i}
              className={`${
                i >= 12 && i < 132 && i % 12 !== 0 && i % 12 !== 11 ? 'bg-white' : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-300 text-center mb-8">
              Your account has been created successfully. You can now start earning rewards while browsing websites 🙌
            </p>
      <button
        className="w-full h-12 bg-white text-[#1f1f1f] hover:bg-gray-200 flex items-center justify-center"
        onClick={onToggleLogging}
      >
        <span className="text-xs">{isLogging ? 'Stop Logging' : 'Start Logging'}</span>
      </button>

    </div>
  );
};

export default AllSetPage;
