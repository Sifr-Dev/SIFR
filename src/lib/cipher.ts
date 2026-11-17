export const SIFR_BITS: readonly number[] = [
  1, 0, 0, 1, 1, // S (19)
  0, 1, 0, 0, 1, // I (9)
  0, 0, 1, 1, 0, // F (6)
  1, 0, 0, 1, 0, // R (18)
  0, 0, 0, 0,    // 4 null cells
];

export const CELL_COUNT = 24;
export const STEP_DEG = 15; // 360 / 24

export interface DecodedRing {
  shift: number;
  word: string;
  isZeroShift: boolean;
  binaryGroups: string[];
  rotatedBits: number[];
}

export function normalizeShift(shift: number): number {
  const mod = Math.round(shift) % CELL_COUNT;
  return mod < 0 ? mod + CELL_COUNT : mod;
}

export function decodeRingAtShift(shift: number): DecodedRing {
  const s = normalizeShift(shift);
  const rotatedBits = [...SIFR_BITS.slice(s), ...SIFR_BITS.slice(0, s)];
  let letters = '';
  const binaryGroups: string[] = [];

  for (let i = 0; i < 4; i++) {
    const slice = rotatedBits.slice(i * 5, i * 5 + 5);
    const bin = slice.join('');
    binaryGroups.push(bin);
    const value = parseInt(bin, 2);
    letters += value >= 1 && value <= 26 ? String.fromCharCode(64 + value) : '·';
  }
  binaryGroups.push(rotatedBits.slice(20, 24).join(''));

  return {
    shift: s,
    word: `${letters}····`,
    isZeroShift: s === 0,
    binaryGroups,
    rotatedBits,
  };
}

export function angleToShift(angleDeg: number): number {
  // Rotating the ring counter-clockwise by -15 deg advances cell index by +1
  const rawSteps = Math.round(-angleDeg / STEP_DEG);
  return normalizeShift(rawSteps);
}

export function shiftToAngle(shift: number): number {
  return -normalizeShift(shift) * STEP_DEG;
}

export interface AngularSpringState {
  angleDeg: number;
  velocityDeg: number;
  targetAngleDeg: number;
  dragging: boolean;
}

export function stepAngularSpring(
  state: AngularSpringState,
  dtSeconds: number,
  stiffness = 180,
  damping = 22
): AngularSpringState {
  if (state.dragging) {
    return state;
  }
  const dt = Math.min(Math.max(dtSeconds, 0.001), 0.05);
  // Nearest equivalent target angle to avoid 360-wrap flips
  const diff = ((((state.targetAngleDeg - state.angleDeg) % 360) + 540) % 360) - 180;
  const accel = stiffness * diff - damping * state.velocityDeg;
  const nextVel = state.velocityDeg + accel * dt;
  const nextAngle = state.angleDeg + nextVel * dt;

  if (Math.abs(diff) < 0.05 && Math.abs(nextVel) < 0.2) {
    return {
      ...state,
      angleDeg: state.targetAngleDeg,
      velocityDeg: 0,
    };
  }

  return {
    ...state,
    angleDeg: nextAngle,
    velocityDeg: nextVel,
  };
}
