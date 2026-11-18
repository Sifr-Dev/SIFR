export type StoryAudioChapter =
  | 'prologue'
  | 'act-1'
  | 'act-2'
  | 'act-3'
  | 'act-4'
  | 'epilogue';

export type SoundscapeStatus = 'awaiting-gesture' | 'playing' | 'muted';
export type InteractionSoundKind = 'hover' | 'touch';

export interface ChapterHarmonicProfile {
  order: number;
  rootHz: number;
  fifthHz: number;
  cutoffHz: number;
  tempoMs: number;
  padGain: number;
  voiceGain: number;
  chimeGain: number;
  brightness: number;
  scaleOffsets: readonly number[];
  phraseSteps: readonly { degree: number | null; octaveLift: number; durationSec: number }[];
}

const CHAPTER_PROFILES: Record<StoryAudioChapter, ChapterHarmonicProfile> = {
  prologue: {
    order: 0,
    rootHz: 73.42, // D2 warm open fifth (D Dorian / Lydian light)
    fifthHz: 110.0, // A2
    cutoffHz: 340,
    tempoMs: 430,
    padGain: 0.042,
    voiceGain: 0.056,
    chimeGain: 0.052,
    brightness: 1.05,
    scaleOffsets: [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24],
    phraseSteps: [
      { degree: 0, octaveLift: 1, durationSec: 2.8 },
      { degree: 3, octaveLift: 2, durationSec: 2.2 },
      { degree: 5, octaveLift: 2, durationSec: 2.4 },
      { degree: 7, octaveLift: 3, durationSec: 2.6 },
      { degree: null, octaveLift: 2, durationSec: 1.4 },
      { degree: 4, octaveLift: 2, durationSec: 2.0 },
      { degree: 8, octaveLift: 3, durationSec: 2.8 },
      { degree: 10, octaveLift: 3, durationSec: 3.1 },
      { degree: 1, octaveLift: 1, durationSec: 2.5 },
      { degree: 5, octaveLift: 2, durationSec: 2.1 },
      { degree: 6, octaveLift: 3, durationSec: 2.6 },
      { degree: 9, octaveLift: 3, durationSec: 2.9 },
      { degree: null, octaveLift: 2, durationSec: 1.2 },
      { degree: 7, octaveLift: 2, durationSec: 2.3 },
      { degree: 5, octaveLift: 3, durationSec: 2.7 },
      { degree: 3, octaveLift: 2, durationSec: 2.4 },
    ],
  },
  'act-1': {
    order: 1,
    rootHz: 65.41, // C2 clear narrative warmth (C Major 9 / Lydian)
    fifthHz: 98.0, // G2
    cutoffHz: 380,
    tempoMs: 390,
    padGain: 0.044,
    voiceGain: 0.06,
    chimeGain: 0.055,
    brightness: 1.15,
    scaleOffsets: [0, 2, 4, 7, 11, 12, 14, 16, 19, 23, 24],
    phraseSteps: [
      { degree: 0, octaveLift: 1, durationSec: 2.4 },
      { degree: 2, octaveLift: 2, durationSec: 2.0 },
      { degree: 4, octaveLift: 2, durationSec: 2.2 },
      { degree: 6, octaveLift: 3, durationSec: 2.5 },
      { degree: 8, octaveLift: 3, durationSec: 2.8 },
      { degree: null, octaveLift: 2, durationSec: 1.2 },
      { degree: 7, octaveLift: 3, durationSec: 2.4 },
      { degree: 9, octaveLift: 3, durationSec: 2.9 },
      { degree: 1, octaveLift: 1, durationSec: 2.4 },
      { degree: 3, octaveLift: 2, durationSec: 2.0 },
      { degree: 5, octaveLift: 2, durationSec: 2.3 },
      { degree: 8, octaveLift: 3, durationSec: 2.6 },
      { degree: 10, octaveLift: 3, durationSec: 3.1 },
      { degree: 6, octaveLift: 2, durationSec: 2.1 },
      { degree: 4, octaveLift: 3, durationSec: 2.5 },
      { degree: null, octaveLift: 2, durationSec: 1.4 },
    ],
  },
  'act-2': {
    order: 2,
    rootHz: 82.41, // E2 contemplative Minor 11
    fifthHz: 123.47, // B2
    cutoffHz: 420,
    tempoMs: 375,
    padGain: 0.045,
    voiceGain: 0.062,
    chimeGain: 0.056,
    brightness: 1.25,
    scaleOffsets: [0, 2, 3, 7, 10, 12, 14, 15, 19, 22, 24],
    phraseSteps: [
      { degree: 0, octaveLift: 1, durationSec: 2.5 },
      { degree: 3, octaveLift: 2, durationSec: 2.0 },
      { degree: 4, octaveLift: 2, durationSec: 2.3 },
      { degree: 6, octaveLift: 3, durationSec: 2.7 },
      { degree: 9, octaveLift: 3, durationSec: 3.0 },
      { degree: 8, octaveLift: 3, durationSec: 2.4 },
      { degree: null, octaveLift: 2, durationSec: 1.2 },
      { degree: 7, octaveLift: 3, durationSec: 2.6 },
      { degree: 1, octaveLift: 1, durationSec: 2.4 },
      { degree: 4, octaveLift: 2, durationSec: 2.1 },
      { degree: 6, octaveLift: 2, durationSec: 2.4 },
      { degree: 10, octaveLift: 3, durationSec: 3.2 },
      { degree: 8, octaveLift: 3, durationSec: 2.5 },
      { degree: 5, octaveLift: 2, durationSec: 2.2 },
      { degree: 3, octaveLift: 3, durationSec: 2.7 },
      { degree: null, octaveLift: 2, durationSec: 1.3 },
    ],
  },
  'act-3': {
    order: 3,
    rootHz: 55.0, // A1 deep chamber cello + luminous piano octaves
    fifthHz: 82.41, // E2
    cutoffHz: 350,
    tempoMs: 410,
    padGain: 0.046,
    voiceGain: 0.062,
    chimeGain: 0.056,
    brightness: 1.18,
    scaleOffsets: [0, 2, 3, 7, 9, 12, 14, 16, 19, 21, 24],
    phraseSteps: [
      { degree: 0, octaveLift: 1, durationSec: 2.7 },
      { degree: 3, octaveLift: 2, durationSec: 2.1 },
      { degree: 5, octaveLift: 2, durationSec: 2.3 },
      { degree: 8, octaveLift: 3, durationSec: 2.8 },
      { degree: 10, octaveLift: 3, durationSec: 3.2 },
      { degree: null, octaveLift: 2, durationSec: 1.4 },
      { degree: 6, octaveLift: 3, durationSec: 2.6 },
      { degree: 9, octaveLift: 3, durationSec: 2.9 },
      { degree: 2, octaveLift: 1, durationSec: 2.5 },
      { degree: 4, octaveLift: 2, durationSec: 2.2 },
      { degree: 7, octaveLift: 3, durationSec: 2.8 },
      { degree: 9, octaveLift: 3, durationSec: 3.0 },
      { degree: 8, octaveLift: 2, durationSec: 2.3 },
      { degree: null, octaveLift: 2, durationSec: 1.2 },
      { degree: 5, octaveLift: 3, durationSec: 2.6 },
      { degree: 3, octaveLift: 2, durationSec: 2.4 },
    ],
  },
  'act-4': {
    order: 4,
    rootHz: 98.0, // G2 soaring neo-classical resolve
    fifthHz: 146.83, // D3
    cutoffHz: 460,
    tempoMs: 365,
    padGain: 0.044,
    voiceGain: 0.064,
    chimeGain: 0.058,
    brightness: 1.32,
    scaleOffsets: [0, 2, 4, 7, 11, 12, 14, 18, 19, 23, 24],
    phraseSteps: [
      { degree: 0, octaveLift: 1, durationSec: 2.4 },
      { degree: 2, octaveLift: 2, durationSec: 2.0 },
      { degree: 4, octaveLift: 2, durationSec: 2.2 },
      { degree: 7, octaveLift: 3, durationSec: 2.6 },
      { degree: 10, octaveLift: 3, durationSec: 3.1 },
      { degree: 9, octaveLift: 3, durationSec: 2.5 },
      { degree: 6, octaveLift: 3, durationSec: 2.4 },
      { degree: null, octaveLift: 2, durationSec: 1.1 },
      { degree: 1, octaveLift: 1, durationSec: 2.3 },
      { degree: 3, octaveLift: 2, durationSec: 2.1 },
      { degree: 6, octaveLift: 3, durationSec: 2.6 },
      { degree: 8, octaveLift: 3, durationSec: 2.8 },
      { degree: 10, octaveLift: 3, durationSec: 3.2 },
      { degree: 7, octaveLift: 2, durationSec: 2.2 },
      { degree: 4, octaveLift: 3, durationSec: 2.6 },
      { degree: null, octaveLift: 2, durationSec: 1.2 },
    ],
  },
  epilogue: {
    order: 5,
    rootHz: 110.0, // A2 serene high-register resolution
    fifthHz: 164.81, // E3
    cutoffHz: 390,
    tempoMs: 445,
    padGain: 0.04,
    voiceGain: 0.056,
    chimeGain: 0.052,
    brightness: 1.12,
    scaleOffsets: [0, 4, 7, 9, 12, 16, 19, 21, 24],
    phraseSteps: [
      { degree: 0, octaveLift: 1, durationSec: 2.9 },
      { degree: 2, octaveLift: 2, durationSec: 2.4 },
      { degree: 4, octaveLift: 2, durationSec: 2.5 },
      { degree: 6, octaveLift: 3, durationSec: 3.0 },
      { degree: 8, octaveLift: 3, durationSec: 3.4 },
      { degree: null, octaveLift: 2, durationSec: 1.6 },
      { degree: 5, octaveLift: 3, durationSec: 2.8 },
      { degree: 7, octaveLift: 3, durationSec: 3.1 },
      { degree: 1, octaveLift: 1, durationSec: 2.6 },
      { degree: 4, octaveLift: 2, durationSec: 2.3 },
      { degree: 6, octaveLift: 3, durationSec: 2.8 },
      { degree: null, octaveLift: 2, durationSec: 1.8 },
    ],
  },
};

