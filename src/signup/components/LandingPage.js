// ./src/signup/components/LandingPage.js
import React from 'react';

const LandingPage = ({ onGenerateKeys, onTryGuest }) => {
  return (
    <>
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">Berand</h1>
        <p className="text-xs text-gray-300 mb-8">
          Get your favolite Brand Reward
        </p>
        <div className="w-48 h-48 mx-auto mb-8 relative">
          
          <img src="/img/berand-bear.png" style={{ width: '192px', height: '192px' }} alt="Berand Bear" />
          
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
          <span className="text-xs">Create account</span>
        </button>
      </div>
    </>
  );
};

export default LandingPage;
