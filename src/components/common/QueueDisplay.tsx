import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import {
  Maximize2,
  Minimize2,
  Volume2,
  X,
  Clock,
  Stethoscope,
  Scissors,
  CheckCircle,
  AlertCircle,
  Bell,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { callPatientQueueVoice } from '../../utils/audioVoiceUtils';

interface QueueDisplayProps {
  onClose: () => void;
}

export const QueueDisplay: React.FC<QueueDisplayProps> = ({ onClose }) => {
  const { clinicVisits = [], groomingSessions = [] } = useData();
  const { addToast } = useToast();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString('id-ID'));
  const [dateStr, setDateStr] = useState('');
  const [tipIndex, setTipIndex] = useState(0);
  const [isCallingAudio, setIsCallingAudio] = useState(false);

  const tips = [
    '🐾 Vaksinasi teratur & pemberian obat cacing berkala melindungi anabul dari infeksi mematikan.',
    '🩺 Harap selalu gunakan pet carrier atau tali kekang (leash) selama berada di ruang tunggu klinik demi keamanan bersama.',
    '🏨 Pet Hotel PetCare menyediakan pemantauan CCTV 24 Jam & ruangan ber-AC untuk kenyamanan anabul tersayang.',
    '💧 Sediakan air minum bersih yang mengalir untuk mencegah masalah saluran kemih (FLUTD) pada kucing.',
    '✂️ Salon Grooming Medis kami menggunakan sampo hipoalergenik khusus untuk menjaga kesehatan kulit & bulu.'
  ];

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID'));
      setDateStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      );
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    const tipTimer = setInterval(() => setTipIndex((prev) => (prev + 1) % tips.length), 7000);

    return () => {
      clearInterval(timer);
      clearInterval(tipTimer);
    };
  }, []);

  const serving = clinicVisits.find((v) => v.status === 'Sedang Diperiksa' || v.status === 'Dipanggil') || clinicVisits[0];
  const waitingList = clinicVisits.filter((v) => v.status === 'Menunggu').slice(0, 5);
  const completedToday = clinicVisits.filter((v) => v.status === 'Selesai').length;

  // Sound chime using Web Audio API + SpeechSynthesis (Indonesian Female Voice)
  const playCallAnnouncement = (ticketNo: string, patientName: string, doctorName: string) => {
    setIsCallingAudio(true);
    callPatientQueueVoice({
      ticketNo,
      patientName,
      destination: doctorName ? `ruang periksa ${doctorName}` : 'ruang periksa dokter',
      onEnd: () => setIsCallingAudio(false),
      onError: () => setIsCallingAudio(false)
    });
    addToast(`Panggilan suara antrean ${ticketNo} (${patientName}) diumumkan ke speaker ruang tunggu (Suara Wanita Indonesia)!`, 'info');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A] text-[#FFFDF9] flex flex-col justify-between p-5 md:p-8 overflow-hidden select-none font-sans">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#B8905A] text-[#101A2C] flex items-center justify-center text-2xl font-black shadow-lg border border-amber-300/40">
            🐾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white font-display">
                PetCare Hospital & Clinic
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                Layar Antrian Digital
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Sistem Pemanggilan Pasien Waktu-Nyata & Informasi Ruang Tunggu
            </p>
          </div>
        </div>

        {/* Date & Time Widget + Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs text-slate-300 font-bold">{dateStr}</span>
            <span className="text-[10px] text-emerald-400 font-medium">Operasional Aktif 24/7</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded-2xl font-mono text-xl font-black text-amber-300 shadow-inner">
            <Clock className="w-5 h-5 text-[#B8905A]" />
            <span>{time}</span>
          </div>

          {serving && (
            <button
              onClick={() =>
                playCallAnnouncement(
                  `A-${String(serving.queueNo).padStart(2, '0')}`,
                  serving.petName,
                  serving.doctorName || 'Dokter Jaga'
                )
              }
              disabled={isCallingAudio}
              className="px-4 py-2 bg-[#B8905A] hover:bg-[#9E7848] text-[#101A2C] rounded-2xl text-xs font-black shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              title="Bunyikan Suara Panggilan"
            >
              <Volume2 className={`w-4 h-4 ${isCallingAudio ? 'animate-bounce text-white' : ''}`} />
              <span className="hidden sm:inline">
                {isCallingAudio ? 'Memanggil...' : 'Panggil Pasien'}
              </span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl border border-slate-700 cursor-pointer transition-colors"
            title="Toggle Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="p-2.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white rounded-2xl border border-rose-800/80 cursor-pointer transition-colors"
            title="Tutup Display Antrian"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-4">
        {/* Left Col: Main Active Serving Callout (7 Cols) */}
        <div className="lg:col-span-7 bg-gradient-to-b from-[#1E293B] to-[#0F172A] border-2 border-[#B8905A]/60 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Subtle glow circle */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Active Bar */}
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              SEDANG DILAYANI DI RUANG PERIKSA
            </span>
            <span className="text-xs text-slate-300 font-bold bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              Poli Medis 1
            </span>
          </div>

          {/* Huge Number Display */}
          <div className="my-6 text-center space-y-3">
            {serving ? (
              <div className="space-y-4">
                <span className="text-xs font-black tracking-widest text-[#B8905A] uppercase block">
                  NOMOR ANTRIAN SAAT INI
                </span>
                <div className="inline-block py-2 px-8 bg-black/40 rounded-3xl border border-amber-400/30 shadow-inner">
                  <h2 className="text-8xl md:text-9xl font-black text-amber-300 tracking-tighter drop-shadow-2xl font-mono">
                    A-{String(serving.queueNo).padStart(2, '0')}
                  </h2>
                </div>

                {/* Patient & Doctor Card */}
                <div className="pt-2">
                  <div className="inline-flex flex-col items-center px-8 py-3.5 bg-slate-800/90 rounded-2xl border border-slate-700 shadow-lg">
                    <h3 className="text-3xl md:text-4xl font-black text-white font-display">
                      {serving.petName}{' '}
                      <span className="text-xl font-semibold text-slate-300">
                        ({serving.petSpecies})
                      </span>
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-slate-300 font-medium mt-1">
                      <span>
                        Pemilik: <strong className="text-white">{serving.customerName}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Dokter:{' '}
                        <strong className="text-amber-300">
                          {serving.doctorName || 'drh. Ananda Putri'}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 space-y-3 text-slate-500">
                <Stethoscope className="w-16 h-16 mx-auto opacity-30 text-[#B8905A]" />
                <p className="text-xl font-bold text-slate-300">Ruang Periksa Siap Memanggil Pasien</p>
                <p className="text-xs text-slate-500">Antrian berikutnya akan otomatis tampil di layar</p>
              </div>
            )}
          </div>

          {/* Bottom Status Metrics */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-700/80">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-amber-400" />
              Estimasi Layanan: 15-20 Menit / Pasien
            </span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-700/60">
              <CheckCircle className="w-4 h-4" />
              {completedToday} Pasien Selesai Hari Ini
            </span>
          </div>
        </div>

        {/* Right Col: Next Queues & Room Availability (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {/* Waiting List Box */}
          <div className="bg-slate-900/90 border border-slate-700 rounded-3xl p-5 md:p-6 shadow-xl space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  DAFTAR ANTRIAN BERIKUTNYA
                </h3>
                <span className="text-[11px] font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  {waitingList.length} Menunggu
                </span>
              </div>

              <div className="space-y-2.5 mt-3">
                {waitingList.length > 0 ? (
                  waitingList.map((v, idx) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between hover:border-amber-400/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-amber-400/15 text-amber-300 font-black text-base flex items-center justify-center border border-amber-400/30 font-mono">
                          A-{String(v.queueNo).padStart(2, '0')}
                        </span>
                        <div>
                          <h4 className="font-bold text-white text-xs">
                            {v.petName}{' '}
                            <span className="text-[10px] font-normal text-slate-400">
                              ({v.petSpecies})
                            </span>
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            Pemilik: {v.customerName}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-200 block">
                          Urutan ke-{idx + 1}
                        </span>
                        <span className="text-[9px] text-slate-400 mt-0.5 block">
                          Est: ~{(idx + 1) * 15} mnt
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs space-y-1">
                    <CheckCircle className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="font-bold text-slate-400">Seluruh antrian telah selesai dilayani</p>
                    <p className="text-[10px]">Silakan registrasi antrian baru di meja resepsionis</p>
                  </div>
                )}
              </div>
            </div>

            {/* Room Status Indicator */}
            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Poli Medis 1:</span>
                <span className="font-bold text-emerald-400">● Beroperasi</span>
              </div>
              <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Poli Medis 2:</span>
                <span className="font-bold text-amber-300">● Standby</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Running News Ticker / Health Tips */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-3.5 flex items-center gap-3 shadow-lg">
        <span className="px-2.5 py-1 rounded-lg bg-[#B8905A] text-[#101A2C] text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#101A2C]" />
          TIPS EDUKASI
        </span>
        <div className="overflow-hidden flex-1">
          <p className="text-xs text-slate-200 font-medium truncate animate-fade-in">
            {tips[tipIndex]}
          </p>
        </div>
        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline shrink-0">
          PetCare Real-Time Signage Engine v2.4
        </span>
      </div>
    </div>
  );
};
