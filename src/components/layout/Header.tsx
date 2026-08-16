import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { NavModule } from './Sidebar';
import { getRoleInfo } from '../../utils/roleUtils';
import { UserRole } from '../../types';
import {
  Menu,
  Search,
  Bell,
  Calendar,
  ClipboardList,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  UserCheck,
  Check,
  ShieldCheck,
  Store,
  LogOut,
  KeyRound,
  Zap,
  Building2,
  MapPin
} from 'lucide-react';

interface HeaderProps {
  activeModule: NavModule;
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
  openGlobalSearch: () => void;
  openPublicBooking: () => void;
  onOpenAI?: () => void;
}

const MODULE_TITLES: Record<NavModule, string> = {
  dashboard: 'Dashboard Operasional ERP',
  masterData: 'Master Data Pelanggan & Hewan',
  booking: 'Booking & Antrian Layanan',
  clinic: 'Pemeriksaan Klinik & CPPT SOAP',
  emr: 'Rekam Medis Elektronik (EMR)',
  vaccination: 'Vaksinasi & Paspor Hewan',
  pharmacy: 'Apotek & Laboratorium',
  grooming: 'Grooming Salon & Spa',
  petHotel: 'Pet Hotel Boarding',
  patientGallery: 'Galeri Foto Pasien',
  petShop: 'Pet Shop POS Kasir & Barcode',
  inventory: 'Stok & Manajemen Gudang',
  purchasing: 'Purchasing (Purchase Orders)',
  billing: 'Billing & Pembayaran Kasir',
  finance: 'Buku Kas & Keuangan',
  hrm: 'SDM, Absensi & Shift Kerja',
  crm: 'CRM, Loyalitas & Blast WA',
  reports: 'Laporan & Analytics Eksekutif',
  aiAssistant: 'AI Veterinary Assistant',
  telehealth: 'Telehealth Video Konsultasi',
  eForms: 'E-Form & Digital Consent',
  ambulance: 'Ambulance & Emergency Rescue',
  carePlan: 'Rencana Perawatan (Care Plan)',
  auditLog: 'Audit Log & Jejak Sistem',
  systemGroups: 'Sistem Grup & RBAC Departemen',
  notifications: 'Pusat Notifikasi',
  branches: 'Manajemen Cabang Klinik',
  settings: 'Pengaturan Sistem',
  tenantAdmin: 'SaaS Superadmin Admin Tenant',
};

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  isCollapsed,
  setIsCollapsed,
  openGlobalSearch,
  openPublicBooking,
  onOpenAI,
}) => {
  const { user, switchRole } = useAuth();
  const { notifications = [], markNotificationRead } = useData();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const userRole = user?.role || 'owner_klinik';
  const roleInfo = getRoleInfo(userRole);
  const unreadCount = (notifications || []).filter((n) => !n.isRead).length;

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setShowUserDropdown(false);
  };

  useEffect(() => {
    if (!showNotifDropdown && !showUserDropdown) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown-container]')) {
        setShowNotifDropdown(false);
        setShowUserDropdown(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifDropdown(false);
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifDropdown, showUserDropdown]);

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-[#1B2A45] border-b border-[#B8905A]/30 shadow-md transition-all duration-300 flex items-center justify-between px-4 sm:px-6 ${
        isCollapsed ? 'left-16' : 'left-64'
      }`}
    >
      {/* Left section: Collapse Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl text-[#D9B98A] hover:bg-[#101A2C] hover:text-[#FFFDF9] transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <nav className="text-[9px] text-[#EDE6D6]/70 flex items-center gap-1.5 font-medium leading-none">
            <span className="text-[#D9B98A] font-bold text-[9px]">PetCare ERP</span>
            <span className="text-[#B8905A] font-bold text-[9px]">/</span>
            <span className="text-[#FFFDF9] font-bold font-display tracking-tight text-[9px]">
              {MODULE_TITLES[activeModule] || activeModule}
            </span>
          </nav>
        </div>
      </div>

      {/* Center/Right section: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button */}
        <button
          onClick={openGlobalSearch}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101A2C] text-[#EDE6D6] hover:bg-[#101A2C]/80 hover:border-[#D9B98A] text-xs font-medium border border-[#B8905A]/30 transition-all shadow-2xs group"
        >
          <Search className="w-3.5 h-3.5 text-[#D9B98A] group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline text-[#EDE6D6]/70">Cari pasien, obat, barang...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-[#1B2A45] border border-[#B8905A]/40 rounded text-[#D9B98A] font-mono font-bold">
            ⌘K
          </kbd>
        </button>

        {/* Tanya Vet AI Button with Tooltip */}
        {onOpenAI && (
          <div className="relative group">
            <button
              onClick={onOpenAI}
              className="flex items-center justify-center p-2 rounded-lg bg-linear-to-r from-[#B8905A] to-[#D9B98A] text-[#101A2C] hover:opacity-90 transition-all shadow-2xs cursor-pointer"
              aria-label="Tanya Vet AI"
            >
              <Sparkles className="w-4 h-4 text-[#101A2C]" />
            </button>

            {/* Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center px-2.5 py-1 bg-[#101A2C] border border-[#B8905A]/40 text-[#FFFDF9] text-[11px] font-medium rounded-md shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
              <span>Tanya Vet AI</span>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#101A2C] border-t border-l border-[#B8905A]/40 rotate-45"></div>
            </div>
          </div>
        )}

        {/* Public Booking Portal button */}
        <div className="relative group">
          <button
            onClick={openPublicBooking}
            className="flex items-center justify-center p-2 rounded-lg bg-[#B8905A] text-[#FFFDF9] hover:bg-[#9E7848] border border-[#D9B98A]/30 transition-all shadow-2xs cursor-pointer"
            aria-label="Form Booking Online"
          >
            <ClipboardList className="w-4 h-4 text-[#FFFDF9]" />
          </button>

          {/* Tooltip */}
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center px-2.5 py-1 bg-[#101A2C] border border-[#B8905A]/40 text-[#FFFDF9] text-[11px] font-medium rounded-md shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            <span>Form Booking Online</span>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#101A2C] border-t border-l border-[#B8905A]/40 rotate-45"></div>
          </div>
        </div>

        {/* Today Date */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-[#EDE6D6] bg-[#101A2C] px-2.5 py-1.5 rounded-lg border border-[#B8905A]/30">
          <Calendar className="w-3.5 h-3.5 text-[#D9B98A]" />
          <span className="font-medium">{todayFormatted}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative" data-dropdown-container="true">
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowUserDropdown(false);
            }}
            className="p-2 rounded-xl text-[#D9B98A] bg-[#101A2C] hover:bg-[#101A2C]/80 border border-[#B8905A]/30 transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4 text-[#D9B98A]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#7A3030] text-[#FFFDF9] rounded-full text-[10px] font-bold flex items-center justify-center border border-[#FFFDF9]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-[#FFFDF9] rounded-xl shadow-xl border border-[#E1D6BE] p-3 z-50 text-[#22242B] animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E1D6BE]">
                <h4 className="text-xs font-bold text-[#1B2A45] font-display">Notifikasi Terbaru</h4>
                <span className="text-[10px] bg-[#E1D6BE] text-[#1B2A45] px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} Baru
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      !n.isRead
                        ? 'bg-[#F6F1E6] border-[#E1D6BE]'
                        : 'bg-[#FFFDF9] border-[#E1D6BE]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#1B2A45]">{n.title}</span>
                      <span className="text-[10px] text-[#6B6656]">{n.createdAt}</span>
                    </div>
                    <p className="text-[11px] text-[#22242B] line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Role Profile Switcher Badge */}
        <div className="relative" data-dropdown-container="true">
          <button
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowNotifDropdown(false);
            }}
            className="flex items-center gap-2 pl-2 border-l border-[#B8905A]/30 hover:opacity-95 transition-opacity text-left cursor-pointer group"
            title="Klik untuk ganti profil kepemilikan usaha"
          >
            <div className="w-8 h-8 rounded-lg bg-[#D9B98A] text-[#101A2C] font-bold text-xs flex items-center justify-center shadow-xs shrink-0 group-hover:ring-2 ring-[#D9B98A]/50">
              {roleInfo.iconText}
            </div>
            <div className="hidden md:block text-left">
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold text-[#FFFDF9] leading-none">{roleInfo.label}</p>
                <ChevronDown className="w-3 h-3 text-[#D9B98A]" />
              </div>
              <p className="text-[10px] text-[#D9B98A] font-semibold mt-0.5 truncate max-w-[140px]">
                {roleInfo.businessType}
              </p>
            </div>
          </button>

          {/* Role Profile Dropdown */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1B2A45] border border-[#B8905A] rounded-xl shadow-2xl p-3 z-50 text-[#EDE6D6] space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#B8905A]/30">
                <div>
                  <h4 className="text-xs font-bold text-[#FFFDF9] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#D9B98A]" /> Profil Kepemilikan Usaha
                  </h4>
                  <p className="text-[10px] text-[#D9B98A]/80">Sesuaikan menu & akses sidebar</p>
                </div>
                <button
                  onClick={() => setShowUserDropdown(false)}
                  className="text-xs text-[#D9B98A] hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Owner Options */}
              <div className="space-y-1.5">
                {/* 1. Owner Klinik */}
                <button
                  onClick={() => handleRoleSelect('owner_klinik')}
                  className={`w-full text-left p-2 rounded-lg border transition-all flex items-start gap-2.5 ${
                    userRole === 'owner_klinik' || userRole === 'owner'
                      ? 'bg-[#D9B98A]/20 border-[#D9B98A] ring-1 ring-[#D9B98A]'
                      : 'bg-[#101A2C]/60 border-[#B8905A]/30 hover:bg-[#101A2C] hover:border-[#D9B98A]/50'
                  }`}
                >
                  <span className="text-xl">🏥</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#FFFDF9]">Owner Klinik</span>
                      {(userRole === 'owner_klinik' || userRole === 'owner') && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#D9B98A]">Praktek Medis & Rumah Sakit Vet</p>
                    <p className="text-[9px] text-[#EDE6D6]/60 mt-0.5">
                      Fokus: Medis, EMR, Farmasi, Rawat Inap, Billing
                    </p>
                  </div>
                </button>

                {/* 2. Owner Petshop */}
                <button
                  onClick={() => handleRoleSelect('owner_petshop')}
                  className={`w-full text-left p-2 rounded-lg border transition-all flex items-start gap-2.5 ${
                    userRole === 'owner_petshop'
                      ? 'bg-[#D9B98A]/20 border-[#D9B98A] ring-1 ring-[#D9B98A]'
                      : 'bg-[#101A2C]/60 border-[#B8905A]/30 hover:bg-[#101A2C] hover:border-[#D9B98A]/50'
                  }`}
                >
                  <span className="text-xl">🛒</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#FFFDF9]">Owner Petshop</span>
                      {userRole === 'owner_petshop' && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-bold">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#D9B98A]">Toko Retail Pet Shop & Pakan</p>
                    <p className="text-[9px] text-[#EDE6D6]/60 mt-0.5">
                      Fokus: Kasir POS, Barcode, Stok Barang, Purchasing
                    </p>
                  </div>
                </button>

                {/* 3. Owner PetCare */}
                <button
                  onClick={() => handleRoleSelect('owner_petcare')}
                  className={`w-full text-left p-2 rounded-lg border transition-all flex items-start gap-2.5 ${
                    userRole === 'owner_petcare'
                      ? 'bg-[#D9B98A]/20 border-[#D9B98A] ring-1 ring-[#D9B98A]'
                      : 'bg-[#101A2C]/60 border-[#B8905A]/30 hover:bg-[#101A2C] hover:border-[#D9B98A]/50'
                  }`}
                >
                  <span className="text-xl">🐾</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#FFFDF9]">Owner PetCare</span>
                      {userRole === 'owner_petcare' && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-[#D9B98A]/30 text-[#D9B98A] rounded font-bold">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#D9B98A]">One-Stop Solution (All-in-One)</p>
                    <p className="text-[9px] text-emerald-300/80 mt-0.5">
                      Akses Penuh: Klinik + Petshop + Grooming + Hotel
                    </p>
                  </div>
                </button>
              </div>

              {/* Other Roles Quick Switch */}
              <div className="pt-2 border-t border-[#B8905A]/20">
                <p className="text-[9px] font-bold text-[#D9B98A]/80 uppercase tracking-wider mb-1.5">
                  Peran Staff Lainnya:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleRoleSelect('dokter')}
                    className="px-2 py-1 bg-[#101A2C] hover:bg-[#101A2C]/80 border border-[#B8905A]/30 rounded text-[11px] font-semibold text-left text-[#EDE6D6] flex items-center gap-1.5"
                  >
                    <span>🩺</span> Dokter
                  </button>
                  <button
                    onClick={() => handleRoleSelect('kasir')}
                    className="px-2 py-1 bg-[#101A2C] hover:bg-[#101A2C]/80 border border-[#B8905A]/30 rounded text-[11px] font-semibold text-left text-[#EDE6D6] flex items-center gap-1.5"
                  >
                    <span>💳</span> Kasir
                  </button>
                  <button
                    onClick={() => handleRoleSelect('groomer')}
                    className="px-2 py-1 bg-[#101A2C] hover:bg-[#101A2C]/80 border border-[#B8905A]/30 rounded text-[11px] font-semibold text-left text-[#EDE6D6] flex items-center gap-1.5"
                  >
                    <span>✂️</span> Groomer
                  </button>
                  <button
                    onClick={() => handleRoleSelect('admin')}
                    className="px-2 py-1 bg-[#101A2C] hover:bg-[#101A2C]/80 border border-[#B8905A]/30 rounded text-[11px] font-semibold text-left text-[#EDE6D6] flex items-center gap-1.5"
                  >
                    <span>🛠️</span> Admin
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
