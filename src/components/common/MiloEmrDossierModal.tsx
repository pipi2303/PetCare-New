import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  FileText,
  AlertTriangle,
  HeartPulse,
  Activity,
  Calendar,
  Stethoscope,
  Pill,
  User,
  ShieldAlert,
  ChevronRight,
  Copy,
  CheckCircle2,
  Scale,
  Syringe,
  MessageSquare,
  Calculator,
  BookOpen,
  ArrowRight,
  Check,
  Eye,
  Info
} from 'lucide-react';
import { Pet, ClinicVisit, SOAPNote, MedicalRecord, VacHistory, Inpatient, DischargeNote } from '../../types';

interface MiloEmrDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadScenario: (scenario: 'full' | 'gastritis' | 'otitis' | 'allergy' | 'wellness', autoAnalyze?: boolean) => void;
  onSwitchTab?: (tab: 'historySoap' | 'chat' | 'calculator' | 'soap' | 'triage' | 'education', payload?: any) => void;
  pet: Pet;
  visits: ClinicVisit[];
  soaps: SOAPNote[];
  medicalRecords: MedicalRecord[];
  vacHistories: VacHistory[];
  inpatients: Inpatient[];
  dischargeNotes: DischargeNote[];
}

export const MiloEmrDossierModal: React.FC<MiloEmrDossierModalProps> = ({
  isOpen,
  onClose,
  onLoadScenario,
  onSwitchTab,
  pet,
  visits,
  soaps,
  medicalRecords,
  vacHistories,
  inpatients,
  dischargeNotes
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'vitals' | 'prescriptions' | 'allergies' | 'scenarios'>('timeline');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const miloVisits = visits.filter((v) => v.petId === pet.id || v.petName?.toLowerCase().includes('milo'));
  const miloSoaps = soaps.filter((s) => s.petId === pet.id);
  const miloRecords = medicalRecords.filter((m) => m.petId === pet.id);
  const miloVaccines = vacHistories.filter((v) => v.petId === pet.id);

  // Vitals progression data for Milo
  const vitalsHistory = [
    { date: '10/08/2025', weight: 26.9, temp: 38.3, hr: 90, rr: 22, bp: '116/76', context: 'Registrasi & Microchip' },
    { date: '04/11/2025', weight: 27.5, temp: 38.5, hr: 95, rr: 20, bp: '120/80', context: 'Vaksinasi DHPPi+L' },
    { date: '10/02/2026', weight: 27.8, temp: 38.9, hr: 110, rr: 28, bp: '125/82', context: 'Gastritis Akut Ringan' },
    { date: '18/05/2026', weight: 28.2, temp: 38.4, hr: 92, rr: 22, bp: '118/78', context: 'Check-Up Rutin BCS 5/9' },
    { date: '11/08/2026', weight: 28.5, temp: 38.6, hr: 98, rr: 24, bp: '120/80', context: 'Vaksin Rabies & Otitis Dextra' },
  ];

  // Prescriptions administered
  const prescriptionHistory = [
    { drug: 'Otopain Ear Drops 10ml', date: '11/08/2026', dose: '3 tetes 2x/hari (5 hari)', doctor: 'drh. Ananda Putri', status: 'Selesai - Efikasi Baik' },
    { drug: 'Vaksin Defensor 3 (Rabies)', date: '11/08/2026', dose: '1 mL IM (Dosis Tunggal)', doctor: 'drh. Ananda Putri', status: 'Imunisasi Lengkap' },
    { drug: 'Sucralfate Sirup 100ml', date: '10/02/2026', dose: '5 mL 2x1 hari ac (3 hari)', doctor: 'drh. Ananda Putri', status: 'Selesai - Gejala Mereda' },
    { drug: 'Vaksin Nobivac DHPPi+L', date: '04/11/2025', dose: '1 mL SC (Booster)', doctor: 'drh. Ananda Putri', status: 'Imunisasi Lengkap' },
    { drug: 'Drontal Plus Dog', date: '10/08/2025', dose: '2 tablet per oral', doctor: 'drh. Ananda Putri', status: 'Pencegahan Parasit' },
  ];

  const handleCopySummary = () => {
    const summary = `=== DOSSIER REKAM MEDIS TERPADU: ${pet.name.toUpperCase()} ===
Spesies: ${pet.species} | Ras: ${pet.breed} | Bobot: ${pet.weightKg} kg
Pemilik: ${pet.customerName} (Member Platinum)
Riwayat Alergi: ${pet.allergies}
Microchip No: ${pet.microchipNo}

Histori Kunjungan:
1. 11/08/2026: Otitis Externa Dextra & Vaksin Rabies Defensor 3
2. 18/05/2026: General Check-up (BCS 5/9)
3. 10/02/2026: Gastritis Akut pasca makan rumput/sampah (Terapi Sucralfate)
4. 04/11/2025: Vaksinasi DHPPi+L
5. 10/08/2025: Registrasi Microchip & Deworming Drontal Plus`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFDF9] rounded-2xl border-2 border-[#B8905A] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header Bar */}
        <div className="bg-[#1B2A45] p-5 text-[#FFFDF9] border-b border-[#B8905A]/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#B8905A] bg-[#101A2C] shrink-0">
              <img
                src={pet.photoUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400'}
                alt={pet.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-[#B8905A]/30 text-[#D9B98A] border border-[#B8905A]/40 text-[10px] font-bold uppercase tracking-wider">
                  Contoh Pasien Utama EMR
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400" /> Alergi: Amoxicillin & Ayam
                </span>
              </div>
              <h2 className="text-xl font-bold font-display text-[#FFFDF9] mt-0.5 flex items-center gap-2">
                {pet.name} <span className="text-sm font-normal text-[#EDE6D6]/80">({pet.species} - {pet.breed})</span>
              </h2>
              <p className="text-xs text-[#EDE6D6]/70">
                Pemilik: <strong className="text-[#D9B98A]">{pet.customerName}</strong> • Usia: 4 Thn (10/03/2022) • BB: <strong>{pet.weightKg} kg</strong> • Chip: {pet.microchipNo}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#EDE6D6] hover:bg-[#101A2C] hover:text-[#FFFDF9] transition-all"
            title="Tutup Dossier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#F6F1E6] px-5 py-2 border-b border-[#E1D6BE] flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'bg-[#1B2A45] text-[#FFFDF9] shadow-2xs'
                  : 'text-[#6B6656] hover:bg-[#E1D6BE]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Timeline Kunjungan ({vitalsHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'scenarios'
                  ? 'bg-[#1B2A45] text-[#FFFDF9] shadow-2xs'
                  : 'text-[#6B6656] hover:bg-[#E1D6BE]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B8905A]" /> Kasus & Skenario Klinis
            </button>
            <button
              onClick={() => setActiveTab('vitals')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'vitals'
                  ? 'bg-[#1B2A45] text-[#FFFDF9] shadow-2xs'
                  : 'text-[#6B6656] hover:bg-[#E1D6BE]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" /> Trajektori Tanda Vital
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'prescriptions'
                  ? 'bg-[#1B2A45] text-[#FFFDF9] shadow-2xs'
                  : 'text-[#6B6656] hover:bg-[#E1D6BE]'
              }`}
            >
              <Pill className="w-3.5 h-3.5" /> Histori Resep & Vaksin
            </button>
            <button
              onClick={() => setActiveTab('allergies')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'allergies'
                  ? 'bg-rose-800 text-white shadow-2xs'
                  : 'text-rose-800 hover:bg-rose-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Alergi & Red Flags
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-2.5 py-1.5 rounded-lg bg-[#FFFDF9] hover:bg-[#E1D6BE] text-[#1B2A45] border border-[#E1D6BE] text-xs font-bold transition-all flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#B8905A]" />}
              <span>{copied ? 'Tersalin' : 'Salin Dossier'}</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E1D6BE] pb-2">
                <div>
                  <h3 className="font-bold text-sm text-[#1B2A45] font-display">Kronologi Rekam Medis Pasien Milo</h3>
                  <p className="text-xs text-[#6B6656]">Daftar 5 rekam jejak pemeriksaan fisik, vaksinasi, dan tindakan medis historis.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onLoadScenario('full', true);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-[#1B2A45] hover:bg-[#101A2C] text-[#D9B98A] rounded-lg text-xs font-bold border border-[#B8905A]/40 flex items-center gap-1.5 shadow-2xs"
                  >
                    <Zap className="w-3.5 h-3.5" /> Muat Semua & Langsung Analisis AI
                  </button>
                </div>
              </div>

              <div className="relative border-l-2 border-[#B8905A]/30 ml-4 pl-6 space-y-4">
                {/* Event 1 */}
                <div className="relative group">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#B8905A] border-2 border-[#FFFDF9]" />
                  <div className="bg-[#F6F1E6]/80 p-4 rounded-xl border border-[#E1D6BE] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1B2A45] text-sm flex items-center gap-2">
                        11/08/2026 • Vaksinasi Rabies & Otitis Externa Dextra
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        drh. Ananda Putri
                      </span>
                    </div>
                    <p className="text-[#22242B]">
                      <strong>Anamnesis:</strong> Pemilik ingin vaksinasi Rabies tahunan dan mengeluhkan telinga kanan Milo sering digaruk sejak 2 hari lalu.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#FFFDF9] p-2 rounded-lg border border-[#E1D6BE] text-[11px]">
                      <div><span className="text-[#6B6656]">Suhu:</span> <strong>38.6 °C</strong></div>
                      <div><span className="text-[#6B6656]">HR:</span> <strong>98 bpm</strong></div>
                      <div><span className="text-[#6B6656]">RR:</span> <strong>24 rpm</strong></div>
                      <div><span className="text-[#6B6656]">BB:</span> <strong>28.5 kg</strong></div>
                    </div>
                    <p className="text-[#22242B]">
                      <strong>Diagnosis & Terapi:</strong> Otitis Externa Dextra ringan. Diberi resep Otopain Ear Drops 3 tetes 2x sehari selama 5 hari. Injeksi Vaksin Defensor 3 Rabies IM.
                    </p>
                  </div>
                </div>

                {/* Event 2 */}
                <div className="relative group">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#1B2A45] border-2 border-[#FFFDF9]" />
                  <div className="bg-[#F6F1E6]/80 p-4 rounded-xl border border-[#E1D6BE] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1B2A45] text-sm flex items-center gap-2">
                        18/05/2026 • Check-Up Rutin & BCS Assessment
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                        drh. Ananda Putri
                      </span>
                    </div>
                    <p className="text-[#22242B]">
                      <strong>Hasil Evaluasi:</strong> Body Condition Score ideal (BCS 5/9), bobot naik ke 28.2 kg, auskultasi kardiorespirasi bersih. Diberikan suplemen minyak ikan omega-3.
                    </p>
                  </div>
                </div>

                {/* Event 3 */}
                <div className="relative group">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-600 border-2 border-[#FFFDF9]" />
                  <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 text-sm flex items-center gap-2">
                        10/02/2026 • Episode Gastritis Akut & Indigesti Dietetik
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-bold">
                        Rawat Jalan
                      </span>
                    </div>
                    <p className="text-[#22242B]">
                      <strong>Anamnesis & Gejala:</strong> Milo mengais tempat sampah dan menelan sisa tulang. Mengalami muntah busa/lendir kekuningan 3x, lesu, anoreksia 2 hari. Suhu 38.9 °C, nyeri palpasi epigastrik.
                    </p>
                    <p className="text-[#22242B]">
                      <strong>Terapi & Respon:</strong> Sucralfate sirup 5 ml 2x1 hari ac + puasa padat 8 jam. Gejala membaik sempurna dalam 48 jam.
                    </p>
                  </div>
                </div>

                {/* Event 4 */}
                <div className="relative group">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#1B2A45] border-2 border-[#FFFDF9]" />
                  <div className="bg-[#F6F1E6]/80 p-4 rounded-xl border border-[#E1D6BE] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1B2A45] text-sm flex items-center gap-2">
                        04/11/2025 • Vaksinasi Tahunan DHPPi + Lepto
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Vaksinasi
                      </span>
                    </div>
                    <p className="text-[#22242B]">
                      Kondisi bugar, suhu 38.5 °C, berat badan 27.5 kg. Sukses diberikan vaksin kombinasi DHPPi+L tanpa reaksi anafilaksis.
                    </p>
                  </div>
                </div>

                {/* Event 5 */}
                <div className="relative group">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#B8905A] border-2 border-[#FFFDF9]" />
                  <div className="bg-[#F6F1E6]/80 p-4 rounded-xl border border-[#E1D6BE] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1B2A45] text-sm flex items-center gap-2">
                        10/08/2025 • Registrasi Pasien Baru & Pemasangan Microchip
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#1B2A45] text-[#D9B98A] text-[10px] font-bold">
                        Pendaftaran Awal
                      </span>
                    </div>
                    <p className="text-[#22242B]">
                      Pemasangan microchip ISO 11784/11785 No. <code>985141002341829</code> di area interscapular. Pemberian Drontal Plus 2 tablet untuk profilaksis parasit intestinal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCENARIOS */}
          {activeTab === 'scenarios' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-[#1B2A45] font-display">Pilihan Skenario Klinis Pasien Milo</h3>
                <p className="text-xs text-[#6B6656]">Pilih salah satu variasi skenario kasus di bawah ini untuk dimuat langsung ke editor AI Vet Assistant:</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Scenario 1: Full Dossier */}
                <div className="p-4 bg-[#FFFDF9] rounded-xl border-2 border-[#B8905A] space-y-3 shadow-2xs hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[#1B2A45] text-[#D9B98A] font-bold text-[10px]">
                      Paling Komprehensif
                    </span>
                    <span className="text-xs font-bold text-[#B8905A]">🌟 All Records</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#1B2A45]">Dossier Rekam Medis Terpadu Lengkap</h4>
                  <p className="text-xs text-[#6B6656] leading-relaxed">
                    Memuat seluruh kronologi 5 kunjungan, histori alergi amoxicillin, trajektori berat badan, catatan vaksin, dan keluhan saat ini.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        onLoadScenario('full', false);
                        onClose();
                      }}
                      className="flex-1 py-2 bg-[#F6F1E6] hover:bg-[#E1D6BE] text-[#1B2A45] font-bold text-xs rounded-lg border border-[#E1D6BE] transition-all"
                    >
                      Muat Teks Saja
                    </button>
                    <button
                      onClick={() => {
                        onLoadScenario('full', true);
                        onClose();
                      }}
                      className="flex-1 py-2 bg-[#1B2A45] hover:bg-[#101A2C] text-[#D9B98A] font-bold text-xs rounded-lg border border-[#B8905A]/40 transition-all flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D9B98A]" /> Muat & Analisis AI
                    </button>
                  </div>
                </div>

                {/* Scenario 2: Gastritis & Indigestion */}
                <div className="p-4 bg-[#FFFDF9] rounded-xl border border-[#E1D6BE] space-y-3 shadow-2xs hover:border-[#B8905A] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                      Gastrointestinal
                    </span>
                    <span className="text-xs font-bold text-[#6B6656]">Kasus 1</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#1B2A45]">Gastritis Akut & Indigesti Pasca Tulang</h4>
                  <p className="text-xs text-[#6B6656] leading-relaxed">
                    Keluhan muntah berbusa 2x, lesu, nafsu makan turun, palpasi abdomen tegang pasca memakan sisa makanan sampah.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        onLoadScenario('gastritis', false);
                        onClose();
                      }}
                      className="flex-1 py-2 bg-[#F6F1E6] hover:bg-[#E1D6BE] text-[#1B2A45] font-bold text-xs rounded-lg border border-[#E1D6BE] transition-all"
                    >
                      Muat Teks Saja
                    </button>
                    <button
                      onClick={() => {
                        onLoadScenario('gastritis', true);
                        onClose();
                      }}
                      className="flex-1 py-2 bg-[#1B2A45] hover:bg-[#101A2C] text-[#D9B98A] font-bold text-xs rounded-lg border border-[#B8905A]/40 transition-all flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D9B98A]" /> Muat & Analisis AI
                    </button>
                  </div>
                </div>

                {/* Scenario 3: Otitis Externa & Rabies */}
                <div className="p-4 bg-[#FFFDF9] rounded-xl border border-[#E1D6BE] space-y-3 shadow-2xs hover:border-[#B8905A] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                      Dermatologi & Imunologi
                    </span>
                    <span className="text-xs font-bold text-[#6B6656]">Kasus 2</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#1B2A45]">Otitis Externa Dextra & Booster Rabies</h4>
                  <p className="text-xs text-[#6B6656] leading-relaxed">
                    Gatal telinga kanan, penumpukan serumen kecokelatan pasca mandi, dan rencana pemberian vaksin Rabies Defensor 3.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        onLoadScenario('otitis', false);
                        onClose();
                      }}
                      className="flex-1 py-2 bg-[#F6F1E6] hover:bg-[#E1D6BE] text-[#1B2A45] font-bold text-xs rounded-lg border border-[#E1D6BE] transition-all"
                    >
                      Muat Teks Saja
                    </button>
                    <button
                      onClick={() => {
                        onLoadScenario('otitis', true);
                        onClose();
                      }}
                      className="flex-1 py-2 bg-[#1B2A45] hover:bg-[#101A2C] text-[#D9B98A] font-bold text-xs rounded-lg border border-[#B8905A]/40 transition-all flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D9B98A]" /> Muat & Analisis AI
                    </button>
                  </div>
                </div>

                {/* Scenario 4: Drug Allergy Check */}
                <div className="p-4 bg-[#FFFDF9] rounded-xl border border-rose-300 space-y-3 shadow-2xs hover:border-rose-500 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                      Safety & Kontraindikasi
                    </span>
                    <span className="text-xs font-bold text-rose-600">Kasus 3</span>
                  </div>
                  <h4 className="font-bold text-sm text-rose-950">Screening Alergi Penisilin / Amoxicillin</h4>
                  <p className="text-xs text-[#6B6656] leading-relaxed">
                    Fokus evaluasi riwayat reaksi alergi parah terhadap antibiotik golongan penicillin/amoxicillin dan pakan daging ayam.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        onLoadScenario('allergy', false);
                        onClose();
                      }}
                      className="flex-1 py-2 bg-[#F6F1E6] hover:bg-[#E1D6BE] text-[#1B2A45] font-bold text-xs rounded-lg border border-[#E1D6BE] transition-all"
                    >
                      Muat Teks Saja
                    </button>
                    <button
                      onClick={() => {
                        onLoadScenario('allergy', true);
                        onClose();
                      }}
                      className="flex-1 py-2 bg-rose-800 hover:bg-rose-900 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" /> Analisis Kontraindikasi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VITALS TRAJECTORY */}
          {activeTab === 'vitals' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-[#1B2A45] font-display">Trajektori Berat Badan & Tanda Vital Milo</h3>
                <p className="text-xs text-[#6B6656]">Pemantauan bobot dan kestabilan tanda vital dari 5 kunjungan berturut-turut.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE]">
                  <span className="text-[10px] text-[#6B6656] block font-semibold">Berat Badan Terkini</span>
                  <span className="text-xl font-bold text-[#1B2A45]">28.5 kg</span>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">↑ +1.6 kg sejak adopsi</span>
                </div>
                <div className="p-3 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE]">
                  <span className="text-[10px] text-[#6B6656] block font-semibold">Rata-rata Suhu Tubuh</span>
                  <span className="text-xl font-bold text-[#1B2A45]">38.54 °C</span>
                  <span className="text-[10px] text-[#6B6656] block mt-0.5">Rentang Normal (38.0 - 39.2)</span>
                </div>
                <div className="p-3 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE]">
                  <span className="text-[10px] text-[#6B6656] block font-semibold">Detak Jantung (Resting)</span>
                  <span className="text-xl font-bold text-[#1B2A45]">97 bpm</span>
                  <span className="text-[10px] text-[#6B6656] block mt-0.5">Normofonik / Sinus Ritme</span>
                </div>
                <div className="p-3 bg-[#F6F1E6] rounded-xl border border-[#E1D6BE]">
                  <span className="text-[10px] text-[#6B6656] block font-semibold">Body Condition Score</span>
                  <span className="text-xl font-bold text-[#1B2A45]">BCS 5/9</span>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Proporsional & Bugar</span>
                </div>
              </div>

              <div className="bg-[#FFFDF9] rounded-xl border border-[#E1D6BE] overflow-hidden">
                <div className="bg-[#1B2A45] text-[#D9B98A] px-4 py-2 text-xs font-bold flex items-center justify-between">
                  <span>Log Riwayat Pengukuran Tanda Vital</span>
                  <span>5 Catatan Terverifikasi</span>
                </div>
                <div className="divide-y divide-[#E1D6BE] text-xs">
                  {vitalsHistory.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between flex-wrap gap-2">
                      <div className="w-28">
                        <span className="font-bold text-[#1B2A45] block">{item.date}</span>
                        <span className="text-[10px] text-[#6B6656]">{item.context}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-[10px] text-[#6B6656] block">Bobot</span>
                          <strong className="text-[#1B2A45]">{item.weight} kg</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#6B6656] block">Suhu</span>
                          <strong className="text-[#1B2A45]">{item.temp} °C</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#6B6656] block">HR</span>
                          <strong className="text-[#1B2A45]">{item.hr} bpm</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#6B6656] block">RR</span>
                          <strong className="text-[#1B2A45]">{item.rr} rpm</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#6B6656] block">Tekanan Darah</span>
                          <strong className="text-[#1B2A45]">{item.bp}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-[#1B2A45] font-display">Histori Resep Obat & Imunisasi Milo</h3>
                <p className="text-xs text-[#6B6656]">Daftar obat, vaksin, dan respon terapi yang pernah diterima oleh pasien Milo.</p>
              </div>

              <div className="bg-[#FFFDF9] rounded-xl border border-[#E1D6BE] overflow-hidden">
                <div className="divide-y divide-[#E1D6BE] text-xs">
                  {prescriptionHistory.map((rx, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between flex-wrap gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1B2A45] text-sm">{rx.drug}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {rx.status}
                          </span>
                        </div>
                        <p className="text-[#6B6656] text-xs">
                          Dosis & Cara Pakai: <strong>{rx.dose}</strong>
                        </p>
                      </div>
                      <div className="text-right text-xs">
                        <span className="font-bold text-[#1B2A45] block">{rx.date}</span>
                        <span className="text-[10px] text-[#6B6656]">Oleh: {rx.doctor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ALLERGIES */}
          {activeTab === 'allergies' && (
            <div className="space-y-4">
              <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  PERINGATAN ALERGI KRITIS: Pasien MILO
                </div>
                <div className="space-y-2 text-xs text-rose-950">
                  <div className="p-3 bg-white rounded-lg border border-rose-200 space-y-1">
                    <strong className="block text-rose-900 text-xs">1. Alergi Amoxicillin / Golongan Penisilin:</strong>
                    <p className="text-[11px] leading-relaxed">
                      Milo memiliki riwayat reaksi hipersensitivitas tipe I (urtikaria, pembengkakan moncong, dan gatal hebat) pasca konsumsi antibiotik Amoxicillin.
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                      ⛔ KONTRAINDIKASI: Amoxicillin, Ampicillin, Clavamox, Amoxicillin-Clavulanate.
                    </span>
                    <span className="inline-block mt-1 ml-2 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      ✓ Alternatif Aman: Cefalexin, Enrofloxacin, Metronidazole, Doxycycline.
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-rose-200 space-y-1">
                    <strong className="block text-rose-900 text-xs">2. Alergi Pakan Daging Ayam (Food Allergy):</strong>
                    <p className="text-[11px] leading-relaxed">
                      Protein ayam memicu pruritus di area sela jari kaki (pododermatitis) dan eritema telinga. Dianjurkan diet novel protein (Salmon / Lamb) atau formulasi Hydrolyzed Protein.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Quick Actions */}
        <div className="bg-[#F6F1E6] p-4 border-t border-[#E1D6BE] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#6B6656]">
            <Info className="w-4 h-4 text-[#B8905A]" />
            <span>Klik tombol di sebelah kanan untuk menyuntikkan data Milo ke modul lain:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onSwitchTab && (
              <>
                <button
                  onClick={() => {
                    onSwitchTab('calculator', { species: 'Anjing', weight: 28.5 });
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-[#FFFDF9] hover:bg-[#E1D6BE] text-[#1B2A45] text-xs font-bold rounded-lg border border-[#E1D6BE] transition-all flex items-center gap-1"
                >
                  <Calculator className="w-3.5 h-3.5 text-[#B8905A]" /> Hitung Dosis Obat (28.5 kg)
                </button>
                <button
                  onClick={() => {
                    onSwitchTab('chat', { prompt: 'Tinjau riwayat EMR lengkap pasien Milo (Golden Retriever 28.5 kg, Alergi Amoxicillin) dan berikan saran penanganan keluhan muntah saat ini.' });
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-[#FFFDF9] hover:bg-[#E1D6BE] text-[#1B2A45] text-xs font-bold rounded-lg border border-[#E1D6BE] transition-all flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#B8905A]" /> Chat AI Kasus Milo
                </button>
              </>
            )}
            <button
              onClick={() => {
                onLoadScenario('full', true);
                onClose();
              }}
              className="px-4 py-1.5 bg-[#1B2A45] hover:bg-[#101A2C] text-[#D9B98A] text-xs font-bold rounded-lg border border-[#B8905A]/40 shadow-sm transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Terapkan ke Clinical SOAP AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
