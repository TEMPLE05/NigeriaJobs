import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsAvailable(true);
    };

    const handleAppInstalled = () => {
      // Hide the install button when the app is installed
      setIsAvailable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    // Reset the deferred prompt
    setDeferredPrompt(null);
    setIsAvailable(false);

    // Optionally, send analytics event with outcome
    console.log(`User response to install prompt: ${outcome}`);
  };

  if (!isAvailable) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center space-x-2 px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 border"
      style={{
        backgroundColor: 'var(--badge-bg-color)',
        color: 'var(--badge-text-color)',
        borderColor: 'var(--badge-border-color)',
        cursor: 'pointer'
      }}
    >
      <Download className="w-5 h-5" />
      <span>Install App</span>
    </button>
  );
};

export default InstallPrompt;