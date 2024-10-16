// ./src/signup/components/LandingPage.js
import React from 'react';

const LandingPage = ({ onGenerateKeys, onTryGuest }) => {
  return (
    <>
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">Berand</h1>
        <p className="text-xs text-gray-300 mb-8">
          First user-owned AI web analytics. Explore decentralized data insights.
        </p>
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
      </div>
      <div className="flex justify-center space-x-4 mb-8">
        <div className="w-4 h-4 bg-white"></div>
        <div className="w-4 h-4 bg-gray-600"></div>
        <div className="w-4 h-4 bg-gray-600"></div>
      </div>
      <div className="space-y-4">
        <button
          className="w-full h-12 bg-white text-[#1f1f1f] hover:bg-gray-200 flex items-center justify-center"
          onClick={onGenerateKeys}
        >
          <div className="grid grid-cols-[repeat(11,1fr)] gap-1 mr-2">
            {[...Array(11)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-[#1f1f1f]"></div>
            ))}
          </div>
          <span className="text-xs">Create account</span>
        </button>
        <a href="#" className="block text-center text-xs text-white hover:underline" onClick={onTryGuest}>
          Try as a guest
        </a>
      </div>
    </>
  );
};

export default LandingPage;
