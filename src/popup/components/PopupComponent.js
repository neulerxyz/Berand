// src/popup/components/PopupComponent.js
import React, { useState, useEffect, useCallback } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/tabs.js"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/shared/components/card.js"
import { Button } from "@/shared/components/button.js"
import { Wallet, Cog, Copy, Check } from "lucide-react"


const PopupComponent = () => {
  
  //Berand
  //const [walletAddress, setWalletAddress] = useState("0x1234...5678")
  const [isCopied, setIsCopied] = useState(false)
  const [showToast, setShowToast] = useState(false)

  //data
  const [points, setPoints] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const [scWalletAddress, setScWalletAddress] = useState('');
  const getWalletExplorerUrl = (address) => {
    return `https://bartio.beratrail.io/address/${address}`;
  };

  //copy address
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(scWalletAddress).then(() => {
      setIsCopied(true)
      setShowToast(true)
      setTimeout(() => {
        setIsCopied(false)
        setShowToast(false)
      }, 2000)
    }).catch((err) => {
      console.error('Failed to copy: ', err)
    })
  }, [scWalletAddress])
  

  useEffect(() => {

    chrome.storage.local.get('scWalletAddress', (result) => {
      if (result.scWalletAddress) {
        setScWalletAddress(result.scWalletAddress);
      } else {
        console.error('scWalletAddress not found in storage');
      }
    });

    // Init
    chrome.storage.local.get(['isLogging'], (data) => {
      setIsLogging(data.isLogging || false);
    });

    // Observe Storage
    const handleStorageChange = (changes, areaName) => {
      if (areaName === 'local') {
        if (changes.isLogging) {
          setIsLogging(changes.isLogging.newValue);
        }
      }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };

    //Fetch Points
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setPoints((prevPoints) => prevPoints + 100);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  
  }, []);

  const updateStatus = (loggingStatus) => {
    setIsLogging(loggingStatus);
  };

  chrome.storage.local.get(['points'], (result) => {
    const points = result.points || 0; // Default to 0 if no points are found
    //document.getElementById('points').textContent = points;
});
// Listen for changes in the storage (like points being updated)
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.points) {
        const newPoints = changes.points.newValue || 0;
        //document.getElementById('points').textContent = newPoints; // Update points in the popup
    }
});

  const handleStartLogging = () => {
    chrome.runtime.sendMessage(
      { command: 'start' },
      (response) => {
        if (response && response.status) {
          chrome.storage.local.set({ isLogging: true }, () => {
            updateStatus(true);
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
          updateStatus(false);
        });
      } else {
        alert('Failed to stop logging.');
      }
    });
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const toggleStatus = () => setIsLogging((prev) => !prev);


 
  return (
    <div className="w-[350px] h-[500px] bg-blue-600 text-white p-2 flex flex-col relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-2 left-2 right-2 bg-white text-black p-2 rounded-md shadow-lg z-50 animate-in fade-in slide-in-from-top-5">
          <h4 className="font-bold">Copied!</h4>
          <p className="text-sm">Wallet address copied to clipboard</p>
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🐻</span>
          <h1 className="text-lg font-bold">BERAND</h1>
        </div>
        <div className="flex items-center space-x-2">
        <a 
        href={getWalletExplorerUrl(scWalletAddress)} 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {scWalletAddress}
      </a>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyToClipboard}>
            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Cog className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="home" className="flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-3 h-8 mb-2">
          <TabsTrigger value="home" className="text-xs">HOME</TabsTrigger>
          <TabsTrigger value="drop" className="text-xs">DROP</TabsTrigger>
          <TabsTrigger value="collection" className="text-xs">COLLECTION</TabsTrigger>
        </TabsList>
        <TabsContent value="home" className="flex-grow overflow-hidden">
          <Card className="h-full flex flex-col bg-white text-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Wallet</CardTitle>
              <CardDescription>Your BERAND wallet overview</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow py-2">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Balance:</span>
                  <span className="font-bold">1000 BERA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>NFTs owned:</span>
                  <span className="font-bold">5</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button className="w-full">
                <Wallet className="mr-2 h-4 w-4" /> Add Funds
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="drop" className="flex-grow overflow-hidden">
          <Card className="h-full flex flex-col bg-white text-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Campaigns</CardTitle>
              <CardDescription>Participate in ongoing drops</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto py-2">
              <ul className="space-y-4">
                {["Summer Collection", "Artist Collaboration"].map((campaign, index) => (
                  <li key={index} className="border rounded-lg p-3">
                    <h3 className="font-bold text-sm">{campaign}</h3>
                    <p className="text-xs text-gray-500">Ends in 3 days</p>
                    <Button className="mt-2 text-xs py-1 h-7" size="sm">Join Drop</Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="collection" className="flex-grow overflow-hidden">
          <Card className="h-full flex flex-col bg-white text-black">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Your NFT Collection</CardTitle>
              <CardDescription>Browse your BERAND NFTs</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto py-2">
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((nft) => (
                  <div key={nft} className="border rounded-lg p-2">
                    <div className="bg-gray-200 aspect-square rounded-md mb-2"></div>
                    <p className="text-xs font-medium">BERAND #{nft}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

};

export default PopupComponent;
