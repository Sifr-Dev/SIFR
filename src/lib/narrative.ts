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
    timeframe: 'June – Nov 2026',
    stationIds: ['malloc_allocator', 'sysmon_daemon', 'redis_clone', 'task_manager_cli'],
  },
  {
    id: 'act-2',
    roman: 'Act II',
    title: 'Boundaries & Signal',
    subtitle: 'Isolating domain truth and distilling heavy ML into pure arithmetic.',
    timeframe: 'Summer – Nov 2026',
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
    subtitle: 'Zig Wayland/Vulkan compute, a post-quantum Rust OS, and the SIFR cipher canvas.',
    timeframe: 'Nov 2026 Capstone',
    stationIds: ['sifr-native', 'verrev', 'SIFR'],
  },
];

export const CANONICAL_TRACK_ORDER: string[] = CANONICAL_ACTS.flatMap((act) => act.stationIds);

export function getOrderedTrack<T extends { id: string; updatedAt: string }>(repos: T[]): T[] {
  const byId = new Map(repos.map((r) => [r.id.toLowerCase(), r]));
  const canonical: T[] = [];
  const used = new Set<string>();

  for (const id of CANONICAL_TRACK_ORDER) {
    const found = byId.get(id.toLowerCase());
    if (found) {
      canonical.push(found);
      used.add(found.id.toLowerCase());
    }
  }

  const extras = repos
    .filter((r) => !used.has(r.id.toLowerCase()))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return [...canonical, ...extras];
}

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

export function canAccessStation(
  state: RideState,
  targetIndex: number,
  totalStations: number = CANONICAL_TRACK_ORDER.length
): boolean {
  if (targetIndex < 0 || targetIndex >= totalStations) return false;
  if (state.hasExited) return true;
  return targetIndex <= state.maxUnlockedIndex;
}

export function advanceRide(
  state: RideState,
  totalStations: number = CANONICAL_TRACK_ORDER.length
): RideState {
  const total = Math.max(1, totalStations);
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

export function jumpToUnlockedStation(
  state: RideState,
  index: number,
  totalStations: number = CANONICAL_TRACK_ORDER.length
): RideState {
  if (!canAccessStation(state, index, totalStations)) return state;
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
  const lower = repoId.toLowerCase();
  const found = CANONICAL_ACTS.find((act) => act.stationIds.some((s) => s.toLowerCase() === lower));
  return found ?? CANONICAL_ACTS[CANONICAL_ACTS.length - 1];
}

export function getStationCode(index: number): string {
  return String(index + 1).padStart(2, '0');
}

export function getRideProgressPercent(
  state: RideState,
  totalStations: number = CANONICAL_TRACK_ORDER.length
): number {
  const total = totalStations;
  if (total <= 0) return 0;
  if (state.hasExited) return 100;
  if (!state.hasEntered) return 0;
  return Math.round(((state.maxUnlockedIndex + 1) / total) * 100);
}

export const RIDE_STORAGE_KEY = 'sifr.ride.v1';

export function serializeRideState(state: RideState): string {
  return JSON.stringify({
    hasEntered: Boolean(state.hasEntered),
    currentIndex: state.currentIndex,
    maxUnlockedIndex: state.maxUnlockedIndex,
    hasExited: Boolean(state.hasExited),
  });
}

export function parseRideState(
  rawJson: string | null | undefined,
  totalStations: number = CANONICAL_TRACK_ORDER.length
): RideState | null {
  if (!rawJson) return null;
  try {
    const parsed = JSON.parse(rawJson) as Partial<RideState> | null;
    if (!parsed || typeof parsed !== 'object') return null;
    const maxIdx = Math.max(0, totalStations - 1);
    const currentIndex =
      typeof parsed.currentIndex === 'number' && Number.isFinite(parsed.currentIndex)
        ? Math.min(maxIdx, Math.max(0, Math.floor(parsed.currentIndex)))
        : 0;
    const rawUnlocked =
      typeof parsed.maxUnlockedIndex === 'number' && Number.isFinite(parsed.maxUnlockedIndex)
        ? Math.min(maxIdx, Math.max(currentIndex, Math.floor(parsed.maxUnlockedIndex)))
        : currentIndex;
    return {
      hasEntered: Boolean(parsed.hasEntered),
      currentIndex,
      maxUnlockedIndex: rawUnlocked,
      hasExited: Boolean(parsed.hasExited),
    };
  } catch {
    return null;
  }
}

export function resolveSceneParam<T extends { id: string }>(
  search: string,
  state: RideState,
  orderedRepos: readonly T[]
): RideState {
  if (!search) return state;
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const sceneId = params.get('scene')?.trim().toLowerCase();
  if (!sceneId) return state;
  const idx = orderedRepos.findIndex((r) => r.id.toLowerCase() === sceneId);
  if (idx < 0) return state;
  if (!canAccessStation(state, idx, orderedRepos.length)) return state;
  return {
    ...state,
    hasEntered: true,
    hasExited: false,
    currentIndex: idx,
  };
}

export function buildSceneSharePath(repoId: string): string {
  return `?scene=${encodeURIComponent(repoId)}`;
}