export function getChapterFromLabel(label: string): StoryAudioChapter {
  const lower = label.toLowerCase();
  if (lower.includes('part iv') || lower.includes('crafted from zero')) return 'act-4';
  if (lower.includes('part iii') || lower.includes('memory and trust')) return 'act-3';
  if (lower.includes('part ii') || lower.includes('math to silicon')) return 'act-2';
  if (lower.includes('part i') || lower.includes('first systems')) return 'act-1';
  if (lower.includes('epilogue')) return 'epilogue';
  return 'prologue';
}

export function getChapterScaleProfile(chapter: StoryAudioChapter): ChapterHarmonicProfile {
  return CHAPTER_PROFILES[chapter] ?? CHAPTER_PROFILES.prologue;
}

export function computeNoteFrequency(
  rootHz: number,
  stepIndex: number,
  scaleOffsets: readonly number[],
  octaveLift = 2
): number {
  if (!Number.isFinite(rootHz) || rootHz <= 0 || scaleOffsets.length === 0) return 220;
  const safeIdx = Math.abs(Math.floor(stepIndex)) % scaleOffsets.length;
  const semitones = scaleOffsets[safeIdx] + octaveLift * 12;
  const hz = rootHz * Math.pow(2, semitones / 12);
  return Math.round(hz * 100) / 100;
}

