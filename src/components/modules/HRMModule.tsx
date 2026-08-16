import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { SystemNotificationHeader } from '../common/SystemNotificationHeader';
import {
  Users,
  Calendar,
  DollarSign,
  Award,
  CheckCircle2,
  Clock,
  Briefcase,
  TrendingUp,
  UserCheck,
  Plus,
  Printer,
  FileText,
  X,
  Building2,
  Phone,
  Mail,
  ShieldAlert
} from 'lucide-react';

interface StaffItem {
  id: string;
  name: string;
  role: string;
  sipNumber?: string;
  shift: string;
  branch: string;
  phone: string;
  email: string;
  status: 'Hadir (Piket)' | 'Izin' | 'Cuti' | 'Off';
  checkInTime?: string;
}

export const HRMModule: React.FC = () => {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'roster' | 'commission' | 'attendance'>('roster');

  // Staff list state
  const [staffList, setStaffList] = useState<StaffItem[]>([
    {
      id: 'st1',
      name: 'drh. Budi Santoso',
      role: 'Dokter Hewan Senior',
      sipNumber: '503/SIPVET/DKI/2024/001',
      shift: 'Pagi (08:00 - 16:00)',
      branch: 'Jakarta Selatan',
      phone: '081298765432',
      email: 'budi.santoso@petcare.co.id',
      status: 'Hadir (Piket)',
      checkInTime: '07:55 WIB'
    },
    {
      id: 'st2',
      name: 'drh. Siti Rahma',
      role: 'Dokter Hewan Junior',
      sipNumber: '503/SIPVET/DKI/2025/089',
      shift: 'Siang (13:00 - 21:00)',
      branch: 'Jakarta Selatan',
      phone: '081311223344',
      email: 'siti.rahma@petcare.co.id',
      status: 'Hadir (Piket)',
      checkInTime: '12:50 WIB'
    },
    {
      id: 'st3',
      name: 'Agus Pratama',
      role: 'Senior Groomer',
      sipNumber: '-',
      shift: 'Pagi (08:00 - 16:00)',
      branch: 'Jakarta Barat',
      phone: '085744556677',
      email: 'agus.groomer@petcare.co.id',
      status: 'Hadir (Piket)',
      checkInTime: '08:02 WIB'
    },
    {
      id: 'st4',
      name: 'Dewi Lestari',
      role: 'Perawat Klinik',
      sipNumber: 'STRV-2023-0912',
      shift: 'Siang (13:00 - 21:00)',
      branch: 'Jakarta Selatan',
      phone: '087899001122',
      email: 'dewi.nurse@petcare.co.id',
      status: 'Hadir (Piket)',
      checkInTime: '12:58 WIB'
    }
  ]);

  // Modals state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [selectedSlipStaff, setSelectedSlipStaff] = useState<any>(null);

  // New staff form state
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Dokter Hewan Junior');
  const [newStaffSIP, setNewStaffSIP] = useState('');
  const [newStaffShift, setNewStaffShift] = useState('Pagi (08:00 - 16:00)');
  const [newStaffBranch, setNewStaffBranch] = useState('Jakarta Selatan');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');

  const staffCommissions = [
    {
      staffId: 'st1',
      name: 'drh. Budi Santoso',
      role: 'Dokter Hewan Senior',
      sip: '503/SIPVET/DKI/2024/001',
      baseSalary: 8500000,
      consultsCount: 42,
      consultCommission: 1260000,
      surgeryCount: 5,
      surgeryCommission: 2500000,
      allowance: 1000000,
      deductions: 425000,
      totalPayout: 12835000
    },
    {
      staffId: 'st2',
      name: 'drh. Siti Rahma',
      role: 'Dokter Hewan Junior',
      sip: '503/SIPVET/DKI/2025/089',
      baseSalary: 6500000,
      consultsCount: 28,
      consultCommission: 840000,
      surgeryCount: 2,
      surgeryCommission: 1000000,
      allowance: 750000,
      deductions: 325000,
      totalPayout: 8765000
    },
    {
      staffId: 'st3',
      name: 'Agus Pratama',
      role: 'Senior Groomer',
      sip: '-',
      baseSalary: 4500000,
      consultsCount: 55,
      consultCommission: 1650000,
      surgeryCount: 0,
      surgeryCommission: 0,
      allowance: 500000,
      deductions: 225000,
      totalPayout: 6425000
    },
    {
      staffId: 'st4',
      name: 'Dewi Lestari',
      role: 'Perawat Klinik',
      sip: 'STRV-2023-0912',
      baseSalary: 4200000,
      consultsCount: 0,
      consultCommission: 0,
      surgeryCount: 8,
      surgeryCommission: 800000,
      allowance: 500000,
      deductions: 210000,
      totalPayout: 5290000
    }
  ];

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffPhone) {
      addToast('Harap isi nama dan nomor telepon staf!', 'error');
      return;
    }

    const newStaff: StaffItem = {
      id: `st${Date.now()}`,
      name: newStaffName,
      role: newStaffRole,
      sipNumber: newStaffSIP || '-',
      shift: newStaffShift,
      branch: newStaffBranch,
      phone: newStaffPhone,
      email: newStaffEmail || `${newStaffName.toLowerCase().replace(/\s+/g, '.')}@petcare.co.id`,
      status: 'Hadir (Piket)',
      checkInTime: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')} WIB`
    };

    setStaffList([...staffList, newStaff]);
    setShowAddStaffModal(false);
    setNewStaffName('');
    setNewStaffPhone('');
    setNewStaffSIP('');
    addToast(`Staf baru ${newStaffName} (${newStaffRole}) berhasil ditambahkan!`, 'success');
  };

  const handleViewPaySlip = (sc: any) => {
    setSelectedSlipStaff(sc);
    setShowSlipModal(true);
  };

  const handleSimulatePayout = (staffName: string, amount: number) => {
    addToast(`Penggajian & komisi bulan ini untuk ${staffName} senilai Rp ${amount.toLocaleString('id-ID')} berhasil diproses & dikirim via email!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Compact & Informative SystemNotificationHeader */}
      <SystemNotificationHeader
        icon={Users}
        title="Penjadwalan Shift Kerja, Presensi & Komisi Dokter/Groomer"
        description="Pengaturan roster shift kerja medis, log absensi, serta kalkulasi payroll komisi otomatis berdasarkan jumlah tindakan medis & grooming."
        badges={[
          { label: `${staffList.length} Staf Terdaftar`, variant: 'gold' },
          { label: `${staffList.filter(s => s.status === 'Hadir (Piket)').length} Hadir Piket`, variant: 'emerald' },
          { label: 'Payroll Terintegrasi', variant: 'blue' }
        ]}
        tabs={[
          { id: 'roster', label: 'Shift & Roster', icon: Calendar, count: staffList.length },
          { id: 'attendance', label: 'Absensi & Presensi', icon: Clock },
          { id: 'commission', label: 'Komisi & Slip Gaji', icon: DollarSign }
        ]}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as any)}
      />

      {/* TAB 1: SHIFT ROSTER & STAFF DIRECTORY */}
      {activeTab === 'roster' && (
        <div className="bg-[#FFFDF9] rounded-xl border border-[#E1D6BE] p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1D6BE] pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#1B2A45] font-display flex items-center gap-2">
                <Users className="w-4 h-4 text-[#B8905A]" /> Roster Penjadwalan Shift Kerja Mingguan
              </h3>
              <p className="text-xs text-[#6B6656] mt-0.5">
                Piket Dokter Hewan, Perawat, dan Groomer Aktif Cabang Klinik
              </p>
            </div>

            <button
              onClick={() => setShowAddStaffModal(true)}
              className="px-3.5 py-2 bg-[#1B2A45] hover:bg-[#101A2C] text-[#FFFDF9] font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center gap-1.5 w-fit"
            >
              <Plus className="w-4 h-4 text-[#D9B98A]" /> Tambah Staf / Dokter Baru
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#22242B]">
              <thead className="bg-[#F6F1E6] text-[#1B2A45] font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Nama Staf / Dokter</th>
                  <th className="p-3">Jabatan & No. SIP</th>
                  <th className="p-3">Shift Kerja</th>
                  <th className="p-3">Cabang Klinik</th>
                  <th className="p-3">Kontak WA</th>
                  <th className="p-3">Status Presensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1D6BE]">
                {staffList.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3 font-bold text-[#1B2A45]">
                      <div>{s.name}</div>
                      <div className="text-[10px] text-[#6B6656] font-normal">{s.email}</div>
                    </td>
                    <td className="p-3 font-medium">
                      <div>{s.role}</div>
                      {s.sipNumber && s.sipNumber !== '-' && (
                        <div className="text-[10px] text-[#B8905A] font-mono font-bold">SIP: {s.sipNumber}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded bg-[#E1D6BE]/40 text-[#1B2A45] font-bold text-[11px] flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3 text-[#B8905A]" /> {s.shift}
                      </span>
                    </td>
                    <td className="p-3">{s.branch}</td>
                    <td className="p-3 font-mono">{s.phone}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {s.status} ({s.checkInTime})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE & PRESENCE LOGS */}
      {activeTab === 'attendance' && (
        <div className="bg-[#FFFDF9] rounded-xl border border-[#E1D6BE] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E1D6BE] pb-2">
            <h3 className="font-bold text-sm text-[#1B2A45] font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#B8905A]" /> Log Presensi Masuk & Keluar Hari Ini
            </h3>
            <span className="text-xs text-[#6B6656] font-bold">Tanggal: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#F6F1E6] p-4 rounded-xl border border-[#E1D6BE] text-center space-y-1">
              <span className="text-[11px] text-[#6B6656] font-bold block uppercase">Total Dokter / Staf</span>
              <span className="text-2xl font-extrabold text-[#1B2A45]">{staffList.length} Orang</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center space-y-1">
              <span className="text-[11px] text-emerald-800 font-bold block uppercase">Hadir Tepat Waktu</span>
              <span className="text-2xl font-extrabold text-emerald-700">{staffList.length} Orang</span>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center space-y-1">
              <span className="text-[11px] text-amber-800 font-bold block uppercase">Terlambat / Izin</span>
              <span className="text-2xl font-extrabold text-amber-700">0 Orang</span>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center space-y-1">
              <span className="text-[11px] text-blue-800 font-bold block uppercase">Cuti Tahunan</span>
              <span className="text-2xl font-extrabold text-blue-700">0 Orang</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#22242B]">
              <thead className="bg-[#F6F1E6] text-[#1B2A45] font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Nama Staf</th>
                  <th className="p-3">Jabatan</th>
                  <th className="p-3">Jam Masuk (Check-In)</th>
                  <th className="p-3">Lokasi Cabang</th>
                  <th className="p-3">Keterangan Presensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1D6BE]">
                {staffList.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3 font-bold text-[#1B2A45]">{s.name}</td>
                    <td className="p-3">{s.role}</td>
                    <td className="p-3 font-mono font-bold text-[#1B2A45]">{s.checkInTime}</td>
                    <td className="p-3">{s.branch}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Tepat Waktu
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COMMISSION & PAYROLL */}
      {activeTab === 'commission' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffCommissions.map((sc) => (
              <div key={sc.staffId} className="bg-[#FFFDF9] rounded-xl border border-[#E1D6BE] p-5 shadow-2xs space-y-3">
                <div className="flex justify-between items-start border-b border-[#E1D6BE] pb-2">
                  <div>
                    <h4 className="font-bold text-sm text-[#1B2A45]">{sc.name}</h4>
                    <p className="text-xs text-[#6B6656]">{sc.role}</p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-[#1B2A45] text-[#D9B98A] text-[10px] font-bold rounded">
                    Periode Agustus 2026
                  </span>
                </div>

                <div className="text-xs space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-[#6B6656]">Gaji Pokok:</span>
                    <span className="font-bold text-[#1B2A45]">Rp {sc.baseSalary.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6656]">Komisi Pemeriksaan/Grooming ({sc.consultsCount}x):</span>
                    <span className="font-semibold text-emerald-700">+ Rp {sc.consultCommission.toLocaleString('id-ID')}</span>
                  </div>
                  {sc.surgeryCount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#6B6656]">Komisi Tindakan Operasi ({sc.surgeryCount}x):</span>
                      <span className="font-semibold text-emerald-700">+ Rp {sc.surgeryCommission.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-rose-700">
                    <span className="text-[#6B6656]">Potongan (BPJS / PPh21):</span>
                    <span>- Rp {sc.deductions.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#E1D6BE] text-sm">
                    <span className="font-bold text-[#1B2A45]">Take Home Pay (THP):</span>
                    <span className="font-extrabold text-[#1B2A45]">Rp {sc.totalPayout.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleViewPaySlip(sc)}
                    className="py-2 bg-[#F6F1E6] hover:bg-[#E1D6BE]/60 text-[#1B2A45] font-bold text-xs rounded-lg border border-[#E1D6BE] transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-4 h-4 text-[#B8905A]" /> Rincian Slip Gaji
                  </button>
                  <button
                    onClick={() => handleSimulatePayout(sc.name, sc.totalPayout)}
                    className="py-2 bg-[#1B2A45] hover:bg-[#101A2C] text-[#FFFDF9] font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <DollarSign className="w-4 h-4 text-[#D9B98A]" /> Cairkan Gaji
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddStaffModal(false);
          }}
        >
          <div 
            className="max-w-md w-full bg-[#FFFDF9] rounded-2xl border border-[#E1D6BE] p-6 space-y-4 shadow-2xl text-[#22242B] cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#E1D6BE] pb-3">
              <h3 className="font-extrabold text-base text-[#1B2A45] font-display">Tambah Staf / Dokter Baru</h3>
              <button onClick={() => setShowAddStaffModal(false)} className="text-[#6B6656] hover:text-[#1B2A45]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6B6656] font-bold mb-1">Nama Lengkap & Gelar:</label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="Contoh: drh. Ananda Putri"
                  className="w-full px-3 py-2 bg-[#F6F1E6] border border-[#E1D6BE] rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block text-[#6B6656] font-bold mb-1">Jabatan / Role:</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F1E6] border border-[#E1D6BE] rounded-lg font-medium"
                >
                  <option value="Dokter Hewan Senior">Dokter Hewan Senior</option>
                  <option value="Dokter Hewan Junior">Dokter Hewan Junior</option>
                  <option value="Perawat Klinik">Perawat Klinik</option>
                  <option value="Senior Groomer">Senior Groomer</option>
                  <option value="Kasir & Receptionist">Kasir & Receptionist</option>
                </select>
              </div>

              <div>
                <label className="block text-[#6B6656] font-bold mb-1">Nomor SIP/STRV (Khusus Medis):</label>
                <input
                  type="text"
                  value={newStaffSIP}
                  onChange={(e) => setNewStaffSIP(e.target.value)}
                  placeholder="503/SIPVET/..."
                  className="w-full px-3 py-2 bg-[#F6F1E6] border border-[#E1D6BE] rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6B6656] font-bold mb-1">Shift Kerja:</label>
                  <select
                    value={newStaffShift}
                    onChange={(e) => setNewStaffShift(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F1E6] border border-[#E1D6BE] rounded-lg font-medium"
                  >
                    <option value="Pagi (08:00 - 16:00)">Pagi (08:00 - 16:00)</option>
                    <option value="Siang (13:00 - 21:00)">Siang (13:00 - 21:00)</option>
                    <option value="Malam (21:00 - 08:00)">Malam / Full Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#6B6656] font-bold mb-1">Cabang Penempatan:</label>
                  <select
                    value={newStaffBranch}
                    onChange={(e) => setNewStaffBranch(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F1E6] border border-[#E1D6BE] rounded-lg font-medium"
                  >
                    <option value="Jakarta Selatan">Jakarta Selatan</option>
                    <option value="Jakarta Barat">Jakarta Barat</option>
                    <option value="Tangerang Selatan">Tangerang Selatan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#6B6656] font-bold mb-1">Nomor WA / Telepon:</label>
                <input
                  type="text"
                  required
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-3 py-2 bg-[#F6F1E6] border border-[#E1D6BE] rounded-lg font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E1D6BE]">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 bg-[#F6F1E6] hover:bg-[#E1D6BE]/50 text-[#1B2A45] font-bold text-xs rounded-lg border border-[#E1D6BE]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B2A45] hover:bg-[#101A2C] text-[#FFFDF9] font-bold text-xs rounded-lg shadow-md"
                >
                  Simpan Staf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Slip Modal */}
      {showSlipModal && selectedSlipStaff && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSlipModal(false);
          }}
        >
          <div 
            className="max-w-md w-full bg-[#FFFDF9] rounded-2xl border border-[#E1D6BE] p-6 space-y-4 shadow-2xl text-[#22242B] cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b-2 border-[#1B2A45] pb-3 flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-sm text-[#1B2A45] font-display">SLIP GAJI RESMI PETCARE ERP</h3>
                <p className="text-[11px] text-[#6B6656]">Periode: Agustus 2026</p>
              </div>
              <Building2 className="w-8 h-8 text-[#1B2A45]" />
            </div>

            <div className="bg-[#F6F1E6] p-3 rounded-xl border border-[#E1D6BE] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#6B6656]">Nama Karyawan:</span>
                <span className="font-bold text-[#1B2A45]">{selectedSlipStaff.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6656]">Jabatan:</span>
                <span>{selectedSlipStaff.role}</span>
              </div>
              {selectedSlipStaff.sip && selectedSlipStaff.sip !== '-' && (
                <div className="flex justify-between font-mono text-[10px] text-[#B8905A]">
                  <span>No. SIP:</span>
                  <span>{selectedSlipStaff.sip}</span>
                </div>
              )}
            </div>

            <div className="text-xs space-y-2 border-t border-b border-[#E1D6BE] py-3">
              <div className="flex justify-between font-bold text-[#1B2A45]">
                <span>Penerimaan (Earnings):</span>
                <span></span>
              </div>
              <div className="flex justify-between pl-3 text-[#6B6656]">
                <span>• Gaji Pokok</span>
                <span>Rp {selectedSlipStaff.baseSalary.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between pl-3 text-[#6B6656]">
                <span>• Komisi Konsultasi Medis ({selectedSlipStaff.consultsCount}x)</span>
                <span>Rp {selectedSlipStaff.consultCommission.toLocaleString('id-ID')}</span>
              </div>
              {selectedSlipStaff.surgeryCount > 0 && (
                <div className="flex justify-between pl-3 text-[#6B6656]">
                  <span>• Komisi Tindakan Operasi ({selectedSlipStaff.surgeryCount}x)</span>
                  <span>Rp {selectedSlipStaff.surgeryCommission.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between pl-3 text-[#6B6656]">
                <span>• Tunjangan Jabatan & Transport</span>
                <span>Rp {selectedSlipStaff.allowance.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between font-bold text-rose-800 pt-2 border-t border-dashed border-[#E1D6BE]">
                <span>Potongan (Deductions):</span>
                <span></span>
              </div>
              <div className="flex justify-between pl-3 text-rose-700">
                <span>• PPh21 & BPJS Ketenagakerjaan</span>
                <span>- Rp {selectedSlipStaff.deductions.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-[#1B2A45] pt-3 border-t border-[#1B2A45]">
                <span>TAKE HOME PAY (NET):</span>
                <span>Rp {selectedSlipStaff.totalPayout.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSlipModal(false)}
                className="px-4 py-2 bg-[#F6F1E6] hover:bg-[#E1D6BE]/50 text-[#1B2A45] font-bold text-xs rounded-lg border border-[#E1D6BE]"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowSlipModal(false);
                }}
                className="px-5 py-2 bg-[#1B2A45] hover:bg-[#101A2C] text-[#FFFDF9] font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-[#D9B98A]" /> Cetak Slip Gaji
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
