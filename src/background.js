import { ethers } from "ethers";
import abi from './abi/dlp.json';
import scwAbi from './abi/scw.json';
const RELAYER_ENDPOINT = "https://erq3gyqt71.execute-api.me-central-1.amazonaws.com/bartio/testnetv2";
const provider = new ethers.JsonRpcProvider("https://bartio.rpc.berachain.com");
const walletContract = "0xe439C9695a82E94f008E69a12bE7052105790a99";
// #region ENCRYPTION related code
// Function to convert a string to ArrayBuffer
function _strToArrayBuffer(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
}
// Function to convert ArrayBuffer to a Hex string
function _arrayBufferToHex(buffer) {
    const byteArray = new Uint8Array(buffer);
    const hexString = Array.from(byteArray, (byte) => {
        return byte.toString(16).padStart(2, '0'); // Converts each byte to hex and pads to 2 digits
    }).join('');
    return hexString;
}

function _hexToUint8Array(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

async function generateProxyAccount() {
    const wallet = ethers.Wallet.createRandom();
    chrome.storage.local.set({
       proxyPrivateKey:  wallet.privateKey,
       proxyAddress: wallet.address,
    });
    return wallet;
}

// Function to generate Ethereum wallet
async function generateKeys() {
    // Ethereum wallet generation using ethers.js
    const wallet = ethers.Wallet.createRandom();
    const operatorPrivateKey = wallet.privateKey;
    const operatorAddress = wallet.address;
    console.log("Operator Address:", operatorAddress);
    console.log("Keys generated: Ethereum Wallet");

    // Return all the generated keys
    return {
        operatorPrivateKey,
        operatorAddress
    };
}

// Function to derive encryption key using password and encrypt data
async function encryptDataWithPassword(password, dataToEncrypt) {
    // Derive a key from the password using PBKDF2
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iterations = 100000;
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        _strToArrayBuffer(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: iterations,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    // Encrypt the data using AES-GCM
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
    const encryptedDataBuffer = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        derivedKey,
        _hexToUint8Array(dataToEncrypt)
    );

    // Convert encrypted data and iv to hex for storage
    const encryptedDataHex = _arrayBufferToHex(encryptedDataBuffer);
    const ivHex = _arrayBufferToHex(iv);
    const saltHex = _arrayBufferToHex(salt);

    return { encryptedDataHex, ivHex, saltHex };
}

async function generateAndEncryptKeys(password) {
    // Generate the keys (Ethereum wallet)
    const {
        operatorPrivateKey,
        operatorAddress
    } = await generateKeys();
    const ethWalletEncrypted = await encryptDataWithPassword(password, operatorPrivateKey);

    chrome.storage.local.set({
        operatorAddress: operatorAddress,
        encryptedOperatorPrivateKey: ethWalletEncrypted.encryptedDataHex,
        operatorEncryptionIV: ethWalletEncrypted.ivHex,
        operatorEncryptionSalt: ethWalletEncrypted.saltHex
    });

    console.log("Keys generated and encrypted successfully.");
    return { operatorPrivateKey };
}

// Modular decryption function to decrypt either ECIES or Ethereum wallet private key
async function decryptKey(password, storageKeys) {
    const { encryptedKey, encryptionIV, encryptionSalt } = await chrome.storage.local.get([
        storageKeys.encryptedKey,
        storageKeys.encryptionIV,
        storageKeys.encryptionSalt
    ]);

    if (!encryptedKey || !encryptionIV || !encryptionSalt) {
        throw new Error("Encrypted data not found in storage");
    }

    const derivedKey = await deriveKeyFromPassword(password, encryptionSalt);
    const iv = _hexToUint8Array(encryptionIV);
    const encryptedKeyBuffer = _hexToUint8Array(encryptedKey);

    // Decrypt the key (Ethereum wallet private key)
    const decryptedKeyBuffer = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        derivedKey,
        encryptedKeyBuffer
    );

    const decryptedKeyHex = _arrayBufferToHex(decryptedKeyBuffer);

    console.log("Decrypted Key:", decryptedKeyHex);
    return decryptedKeyHex; // Returns the decrypted key in hex format
}