export function computeScrollFilterCutoff(baseCutoffHz: number, velocityNorm: number): number {
  const safeBase = Number.isFinite(baseCutoffHz) && baseCutoffHz > 40 ? baseCutoffHz : 320;
  const clamped = Math.max(0, Math.min(1, Number.isFinite(velocityNorm) ? velocityNorm : 0));
  return Math.round(safeBase + clamped * 440);
}

export interface AcousticPhraseStepSpec {
  noteHz: number | null;
  harmonicTopHz: number | null;
  accentBass: boolean;
  durationSec: number;
}

export function computeArpeggioStep(
  stepIndex: number,
  chapter: StoryAudioChapter
): AcousticPhraseStepSpec {
  const profile = getChapterScaleProfile(chapter);
  const idx = Math.abs(Math.floor(stepIndex)) % profile.phraseSteps.length;
  const step = profile.phraseSteps[idx];
  const accentBass = idx % 8 === 0;

  if (step.degree === null) {
    return {
      noteHz: null,
      harmonicTopHz: null,
      accentBass,
      durationSec: step.durationSec,
    };
  }

  const noteHz = computeNoteFrequency(
    profile.rootHz,
    step.degree,
    profile.scaleOffsets,
    step.octaveLift
  );
  const addUpperHarmonic = idx % 8 === 4 || idx % 8 === 7;
  const harmonicTopHz = addUpperHarmonic
    ? computeNoteFrequency(profile.rootHz, step.degree + 3, profile.scaleOffsets, 3)
    : null;

  return {
    noteHz,
    harmonicTopHz,
    accentBass,
    durationSec: step.durationSec,
  };
}

