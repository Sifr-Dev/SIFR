import { resolveCanonicalRepoId } from './identity';

export type ActId = 'act-1' | 'act-2' | 'act-3' | 'act-4';

export interface ActDefinition {
  id: ActId;
  roman: string;
  title: string;
  subtitle: string;
  timeframe: string;
  stationIds: string[];
}

export const CANONICAL_ACTS: ActDefinition[] = [
  {
    id: 'act-1',
    roman: 'Part I',
    title: 'First Systems',
    subtitle: 'Starting from layered backends, concurrent stores, bounded TCP framing, and measuring latency.',
    timeframe: 'Web and Sockets',
    stationIds: [
      'mizan',
      'lockstep',
      'redwire',
      'barehttp',
      'wireprobe',
    ],
  },
  {
    id: 'act-2',
    roman: 'Part II',
    title: 'Math to Silicon',
    subtitle: 'Moving from stdlib logistic scoring to native desktop vision models and fused Triton/XLA kernels.',
    timeframe: 'Models and Metal',
    stationIds: ['logitrisk', 'GreenLens', 'subtorch'],
  },
  {
    id: 'act-3',
    roman: 'Part III',
    title: 'Memory and Trust',
    subtitle: 'Dropping beneath abstractions: POSIX sbrk heaps, Linux /proc, FIPS SHA-256, and post-quantum primitives.',
    timeframe: 'Kernel and Crypto',
    stationIds: [
      'freelist',
      'procstatd',
      'tachyon-fetch',
      'sha-zero',
      'verrev',
    ],
  },
  {
    id: 'act-4',
    roman: 'Part IV',
    title: 'Crafted From Zero',
    subtitle: 'Zero-crate Unix utilities, the Zig Wayland/Vulkan Cipher toolkit, CipherDesk apps, and this site.',
    timeframe: 'Tools and Native UI',
    stationIds: [
      'rowscan',
      'glyphmd',
      'huffstream',
      'hunkdiff',
      'Cipher',
      'CipherDesk',
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
  const canonical = resolveCanonicalRepoId(repoId).toLowerCase();
  const found = CANONICAL_ACTS.find((act) =>
    act.stationIds.some((s) => s.toLowerCase() === canonical || s.toLowerCase() === repoId.toLowerCase())
  );
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
  const rawScene = params.get('scene')?.trim();
  if (!rawScene) return state;
  const canonical = resolveCanonicalRepoId(rawScene).toLowerCase();
  const idx = orderedRepos.findIndex(
    (r) => r.id.toLowerCase() === canonical || r.id.toLowerCase() === rawScene.toLowerCase()
  );
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