async function decryptWallet(password) {
    return await decryptKey(password, {
        encryptedKey: 'encryptedOperatorPrivateKey',
        encryptionIV: 'operatorEncryptionIV',
        encryptionSalt: 'operatorEncryptionSalt'
    });
}
// #endregion

// #region DATA retrieval related code
async function getProxyPrivateKey() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("proxyPrivateKey", function(result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else if (result.proxyPrivateKey) {
                resolve(result.proxyPrivateKey);
            } else {
                reject("proxy private key not found in local storage.");
            }
        });
    });
}

async function getProxyAddress() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("proxyAddress", function(result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else if (result.proxyAddress) {
                resolve(result.proxyAddress);
            } else {
                reject("Proxy address not found in local storage.");
            }
        });
    });
}

async function getOperatorAddress() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("operatorAddress", function(result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else if (result.operatorAddress) {
                resolve(result.operatorAddress);
            } else {
                reject("Operator address not found in local storage.");
            }
        });
    });
}
// Function to retrieve nonce from the smart contract
async function getNonce(provider, scWalletAddress) {
    try {
        const contract = new ethers.Contract(scWalletAddress, scwAbi, provider);
        const currentNonce = await contract.nonce();
        const nonceAsString = currentNonce.toString(); 
        return nonceAsString;
    } catch (error) {
        console.error("Error fetching nonce:", error);
        throw error;
    }
}

async function getscWalletAddress() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("scWalletAddress", function(result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else if (result.scWalletAddress) {
                resolve(result.scWalletAddress);
            } else {
                reject("scWalletAddress not found in local storage.");
            }
        });
    });
}

// #endregion

// #region CONNECTION related code 
async function getNFTs(walletAddress, nftContracts) {
    const provider = ethers.getDefaultProvider("YOUR_NETWORK");
    const nftABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)"
    ];
  
    let ownedNFTs = {};
  
    for (let i = 0; i < nftContracts.length; i++) {
      const nftContract = new ethers.Contract(nftContracts[i], nftABI, provider);
      const balance = await nftContract.balanceOf(walletAddress);
  
      ownedNFTs[nftContracts[i]] = [];
  
      for (let j = 0; j < balance; j++) {
        const tokenId = await nftContract.tokenOfOwnerByIndex(walletAddress, j);
        ownedNFTs[nftContracts[i]].push(tokenId);
      }
    }
    return ownedNFTs;
}