export function shouldScheduleGenerativeNote(
  audioState: AudioContextState | 'uninitialized',
  documentHidden: boolean
): boolean {
  return audioState === 'running' && !documentHidden;
}

class AmbientSoundscapeEngine {
  private ctx: AudioContext | null = null;
  private status: SoundscapeStatus = 'awaiting-gesture';
  private chapter: StoryAudioChapter = 'prologue';
  private stepCounter = 0;
  private lastPanelPingMs = 0;
  private lastScrubMs = 0;
  private lastScrubStep = -1;
  private lastMotionShimmerMs = 0;
  private scrollVelocity = 0;

  private masterGain: GainNode | null = null;
  private busInput: DynamicsCompressorNode | null = null;
  private reverbSend: GainNode | null = null;
  private padOscSub: OscillatorNode | null = null;
  private padOsc1: OscillatorNode | null = null;
  private padOsc2: OscillatorNode | null = null;
  private padLfo: OscillatorNode | null = null;
  private padFilter: BiquadFilterNode | null = null;
  private padGainNode: GainNode | null = null;

  private seqTimerId: number | null = null;
  private gestureCleanup: (() => void) | null = null;
  private visibilityCleanup: (() => void) | null = null;
  private statusListeners = new Set<(next: SoundscapeStatus) => void>();

  getStatus(): SoundscapeStatus {
    return this.status;
  }

  private setStatus(next: SoundscapeStatus): void {
    if (this.status === next) return;
    this.status = next;
    this.statusListeners.forEach((fn) => fn(next));
  }

  subscribeStatus(fn: (status: SoundscapeStatus) => void): () => void {
    this.statusListeners.add(fn);
    return () => {
      this.statusListeners.delete(fn);
    };
  }

