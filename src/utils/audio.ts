// Child-friendly Web Audio SFX + Indonesian Speech Narration engine

let audioCtx: AudioContext | null = null;
let sfxEnabled = true;
let voiceEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setAudioSettings(options: { sfx?: boolean; voice?: boolean }) {
  if (typeof options.sfx === 'boolean') sfxEnabled = options.sfx;
  if (typeof options.voice === 'boolean') {
    voiceEnabled = options.voice;
    if (!voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export function getAudioSettings() {
  return { sfxEnabled, voiceEnabled };
}

function playTone(
  freq: number,
  startOffset: number,
  duration: number,
  type: OscillatorType = 'sine',
  peakGain = 0.16,
  endFreq?: number
) {
  if (!sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (endFreq) {
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
  }

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

/** Soft marimba tap when clicking buttons or picking an animal */
export function playTapSound() {
  playTone(523.25, 0, 0.11, 'sine', 0.14, 587.33);
}

/** Warm wooden select pop */
export function playSelectSound() {
  playTone(440, 0, 0.08, 'triangle', 0.12);
  playTone(587.33, 0.06, 0.12, 'sine', 0.14);
}

/** Cheerful ascending xylophone chime on a correct match */
export function playCorrectSound() {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
  notes.forEach((n, idx) => {
    playTone(n, idx * 0.075, 0.24, 'triangle', 0.16);
    playTone(n * 2, idx * 0.075, 0.16, 'sine', 0.04);
  });
}

/** Joyful celebration fanfare when finishing a round */
export function playVictorySound() {
  const melody = [
    { f: 523.25, t: 0, d: 0.14 },
    { f: 659.25, t: 0.11, d: 0.14 },
    { f: 783.99, t: 0.22, d: 0.14 },
    { f: 1046.5, t: 0.34, d: 0.26 },
    { f: 783.99, t: 0.54, d: 0.14 },
    { f: 1046.5, t: 0.68, d: 0.42 },
  ];
  melody.forEach((m) => {
    playTone(m.f, m.t, m.d, 'triangle', 0.17);
    playTone(m.f * 1.5, m.t, m.d * 0.7, 'sine', 0.04);
  });
}

/** Gentle, encouraging soft boop (never a harsh buzzer!) */
export function playTryAgainSound() {
  playTone(349.23, 0, 0.13, 'sine', 0.11, 293.66);
  playTone(293.66, 0.12, 0.16, 'sine', 0.09, 261.63);
}

/** Twinkling wind chime for hints */
export function playHintSound() {
  [659.25, 880, 1174.66].forEach((freq, idx) => {
    playTone(freq, idx * 0.09, 0.25, 'sine', 0.1);
  });
}

function pickIndonesianVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;
  const exactId = voices.find((v) => v.lang.toLowerCase() === 'id-id');
  if (exactId) return exactId;
  const startsId = voices.find((v) => v.lang.toLowerCase().startsWith('id'));
  if (startsId) return startsId;
  const namedIndon = voices.find((v) => v.name.toLowerCase().includes('indonesia'));
  return namedIndon || null;
}

/** Speak Indonesian text with warm, clear, child-friendly pacing */
export function speakFriendly(text: string, options?: { pitch?: number; rate?: number }) {
  if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.pitch = options?.pitch ?? 1.16;
    utterance.rate = options?.rate ?? 0.92;
    utterance.volume = 0.95;

    const voices = synth.getVoices();
    const idVoice = pickIndonesianVoice(voices);
    if (idVoice) {
      utterance.voice = idVoice;
    }

    synth.speak(utterance);
  } catch {
    // Graceful fallback if speech synthesis is blocked in a restricted environment
  }
}

export function stopAllSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}
