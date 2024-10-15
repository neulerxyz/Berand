// ./src/signup/components/SetPasswordPage.js
import React from 'react';
import EyeIcon from '../../shared/components/EyeIcon';

const SetPasswordPage = ({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  showConfirmPassword,
  togglePasswordVisibility,
  onBack,
  onSubmit,
  downloadBackupKey,          // 追加
  setDownloadBackupKey        // 追加
}) => {


  

  return (
    <>
      <div>
        <button
          className="text-white text-xs hover:underline"
          onClick={onBack}
        >
          &lt;- Back
        </button>
        <h1 className="text-4xl font-bold text-white text-center mt-4 mb-4">SET PASSWORD</h1>
        <p className="text-xs text-gray-300 text-center mb-8">
          This password will unlock your account<br />only on this device. YKYR cannot recover
          <br />
          this pw.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6 flex-grow">
        <div>
          <label htmlFor="password" className="block text-xs text-white mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-2 border-white text-white px-3 py-2 text-xs pr-10"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('password')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon isOpen={showPassword} />
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-xs text-white mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent border-2 border-white text-white px-3 py-2 text-xs pr-10"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirmPassword')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-white"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              <EyeIcon isOpen={showConfirmPassword} />
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="downloadBackupKey"
            defaultChecked
            checked={downloadBackupKey}
            onChange={(e) => setDownloadBackupKey(e.target.checked)}
            className="mr-2 h-4 w-4 border-2 border-white bg-transparent checked:bg-white checked:border-white focus:ring-0 focus:ring-offset-0 rounded-none appearance-none cursor-pointer relative"
            style={{
              backgroundImage: downloadBackupKey ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='black' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3E%3C/svg%3E")` : 'none',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          />
          <label htmlFor="downloadBackupKey" className="text-xs text-white">
            Download backup key file for decryption. <a href="#" className="underline">More details</a>.
          </label>
        </div>
        
        <div className="space-y-4">
          <button
            type="submit"
            className="w-full h-12 bg-gray-500 text-white hover:bg-gray-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!password || password !== confirmPassword}
          >
            <div className="grid grid-cols-[repeat(11,1fr)] gap-1 mr-2">
              {[...Array(11)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-white"></div>
              ))}
            </div>
            <span className="text-xs">Submit</span>
          </button>
        </div>
      </form>
    </>
  );
};

export default SetPasswordPage;
