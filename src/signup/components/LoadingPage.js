// ./src/signup/components/LoadingPage.js
import React, { useEffect, useState } from 'react';

const LoadingPage = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // シミュレーションのためにローディング進行を増加させます。
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // ローディング完了後の処理は親コンポーネントで行います。
          return 100;
        }
        return prev + 12.5;
      });
    }, 500); // 0.5秒ごとに進行

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold text-white text-center mb-16">CREATING ACCOUNT</h1>
      <div className="w-16 h-16 mb-16 relative">
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-8 ${i === Math.floor(loadingProgress / 12.5) ? 'bg-white' : 'bg-gray-600'}`}
              style={{
                left: '50%',
                top: '50%',
                transform: `rotate(${i * 45}deg) translate(0, -150%)`,
              }}
            />
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-300 text-center mb-4">
        Please wait while we set up your account...
      </p>
      <p className="text-xs text-gray-300 text-center">
        This may take a few seconds
      </p>
    </div>
  );
};

export default LoadingPage;
