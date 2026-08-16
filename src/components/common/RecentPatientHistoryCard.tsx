import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { NavModule } from '../layout/Sidebar';
import {
  FileText,
  Stethoscope,
  Sparkles,
  ChevronRight,
  User,
  Phone,
  Activity,
  Calendar,
  AlertTriangle,
  Pill,
  Clock,
  CheckCircle2,
  ExternalLink,
  Bot,
  HeartPulse,
  Thermometer,
  Weight,
  Eye,
  X,
  Printer,
  Copy,
  ShieldCheck,
  Search,
  Filter,
  Download,
  FileDown,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';
import { Pet, SOAPNote, ClinicVisit } from '../../types';
import {
  generatePatientMedicalSummaryPDF,
  generateBatchRecentPatientsPDF,
  downloadMedicalSummaryPDF
} from '../../utils/patientMedicalHistoryPdf';

interface RecentPatientHistoryCardProps {
  setActiveModule: (module: NavModule) => void;
}

interface TreatedPatientSummary {
  pet: Pet;
  lastSoap?: SOAPNote;
  lastVisit?: ClinicVisit;
  treatedDate: string;
  doctorName: string;
  diagnosis: string;
  medicationSummary: string;
  vitals: {
    tempC?: number;
    hr?: number;
    rr?: number;
    weightKg?: number;
    bp?: string;
  };
  status: string;
  visitCount: number;
}

export const RecentPatientHistoryCard: React.FC<RecentPatientHistoryCardProps> = ({ setActiveModule }) => {
  const { pets = [], soapNotes = [], clinicVisits = [], customers = [], labTests = [], vacHistories = [] } = useData();
  const { addToast } = useToast();

  const [selectedPetForModal, setSelectedPetForModal] = useState<TreatedPatientSummary | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'ALL' | 'Anjing' | 'Kucing'>('ALL');

  // PDF Export States
  const [exportingPatientId, setExportingPatientId] = useState<string | null>(null);
  const [isExportingBatch, setIsExportingBatch] = useState<boolean>(false);
  const [exportOptionsModal, setExportOptionsModal] = useState<TreatedPatientSummary | null>(null);
  const [customAdviceNote, setCustomAdviceNote] = useState<string>('');
  const [includeStampOption, setIncludeStampOption] = useState<boolean>(true);
  const [customFollowUp, setCustomFollowUp] = useState<string>('3 - 5 Hari setelah terapi / bila memburuk');

  // Compute the last 5 treated patients dynamically
  // 1. Gather all visits and soap notes
  // 2. Map per pet, find their latest clinical encounter
  // 3. Sort by latest treated date / time descending and take top 5
  const treatedPatientsList: TreatedPatientSummary[] = React.useMemo(() => {
    const list: TreatedPatientSummary[] = [];

    pets.forEach((pet) => {
      // Find all soap notes for this pet
      const petSoaps = (soapNotes || [])
        .filter((s) => s && s.petId === pet.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Find all clinic visits for this pet
      const petVisits = (clinicVisits || [])
        .filter((v) => v && (v.petId === pet.id || v.petName?.toLowerCase() === pet.name.toLowerCase()))
        .sort((a, b) => (b.queueNo || 0) - (a.queueNo || 0));

      const latestSoap = petSoaps[0];
      const latestVisit = petVisits[0];

      // If pet has at least a visit or soap note or is in master data
      const treatedDate = latestSoap?.date || (latestVisit ? '2026-08-11' : pet.createdAt || '2026-08-11');
      const doctorName = latestSoap?.doctorName || latestVisit?.doctorName || 'drh. Ananda Putri';
      const diagnosis = latestSoap?.workingDiagnosis || latestVisit?.complaint || 'Pemeriksaan Rutin & General Check-up';

      let medicationSummary = latestSoap?.medicationPlan || '-';
      if (latestSoap?.prescribedDrugs && latestSoap.prescribedDrugs.length > 0) {
        medicationSummary = latestSoap.prescribedDrugs.map((d) => d.drugName).join(', ');
      }

      const vitals = {
        tempC: latestSoap?.temperatureC || 38.5,
        hr: latestSoap?.heartRate || (pet.species === 'Kucing' ? 160 : 98),
        rr: latestSoap?.respiratoryRate || 24,
        weightKg: latestSoap?.weightKg || pet.weightKg || 4.5,
        bp: latestSoap?.systolicBP ? `${latestSoap.systolicBP}/${latestSoap.diastolicBP} mmHg` : '120/80 mmHg'
      };

      const status = latestVisit?.status === 'Sedang Diperiksa'
        ? 'Sedang Ditangani'
        : latestVisit?.status === 'Menunggu'
        ? 'Menunggu Dokter'
        : 'Selesai Ditangani';

      list.push({
        pet,
        lastSoap: latestSoap,
        lastVisit: latestVisit,
        treatedDate,
        doctorName,
        diagnosis,
        medicationSummary,
        vitals,
        status,
        visitCount: Math.max(1, petSoaps.length + petVisits.length)
      });
    });

    // Sort by treatedDate descending, then by status (active first)
    return list.sort((a, b) => {
      const timeA = new Date(a.treatedDate).getTime();
      const timeB = new Date(b.treatedDate).getTime();
      return timeB - timeA;
    });
  }, [pets, soapNotes, clinicVisits]);

  // Filtered list for display
  const filteredPatients = treatedPatientsList
    .filter((item) => {
      const matchesSearch =
        item.pet.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.pet.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.diagnosis.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.pet.breed.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesSpecies = speciesFilter === 'ALL' || item.pet.species === speciesFilter;
      return matchesSearch && matchesSpecies;
    })
    .slice(0, 5); // Take top 5

  // Handler to jump to specific patient's EMR
  const handleJumpToEmr = (petId: string, petName: string) => {
    try {
      localStorage.setItem('petcare_selected_pet_id', petId);
      addToast(`Membuka Rekam Medis (EMR) untuk ${petName}...`, 'success');
      setActiveModule('emr');
    } catch (e) {
      setActiveModule('emr');
    }
  };

  // Handler to jump to SOAP clinic examination
  const handleJumpToClinicSoap = (petId: string, petName: string) => {
    try {
      localStorage.setItem('petcare_selected_pet_id', petId);
      addToast(`Membuka Lembar Pemeriksaan SOAP untuk ${petName}...`, 'info');
      setActiveModule('clinic');
    } catch (e) {
      setActiveModule('clinic');
    }
  };

  // Handler to jump to AI Assistant
  const handleJumpToAi = (petId: string, petName: string) => {
    try {
      localStorage.setItem('petcare_selected_pet_id', petId);
      addToast(`Membuka Analisis AI Assistant untuk ${petName}...`, 'info');
      setActiveModule('aiAssistant');
    } catch (e) {
      setActiveModule('aiAssistant');
    }
  };

  // Export single patient summary to PDF
  const handleExportSinglePatientPDF = (
    item: TreatedPatientSummary,
    customOptions?: { notes?: string; stamp?: boolean; followUp?: string }
  ) => {
    try {
      setExportingPatientId(item.pet.id);
      const customer = customers.find((c) => c.id === item.pet.customerId);
      const petLabs = (labTests || []).filter((l) => l && l.petId === item.pet.id);
      const petVacs = (vacHistories || []).filter((v) => v && v.petId === item.pet.id);

      const doc = generatePatientMedicalSummaryPDF({
        pet: item.pet,
        lastSoap: item.lastSoap,
        lastVisit: item.lastVisit,
        customer: customer,
        vitals: item.vitals,
        doctorName: item.doctorName,
        diagnosis: item.diagnosis,
        medicationSummary: item.medicationSummary,
        labTests: petLabs,
        vacHistories: petVacs,
        additionalNotes: customOptions?.notes,
        includeSignatureStamp: customOptions?.stamp ?? true,
        followUpDate: customOptions?.followUp
      });

      downloadMedicalSummaryPDF(doc, item.pet.name, item.treatedDate);
      addToast(`Ringkasan Medis PDF untuk ${item.pet.name} berhasil diunduh!`, 'success');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      addToast('Gagal membuat dokumen PDF. Silakan coba lagi.', 'error');
    } finally {
      setExportingPatientId(null);
    }
  };

  // Export batch summary for all top 5 treated patients
  const handleExportBatchPDF = () => {
    if (!filteredPatients || filteredPatients.length === 0) {
      addToast('Tidak ada data pasien untuk diekspor.', 'warning');
      return;
    }
    try {
      setIsExportingBatch(true);
      const doc = generateBatchRecentPatientsPDF(filteredPatients);
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      doc.save(`Rekap-5-Pasien-Terakhir-${dateStr}.pdf`);
      addToast(`Rekap PDF ${filteredPatients.length} pasien berhasil diunduh!`, 'success');
    } catch (err) {
      console.error('Failed to export batch PDF:', err);
      addToast('Gagal membuat rekap PDF. Silakan coba lagi.', 'error');
    } finally {
      setIsExportingBatch(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} berhasil disalin ke clipboard.`, 'success');
  };

  return (
    <div className="bg-[#FFFDF9] rounded-2xl border border-[#E1D6BE] shadow-md overflow-hidden space-y-0 transition-all duration-200">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1B2A45] via-[#16233B] to-[#101A2C] text-[#FFFDF9] border-b border-[#B8905A]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#B8905A] to-[#9E7848] text-[#101A2C] rounded-xl font-bold shadow-sm border border-amber-300/30 shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[#FFFDF9] font-display tracking-tight">
                Riwayat Pasien Terakhir Ditangani (Recent Patient History)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#B8905A]/20 text-[#D9B98A] border border-[#B8905A]/40 text-[10px] font-black uppercase tracking-wider">
                5 Pasien Terakhir • Akses Cepat EMR
              </span>
            </div>
            <p className="text-xs text-[#E1D6BE] mt-0.5">
              Lihat ringkasan 5 pasien medis terakhir yang diperiksa, diagnosis klinis, tanda vital, dan unduh ringkasan perawatan berformat PDF resmi.
            </p>
          </div>
        </div>

        {/* Global Actions: Batch PDF Export & Jump to All EMR */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleExportBatchPDF}
            disabled={isExportingBatch}
            className="px-3 py-1.5 bg-[#FAF7F2]/15 hover:bg-[#FAF7F2]/25 text-[#FFFDF9] border border-white/20 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Unduh Rekapitulasi PDF 5 Pasien Terakhir Sekaligus"
          >
            {isExportingBatch ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D9B98A]" />
            ) : (
              <FileDown className="w-3.5 h-3.5 text-[#D9B98A]" />
            )}
            <span>{isExportingBatch ? 'Mengekspor...' : 'Ekspor Rekap 5 Pasien (PDF)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModule('emr')}
            className="px-3.5 py-1.5 bg-[#B8905A] hover:bg-[#9E7848] text-[#101A2C] rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:shadow"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Buka Modul EMR Terpadu →</span>
          </button>
        </div>
      </div>

      {/* Filter and Quick Search Bar */}
      <div className="bg-[#FAF7F2] px-4 py-3 border-b border-[#E1D6BE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B6656]" />
            <input
              type="text"
              placeholder="Cari pasien, pemilik, diagnosis..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white rounded-lg border border-[#E1D6BE] text-xs text-[#1B2A45] placeholder-[#6B6656]/60 focus:outline-none focus:border-[#1B2A45]"
            />
          </div>

          <div className="flex items-center bg-white rounded-lg border border-[#E1D6BE] p-0.5">
            <button
              onClick={() => setSpeciesFilter('ALL')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                speciesFilter === 'ALL' ? 'bg-[#1B2A45] text-white shadow-2xs' : 'text-[#6B6656] hover:text-[#1B2A45]'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSpeciesFilter('Anjing')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                speciesFilter === 'Anjing' ? 'bg-[#1B2A45] text-white shadow-2xs' : 'text-[#6B6656] hover:text-[#1B2A45]'
              }`}
            >
              🐶 Anjing
            </button>
            <button
              onClick={() => setSpeciesFilter('Kucing')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                speciesFilter === 'Kucing' ? 'bg-[#1B2A45] text-white shadow-2xs' : 'text-[#6B6656] hover:text-[#1B2A45]'
              }`}
            >
              🐱 Kucing
            </button>
          </div>
        </div>

        <div className="text-[11px] text-[#6B6656] flex items-center gap-1.5 self-end sm:self-auto font-medium">
          <Clock className="w-3.5 h-3.5 text-[#B8905A]" />
          <span>Menampilkan <strong>{filteredPatients.length}</strong> pasien terakhir ditangani</span>
        </div>
      </div>

      {/* 5 Treated Patients List / Grid */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3.5">
          {filteredPatients.map((item, idx) => {
            const customer = customers.find((c) => c.id === item.pet.customerId);
            const hasAllergy = Boolean(item.pet.allergies && item.pet.allergies.toLowerCase() !== 'tidak ada');

            return (
              <div
                key={item.pet.id}
                className="bg-[#FAF7F2] hover:bg-white rounded-xl border border-[#E1D6BE] hover:border-[#B8905A]/70 hover:shadow-sm transition-all duration-200 p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 group"
              >
                {/* Left Side: Avatar, Pet & Owner Bio */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-[260px] max-w-sm">
                  <div className="relative shrink-0">
                    <img
                      src={item.pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400'}
                      alt={item.pet.name}
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl object-cover border-2 border-[#1B2A45]/20 shadow-2xs group-hover:border-[#B8905A] transition-colors"
                    />
                    <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[#1B2A45] text-amber-300 text-[10px] font-black flex items-center justify-center border border-white shadow-2xs">
                      #{idx + 1}
                    </span>
                    <span
                      className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black border uppercase ${
                        item.pet.gender === 'Jantan'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-pink-100 text-pink-800 border-pink-300'
                      }`}
                    >
                      {item.pet.gender === 'Jantan' ? '♂' : '♀'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-[#1B2A45] font-display flex items-center gap-1.5">
                        {item.pet.name}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F6F1E6] text-[#1B2A45] font-semibold border border-[#E1D6BE]">
                        {item.pet.species} • {item.pet.breed}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#6B6656] flex items-center gap-1.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-[#1B2A45]" />
                        <strong>{item.pet.customerName}</strong>
                      </span>
                      {customer?.membershipTier && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-100 text-amber-900 border border-amber-300">
                          {customer.membershipTier}
                        </span>
                      )}
                      <span className="text-[#6B6656]/50">•</span>
                      <span>{item.vitals.weightKg} kg</span>
                    </div>

                    {hasAllergy && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 border border-rose-300 text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                        <span>Alergi: {item.pet.allergies}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle: Clinical History Snapshot & Vitals */}
                <div className="flex-1 space-y-2 border-t lg:border-t-0 lg:border-l border-[#E1D6BE] pt-3 lg:pt-0 lg:pl-4 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#1B2A45] bg-white px-2 py-0.5 rounded-md border border-[#E1D6BE]">
                        🩺 {item.doctorName}
                      </span>
                      <span className="text-[11px] text-[#6B6656] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#B8905A]" />
                        {item.treatedDate}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        item.status === 'Sedang Ditangani'
                          ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      ● {item.status}
                    </span>
                  </div>

                  {/* Diagnosis & Treatment Note */}
                  <div className="bg-white p-2.5 rounded-lg border border-[#E1D6BE]/70 text-xs space-y-1">
                    <div className="flex items-start gap-1.5">
                      <strong className="text-[#1B2A45] shrink-0 font-bold">Diagnosis:</strong>
                      <span className="text-[#1B2A45] font-semibold">{item.diagnosis}</span>
                    </div>
                    {item.medicationSummary && item.medicationSummary !== '-' && (
                      <div className="flex items-start gap-1.5 text-[11px] text-[#6B6656]">
                        <Pill className="w-3.5 h-3.5 text-[#B8905A] shrink-0 mt-0.5" />
                        <span className="truncate">Terapi: {item.medicationSummary}</span>
                      </div>
                    )}
                  </div>

                  {/* Vitals Summary Strip */}
                  <div className="grid grid-cols-4 gap-1.5 text-[10px] font-medium">
                    <div className="bg-white/70 px-2 py-1 rounded border border-[#E1D6BE]/60 flex items-center justify-between">
                      <span className="text-[#6B6656]">Suhu:</span>
                      <strong className="text-[#1B2A45]">{item.vitals.tempC}°C</strong>
                    </div>
                    <div className="bg-white/70 px-2 py-1 rounded border border-[#E1D6BE]/60 flex items-center justify-between">
                      <span className="text-[#6B6656]">HR:</span>
                      <strong className="text-[#1B2A45]">{item.vitals.hr} bpm</strong>
                    </div>
                    <div className="bg-white/70 px-2 py-1 rounded border border-[#E1D6BE]/60 flex items-center justify-between">
                      <span className="text-[#6B6656]">RR:</span>
                      <strong className="text-[#1B2A45]">{item.vitals.rr} /m</strong>
                    </div>
                    <div className="bg-white/70 px-2 py-1 rounded border border-[#E1D6BE]/60 flex items-center justify-between">
                      <span className="text-[#6B6656]">Tensi:</span>
                      <strong className="text-[#1B2A45]">{item.vitals.bp?.split(' ')[0]}</strong>
                    </div>
                  </div>
                </div>

                {/* Right Side: Direct Jump Buttons to EMR & Clinical Modules */}
                <div className="flex flex-row lg:flex-col items-center justify-end gap-2 shrink-0 w-full lg:w-48 border-t lg:border-t-0 lg:border-l border-[#E1D6BE] pt-3 lg:pt-0 lg:pl-4">
                  {/* Action Row 1: Direct Jump to EMR */}
                  <button
                    type="button"
                    onClick={() => handleJumpToEmr(item.pet.id, item.pet.name)}
                    className="flex-1 lg:w-full py-1.5 px-2.5 bg-[#1B2A45] hover:bg-[#101A2C] text-[#FFFDF9] rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer group/btn"
                    title={`Buka Berkas EMR Lengkap ${item.pet.name}`}
                  >
                    <FileText className="w-3.5 h-3.5 text-[#D9B98A] group-hover/btn:scale-110 transition-transform" />
                    <span>Buka EMR Pasien</span>
                    <ChevronRight className="w-3 h-3 text-[#D9B98A]" />
                  </button>

                  {/* Action Row 2: Ekspor PDF Button */}
                  <button
                    type="button"
                    onClick={() => handleExportSinglePatientPDF(item)}
                    disabled={exportingPatientId === item.pet.id}
                    className="flex-1 lg:w-full py-1.5 px-2.5 bg-gradient-to-r from-[#B8905A] to-[#9E7848] hover:from-[#A57F4A] hover:to-[#8E693B] text-[#FFFDF9] rounded-lg text-xs font-bold transition-all shadow-2xs hover:shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title={`Unduh Ringkasan Medis PDF untuk ${item.pet.name}`}
                  >
                    {exportingPatientId === item.pet.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFFDF9]" />
                        <span>Membuat PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-3.5 h-3.5 text-[#FFFDF9]" />
                        <span>Unduh Ringkasan PDF</span>
                      </>
                    )}
                  </button>

                  {/* Action Row 3: Sub-actions (Detail/Preview, SOAP, Opsi PDF, AI) */}
                  <div className="flex items-center gap-1.5 w-full">
                    {/* Quick Preview Modal */}
                    <button
                      type="button"
                      onClick={() => setSelectedPetForModal(item)}
                      className="flex-1 py-1 px-1.5 bg-white hover:bg-[#F6F1E6] text-[#1B2A45] border border-[#E1D6BE] rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      title="Pratinjau Ringkasan Medis Cepat"
                    >
                      <Eye className="w-3 h-3 text-[#B8905A]" />
                      <span>Detail</span>
                    </button>

                    {/* Jump to SOAP Examination */}
                    <button
                      type="button"
                      onClick={() => handleJumpToClinicSoap(item.pet.id, item.pet.name)}
                      className="flex-1 py-1 px-1.5 bg-white hover:bg-[#F6F1E6] text-[#1B2A45] border border-[#E1D6BE] rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      title="Buka Lembar Pemeriksaan SOAP"
                    >
                      <Stethoscope className="w-3 h-3 text-[#1B2A45]" />
                      <span>SOAP</span>
                    </button>

                    {/* Opsi Custom PDF */}
                    <button
                      type="button"
                      onClick={() => {
                        setExportOptionsModal(item);
                        setCustomAdviceNote(item.lastSoap?.patientEducation || '');
                        setCustomFollowUp('3 - 5 Hari setelah terapi / bila gejala memburuk');
                      }}
                      className="p-1.5 bg-white hover:bg-[#F6F1E6] text-[#6B6656] hover:text-[#1B2A45] border border-[#E1D6BE] rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center cursor-pointer"
                      title="Kustomisasi Ringkasan PDF Sebelum Mengunduh"
                    >
                      <SlidersHorizontal className="w-3 h-3 text-[#B8905A]" />
                    </button>

                    {/* Jump to AI Assistant */}
                    <button
                      type="button"
                      onClick={() => handleJumpToAi(item.pet.id, item.pet.name)}
                      className="p-1.5 bg-[#FAF7F2] hover:bg-[#1B2A45] hover:text-white text-[#B8905A] border border-[#E1D6BE] rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center cursor-pointer"
                      title="Analisis AI Assistant"
                    >
                      <Bot className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredPatients.length === 0 && (
            <div className="p-8 text-center bg-[#FAF7F2] rounded-xl border border-dashed border-[#E1D6BE] text-[#6B6656] space-y-2">
              <FileText className="w-8 h-8 mx-auto text-[#B8905A]" />
              <p className="font-bold text-xs text-[#1B2A45]">Tidak ada data pasien yang sesuai dengan kata kunci.</p>
              <p className="text-[11px]">Coba ubah kata kunci pencarian atau filter spesies di atas.</p>
            </div>
          )}
        </div>
      </div>

      {/* QUICK EMR DOSSIER MODAL (Inspect on Dashboard) */}
      {selectedPetForModal && (
        <div className="fixed inset-0 z-50 bg-[#101A2C]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E1D6BE] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-0">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#1B2A45] text-[#FFFDF9] border-b border-[#B8905A]/40 flex items-start justify-between gap-4 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPetForModal.pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400'}
                  alt={selectedPetForModal.pet.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-amber-300 shadow-sm shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-[#FFFDF9] font-display">
                      Berkas Rekam Medis: {selectedPetForModal.pet.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-[#B8905A]/20 text-[#D9B98A] border border-[#B8905A]/40 text-[10px] font-bold">
                      Microchip #{selectedPetForModal.pet.microchipNo || '985141002341829'}
                    </span>
                  </div>
                  <p className="text-xs text-[#E1D6BE] mt-0.5">
                    {selectedPetForModal.pet.species} • {selectedPetForModal.pet.breed} • Pemilik: <strong>{selectedPetForModal.pet.customerName}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleExportSinglePatientPDF(selectedPetForModal)}
                  disabled={exportingPatientId === selectedPetForModal.pet.id}
                  className="px-3 py-1.5 bg-[#B8905A] hover:bg-[#9E7848] text-[#101A2C] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  title="Unduh Ringkasan Medis PDF Pasien Ini"
                >
                  {exportingPatientId === selectedPetForModal.pet.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#101A2C]" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-[#101A2C]" />
                  )}
                  <span className="hidden sm:inline">Unduh PDF</span>
                </button>

                <button
                  onClick={() => setSelectedPetForModal(null)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-5 space-y-4 text-xs text-[#1B2A45]">
              {/* Allergy Banner if any */}
              {selectedPetForModal.pet.allergies && selectedPetForModal.pet.allergies.toLowerCase() !== 'tidak ada' && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center gap-2 text-rose-900 font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Peringatan Alergi:</strong> Pasien ini tercatat memiliki riwayat sensitivitas / kontraindikasi terhadap:{' '}
                    <strong className="underline">{selectedPetForModal.pet.allergies}</strong>.
                  </span>
                </div>
              )}

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E1D6BE] text-center space-y-1">
                  <span className="text-[10px] text-[#6B6656] uppercase font-bold block">Suhu Tubuh</span>
                  <p className="text-base font-bold text-[#1B2A45]">{selectedPetForModal.vitals.tempC} °C</p>
                  <span className="text-[9px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.2 rounded">Normotermia</span>
                </div>
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E1D6BE] text-center space-y-1">
                  <span className="text-[10px] text-[#6B6656] uppercase font-bold block">Denyut Jantung (HR)</span>
                  <p className="text-base font-bold text-[#1B2A45]">{selectedPetForModal.vitals.hr} bpm</p>
                  <span className="text-[9px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.2 rounded">Irama Reguler</span>
                </div>
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E1D6BE] text-center space-y-1">
                  <span className="text-[10px] text-[#6B6656] uppercase font-bold block">Laju Nafas (RR)</span>
                  <p className="text-base font-bold text-[#1B2A45]">{selectedPetForModal.vitals.rr} /mnt</p>
                  <span className="text-[9px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.2 rounded">Eupnea</span>
                </div>
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E1D6BE] text-center space-y-1">
                  <span className="text-[10px] text-[#6B6656] uppercase font-bold block">Berat Badan</span>
                  <p className="text-base font-bold text-[#1B2A45]">{selectedPetForModal.vitals.weightKg} kg</p>
                  <span className="text-[9px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.2 rounded">BCS 5/9</span>
                </div>
              </div>

              {/* SOAP Medical Notes Details */}
              {selectedPetForModal.lastSoap ? (
                <div className="bg-[#FAF7F2] rounded-xl border border-[#E1D6BE] p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E1D6BE] pb-2">
                    <h5 className="font-bold text-xs text-[#1B2A45] flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-[#B8905A]" /> Catatan SOAP Terakhir ({selectedPetForModal.lastSoap.date})
                    </h5>
                    <span className="text-[10px] text-[#6B6656]">{selectedPetForModal.lastSoap.doctorName}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-[#E1D6BE]/70 space-y-1">
                      <strong className="text-[10px] uppercase text-[#B8905A] block font-black">S - Subjective (Anamnesis)</strong>
                      <p className="text-[#1B2A45]">{selectedPetForModal.lastSoap.chiefComplaint}</p>
                      <p className="text-[#6B6656] text-[11px] italic">{selectedPetForModal.lastSoap.historyOfPresentIllness}</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-[#E1D6BE]/70 space-y-1">
                      <strong className="text-[10px] uppercase text-[#B8905A] block font-black">O - Objective (Fisik & Lab)</strong>
                      <p className="text-[#1B2A45]">{selectedPetForModal.lastSoap.physicalExamNotes}</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-[#E1D6BE]/70 space-y-1">
                      <strong className="text-[10px] uppercase text-[#B8905A] block font-black">A - Assessment (Diagnosis)</strong>
                      <p className="text-[#1B2A45] font-bold">{selectedPetForModal.lastSoap.workingDiagnosis}</p>
                      <p className="text-[11px] text-[#6B6656]">Diferensial: {selectedPetForModal.lastSoap.differentialDiagnosis}</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-[#E1D6BE]/70 space-y-1">
                      <strong className="text-[10px] uppercase text-[#B8905A] block font-black">P - Plan (Terapi & Edukasi)</strong>
                      <p className="text-[#1B2A45] font-semibold">{selectedPetForModal.lastSoap.medicationPlan}</p>
                      <p className="text-[11px] text-[#6B6656]">Edukasi: {selectedPetForModal.lastSoap.patientEducation}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E1D6BE] text-center text-[#6B6656]">
                  <p className="font-semibold">Belum ada catatan SOAP tersimpan untuk pasien ini.</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-[#FAF7F2] border-t border-[#E1D6BE] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedPetForModal(null)}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-[#1B2A45] border border-[#E1D6BE] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup Preview
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleExportSinglePatientPDF(selectedPetForModal)}
                  disabled={exportingPatientId === selectedPetForModal.pet.id}
                  className="px-4 py-2 bg-[#B8905A] hover:bg-[#9E7848] text-[#101A2C] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {exportingPatientId === selectedPetForModal.pet.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#101A2C]" />
                      <span>Membuat Dokumen PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-3.5 h-3.5 text-[#101A2C]" />
                      <span>Unduh PDF Ringkasan Medis</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const pet = selectedPetForModal.pet;
                    setSelectedPetForModal(null);
                    handleJumpToAi(pet.id, pet.name);
                  }}
                  className="px-4 py-2 bg-[#F6F1E6] hover:bg-[#E1D6BE] text-[#1B2A45] border border-[#E1D6BE] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-[#B8905A]" />
                  <span>Analisis AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const pet = selectedPetForModal.pet;
                    setSelectedPetForModal(null);
                    handleJumpToEmr(pet.id, pet.name);
                  }}
                  className="px-4 py-2 bg-[#1B2A45] hover:bg-[#101A2C] text-[#FFFDF9] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#D9B98A]" />
                  <span>Buka EMR Lengkap →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMIZE PDF EXPORT OPTIONS MODAL */}
      {exportOptionsModal && (
        <div className="fixed inset-0 z-50 bg-[#101A2C]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E1D6BE] shadow-2xl max-w-lg w-full overflow-hidden space-y-0 text-[#1B2A45]">
            {/* Modal Header */}
            <div className="p-4 bg-[#1B2A45] text-[#FFFDF9] border-b border-[#B8905A]/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#B8905A]/20 border border-[#B8905A]/40 flex items-center justify-center text-[#D9B98A]">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#FFFDF9] font-display">
                    Opsi Ekspor PDF Ringkasan Medis
                  </h4>
                  <p className="text-[11px] text-[#EDE6D6]/80">
                    Pasien: {exportOptionsModal.pet.name} ({exportOptionsModal.pet.species})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExportOptionsModal(null)}
                className="p-1 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-3.5 text-xs">
              {/* Pet & Owner Recap */}
              <div className="p-3 bg-[#F6F1E6]/50 rounded-xl border border-[#E1D6BE] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#6B6656] uppercase font-bold block">Pasien & Pemilik</span>
                  <p className="font-bold text-xs text-[#1B2A45]">{exportOptionsModal.pet.name} • {exportOptionsModal.pet.customerName}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#6B6656] uppercase font-bold block">Tanggal Perawatan</span>
                  <p className="font-semibold text-xs text-[#1B2A45]">{exportOptionsModal.treatedDate}</p>
                </div>
              </div>

              {/* Toggle 1: Include Official Stamp & Digital Seal */}
              <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#E1D6BE] cursor-pointer hover:bg-[#FAF7F2] transition-colors">
                <div className="space-y-0.5">
                  <p className="font-bold text-xs text-[#1B2A45] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#B8905A]" />
                    <span>Sertakan Stempel Basah Digital Resmi</span>
                  </p>
                  <p className="text-[10px] text-[#6B6656]">
                    Cap verifikasi PetCare Hospital & validasi lisensi SIP dokter
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={includeStampOption}
                  onChange={(e) => setIncludeStampOption(e.target.checked)}
                  className="w-4 h-4 text-[#B8905A] rounded border-[#E1D6BE] focus:ring-[#B8905A] cursor-pointer"
                />
              </label>

              {/* Input: Follow-up Date */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#1B2A45] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#B8905A]" />
                  <span>Jadwal Kontrol Ulang (Follow-Up):</span>
                </label>
                <input
                  type="text"
                  value={customFollowUp}
                  onChange={(e) => setCustomFollowUp(e.target.value)}
                  placeholder="Contoh: 3 - 5 Hari setelah terapi / 18 Agustus 2026"
                  className="w-full px-3 py-2 bg-white rounded-lg border border-[#E1D6BE] text-xs text-[#1B2A45] focus:outline-none focus:border-[#1B2A45]"
                />
              </div>

              {/* Input: Custom Advice / Notes for Owner */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#1B2A45] flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-[#B8905A]" />
                  <span>Catatan Khusus / Edukasi Tambahan untuk Pemilik:</span>
                </label>
                <textarea
                  rows={3}
                  value={customAdviceNote}
                  onChange={(e) => setCustomAdviceNote(e.target.value)}
                  placeholder="Tambahkan pesan instruksi khusus bagi pemilik mengenai obat, makanan, atau perawatan luka..."
                  className="w-full p-2.5 bg-white rounded-lg border border-[#E1D6BE] text-xs text-[#1B2A45] focus:outline-none focus:border-[#1B2A45] resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF7F2] border-t border-[#E1D6BE] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setExportOptionsModal(null)}
                className="px-3.5 py-2 bg-white hover:bg-gray-100 text-[#1B2A45] border border-[#E1D6BE] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = exportOptionsModal;
                  setExportOptionsModal(null);
                  handleExportSinglePatientPDF(target, {
                    notes: customAdviceNote,
                    stamp: includeStampOption,
                    followUp: customFollowUp
                  });
                }}
                className="px-4 py-2 bg-[#B8905A] hover:bg-[#9E7848] text-[#101A2C] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#101A2C]" />
                <span>Unduh PDF Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
