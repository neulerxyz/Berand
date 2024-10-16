// ./src/signup/components/AllSetPage.js
import React from 'react';

const AllSetPage = () => {
  const handleCloseSignup = () => {
    chrome.tabs.getCurrent((tab) => {
      chrome.tabs.remove(tab.id, () => {
        console.log('Signup page closed');
      });
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold text-white text-center mb-8">You're all set!</h1>
      
      <div className="w-48 h-48 mx-auto mb-8 relative">
        <img src="/img/berand-bear.png" style={{ width: '192px', height: '192px' }} alt="Berand Bear" />
      </div>
      <p className="text-xs text-gray-300 text-center mb-8">
        Your account has been created successfully. You can now start earning rewards while browsing websites 🙌
      </p>
      <button
        className="w-full h-12 bg-white text-[#1f1f1f] hover:bg-gray-200 flex items-center justify-center"
        onClick={handleCloseSignup}
      >
        Close
      </button>
    </div>
  );
};

export default AllSetPage;