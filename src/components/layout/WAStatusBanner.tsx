import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, AlertCircle, X } from 'lucide-react';

export const WAStatusBanner: React.FC = () => {
  const [waStatus, setWaStatus] = useState<{ configured: boolean; status: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/wa/status')
      .then((res) => res.json())
      .then((data) => setWaStatus(data))
      .catch(() => setWaStatus({ configured: false, status: 'disconnected' }));
  }, []);

  if (dismissed || !waStatus) return null;

  return (
    <div
      className="px-4 py-2.5 rounded-xl border border-[#E1D6BE] bg-white text-[#1B2A45] text-xs flex items-center justify-between shadow-2xs"
    >
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 shrink-0 text-[#1B2A45]" />
        {waStatus.configured ? (
          <span className="flex items-center gap-1 font-semibold text-[#1B2A45]">
            <CheckCircle className="w-3.5 h-3.5 text-[#3B5035]" /> WhatsApp Notification Fonnte API terhubung aktif.
          </span>
        ) : (
          <span className="flex items-center gap-1 font-semibold text-[#1B2A45]">
            <AlertCircle className="w-3.5 h-3.5 text-[#1B2A45]" /> Integration Mode: Fonnte WhatsApp API token belum terkonfigurasi. (Aplikasi menggunakan simulasi pengiriman pesan otomatis)
          </span>
        )}
      </div>
      <button onClick={() => setDismissed(true)} className="p-1 hover:bg-[#E1D6BE]/40 rounded text-[#1B2A45]">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
