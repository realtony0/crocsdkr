'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

const BANNER_KEY = 'crocsdkr_install_banner_hide';

export default function InstallAppBanner() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(BANNER_KEY)) {
      setShow(false);
      return;
    }
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      setShow(false);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem(BANNER_KEY, '1');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white p-4 shadow-lg border-t border-gray-700 safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <img src="/logo-noir.png" alt="" className="w-8 h-8 object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">Installer Crocsdkr</p>
          <p className="text-xs text-gray-400">Comme une app sur ton téléphone</p>
        </div>
        <div className="flex items-center gap-2">
          {deferredPrompt && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl font-bold text-sm"
            >
              <Download className="h-4 w-4" />
              Installer
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
