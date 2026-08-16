import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import {
  Activity,
  Thermometer,
  Heart,
  Scale,
  Wind,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Table as TableIcon,
  LineChart as ChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Info,
  Layers
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export interface VitalSignsSummaryProps {
  petId?: string;
  petName?: string;
  species?: string;
  currentDraftVitals?: {
    tempC?: number;
    hr?: number;
    rr?: number;
    weightKg?: number;
  };
  onApplyVitalsToDraft?: (vitals: { tempC?: number; hr?: number; rr?: number; weightKg?: number }) => void;
  className?: string;
}

export interface VitalDataPoint {
  id: string;
  date: string;
  formattedDate: string;
  source: string;
  doctorName?: string;
  temperatureC?: number;
  heartRate?: number;
  respiratoryRate?: number;
  weightKg?: number;
  systolicBP?: number;
  diastolicBP?: number;
  notes?: string;
  isDraft?: boolean;
}

// Species standard physiological ranges (Veterinary Medicine reference)
const SPECIES_RANGES: Record<
  string,
  {
    tempMin: number;
    tempMax: number;
    hrMin: number;
    hrMax: number;
    rrMin: number;
    rrMax: number;
    defaultWeightUnit: string;
  }
> = {
  Anjing: {
    tempMin: 37.8,
    tempMax: 39.2,
    hrMin: 70,
    hrMax: 140,
    rrMin: 18,
    rrMax: 34,
    defaultWeightUnit: 'kg'
  },
  Kucing: {
    tempMin: 38.1,
    tempMax: 39.2,
    hrMin: 140,
    hrMax: 220,
    rrMin: 20,
    rrMax: 40,
    defaultWeightUnit: 'kg'
  },
  default: {
    tempMin: 37.8,
    tempMax: 39.2,
    hrMin: 80,
    hrMax: 160,
    rrMin: 20,
    rrMax: 35,
    defaultWeightUnit: 'kg'
  }
};

export const VitalSignsSummary: React.FC<VitalSignsSummaryProps> = ({
  petId,
  petName = 'Pasien',
  species = 'Anjing',
  currentDraftVitals,
  onApplyVitalsToDraft,
  className = ''
}) => {
  const { soapNotes = [], pets = [], dailyMonitorings = [] } = useData();
  const { addToast } = useToast();

  const [timeRange, setTimeRange] = useState<'all' | '6m' | '1y'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'chart' | 'table'>('cards');
  const [selectedMetric, setSelectedMetric] = useState<'temp' | 'hr' | 'weight' | 'rr'>('temp');

  const ranges = useMemo(() => {
    return SPECIES_RANGES[species] || SPECIES_RANGES.default;
  }, [species]);

  // Extract all historical vitals for this pet from EMR (SOAP notes + daily monitoring)
  const historyData = useMemo(() => {
    if (!petId) return [];

    const pet = (pets || []).find((p) => p.id === petId);
    const matchedSoaps = (soapNotes || []).filter((s) => s.petId === petId);
    const matchedMonitoring = (dailyMonitorings || []).filter(
      (m) => m.petName.toLowerCase() === (pet?.name || '').toLowerCase()
    );

    const points: VitalDataPoint[] = [];

    matchedSoaps.forEach((s) => {
      if (s.temperatureC || s.heartRate || s.respiratoryRate || s.weightKg) {
        points.push({
          id: s.id,
          date: s.date,
          formattedDate: new Date(s.date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          source: `Kunjungan EMR (${s.workingDiagnosis || 'SOAP'})`,
          doctorName: s.doctorName,
          temperatureC: s.temperatureC,
          heartRate: s.heartRate,
          respiratoryRate: s.respiratoryRate,
          weightKg: s.weightKg,
          systolicBP: s.systolicBP,
          diastolicBP: s.diastolicBP,
          notes: s.physicalExamNotes
        });
      }
    });

    matchedMonitoring.forEach((m) => {
      if (m.temperatureC) {
        points.push({
          id: m.id,
          date: m.date,
          formattedDate: new Date(m.date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          source: 'Rawat Inap / Hotel Monitor',
          doctorName: m.staffName,
          temperatureC: m.temperatureC,
          notes: m.notes
        });
      }
    });

    // Sort chronologically ascending
    points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // If there's active draft data with values, append as the "Saat Ini (Draft)" point
    if (
      currentDraftVitals &&
      (currentDraftVitals.tempC ||
        currentDraftVitals.hr ||
        currentDraftVitals.rr ||
        currentDraftVitals.weightKg)
    ) {
      const todayStr = new Date().toISOString().split('T')[0];
      points.push({
        id: 'current-draft-vital',
        date: todayStr,
        formattedDate: 'Hari Ini (Draft)',
        source: 'Pemeriksaan Aktif (Draft SOAP)',
        doctorName: 'Dokter Pemeriksa',
        temperatureC: currentDraftVitals.tempC ? Number(currentDraftVitals.tempC) : undefined,
        heartRate: currentDraftVitals.hr ? Number(currentDraftVitals.hr) : undefined,
        respiratoryRate: currentDraftVitals.rr ? Number(currentDraftVitals.rr) : undefined,
        weightKg: currentDraftVitals.weightKg ? Number(currentDraftVitals.weightKg) : undefined,
        isDraft: true
      });
    }

    return points;
  }, [petId, soapNotes, dailyMonitorings, pets, currentDraftVitals]);

  // Filtered by selected time window
  const filteredData = useMemo(() => {
    if (timeRange === 'all') return historyData;
    const now = new Date().getTime();
    const limitMonths = timeRange === '6m' ? 6 : 12;
    const cutoff = now - limitMonths * 30 * 24 * 60 * 60 * 1000;

    return historyData.filter((item) => new Date(item.date).getTime() >= cutoff || item.isDraft);
  }, [historyData, timeRange]);

  // Compute key stats for each metric
  const stats = useMemo(() => {
    const validTemps = filteredData
      .map((d) => d.temperatureC)
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const validHrs = filteredData
      .map((d) => d.heartRate)
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const validWeights = filteredData
      .map((d) => d.weightKg)
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const validRrs = filteredData
      .map((d) => d.respiratoryRate)
      .filter((v): v is number => typeof v === 'number' && v > 0);

    const calcTrend = (arr: number[]) => {
      if (arr.length < 2) return { delta: 0, status: 'stable' as const };
      const latest = arr[arr.length - 1];
      const previous = arr[arr.length - 2];
      const diff = Number((latest - previous).toFixed(2));
      return {
        delta: diff,
        status: diff > 0 ? ('up' as const) : diff < 0 ? ('down' as const) : ('stable' as const),
        latest,
        previous
      };
    };

    const tempTrend = calcTrend(validTemps);
    const hrTrend = calcTrend(validHrs);
    const weightTrend = calcTrend(validWeights);
    const rrTrend = calcTrend(validRrs);

    const getStatus = (
      val: number | undefined,
      min: number,
      max: number,
      labelLow: string,
      labelHigh: string
    ) => {
      if (val === undefined) return { label: 'Tidak ada data', color: 'text-[#6B6656] bg-stone-100 border-stone-200' };
      if (val < min) return { label: labelLow, color: 'text-blue-700 bg-blue-50 border-blue-200' };
      if (val > max) return { label: labelHigh, color: 'text-amber-800 bg-amber-50 border-amber-300' };
      return { label: 'Normal', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    };

    return {
      temp: {
        latest: validTemps[validTemps.length - 1],
        min: validTemps.length ? Math.min(...validTemps) : 0,
        max: validTemps.length ? Math.max(...validTemps) : 0,
        avg: validTemps.length ? Number((validTemps.reduce((a, b) => a + b, 0) / validTemps.length).toFixed(1)) : 0,
        trend: tempTrend,
        status: getStatus(validTemps[validTemps.length - 1], ranges.tempMin, ranges.tempMax, 'Hipotermia (<37.8°C)', 'Febris (>39.2°C)')
      },
      hr: {
        latest: validHrs[validHrs.length - 1],
        min: validHrs.length ? Math.min(...validHrs) : 0,
        max: validHrs.length ? Math.max(...validHrs) : 0,
        avg: validHrs.length ? Math.round(validHrs.reduce((a, b) => a + b, 0) / validHrs.length) : 0,
        trend: hrTrend,
        status: getStatus(validHrs[validHrs.length - 1], ranges.hrMin, ranges.hrMax, 'Bradikardia', 'Takikardia')
      },
      weight: {
        latest: validWeights[validWeights.length - 1],
        min: validWeights.length ? Math.min(...validWeights) : 0,
        max: validWeights.length ? Math.max(...validWeights) : 0,
        avg: validWeights.length ? Number((validWeights.reduce((a, b) => a + b, 0) / validWeights.length).toFixed(1)) : 0,
        trend: weightTrend,
        status: { label: 'Trajektori BB', color: 'text-[#1B2A45] bg-[#F6F1E6] border-[#E1D6BE]' }
      },
      rr: {
        latest: validRrs[validRrs.length - 1],
        min: validRrs.length ? Math.min(...validRrs) : 0,
        max: validRrs.length ? Math.max(...validRrs) : 0,
        avg: validRrs.length ? Math.round(validRrs.reduce((a, b) => a + b, 0) / validRrs.length) : 0,
        trend: rrTrend,
        status: getStatus(validRrs[validRrs.length - 1], ranges.rrMin, ranges.rrMax, 'Bradipnea', 'Takipnea')
      }
    };
  }, [filteredData, ranges]);

  // Copy latest recorded vitals to SOAP Draft handler
  const handleCopyLatestToDraft = () => {
    if (!onApplyVitalsToDraft) return;
    const latestRecorded = historyData.filter((d) => !d.isDraft).slice(-1)[0];
    if (!latestRecorded) {
      addToast('Belum ada riwayat tanda vital sebelumnya.', 'error');
      return;
    }

    onApplyVitalsToDraft({
      tempC: latestRecorded.temperatureC,
      hr: latestRecorded.heartRate,
      rr: latestRecorded.respiratoryRate,
      weightKg: latestRecorded.weightKg
    });
    addToast('Tanda vital rekam medis terakhir berhasil disalin ke draft SOAP!', 'success');
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: VitalDataPoint = payload[0].payload;
      return (
        <div className="bg-[#1B2A45] text-[#FFFDF9] p-2.5 rounded-lg shadow-xl border border-[#B8905A]/40 text-xs z-50">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-1.5 mb-1.5">
            <span className="font-bold text-[#D9B98A] flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {data.formattedDate}
            </span>
            {data.isDraft && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 text-[10px] font-bold">
                Draft Aktif
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#EDE6D6]/80 mb-2">{data.source}</p>
          <div className="space-y-1 font-mono">
            {data.temperatureC !== undefined && (
              <div className="flex justify-between gap-4">
                <span className="text-[#EDE6D6]">Suhu:</span>
                <span className="font-bold text-amber-300">{data.temperatureC}°C</span>
              </div>
            )}
            {data.heartRate !== undefined && (
              <div className="flex justify-between gap-4">
                <span className="text-[#EDE6D6]">Heart Rate:</span>
                <span className="font-bold text-rose-300">{data.heartRate} BPM</span>
              </div>
            )}
            {data.weightKg !== undefined && (
              <div className="flex justify-between gap-4">
                <span className="text-[#EDE6D6]">Berat:</span>
                <span className="font-bold text-blue-300">{data.weightKg} kg</span>
              </div>
            )}
            {data.respiratoryRate !== undefined && (
              <div className="flex justify-between gap-4">
                <span className="text-[#EDE6D6]">Resp Rate:</span>
                <span className="font-bold text-emerald-300">{data.respiratoryRate} RPM</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="vital-signs-summary"
      className={`bg-[#FFFDF9] rounded-2xl border border-[#E1D6BE] shadow-sm overflow-hidden ${className}`}
    >
      {/* Header Bar */}
      <div className="p-4 bg-[#F6F1E6]/70 border-b border-[#E1D6BE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1B2A45] text-[#D9B98A] flex items-center justify-center shadow-xs shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#1B2A45] font-display">
                Ringkasan Tanda Vital (Vital Signs EMR)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#1B2A45]/10 text-[#1B2A45] text-[10px] font-bold border border-[#1B2A45]/20">
                Spesies: {species}
              </span>
            </div>
            <p className="text-[11px] text-[#6B6656]">
              Tren sparkline temperatur, detak jantung, laju napas, & berat badan {petName}
            </p>
          </div>
        </div>

        {/* View & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time range selector */}
          <div className="flex items-center bg-[#FFFDF9] rounded-lg border border-[#E1D6BE] p-0.5 text-[11px]">
            <button
              onClick={() => setTimeRange('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                timeRange === 'all'
                  ? 'bg-[#1B2A45] text-[#FFFDF9]'
                  : 'text-[#6B6656] hover:text-[#1B2A45]'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setTimeRange('1y')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                timeRange === '1y'
                  ? 'bg-[#1B2A45] text-[#FFFDF9]'
                  : 'text-[#6B6656] hover:text-[#1B2A45]'
              }`}
            >
              1 Thn
            </button>
            <button
              onClick={() => setTimeRange('6m')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                timeRange === '6m'
                  ? 'bg-[#1B2A45] text-[#FFFDF9]'
                  : 'text-[#6B6656] hover:text-[#1B2A45]'
              }`}
            >
              6 Bln
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#FFFDF9] rounded-lg border border-[#E1D6BE] p-0.5 text-[11px]">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md font-semibold transition-all flex items-center gap-1 ${
                viewMode === 'cards'
                  ? 'bg-[#1B2A45] text-[#FFFDF9]'
                  : 'text-[#6B6656] hover:text-[#1B2A45]'
              }`}
              title="Tampilan Kartu Sparkline"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`p-1.5 rounded-md font-semibold transition-all flex items-center gap-1 ${
                viewMode === 'chart'
                  ? 'bg-[#1B2A45] text-[#FFFDF9]'
                  : 'text-[#6B6656] hover:text-[#1B2A45]'
              }`}
              title="Grafik Tren Detail"
            >
              <ChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md font-semibold transition-all flex items-center gap-1 ${
                viewMode === 'table'
                  ? 'bg-[#1B2A45] text-[#FFFDF9]'
                  : 'text-[#6B6656] hover:text-[#1B2A45]'
              }`}
              title="Tabel Rekam Medis"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Copy Baseline to Draft */}
          {onApplyVitalsToDraft && (
            <button
              onClick={handleCopyLatestToDraft}
              className="px-2.5 py-1.5 bg-[#FFFDF9] hover:bg-[#F6F1E6] text-[#1B2A45] border border-[#E1D6BE] text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-2xs"
              title="Salin hasil tanda vital terakhir ke form SOAP saat ini"
            >
              <Copy className="w-3.5 h-3.5 text-[#B8905A]" />
              <span className="hidden md:inline">Salin Terakhir</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-4">
        {/* CARDS VIEW: 4 SPARKLINE METRIC CARDS */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. TEMPERATURE SPARKLINE CARD */}
            <div
              id="vital-card-temp"
              className="bg-[#FFFDF9] rounded-xl border border-[#E1D6BE] p-3.5 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#B8905A] font-bold text-xs">
                    <Thermometer className="w-4 h-4" />
                    <span>Suhu Tubuh</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stats.temp.status.color}`}
                  >
                    {stats.temp.status.label}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[#1B2A45] font-mono">
                      {stats.temp.latest !== undefined ? stats.temp.latest : '--'}
                    </span>
                    <span className="text-xs text-[#6B6656] font-semibold">°C</span>
                  </div>

                  {stats.temp.trend.delta !== 0 && (
                    <div
                      className={`flex items-center text-[11px] font-bold ${
                        stats.temp.trend.status === 'up'
                          ? 'text-amber-700'
                          : stats.temp.trend.status === 'down'
                          ? 'text-blue-700'
                          : 'text-[#6B6656]'
                      }`}
                    >
                      {stats.temp.trend.status === 'up' ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {stats.temp.trend.delta > 0 ? `+${stats.temp.trend.delta}` : stats.temp.trend.delta}°C
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sparkline Chart */}
              <div className="h-16 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredData} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D97706" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="temperatureC"
                      stroke="#D97706"
                      strokeWidth={2}
                      fill="url(#tempGrad)"
                      dot={{ r: 2, fill: '#D97706' }}
                      activeDot={{ r: 4, fill: '#B45309' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom Reference Info */}
              <div className="pt-2 border-t border-[#E1D6BE]/60 flex items-center justify-between text-[10px] text-[#6B6656]">
                <span>
                  Normal: {ranges.tempMin} - {ranges.tempMax}°C
                </span>
                <span>Rata²: {stats.temp.avg}°C</span>
              </div>
            </div>

            {/* 2. HEART RATE SPARKLINE CARD */}
            <div
              id="vital-card-hr"
              className="bg-[#FFFDF9] rounded-xl border border-[#E1D6BE] p-3.5 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs">
                    <Heart className="w-4 h-4" />
                    <span>Detak Jantung</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stats.hr.status.color}`}
                  >
                    {stats.hr.status.label}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[#1B2A45] font-mono">
                      {stats.hr.latest !== undefined ? stats.hr.latest : '--'}
                    </span>
                    <span className="text-xs text-[#6B6656] font-semibold">BPM</span>
                  </div>

                  {stats.hr.trend.delta !== 0 && (
                    <div
                      className={`flex items-center text-[11px] font-bold ${
                        stats.hr.trend.status === 'up'
                          ? 'text-rose-600'
                          : stats.hr.trend.status === 'down'
                          ? 'text-blue-600'
                          : 'text-[#6B6656]'
                      }`}
                    >
                      {stats.hr.trend.status === 'up' ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {stats.hr.trend.delta > 0 ? `+${stats.hr.trend.delta}` : stats.hr.trend.delta} bpm
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sparkline Chart */}
              <div className="h-16 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredData} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E11D48" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="heartRate"
                      stroke="#E11D48"
                      strokeWidth={2}
                      fill="url(#hrGrad)"
                      dot={{ r: 2, fill: '#E11D48' }}
                      activeDot={{ r: 4, fill: '#BE123C' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom Reference Info */}
              <div className="pt-2 border-t border-[#E1D6BE]/60 flex items-center justify-between text-[10px] text-[#6B6656]">
                <span>
                  Normal: {ranges.hrMin} - {ranges.hrMax} bpm
                </span>
                <span>Rata²: {stats.hr.avg} bpm</span>
              </div>
            </div>

            {/* 3. WEIGHT SPARKLINE CARD */}
            <div
              id="vital-card-weight"
              className="bg-[#FFFDF9] rounded-xl border border-[#E1D6BE] p-3.5 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                    <Scale className="w-4 h-4" />
                    <span>Berat Badan</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stats.weight.status.color}`}
                  >
                    {stats.weight.status.label}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[#1B2A45] font-mono">
                      {stats.weight.latest !== undefined ? stats.weight.latest : '--'}
                    </span>
                    <span className="text-xs text-[#6B6656] font-semibold">kg</span>
                  </div>

                  {stats.weight.trend.delta !== 0 && (
                    <div
                      className={`flex items-center text-[11px] font-bold ${
                        stats.weight.trend.status === 'up'
                          ? 'text-emerald-700'
                          : stats.weight.trend.status === 'down'
                          ? 'text-amber-700'
                          : 'text-[#6B6656]'
                      }`}
                    >
                      {stats.weight.trend.status === 'up' ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {stats.weight.trend.delta > 0 ? `+${stats.weight.trend.delta}` : stats.weight.trend.delta} kg
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sparkline Chart */}
              <div className="h-16 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredData} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="weightKg"
                      stroke="#2563EB"
                      strokeWidth={2}
                      fill="url(#weightGrad)"
                      dot={{ r: 2, fill: '#2563EB' }}
                      activeDot={{ r: 4, fill: '#1D4ED8' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom Reference Info */}
              <div className="pt-2 border-t border-[#E1D6BE]/60 flex items-center justify-between text-[10px] text-[#6B6656]">
                <span>
                  Min: {stats.weight.min} kg • Max: {stats.weight.max} kg
                </span>
                <span>Rata²: {stats.weight.avg} kg</span>
              </div>
            </div>

            {/* 4. RESPIRATORY RATE SPARKLINE CARD */}
            <div
              id="vital-card-rr"
              className="bg-[#FFFDF9] rounded-xl border border-[#E1D6BE] p-3.5 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-teal-700 font-bold text-xs">
                    <Wind className="w-4 h-4" />
                    <span>Laju Napas</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stats.rr.status.color}`}
                  >
                    {stats.rr.status.label}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[#1B2A45] font-mono">
                      {stats.rr.latest !== undefined ? stats.rr.latest : '--'}
                    </span>
                    <span className="text-xs text-[#6B6656] font-semibold">RPM</span>
                  </div>

                  {stats.rr.trend.delta !== 0 && (
                    <div
                      className={`flex items-center text-[11px] font-bold ${
                        stats.rr.trend.status === 'up'
                          ? 'text-amber-700'
                          : stats.rr.trend.status === 'down'
                          ? 'text-blue-700'
                          : 'text-[#6B6656]'
                      }`}
                    >
                      {stats.rr.trend.status === 'up' ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {stats.rr.trend.delta > 0 ? `+${stats.rr.trend.delta}` : stats.rr.trend.delta} rpm
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sparkline Chart */}
              <div className="h-16 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredData} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="respiratoryRate"
                      stroke="#0D9488"
                      strokeWidth={2}
                      fill="url(#rrGrad)"
                      dot={{ r: 2, fill: '#0D9488' }}
                      activeDot={{ r: 4, fill: '#0F766E' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom Reference Info */}
              <div className="pt-2 border-t border-[#E1D6BE]/60 flex items-center justify-between text-[10px] text-[#6B6656]">
                <span>
                  Normal: {ranges.rrMin} - {ranges.rrMax} rpm
                </span>
                <span>Rata²: {stats.rr.avg} rpm</span>
              </div>
            </div>
          </div>
        )}

        {/* DETAILED CHART VIEW */}
        {viewMode === 'chart' && (
          <div className="bg-[#FFFDF9] rounded-xl border border-[#E1D6BE] p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E1D6BE] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1B2A45]">Pilih Parameter Utama:</span>
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => setSelectedMetric('temp')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      selectedMetric === 'temp'
                        ? 'bg-[#B8905A] text-[#FFFDF9]'
                        : 'bg-[#F6F1E6] text-[#6B6656] hover:bg-[#E1D6BE]'
                    }`}
                  >
                    Suhu Tubuh (°C)
                  </button>
                  <button
                    onClick={() => setSelectedMetric('hr')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      selectedMetric === 'hr'
                        ? 'bg-rose-600 text-[#FFFDF9]'
                        : 'bg-[#F6F1E6] text-[#6B6656] hover:bg-[#E1D6BE]'
                    }`}
                  >
                    Heart Rate (BPM)
                  </button>
                  <button
                    onClick={() => setSelectedMetric('weight')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      selectedMetric === 'weight'
                        ? 'bg-blue-600 text-[#FFFDF9]'
                        : 'bg-[#F6F1E6] text-[#6B6656] hover:bg-[#E1D6BE]'
                    }`}
                  >
                    Berat Badan (kg)
                  </button>
                  <button
                    onClick={() => setSelectedMetric('rr')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      selectedMetric === 'rr'
                        ? 'bg-teal-600 text-[#FFFDF9]'
                        : 'bg-[#F6F1E6] text-[#6B6656] hover:bg-[#E1D6BE]'
                    }`}
                  >
                    Laju Napas (RPM)
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-[#6B6656] flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-[#B8905A]" />
                Area bergaris hijau menandakan rentang fisiologis normal {species}.
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <XAxis
                    dataKey="formattedDate"
                    tick={{ fontSize: 11, fill: '#6B6656' }}
                    axisLine={{ stroke: '#E1D6BE' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={
                      selectedMetric === 'temp'
                        ? [36.5, 41]
                        : selectedMetric === 'hr'
                        ? [50, 240]
                        : selectedMetric === 'weight'
                        ? ['dataMin - 1', 'dataMax + 1']
                        : [10, 50]
                    }
                    tick={{ fontSize: 11, fill: '#6B6656' }}
                    axisLine={{ stroke: '#E1D6BE' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {/* Reference normal range lines */}
                  {selectedMetric === 'temp' && (
                    <>
                      <ReferenceLine
                        y={ranges.tempMin}
                        stroke="#10B981"
                        strokeDasharray="3 3"
                        label={{ value: `Min ${ranges.tempMin}°C`, position: 'insideBottomRight', fill: '#10B981', fontSize: 10 }}
                      />
                      <ReferenceLine
                        y={ranges.tempMax}
                        stroke="#10B981"
                        strokeDasharray="3 3"
                        label={{ value: `Max ${ranges.tempMax}°C`, position: 'insideTopRight', fill: '#10B981', fontSize: 10 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="temperatureC"
                        name="Suhu (°C)"
                        stroke="#D97706"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#D97706', stroke: '#FFFDF9', strokeWidth: 2 }}
                        activeDot={{ r: 7 }}
                      />
                    </>
                  )}

                  {selectedMetric === 'hr' && (
                    <>
                      <ReferenceLine
                        y={ranges.hrMin}
                        stroke="#10B981"
                        strokeDasharray="3 3"
                        label={{ value: `Min ${ranges.hrMin}`, position: 'insideBottomRight', fill: '#10B981', fontSize: 10 }}
                      />
                      <ReferenceLine
                        y={ranges.hrMax}
                        stroke="#10B981"
                        strokeDasharray="3 3"
                        label={{ value: `Max ${ranges.hrMax}`, position: 'insideTopRight', fill: '#10B981', fontSize: 10 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="heartRate"
                        name="Heart Rate (BPM)"
                        stroke="#E11D48"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#E11D48', stroke: '#FFFDF9', strokeWidth: 2 }}
                        activeDot={{ r: 7 }}
                      />
                    </>
                  )}

                  {selectedMetric === 'weight' && (
                    <Line
                      type="monotone"
                      dataKey="weightKg"
                      name="Berat Badan (kg)"
                      stroke="#2563EB"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#2563EB', stroke: '#FFFDF9', strokeWidth: 2 }}
                      activeDot={{ r: 7 }}
                    />
                  )}

                  {selectedMetric === 'rr' && (
                    <>
                      <ReferenceLine
                        y={ranges.rrMin}
                        stroke="#10B981"
                        strokeDasharray="3 3"
                        label={{ value: `Min ${ranges.rrMin}`, position: 'insideBottomRight', fill: '#10B981', fontSize: 10 }}
                      />
                      <ReferenceLine
                        y={ranges.rrMax}
                        stroke="#10B981"
                        strokeDasharray="3 3"
                        label={{ value: `Max ${ranges.rrMax}`, position: 'insideTopRight', fill: '#10B981', fontSize: 10 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="respiratoryRate"
                        name="Laju Napas (RPM)"
                        stroke="#0D9488"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#0D9488', stroke: '#FFFDF9', strokeWidth: 2 }}
                        activeDot={{ r: 7 }}
                      />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* EMR HISTORY TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto rounded-xl border border-[#E1D6BE]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F6F1E6] text-[#1B2A45] font-bold border-b border-[#E1D6BE]">
                <tr>
                  <th className="p-3">Tanggal & Waktu</th>
                  <th className="p-3">Sumber / Acara</th>
                  <th className="p-3 text-center">Suhu (°C)</th>
                  <th className="p-3 text-center">HR (BPM)</th>
                  <th className="p-3 text-center">RR (RPM)</th>
                  <th className="p-3 text-center">Berat (kg)</th>
                  <th className="p-3">Pemeriksa</th>
                  {onApplyVitalsToDraft && <th className="p-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1D6BE]/60 text-[#22242B]">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-[#6B6656]">
                      Belum ada catatan tanda vital untuk pasien ini.
                    </td>
                  </tr>
                ) : (
                  [...filteredData].reverse().map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#F6F1E6]/40 transition-colors ${
                        item.isDraft ? 'bg-amber-50/50 font-semibold' : ''
                      }`}
                    >
                      <td className="p-3 font-mono font-medium">
                        <div className="flex items-center gap-1.5">
                          {item.formattedDate}
                          {item.isDraft && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                              Draft
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 max-w-[180px] truncate" title={item.source}>
                        {item.source}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {item.temperatureC ? (
                          <span
                            className={
                              item.temperatureC > ranges.tempMax
                                ? 'text-amber-700 font-bold'
                                : item.temperatureC < ranges.tempMin
                                ? 'text-blue-700 font-bold'
                                : 'text-emerald-700'
                            }
                          >
                            {item.temperatureC}°C
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {item.heartRate ? (
                          <span
                            className={
                              item.heartRate > ranges.hrMax || item.heartRate < ranges.hrMin
                                ? 'text-rose-600 font-bold'
                                : 'text-emerald-700'
                            }
                          >
                            {item.heartRate}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {item.respiratoryRate ? (
                          <span
                            className={
                              item.respiratoryRate > ranges.rrMax || item.respiratoryRate < ranges.rrMin
                                ? 'text-teal-700 font-bold'
                                : 'text-emerald-700'
                            }
                          >
                            {item.respiratoryRate}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-blue-700">
                        {item.weightKg ? `${item.weightKg} kg` : '-'}
                      </td>
                      <td className="p-3 text-[#6B6656]">{item.doctorName || '-'}</td>
                      {onApplyVitalsToDraft && (
                        <td className="p-3 text-right">
                          {!item.isDraft && (
                            <button
                              onClick={() => {
                                onApplyVitalsToDraft({
                                  tempC: item.temperatureC,
                                  hr: item.heartRate,
                                  rr: item.respiratoryRate,
                                  weightKg: item.weightKg
                                });
                                addToast(
                                  `Tanda vital dari ${item.formattedDate} diterapkan ke draft SOAP!`,
                                  'success'
                                );
                              }}
                              className="px-2 py-1 bg-[#F6F1E6] hover:bg-[#E1D6BE] text-[#1B2A45] rounded font-bold text-[10px] border border-[#E1D6BE] transition-all"
                            >
                              Gunakan
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
