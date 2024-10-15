// src/popup/components/PopupComponent.js
import React, { useState, useEffect } from 'react';
import { Globe2, Pencil, User, Eye, EyeOff, Moon, Sun, Monitor, AlertCircle, Cog, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '@fontsource/press-start-2p';

const ThemeEnum = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark',
};

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  );
}


function SettingsPage({ onBack, theme, setTheme }) {
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');

  return (
    <div className="settings-page">
      <button onClick={onBack} className="back-button">
        <ChevronLeftIcon />
      </button>
      <h2>Settings</h2>
      <div>
        <label>Notifications</label>
        <input
          type="checkbox"
          checked={notifications}
          onChange={() => setNotifications(!notifications)}
        />
      </div>
      <div>
        <label>Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
        </select>
      </div>
      <div>
        <label>Theme</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
    </div>
  );
}

function AccountPage({ onBack }) {
  const [username, setUsername] = useState('YKYRUser');
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  const handleUsernameEdit = () => setIsEditingUsername(true);
  const handleUsernameSave = () => setIsEditingUsername(false);

  return (
    <div className="account-page">
      <button onClick={onBack} className="back-button">
        <ChevronLeftIcon />
      </button>
      <h2>Account</h2>
      <div>
        <label>Username</label>
        {isEditingUsername ? (
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        ) : (
          <span>{username}</span>
        )}
        <button onClick={isEditingUsername ? handleUsernameSave : handleUsernameEdit}>
          <Pencil size={16} />
        </button>
      </div>
    </div>
  );
}


function AppCard({ name, icon }) {
  return (
    <div className="bg-[#2f2f2f] p-4 rounded-lg flex flex-col items-center">
      <div className="text-4xl mb-2">{icon}</div>
      <p className="text-sm">{name}</p>
    </div>
  );
}



const PopupComponent = () => {
  const { t, i18n } = useTranslation(); 

  const [currentTheme, setCurrentTheme] = useState(ThemeEnum.SYSTEM);

  const [points, setPoints] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [currentPage, setCurrentPage] = useState('main');
  const [isLogging, setIsLogging] = useState(false);
  const [theme, setTheme] = useState(ThemeEnum.SYSTEM);



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
    document.getElementById('points').textContent = points;
});
// Listen for changes in the storage (like points being updated)
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.points) {
        const newPoints = changes.points.newValue || 0;
        document.getElementById('points').textContent = newPoints; // Update points in the popup
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



  const renderContent = () => {
    switch (currentPage) {
      case 'settings':
        return (
<SettingsPage
  onBack={() => setCurrentPage('main')}
  currentTheme={currentTheme}
  setCurrentTheme={setCurrentTheme}
/>

        );
      case 'account':
        return <AccountPage onBack={() => setCurrentPage('main')} />;
      default:
        switch (activeTab) {
          case 'discover':
            return (
              <div className="flex-grow flex flex-col items-center justify-start pt-8 overflow-y-auto">
                <h2 className="text-2xl mb-6">Discover Apps</h2>
                <div className="grid grid-cols-2 gap-4 w-full px-4">
                  <AppCard name="vanana" icon="🍌" />
                  <AppCard name="bera" icon="🐱" />
                  <AppCard name="apple" icon="🍎" />
                  <AppCard name="doge" icon="🐶" />
                </div>
              </div>
            );
          case 'home':
            return (
              <div className="flex-grow flex flex-col items-center justify-center relative mb-8">
                <div className="w-[300px] h-[300px] rounded-full border-4 border-[#3f3f3f] flex items-center justify-center relative overflow-hidden mb-8">
                  <div className="text-center z-10 flex flex-col items-center">
                    <p className="text-sm mb-2 tracking-wide">Total Points</p>
                    <p className="text-6xl font-bold tracking-widest" style={{ textShadow: '2px 2px #000' }}>
                    <span id="points">{points.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          case 'notification':
            return (
              <div className="flex-grow flex flex-col items-center justify-start pt-8">
                <h2 className="text-2xl mb-6">Notifications</h2>
                <div className="bg-[#2f2f2f] p-4 rounded-lg w-full max-w-xs">
                  <p className="text-white text-center">
                    Congrats! 🙌 You just got 100 Vana!
                  </p>
                </div>
              </div>
            );
          default:
            return null;
        }
    }
  };




  //
  //    {/* ログ開始/停止ボタン */}
  //    {!isLogging ? (
  //      <button onClick={handleStartLogging}>Start Logging</button>
  //    ) : (
  //      <button onClick={handleStopLogging}>Stop Logging</button>
  //    )}
  //    
  return (
    <div className="popup-container">
      <div className="header">
        <h1 className="text-3xl font-bold">YKYR</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
          {!isLogging ? (
              <button
                onClick={handleStartLogging}
                className="flex items-center space-x-1 bg-[#2A2A2A] rounded-full px-2 py-1 focus:outline-none"
              >
                <span className="text-xs">OFF</span>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </button>
            ) : (
              <button
                onClick={handleStopLogging}
                className="flex items-center space-x-1 bg-[#2A2A2A] rounded-full px-2 py-1 focus:outline-none"
              >
                <span className="text-xs">ON</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </button>
            )}

          </div>
          <button
            onClick={toggleMenu}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Toggle menu"
          >
            <MoreVertical size={24} />
          </button>
        </div>
      </div>
      <div className="h-px bg-gray-600 w-full mb-4"></div>

      {isMenuOpen && (
        <div className="menu">
          <ul>
            <li>
              <button onClick={() => setCurrentPage('settings')}>Settings</button>
            </li>
            <li>
              <button onClick={() => setCurrentPage('account')}>Account</button>
            </li>
          </ul>
        </div>
      )}

      {renderContent()}

      {currentPage === 'main' && (
        <div className="tabs">
          {['discover', 'home', 'notification'].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? 'active-tab' : ''}
              onClick={() => handleTabClick(tab)}
              aria-label={`${tab} tab`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}
    </div>
  );

};

export default PopupComponent;
