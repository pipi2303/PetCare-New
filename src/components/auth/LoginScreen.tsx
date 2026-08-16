import React, { useState, useMemo } from 'react';
import {
  Shield,
  Building2,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Layers,
  Sparkles,
  Users,
  Store,
  Stethoscope,
  Scissors,
  Check,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  Zap,
  Globe,
  Phone,
  MapPin,
  RefreshCw,
  QrCode,
  Sliders,
  UserCheck,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { User, UserRole, Branch } from '../../types';
import { getRoleInfo, ROLE_PROFILES_INFO } from '../../utils/roleUtils';

interface OwnershipModel {
  id: string;
  name: string;
  badge: string;
  icon: string;
  tagline: string;
  color: string;
  borderColor: string;
  bgLight: string;
  description: string;
  defaultRole: UserRole;
  allowedModulesCount: number;
  highlightModules: string[];
  hiddenModules: string[];
}

const OWNERSHIP_MODELS: OwnershipModel[] = [
  {
    id: 'owner_klinik',
    name: 'Klinik Medis & RS Hewan',
    badge: 'Praktek Medis Vet',
    icon: '🏥',
    tagline: 'Fokus Diagnosa, EMR, Tindakan Medis & Farmasi',
    color: '#059669',
    borderColor: 'border-emerald-500/40',
    bgLight: 'bg-emerald-50/70',
    description: 'Konfigurasi khusus praktek dokter hewan, klinik pratama/utama & RS Hewan 24 jam. Mengelola EMR, CPPT, resep racikan, radiologi, lab, rawat inap, dan invoice medis.',
    defaultRole: 'owner_klinik',
    allowedModulesCount: 16,
    highlightModules: ['Pemeriksaan SOAP', 'Rekam Medis (EMR)', 'Apotek & Lab', 'Rawat Inap', 'Vaksin & Paspor'],
    hiddenModules: ['Pet Shop POS Retail', 'Grooming Salon', 'Pet Hotel']
  },
  {
    id: 'owner_petshop',
    name: 'Pet Shop Retail & Pakan',
    badge: 'Retail POS & Logistik',
    icon: '🛒',
    tagline: 'Fokus Kasir POS, Barcode, Stok & Member CRM',
    color: '#D97706',
    borderColor: 'border-amber-500/40',
    bgLight: 'bg-amber-50/70',
    description: 'Konfigurasi toko perlengkapan hewan, pakan ternak/anabul, dan aksesoris. Dilengkapi kasir barcode POS, manajemen stok multi-gudang, purchase order supplier, dan program poin member.',
    defaultRole: 'owner_petshop',
    allowedModulesCount: 11,
    highlightModules: ['Pet Shop POS Kasir', 'Stok Gudang & Opname', 'Purchasing PO Supplier', 'CRM & Poin Member', 'Buku Kas Toko'],
    hiddenModules: ['Modul Medis Dokter', 'Apotek & Lab', 'Care Plan']
  },
  {
    id: 'owner_petcare',
    name: 'One-Stop Integrated PetCare',
    badge: 'All-in-One Ecosystem',
    icon: '🐾',
    tagline: 'Ekosistem Lengkap: Medis + Retail + Spa + Hotel',
    color: '#B8905A',
    borderColor: 'border-[#B8905A]/50',
    bgLight: 'bg-[#F6F1E6]',
    description: 'Solusi terlengkap terintegrasi penuh: Klinik Dokter Hewan, Pet Shop POS, Grooming Salon & Spa, Pet Hotel Boarding, Ambulans Rescue, dan Telehealth Konsultasi.',
    defaultRole: 'owner_petcare',
    allowedModulesCount: 28,
    highlightModules: ['Seluruh 28 Modul Operasional ERP Terpadu Tanpa Batasan'],
    hiddenModules: ['Tidak Ada (Akses Penuh)']
  },
  {
    id: 'superadmin',
    name: 'SaaS Master Superadmin',
    badge: 'Multi-Tenant Master',
    icon: '👑',
    tagline: 'Pusat Kontrol Lisensi, Tenant & Audit Sistem',
    color: '#E11D48',
    borderColor: 'border-rose-500/40',
    bgLight: 'bg-rose-50/70',
    description: 'Pengawasan holding perusahaan, lisensi multi-tenant, kuota cloud database, cabang pusat, dan audit trail jejak keamanan terpusat.',
    defaultRole: 'superadmin',
    allowedModulesCount: 28,
    highlightModules: ['Admin Tenant SaaS', 'Manajemen Multi-Cabang', 'Audit Log Sistem', 'Pengaturan Global'],
    hiddenModules: ['Tidak Ada']
  },
  {
    id: 'pemilik',
    name: 'Portal Pemilik Hewan',
    badge: 'Client Self-Service',
    icon: '🐕',
    tagline: 'Portal Klien: Paspor Vaksin, Riwayat & Booking',
    color: '#0D9488',
    borderColor: 'border-teal-500/40',
    bgLight: 'bg-teal-50/70',
    description: 'Akses khusus untuk pemilik anabul: melihat riwayat rekam medis, buku vaksinasi digital, unduh sertifikat, jadwal kontrol, dan reservasi layanan secara mandiri.',
    defaultRole: 'pemilik',
    allowedModulesCount: 4,
    highlightModules: ['Booking Online', 'Paspor & Vaksinasi Digital', 'Notifikasi & Pengingat Kontrol'],
    hiddenModules: ['Seluruh Modul ERP Internal Kasir & Medis']
  }
];

export const LoginScreen: React.FC<{ onSuccessfulLogin?: () => void }> = ({ onSuccessfulLogin }) => {
  const {
    users = [],
    login,
    loginWithPin,
    loginAsUser,
    activeBranchId,
    setActiveBranchId,
    activeOwnership,
    setActiveOwnership,
    closeLoginScreen,
    isAuthenticated
  } = useAuth();

  const { branches = [] } = useData();
  const { addToast } = useToast();

  // Tab mode
  const [activeTab, setActiveTab] = useState<'credentials' | 'demoMatrix' | 'pinFast'>('credentials');

  // Selected Ownership Model & Branch Filter
  const [selectedOwnership, setSelectedOwnership] = useState<string>(activeOwnership || 'owner_klinik');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(activeBranchId || 'b1');

  // Form State
  const [emailOrPhone, setEmailOrPhone] = useState<string>('owner.klinik@petcare.id');
  const [password, setPassword] = useState<string>('petcare2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // PIN Fast Login State
  const [pinInput, setPinInput] = useState<string>('');
  const [pinLoading, setPinLoading] = useState<boolean>(false);

  // RBAC Matrix Drawer / Modal
  const [showRbacModal, setShowRbacModal] = useState<boolean>(false);

  // Forgot Password Dialog
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotPhone, setForgotPhone] = useState<string>('');

  const currentOwnershipObj = useMemo(() => {
    return OWNERSHIP_MODELS.find((m) => m.id === selectedOwnership) || OWNERSHIP_MODELS[0];
  }, [selectedOwnership]);

  const currentBranchObj = useMemo(() => {
    if (selectedBranchId === 'all') {
      return {
        id: 'all',
        name: 'Semua Cabang (Konsolidasi Multi-Outlet)',
        code: 'BR-ALL',
        address: 'Pusat Holding & Seluruh Jaringan Klinik',
        phone: '021-7201982',
        email: 'holding@petcare.id',
        isActive: true,
        isMainBranch: true
      };
    }
    return branches.find((b) => b.id === selectedBranchId) || branches[0] || {
      id: 'b1',
      name: 'Klinik Utama (Pusat)',
      code: 'BR-01',
      address: 'Jl. Radio Dalam No. 45, Jakarta Selatan',
      phone: '021-7201982',
      email: 'pusat@petcare.id',
      isActive: true,
      isMainBranch: true
    };
  }, [branches, selectedBranchId]);

  // Demo users filtered by selected ownership model
  const filteredUsers = useMemo(() => {
    if (selectedOwnership === 'owner_klinik') {
      return users.filter((u) => ['owner_klinik', 'dokter', 'perawat', 'admin'].includes(u.role));
    }
    if (selectedOwnership === 'owner_petshop') {
      return users.filter((u) => ['owner_petshop', 'kasir', 'admin'].includes(u.role));
    }
    if (selectedOwnership === 'owner_petcare') {
      return users.filter((u) => ['owner_petcare', 'groomer', 'dokter', 'kasir', 'admin'].includes(u.role));
    }
    if (selectedOwnership === 'superadmin') {
      return users.filter((u) => ['superadmin', 'admin'].includes(u.role));
    }
    if (selectedOwnership === 'pemilik') {
      return users.filter((u) => u.role === 'pemilik');
    }
    return users;
  }, [users, selectedOwnership]);

  // Handle credentials login submit
  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!emailOrPhone.trim()) {
      setErrorMessage('Silakan masukkan email, nomor WhatsApp, atau ID pengguna.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = login(emailOrPhone, password, {
        branchId: selectedBranchId,
        branchName: currentBranchObj.name,
        ownershipType: selectedOwnership
      });

      setIsLoading(false);
      if (result.success) {
        addToast(`Selamat datang! Anda masuk ke ${currentBranchObj.name}`, 'success');
        if (onSuccessfulLogin) onSuccessfulLogin();
        closeLoginScreen();
      } else {
        setErrorMessage(result.message || 'Kredensial tidak valid. Silakan coba lagi atau gunakan opsi Login Cepat.');
      }
    }, 450);
  };

  // Handle PIN Fast login submit
  const handlePinSubmit = (pinToVerify?: string) => {
    const pin = pinToVerify || pinInput;
    if (pin.length < 4) {
      setErrorMessage('PIN harus terdiri dari 4 digit.');
      return;
    }
    setPinLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      const result = loginWithPin(pin, selectedBranchId);
      setPinLoading(false);
      if (result.success) {
        addToast(`Login PIN berhasil! Sesi aktif di ${currentBranchObj.name}`, 'success');
        if (onSuccessfulLogin) onSuccessfulLogin();
        closeLoginScreen();
      } else {
        setErrorMessage(result.message || 'PIN tidak valid. Silakan masukkan PIN 4 digit yang sesuai.');
        setPinInput('');
      }
    }, 350);
  };

  // Handle 1-Click Demo User Login
  const handleSelectDemoUser = (demoUser: User) => {
    setIsLoading(true);
    setTimeout(() => {
      loginAsUser(demoUser, {
        branchId: selectedBranchId,
        branchName: currentBranchObj.name,
        ownershipType: selectedOwnership
      });
      setIsLoading(false);
      addToast(`Masuk sebagai ${demoUser.name} (${getRoleInfo(demoUser.role).label}) di ${currentBranchObj.name}`, 'success');
      if (onSuccessfulLogin) onSuccessfulLogin();
      closeLoginScreen();
    }, 200);
  };

  // Quick prefill helper
  const handlePrefill = (email: string, roleOwnership: string) => {
    setEmailOrPhone(email);
    setPassword('petcare2026');
    setSelectedOwnership(roleOwnership);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#101A2C] text-[#EDE6D6] flex flex-col justify-between selection:bg-[#B8905A] selection:text-[#101A2C] font-sans antialiased relative overflow-x-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#B8905A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-[#B8905A]/20 bg-[#1B2A45]/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#B8905A] to-[#D9B98A] flex items-center justify-center text-[#101A2C] font-black text-xl shadow-md ring-2 ring-[#D9B98A]/40">
            🐾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-[#FFFDF9] font-display">
                PetCare <span className="text-[#D9B98A]">ERP</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B8905A]/20 text-[#D9B98A] border border-[#B8905A]/40">
                Enterprise v3.8
              </span>
            </div>
            <p className="text-[11px] text-[#EDE6D6]/60">
              Sistem Terpadu Manajemen Medis, Retail POS, Multi-Cabang & Otorisasi RBAC
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#101A2C] border border-[#B8905A]/30 text-xs text-[#D9B98A]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Server Cloud Siap</span>
            <span className="text-[#EDE6D6]/40">•</span>
            <span className="font-mono text-[11px]">TLS 1.3 / ISO 27001</span>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => closeLoginScreen()}
              className="px-3.5 py-1.5 rounded-lg bg-[#B8905A] hover:bg-[#D9B98A] text-[#101A2C] font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Lanjut ke Aplikasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Core Architecture & Selection (Kepemilikan Usaha, Cabang, Grup & Hak Akses) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Section 1: Kepemilikan Usaha (Business Ownership Model) */}
          <div className="bg-[#1B2A45] rounded-2xl border border-[#B8905A]/30 p-5 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#D9B98A]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#D9B98A]">
                  1. Pilih Kepemilikan Usaha
                </h2>
              </div>
              <span className="text-[11px] text-[#EDE6D6]/60">Sesuaikan profil bisnis</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {OWNERSHIP_MODELS.map((model) => {
                const isSelected = selectedOwnership === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      setSelectedOwnership(model.id);
                      setActiveOwnership(model.id);
                      setErrorMessage('');
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-[#101A2C] border-[#D9B98A] ring-2 ring-[#D9B98A]/50 shadow-md'
                        : 'bg-[#101A2C]/60 border-[#B8905A]/20 hover:bg-[#101A2C]/90 hover:border-[#B8905A]/50'
                    }`}
                  >
                    <span className="text-2xl mt-0.5 shrink-0">{model.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#FFFDF9] truncate">{model.name}</span>
                        {isSelected ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#D9B98A] text-[#101A2C] flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3" /> Dipilih
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#EDE6D6]/50 shrink-0 font-medium">
                            {model.allowedModulesCount} Modul
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#D9B98A] font-medium leading-tight mt-0.5">{model.tagline}</p>
                      <p className="text-[10px] text-[#EDE6D6]/60 line-clamp-2 mt-1 leading-relaxed">
                        {model.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Cabang Usaha (Business Branches & Outlets) */}
          <div className="bg-[#1B2A45] rounded-2xl border border-[#B8905A]/30 p-5 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#D9B98A]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#D9B98A]">
                  2. Pilih Cabang Usaha (Outlet)
                </h2>
              </div>
              <span className="text-[11px] text-[#EDE6D6]/60">Multi-Outlet Sync</span>
            </div>

            <div className="space-y-2">
              <select
                value={selectedBranchId}
                onChange={(e) => {
                  setSelectedBranchId(e.target.value);
                  setActiveBranchId(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#101A2C] border border-[#B8905A]/40 text-[#FFFDF9] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D9B98A] cursor-pointer"
              >
                <option value="b1">🏥 BR-01: Klinik Utama (Pusat) - Jakarta Selatan (24 Jam)</option>
                <option value="b2">🌿 BR-02: Cabang BSD Serpong - Tangerang (Klinik & Pet Shop)</option>
                <option value="b3">🛍️ BR-03: Cabang Kemang Express - Jakarta Selatan (Grooming & Boutique)</option>
                <option value="all">🌐 BR-ALL: Semua Cabang (Konsolidasi Multi-Outlet Holding)</option>
              </select>

              {/* Selected Branch Active Info Card */}
              <div className="p-3 rounded-xl bg-[#101A2C]/80 border border-[#B8905A]/20 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-[#FFFDF9] text-xs">{currentBranchObj.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#B8905A]/20 text-[#D9B98A] text-[10px] font-mono font-bold">
                    {currentBranchObj.code}
                  </span>
                </div>
                <p className="text-[11px] text-[#EDE6D6]/70 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D9B98A] shrink-0" />
                  <span className="truncate">{currentBranchObj.address}</span>
                </p>
                <div className="flex items-center justify-between text-[10px] text-[#EDE6D6]/50 pt-1 border-t border-[#B8905A]/10">
                  <span>📞 {currentBranchObj.phone}</span>
                  <span className="text-emerald-400 font-semibold">● Operasional Aktif</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Grup & Hak Akses (RBAC Permissions Preview) */}
          <div className="bg-[#1B2A45] rounded-2xl border border-[#B8905A]/30 p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D9B98A]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#D9B98A]">
                  3. Grup & Hak Akses (RBAC Matrix)
                </h2>
              </div>
              <button
                onClick={() => setShowRbacModal(true)}
                className="text-[11px] text-[#D9B98A] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Detail Matrix</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#101A2C]/80 border border-[#B8905A]/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FFFDF9]">
                  {currentOwnershipObj.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentOwnershipObj.allowedModulesCount} Modul Diizinkan
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#D9B98A] uppercase tracking-wider">
                  Fitur Utama Terbuka:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentOwnershipObj.highlightModules.map((mod, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-[#1B2A45] text-[#EDE6D6] text-[10px] font-medium border border-[#B8905A]/30 flex items-center gap-1"
                    >
                      <Check className="w-2.5 h-2.5 text-emerald-400" /> {mod}
                    </span>
                  ))}
                </div>
              </div>

              {currentOwnershipObj.hiddenModules.length > 0 && currentOwnershipObj.hiddenModules[0] !== 'Tidak Ada' && (
                <div className="pt-1.5 border-t border-[#B8905A]/10">
                  <p className="text-[10px] text-[#EDE6D6]/50">
                    <span className="font-semibold text-amber-300/80">Menu Terbatas: </span>
                    {currentOwnershipObj.hiddenModules.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Authentication Panel (Credentials, Quick Shift Demo Matrix, PIN Pad) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Auth Container */}
          <div className="bg-[#1B2A45] rounded-2xl border border-[#B8905A]/40 p-6 sm:p-7 shadow-2xl space-y-6">
            
            {/* Header of Auth Box */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#B8905A]/20">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#FFFDF9] font-display">
                  Masuk ke Portal Operasional
                </h1>
                <p className="text-xs text-[#EDE6D6]/70 mt-0.5">
                  Akses modul ERP terintegrasi sesuai kepemilikan dan cabang Anda.
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center bg-[#101A2C] p-1 rounded-xl border border-[#B8905A]/30 shrink-0">
                <button
                  onClick={() => {
                    setActiveTab('credentials');
                    setErrorMessage('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'credentials'
                      ? 'bg-[#B8905A] text-[#101A2C] shadow-xs'
                      : 'text-[#EDE6D6]/70 hover:text-[#FFFDF9]'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Kredensial</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('demoMatrix');
                    setErrorMessage('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'demoMatrix'
                      ? 'bg-[#B8905A] text-[#101A2C] shadow-xs'
                      : 'text-[#EDE6D6]/70 hover:text-[#FFFDF9]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>1-Click Demo</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('pinFast');
                    setErrorMessage('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'pinFast'
                      ? 'bg-[#B8905A] text-[#101A2C] shadow-xs'
                      : 'text-[#EDE6D6]/70 hover:text-[#FFFDF9]'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>PIN Shift</span>
                </button>
              </div>
            </div>

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-rose-300">Gagal Masuk Sistem</p>
                  <p className="text-[11px] text-rose-200/90">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* TAB 1: FORM KREDENSIAL */}
            {activeTab === 'credentials' && (
              <form onSubmit={handleCredentialLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#D9B98A] flex items-center justify-between">
                    <span>Email / Nomor WhatsApp / ID Pengguna</span>
                    <span className="text-[10px] text-[#EDE6D6]/50 font-normal">Contoh: owner.klinik@petcare.id</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#D9B98A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="Masukkan email terdaftar atau nomor WhatsApp"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#101A2C] border border-[#B8905A]/40 text-[#FFFDF9] placeholder-[#EDE6D6]/30 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D9B98A] focus:border-[#D9B98A]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#D9B98A]">Kata Sandi (Password)</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] text-[#D9B98A] hover:underline cursor-pointer"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#D9B98A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi akun"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#101A2C] border border-[#B8905A]/40 text-[#FFFDF9] placeholder-[#EDE6D6]/30 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D9B98A] focus:border-[#D9B98A]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D9B98A]/70 hover:text-[#D9B98A] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick Credentials Chips for Easy Testing */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-bold text-[#EDE6D6]/60 uppercase tracking-wider">
                    Saran Kredensial Cepat:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePrefill('owner.klinik@petcare.id', 'owner_klinik')}
                      className="px-2.5 py-1 rounded-lg bg-[#101A2C] hover:bg-[#101A2C]/80 border border-[#B8905A]/30 text-[11px] text-[#EDE6D6] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      🏥 <strong>Owner Klinik</strong> (drh. Hendrawan)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrefill('owner.petshop@petcare.id', 'owner_petshop')}
                      className="px-2.5 py-1 rounded-lg bg-[#101A2C] hover:bg-[#101A2C]/80 border border-[#B8905A]/30 text-[11px] text-[#EDE6D6] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      🛒 <strong>Owner Petshop</strong> (Rendra P.)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrefill('ananda@petcare.id', 'owner_klinik')}
                      className="px-2.5 py-1 rounded-lg bg-[#101A2C] hover:bg-[#101A2C]/80 border border-[#B8905A]/30 text-[11px] text-[#EDE6D6] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      🩺 <strong>Dokter Hewan</strong> (drh. Ananda)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrefill('ani@petcare.id', 'owner_petshop')}
                      className="px-2.5 py-1 rounded-lg bg-[#101A2C] hover:bg-[#101A2C]/80 border border-[#B8905A]/30 text-[11px] text-[#EDE6D6] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      💳 <strong>Kasir & Front Office</strong> (Ani L.)
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#EDE6D6]/80">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#B8905A] bg-[#101A2C] border-[#B8905A]/40 focus:ring-[#D9B98A]"
                    />
                    <span>Ingat sesi perangkat kerja ini (30 hari)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-[#B8905A] to-[#D9B98A] hover:opacity-95 text-[#101A2C] font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Mengotentikasi Sesi & Otorisasi RBAC...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke {currentBranchObj.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: QUICK DEMO USER MATRIX */}
            {activeTab === 'demoMatrix' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#EDE6D6]/80">
                    Pilih salah satu profil demo untuk langsung masuk tanpa mengetik kredensial:
                  </p>
                  <span className="text-[10px] text-[#D9B98A] font-bold">
                    Filter: {currentOwnershipObj.name}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {filteredUsers.map((demoUser) => {
                    const rInfo = getRoleInfo(demoUser.role);
                    return (
                      <button
                        key={demoUser.id}
                        type="button"
                        onClick={() => handleSelectDemoUser(demoUser)}
                        className="p-3 rounded-xl bg-[#101A2C] hover:bg-[#101A2C]/80 border border-[#B8905A]/30 hover:border-[#D9B98A] text-left transition-all cursor-pointer flex items-start gap-2.5 group shadow-xs"
                      >
                        <div className="w-9 h-9 rounded-lg bg-[#1B2A45] border border-[#B8905A]/40 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                          {rInfo.iconText}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#FFFDF9] truncate group-hover:text-[#D9B98A]">
                              {demoUser.name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-[#B8905A]/20 text-[#D9B98A]">
                              {rInfo.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#EDE6D6]/60 truncate mt-0.5">{demoUser.email}</p>
                          <div className="flex items-center gap-2 mt-1 text-[9px] text-[#D9B98A]">
                            <span>🏢 {demoUser.branchName || currentBranchObj.name}</span>
                            <span>•</span>
                            <span>PIN: {demoUser.pin || '1234'}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl bg-[#101A2C]/60 border border-[#B8905A]/20 text-center">
                  <p className="text-[11px] text-[#EDE6D6]/70">
                    💡 Semua akun demo sudah terkonfigurasi dengan role RBAC, modul aktif, dan log aktivitas otomatis.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: PIN FAST LOGIN / SHIFT HANDOVER */}
            {activeTab === 'pinFast' && (
              <div className="space-y-4 text-center max-w-sm mx-auto">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#FFFDF9]">
                    Otentikasi Cepat Shift & Kasir
                  </p>
                  <p className="text-[11px] text-[#EDE6D6]/60">
                    Masukkan 4 digit PIN otorisasi karyawan untuk pergantian shift kerja cepat.
                  </p>
                </div>

                {/* PIN Display Input */}
                <div className="flex justify-center items-center gap-3 my-3">
                  {[0, 1, 2, 3].map((idx) => {
                    const digit = pinInput[idx];
                    return (
                      <div
                        key={idx}
                        className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-mono font-bold transition-all ${
                          digit
                            ? 'bg-[#101A2C] border-[#D9B98A] text-[#D9B98A] shadow-md'
                            : 'bg-[#101A2C]/60 border-[#B8905A]/30 text-[#EDE6D6]/30'
                        }`}
                      >
                        {digit ? '●' : ''}
                      </div>
                    );
                  })}
                </div>

                {/* Virtual Keypad */}
                <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((keyVal) => (
                    <button
                      key={keyVal}
                      type="button"
                      onClick={() => {
                        if (keyVal === 'C') {
                          setPinInput('');
                        } else if (keyVal === '⌫') {
                          setPinInput((prev) => prev.slice(0, -1));
                        } else {
                          if (pinInput.length < 4) {
                            const nextPin = pinInput + keyVal;
                            setPinInput(nextPin);
                            if (nextPin.length === 4) {
                              handlePinSubmit(nextPin);
                            }
                          }
                        }
                      }}
                      className="h-11 rounded-xl bg-[#101A2C] hover:bg-[#101A2C]/80 active:bg-[#B8905A] active:text-[#101A2C] border border-[#B8905A]/30 text-[#FFFDF9] font-mono font-bold text-base transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      {keyVal}
                    </button>
                  ))}
                </div>

                {/* PIN Quick Demo Hints */}
                <div className="pt-2 text-[10px] text-[#D9B98A] space-x-2">
                  <span>Owner: <strong>1234</strong></span>
                  <span>•</span>
                  <span>Dokter: <strong>2222</strong></span>
                  <span>•</span>
                  <span>Kasir: <strong>3333</strong></span>
                  <span>•</span>
                  <span>Groomer: <strong>4444</strong></span>
                </div>
              </div>
            )}

            {/* Bottom Security Footer */}
            <div className="pt-4 border-t border-[#B8905A]/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#EDE6D6]/60">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enkripsi Sesi End-to-End SHA-256</span>
              </div>
              <div>
                <span>Audit Log ID: <span className="font-mono text-[#D9B98A]">SEC-AUTH-2026</span></span>
              </div>
            </div>

          </div>

          {/* Integration Status Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#1B2A45]/80 border border-[#B8905A]/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                🏥
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[#EDE6D6]/60 font-semibold">Integrasi Medis</p>
                <p className="text-xs font-bold text-[#FFFDF9] truncate">EMR, CPPT & Apotek</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1B2A45]/80 border border-[#B8905A]/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                🛒
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[#EDE6D6]/60 font-semibold">Integrasi Retail</p>
                <p className="text-xs font-bold text-[#FFFDF9] truncate">POS Kasir & Gudang</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1B2A45]/80 border border-[#B8905A]/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D9B98A]/20 text-[#D9B98A] flex items-center justify-center font-bold text-sm shrink-0">
                🌐
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[#EDE6D6]/60 font-semibold">Sinkronisasi Cloud</p>
                <p className="text-xs font-bold text-[#FFFDF9] truncate">Multi-Cabang Realtime</p>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#B8905A]/20 bg-[#1B2A45]/60 py-3 px-4 sm:px-8 text-center text-xs text-[#EDE6D6]/50">
        <p>
          PetCare ERP © 2026 • Sistem Terintegrasi Multi-Cabang, Hak Akses RBAC & Manajemen Kepemilikan Bisnis Klinik Hewan & Pet Shop
        </p>
      </footer>

      {/* MODAL 1: RBAC Full Permission Matrix */}
      {showRbacModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowRbacModal(false)}
        >
          <div
            className="max-w-2xl w-full bg-[#1B2A45] border border-[#B8905A]/40 rounded-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#B8905A]/20">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D9B98A]" />
                <h3 className="font-bold text-base text-[#FFFDF9] font-display">
                  Matrix Otorisasi RBAC & Hak Akses Modul
                </h3>
              </div>
              <button
                onClick={() => setShowRbacModal(false)}
                className="px-2.5 py-1 bg-[#101A2C] hover:bg-[#101A2C]/80 rounded-lg text-xs font-bold text-[#EDE6D6] cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#EDE6D6]/80 leading-relaxed">
                Tabel di bawah merinci hak akses per modul berdasarkan kepemilikan usaha <strong>{currentOwnershipObj.name}</strong> dan peran pengguna:
              </p>

              <div className="border border-[#B8905A]/30 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#101A2C] text-[#D9B98A] font-bold border-b border-[#B8905A]/30">
                    <tr>
                      <th className="p-2.5">Modul Operasional</th>
                      <th className="p-2.5 text-center">Lihat</th>
                      <th className="p-2.5 text-center">Tambah</th>
                      <th className="p-2.5 text-center">Edit</th>
                      <th className="p-2.5 text-center">Hapus</th>
                      <th className="p-2.5 text-center">Otorisasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B8905A]/15 text-[#EDE6D6]">
                    <tr>
                      <td className="p-2.5 font-semibold">Pemeriksaan Klinik & CPPT (SOAP)</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-rose-400 font-bold">✕</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Dokter</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Rekam Medis Terpadu (EMR)</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-rose-400 font-bold">✕</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Dokter</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Pet Shop POS & Kasir Barcode</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-amber-400 font-bold">Otorisasi</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Kasir</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Apotek, Obat Keras & Lab Cito</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-rose-400 font-bold">✕</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Apoteker</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Buku Kas & Keuangan (P&L)</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-rose-400 font-bold">✕</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Owner</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Manajemen Multi-Cabang & SaaS</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓</td>
                      <td className="p-2.5 text-center text-emerald-400 font-bold">✓ Superadmin</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowRbacModal(false)}
                className="px-4 py-2 bg-[#B8905A] hover:bg-[#D9B98A] text-[#101A2C] font-bold rounded-xl text-xs"
              >
                Mengerti & Kembali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Lupa Kata Sandi Simulator */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowForgotModal(false)}
        >
          <div
            className="max-w-md w-full bg-[#1B2A45] border border-[#B8905A]/40 rounded-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-[#FFFDF9] font-bold text-base">
              <KeyRound className="w-5 h-5 text-[#D9B98A]" />
              <span>Reset Kata Sandi via WhatsApp</span>
            </div>

            <p className="text-xs text-[#EDE6D6]/70 leading-relaxed">
              Masukkan nomor WhatsApp atau email terdaftar untuk menerima tautan pemulihan sandi instan.
            </p>

            <input
              type="text"
              value={forgotPhone}
              onChange={(e) => setForgotPhone(e.target.value)}
              placeholder="Contoh: 081233445566 atau owner@petcare.id"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101A2C] border border-[#B8905A]/40 text-[#FFFDF9] text-xs"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-3.5 py-2 rounded-xl bg-[#101A2C] text-xs font-semibold text-[#EDE6D6]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  addToast('Kode OTP verifikasi telah dikirim ke nomor WhatsApp Anda.', 'success');
                  setShowForgotModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#B8905A] text-[#101A2C] font-bold text-xs"
              >
                Kirim Tautan Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