async function getRelayerAddress() {
    try {
        const response = await fetch(RELAYER_ENDPOINT, {
            method: 'GET', // Use GET method to retrieve the relayer address
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch relayer address: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("data for get :",data);
        console.log("data.body for get :",data.body);
        if (data.relayerAddress) {
            console.log("Relayer address retrieved successfully:", data.relayerAddress);
            return data.relayerAddress;
        } else {
            throw new Error("Relayer address not found in response");
        }
    } catch (error) {
        console.error("Error fetching relayer address:", error);
        throw error; // Propagate the error for handling in other parts of your app
    }
}

async function retrieveSCWAddress(txHash) {
    try {        
        // Get the transaction receipt
        const receipt = await provider.getTransactionReceipt(txHash);
        console.log("receipt :", receipt);
        if (!receipt) {
            console.error("Transaction receipt not found for hash:", txHash);
            return;
        }

        // Initialize the contract interface from the ABI
        const contractInterface = new ethers.Interface(scwAbi);
        // Parse the logs and retrieve the WalletCreated event
        for (const log of receipt.logs) {
            try {
                const parsedLog = contractInterface.parseLog(log);
                if (parsedLog.name === "WalletCreatedViaRelayer") {
                    const walletAddress = parsedLog.args.wallet;
                    console.log("Generated Wallet Address:", walletAddress);
                    chrome.storage.local.set({scWalletAddress:  walletAddress});
                    return walletAddress;
                }
            } catch (error) {
                // Ignore logs that don't match the WalletCreated event
                continue;
            }
        }
        console.log("WalletCreated event not found in logs.");
    } catch (error) {
        console.error("Error retrieving SCW address:", error);
    }
}

async function createWallet(wallet, relayerAddress, proxyAddress) {
    try {
        console.log("Starting miner registration for wallet:", wallet.address);
        const salt = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);  // Generate a large random salt
        const functionIdentifier = "createWalletViaRelayer";
        const messageHash = ethers.solidityPackedKeccak256(
            ['string','address','address','address','uint256'], 
            [functionIdentifier,wallet.address,relayerAddress, proxyAddress,salt]
        );
        console.log("Message hash:", messageHash);
        
        const userSignature = await wallet.signMessage(ethers.getBytes(messageHash));
        console.log("User signature:", userSignature);
        const params = [wallet.address, relayerAddress, proxyAddress, salt, userSignature]
        const payload = {
            contractAddress: walletContract,
            functionIdentifier: functionIdentifier,
            params: params,
        };
        
        console.log("Payload before sending:", payload);

        // Send payload to relayer
        const response = await fetch(RELAYER_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ body: JSON.stringify(payload) })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("data :", data);
            console.log("tx hash: ",data.transactionHash);
            const txHash = data.transactionHash; // Assuming the relayer returns the tx hash in this field
            const result = await retrieveSCWAddress(txHash);
            if (result) {
                return { success: true, data: result };                
            }
            else {
                console.error('Failed to retrieve the scWalletAddr');
                return { success: false, data: txHash };
            }
        } else {
            console.error('Error from server:', response.statusText);
            return { success: false, error: response.statusText };
        }
    } catch (error) {
        console.error('Error registering miner:', error);
        return { success: false, error: error.message };
    }
}

// Main function that handles the entire process
async function handleGenerateAndRegister(password) {
    try {
        const { operatorPrivateKey } = await generateAndEncryptKeys(password);
        const wallet = new ethers.Wallet(operatorPrivateKey);
        console.log("User Address:", wallet.address);
        const relayerAddress = await getRelayerAddress();
        const proxyWallet = await generateProxyAccount();
    
        const registerResponse = await createWallet(wallet, relayerAddress, proxyWallet.address);

        if (registerResponse.success) {
            console.log("Miner registered successfully:", registerResponse.data);
            const nftContract = "0x1B2f6F88f2136AF58d943458826e7D67e98fF665"; //TODO change
            const secretMessage = "giveMeAFreeDrinkBera"; //TODO CHANGE
            const debugResponse = await handleClaimNFT(nftContract,secretMessage);//TODO Change
            if (debugResponse.success){
                console.log("Successfully Minted DemoNFT: ",debugResponse.data);
            }
            return { success: true, minerData: registerResponse.data };
        } else {
            throw new Error("Miner registration failed: " + registerResponse.error);
        }
    } catch (error) {
        console.error("Error in generating keys and registering miner:", error);
        return { success: false, error: error.message };
    }
}

