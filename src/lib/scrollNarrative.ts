export type SpreadFocusState = 'past' | 'active' | 'upcoming';

export interface SpreadFocusInput {
  itemCenter: number;
  viewportCenter: number;
  viewportSize: number;
  scrollProgress?: number;
  pinEdge?: 'start' | 'end';
  reducedMotion?: boolean;
}

export interface SpreadFocusResult {
  opacity: number;
  scale: number;
  driftPx: number;
  state: SpreadFocusState;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

function normalizeZero(n: number): number {
  return n === 0 ? 0 : n;
}

/**
 * Computes compositor-ready opacity, scale, and drift for a story spread on the moving canvas.
 * Older sections scrolled behind the active window gradually fade out as new sections enter focus.
 */
export function computeSpreadFocusState({
  itemCenter,
  viewportCenter,
  viewportSize,
  scrollProgress = 0.5,
  pinEdge,
  reducedMotion = false,
}: SpreadFocusInput): SpreadFocusResult {
  if (
    !Number.isFinite(itemCenter) ||
    !Number.isFinite(viewportCenter) ||
    !Number.isFinite(viewportSize) ||
    viewportSize <= 0
  ) {
    return { opacity: 1, scale: 1, driftPx: 0, state: 'active' };
  }

  if (pinEdge === 'start' && scrollProgress <= 0.035) {
    return { opacity: 1, scale: 1, driftPx: 0, state: 'active' };
  }
  if (pinEdge === 'end' && scrollProgress >= 0.93) {
    return { opacity: 1, scale: 1, driftPx: 0, state: 'active' };
  }

  const offset = itemCenter - viewportCenter;
  const pastFadeStart = -viewportSize * 0.14;
  const pastFadeEnd = -viewportSize * 0.58;
  const enterFocusEnd = viewportSize * 0.2;
  const enterFadeStart = viewportSize * 0.72;

  if (offset < pastFadeStart) {
    const t = clamp01((pastFadeStart - offset) / (pastFadeStart - pastFadeEnd));
    const eased = smoothstep(t);
    const opacity = reducedMotion ? 1 : Math.round((1 - eased * 0.88) * 1000) / 1000;
    const scale = reducedMotion ? 1 : Math.round((1 - eased * 0.045) * 1000) / 1000;
    const driftPx = reducedMotion ? 0 : normalizeZero(Math.round(-eased * 16 * 100) / 100);
    return {
      opacity,
      scale,
      driftPx,
      state: 'past',
    };
  }

  if (offset > enterFocusEnd) {
    const t = clamp01((offset - enterFocusEnd) / (enterFadeStart - enterFocusEnd));
    const eased = smoothstep(t);
    const opacity = reducedMotion ? 1 : Math.round((1 - eased * 0.65) * 1000) / 1000;
    const scale = reducedMotion ? 1 : Math.round((1 - eased * 0.025) * 1000) / 1000;
    const driftPx = reducedMotion ? 0 : normalizeZero(Math.round(eased * 12 * 100) / 100);
    return {
      opacity,
      scale,
      driftPx,
      state: 'upcoming',
    };
  }

  return {
    opacity: 1,
    scale: 1,
    driftPx: 0,
    state: 'active',
  };
}

/**
 * Maps instantaneous scroll velocity (px/sec) to a CSS blur radius (px) for
 * depth-of-field motion blur during fast scroll transitions, snapping to 0 at rest.
 */
export function computeMotionBlurPx(
  velocityPxPerSec: number,
  maxBlurPx = 2.5,
  reducedMotion = false
): number {
  if (reducedMotion || !Number.isFinite(velocityPxPerSec) || !Number.isFinite(maxBlurPx)) {
    return 0;
  }
  const speed = Math.abs(velocityPxPerSec);
  const deadZone = 140;
  const ceiling = 2600;
  if (speed <= deadZone || maxBlurPx <= 0) return 0;

  const norm = clamp01((speed - deadZone) / (ceiling - deadZone));
  const eased = smoothstep(norm);
  return normalizeZero(Math.round(eased * maxBlurPx * 100) / 100);
}
