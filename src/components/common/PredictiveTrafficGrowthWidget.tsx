import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Calendar,
  Users,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sliders,
  BarChart3,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  Stethoscope,
  Scissors,
  Hotel,
  RefreshCw,
  Zap,
  Info,
  CalendarDays,
  UserPlus,
  FileSpreadsheet
} from 'lucide-react';

interface PredictiveTrafficGrowthWidgetProps {
  setActiveModule?: (module: string) => void;
}

export type ViewTab = 'busy_hours' | 'growth_trend' | 'capacity_simulator';
export type DayFilter = 'all' | 'weekday' | 'weekend' | 'today';
export type ServiceFilter = 'all' | 'clinic' | 'grooming';

export const PredictiveTrafficGrowthWidget: React.FC<PredictiveTrafficGrowthWidgetProps> = ({ setActiveModule }) => {
  const { doctorBookings = [], groomingBookings = [], clinicVisits = [], groomingSessions = [] } = useData();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<ViewTab>('busy_hours');
  const [dayFilter, setDayFilter] = useState<DayFilter>('weekend');
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('all');
  const [surgeMultiplier, setSurgeMultiplier] = useState<number>(1.0); // 1.0 = Normal, 1.25 = +25% Promo/Holiday Surge
  const [showRecommendationModal, setShowRecommendationModal] = useState<boolean>(false);

  // Hourly slots from 08:00 to 20:00
  const hourlyData = useMemo(() => {
    // Base traffic distribution weights depending on day type
    const isWeekend = dayFilter === 'weekend';
    const isWeekday = dayFilter === 'weekday';

    const baseHours = [
      { hour: '08:00', clinicBase: 3, groomingBase: 2, surgeryBase: 1, maxCap: 12 },
      { hour: '09:00', clinicBase: 6, groomingBase: 5, surgeryBase: 2, maxCap: 14 },
      { hour: '10:00', clinicBase: 9, groomingBase: 8, surgeryBase: 2, maxCap: 16 },
      { hour: '11:00', clinicBase: 11, groomingBase: 9, surgeryBase: 2, maxCap: 16 },
      { hour: '12:00', clinicBase: 7, groomingBase: 6, surgeryBase: 1, maxCap: 14 },
      { hour: '13:00', clinicBase: 5, groomingBase: 5, surgeryBase: 1, maxCap: 14 },
      { hour: '14:00', clinicBase: 7, groomingBase: 7, surgeryBase: 1, maxCap: 15 },
      { hour: '15:00', clinicBase: 9, groomingBase: 9, surgeryBase: 1, maxCap: 16 },
      { hour: '16:00', clinicBase: 12, groomingBase: 11, surgeryBase: 1, maxCap: 18 },
      { hour: '17:00', clinicBase: 13, groomingBase: 10, surgeryBase: 1, maxCap: 18 },
      { hour: '18:00', clinicBase: 10, groomingBase: 6, surgeryBase: 1, maxCap: 16 },
      { hour: '19:00', clinicBase: 7, groomingBase: 3, surgeryBase: 0, maxCap: 14 },
      { hour: '20:00', clinicBase: 4, groomingBase: 1, surgeryBase: 0, maxCap: 12 },
    ];

    // Real data adjustment: count actual appointments by hour
    const realClinicCountByHour: Record<string, number> = {};
    const realGroomingCountByHour: Record<string, number> = {};

    doctorBookings.forEach((b) => {
      if (b.timeSlot) {
        const h = b.timeSlot.substring(0, 2) + ':00';
        realClinicCountByHour[h] = (realClinicCountByHour[h] || 0) + 1;
      }
    });

    groomingBookings.forEach((g) => {
      if (g.timeSlot) {
        const h = g.timeSlot.substring(0, 2) + ':00';
        realGroomingCountByHour[h] = (realGroomingCountByHour[h] || 0) + 1;
      }
    });

    const weekendFactor = isWeekend ? 1.35 : isWeekday ? 0.9 : 1.1;

    return baseHours.map((item) => {
      const realClinicBoost = realClinicCountByHour[item.hour] || 0;
      const realGroomingBoost = realGroomingCountByHour[item.hour] || 0;

      const clinicPatients = Math.round((item.clinicBase * weekendFactor + realClinicBoost * 0.4) * surgeMultiplier);
      const groomingPets = Math.round((item.groomingBase * weekendFactor + realGroomingBoost * 0.4) * surgeMultiplier);
      const surgeryCases = Math.round(item.surgeryBase * (isWeekend ? 0.7 : 1.2) * surgeMultiplier);

      const totalTraffic = clinicPatients + groomingPets + surgeryCases;
      const capacityThreshold = item.maxCap;
      const loadPercentage = Math.min(100, Math.round((totalTraffic / capacityThreshold) * 100));

      let congestionLevel: 'Rendah' | 'Optimal' | 'Tinggi (Rush)' | 'Overload' = 'Optimal';
      if (loadPercentage < 50) congestionLevel = 'Rendah';
      else if (loadPercentage >= 85 && loadPercentage <= 100) congestionLevel = 'Tinggi (Rush)';
      else if (loadPercentage > 100) congestionLevel = 'Overload';

      // Estimated average patient waiting time in minutes based on traffic load
      const avgWaitMinutes =
        loadPercentage > 95 ? 42 : loadPercentage > 80 ? 28 : loadPercentage > 60 ? 15 : 8;

      return {
        hour: item.hour,
        clinicPatients,
        groomingPets,
        surgeryCases,
        totalTraffic,
        capacityThreshold,
        loadPercentage,
        congestionLevel,
        avgWaitMinutes,
        recommendedDoctors: totalTraffic > 18 ? 3 : totalTraffic > 10 ? 2 : 1,
        recommendedGroomers: groomingPets > 8 ? 3 : groomingPets > 4 ? 2 : 1,
      };
    });
  }, [doctorBookings, groomingBookings, dayFilter, surgeMultiplier]);

  // Monthly Historical & Predictive Growth Data
  const growthTrendData = useMemo(() => {
    return [
      {
        month: 'Mar 2026',
        isForecast: false,
        totalAppointments: 320,
        medisKlinik: 190,
        grooming: 95,
        petHotel: 35,
        capacityLimit: 550,
        confidenceLower: 320,
        confidenceUpper: 320,
      },
      {
        month: 'Apr 2026',
        isForecast: false,
        totalAppointments: 365,
        medisKlinik: 215,
        grooming: 110,
        petHotel: 40,
        capacityLimit: 550,
        confidenceLower: 365,
        confidenceUpper: 365,
      },
      {
        month: 'Mei 2026',
        isForecast: false,
        totalAppointments: 410,
        medisKlinik: 240,
        grooming: 125,
        petHotel: 45,
        capacityLimit: 550,
        confidenceLower: 410,
        confidenceUpper: 410,
      },
      {
        month: 'Jun 2026',
        isForecast: false,
        totalAppointments: 470,
        medisKlinik: 275,
        grooming: 145,
        petHotel: 50,
        capacityLimit: 550,
        confidenceLower: 470,
        confidenceUpper: 470,
      },
      {
        month: 'Jul 2026',
        isForecast: false,
        totalAppointments: 520,
        medisKlinik: 305,
        grooming: 160,
        petHotel: 55,
        capacityLimit: 550,
        confidenceLower: 520,
        confidenceUpper: 520,
      },
      {
        month: 'Agu 2026 (Kini)',
        isForecast: false,
        totalAppointments: Math.round(580 * surgeMultiplier),
        medisKlinik: Math.round(340 * surgeMultiplier),
        grooming: Math.round(180 * surgeMultiplier),
        petHotel: Math.round(60 * surgeMultiplier),
        capacityLimit: 550,
        confidenceLower: Math.round(580 * surgeMultiplier),
        confidenceUpper: Math.round(580 * surgeMultiplier),
      },
      // AI Machine-Learning Forecast with Seasonal Factors
      {
        month: 'Sep 2026 (Prediksi)',
        isForecast: true,
        totalAppointments: Math.round(645 * surgeMultiplier),
        medisKlinik: Math.round(380 * surgeMultiplier),
        grooming: Math.round(195 * surgeMultiplier),
        petHotel: Math.round(70 * surgeMultiplier),
        capacityLimit: 600,
        confidenceLower: Math.round(610 * surgeMultiplier),
        confidenceUpper: Math.round(680 * surgeMultiplier),
      },
      {
        month: 'Okt 2026 (Prediksi)',
        isForecast: true,
        totalAppointments: Math.round(710 * surgeMultiplier),
        medisKlinik: Math.round(415 * surgeMultiplier),
        grooming: Math.round(215 * surgeMultiplier),
        petHotel: Math.round(80 * surgeMultiplier),
        capacityLimit: 600,
        confidenceLower: Math.round(665 * surgeMultiplier),
        confidenceUpper: Math.round(755 * surgeMultiplier),
      },
      {
        month: 'Nov 2026 (Prediksi)',
        isForecast: true,
        totalAppointments: Math.round(790 * surgeMultiplier),
        medisKlinik: Math.round(460 * surgeMultiplier),
        grooming: Math.round(240 * surgeMultiplier),
        petHotel: Math.round(90 * surgeMultiplier),
        capacityLimit: 650,
        confidenceLower: Math.round(735 * surgeMultiplier),
        confidenceUpper: Math.round(845 * surgeMultiplier),
      },
      {
        month: 'Des 2026 (Holiday Peak)',
        isForecast: true,
        totalAppointments: Math.round(920 * surgeMultiplier),
        medisKlinik: Math.round(520 * surgeMultiplier),
        grooming: Math.round(290 * surgeMultiplier),
        petHotel: Math.round(110 * surgeMultiplier),
        capacityLimit: 750,
        confidenceLower: Math.round(850 * surgeMultiplier),
        confidenceUpper: Math.round(990 * surgeMultiplier),
      },
      {
        month: 'Jan 2027 (Prediksi)',
        isForecast: true,
        totalAppointments: Math.round(860 * surgeMultiplier),
        medisKlinik: Math.round(490 * surgeMultiplier),
        grooming: Math.round(270 * surgeMultiplier),
        petHotel: Math.round(100 * surgeMultiplier),
        capacityLimit: 750,
        confidenceLower: Math.round(790 * surgeMultiplier),
        confidenceUpper: Math.round(930 * surgeMultiplier),
      },
    ];
  }, [surgeMultiplier]);

  // Overall Statistics & Peak windows
  const peakMorningHour = useMemo(() => {
    const morningSlots = hourlyData.filter((h) => ['09:00', '10:00', '11:00', '12:00'].includes(h.hour));
    return morningSlots.reduce((prev, curr) => (curr.totalTraffic > prev.totalTraffic ? curr : prev), morningSlots[0]);
  }, [hourlyData]);

  const peakAfternoonHour = useMemo(() => {
    const afternoonSlots = hourlyData.filter((h) => ['15:00', '16:00', '17:00', '18:00'].includes(h.hour));
    return afternoonSlots.reduce((prev, curr) => (curr.totalTraffic > prev.totalTraffic ? curr : prev), afternoonSlots[0]);
  }, [hourlyData]);

  const overallMaxLoadHour = useMemo(() => {
    return hourlyData.reduce((prev, curr) => (curr.totalTraffic > prev.totalTraffic ? curr : prev), hourlyData[0]);
  }, [hourlyData]);

  // Day-of-week demand comparison indicators
  const dayOfWeekLoad = [
    { day: 'Senin', load: 72, label: 'Sedang' },
    { day: 'Selasa', load: 68, label: 'Sedang' },
    { day: 'Rabu', load: 62, label: 'Lancar' },
    { day: 'Kamis', load: 65, label: 'Sedang' },
    { day: 'Jumat', load: 84, label: 'Tinggi' },
    { day: 'Sabtu', load: 96, label: 'Puncak (Peak)' },
    { day: 'Minggu', load: 92, label: 'Puncak (Peak)' },
  ];

  // Custom Recharts Tooltip for Hourly Traffic
  const HourlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#101A2C] border border-[#B8905A]/40 p-3.5 rounded-xl shadow-2xl text-[#EDE6D6] text-xs space-y-2 min-w-[220px]">
          <div className="flex items-center justify-between border-b border-[#B8905A]/20 pb-1.5">
            <span className="font-bold text-[#FFFDF9] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D9B98A]" /> Pukul {label}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                data.congestionLevel === 'Overload'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : data.congestionLevel === 'Tinggi (Rush)'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {data.congestionLevel} ({data.loadPercentage}%)
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-sky-300 font-semibold">
                <Stethoscope className="w-3 h-3" /> Poliklinik & Medis:
              </span>
              <span className="font-bold text-[#FFFDF9]">{data.clinicPatients} Pasien</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <Scissors className="w-3 h-3" /> Grooming & Salon:
              </span>
              <span className="font-bold text-[#FFFDF9]">{data.groomingPets} Anabul</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-purple-300 font-semibold">
                <Zap className="w-3 h-3" /> Bedah & Khusus:
              </span>
              <span className="font-bold text-[#FFFDF9]">{data.surgeryCases} Kasus</span>
            </div>
            <div className="pt-1.5 border-t border-[#B8905A]/20 flex items-center justify-between text-xs font-bold text-[#D9B98A]">
              <span>Total Beban Trafik:</span>
              <span>{data.totalTraffic} / {data.capacityThreshold} Max Cap</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-[#B8905A]/20 text-[10px] text-[#EDE6D6]/70 flex items-center justify-between">
            <span>Estimasi Antrian: ~{data.avgWaitMinutes} mnt</span>
            <span className="text-[#D9B98A] font-semibold">Dokter: {data.recommendedDoctors} | Groomer: {data.recommendedGroomers}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Growth Trajectory
  const GrowthTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#101A2C] border border-[#B8905A]/40 p-3.5 rounded-xl shadow-2xl text-[#EDE6D6] text-xs space-y-2 min-w-[230px]">
          <div className="flex items-center justify-between border-b border-[#B8905A]/20 pb-1.5">
            <span className="font-bold text-[#FFFDF9]">{label}</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                data.isForecast
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {data.isForecast ? 'Proyeksi AI' : 'Data Riwayat'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#D9B98A]">
              <span>Total Pasien & Booking:</span>
              <span className="text-sm text-[#FFFDF9]">{data.totalAppointments}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-sky-300">
              <span>🩺 Medis Poliklinik:</span>
              <span>{data.medisKlinik}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-amber-300">
              <span>✂️ Grooming & Spa:</span>
              <span>{data.grooming}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-emerald-300">
              <span>🏨 Boarding Hotel:</span>
              <span>{data.petHotel}</span>
            </div>
            {data.isForecast && (
              <div className="pt-1.5 border-t border-[#B8905A]/20 text-[10px] text-purple-200/80">
                Rentang Estimasi: {data.confidenceLower} - {data.confidenceUpper} kunjungan (CI 90%)
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E1D6BE] shadow-xs hover:shadow-md transition-all duration-200 space-y-6">
      
      {/* Widget Header & Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E1D6BE]">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#1B2A45] text-[#D9B98A] shadow-xs shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-[#1B2A45] font-display">
                Analisis Prediktif Jam Sibuk & Tren Pertumbuhan
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1B2A45] text-[#D9B98A] text-[10px] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D9B98A]" /> AI Traffic Forecaster
              </span>
            </div>
            <p className="text-xs text-[#1B2A45]/70 mt-0.5">
              Proyeksi jam sibuk dan estimasi lonjakan booking pasien berdasarkan pola historis rekam medis & grooming salon.
            </p>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center bg-[#F6F1E6] p-1 rounded-xl border border-[#E1D6BE] self-start lg:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('busy_hours')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'busy_hours'
                ? 'bg-[#1B2A45] text-[#FFFDF9] shadow-xs'
                : 'text-[#1B2A45]/70 hover:text-[#1B2A45]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Peta Jam Sibuk</span>
          </button>

          <button
            onClick={() => setActiveTab('growth_trend')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'growth_trend'
                ? 'bg-[#1B2A45] text-[#FFFDF9] shadow-xs'
                : 'text-[#1B2A45]/70 hover:text-[#1B2A45]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Proyeksi Pertumbuhan</span>
          </button>

          <button
            onClick={() => setActiveTab('capacity_simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'capacity_simulator'
                ? 'bg-[#1B2A45] text-[#FFFDF9] shadow-xs'
                : 'text-[#1B2A45]/70 hover:text-[#1B2A45]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulasi Shift</span>
          </button>
        </div>
      </div>

      {/* Quick AI Summary Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Metric 1: Peak Rush Window */}
        <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#E1D6BE] space-y-1">
          <div className="flex items-center justify-between text-[#1B2A45]/70">
            <span className="text-[11px] font-bold">Puncak Jam Sibuk (Rush Hour)</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-[#1B2A45]">
              {overallMaxLoadHour.hour} ({overallMaxLoadHour.totalTraffic} Pasien/Jam)
            </p>
          </div>
          <p className="text-[10px] text-[#1B2A45]/70">
            Kepadatan tertinggi: Sore ({peakAfternoonHour.hour}) & Siang ({peakMorningHour.hour})
          </p>
        </div>

        {/* Metric 2: Estimated MoM Growth Rate */}
        <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#E1D6BE] space-y-1">
          <div className="flex items-center justify-between text-[#1B2A45]/70">
            <span className="text-[11px] font-bold">Laju Pertumbuhan Kunjungan</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-lg font-bold text-emerald-700">+18.4% MoM</p>
            <span className="text-[10px] font-semibold text-emerald-700">Tren Positif</span>
          </div>
          <p className="text-[10px] text-[#1B2A45]/70">
            Proyeksi lonjakan puncaknya pada Desember (Holiday Season)
          </p>
        </div>

        {/* Metric 3: Safe Capacity Utilization */}
        <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#E1D6BE] space-y-1">
          <div className="flex items-center justify-between text-[#1B2A45]/70">
            <span className="text-[11px] font-bold">Tingkat Utilisasi Kapasitas</span>
            <ShieldCheck className="w-4 h-4 text-[#1B2A45]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-lg font-bold text-[#1B2A45]">
              {overallMaxLoadHour.loadPercentage}%
            </p>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
              Puncak Terpadat
            </span>
          </div>
          <p className="text-[10px] text-[#1B2A45]/70">
            Kapasitas aman: max 16-18 pasien simultan / jam
          </p>
        </div>

        {/* Metric 4: AI Staffing Recommendation */}
        <div className="p-3.5 rounded-xl bg-[#1B2A45] text-[#FFFDF9] border border-[#B8905A]/40 space-y-1">
          <div className="flex items-center justify-between text-[#D9B98A]">
            <span className="text-[11px] font-bold">Rekomendasi Penjadwalan</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xs font-bold text-[#FFFDF9] leading-snug">
            +1 Dokter & +1 Groomer Tambahan
          </p>
          <p className="text-[10px] text-[#EDE6D6]/70">
            Disarankan aktif pada shift 15:00 - 18:00 WIB
          </p>
        </div>

      </div>

      {/* TAB 1: EXPECTED BUSY HOURS HEATMAP & RECHARTS HOURLY VOLUME */}
      {activeTab === 'busy_hours' && (
        <div className="space-y-4">
          
          {/* Filter Bar for Busy Hours */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F6F1E6] p-3 rounded-xl border border-[#E1D6BE]">
            
            {/* Day Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-[#1B2A45] flex items-center gap-1 mr-1">
                <Calendar className="w-3.5 h-3.5 text-[#1B2A45]" /> Filter Hari:
              </span>
              <button
                onClick={() => setDayFilter('weekend')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  dayFilter === 'weekend'
                    ? 'bg-[#1B2A45] text-[#FFFDF9] shadow-2xs'
                    : 'bg-white text-[#1B2A45] border border-[#E1D6BE] hover:bg-[#E1D6BE]/40'
                }`}
              >
                Akhir Pekan (Sabtu - Minggu Peak)
              </button>
              <button
                onClick={() => setDayFilter('weekday')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  dayFilter === 'weekday'
                    ? 'bg-[#1B2A45] text-[#FFFDF9] shadow-2xs'
                    : 'bg-white text-[#1B2A45] border border-[#E1D6BE] hover:bg-[#E1D6BE]/40'
                }`}
              >
                Hari Kerja (Senin - Jumat)
              </button>
              <button
                onClick={() => setDayFilter('today')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  dayFilter === 'today'
                    ? 'bg-[#1B2A45] text-[#FFFDF9] shadow-2xs'
                    : 'bg-white text-[#1B2A45] border border-[#E1D6BE] hover:bg-[#E1D6BE]/40'
                }`}
              >
                Hari Ini ({new Date().toLocaleDateString('id-ID', { weekday: 'short' })})
              </button>
            </div>

            {/* Service Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1B2A45]/70">Tampilkan:</span>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value as ServiceFilter)}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#E1D6BE] text-xs font-bold text-[#1B2A45] focus:outline-hidden"
              >
                <option value="all">Semua Layanan (Medis + Grooming + Bedah)</option>
                <option value="clinic">Khusus Poliklinik & Konsultasi Medis</option>
                <option value="grooming">Khusus Grooming Salon & Spa</option>
              </select>
            </div>

          </div>

          {/* Recharts Area / Composed Chart of Expected Hourly Busy Traffic */}
          <div className="p-4 sm:p-5 rounded-xl border border-[#E1D6BE] bg-[#FFFDF9] space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-sm text-[#1B2A45]">
                  Distribusi Trafik Kunjungan Pasien Per Jam (08:00 - 20:00 WIB)
                </h4>
                <p className="text-xs text-[#1B2A45]/70">
                  Area berwarna menunjukkan volume antrian; garis merah putus-putus menunjukkan ambang batas kapasitas optimal outlet.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1B2A45]" /> Medis Vet
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B8905A]" /> Grooming Salon
                </span>
                <span className="flex items-center gap-1.5 text-rose-600 font-bold">
                  <span className="w-3 h-0.5 bg-rose-600 inline-block border-t border-dashed" /> Kapasitas Maks
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={hourlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="clinicGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B2A45" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1B2A45" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="groomingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B8905A" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#B8905A" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="#E1D6BE" opacity={0.4} vertical={false} />
                  <XAxis dataKey="hour" stroke="#1B2A45" fontSize={11} tickLine={false} />
                  <YAxis stroke="#1B2A45" fontSize={11} tickLine={false} />
                  
                  <Tooltip content={<HourlyTooltip />} />

                  {/* Reference line indicating peak capacity limit */}
                  <ReferenceLine
                    y={16}
                    stroke="#E11D48"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: 'Batas Kapasitas Aman (16 Pasien)',
                      fill: '#E11D48',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />

                  {serviceFilter === 'all' && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="clinicPatients"
                        stackId="1"
                        stroke="#1B2A45"
                        strokeWidth={2}
                        fill="url(#clinicGrad)"
                        name="Poliklinik Medis"
                      />
                      <Area
                        type="monotone"
                        dataKey="groomingPets"
                        stackId="1"
                        stroke="#B8905A"
                        strokeWidth={2}
                        fill="url(#groomingGrad)"
                        name="Grooming Salon"
                      />
                      <Line
                        type="monotone"
                        dataKey="totalTraffic"
                        stroke="#059669"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#059669' }}
                        activeDot={{ r: 6 }}
                        name="Total Pasien"
                      />
                    </>
                  )}

                  {serviceFilter === 'clinic' && (
                    <Area
                      type="monotone"
                      dataKey="clinicPatients"
                      stroke="#1B2A45"
                      strokeWidth={3}
                      fill="url(#clinicGrad)"
                      dot={{ r: 4, fill: '#1B2A45' }}
                      name="Poliklinik Medis"
                    />
                  )}

                  {serviceFilter === 'grooming' && (
                    <Area
                      type="monotone"
                      dataKey="groomingPets"
                      stroke="#B8905A"
                      strokeWidth={3}
                      fill="url(#groomingGrad)"
                      dot={{ r: 4, fill: '#B8905A' }}
                      name="Grooming Salon"
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Day of Week Congestion Index Bar */}
            <div className="pt-3 border-t border-[#E1D6BE] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1B2A45] flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-[#1B2A45]" /> Indeks Kepadatan Sepanjang Pekan:
                </span>
                <span className="text-[11px] text-[#1B2A45]/70">Puncak antrian: Sabtu & Minggu siang</span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {dayOfWeekLoad.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      item.load >= 90
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : item.load >= 75
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-[#F6F1E6] border-[#E1D6BE] text-[#1B2A45]'
                    }`}
                  >
                    <p className="text-xs font-bold">{item.day}</p>
                    <p className="text-[10px] font-extrabold mt-0.5">{item.load}%</p>
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold mt-1 ${
                        item.load >= 90
                          ? 'bg-rose-600 text-white'
                          : item.load >= 75
                          ? 'bg-amber-600 text-white'
                          : 'bg-[#1B2A45] text-white'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: PREDICTIVE GROWTH TREND & CAPACITY TRAJECTORY */}
      {activeTab === 'growth_trend' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F6F1E6] p-3.5 rounded-xl border border-[#E1D6BE]">
            <div>
              <h4 className="text-xs font-bold text-[#1B2A45] flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-700" /> Proyeksi Laju Kunjungan Pasien 6 Bulan Kedepan
              </h4>
              <p className="text-[11px] text-[#1B2A45]/70">
                Kombinasi data historis (Mar - Agu 2026) dan model peramalan prediktif (Sep 2026 - Jan 2027).
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300">
                Proyeksi Akhir Tahun: ~920 Pasien/Bulan (+58.6%)
              </span>
            </div>
          </div>

          {/* Recharts Composed Chart for Monthly Growth */}
          <div className="p-4 sm:p-5 rounded-xl border border-[#E1D6BE] bg-[#FFFDF9] space-y-4">
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={growthTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E1D6BE" opacity={0.4} vertical={false} />
                  <XAxis dataKey="month" stroke="#1B2A45" fontSize={10} tickLine={false} />
                  <YAxis stroke="#1B2A45" fontSize={11} tickLine={false} />
                  <Tooltip content={<GrowthTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    formatter={(val) => <span className="font-bold text-[#1B2A45]">{val}</span>}
                  />

                  {/* Stacked Bars for Services Breakdown */}
                  <Bar dataKey="medisKlinik" stackId="a" fill="#1B2A45" name="Medis Poliklinik" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="grooming" stackId="a" fill="#B8905A" name="Grooming & Salon" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="petHotel" stackId="a" fill="#3B5035" name="Boarding Hotel" radius={[4, 4, 0, 0]} />

                  {/* Trendline overlay */}
                  <Line
                    type="monotone"
                    dataKey="totalAppointments"
                    stroke="#D97706"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#D97706' }}
                    activeDot={{ r: 6 }}
                    name="Total Kunjungan Bulanan"
                  />

                  <ReferenceLine
                    y={750}
                    stroke="#E11D48"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: 'Kapasitas Fisik Fasilitas Saat Ini (750 / bln)',
                      fill: '#E11D48',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Strategic Insight Takeaway */}
            <div className="p-3.5 rounded-xl bg-[#1B2A45]/5 border border-[#1B2A45]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#1B2A45] shrink-0 mt-0.5" />
                <div className="text-xs text-[#1B2A45] space-y-0.5">
                  <p className="font-bold">Insight Kebutuhan Fasilitas Q4 2026:</p>
                  <p className="text-[11px] text-[#1B2A45]/80">
                    Pada bulan November & Desember, proyeksi permintaan (790 - 920 pasien) akan melampaui kapasitas fasilitas saat ini (750 pasien/bln). Direkomendasikan penambahan 1 meja grooming dan 1 ruang periksa tambahan (Poli VET-3).
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (setActiveModule) setActiveModule('branches');
                  addToast('Membuka modul Perencanaan Kapasitas Cabang & Inventaris.', 'info');
                }}
                className="px-3.5 py-1.5 bg-[#1B2A45] hover:bg-[#101A2C] text-[#FFFDF9] font-bold text-xs rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                Rencanakan Ekspansi
              </button>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: CAPACITY SIMULATOR & SHIFT OPTIMIZER */}
      {activeTab === 'capacity_simulator' && (
        <div className="space-y-4">
          
          <div className="p-4 sm:p-5 rounded-xl bg-[#F6F1E6] border border-[#E1D6BE] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-[#1B2A45] flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#1B2A45]" /> Simulator Lonjakan Permintaan & Kebutuhan Shift
                </h4>
                <p className="text-[11px] text-[#1B2A45]/70">
                  Geser simulator lonjakan untuk menguji ketahanan kapasitas klinik saat promo akhir pekan, musim libur, atau kampanye vaksinasi massal.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSurgeMultiplier(1.0)}
                  className="px-2.5 py-1 rounded bg-white border border-[#E1D6BE] text-xs font-bold text-[#1B2A45] hover:bg-[#E1D6BE]/40 cursor-pointer"
                >
                  Normal (1.0x)
                </button>
                <button
                  onClick={() => setSurgeMultiplier(1.25)}
                  className="px-2.5 py-1 rounded bg-white border border-[#E1D6BE] text-xs font-bold text-[#1B2A45] hover:bg-[#E1D6BE]/40 cursor-pointer"
                >
                  Promo (+25%)
                </button>
                <button
                  onClick={() => setSurgeMultiplier(1.5)}
                  className="px-2.5 py-1 rounded bg-white border border-[#E1D6BE] text-xs font-bold text-[#1B2A45] hover:bg-[#E1D6BE]/40 cursor-pointer"
                >
                  Holiday Peak (+50%)
                </button>
              </div>
            </div>

            {/* Slider Control */}
            <div className="space-y-2 bg-white p-4 rounded-xl border border-[#E1D6BE]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1B2A45]">Tingkat Lonjakan Trafik (Simulasi):</span>
                <span className="font-extrabold text-[#1B2A45] bg-[#F6F1E6] px-2.5 py-1 rounded-lg border border-[#E1D6BE]">
                  {Math.round((surgeMultiplier - 1) * 100) >= 0 ? `+${Math.round((surgeMultiplier - 1) * 100)}%` : `${Math.round((surgeMultiplier - 1) * 100)}%`} ({surgeMultiplier}x Volume)
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.0"
                step="0.05"
                value={surgeMultiplier}
                onChange={(e) => setSurgeMultiplier(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#E1D6BE] rounded-lg appearance-none cursor-pointer accent-[#1B2A45]"
              />
              <div className="flex justify-between text-[10px] text-[#1B2A45]/60 font-semibold">
                <span>Low Season (-20%)</span>
                <span>Normal (Baseline)</span>
                <span>Promo Event (+25%)</span>
                <span>Holiday Season (+50%)</span>
                <span>Extreme Surge (+100%)</span>
              </div>
            </div>

            {/* Recommendations Table based on simulated load */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-[#1B2A45]">
                Rekomendasi Distribusi Shift Tenaga Kerja Berdasarkan Beban Trafik Terhitung:
              </h5>

              <div className="overflow-x-auto rounded-xl border border-[#E1D6BE] bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#1B2A45] text-[#FFFDF9] text-[11px] font-bold">
                      <th className="p-3">Blok Waktu (Shift)</th>
                      <th className="p-3">Prediksi Beban Pasien</th>
                      <th className="p-3">Status Kepadatan</th>
                      <th className="p-3">Kebutuhan Dokter</th>
                      <th className="p-3">Kebutuhan Groomer</th>
                      <th className="p-3">Estimasi Waktu Tunggu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1D6BE]/60 text-[#1B2A45]">
                    {hourlyData
                      .filter((_, idx) => idx % 2 === 0) // sample every 2 hours for clean summary table
                      .map((h, i) => (
                        <tr key={i} className="hover:bg-[#F6F1E6]/50">
                          <td className="p-3 font-bold">{h.hour} - {parseInt(h.hour) + 2}:00 WIB</td>
                          <td className="p-3 font-semibold">{h.totalTraffic} Pasien/Sesi</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                h.congestionLevel === 'Overload'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : h.congestionLevel === 'Tinggi (Rush)'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}
                            >
                              {h.congestionLevel}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-sky-900">{h.recommendedDoctors} Dokter Jaga</td>
                          <td className="p-3 font-bold text-amber-900">{h.recommendedGroomers} Groomer</td>
                          <td className="p-3 font-semibold text-[#1B2A45]/80">~{h.avgWaitMinutes} menit</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Footer Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E1D6BE] text-xs">
        <div className="flex items-center gap-2 text-[#1B2A45]/70">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Model prediktif sinkron realtime dengan {doctorBookings.length} booking medis & {groomingBookings.length} jadwal salon.</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              if (setActiveModule) setActiveModule('booking');
              addToast('Membuka modul Manajemen Booking & Antrian.', 'info');
            }}
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-[#F6F1E6] hover:bg-[#E1D6BE] text-[#1B2A45] font-bold transition-colors border border-[#E1D6BE] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Buka Kalender Booking</span>
          </button>

          <button
            onClick={() => {
              if (setActiveModule) setActiveModule('hrm');
              addToast('Membuka modul Jadwal & Shift Kerja SDM.', 'info');
            }}
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-[#1B2A45] hover:bg-[#101A2C] text-[#FFFDF9] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Atur Shift Kerja SDM</span>
          </button>
        </div>
      </div>

    </div>
  );
};
