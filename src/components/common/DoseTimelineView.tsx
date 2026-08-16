import React, { useState, useMemo } from 'react';
import {
  Clock,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Calendar,
  Pill,
  Syringe,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Timer,
  Utensils,
  Share2,
  CalendarClock,
  ArrowRight,
  ShieldCheck,
  Flame,
  Activity,
  Database,
  FileText
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import {
  DrugProtocol,
  SpeciesCategory,
  SpeciesSafetyProfile
} from '../../data/veterinaryDrugProtocols';

export interface DoseTimelineViewProps {
  protocol: DrugProtocol;
  species: SpeciesCategory;
  speciesProfile: SpeciesSafetyProfile;
  patientName?: string;
  weightKg: number;
  doseMg: number;
  volumeMl: number;
  concentration: number;
  customDoseMgKg: number;
  isMaxCapped?: boolean;
  onApplyToPrescription?: () => void;
  onSaveToEMR?: () => void;
  isSavedToEMR?: boolean;
  onBackToCalculator?: () => void;
  className?: string;
}

export interface TimelineCheckpoint {
  id: string;
  doseIndex: number;
  totalDosesInDay: number;
  timeString: string; // e.g. "08:00"
  timeMinutes: number; // minutes from 00:00 (0 to 1439)
  dayLabel: string; // e.g. "Hari Ini" or "Hari ke-1"
  dayOffset: number; // 0 for today, 1 for tomorrow
  periodType: 'pagi' | 'siang' | 'sore' | 'malam' | 'dini_hari';
  periodLabel: string;
  doseMg: number;
  volumeMl: number;
  intervalHoursFromPrev: number;
  intervalHoursToNext: number;
  mealAdvice: string;
  route: string;
  isNextDue?: boolean;
}

// Helper to determine time-of-day category
function getTimePeriod(hours: number): {
  periodType: 'pagi' | 'siang' | 'sore' | 'malam' | 'dini_hari';
  periodLabel: string;
  icon: typeof Sun;
  themeClass: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    nodeBg: string;
    nodeRing: string;
  };
} {
  if (hours >= 5 && hours < 11) {
    return {
      periodType: 'pagi',
      periodLabel: 'Pagi Hari',
      icon: Sunrise,
      themeClass: {
        bg: 'bg-amber-50/80',
        text: 'text-amber-950',
        border: 'border-amber-300',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-800',
        nodeBg: 'bg-amber-500',
        nodeRing: 'ring-amber-200'
      }
    };
  } else if (hours >= 11 && hours < 15) {
    return {
      periodType: 'siang',
      periodLabel: 'Siang Hari',
      icon: Sun,
      themeClass: {
        bg: 'bg-sky-50/80',
        text: 'text-sky-950',
        border: 'border-sky-300',
        badgeBg: 'bg-sky-100',
        badgeText: 'text-sky-800',
        nodeBg: 'bg-sky-500',
        nodeRing: 'ring-sky-200'
      }
    };
  } else if (hours >= 15 && hours < 18.5) {
    return {
      periodType: 'sore',
      periodLabel: 'Sore Hari',
      icon: Sunset,
      themeClass: {
        bg: 'bg-orange-50/80',
        text: 'text-orange-950',
        border: 'border-orange-300',
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-800',
        nodeBg: 'bg-orange-500',
        nodeRing: 'ring-orange-200'
      }
    };
  } else if (hours >= 18.5 && hours < 24) {
    return {
      periodType: 'malam',
      periodLabel: 'Malam Hari',
      icon: Moon,
      themeClass: {
        bg: 'bg-indigo-50/80',
        text: 'text-indigo-950',
        border: 'border-indigo-300',
        badgeBg: 'bg-indigo-100',
        badgeText: 'text-indigo-800',
        nodeBg: 'bg-indigo-600',
        nodeRing: 'ring-indigo-200'
      }
    };
  } else {
    return {
      periodType: 'dini_hari',
      periodLabel: 'Dini Hari',
      icon: Moon,
      themeClass: {
        bg: 'bg-purple-50/80',
        text: 'text-purple-950',
        border: 'border-purple-300',
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-800',
        nodeBg: 'bg-purple-600',
        nodeRing: 'ring-purple-200'
      }
    };
  }
}