  installGestureUnlock(): () => void {
    if (typeof window === 'undefined') return () => undefined;
    if (this.status === 'playing') return () => undefined;
    if (this.gestureCleanup) return this.gestureCleanup;

    const handleUserGesture = () => {
      void this.unlockFromGesture();
    };

    const events = ['pointerdown', 'touchstart', 'keydown', 'mousedown'] as const;
    events.forEach((evt) => {
      window.addEventListener(evt, handleUserGesture, { passive: true });
    });

    const handleVisibility = () => {
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      if (document.hidden) {
        this.masterGain.gain.setTargetAtTime(0.0001, now, 0.25);
      } else if (this.status === 'playing' && this.ctx.state === 'running') {
        this.masterGain.gain.setTargetAtTime(0.85, now, 0.45);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    this.gestureCleanup = () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserGesture);
      });
      this.gestureCleanup = null;
    };

    this.visibilityCleanup = () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      this.visibilityCleanup = null;
    };

    return () => {
      this.gestureCleanup?.();
      this.visibilityCleanup?.();
    };
  }

  private async unlockFromGesture(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (this.status === 'muted') return;

    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;

    try {
      if (!this.ctx) {
        this.ctx = new Ctx();
      }
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
    } catch {
      return;
    }

    if (this.ctx.state !== 'running') return;

    this.gestureCleanup?.();
    this.ensureGraphStarted();
    this.setStatus('playing');
    this.schedulePhraseLoop();
  }

  /**
   * Builds a warm, smooth 2.4-second acoustic concert-hall stereo impulse response for ConvolverNode.
   */
  private createConcertHallImpulse(ctx: AudioContext): AudioBuffer {
    const durationSec = 2.4;
    const length = Math.floor(ctx.sampleRate * durationSec);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      let lpState = 0;
      let seed = ch === 0 ? 19283746 : 91827364;
      for (let i = 0; i < length; i++) {
        // Deterministic PRNG avoids non-reproducible metallic bursts
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const white = (seed / 0xffffffff) * 2 - 1;
        const env = Math.pow(1 - i / length, 2.35);
        // Progressive high-frequency air absorption like a wooden concert hall
        lpState += (white - lpState) * 0.14;
        data[i] = lpState * env * 0.52;
      }
    }
    return impulse;
  }

  private ensureGraphStarted(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const profile = getChapterScaleProfile(this.chapter);

    if (!this.masterGain || !this.padOsc1 || !this.padOsc2 || !this.padFilter || !this.padGainNode) {
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-16, now);
      compressor.knee.setValueAtTime(18, now);
      compressor.ratio.setValueAtTime(2.6, now);
      compressor.attack.setValueAtTime(0.02, now);
      compressor.release.setValueAtTime(0.32, now);

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.linearRampToValueAtTime(0.85, now + 0.65);

      compressor.connect(master);
      master.connect(ctx.destination);

      // Warm Acoustic Concert-Hall Convolution Reverb bus
      const reverbSend = ctx.createGain();
      const reverbFilter = ctx.createBiquadFilter();
      const convolver = ctx.createConvolver();
      const reverbReturn = ctx.createGain();

      reverbFilter.type = 'lowpass';
      reverbFilter.frequency.setValueAtTime(2800, now);
      convolver.buffer = this.createConcertHallImpulse(ctx);
      reverbReturn.gain.setValueAtTime(0.62, now);

      reverbSend.connect(reverbFilter);
      reverbFilter.connect(convolver);
      convolver.connect(reverbReturn);
      reverbReturn.connect(compressor);

      // Warm Chamber String Ensemble (sine cello root + soft detuned triangle strings, zero buzzy sawtooth)
      const oscSub = ctx.createOscillator();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const padFilter = ctx.createBiquadFilter();
      const padGain = ctx.createGain();

      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(profile.rootHz, now);

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(profile.rootHz * 2, now);
      osc1.detune.setValueAtTime(-4, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(profile.fifthHz * 2, now);
      osc2.detune.setValueAtTime(4, now);

      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(profile.cutoffHz, now);
      padFilter.Q.setValueAtTime(0.75, now);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.11, now);
      lfoGain.gain.setValueAtTime(55, now);
      lfo.connect(lfoGain);
      lfoGain.connect(padFilter.frequency);

      padGain.gain.setValueAtTime(profile.padGain, now);

      oscSub.connect(padFilter);
      osc1.connect(padFilter);
      osc2.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(compressor);
      padGain.connect(reverbSend);

      oscSub.start(now);
      osc1.start(now);
      osc2.start(now);
      lfo.start(now);

      this.masterGain = master;
      this.busInput = compressor;
      this.reverbSend = reverbSend;
      this.padOscSub = oscSub;
      this.padOsc1 = osc1;
      this.padOsc2 = osc2;
      this.padLfo = lfo;
      this.padFilter = padFilter;
      this.padGainNode = padGain;
      return;
    }

    this.padOscSub?.frequency.setTargetAtTime(profile.rootHz, now, 0.75);
    this.padOsc1.frequency.setTargetAtTime(profile.rootHz * 2, now, 0.75);
    this.padOsc2.frequency.setTargetAtTime(profile.fifthHz * 2, now, 0.75);
    this.padFilter.frequency.setTargetAtTime(
      computeScrollFilterCutoff(profile.cutoffHz, this.scrollVelocity),
      now,
      0.55
    );
    this.padGainNode.gain.setTargetAtTime(profile.padGain, now, 0.5);
  }

  private schedulePhraseLoop(): void {
    if (typeof window === 'undefined' || this.seqTimerId !== null) return;

    const tick = () => {
      this.seqTimerId = null;
      if (this.status !== 'playing') return;

      const profile = getChapterScaleProfile(this.chapter);
      const ctxState = this.ctx?.state ?? 'uninitialized';
      const hidden = typeof document !== 'undefined' && document.hidden;

      if (shouldScheduleGenerativeNote(ctxState, hidden)) {
        const step = computeArpeggioStep(this.stepCounter, this.chapter);
        if (step.accentBass) {
          this.triggerWarmCelloPedal(profile.rootHz * 2, profile.voiceGain * 0.55, 2.4);
        }
        if (step.noteHz !== null) {
          const expressiveness = 0.85 + Math.sin(this.stepCounter * 0.7) * 0.15 + this.scrollVelocity * 0.25;
          this.triggerFeltPianoNote(
            step.noteHz,
            profile.voiceGain * expressiveness,
            step.durationSec,
            profile.brightness + this.scrollVelocity * 0.3
          );
        }
        if (step.harmonicTopHz !== null) {
          this.triggerFeltPianoNote(
            step.harmonicTopHz,
            profile.voiceGain * 0.42,
            step.durationSec * 1.15,
            profile.brightness * 1.15
          );
        }
        this.stepCounter = (this.stepCounter + 1) % 64;
      }

      // Expressive subtle rubato (~±18ms) feels human rather than quantized machine clock
      const rubatoMs = Math.round(Math.sin(this.stepCounter * 1.3) * 18);
      this.seqTimerId = window.setTimeout(tick, Math.max(260, profile.tempoMs + rubatoMs));
    };

    this.seqTimerId = window.setTimeout(tick, 140);
  }

  /**
   * Warm acoustic felt-piano / concert harp voice using natural harmonic overtones
   * (zero harsh FM clang) softened through a felt damper filter and routed to hall reverb.
   */
  private triggerFeltPianoNote(
    freqHz: number,
    peakGain: number,
    durationSec: number,
    brightness = 1.1
  ): void {
    const ctx = this.ctx;
    const out = this.busInput ?? ctx?.destination;
    if (!ctx || !out || ctx.state !== 'running') return;

    const now = ctx.currentTime;
    const clampedFreq = Math.max(60, Math.min(2400, freqHz));

    const f1 = ctx.createOscillator();
    const f2 = ctx.createOscillator();
    const f3 = ctx.createOscillator();
    const g2 = ctx.createGain();
    const g3 = ctx.createGain();

    const voiceFilter = ctx.createBiquadFilter();
    const ampEnv = ctx.createGain();

    f1.type = 'sine';
    f1.frequency.setValueAtTime(clampedFreq, now);

    f2.type = 'sine';
    f2.frequency.setValueAtTime(clampedFreq * 2, now);
    g2.gain.setValueAtTime(0.22, now);

    f3.type = 'triangle';
    f3.frequency.setValueAtTime(clampedFreq * 3, now);
    g3.gain.setValueAtTime(0.055, now);

    voiceFilter.type = 'lowpass';
    const initialCutoff = Math.min(3400, clampedFreq * (2.2 * brightness));
    voiceFilter.frequency.setValueAtTime(initialCutoff, now);
    voiceFilter.frequency.exponentialRampToValueAtTime(
      Math.max(260, clampedFreq * 1.05),
      now + Math.min(1.2, durationSec * 0.65)
    );
    voiceFilter.Q.setValueAtTime(0.6, now);

    // Gentle felt hammer attack (14ms) -> natural exponential piano string decay
    ampEnv.gain.setValueAtTime(0.0001, now);
    ampEnv.gain.linearRampToValueAtTime(peakGain, now + 0.016);
    ampEnv.gain.exponentialRampToValueAtTime(peakGain * 0.34, now + 0.28);
    ampEnv.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    f1.connect(voiceFilter);
    f2.connect(g2);
    g2.connect(voiceFilter);
    f3.connect(g3);
    g3.connect(voiceFilter);

    voiceFilter.connect(ampEnv);
    ampEnv.connect(out);
    if (this.reverbSend) {
      ampEnv.connect(this.reverbSend);
    }

    f1.start(now);
    f2.start(now);
    f3.start(now);
    const stopAt = now + durationSec + 0.06;
    f1.stop(stopAt);
    f2.stop(stopAt);
    f3.stop(stopAt);
  }

  private triggerWarmCelloPedal(freqHz: number, peakGain: number, durationSec: number): void {
    const ctx = this.ctx;
    const out = this.busInput ?? ctx?.destination;
    if (!ctx || !out || ctx.state !== 'running') return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const env = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freqHz, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.max(240, freqHz * 2.1), now);

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(peakGain, now + 0.14);
    env.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(filter);
    filter.connect(env);
    env.connect(out);
    if (this.reverbSend) env.connect(this.reverbSend);

    osc.start(now);
    osc.stop(now + durationSec + 0.06);
  }

  private triggerChapterTransition(ascending: boolean): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;

    const profile = getChapterScaleProfile(this.chapter);
    // Warm rolled 4-note suspended acoustic piano/harp chord spanning 2.5 octaves
    const notes = ascending ? [0, 3, 6, 9] : [9, 6, 3, 0];
    this.triggerWarmCelloPedal(profile.rootHz * 2, profile.voiceGain * 0.65, 2.8);

    notes.forEach((deg, idx) => {
      const oct = idx === 0 ? 1 : idx === 3 ? 3 : 2;
      const freq = computeNoteFrequency(profile.rootHz, deg, profile.scaleOffsets, oct);
      window.setTimeout(() => {
        if (this.status !== 'playing' || !this.ctx || this.ctx.state !== 'running') return;
        this.triggerFeltPianoNote(freq, profile.chimeGain * 0.72, 2.6, 1.25);
      }, idx * 85);
    });
  }

  setChapter(chapter: StoryAudioChapter): void {
    if (this.chapter === chapter) return;
    const prevOrder = getChapterScaleProfile(this.chapter).order;
    const nextOrder = getChapterScaleProfile(chapter).order;
    this.chapter = chapter;

    if (this.status === 'playing' && this.ctx?.state === 'running') {
      this.ensureGraphStarted();
      this.triggerChapterTransition(nextOrder >= prevOrder);
    }
  }

  /**
   * Couples horizontal/vertical canvas motion gently to string ensemble warmth
   * and triggers luminous high-register piano harmonics during brisk scroll glides.
   */
  modulateScrollMotion(velocityNorm: number): void {
    const clamped = Math.max(0, Math.min(1, Number.isFinite(velocityNorm) ? velocityNorm : 0));
    this.scrollVelocity = clamped;
    if (this.status !== 'playing' || !this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;
    const profile = getChapterScaleProfile(this.chapter);
    if (this.padFilter) {
      const targetCutoff = computeScrollFilterCutoff(profile.cutoffHz, clamped);
      this.padFilter.frequency.setTargetAtTime(targetCutoff, now, 0.18);
    }

    const nowMs = Date.now();
    if (clamped > 0.35 && nowMs - this.lastMotionShimmerMs > 280) {
      this.lastMotionShimmerMs = nowMs;
      const deg = (this.stepCounter * 2) % profile.scaleOffsets.length;
      const sparkleHz = computeNoteFrequency(profile.rootHz, deg, profile.scaleOffsets, 3);
      this.triggerFeltPianoNote(sparkleHz, profile.chimeGain * 0.36, 1.6, 1.2);
    }
  }

  /**
   * Plays an expressive felt-piano or open-chord effect on card/schematic hover or touch.
   */
  playPanelShimmer(panelSeed: number, kind: InteractionSoundKind = 'hover'): void {
    if (this.status !== 'playing' || !this.ctx || this.ctx.state !== 'running') return;
    if (typeof document !== 'undefined' && document.hidden) return;

    const nowMs = Date.now();
    const minInterval = kind === 'touch' ? 110 : 170;
    if (nowMs - this.lastPanelPingMs < minInterval) return;
    this.lastPanelPingMs = nowMs;

    const profile = getChapterScaleProfile(this.chapter);
    const melodyHz = computeNoteFrequency(profile.rootHz, panelSeed, profile.scaleOffsets, 3);

    if (kind === 'touch') {
      const bassHz = computeNoteFrequency(profile.rootHz, panelSeed, profile.scaleOffsets, 1);
      const fifthHz = computeNoteFrequency(profile.rootHz, panelSeed + 3, profile.scaleOffsets, 2);
      this.triggerWarmCelloPedal(bassHz, profile.chimeGain * 0.65, 2.1);
      this.triggerFeltPianoNote(fifthHz, profile.chimeGain * 0.85, 2.2, 1.2);
      this.triggerFeltPianoNote(melodyHz, profile.chimeGain * 0.9, 2.5, 1.3);
    } else {
      this.triggerFeltPianoNote(melodyHz, profile.chimeGain * 0.54, 1.85, 1.18);
    }
  }

  /**
   * Emits soft upper-octave harp/marimba scale tones when scrubbing schematics or cipher ring.
   */
  playScrubTick(normValue: number): void {
    if (this.status !== 'playing' || !this.ctx || this.ctx.state !== 'running') return;
    if (typeof document !== 'undefined' && document.hidden) return;

    const clamped = Math.max(0, Math.min(0.999, Number.isFinite(normValue) ? normValue : 0.5));
    const profile = getChapterScaleProfile(this.chapter);
    const quantizedStep = Math.floor(clamped * profile.scaleOffsets.length);
    const nowMs = Date.now();
    if (quantizedStep === this.lastScrubStep && nowMs - this.lastScrubMs < 140) return;
    if (nowMs - this.lastScrubMs < 75) return;

    this.lastScrubStep = quantizedStep;
    this.lastScrubMs = nowMs;

    const freq = computeNoteFrequency(profile.rootHz, quantizedStep, profile.scaleOffsets, 3);
    this.triggerFeltPianoNote(freq, profile.chimeGain * 0.34, 0.95, 1.25);
  }

  dispose(): void {
    if (this.seqTimerId !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.seqTimerId);
      this.seqTimerId = null;
    }
    this.gestureCleanup?.();
    this.visibilityCleanup?.();
    try {
      this.padOscSub?.stop();
      this.padOsc1?.stop();
      this.padOsc2?.stop();
      this.padLfo?.stop();
    } catch {
      // Ignore already-stopped nodes
    }
  }
}

export const ambientSoundscape = new AmbientSoundscapeEngine();
