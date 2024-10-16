// ./src/signup/components/SignupComponent.js
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import LandingPage from './LandingPage';
import SetPasswordPage from './SetPasswordPage';
import AllSetPage from './AllSetPage';
import LoadingPage from './LoadingPage'; 
import EyeIcon from '../../shared/components/EyeIcon';

const SignupComponent = () => {

  // state management
  const [currentPage, setCurrentPage] = useState('landing');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [downloadPassword, setDownloadPassword] = useState('');
  const [showDownloadPassword, setShowDownloadPassword] = useState(false);
  const [downloadBackupKey, setDownloadBackupKey] = useState(true); 

  const [isLoading, setIsLoading] = useState(false);          
  const [loadingProgress, setLoadingProgress] = useState(0); 

  const [isLogging, setIsLogging] = useState(false);
  const [registerMinerButtonVisible, setRegisterMinerButtonVisible] = useState(false);
  const [rewardAddress, setRewardAddress] = useState('');

  // 初期化とストレージの監視
  useEffect(() => {
    // 初期化処理
    chrome.storage.local.get(['isLogging'], (data) => {
      setIsLogging(data.isLogging || false);
    });

    // ストレージの変更を監視
    const handleStorageChange = (changes, areaName) => {
      if (areaName === 'local') {
        if (changes.isLogging) {
          setIsLogging(changes.isLogging.newValue);
          console.log(`isLogging changed to: ${changes.isLogging.newValue}`);
        }
      }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const updateStatus = (loggingStatus) => {
    setIsLogging(loggingStatus);
  };


  const handleGenerateKeys = async () => {
    // TODO: Checking network 
    setCurrentPage('setPassword');
  };
  
  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else if (field === 'confirmPassword') {
      setShowConfirmPassword(!showConfirmPassword);
    } else if (field === 'download') {
      setShowDownloadPassword(!showDownloadPassword);
    }
  };


  const handleSuccessClose = () => {
    setCurrentPage('allSet');
  };

  const handleSkipDownload = () => {
    setCurrentPage('allSet');
  };


  const handleStartLogging = () => {
    chrome.runtime.sendMessage(
      { command: 'start' },
      (response) => {
        if (response && response.status) {
          chrome.storage.local.set({ isLogging: true }, () => {
            setIsLogging(true);
            console.log('Logging started.');
          });
        } else {
          alert('Failed to start logging.');
        }
      }
    );
  };

  const handleStopLogging = () => {
    chrome.runtime.sendMessage({ command: 'stop' }, (response) => {
      if (response && response.status) {
        chrome.storage.local.set({ isLogging: false }, () => {
          setIsLogging(false);
          console.log('Logging stopped.');
        });
      } else {
        alert('Failed to stop logging.');
      }
    });
  };


    // Function to download private key
    const downloadPrivateKeyFile = (privateKey, filename) => {
    const fileContent = `-----BEGIN OPERATOR PRIVATE KEY-----\n${privateKey}\n-----END OPERATOR PRIVATE KEY-----`;
    const blob = new Blob([fileContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();   
}  


          // Utility functions to handle hex and array buffer conversions
    const arrayBufferToHex = (buffer) => {
      return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  }

  const hexToArrayBuffer = (hex) => {
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < bytes.length; i++) {
          bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
      }
      return bytes.buffer;
  }

  const strToArrayBuffer = (str) => {
      const encoder = new TextEncoder();
      return encoder.encode(str);
  }
  
  const uint8ArrayToHex = (uint8Array) => {
      return Array.from(uint8Array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

    // decryptAndDownloadPrivateKey 関数の定義（実際の処理に置き換えてください）
    const decryptAndDownloadPrivateKey = async (password) => {
      console.log("decryptAndDownloadPrivateKey Function");

      chrome.storage.local.get(['encryptedOperatorPrivateKey', 'operatorEncryptionSalt', 'operatorEncryptionIV'], async (data) => {
        const { encryptedOperatorPrivateKey, operatorEncryptionSalt, operatorEncryptionIV } = data;
        if (!encryptedOperatorPrivateKey || !operatorEncryptionSalt || !operatorEncryptionIV) {
            console.log("Encrypted private key data is missing.");
            return;
        }
        try {
            console.log("Decryption process: Encrypted Private Key:", encryptedOperatorPrivateKey);
            console.log("Decryption process: Salt:", operatorEncryptionSalt, "IV:", operatorEncryptionIV);

            // Convert hex to ArrayBuffer
            const encryptedPrivateKeyBuffer = hexToArrayBuffer(encryptedOperatorPrivateKey);
            const saltBuffer = hexToArrayBuffer(operatorEncryptionSalt);
            const ivBuffer = hexToArrayBuffer(operatorEncryptionIV);
            // Derive the decryption key using the provided password
            const derivedKey = await deriveKeyFromPassword(password, saltBuffer);
            // Decrypt the private key
            const decryptedPrivateKeyBuffer = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: ivBuffer
                },
                derivedKey,
                encryptedPrivateKeyBuffer
            );
            // Convert ArrayBuffer to hex string for download
            const decryptedPrivateKey = uint8ArrayToHex(new Uint8Array(decryptedPrivateKeyBuffer));
            console.log("Decrypted Private Key:", decryptedPrivateKey);
            // Initiate download of the raw private key
            downloadPrivateKeyFile(decryptedPrivateKey, "operator-raw-private-key.txt");
            console.log("Raw private key downloaded successfully.");
        } catch (error) {
            console.error('Error decrypting private key:', error);
            console.log("Failed to decrypt the private key. Please ensure the password is correct.");
        }
    });
    };

        // Helper function to derive the key from password and salt
        const deriveKeyFromPassword = async (password, saltBuffer) => {
          const keyMaterial = await crypto.subtle.importKey(
              'raw',
              strToArrayBuffer(password),
              'PBKDF2',
              false,
              ['deriveKey']
          );
          const derivedKey = await crypto.subtle.deriveKey(
              {
                  name: 'PBKDF2',
                  salt: saltBuffer,
                  iterations: 100000,
                  hash: 'SHA-256'
              },
              keyMaterial,
              { name: 'AES-GCM', length: 256 },
              true,
              ['decrypt']
          );
          return derivedKey;
      }


    
    // handlePrivateKeyDownloadOptions 関数の定義
    const handlePrivateKeyDownloadOptions = () => {
      if (downloadBackupKey) {
        decryptAndDownloadPrivateKey(password);
      } else {
        console.log("Download backup key is not selected.");
      }
    };

    

    const handleSubmitPassword = (e) => {
      e.preventDefault();
      console.log('Password submitted');
      if (!password || !confirmPassword) {
        alert('Both password fields are required.');
        return;
      }
      if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
      }
  
      // Optionally, enforce password strength
      if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        alert("Password must be at least 8 characters long and include uppercase letters and numbers.");
        return;
      }
  
      // Set to loading state
      setCurrentPage('loading');
      setIsLoading(true);
      setLoadingProgress(0);
  
      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 12.5;
        });
      }, 500); // 0.5秒ごとに進行状況を更新
      
          // Send a message to background.js to generate the keys with the password
          chrome.runtime.sendMessage({ action: "generateKeys", password: password }, (response) => {
            console.log("signup response:",response);
            if (response && response.success) {
                console.log("Keys generated, encrypted successfully, and miner registered!");
                console.log("downloadBackupKey value:",downloadBackupKey);
                handlePrivateKeyDownloadOptions(password);
                setCurrentPage('allSet');
            } else {
              console.log("Failed to generate keys and register miner: " + (response ? response.error : "Unknown error."));
            }
        });
    };

  return (
    <div className="press-start min-h-screen bg-[#0000cc] flex items-center justify-center p-4">
      <div className="w-full max-w-[600px] h-[671px] bg-[#0000cc] border-4 border-white p-8 flex flex-col justify-between">
        {currentPage === 'landing' && (
          <LandingPage
            onGenerateKeys={handleGenerateKeys}
            onTryGuest={() => alert('Guest mode is not implemented yet.')}
          />
        )}

        {currentPage === 'setPassword' && (
          <SetPasswordPage
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            togglePasswordVisibility={togglePasswordVisibility}
            onBack={() => setCurrentPage('landing')}
            onSubmit={handleSubmitPassword}
            downloadBackupKey={downloadBackupKey}          
            setDownloadBackupKey={setDownloadBackupKey}    
          />
        )}


        {currentPage === 'loading' && (
          <LoadingPage loadingProgress={loadingProgress} />
        )}

        {currentPage === 'allSet' && (
          <AllSetPage
            isLogging={isLogging}
            onToggleLogging={isLogging ? handleStopLogging : handleStartLogging}
            registerMinerButtonVisible={registerMinerButtonVisible}
          />
        )}
      </div>
    </div>
  );
};

export default SignupComponent;
