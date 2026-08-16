import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!localStorage.getItem('petcare_pwa_dismissed')) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setShowPrompt(false);
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('petcare_pwa_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 max-w-sm flex items-center justify-between gap-3 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center font-bold text-xl text-white shadow-md">
          🐾
        </div>
        <div>
          <h5 className="font-bold text-xs text-slate-100">Install PetCare ERP</h5>
          <p className="text-[11px] text-slate-400">Akses cepat seperti aplikasi native di desktop & HP</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" /> Install
        </button>
        <button onClick={handleDismiss} className="p-1 text-slate-400 hover:text-slate-200">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
