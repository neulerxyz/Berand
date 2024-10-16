import React, { useState, useEffect } from 'react';

const getScWalletAddressFromStorage = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('scWalletAddress', (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(result.scWalletAddress || '');
      }
    });
  });
};

const WalletAddressDisplay = () => {
  const [setWalletAddress] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchWalletAddress = async () => {
      try {
        const address = await getScWalletAddressFromStorage();
        setWalletAddress(address);
      } catch (error) {
        console.error('Error fetching wallet address:', error);
      }
    };
    fetchWalletAddress();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scWalletAddress).then(() => {
      setIsCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setIsCopied(false);
        setShowToast(false);
      }, 2000);
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

  const explorerUrl = `https://bartio.beratrail.io/address/${walletAddress}`;

  return (
    <div>
      <div className="wallet-address">
        <a
          className="explorer-link"
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {walletAddress}
        </a>
      </div>
      {showToast && (
        <div className="toast">
          <h4 className="font-bold">Copied!</h4>
          <p className="text-sm">Wallet address copied to clipboard</p>
        </div>
      )}
      <button className="copy-button" onClick={copyToClipboard}>
        {isCopied ? 'Copied' : 'Copy'}
      </button>
      <style>{`
        .wallet-address {
          font-size: 16px;
          font-weight: bold;
          margin-top: 10px;
        }
        .explorer-link {
          display: block;
          margin-top: 10px;
        }
        .toast {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          background-color: white;
          color: black;
          padding: 10px;
          border-radius: 4px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          z-index: 100;
        }
        .copy-button {
          margin-top: 10px;
          background-color: #007bff;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default WalletAddressDisplay;