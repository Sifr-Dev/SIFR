export type ActId = 'act-1' | 'act-2' | 'act-3' | 'act-4';

export interface ActDefinition {
  id: ActId;
  roman: string;
  title: string;
  subtitle: string;
  timeframe: string;
  stationIds: string[];
}

/**
 * Canonical 11-station Disneyland-style architectural progression:
 * From bare C heap bytes -> Linux /proc & Go concurrency -> ML/Hexagonal systems ->
 * Native Rust telemetry & GPU kernels -> Zig Wayland/Vulkan & Rust Post-Quantum OS.
 */
export const CANONICAL_ACTS: ActDefinition[] = [
  {
    id: 'act-1',
    roman: 'Act I',
    title: 'Metal & Memory',
    subtitle: 'Earning the machine one byte, one socket, and one lock at a time.',
    timeframe: 'June 2026',
    stationIds: ['malloc_allocator', 'sysmon_daemon', 'redis_clone', 'task_manager_cli'],
  },
  {
    id: 'act-2',
    roman: 'Act II',
    title: 'Boundaries & Signal',
    subtitle: 'Isolating domain truth and distilling heavy ML into pure arithmetic.',
    timeframe: 'Summer – Oct 2026',
    stationIds: ['GO_DB', 'churn_analytics_engine'],
  },
  {
    id: 'act-3',
    roman: 'Act III',
    title: 'Vision, Flight & Silicon',
    subtitle: 'Zero child forks on CPU telemetry; breaking beneath PyTorch into Triton & XLA.',
    timeframe: 'Oct – Nov 2026',
    stationIds: ['GreenLens', 'tachyon-fetch', 'sifr-ml-systems'],
  },
  {
    id: 'act-4',
    roman: 'Act IV',
    title: 'Built From Zero',
    subtitle: 'Hand-marshaled Wayland/Vulkan shaders in Zig and a post-quantum OS in Rust.',
    timeframe: 'Nov 2026 Capstone',
    stationIds: ['sifr-native', 'verrev'],
  },
];

export const CANONICAL_TRACK_ORDER: string[] = CANONICAL_ACTS.flatMap((act) => act.stationIds);

export interface RideState {
  hasEntered: boolean;
  currentIndex: number;
  maxUnlockedIndex: number;
  hasExited: boolean;
}

export function createInitialRideState(): RideState {
  return {
    hasEntered: false,
    currentIndex: 0,
    maxUnlockedIndex: 0,
    hasExited: false,
  };
}

export function enterRide(state: RideState): RideState {
  return {
    ...state,
    hasEntered: true,
    currentIndex: Math.max(0, state.currentIndex),
  };
}

export function canAccessStation(state: RideState, targetIndex: number): boolean {
  if (targetIndex < 0 || targetIndex >= CANONICAL_TRACK_ORDER.length) return false;
  if (state.hasExited) return true;
  return targetIndex <= state.maxUnlockedIndex;
}

export function advanceRide(state: RideState): RideState {
  const total = CANONICAL_TRACK_ORDER.length;
  if (!state.hasEntered) {
    return {
      hasEntered: true,
      currentIndex: 0,
      maxUnlockedIndex: Math.max(0, state.maxUnlockedIndex),
      hasExited: state.hasExited,
    };
  }

  if (state.currentIndex >= total - 1) {
    return {
      hasEntered: true,
      currentIndex: total - 1,
      maxUnlockedIndex: total - 1,
      hasExited: true,
    };
  }

  const nextIndex = state.currentIndex + 1;
  return {
    hasEntered: true,
    currentIndex: nextIndex,
    maxUnlockedIndex: Math.max(state.maxUnlockedIndex, nextIndex),
    hasExited: state.hasExited,
  };
}

export function stepBackRide(state: RideState): RideState {
  if (state.currentIndex <= 0) return state;
  return {
    ...state,
    currentIndex: state.currentIndex - 1,
  };
}

export function jumpToUnlockedStation(state: RideState, index: number): RideState {
  if (!canAccessStation(state, index)) return state;
  return {
    ...state,
    hasEntered: true,
    currentIndex: index,
  };
}

export function restartRide(): RideState {
  return createInitialRideState();
}

export function getActForRepoId(repoId: string): ActDefinition {
  const found = CANONICAL_ACTS.find((act) => act.stationIds.includes(repoId));
  return found ?? CANONICAL_ACTS[0];
}

export function getStationCode(index: number): string {
  return String(index + 1).padStart(2, '0');
}

export function getRideProgressPercent(state: RideState): number {
  const total = CANONICAL_TRACK_ORDER.length;
  if (total === 0) return 0;
  if (state.hasExited) return 100;
  if (!state.hasEntered) return 0;
  return Math.round(((state.maxUnlockedIndex + 1) / total) * 100);
}
