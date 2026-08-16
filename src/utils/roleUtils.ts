import { UserRole } from '../types';

export interface RoleProfileInfo {
  role: UserRole;
  label: string;
  businessType: string;
  badge: string;
  color: string;
  badgeBg: string;
  iconText: string;
  desc: string;
  allowedModulesSummary: string[];
  hiddenModulesSummary: string[];
}

export const ROLE_PROFILES_INFO: Record<string, RoleProfileInfo> = {
  owner_klinik: {
    role: 'owner_klinik',
    label: 'Owner Klinik',
    businessType: 'Praktek Medis & RS Hewan',
    badge: '🏥 Owner Klinik',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    iconText: '🏥',
    desc: 'Kepemilikan khusus Klinik Hewan & Rumah Sakit Vet. Mengelola pemeriksaan dokter, rekam medis EMR, apotek, rawat inap, lab, dan keuangan medis.',
    allowedModulesSummary: ['Dashboard', 'Pelanggan & Hewan', 'Booking Antrian', 'Pemeriksaan Medis (CPPT)', 'Rekam Medis (EMR)', 'Vaksin & Paspor', 'Apotek & Lab', 'Care Plan', 'E-Form Consent', 'Stok & Gudang Obat', 'Purchasing Medis', 'Billing Medis', 'Buku Kas & Keuangan', 'SDM & Shift Dokter', 'CRM Pengingat Kontrol', 'Laporan & AI Vet'],
    hiddenModulesSummary: ['Pet Shop (POS Retail)', 'Grooming Salon & Spa', 'Pet Hotel Boarding']
  },
  owner_petshop: {
    role: 'owner_petshop',
    label: 'Owner Petshop',
    businessType: 'Pet Shop Retail & Pakan',
    badge: '🛒 Owner Petshop',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    iconText: '🛒',
    desc: 'Kepemilikan Toko Retail Pet Shop, Pakan, Aksesoris & Perlengkapan Hewan. Mengelola kasir POS barcode, persediaan stok barang, purchasing supplier, dan loyalitas pelanggan.',
    allowedModulesSummary: ['Dashboard Retail', 'Pelanggan Member & Supplier', 'Pet Shop POS Kasir', 'Stok Gudang & Opname', 'Purchasing PO Supplier', 'Billing & Struk Kasir', 'Buku Kas & Keuangan Toko', 'SDM Kasir/Gudang', 'CRM Loyalitas & Poin', 'Laporan Penjualan Retail', 'Cabang Toko & Pengaturan'],
    hiddenModulesSummary: ['Semua Modul Medis (Pemeriksaan, EMR, Apotek, Vaksin, Care Plan, E-Form)', 'Layanan Medis (Booking Dokter, Telehealth, Ambulance, AI Vet)', 'Grooming Salon & Pet Hotel']
  },
  owner_petcare: {
    role: 'owner_petcare',
    label: 'Owner PetCare',
    businessType: 'One-Stop Integrated Ecosystem',
    badge: '🐾 Owner PetCare (All-in-One)',
    color: 'text-[#D9B98A]',
    badgeBg: 'bg-[#D9B98A]/20 text-[#D9B98A] border border-[#B8905A]/40',
    iconText: '🐾',
    desc: 'Kepemilikan Ekosistem Terpadu One-Stop Pet Care: Klinik Medis + Pet Shop Retail + Grooming Salon + Pet Hotel Boarding terintegrasi penuh.',
    allowedModulesSummary: ['Akses Penuh Seluruh 28 Modul Operasional (Klinik, Toko POS, Grooming, Hotel, Purchasing, EMR, Farmasi, Keuangan, dsb.)'],
    hiddenModulesSummary: ['Tidak Ada (Akses 100% Seluruh Fitur ERP)']
  },
  owner: {
    role: 'owner',
    label: 'Owner Klinik',
    businessType: 'Praktek Medis & RS Hewan',
    badge: '🏥 Owner Klinik',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    iconText: '🏥',
    desc: 'Kepemilikan khusus Klinik Hewan & Rumah Sakit Vet.',
    allowedModulesSummary: ['Dashboard', 'Pelanggan & Hewan', 'Booking Antrian', 'Pemeriksaan Medis', 'Rekam Medis (EMR)', 'Apotek & Lab', 'Billing & Keuangan', 'Laporan & AI Vet'],
    hiddenModulesSummary: ['Pet Shop (POS Retail)', 'Grooming Salon & Spa', 'Pet Hotel Boarding']
  },
  dokter: {
    role: 'dokter',
    label: 'Dokter Hewan',
    businessType: 'Poliklinik Medis',
    badge: '🩺 Dokter Hewan',
    color: 'text-blue-400',
    badgeBg: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    iconText: '🩺',
    desc: 'Pemeriksaan fisik, diagnosa SOAP ICD-10, rekam medis EMR, tindakan, dan peresepan obat.',
    allowedModulesSummary: ['Dashboard Medis', 'Data Pasien Hewan', 'Booking Antrian', 'Pemeriksaan Klinik & CPPT', 'Rekam Medis EMR', 'Apotek & Lab', 'Vaksinasi', 'AI Vet Assistant'],
    hiddenModulesSummary: ['Pet Shop POS', 'Grooming', 'Pet Hotel', 'Buku Kas & Keuangan', 'Purchasing', 'HRM', 'Pengaturan Sistem']
  },
  kasir: {
    role: 'kasir',
    label: 'Kasir & Front Office',
    businessType: 'Front Office & Kasir POS',
    badge: '💳 Kasir & POS',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    iconText: '💳',
    desc: 'Transaksi kasir POS toko, penerimaan pembayaran invoice klinik/petshop, dan pencatatan kas harian.',
    allowedModulesSummary: ['Dashboard Kasir', 'Master Pelanggan', 'Pet Shop POS', 'Billing & Kasir', 'Stok & Gudang Kasir', 'Pet Hotel Reservasi'],
    hiddenModulesSummary: ['Modul Medis Dokter (EMR, CPPT, Vaksinasi)', 'Purchasing PO', 'Buku Kas Akuntansi', 'SDM HRM', 'Pengaturan Sistem']
  },
  groomer: {
    role: 'groomer',
    label: 'Senior Groomer',
    businessType: 'Salon & Spa Hewan',
    badge: '✂️ Groomer Salon',
    color: 'text-pink-400',
    badgeBg: 'bg-pink-500/15 text-pink-300 border border-pink-500/30',
    iconText: '✂️',
    desc: 'Layanan grooming salon, spa, potong kuku, styling, dan dokumentasi foto sebelum/sesudah.',
    allowedModulesSummary: ['Dashboard', 'Grooming Salon & Spa', 'Pet Hotel Boarding', 'Galeri Foto Pasien'],
    hiddenModulesSummary: ['Modul Medis Dokter', 'Pet Shop POS', 'Purchasing', 'Buku Kas Keuangan', 'HRM', 'Pengaturan Sistem']
  },
  admin: {
    role: 'admin',
    label: 'Admin Sistem',
    businessType: 'Tata Usaha & Admin Operasional',
    badge: '🛠️ Administrator',
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
    iconText: '🛠️',
    desc: 'Pengelolaan master data, user staff, jadwal shift, dan laporan operasional.',
    allowedModulesSummary: ['Hampir Seluruh Modul Operasional & Tata Usaha'],
    hiddenModulesSummary: ['SaaS Superadmin Tenant Management']
  },
  superadmin: {
    role: 'superadmin',
    label: 'Super Admin SaaS',
    businessType: 'Multi-Tenant Master Control',
    badge: '👑 Superadmin SaaS',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    iconText: '👑',
    desc: 'Pengawasan platform SaaS multi-tenant, kuota lisensi klinik, dan audit sistem tingkat lanjut.',
    allowedModulesSummary: ['Seluruh 28 Modul ERP + Modul SaaS Superadmin Tenant'],
    hiddenModulesSummary: ['Tidak Ada']
  },
  pemilik: {
    role: 'pemilik',
    label: 'Pemilik Hewan (Client)',
    businessType: 'Portal Pemilik Hewan',
    badge: '🐕 Client Pemilik',
    color: 'text-teal-400',
    badgeBg: 'bg-teal-500/15 text-teal-300 border border-teal-500/30',
    iconText: '🐕',
    desc: 'Portal klien untuk melihat rekam medis hewan peliharaan, paspor digital vaksinasi, dan booking online.',
    allowedModulesSummary: ['Booking Online', 'Paspor & Riwayat Vaksinasi', 'Notifikasi & Pengingat'],
    hiddenModulesSummary: ['Seluruh Modul ERP Internal']
  }
};

export const getRoleInfo = (role?: string): RoleProfileInfo => {
  if (!role) return ROLE_PROFILES_INFO.owner_klinik;
  return ROLE_PROFILES_INFO[role] || {
    role: role as UserRole,
    label: role,
    businessType: 'Pengguna Sistem',
    badge: role,
    color: 'text-slate-400',
    badgeBg: 'bg-slate-500/15 text-slate-300 border border-slate-500/30',
    iconText: '👤',
    desc: 'Profil akun terdaftar.',
    allowedModulesSummary: ['Akses Standar'],
    hiddenModulesSummary: []
  };
};
