/**
 * Audio and Indonesian Female Voice Synthesis Utilities
 * Provides natural, fluent Indonesian female voice announcements for clinic patient queue calls.
 */

// Cached Indonesian female voice reference
let cachedFemaleVoice: SpeechSynthesisVoice | null = null;

/**
 * Find the best fluent Indonesian female voice available in the browser.
 */
export const getIndonesianFemaleVoice = (): SpeechSynthesisVoice | null => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. First priority: Indonesian voices explicitly matching female names or indicators
  const femaleIdRegex = /(gadis|damayanti|female|wanita|perempuan|siti|dewi|indah|putri|laras|ayu|wulan|intan|id-id-wavenet-a|id-id-standard-a|indonesian female)/i;
  const indonesianVoices = voices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith('id') ||
      v.lang.toLowerCase().startsWith('in') ||
      v.lang.toLowerCase().includes('indonesia')
  );

  const matchedFemaleIndonesian = indonesianVoices.find(
    (v) => femaleIdRegex.test(v.name) || femaleIdRegex.test(v.voiceURI)
  );
  if (matchedFemaleIndonesian) {
    cachedFemaleVoice = matchedFemaleIndonesian;
    return matchedFemaleIndonesian;
  }

  // 2. Second priority: Any standard Indonesian voice (e.g. Google Bahasa Indonesia, Microsoft, etc.)
  if (indonesianVoices.length > 0) {
    cachedFemaleVoice = indonesianVoices[0];
    return indonesianVoices[0];
  }

  // 3. Third priority: Any global female voice fallback
  const anyFemale = voices.find((v) => /(female|woman|zira|samantha|karen|victoria)/i.test(v.name));
  if (anyFemale) {
    cachedFemaleVoice = anyFemale;
    return anyFemale;
  }

  return voices[0] || null;
};

// Initialize voice listener for browsers that load voices asynchronously
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    getIndonesianFemaleVoice();
  };
}

/**
 * Play a pleasant hospital/clinic chime sound (3-tone ascending chord).
 */
export const playHospitalChime = (): void => {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    // Harmonious clinic paging chords: F5 (698.46Hz) -> A5 (880.00Hz) -> C6 (1046.50Hz)
    const frequencies = [698.46, 880.0, 1046.5];

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.2);

      gain.gain.setValueAtTime(0, now + i * 0.2);
      gain.gain.linearRampToValueAtTime(0.22, now + i * 0.2 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.2);
      osc.stop(now + i * 0.2 + 0.6);
    });
  } catch (e) {
    console.warn('Hospital chime audio playback failed:', e);
  }
};

interface CallPatientOptions {
  ticketNo: string;
  patientName: string;
  destination?: string; // e.g. "Ruang Periksa 1", "Poli Dokter", etc.
  onEnd?: () => void;
  onError?: () => void;
}

/**
 * Announces a patient call using a fluent Indonesian female voice with intro chime.
 */
export const callPatientQueueVoice = ({
  ticketNo,
  patientName,
  destination = 'ruang periksa',
  onEnd,
  onError
}: CallPatientOptions): void => {
  if (typeof window === 'undefined') return;

  // 1. Play clinic chime sound
  playHospitalChime();

  // 2. Play fluent Indonesian female speech
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      setTimeout(() => {
        // Natural Indonesian phrasing with punctuation pauses for clear intonation
        const spokenText = `Panggilan antrean. Nomor, ${ticketNo}. Atas nama pasien, ${patientName}. Silakan memasuki, ${destination}.`;
        const utterance = new SpeechSynthesisUtterance(spokenText);

        const femaleVoice = cachedFemaleVoice || getIndonesianFemaleVoice();
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }

        utterance.lang = 'id-ID';
        // Calibrated parameters for natural, clear, fluent Indonesian female cadence
        utterance.pitch = 1.1; // Gentle female pitch
        utterance.rate = 0.92; // Clear, articulate paging tempo (not too fast)
        utterance.volume = 1.0;

        utterance.onend = () => {
          if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
          console.warn('Speech synthesis utterance error:', e);
          if (onError) onError();
          else if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
      }, 700);
    } catch (e) {
      console.warn('Speech synthesis call failed:', e);
      if (onEnd) setTimeout(onEnd, 1200);
    }
  } else {
    if (onEnd) setTimeout(onEnd, 1200);
  }
};
