import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  X,
  Sliders,
  CheckCircle2,
  FileText,
  Building,
  Calendar,
  User,
  ShieldCheck,
  Check,
  Copy,
  Layout,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { HeaderBadge, HeaderStatItem } from './SystemNotificationHeader';

export interface QuickPrintData {
  customDataSummary?: { label: string; value: string | number; detail?: string }[];
  tableHeaders?: string[];
  tableRows?: (string | number)[][];
  customNotes?: string;
}

export interface QuickPrintConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleTitle: string;
  moduleSubtitle?: string;
  badges?: (HeaderBadge | React.ReactNode)[];
  stats?: HeaderStatItem[];
  activeTabLabel?: string;
  quickPrintData?: QuickPrintData;
}

export const QuickPrintConfigModal: React.FC<QuickPrintConfigModalProps> = ({
  isOpen,
  onClose,
  moduleTitle,
  moduleSubtitle,
  badges = [],
  stats = [],
  activeTabLabel,
  quickPrintData
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Print Configuration State
  const [includeLetterhead, setIncludeLetterhead] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [includeBadges, setIncludeBadges] = useState(true);
  const [includeTableData, setIncludeTableData] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [paperSize, setPaperSize] = useState<'a4' | 'letter' | 'thermal'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [signerName, setSignerName] = useState(user?.name || 'Drh. Amanda Putri, M.Vet');
  const [signerRole, setSignerRole] = useState(user?.role ? user.role.toUpperCase() : 'PENANGGUNG JAWAB KLINIK');
  const [customMemo, setCustomMemo] = useState(
    quickPrintData?.customNotes || 'Laporan ringkasan data terverifikasi untuk arsip operasional dan rapat koordinasi.'
  );
  const [copied, setCopied] = useState(false);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Document metadata generated on open
  const [docNumber, setDocNumber] = useState('');
  const [printDate, setPrintDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      setDocNumber(`DOC-SUM/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${randomCode}`);
      setPrintDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) + ' WIB'
      );
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTriggerPrint = () => {
    window.print();
    addToast('Perintah cetak laporan ringkasan berhasil dikirim!', 'success');
  };

  const handleCopySummaryText = () => {
    let text = `=== RINGKASAN LAPORAN: ${moduleTitle.toUpperCase()} ===\n`;
    text += `No. Dokumen: ${docNumber}\n`;
    text += `Waktu Cetak: ${printDate}\n`;
    text += `Penanggung Jawab: ${signerName} (${signerRole})\n\n`;

    if (stats.length > 0) {
      text += `--- STATISTIK & METRIK ---\n`;
      stats.forEach((s) => {
        text += `• ${s.label}: ${s.value}\n`;
      });
      text += `\n`;
    }

    if (quickPrintData?.customDataSummary && quickPrintData.customDataSummary.length > 0) {
      text += `--- REKAPITULASI DATA ---\n`;
      quickPrintData.customDataSummary.forEach((item) => {
        text += `• ${item.label}: ${item.value} ${item.detail ? `(${item.detail})` : ''}\n`;
      });
      text += `\n`;
    }

    if (customMemo) {
      text += `Catatan: ${customMemo}\n`;
    }

    text += `\nPetCare Central Veterinary ERP System`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast('Teks ringkasan disalin ke clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-[#FFFDF9] rounded-2xl border-2 border-[#E1D6BE] shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 cursor-default"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (Hidden during Print) */}
        <div className="bg-[#1B2A45] px-5 py-4 text-[#FFFDF9] flex items-center justify-between border-b border-[#B8905A]/40 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#B8905A] to-[#9E7848] text-[#101A2C] font-black shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#B8905A]/30 text-[#D9B98A] border border-[#B8905A]/40 text-[10px] font-bold uppercase tracking-wider">
                  Quick Print Config
                </span>
                <span className="text-[10px] text-[#EDE6D6]/70">
                  {docNumber}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#FFFDF9] font-display mt-0.5">
                Konfigurasi Cetak Ringkasan Modul
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummaryText}
              className="px-3 py-1.5 rounded-lg bg-[#101A2C] hover:bg-[#1F2E47] text-[#D9B98A] border border-[#B8905A]/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Salin ringkasan ke clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin Teks'}</span>
            </button>

            <button
              onClick={handleTriggerPrint}
              className="px-4 py-1.5 rounded-lg bg-[#B8905A] hover:bg-[#9E7848] text-[#101A2C] font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-rose-900/60 text-white/80 hover:text-white flex items-center justify-center cursor-pointer transition-colors ml-1"
              title="Tutup (ESC / Klik luar)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Body (2 Columns on Desktop) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0 bg-[#F6F1E6]">
          {/* Left Column: Quick Config Form Controls (Hidden during Print) */}
          <div className="lg:col-span-5 p-5 border-r border-[#E1D6BE] space-y-5 bg-[#FFFDF9] print:hidden overflow-y-auto max-h-[calc(94vh-80px)]">
            {/* Section 1: Paper & Layout */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#1B2A45] uppercase tracking-wider flex items-center gap-1.5">
                <Layout className="w-4 h-4 text-[#B8905A]" /> Format & Ukuran Dokumen
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaperSize('a4')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    paperSize === 'a4'
                      ? 'bg-[#1B2A45] text-[#FFFDF9] border-[#1B2A45] shadow-xs'
                      : 'bg-[#F6F1E6] text-[#22242B] border-[#E1D6BE] hover:border-[#B8905A]'
                  }`}
                >
                  <span className="block text-sm">A4</span>
                  <span className="text-[10px] opacity-75 font-normal">Standar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaperSize('letter')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    paperSize === 'letter'
                      ? 'bg-[#1B2A45] text-[#FFFDF9] border-[#1B2A45] shadow-xs'
                      : 'bg-[#F6F1E6] text-[#22242B] border-[#E1D6BE] hover:border-[#B8905A]'
                  }`}
                >
                  <span className="block text-sm">Letter</span>
                  <span className="text-[10px] opacity-75 font-normal">Format Memo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaperSize('thermal')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    paperSize === 'thermal'
                      ? 'bg-[#1B2A45] text-[#FFFDF9] border-[#1B2A45] shadow-xs'
                      : 'bg-[#F6F1E6] text-[#22242B] border-[#E1D6BE] hover:border-[#B8905A]'
                  }`}
                >
                  <span className="block text-sm">80mm</span>
                  <span className="text-[10px] opacity-75 font-normal">Struk Kasir</span>
                </button>
              </div>

              {paperSize !== 'thermal' && (
                <div className="flex gap-2 text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`flex-1 py-2 px-3 rounded-lg border font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      orientation === 'portrait'
                        ? 'bg-[#B8905A] text-[#101A2C] border-[#B8905A] font-bold'
                        : 'bg-[#F6F1E6] text-[#6B6656] border-[#E1D6BE]'
                    }`}
                  >
                    <span>📄 Potret</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    className={`flex-1 py-2 px-3 rounded-lg border font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      orientation === 'landscape'
                        ? 'bg-[#B8905A] text-[#101A2C] border-[#B8905A] font-bold'
                        : 'bg-[#F6F1E6] text-[#6B6656] border-[#E1D6BE]'
                    }`}
                  >
                    <span>📑 Lanskap</span>
                  </button>
                </div>
              )}
            </div>

            {/* Section 2: Element Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-[#E1D6BE]">
              <h4 className="text-xs font-bold text-[#1B2A45] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#B8905A]" /> Elemen yang Dicetak
              </h4>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#F6F1E6] border border-[#E1D6BE] cursor-pointer hover:bg-[#EDE6D6]/60">
                  <input
                    type="checkbox"
                    checked={includeLetterhead}
                    onChange={(e) => setIncludeLetterhead(e.target.checked)}
                    className="w-4 h-4 rounded text-[#B8905A] focus:ring-[#B8905A]"
                  />
                  <div>
                    <span className="font-bold text-[#1B2A45] block">Kop Resmi Klinik & Izin Operasional</span>
                    <span className="text-[10px] text-[#6B6656]">Logo, alamat, nomor izin & kontak resmi</span>
                  </div>
                </label>

                {stats && stats.length > 0 && (
                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#F6F1E6] border border-[#E1D6BE] cursor-pointer hover:bg-[#EDE6D6]/60">
                    <input
                      type="checkbox"
                      checked={includeStats}
                      onChange={(e) => setIncludeStats(e.target.checked)}
                      className="w-4 h-4 rounded text-[#B8905A] focus:ring-[#B8905A]"
                    />
                    <div>
                      <span className="font-bold text-[#1B2A45] block">Kartu Metrik & Statistik ({stats.length} Indikator)</span>
                      <span className="text-[10px] text-[#6B6656]">Data angka performa/stok/antrean saat ini</span>
                    </div>
                  </label>
                )}

                {badges && badges.length > 0 && (
                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#F6F1E6] border border-[#E1D6BE] cursor-pointer hover:bg-[#EDE6D6]/60">
                    <input
                      type="checkbox"
                      checked={includeBadges}
                      onChange={(e) => setIncludeBadges(e.target.checked)}
                      className="w-4 h-4 rounded text-[#B8905A] focus:ring-[#B8905A]"
                    />
                    <div>
                      <span className="font-bold text-[#1B2A45] block">Status Badges & Modul Tagging</span>
                      <span className="text-[10px] text-[#6B6656]">Indikator status operasional modul</span>
                    </div>
                  </label>
                )}

                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#F6F1E6] border border-[#E1D6BE] cursor-pointer hover:bg-[#EDE6D6]/60">
                  <input
                    type="checkbox"
                    checked={includeTableData}
                    onChange={(e) => setIncludeTableData(e.target.checked)}
                    className="w-4 h-4 rounded text-[#B8905A] focus:ring-[#B8905A]"
                  />
                  <div>
                    <span className="font-bold text-[#1B2A45] block">Rincian Data / Rekapitulasi</span>
                    <span className="text-[10px] text-[#6B6656]">Tabel atau daftar rincian data modul</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-[#F6F1E6] border border-[#E1D6BE] cursor-pointer hover:bg-[#EDE6D6]/60">
                  <input
                    type="checkbox"
                    checked={includeSignature}
                    onChange={(e) => setIncludeSignature(e.target.checked)}
                    className="w-4 h-4 rounded text-[#B8905A] focus:ring-[#B8905A]"
                  />
                  <div>
                    <span className="font-bold text-[#1B2A45] block">Kolom Tanda Tangan & Verifikasi</span>
                    <span className="text-[10px] text-[#6B6656]">Stempel digital dan paraf penanggung jawab</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 3: Signer & Notes */}
            <div className="space-y-3 pt-2 border-t border-[#E1D6BE]">
              <h4 className="text-xs font-bold text-[#1B2A45] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#B8905A]" /> Penanggung Jawab & Catatan
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1B2A45] mb-1">Nama Petugas / Dokter:</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full p-2 bg-[#F6F1E6] rounded-lg border border-[#E1D6BE] text-xs font-semibold text-[#1B2A45] focus:outline-none focus:border-[#B8905A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#1B2A45] mb-1">Jabatan / Peran:</label>
                  <input
                    type="text"
                    value={signerRole}
                    onChange={(e) => setSignerRole(e.target.value)}
                    className="w-full p-2 bg-[#F6F1E6] rounded-lg border border-[#E1D6BE] text-xs text-[#1B2A45] focus:outline-none focus:border-[#B8905A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#1B2A45] mb-1">Catatan Tambahan Memo:</label>
                  <textarea
                    rows={2}
                    value={customMemo}
                    onChange={(e) => setCustomMemo(e.target.value)}
                    className="w-full p-2 bg-[#F6F1E6] rounded-lg border border-[#E1D6BE] text-xs text-[#1B2A45] focus:outline-none focus:border-[#B8905A]"
                    placeholder="Tulis catatan ringkasan..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Printable Sheet Preview */}
          <div className="lg:col-span-7 p-4 sm:p-6 overflow-y-auto max-h-[calc(94vh-80px)] flex flex-col items-center justify-start">
            <div className="w-full max-w-2xl mb-3 flex items-center justify-between text-xs text-[#6B6656] print:hidden">
              <span className="font-semibold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#B8905A]" /> Pratinjau Lembar Cetak ({paperSize.toUpperCase()} {orientation})
              </span>
              <span className="text-[10px] bg-[#E1D6BE]/40 px-2 py-0.5 rounded text-[#1B2A45] font-mono">
                Live Rendering
              </span>
            </div>

            {/* THE PRINTABLE SHEET TARGET */}
            <div
              ref={printAreaRef}
              id="printable-summary-document"
              className={`w-full bg-white text-[#1B2A45] shadow-lg rounded-xl border border-[#E1D6BE] print:border-none print:shadow-none print:m-0 print:p-0 font-sans transition-all ${
                paperSize === 'thermal'
                  ? 'max-w-xs p-4 text-[11px]'
                  : orientation === 'landscape'
                  ? 'max-w-3xl p-6 text-xs'
                  : 'max-w-2xl p-6 sm:p-8 text-xs'
              }`}
            >
              {/* 1. KOP KLINIK RESMI */}
              {includeLetterhead && (
                <div className="border-b-2 border-[#1B2A45] pb-4 mb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#1B2A45] text-[#D9B98A] flex items-center justify-center font-bold text-xl shrink-0">
                        🐾
                      </div>
                      <div>
                        <h1 className="font-black text-sm sm:text-base text-[#1B2A45] uppercase tracking-tight font-display leading-tight">
                          PetCare Central Veterinary Hospital
                        </h1>
                        <p className="text-[10px] text-slate-600 font-medium leading-normal">
                          Jl. Radio Dalam Raya No. 45, Kebayoran Baru, Jakarta Selatan 12140
                        </p>
                        <p className="text-[9px] text-slate-500">
                          Izin Operasional No: 503/VET-KLINIK/2023/0019 • Telp: (021) 7201982 • petcare.id
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-2.5 py-0.5 rounded bg-[#F6F1E6] text-[#1B2A45] border border-[#E1D6BE] font-mono font-bold text-[10px]">
                        {docNumber}
                      </span>
                      <p className="text-[9px] text-slate-500 mt-1">
                        {printDate}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. DOKUMEN TITLE & SUBTITLE */}
              <div className="mb-4 bg-[#FAF7F0] p-3 rounded-lg border border-[#E1D6BE]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#B8905A] tracking-wider block">
                      Ringkasan Laporan Operasional Modul
                    </span>
                    <h2 className="text-sm sm:text-base font-bold text-[#1B2A45] font-display">
                      {moduleTitle}
                    </h2>
                    {moduleSubtitle && (
                      <p className="text-[10px] text-[#6B6656] mt-0.5 leading-snug">
                        {moduleSubtitle}
                      </p>
                    )}
                  </div>

                  {activeTabLabel && (
                    <span className="px-2.5 py-1 rounded bg-[#1B2A45] text-[#FFFDF9] text-[10px] font-bold">
                      Tab: {activeTabLabel}
                    </span>
                  )}
                </div>

                {/* Badges if enabled */}
                {includeBadges && badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-[#E1D6BE]/60">
                    {badges.map((b, idx) => {
                      if (typeof b === 'object' && b !== null && 'label' in b) {
                        return (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[9px] font-semibold bg-white border border-[#E1D6BE] text-[#1B2A45]"
                          >
                            {(b as HeaderBadge).label}
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>

              {/* 3. METRIC STATS CARDS */}
              {includeStats && stats && stats.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-[11px] font-bold text-[#1B2A45] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#B8905A]" /> Ringkasan Metrik Kunci
                  </h3>
                  <div className={`grid gap-2 ${
                    stats.length >= 4
                      ? 'grid-cols-2 sm:grid-cols-4'
                      : stats.length === 3
                      ? 'grid-cols-3'
                      : 'grid-cols-2'
                  }`}>
                    {stats.map((st, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
                        <span className="text-[9px] text-slate-500 font-medium block leading-tight">
                          {st.label}
                        </span>
                        <span className="text-sm font-extrabold text-[#1B2A45] font-mono mt-0.5 block">
                          {st.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. TABLE DATA / CUSTOM SUMMARY */}
              {includeTableData && (
                <div className="mb-4 space-y-2">
                  <h3 className="text-[11px] font-bold text-[#1B2A45] uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B8905A]" /> Rekapitulasi Data Saat Ini
                  </h3>

                  {quickPrintData?.tableHeaders && quickPrintData.tableRows && quickPrintData.tableRows.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-left text-[10px] border-collapse">
                        <thead className="bg-[#F6F1E6] border-b border-slate-200">
                          <tr>
                            {quickPrintData.tableHeaders.map((head, hIdx) => (
                              <th key={hIdx} className="py-1.5 px-2 font-bold text-[#1B2A45] uppercase">
                                {head}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {quickPrintData.tableRows.map((row, rIdx) => (
                            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="py-1.5 px-2 text-[#22242B]">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : quickPrintData?.customDataSummary && quickPrintData.customDataSummary.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                      {quickPrintData.customDataSummary.map((item, idx) => (
                        <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-slate-700 block">{item.label}</span>
                            {item.detail && <span className="text-[9px] text-slate-500">{item.detail}</span>}
                          </div>
                          <span className="font-bold text-[#1B2A45] font-mono">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600 flex items-center justify-between">
                      <span>Rekapitulasi status aktif sistem dan sinkronisasi cloud real-time.</span>
                      <span className="font-bold text-emerald-700 font-mono">STATUS: VALID & AKTIF</span>
                    </div>
                  )}
                </div>
              )}

              {/* 5. MEMO / CATATAN */}
              {customMemo && (
                <div className="mb-4 p-2.5 rounded-lg bg-[#FFF9EE] border border-amber-200 text-[10px] text-amber-950">
                  <span className="font-bold block mb-0.5 text-amber-900">Catatan & Keterangan Laporan:</span>
                  <p className="italic leading-relaxed">{customMemo}</p>
                </div>
              )}

              {/* 6. TANDA TANGAN & VERIFIKASI */}
              {includeSignature && (
                <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-[10px] text-slate-600">
                  <div>
                    <p className="text-[9px] text-slate-500">Dicetak Otomatis oleh Sistem:</p>
                    <p className="font-semibold text-[#1B2A45]">PetCare ERP Enterprise v2.4</p>
                    <p className="text-[9px] text-slate-400">ID: {docNumber}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[9px] text-slate-500">Jakarta, {new Date().toLocaleDateString('id-ID')}</p>
                    <p className="font-bold text-[#1B2A45] pt-8 border-b border-slate-300 inline-block min-w-[140px] text-center">
                      {signerName}
                    </p>
                    <p className="text-[9px] font-semibold text-slate-600">{signerRole}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