// Generate tailored meal advice based on drug pharmacological class
function getTailoredMealAdvice(protocol: DrugProtocol): string {
  const cat = protocol.category;
  const name = protocol.name.toLowerCase();

  if (cat === 'Analgesik') {
    return '🍽️ WAJIB Diberikan sesudah makan kenyang (mencegah iritasi mukosa lambung).';
  }
  if (cat === 'Antibiotik') {
    if (name.includes('doxycycline')) {
      return '🍗 Berikan bersama pakan basah & pastikan minum air (mencegah striktur esofagus).';
    }
    return '🥣 Berikan bersama sedikit pakan basah bila ada riwayat lambung sensitif.';
  }
  if (cat === 'Antiemetik') {
    return '⏱️ Berikan 30-45 menit sebelum jadwal makan pasien.';
  }
  if (cat === 'Kortikosteroid') {
    return '🥩 Berikan pagi hari bersama pakan untuk menyesuaikan ritme sirkadian hormon.';
  }
  if (cat === 'Antiparasit') {
    return '🥩 Campurkan ke dalam makanan basah beraroma kuat atau berikan per-oral.';
  }
  return '💧 Berikan bersama atau segera setelah makan dengan air minum segar.';
}

export const DoseTimelineView: React.FC<DoseTimelineViewProps> = ({
  protocol,
  species,
  speciesProfile,
  patientName = 'Pasien',
  weightKg,
  doseMg,
  volumeMl,
  concentration,
  customDoseMgKg,
  isMaxCapped,
  onApplyToPrescription,
  onSaveToEMR,
  isSavedToEMR = false,
  onBackToCalculator,
  className = ''
}) => {
  const { addToast } = useToast();

  // Parse default frequency from profile
  const defaultFrequencyInfo = useMemo(() => {
    const freq = (speciesProfile.frequency || '').toLowerCase();
    if (freq.includes('4x') || freq.includes('q6h')) return { count: 4, interval: 6, label: '4x Sehari (q6h / Tiap 6 Jam)' };
    if (freq.includes('3x') || freq.includes('q8h') || freq.includes('tid')) return { count: 3, interval: 8, label: '3x Sehari (q8h / Tiap 8 Jam)' };
    if (freq.includes('2x') || freq.includes('q12h') || freq.includes('bid') || freq.includes('2-3x')) return { count: 2, interval: 12, label: '2x Sehari (q12h / Tiap 12 Jam)' };
    if (freq.includes('48') || freq.includes('2 hari') || freq.includes('eod')) return { count: 1, interval: 48, label: 'Tiap 48 Jam (q48h / Dua Hari Sekali)' };
    return { count: 1, interval: 24, label: '1x Sehari (q24h / SID / Tiap 24 Jam)' };
  }, [speciesProfile.frequency]);

  // Customizable Start Time (default 08:00 AM standard veterinary clinic/home schedule)
  const [startTime, setStartTime] = useState<string>('08:00');
  // Customizable Frequency Override
  const [selectedIntervalHours, setSelectedIntervalHours] = useState<number>(defaultFrequencyInfo.interval);
  // Multi-day cycle viewing (for q48h or day-by-day regimen)
  const [selectedDayCycle, setSelectedDayCycle] = useState<number>(1);
  // Checked-off doses (live simulation tracker)
  const [administeredDoses, setAdministeredDoses] = useState<Record<string, boolean>>({});
  const [copiedSchedule, setCopiedSchedule] = useState<boolean>(false);

  // Sync interval when species/protocol changes
  React.useEffect(() => {
    setSelectedIntervalHours(defaultFrequencyInfo.interval);
  }, [defaultFrequencyInfo.interval]);

  // Calculate checkpoints over a 24-hour cycle (or 48-hour cycle for q48h)
  const timelineCheckpoints = useMemo<TimelineCheckpoint[]>(() => {
    const list: TimelineCheckpoint[] = [];
    const [startH, startM] = startTime.split(':').map((v) => parseInt(v, 10) || 0);
    const startTotalMinutes = startH * 60 + startM;
    const intervalMinutes = selectedIntervalHours * 60;
    const mealAdvice = getTailoredMealAdvice(protocol);

    if (selectedIntervalHours === 48) {
      // Alternate day regimen (Day 1 Dose, Day 2 Off/Rest)
      const isDoseDay = selectedDayCycle % 2 === 1;
      if (isDoseDay) {
        list.push({
          id: `dose-48h-day-${selectedDayCycle}`,
          doseIndex: 1,
          totalDosesInDay: 1,
          timeString: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
          timeMinutes: startTotalMinutes,
          dayLabel: `Hari ke-${selectedDayCycle}`,
          dayOffset: 0,
          periodType: getTimePeriod(startH).periodType,
          periodLabel: getTimePeriod(startH).periodLabel,
          doseMg,
          volumeMl,
          intervalHoursFromPrev: 48,
          intervalHoursToNext: 48,
          mealAdvice,
          route: speciesProfile.route,
          isNextDue: true
        });
      }
      return list;
    }

    // Number of doses in 24 hours
    const dosesCount = Math.max(1, Math.floor(24 / selectedIntervalHours));

    for (let i = 0; i < dosesCount; i++) {
      const currentTotalMinutes = startTotalMinutes + i * intervalMinutes;
      const currentDayOffset = Math.floor(currentTotalMinutes / 1440);
      const normalizedMinutes = currentTotalMinutes % 1440;
      const hours = Math.floor(normalizedMinutes / 60);
      const minutes = normalizedMinutes % 60;
      const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      const period = getTimePeriod(hours);

      list.push({
        id: `dose-${i + 1}-interval-${selectedIntervalHours}`,
        doseIndex: i + 1,
        totalDosesInDay: dosesCount,
        timeString,
        timeMinutes: normalizedMinutes,
        dayLabel: currentDayOffset === 0 ? 'Hari Ini' : 'Hari Berikutnya (+1)',
        dayOffset: currentDayOffset,
        periodType: period.periodType,
        periodLabel: period.periodLabel,
        doseMg,
        volumeMl,
        intervalHoursFromPrev: selectedIntervalHours,
        intervalHoursToNext: selectedIntervalHours,
        mealAdvice,
        route: speciesProfile.route,
        isNextDue: i === 0
      });
    }

    return list;
  }, [startTime, selectedIntervalHours, selectedDayCycle, protocol, doseMg, volumeMl, speciesProfile.route]);

  // Daily totals calculation
  const dailyMetrics = useMemo(() => {
    if (selectedIntervalHours === 48) {
      return {
        dailyDosesCount: 0.5,
        totalDailyMg: doseMg * 0.5,
        totalDailyMl: volumeMl * 0.5,
        totalCourseDoses: Math.ceil(speciesProfile.durationDays / 2),
        totalCourseMl: volumeMl * Math.ceil(speciesProfile.durationDays / 2),
        intervalLabel: 'Tiap 48 Jam (Dua Hari Sekali)'
      };
    }

    const count = Math.max(1, Math.floor(24 / selectedIntervalHours));
    const totalDailyMg = doseMg * count;
    const totalDailyMl = volumeMl * count;
    const totalCourseDoses = count * speciesProfile.durationDays;
    const totalCourseMl = volumeMl * totalCourseDoses;

    return {
      dailyDosesCount: count,
      totalDailyMg,
      totalDailyMl,
      totalCourseDoses,
      totalCourseMl,
      intervalLabel: `Tiap ${selectedIntervalHours} Jam (q${selectedIntervalHours}h)`
    };
  }, [selectedIntervalHours, doseMg, volumeMl, speciesProfile.durationDays]);

  // Formatted WhatsApp/Owner Schedule text
  const shareableScheduleText = useMemo(() => {
    const checkpointLines = timelineCheckpoints.map((cp) => {
      return `  • ⏰ ${cp.timeString} WIB (${cp.periodLabel}): ${cp.doseMg.toFixed(2)} mg ${
        cp.volumeMl > 0 ? `(${cp.volumeMl.toFixed(2)} mL)` : ''
      }\n    ↳ ${cp.mealAdvice}`;
    });

    return `[JADWAL PEMBERIAN OBAT 24 JAM - PETCARE ERP]
Pasien: ${patientName} (${species}, ${weightKg} kg)
Obat: ${protocol.name} (${protocol.category})
Rute: ${speciesProfile.route}
Durasi Terapi: ${speciesProfile.durationDays} hari berturut-turut

📅 JADWAL PEMBERIAN SETIAP 24 JAM (${dailyMetrics.intervalLabel}):
${checkpointLines.join('\n\n')}

💡 Total Harian: ${dailyMetrics.totalDailyMg.toFixed(2)} mg/hari (${dailyMetrics.totalDailyMl.toFixed(2)} mL/hari)
📌 Petunjuk Klinis: ${speciesProfile.clinicalAdvice || 'Gunakan sesuai anjuran dokter hewan penanggung jawab.'}`;
  }, [patientName, species, weightKg, protocol, speciesProfile, timelineCheckpoints, dailyMetrics]);

  const handleCopySchedule = () => {
    navigator.clipboard.writeText(shareableScheduleText);
    setCopiedSchedule(true);
    addToast('Jadwal timeline 24 jam berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopiedSchedule(false), 2500);
  };

  const handleToggleAdministered = (id: string) => {
    setAdministeredDoses((prev) => {
      const nextState = !prev[id];
      if (nextState) {
        addToast('Pemberian dosis ditandai SELESAI.', 'info');
      }
      return { ...prev, [id]: nextState };
    });
  };

  const handleResetChecklist = () => {
    setAdministeredDoses({});
    addToast('Status checklist pemberian dosis di-reset.', 'info');
  };

  return (
    <div id="dose-timeline-view" className={`space-y-4 ${className}`}>
      {/* Top Protocol & Patient Summary Banner */}
      <div className="bg-[#1B2A45] text-[#FFFDF9] p-4 rounded-2xl border border-[#B8905A]/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B8905A]/25 border border-[#B8905A]/50 flex items-center justify-center text-[#D9B98A] shrink-0 shadow-inner">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#B8905A] text-[#101A2C]">
                Timeline Posologi 24 Jam
              </span>
              <span className="text-xs text-[#D9B98A] font-bold">
                {species} ({weightKg} kg)
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold font-display text-white mt-0.5">
              {protocol.name}
            </h3>
            <p className="text-[11px] text-[#EDE6D6]/80 flex items-center gap-1.5 flex-wrap">
              <span>{speciesProfile.route}</span>
              <span>•</span>
              <span className="font-semibold text-[#D9B98A]">{speciesProfile.frequency}</span>
              <span>•</span>
              <span>Durasi: {speciesProfile.durationDays} hari</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleCopySchedule}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-[#FFFDF9] rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/20 cursor-pointer transition-colors"
          >
            {copiedSchedule ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Jadwal Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#D9B98A]" />
                <span>Salin Jadwal 24 Jam</span>
              </>
            )}
          </button>

          {onBackToCalculator && (
            <button
              type="button"
              onClick={onBackToCalculator}
              className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#E1D6BE] text-[#1B2A45] rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Ubah Dosis</span>
            </button>
          )}
        </div>
      </div>

      {/* TIMELINE CONTROLS PANEL */}
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#E1D6BE] p-4 space-y-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E1D6BE] pb-2.5">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-[#B8905A]" />
            <span className="font-bold text-xs sm:text-sm text-[#1B2A45]">
              Konfigurasi Waktu & Interval Pemberian:
            </span>
          </div>
          <span className="text-[11px] text-[#6B6656]">
            Sesuaikan dengan ritme makan & pemberian pakan pasien
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Control 1: First Dose Start Time */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1B2A45] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#B8905A]" />
                <span>Waktu Dosis Pertama (Mulai):</span>
              </span>
              <span className="font-mono text-[11px] text-[#B8905A] font-black">{startTime} WIB</span>
            </label>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['06:00', '07:00', '08:00', '09:00', '12:00', '18:00', '20:00'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setStartTime(t)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                    startTime === t
                      ? 'bg-[#1B2A45] text-white border-[#1B2A45] shadow-xs'
                      : 'bg-white text-[#6B6656] border-[#E1D6BE] hover:bg-[#E1D6BE]/40'
                  }`}
                >
                  {t}
                </button>
              ))}

              <div className="flex items-center gap-1 bg-white border border-[#E1D6BE] rounded-lg px-2 py-0.5 shadow-2xs">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value || '08:00')}
                  className="text-xs font-mono font-bold text-[#1B2A45] focus:outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Control 2: Interval Selection Override */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1B2A45] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-[#B8905A]" />
                <span>Frekuensi & Interval Antar Dosis:</span>
              </span>
              <span className="text-[10px] text-[#6B6656]">
                Protokol: {speciesProfile.frequency}
              </span>
            </label>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { hours: 24, label: '1x/hari (q24h)' },
                { hours: 12, label: '2x/hari (q12h)' },
                { hours: 8, label: '3x/hari (q8h)' },
                { hours: 6, label: '4x/hari (q6h)' },
                { hours: 48, label: 'Tiap 48 Jam (q48h)' }
              ].map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => setSelectedIntervalHours(opt.hours)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedIntervalHours === opt.hours
                      ? 'bg-[#B8905A] text-[#101A2C] border-[#B8905A] shadow-xs'
                      : 'bg-white text-[#6B6656] border-[#E1D6BE] hover:bg-[#E1D6BE]/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alternate Day Selector (if q48h) */}
        {selectedIntervalHours === 48 && (
          <div className="pt-2 border-t border-[#E1D6BE] flex items-center justify-between gap-2 flex-wrap text-xs bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
            <div className="flex items-center gap-1.5 text-amber-950 font-semibold">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Regimen Alternate-Day (q48h): Diberikan selang-seling 2 hari sekali.</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-amber-900 font-bold">Lihat Hari Ke:</span>
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDayCycle(d)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    selectedDayCycle === d
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-amber-900 border border-amber-300'
                  }`}
                >
                  Hari {d} {d % 2 === 1 ? '💊' : '💤'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 24-HOUR CUMULATIVE PHARMACOLOGICAL SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#FFFDF9] p-3 rounded-xl border border-[#E1D6BE] shadow-2xs">
          <span className="text-[10px] text-[#6B6656] uppercase font-bold tracking-wider block">
            Dosis Per Pemberian
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-[#1B2A45] font-mono">{doseMg.toFixed(2)}</span>
            <span className="text-xs font-bold text-[#6B6656]">mg</span>
          </div>
          <span className="text-[10px] text-[#9E7848] font-bold mt-0.5 block font-mono">
            {volumeMl.toFixed(2)} mL ({concentration} mg/mL)
          </span>
        </div>

        <div className="bg-[#FFFDF9] p-3 rounded-xl border border-[#E1D6BE] shadow-2xs">
          <span className="text-[10px] text-[#6B6656] uppercase font-bold tracking-wider block">
            Akumulasi 24 Jam
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-amber-600 font-mono">
              {dailyMetrics.totalDailyMg.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-[#6B6656]">mg/hari</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block font-mono">
            {dailyMetrics.totalDailyMl.toFixed(2)} mL/hari ({dailyMetrics.dailyDosesCount}x pemberian)
          </span>
        </div>

        <div className="bg-[#FFFDF9] p-3 rounded-xl border border-[#E1D6BE] shadow-2xs">
          <span className="text-[10px] text-[#6B6656] uppercase font-bold tracking-wider block">
            Jeda Antar Dosis
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-[#1B2A45] font-mono">
              {selectedIntervalHours}
            </span>
            <span className="text-xs font-bold text-[#6B6656]">Jam</span>
          </div>
          <span className="text-[10px] text-[#6B6656] mt-0.5 block">
            Eliminasi & ritme stabil
          </span>
        </div>

        <div className="bg-[#FFFDF9] p-3 rounded-xl border border-[#E1D6BE] shadow-2xs">
          <span className="text-[10px] text-[#6B6656] uppercase font-bold tracking-wider block">
            Total Siklus Terapi
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-[#1B2A45] font-mono">
              {speciesProfile.durationDays}
            </span>
            <span className="text-xs font-bold text-[#6B6656]">Hari</span>
          </div>
          <span className="text-[10px] text-[#6B6656] mt-0.5 block">
            Total {dailyMetrics.totalCourseDoses}x ({dailyMetrics.totalCourseMl.toFixed(1)} mL)
          </span>
        </div>
      </div>

      {/* CORE VERTICAL 24-HOUR TIMELINE VISUALIZATION */}
      <div className="bg-[#FFFDF9] rounded-2xl border-2 border-[#B8905A]/30 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E1D6BE] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#B8905A]" />
            <div>
              <h4 className="font-black text-sm sm:text-base text-[#1B2A45] font-display">
                Visualisasi Jadwal Interval & Pemberian Dosis (24 Jam)
              </h4>
              <p className="text-[11px] text-[#6B6656]">
                Garis alur vertikal menunjukkan urutan waktu, jumlah miligram, volume cairan, dan petunjuk makan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetChecklist}
              className="text-[11px] text-[#6B6656] hover:text-[#1B2A45] flex items-center gap-1 font-semibold cursor-pointer"
              title="Reset checklist simulasi"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Checklist</span>
            </button>
          </div>
        </div>

        {/* VERTICAL TIMELINE CONTAINER */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#B8905A] before:via-[#1B2A45] before:to-[#B8905A]">
          {timelineCheckpoints.length === 0 ? (
            <div className="p-6 text-center bg-[#FAF7F2] rounded-xl border border-dashed border-[#E1D6BE] text-[#6B6656] text-xs">
              <Moon className="w-8 h-8 mx-auto text-[#B8905A] opacity-60 mb-2" />
              <p className="font-bold text-[#1B2A45]">Hari Ini Tidak Ada Jadwal Pemberian (Hari Istirahat / Off)</p>
              <p className="text-[11px] mt-1">
                Pada regimen q48h, obat diberikan setiap 2 hari sekali untuk membiarkan tubuh mengeliminasi metabolit secara sempurna.
              </p>
            </div>
          ) : (
            timelineCheckpoints.map((cp, idx) => {
              const period = getTimePeriod(parseInt(cp.timeString.split(':')[0], 10));
              const PeriodIcon = period.icon;
              const isChecked = !!administeredDoses[cp.id];
              const isLast = idx === timelineCheckpoints.length - 1;

              return (
                <div key={cp.id} className="relative group">
                  {/* Vertical Node Anchor */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-3.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-md transition-all z-10 ${
                      isChecked
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : `${period.themeClass.nodeBg} text-white ring-4 ${period.themeClass.nodeRing}`
                    }`}
                  >
                    {isChecked ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <span className="text-[10px] font-black font-mono">{cp.doseIndex}</span>
                    )}
                  </div>

                  {/* Main Checkpoint Card */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      isChecked
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                        : `${period.themeClass.bg} ${period.themeClass.border} shadow-xs hover:shadow-md`
                    }`}
                  >
                    {/* Header of Checkpoint Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-black/10">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Time Badge */}
                        <div className="flex items-center gap-1.5 bg-[#1B2A45] text-white px-3 py-1 rounded-xl shadow-xs">
                          <Clock className="w-3.5 h-3.5 text-[#D9B98A]" />
                          <span className="font-mono font-black text-sm tracking-tight">{cp.timeString} WIB</span>
                        </div>

                        {/* Period of Day Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 ${period.themeClass.badgeBg} ${period.themeClass.badgeText}`}
                        >
                          <PeriodIcon className="w-3.5 h-3.5" />
                          <span>{period.periodLabel}</span>
                        </span>

                        {/* Day indicator */}
                        <span className="text-[10px] font-semibold text-[#6B6656] bg-white/80 px-2 py-0.5 rounded border border-black/5">
                          Dosis #{cp.doseIndex} dari {cp.totalDosesInDay} ({cp.dayLabel})
                        </span>
                      </div>

                      {/* Interactive Administration Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleAdministered(cp.id)}
                        className={`px-3 py-1 text-xs font-bold rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                            : 'bg-white hover:bg-[#FAF7F2] text-[#1B2A45] border-[#E1D6BE]'
                        }`}
                      >
                        {isChecked ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>Telah Diberikan ✓</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5 text-[#6B6656]" />
                            <span>Tandai Diberikan</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Body: Posology & Dosing Metrics */}
                    <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Metric 1: Exact Active Dose */}
                      <div className="bg-white/90 p-2.5 rounded-xl border border-black/5 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#1B2A45] text-[#D9B98A] flex items-center justify-center shrink-0">
                          <Pill className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] text-[#6B6656] uppercase font-bold block">
                            Dosis Aktif
                          </span>
                          <span className="text-sm font-black text-[#1B2A45] font-mono">
                            {cp.doseMg.toFixed(2)} mg
                          </span>
                          <span className="text-[9px] text-[#6B6656] block truncate">
                            {customDoseMgKg} mg/kg
                          </span>
                        </div>
                      </div>

                      {/* Metric 2: Volume / Quantity */}
                      <div className="bg-white/90 p-2.5 rounded-xl border border-black/5 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Syringe className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] text-[#6B6656] uppercase font-bold block">
                            Volume Sediaan Cair
                          </span>
                          <span className="text-sm font-black text-emerald-700 font-mono">
                            {cp.volumeMl.toFixed(2)} mL
                          </span>
                          <span className="text-[9px] text-[#6B6656] block truncate">
                            {concentration} mg/mL
                          </span>
                        </div>
                      </div>

                      {/* Metric 3: Route */}
                      <div className="bg-white/90 p-2.5 rounded-xl border border-black/5 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] text-[#6B6656] uppercase font-bold block">
                            Rute Pemberian
                          </span>
                          <span className="text-xs font-bold text-[#1B2A45] truncate block">
                            {cp.route}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Meal & Clinical Directive */}
                    <div className="mt-2.5 bg-white/95 p-2.5 rounded-xl border border-black/5 text-xs text-[#1B2A45] flex items-start gap-2">
                      <Utensils className="w-4 h-4 text-[#B8905A] shrink-0 mt-0.5" />
                      <div className="leading-snug">
                        <strong className="text-[#1B2A45]">Petunjuk Makanan & Pemberian: </strong>
                        <span className="text-slate-800">{cp.mealAdvice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interval connector badge between checkpoints */}
                  {!isLast && (
                    <div className="my-2 ml-4 flex items-center gap-2 text-[11px] font-bold text-[#6B6656]">
                      <div className="px-2.5 py-0.5 rounded-full bg-[#1B2A45] text-[#D9B98A] flex items-center gap-1 shadow-2xs text-[10px] font-mono">
                        <Timer className="w-3 h-3" />
                        <span>Jeda Interval: +{selectedIntervalHours} Jam (q{selectedIntervalHours}h)</span>
                      </div>
                      <span className="text-[10px] text-[#6B6656] italic">
                        ↳ Metabolisme & eliminasi obat terjaga optimal
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Day-Night Cycle Legend */}
        <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E1D6BE] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B6656]">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-[#1B2A45] flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-[#B8905A]" />
              <span>Panduan Zona Waktu:</span>
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Pagi (05:00-11:00)</span>
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Siang (11:00-15:00)</span>
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Sore (15:00-18:30)</span>
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <span>Malam (18:30-24:00)</span>
            </span>
          </div>

          <div className="text-[11px] font-mono text-[#1B2A45]">
            Siklus 24 Jam: <strong>{timelineCheckpoints.length} Titik Waktu</strong>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E1D6BE]">
          <span className="text-[11px] text-[#6B6656] italic">
            * Jadwal ini dapat disalin dan dibagikan langsung kepada pemilik hewan sebagai panduan pemberian obat di rumah.
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <button
              type="button"
              onClick={handleCopySchedule}
              className="flex-1 sm:flex-initial px-4 py-2 bg-[#1B2A45] hover:bg-[#2A3F64] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-[#D9B98A]" />
              <span>{copiedSchedule ? 'Jadwal Tersalin!' : 'Bagikan Jadwal'}</span>
            </button>

            {onSaveToEMR && (
              <button
                type="button"
                onClick={onSaveToEMR}
                disabled={speciesProfile.contraindicated}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                  isSavedToEMR
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
                title="Catat jadwal dan dosis obat ini ke EMR pasien aktif"
              >
                {isSavedToEMR ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Tersimpan ke EMR ✓</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Simpan ke EMR</span>
                  </>
                )}
              </button>
            )}

            {onApplyToPrescription && (
              <button
                type="button"
                onClick={onApplyToPrescription}
                className="flex-1 sm:flex-initial px-4 py-2 bg-[#B8905A] hover:bg-[#9E7848] text-[#101A2C] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Terapkan ke Resep SOAP</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
