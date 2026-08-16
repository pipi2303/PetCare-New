import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { SystemNotificationHeader } from '../common/SystemNotificationHeader';
import {
  Hotel,
  CheckCircle2,
  Clock,
  Utensils,
  Pill,
  Sparkles,
  UserCheck,
  AlertCircle,
  Plus
} from 'lucide-react';

export const PetHotelCageModule: React.FC = () => {
  const { pets = [], hotelBookings = [] } = useData();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'grid' | 'treatment'>('grid');

  // Cage grid state
  const [cages, setCages] = useState([
    { id: 'c1', name: 'Kandang A1 (Kucing)', type: 'Cat Deluxe', status: 'Terisi', petName: 'Mimi', owner: 'Budi Santoso', checkIn: '2026-08-10', checkOut: '2026-08-15' },
    { id: 'c2', name: 'Kandang A2 (Kucing)', type: 'Cat Deluxe', status: 'Kosong', petName: '-', owner: '-', checkIn: '-', checkOut: '-' },
    { id: 'c3', name: 'Kandang B1 (Anjing)', type: 'Dog Suite', status: 'Terisi', petName: 'Rocky', owner: 'Siti Aminah', checkIn: '2026-08-09', checkOut: '2026-08-14' },
    { id: 'c4', name: 'Kandang B2 (Anjing)', type: 'Dog Suite', status: 'Perlu Dibersihkan', petName: '-', owner: '-', checkIn: '-', checkOut: '-' },
    { id: 'c5', name: 'VIP Suite 1', type: 'VIP Climate Controlled', status: 'Terisi', petName: 'Luna', owner: 'Dewi Lestari', checkIn: '2026-08-11', checkOut: '2026-08-18' },
    { id: 'c6', name: 'Kandang Isolasi / ICU', type: 'Medical Inpatient', status: 'Terisi', petName: 'Milo', owner: 'Rudi Hermawan', checkIn: '2026-08-11', checkOut: '2026-08-13' }
  ]);

  // Treatment / Feeding Log state
  const [treatmentLogs, setTreatmentLogs] = useState([
    { id: 't1', petName: 'Mimi', room: 'Kandang A1', task: 'Pemberian Makanan Basah (Wet Food Royal Canin)', time: '08:00 AM', status: 'Selesai', operator: 'Perawat Dewi' },
    { id: 't2', petName: 'Mimi', room: 'Kandang A1', task: 'Obat Cacing Oral (1 Tablet)', time: '12:00 PM', status: 'Selesai', operator: 'drh. Budi' },
    { id: 't3', petName: 'Rocky', room: 'Kandang B1', task: 'Pemberian Makan Siang & Ganti Air Minum', time: '12:30 PM', status: 'Selesai', operator: 'Perawat Dewi' },
    { id: 't4', petName: 'Luna', room: 'VIP Suite 1', task: 'Sesi Walking & Grooming Ringan', time: '04:00 PM', status: 'Menunggu', operator: 'Groomer Agus' }
  ]);

  const handleCleanCage = (cageId: string) => {
    setCages(
      cages.map((c) => (c.id === cageId ? { ...c, status: 'Kosong' } : c))
    );
    addToast('Kandang berhasil dibersihkan & disterilkan. Siap untuk check-in baru!', 'success');
  };

  const handleToggleTask = (taskId: string) => {
    setTreatmentLogs(
      treatmentLogs.map((t) =>
        t.id === taskId ? { ...t, status: t.status === 'Selesai' ? 'Menunggu' : 'Selesai' } : t
      )
    );
    addToast('Status jadwal perawatan harian berhasil diperbarui.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Compact & Informative SystemNotificationHeader */}
      <SystemNotificationHeader
        icon={Hotel}
        title="Denah Visual Grid Kandang & Treatment Log Harian"
        description="Denah interaktif status keterisian kandang Pet Hotel / Rawat Inap dan jadwal kontrol pakan & obat perawat harian."
        badges={[
          { label: `${cages.filter(c => c.status === 'Terisi').length}/${cages.length} Kandang Terisi`, variant: 'gold' },
          { label: `${cages.filter(c => c.status === 'Kosong').length} Kosong Ready`, variant: 'emerald' },
          { label: `${treatmentLogs.filter(t => t.status === 'Menunggu').length} Jadwal Pending`, variant: 'amber' }
        ]}
        tabs={[
          { id: 'grid', label: 'Layout Visual Kandang', icon: Hotel, count: cages.length },
          { id: 'treatment', label: 'Daily Treatment & Feeding Log', icon: Utensils, count: treatmentLogs.length }
        ]}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as any)}
      />

      {activeTab === 'grid' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cages.map((cage) => {
              const isOccupied = cage.status === 'Terisi';
              const needsCleaning = cage.status === 'Perlu Dibersihkan';

              return (
                <div
                  key={cage.id}
                  className={`rounded-2xl p-5 border space-y-3 shadow-2xs transition-all ${
                    isOccupied
                      ? 'bg-[#1B2A45] text-[#FFFDF9] border-[#B8905A]/40'
                      : needsCleaning
                      ? 'bg-amber-500/10 border-amber-500/30 text-[#1B2A45]'
                      : 'bg-[#FFFDF9] border-[#E1D6BE] text-[#1B2A45]'
                  }`}
                >
                  <div className="flex justify-between items-center border-b pb-2 border-current/20">
                    <span className="font-bold text-sm">{cage.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isOccupied
                          ? 'bg-[#B8905A] text-[#FFFDF9]'
                          : needsCleaning
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {cage.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="opacity-80">Tipe: <strong>{cage.type}</strong></p>
                    {isOccupied && (
                      <>
                        <p className="text-sm font-bold text-[#D9B98A]">Anabul: {cage.petName}</p>
                        <p className="opacity-80">Pemilik: {cage.owner}</p>
                        <p className="text-[10px] opacity-70 pt-1">
                          Periode: {cage.checkIn} s/d {cage.checkOut}
                        </p>
                      </>
                    )}
                  </div>

                  {needsCleaning && (
                    <button
                      onClick={() => handleCleanCage(cage.id)}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Sterilkan & Bersihkan
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'treatment' && (
        <div className="bg-[#FFFDF9] rounded-xl border border-[#E1D6BE] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E1D6BE] pb-2">
            <h3 className="font-bold text-sm text-[#1B2A45] font-display flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#B8905A]" /> Lembar Kontrol Pakan, Obat & Perawatan Pasien Rawat Inap
            </h3>
          </div>

          <div className="divide-y divide-[#E1D6BE]">
            {treatmentLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1B2A45]">{log.petName}</span>
                    <span className="text-[#6B6656]">({log.room})</span>
                    <span className="text-[#B8905A] font-mono font-bold">{log.time}</span>
                  </div>
                  <p className="text-[#22242B] font-medium mt-0.5">{log.task}</p>
                  <p className="text-[10px] text-[#6B6656]">Petugas: {log.operator}</p>
                </div>

                <button
                  onClick={() => handleToggleTask(log.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    log.status === 'Selesai'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-[#1B2A45] text-[#FFFDF9]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {log.status === 'Selesai' ? 'Sudah Diberikan' : 'Tandai Selesai'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
