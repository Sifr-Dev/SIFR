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
 * Conceptual story progression across all 20 repositories:
 * moving from application architecture and raw sockets, through ML math and GPU kernels,
 * down into heap memory, kernel telemetry, and cryptography, and finally building zero-dependency tools and native UI.
 */
export const CANONICAL_ACTS: ActDefinition[] = [
  {
    id: 'act-1',
    roman: 'Part I',
    title: 'First Systems',
    subtitle: 'Starting from layered backends, concurrent stores, raw TCP sockets, and measuring latency.',
    timeframe: 'Web and Sockets',
    stationIds: [
      'GO_DB',
      'task_manager_cli',
      'redis_clone',
      'sifr-serve',
      'sifr-probe',
    ],
  },
  {
    id: 'act-2',
    roman: 'Part II',
    title: 'Math to Silicon',
    subtitle: 'Moving from 300-byte Python inference to desktop vision models and custom GPU kernels.',
    timeframe: 'Models and Metal',
    stationIds: ['churn_analytics_engine', 'GreenLens', 'sifr-ml-systems'],
  },
  {
    id: 'act-3',
    roman: 'Part III',
    title: 'Memory and Trust',
    subtitle: 'Looking underneath abstractions: heap blocks, Linux /proc, SHA-256, and capability security.',
    timeframe: 'Kernel and Crypto',
    stationIds: [
      'malloc_allocator',
      'sysmon_daemon',
      'tachyon-fetch',
      'sifr-crypt',
      'verrev',
    ],
  },
  {
    id: 'act-4',
    roman: 'Part IV',
    title: 'Crafted From Zero',
    subtitle: 'Zero-dependency Unix tools, a Zig Wayland/Vulkan UI toolkit, native apps, and this canvas.',
    timeframe: 'Tools and Native UI',
    stationIds: [
      'sifr-query',
      'sifr-md',
      'sifr-inflate',
      'sifr-diff',
      'sifr-native',
      'sifr-apps',
      'SIFR',
    ],
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

export const RIDE_STORAGE_KEY = 'sifr.ride.v2';

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
