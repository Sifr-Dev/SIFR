export type HapticKind = 'detent' | 'tap' | 'confirm' | 'snapZero' | 'garble';

type HapticListener = (kind: HapticKind, timestamp: number) => void;

class HapticEngine {
  private audioEnabled = false;
  private vibrationEnabled = true;
  private audioCtx: AudioContext | null = null;
  private listeners = new Set<HapticListener>();
  private lastTriggerAt = 0;

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
      this.trigger('confirm');
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

  private playAcousticDetent(kind: HapticKind): void {
    if (!this.audioEnabled) return;
    const ctx = this.ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
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
      gain.gain.setValueAtTime(0.06, now);
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
