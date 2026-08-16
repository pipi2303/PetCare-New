import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Receipt,
  Smartphone,
  Printer,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Percent,
  Sliders,
  QrCode,
  HardDrive,
  Copy,
  Check,
  Wifi,
  WifiOff,
  RefreshCw,
  Eye,
  Camera
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useData } from '../../context/DataContext';
import { CloudBackupModule } from './CloudBackupModule';
import { SystemNotificationHeader } from '../common/SystemNotificationHeader';

export const SettingsModule: React.FC = () => {
  const { addToast } = useToast();
  const { branches = [], activeBranchId } = useData();

  const [activeTab, setActiveTab] = useState<'profile' | 'invoice' | 'whatsapp' | 'printer' | 'backup'>('profile');

  // Clinic Profile State
  const [clinicName, setClinicName] = useState('VetCare Animal Hospital & Pet Clinic');
  const [slogan, setSlogan] = useState('Pelayanan Medis Hewan Terpercaya & Kasih Sayang Sepenuh Hati');
  const [sipNumber, setSipNumber] = useState('503/SIP-DOKTER-HEWAN/DPMPTSP/2024');
  const [taxId, setTaxId] = useState('09.432.871.2-031.000 (NPWP Badan)');
  const [clinicPhone, setClinicPhone] = useState('+62 812-3456-7890');
  const [clinicEmail, setClinicEmail] = useState('klinik@vetcare-hospital.id');
  const [clinicAddress, setClinicAddress] = useState('Jl. Kemang Raya No. 45B, Jakarta Selatan 12730');
  const [operationalHours, setOperationalHours] = useState('Senin - Minggu: 08:00 - 21:00 (Emergency 24 Jam)');

  // Invoice & POS Format State
  const [invoicePrefix, setInvoicePrefix] = useState('INV-VET');
  const [invoiceHeader, setInvoiceHeader] = useState('VETCARE ANIMAL CLINIC & PET SHOP');
  const [invoiceFooter, setInvoiceFooter] = useState('Terima kasih atas kepercayaan Anda merawat anabul tercinta bersama kami.');
  const [taxRate, setTaxRate] = useState<number>(11);
  const [enableTax, setEnableTax] = useState<boolean>(true);
  const [serviceFeePercent, setServiceFeePercent] = useState<number>(0);
  const [roundingMode, setRoundingMode] = useState<'round' | 'floor' | 'ceil'>('round');
  const [cashierAutoPrint, setCashierAutoPrint] = useState<boolean>(true);

  // WhatsApp Gateway State
  const [waConnected, setWaConnected] = useState<boolean>(true);
  const [waSessionName, setWaSessionName] = useState('VetCare-Gateway-Office');
  const [waPhoneConnected, setWaPhoneConnected] = useState('+62 812-9876-5432');
  const [waApiKey, setWaApiKey] = useState('vc_live_98ab71029c8e14d3f281');
  const [autoReminderHMinus1, setAutoReminderHMinus1] = useState<boolean>(true);
  const [autoVaccineAlert, setAutoVaccineAlert] = useState<boolean>(true);
  const [autoSendInvoicePdf, setAutoSendInvoicePdf] = useState<boolean>(true);

  // Printer Configuration State
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('80mm');
  const [printerConnection, setPrinterConnection] = useState<'bluetooth' | 'usb' | 'network'>('bluetooth');
  const [printerDeviceName, setPrinterDeviceName] = useState('RP-80 Thermal POS Printer');
  const [printerIpAddress, setPrinterIpAddress] = useState('192.168.1.188');
  const [cutPaperAfterPrint, setCutPaperAfterPrint] = useState<boolean>(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Profil klinik & identitas operasional berhasil diperbarui!', 'success');
  };

  const handleSaveInvoiceSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Pengaturan format invoice, PPN & kasir POS berhasil disimpan!', 'success');
  };

  const handleSaveWaSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Konfigurasi WhatsApp Gateway & pesan otomatis berhasil disimpan!', 'success');
  };

  const handleTestPrint = () => {
    addToast(`Mengirim data cetak uji coba ke printer ${printerDeviceName} (${paperWidth})...`, 'info');
    setTimeout(() => {
      addToast('Uji coba cetak struk thermal berhasil!', 'success');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Compact & Informative SystemNotificationHeader */}
      <SystemNotificationHeader
        icon={Settings}
        title="Pusat Pengaturan Sistem & Konfigurasi Klinik"
        description="Identitas kop surat, struk kasir, gateway pesan WhatsApp, printer thermal, dan parameter sistem."
        badges={[
          {
            label: `Cabang: ${branches.find((b) => b.id === activeBranchId)?.name || 'Klinik Utama'}`,
            variant: 'emerald',
            icon: Building2
          },
          { label: `PPN ${taxRate}%`, variant: 'amber' },
          { label: `${printerDeviceName} (${paperWidth})`, variant: 'blue' }
        ]}
        tabs={[
          { id: 'profile', label: 'Profil Klinik', icon: Building2 },
          { id: 'invoice', label: 'Format Struk & PPN', icon: Receipt },
          { id: 'whatsapp', label: 'WhatsApp Gateway', icon: Smartphone },
          { id: 'printer', label: 'Printer Thermal', icon: Printer },
          { id: 'backup', label: 'Cadangan & Cloud', icon: HardDrive }
        ]}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as any)}
      />

      {/* TAB 1: Clinic Profile */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-[#FFFDF9] rounded-2xl border border-[#E1D6BE] p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E1D6BE] pb-4">
              <div>
                <h3 className="font-bold text-base text-[#1B2A45] font-display flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#B8905A]" />
                  Informasi Resmi & Legalitas Klinik
                </h3>
                <p className="text-xs text-[#6B6656] mt-0.5">
                  Informasi ini dicetak pada Kop Surat Rekam Medis, Sertifikat Vaksinasi, dan Invoice Resmi.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#1B2A45] block mb-1">Nama Rumah Sakit / Klinik</label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full p-2.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] font-bold text-[#1B2A45] focus:outline-hidden focus:border-[#B8905A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1B2A45] block mb-1">Slogan / Motto Pelayanan</label>
                  <input
                    type="text"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="w-full p-2.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] text-[#1B2A45] focus:outline-hidden focus:border-[#B8905A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1B2A45] block mb-1">No. Izin Operasional Klinik / SIP</label>
                  <input
                    type="text"
                    value={sipNumber}
                    onChange={(e) => setSipNumber(e.target.value)}
                    className="w-full p-2.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] font-mono text-[#1B2A45] focus:outline-hidden focus:border-[#B8905A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1B2A45] block mb-1">NPWP Badan Usaha</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full p-2.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] font-mono text-[#1B2A45] focus:outline-hidden focus:border-[#B8905A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1B2A45] block mb-1">Nomor Telepon & Hotline Emergency</label>
                  <input
                    type="text"
                    value={clinicPhone}
                    onChange={(e) => setClinicPhone(e.target.value)}
                    className="w-full p-2.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] text-[#1B2A45] focus:outline-hidden focus:border-[#B8905A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1B2A45] block mb-1">Email Resmi Layanan</label>
                  <input
                    type="email"
                    value={clinicEmail}
                    onChange={(e) => setClinicEmail(e.target.value)}
                    className="w-full p-2.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] text-[#1B2A45] focus:outline-hidden focus:border-[#B8905A]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1B2A45] block mb-1">Alamat Lengkap Kantor & Poliklinik</label>
                <textarea
                  rows={2}
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  className="w-full p-2.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] text-[#1B2A45] focus:outline-hidden focus:border-[#B8905A]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1B2A45] block mb-1">Jam Operasional Pelayanan</label>
                <input
                  type="text"
                  value={operationalHours}
                  onChange={(e) => setOperationalHours(e.target.value)}
                  className="w-full p-2.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] text-[#1B2A45] focus:outline-hidden focus:border-[#B8905A]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#B8905A] hover:bg-[#9E7848] text-[#101A2C] font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E1D6BE] p-5 shadow-2xs space-y-4 text-center">
              <h4 className="font-bold text-xs text-[#1B2A45] uppercase tracking-wider">Logo Resmi Klinik</h4>
              <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-[#101A2C] to-[#1B2A45] text-[#D9B98A] flex items-center justify-center font-bold text-3xl shadow-inner border border-[#B8905A]/40">
                🐾
              </div>
              <p className="text-[11px] text-[#6B6656]">Format rekomendasi: PNG / SVG transparan resolusi minimal 512x512px.</p>
              <button
                onClick={() => addToast('Pilih file gambar logo baru dari perangkat Anda', 'info')}
                className="w-full py-2 bg-[#F6F1E6] hover:bg-[#E1D6BE] text-[#1B2A45] font-bold text-xs rounded-xl border border-[#E1D6BE] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#B8905A]" />
                <span>Unggah Logo Baru</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E1D6BE] space-y-2 text-xs text-[#6B6656]">
              <div className="flex items-center gap-2 font-bold text-[#1B2A45]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Status Keabsahan Dokumen Medis</span>
              </div>
              <p className="text-[11px]">
                Seluruh data identitas klinik ini otomatis dienkripsi dan dicantumkan dengan QR Code verifikasi pada setiap EMR dan e-Prescription.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Invoice & POS Format */}
      {activeTab === 'invoice' && (
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E1D6BE] p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E1D6BE] pb-4">
            <div>
              <h3 className="font-bold text-base text-[#1B2A45] font-display flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#B8905A]" />
                Konfigurasi Struk Kasir POS, Pajak & Faktur
              </h3>
              <p className="text-xs text-[#6B6656] mt-0.5">
                Pengaturan nomor seri invoice, tarif PPN, header/footer struk thermal, dan pembulatan transaksi kasir.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveInvoiceSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-[#1B2A45] block mb-1">Prefix Kode Faktur</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="w-full p-2.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] font-mono font-bold text-[#1B2A45]"
                />
                <span className="text-[10px] text-[#6B6656] mt-1 block">Contoh hasil: {invoicePrefix}-20260812-0042</span>
              </div>

              <div>
                <label className="font-bold text-[#1B2A45] block mb-1">Tarif Pajak PPN (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] font-bold text-[#1B2A45]"
                  />
                  <span className="font-bold text-[#1B2A45]">%</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="enableTax"
                    checked={enableTax}
                    onChange={(e) => setEnableTax(e.target.checked)}
                    className="rounded text-[#B8905A] focus:ring-[#B8905A] cursor-pointer"
                  />
                  <label htmlFor="enableTax" className="text-[11px] text-[#6B6656] cursor-pointer">
                    Kenakan PPN otomatis pada kasir
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1B2A45] block mb-1">Metode Pembulatan Kasir</label>
                <select
                  value={roundingMode}
                  onChange={(e) => setRoundingMode(e.target.value as any)}
                  className="w-full p-2.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] font-semibold text-[#1B2A45]"
                >
                  <option value="round">Pembulatan Terdekat (Standard)</option>
                  <option value="floor">Pembulatan Ke Bawah (Down)</option>
                  <option value="ceil">Pembulatan Ke Atas (Up)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="font-bold text-[#1B2A45] block mb-1">Header Teks Struk Cetak</label>
                <input
                  type="text"
                  value={invoiceHeader}
                  onChange={(e) => setInvoiceHeader(e.target.value)}
                  className="w-full p-2.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] font-bold text-[#1B2A45]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1B2A45] block mb-1">Footer / Pesan Terima Kasih</label>
                <input
                  type="text"
                  value={invoiceFooter}
                  onChange={(e) => setInvoiceFooter(e.target.value)}
                  className="w-full p-2.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] text-[#1B2A45]"
                />
              </div>
            </div>

            <div className="p-4 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] flex items-center justify-between">
              <div>
                <h5 className="font-bold text-[#1B2A45]">Cetak Otomatis Struk Setelah Pembayaran Lunas</h5>
                <p className="text-[11px] text-[#6B6656]">Kirim perintah cetak langsung ke printer thermal segera setelah kasir menekan tombol Lunas.</p>
              </div>
              <input
                type="checkbox"
                checked={cashierAutoPrint}
                onChange={(e) => setCashierAutoPrint(e.target.checked)}
                className="w-5 h-5 rounded text-[#B8905A] focus:ring-[#B8905A] cursor-pointer"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#B8905A] hover:bg-[#9E7848] text-[#101A2C] font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Format Invoice & Kasir</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: WhatsApp Gateway */}
      {activeTab === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[#FFFDF9] rounded-2xl border border-[#E1D6BE] p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E1D6BE] pb-4">
              <div>
                <h3 className="font-bold text-base text-[#1B2A45] font-display flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#B8905A]" />
                  Integrasi WhatsApp Gateway Bisnis
                </h3>
                <p className="text-xs text-[#6B6656] mt-0.5">
                  Pengiriman otomatis pesan pengingat booking, jadwal booster vaksin, dan bukti struk digital ke WhatsApp pemilik hewan.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveWaSettings} className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-emerald-900 text-xs">Status Gateway: TERHUBUNG (ONLINE)</h5>
                    <p className="text-[11px] text-emerald-700">Nomor: {waPhoneConnected} ({waSessionName})</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => addToast('Sesi WhatsApp Gateway aktif & sinkron.', 'success')}
                  className="px-3 py-1.5 bg-emerald-700 text-white font-bold text-[11px] rounded-lg hover:bg-emerald-800"
                >
                  Cek Sinyal
                </button>
              </div>

              <div>
                <label className="font-bold text-[#1B2A45] block mb-1">API Key WhatsApp Gateway Provider</label>
                <input
                  type="password"
                  value={waApiKey}
                  onChange={(e) => setWaApiKey(e.target.value)}
                  className="w-full p-2.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] font-mono text-[#1B2A45]"
                />
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs text-[#1B2A45] uppercase tracking-wider">Otomasi Pengiriman Pesan:</h4>

                <div className="p-3.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-[#1B2A45]">Pengingat Booking & Janji Temu (H-1)</h5>
                    <p className="text-[11px] text-[#6B6656]">Kirim pesan konfirmasi otomatis 24 jam sebelum jadwal konsultasi/grooming.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoReminderHMinus1}
                    onChange={(e) => setAutoReminderHMinus1(e.target.checked)}
                    className="w-4 h-4 rounded text-[#B8905A] focus:ring-[#B8905A] cursor-pointer"
                  />
                </div>

                <div className="p-3.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-[#1B2A45]">Notifikasi Booster Vaksin & Anti-Kutu</h5>
                    <p className="text-[11px] text-[#6B6656]">Kirim pengingat saat hewan mendekati tanggal jatuh tempo vaksinasi tahunan.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoVaccineAlert}
                    onChange={(e) => setAutoVaccineAlert(e.target.checked)}
                    className="w-4 h-4 rounded text-[#B8905A] focus:ring-[#B8905A] cursor-pointer"
                  />
                </div>

                <div className="p-3.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-[#1B2A45]">Kirim E-Receipt & Link PDF Tagihan Lunas</h5>
                    <p className="text-[11px] text-[#6B6656]">Kirim tautan struk digital segera setelah transaksi pembayaran kasir berhasil.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSendInvoicePdf}
                    onChange={(e) => setAutoSendInvoicePdf(e.target.checked)}
                    className="w-4 h-4 rounded text-[#B8905A] focus:ring-[#B8905A] cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#B8905A] hover:bg-[#9E7848] text-[#101A2C] font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Konfigurasi WhatsApp</span>
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E1D6BE] p-5 shadow-2xs space-y-3">
              <h4 className="font-bold text-xs text-[#1B2A45] font-display flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#B8905A]" />
                Pairing Perangkat WhatsApp Baru
              </h4>
              <p className="text-[11px] text-[#6B6656]">
                Scan QR Code berikut menggunakan aplikasi WhatsApp di HP Kasir / Front Office untuk menghubungkan session baru:
              </p>
              <div className="p-4 bg-white rounded-xl border border-[#E1D6BE] text-center space-y-2">
                <div className="w-36 h-36 mx-auto bg-gradient-to-br from-[#101A2C] to-[#1B2A45] rounded-xl p-2 flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-lg p-2 flex items-center justify-center font-mono font-bold text-xs text-[#1B2A45]">
                    [ QR SCAN READY ]
                  </div>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold block">Status: Session Terhubung (Live)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Thermal Printer */}
      {activeTab === 'printer' && (
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E1D6BE] p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E1D6BE] pb-4">
            <div>
              <h3 className="font-bold text-base text-[#1B2A45] font-display flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#B8905A]" />
                Konfigurasi Printer Struk Thermal Kasir POS
              </h3>
              <p className="text-xs text-[#6B6656] mt-0.5">
                Pengaturan protokol komunikasi Bluetooth, USB atau Network LAN ESC/POS untuk cetak struk dan label barcode.
              </p>
            </div>
            <button
              onClick={handleTestPrint}
              className="px-4 py-2 bg-[#1B2A45] hover:bg-[#101A2C] text-[#D9B98A] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#D9B98A]" />
              <span>Uji Coba Cetak (Test Print)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-4">
              <div>
                <label className="font-bold text-[#1B2A45] block mb-1">Ukuran Kertas Thermal</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaperWidth('58mm')}
                    className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      paperWidth === '58mm'
                        ? 'bg-[#1B2A45] text-white border-[#B8905A]'
                        : 'bg-[#F6F1E6] text-[#1B2A45] border-[#E1D6BE]'
                    }`}
                  >
                    58mm (Kompak Mini)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperWidth('80mm')}
                    className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      paperWidth === '80mm'
                        ? 'bg-[#1B2A45] text-white border-[#B8905A]'
                        : 'bg-[#F6F1E6] text-[#1B2A45] border-[#E1D6BE]'
                    }`}
                  >
                    80mm (Standar Hospital POS)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1B2A45] block mb-1">Tipe Koneksi Printer</label>
                <select
                  value={printerConnection}
                  onChange={(e) => setPrinterConnection(e.target.value as any)}
                  className="w-full p-2.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] font-semibold text-[#1B2A45]"
                >
                  <option value="bluetooth">Bluetooth Wireless (ESC/POS)</option>
                  <option value="usb">USB Direct Cable</option>
                  <option value="network">Network IP / Ethernet LAN</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#1B2A45] block mb-1">Nama Perangkat / Bluetooth Device</label>
                <input
                  type="text"
                  value={printerDeviceName}
                  onChange={(e) => setPrinterDeviceName(e.target.value)}
                  className="w-full p-2.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] font-bold text-[#1B2A45]"
                />
              </div>

              {printerConnection === 'network' && (
                <div>
                  <label className="font-bold text-[#1B2A45] block mb-1">Alamat IP Printer LAN</label>
                  <input
                    type="text"
                    value={printerIpAddress}
                    onChange={(e) => setPrinterIpAddress(e.target.value)}
                    className="w-full p-2.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] font-mono text-[#1B2A45]"
                  />
                </div>
              )}

              <div className="p-3.5 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE] flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-[#1B2A45]">Perintah Auto-Cutter Kertas</h5>
                  <p className="text-[11px] text-[#6B6656]">Kirim sinyal potong kertas otomatis setelah struk selesai dicetak.</p>
                </div>
                <input
                  type="checkbox"
                  checked={cutPaperAfterPrint}
                  onChange={(e) => setCutPaperAfterPrint(e.target.checked)}
                  className="w-4 h-4 rounded text-[#B8905A] focus:ring-[#B8905A] cursor-pointer"
                />
              </div>
            </div>

            {/* Receipt Preview */}
            <div className="bg-[#FAF7F0] rounded-2xl border border-[#E1D6BE] p-5 space-y-3">
              <h4 className="font-bold text-xs text-[#1B2A45] uppercase tracking-wider text-center">
                Pratinjau Struk Kasir ({paperWidth})
              </h4>
              <div className="max-w-[280px] mx-auto bg-white p-4 rounded-xl shadow-xs border border-[#E1D6BE] font-mono text-[10px] space-y-2 text-[#1B2A45]">
                <div className="text-center border-b border-dashed border-gray-400 pb-2">
                  <p className="font-bold text-xs">{invoiceHeader}</p>
                  <p>{clinicAddress.slice(0, 35)}...</p>
                  <p>Telp: {clinicPhone}</p>
                </div>
                <div className="space-y-1 py-1 border-b border-dashed border-gray-400">
                  <div className="flex justify-between">
                    <span>No: {invoicePrefix}-001</span>
                    <span>13/08/26</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Klien: Budi Santoso</span>
                    <span>Pasien: Mimi</span>
                  </div>
                </div>
                <div className="space-y-1 py-1 border-b border-dashed border-gray-400">
                  <div className="flex justify-between">
                    <span>1x Konsul Medis Umum</span>
                    <span>Rp 150.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1x Resep Amoxicillin</span>
                    <span>Rp 45.000</span>
                  </div>
                </div>
                <div className="space-y-1 font-bold pt-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rp 195.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PPN ({taxRate}%):</span>
                    <span>Rp {(195000 * (taxRate / 100)).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-gray-400">
                    <span>TOTAL:</span>
                    <span>Rp {(195000 * (1 + taxRate / 100)).toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div className="text-center pt-2 text-[9px] text-gray-600">
                  <p>{invoiceFooter}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Backup & Cloud Snapshots */}
      {activeTab === 'backup' && (
        <CloudBackupModule />
      )}
    </div>
  );
};
