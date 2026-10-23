import React, { useState, useEffect } from 'react';
import { Download, Sparkles, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">Aplikasi Terpasang (PWA)</span>
        </div>
        <span className="text-[11px] opacity-75">Bisa offline</span>
      </div>
    );
  }

  if (!deferredPrompt) {
    return null;
  }

  return (
    <div className="p-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl shadow-soft flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pasang di Layar Utama HP</span>
        </div>
        <p className="text-xs text-white/90 font-medium mt-0.5">
          Gunakan Home Sweet Loan seperti aplikasi native tanpa instalasi toko aplikasi.
        </p>
      </div>

      <button
        onClick={handleInstallClick}
        className="px-3 py-2 bg-white text-emerald-800 rounded-xl text-xs font-bold shrink-0 hover:bg-emerald-50 shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Pasang</span>
      </button>
    </div>
  );
};