async function claimNFT(wallet, nftContract, secretMessage, scWalletAddress) {
    try {
        console.log("Starting NFT claim for wallet:", wallet.address);
        const nonce = await getNonce(provider,scWalletAddress);
        const salt = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER); 
        const functionIdentifier = "mintFromNFTViaRelayer";
        const messageHash = ethers.solidityPackedKeccak256(
            ['string','address','string','uint256','uint256'], 
            [functionIdentifier,nftContract, secretMessage,nonce,salt]
        );
        console.log("functionIdentifier used:",functionIdentifier);
        console.log("nftContract used: ",nftContract);
        console.log("secretMessage used: ",secretMessage);
        console.log("nonce used: ",nonce);
        console.log("salt used: ",salt);
        console.log("messageHash: ",messageHash);
        const userSignature = await wallet.signMessage(ethers.getBytes(messageHash));
        console.log("userSignature: ",userSignature);
        const params = [nftContract,secretMessage, nonce, salt, userSignature]
        const payload = {
            contractAddress: scWalletAddress,
            functionIdentifier: functionIdentifier,
            params: params,
        };
        
        console.log("Payload before sending:", payload);

        const response = await fetch(RELAYER_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ body: JSON.stringify(payload) })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("data :", data);
            console.log("tx hash: ",data.transactionHash);
            const txHash = data.transactionHash; // Assuming the relayer returns the tx hash in this field
            return { success: true, data: txHash };                
        } else {
            console.error('Error from server:', response.statusText);
            return { success: false, error: response.statusText };
        }
    } catch (error) {
        console.error('Error registering miner:', error);
        return { success: false, error: error.message };
    }    
}

async function handleClaimNFT(nftContract, secretMessage) {
    try {
        const proxyPrivateKey = await getProxyPrivateKey();
        const wallet = new ethers.Wallet(proxyPrivateKey);
        console.log("User Address:", wallet.address);
        const scWalletAddress = await getscWalletAddress();
        const claimResponse = await claimNFT(wallet, nftContract,secretMessage, scWalletAddress);
        if (claimResponse.success) {
            console.log("NFT Claim successfully:", claimResponse.data);
            return { success: true, minerData: claimResponse.data };
        } else {
            throw new Error("NFT Claim failed: " + claimResponse.error);
        }
    } catch (error) {
        console.error("Error while claiming NFT:", error);
    }
}

// #endregion 
console.log("Background script loaded.");

// #region Listeners code

// Automatically start tracking if it was active during the previous session
chrome.runtime.onStartup.addListener(() => {
    console.log("Service Worker has started");
    chrome.storage.local.get(
        ["trackingActive", "lastIpfsHash", "points"],
        (data) => {
            console.log("Public key found.");
            if (data.points){
                console.log("Previously earned points found.");
                points = data.points;
            }
        },
    );
});

// Handle extension installation (reset tracking state to inactive)
chrome.runtime.onInstalled.addListener(() => {
    //
});

// Handle the case where Chrome is shutting down
chrome.runtime.onSuspend.addListener(() => {
    console.log("Chrome is shutting down. Saving public key and last IPFS hash and points");
    chrome.storage.local.set({
        points: points,
    });
});

// Message listener for communication with popup.js (restored)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received:", message);

    if (message.action === "generateKeys") {
        handleGenerateAndRegister(message.password)
            .then((response) => {
                sendResponse(response);
            })
            .catch((error) => {
                sendResponse({ success: false, error: error.message });
            });
        return true; // Return true to indicate async response
    }
    if (message.action === "claimNFT") {
        handleClaimNFT(message.nftContract, message.secretMessage)
        .then((response) => {
            sendResponse(response);
        })
        .catch((error) => {
            sendResponse({success: false, error: error.message});
        });
        return true;
    }
});
// #endregion

// Add an event listener that triggers when the extension is first installed
chrome.runtime.onInstalled.addListener((details) => {
  // Check if the reason for the event is 'install' to ensure it's the first installation
  if (details.reason === "install") {
    // Open the first-installation URL in a new tab
    chrome.tabs.create({ url: chrome.runtime.getURL("signup.html") });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  // Example setup for first install
  chrome.runtime.setUninstallURL("https://x.com/berachain");
});


// メッセージリスナーの設定
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openPopup") {
      chrome.windows.create({
        url: chrome.runtime.getURL("popup.html"),
        type: "popup",
        width: 400,  
        height: 600  
      }, (window) => {
        console.log("Popup window created:", window);
        sendResponse({ success: true, windowId: window.id });
      });
      // 非同期で応答することを示す
      return true;
    }
  });