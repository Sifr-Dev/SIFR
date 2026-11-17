export type HapticKind = 'detent' | 'tap' | 'confirm' | 'snapZero' | 'garble';
export type AmbientActKey = 'entrance' | 'act-1' | 'act-2' | 'act-3' | 'act-4' | 'exit';

type HapticListener = (kind: HapticKind, timestamp: number) => void;

const ACT_DRONE_FREQS: Record<AmbientActKey, [number, number]> = {
  entrance: [65.41, 98.0],   // C2 + G2 open anchor
  'act-1': [55.0, 82.41],    // A1 + E2 sub-metal
  'act-2': [73.42, 110.0],   // D2 + A2 clean boundary fifth
  'act-3': [98.0, 146.83],   // G2 + D3 flight / silicon
  'act-4': [110.0, 164.81],  // A2 + E3 post-quantum harmonic
  exit: [130.81, 196.0],     // C3 + G3 resolution
};

class HapticEngine {
  private audioEnabled = false;
  private vibrationEnabled = true;
  private audioCtx: AudioContext | null = null;
  private listeners = new Set<HapticListener>();
  private lastTriggerAt = 0;

  private ambientAct: AmbientActKey = 'entrance';
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneOsc3: OscillatorNode | null = null;
  private droneLfo: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;

  subscribe(fn: HapticListener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  isAudioEnabled(): boolean {
    return this.audioEnabled;
  }

  setAudioEnabled(enabled: boolean): void {
    this.audioEnabled = enabled;
    if (enabled) {
      this.ensureAudioContext();
      this.syncAmbientDrone();
      this.trigger('confirm');
    } else {
      this.muteAmbientDrone();
    }
  }

  setAmbientAct(act: AmbientActKey): void {
    if (this.ambientAct === act && this.droneGain) return;
    this.ambientAct = act;
    if (this.audioEnabled) {
      this.syncAmbientDrone();
    }
  }

  isVibrationEnabled(): boolean {
    return this.vibrationEnabled;
  }

  setVibrationEnabled(enabled: boolean): void {
    this.vibrationEnabled = enabled;
  }

  private ensureAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctx) {
        this.audioCtx = new Ctx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume().catch(() => undefined);
    }
    return this.audioCtx;
  }

  private syncAmbientDrone(): void {
    if (!this.audioEnabled) return;
    const ctx = this.ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const [f1, f2] = ACT_DRONE_FREQS[this.ambientAct] ?? ACT_DRONE_FREQS.entrance;

    if (!this.droneOsc1 || !this.droneOsc2 || !this.droneGain || !this.droneFilter) {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      const shimmerGain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc3.type = 'sine';
      osc1.frequency.setValueAtTime(f1, now);
      osc2.frequency.setValueAtTime(f2, now);
      osc3.frequency.setValueAtTime(f1 * 2, now);

      shimmerGain.gain.setValueAtTime(0.28, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);
      filter.Q.value = 0.85;

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.14, now);
      lfoGain.gain.setValueAtTime(75, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.019, now + 0.75);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(shimmerGain);
      shimmerGain.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      lfo.start(now);

      this.droneOsc1 = osc1;
      this.droneOsc2 = osc2;
      this.droneOsc3 = osc3;
      this.droneLfo = lfo;
      this.droneFilter = filter;
      this.droneGain = gain;
      return;
    }

    this.droneOsc1.frequency.setTargetAtTime(f1, now, 0.32);
    this.droneOsc2.frequency.setTargetAtTime(f2, now, 0.32);
    this.droneOsc3?.frequency.setTargetAtTime(f1 * 2, now, 0.36);
    this.droneGain.gain.setTargetAtTime(0.019, now, 0.25);
  }

  private muteAmbientDrone(): void {
    if (!this.audioCtx || !this.droneGain) return;
    const now = this.audioCtx.currentTime;
    try {
      this.droneGain.gain.setTargetAtTime(0.0001, now, 0.14);
    } catch {
      // Ignore if AudioContext closed
    }
  }

  private playSnapZeroResonance(ctx: AudioContext, now: number): void {
    const chord = [220, 440, 659.25, 880];
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = idx <= 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.022);
      g.gain.setValueAtTime(0.0001, now + idx * 0.022);
      g.gain.linearRampToValueAtTime(0.028 / (idx + 1), now + idx * 0.022 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + idx * 0.022);
      osc.stop(now + 0.5);
    });
  }

  private playAcousticDetent(kind: HapticKind): void {
    if (!this.audioEnabled) return;
    const ctx = this.ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    if (kind === 'snapZero') {
      this.playSnapZeroResonance(ctx, now);
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.Q.value = 4.2;

    if (kind === 'snapZero') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1180, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.045);
      filter.frequency.setValueAtTime(1250, now);
      gain.gain.setValueAtTime(0.055, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
    } else if (kind === 'confirm') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(980, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.032);
      filter.frequency.setValueAtTime(1100, now);
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    } else if (kind === 'garble') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.05);
      filter.frequency.setValueAtTime(420, now);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
    } else if (kind === 'tap') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(860, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.018);
      filter.frequency.setValueAtTime(1000, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
    } else {
      // detent tick (15° cipher step)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1440, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.012);
      filter.frequency.setValueAtTime(1400, now);
      gain.gain.setValueAtTime(0.024, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  trigger(kind: HapticKind): void {
    const nowMs = Date.now();
    // Rate-limit dense pointer streams while allowing crisp 15° steps
    if (kind === 'detent' && nowMs - this.lastTriggerAt < 28) {
      return;
    }
    this.lastTriggerAt = nowMs;

    if (
      this.vibrationEnabled &&
      typeof navigator !== 'undefined' &&
      typeof navigator.vibrate === 'function'
    ) {
      const pattern: number | number[] =
        kind === 'snapZero'
          ? [10, 24, 14]
          : kind === 'confirm'
            ? [8, 20, 8]
            : kind === 'garble'
              ? [18, 18, 12]
              : kind === 'tap'
                ? 8
                : 5;
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore blocked vibration before gesture
      }
    }

    this.playAcousticDetent(kind);
    this.listeners.forEach((fn) => fn(kind, nowMs));
  }
}

export const haptics = new HapticEngine();
