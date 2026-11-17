import type { RepoSpec } from '../data/repos';
import { CANONICAL_ACTS, getActForRepoId, type ActId } from './narrative';

export interface PipelineStage {
  step: string;
  label: string;
  detail: string;
  metric: string;
}

export interface RepoLineageSpec {
  buildCommand: string;
  feedsInto: string[];
  stages: PipelineStage[];
}

export const REPO_LINEAGE: Record<string, RepoLineageSpec> = {
  malloc_allocator: {
    buildCommand:
      'git clone https://github.com/mohamedsalahi/malloc_allocator.git && cd malloc_allocator && gcc -O2 -pthread -Wall malloc.c -o alloc && ./alloc',
    feedsInto: ['redis_clone', 'verrev'],
    stages: [
      { step: '01', label: 'pthread_mutex_lock', detail: 'Acquire global heap guard', metric: '~18ns' },
      { step: '02', label: 'find_free_block()', detail: 'First-fit walk of 24B header_t list', metric: 'O(n) slab' },
      { step: '03', label: 'sbrk(total_size)', detail: 'Extend OS break on cache miss', metric: '1 syscall' },
      { step: '04', label: 'coalesce_free()', detail: 'Merge adjacent free neighbors on free()', metric: '1.2% waste' },
    ],
  },
  sysmon_daemon: {
    buildCommand:
      'git clone https://github.com/mohamedsalahi/sysmon_daemon.git && cd sysmon_daemon && go test ./... && go run ./cmd/sysmon',
    feedsInto: ['tachyon-fetch', 'GO_DB'],
    stages: [
      { step: '01', label: '/proc/stat Read', detail: 'Single-open kernel CPU tick deltas', metric: '0 forks' },
      { step: '02', label: '/proc/meminfo', detail: 'Direct MemTotal / MemAvailable parse', metric: '0.38ms' },
      { step: '03', label: 'PID Walker', detail: 'Scan active task stat RSS & state', metric: '1 pass' },
      { step: '04', label: 'Ring Sampler', detail: 'Emit deterministic load frames', metric: '2Hz lock-free' },
    ],
  },
  redis_clone: {
    buildCommand:
      'git clone https://github.com/mohamedsalahi/redis_clone.git && cd redis_clone && go test -race ./... && go run .',
    feedsInto: ['GO_DB', 'task_manager_cli'],
    stages: [
      { step: '01', label: 'TCP :6379 Accept', detail: 'Per-connection goroutine reader', metric: '164k ops/s' },
      { step: '02', label: 'RESP Parser', detail: 'Zero-regex inline protocol scan', metric: '0 alloc' },
      { step: '03', label: 'sync.RWMutex', detail: 'Shared RLock reads / exclusive Lock writes', metric: '4x R-scale' },
      { step: '04', label: 'TTL Evictor', detail: 'Lazy check + background expiry sweep', metric: 'EX bounded' },
    ],
  },
  task_manager_cli: {
    buildCommand:
      'git clone https://github.com/mohamedsalahi/task_manager_cli.git && cd task_manager_cli && go test ./... && go run ./cmd/cli',
    feedsInto: ['GO_DB'],
    stages: [
      { step: '01', label: 'CLI / HTTP Router', detail: 'Unified command + REST surface', metric: 'dual entry' },
      { step: '02', label: 'TaskStore Mutex', detail: 'Thread-safe CRUD + state transitions', metric: '14µs op' },
      { step: '03', label: 'Filter Pipeline', detail: 'Priority, status, and tag indexing', metric: 'O(n) scan' },
      { step: '04', label: 'JSON Snapshot', detail: 'Atomic flush without file lock race', metric: '0 loss' },
    ],
  },
  GO_DB: {
    buildCommand:
      'git clone https://github.com/mohamedsalahi/GO_DB.git && cd GO_DB && go test ./... && go run ./cmd/server',
    feedsInto: ['churn_analytics_engine', 'verrev'],
    stages: [
      { step: '01', label: 'Redis Rate Limiter', detail: 'Sliding window cap 100 req/min', metric: 'RAM hit' },
      { step: '02', label: 'JWT Auth Guard', detail: 'Stateless HMAC claim extraction', metric: '0 DB trip' },
      { step: '03', label: 'Domain Port', detail: 'Hexagonal pure business interface', metric: '0 infra' },
      { step: '04', label: 'sqlc + pgx/v5', detail: 'Compile-time checked SQL bindings', metric: '2.1ms p99' },
    ],
  },
  churn_analytics_engine: {
    buildCommand:
      'git clone https://github.com/mohamedsalahi/churn_analytics_engine.git && cd churn_analytics_engine && python3 -m unittest && python3 inference.py',
    feedsInto: ['GreenLens', 'sifr-ml-systems'],
    stages: [
      { step: '01', label: 'Feature Vector', detail: 'Tenure, spend, support & usage normalize', metric: '0 deps' },
      { step: '02', label: 'Distilled Weights', detail: 'Closed-form dot-product evaluation', metric: '0.04ms' },
      { step: '03', label: 'Risk Threshold', detail: 'Exact 0.35 / 0.65 tier classifier', metric: '950x boost' },
      { step: '04', label: 'Driver Attribution', detail: 'Emit ranked retention levers', metric: 'JSON clean' },
    ],
  },
  GreenLens: {
    buildCommand:
      'git clone https://github.com/mohamedsalahi/GreenLens.git && cd GreenLens && pytest && python3 export_tflite.py',
    feedsInto: ['sifr-ml-systems'],
    stages: [
      { step: '01', label: '224x224 RGB Tile', detail: 'On-device camera crop & normalize', metric: 'offline' },
      { step: '02', label: 'Depthwise Conv', detail: 'INT8 quantized spatial filters', metric: '14ms frame' },
      { step: '03', label: 'Logit Softmax', detail: 'Multi-pathology confidence vector', metric: '24x faster' },
      { step: '04', label: 'Field Diagnosis', detail: 'Instant offline agronomic guidance', metric: '0 cloud' },
    ],
  },
  'tachyon-fetch': {
    buildCommand:
      'git clone https://github.com/mohamedsalahi/tachyon-fetch.git && cd tachyon-fetch && cargo test --release && cargo run --release',
    feedsInto: ['verrev', 'sifr-native'],
    stages: [
      { step: '01', label: 'sysfs / procfs', detail: 'Native Rust file descriptor reads', metric: '0 forks' },
      { step: '02', label: 'Zero-Copy Slice', detail: 'Stack-allocated buffer parsing', metric: '0.25% CPU' },
      { step: '03', label: 'Hardware Probe', detail: 'CPU topology, thermals, RAM & GPU', metric: '500ms tick' },
      { step: '04', label: 'ANSI Compositor', detail: 'Immediate-mode terminal frame diff', metric: '19.2x lean' },
    ],
  },
  'sifr-ml-systems': {
    buildCommand:
      'git clone https://github.com/mohamedsalahi/sifr-ml-systems.git && cd sifr-ml-systems && pytest benchmarks/',
    feedsInto: ['sifr-native'],
    stages: [
      { step: '01', label: 'Q·K^T SRAM Tile', detail: 'Blockwise matrix load into shared L1', metric: 'SRAM bound' },
      { step: '02', label: 'Online Softmax', detail: 'Running max + rescaled exp sum', metric: '0 HBM mat' },
      { step: '03', label: 'Fused V Accum', detail: 'Single kernel epilogue writeback', metric: '1.84ms' },
      { step: '04', label: 'XLA / Triton Parity', detail: 'Verified against PyTorch eager FP16', metric: '2.67x fast' },
    ],
  },
  'sifr-native': {
    buildCommand:
      'git clone https://github.com/mohamedsalahi/sifr-native.git && cd sifr-native && zig build test && zig build run',
    feedsInto: ['verrev', 'SIFR'],
    stages: [
      { step: '01', label: 'wl_display', detail: 'Raw Wayland socket protocol handshake', metric: '0 Electron' },
      { step: '02', label: 'Vulkan Pipeline', detail: 'SPIR-V compute + vertex shader pass', metric: '0.85ms' },
      { step: '03', label: 'Arena Allocator', detail: 'Frame-scoped Zig bump memory reset', metric: '0 GC pause' },
      { step: '04', label: 'DRM Scanout', detail: 'VSync-locked surface present', metric: '11x leaner' },
    ],
  },
  verrev: {
    buildCommand:
      'git clone https://github.com/mohamedsalahi/verrev.git && cd verrev && cargo test --workspace',
    feedsInto: ['SIFR'],
    stages: [
      { step: '01', label: 'ML-KEM-1024', detail: 'Zero-crate lattice key encapsulation', metric: 'PQ NIST L5' },
      { step: '02', label: 'Keccak-f[1600]', detail: 'SHA-3 & XOF sponge derivation', metric: '31/31 pass' },
      { step: '03', label: 'XChaCha20-Poly', detail: 'Authenticated mesh packet cipher', metric: '148µs' },
      { step: '04', label: 'Capability Ring', detail: 'Microkernel isolated surface IPC', metric: '0 trust' },
    ],
  },
  SIFR: {
    buildCommand:
      'git clone https://github.com/mohamedsalahi/SIFR.git && cd SIFR && npm install && npm run build',
    feedsInto: [],
    stages: [
      { step: '01', label: '24-Cell Shutter', detail: 'Alberti cipher calibration detent ring', metric: '15° steps' },
      { step: '02', label: 'Spring Field', detail: 'Semi-implicit symplectic particle solver', metric: '0.42ms' },
      { step: '03', label: 'Live Rest Sync', detail: 'Cached GitHub telemetry + Resend signal', metric: 'SSE / REST' },
      { step: '04', label: 'Idle Sleep Gate', detail: 'Halts RAF loop cleanly at zero energy', metric: '0% idle CPU' },
    ],
  },
};

export function getLineageForRepo(repoId: string): RepoLineageSpec {
  const direct = REPO_LINEAGE[repoId];
  if (direct) return direct;
  const ciKey = Object.keys(REPO_LINEAGE).find((k) => k.toLowerCase() === repoId.toLowerCase());
  if (ciKey) return REPO_LINEAGE[ciKey];
  return {
    buildCommand: `git clone https://github.com/mohamedsalahi/${repoId}.git && cd ${repoId}`,
    feedsInto: [],
    stages: [
      { step: '01', label: 'Repository Fetch', detail: 'Cloned from GitHub source', metric: 'live' },
      { step: '02', label: 'Interface Scan', detail: 'Typed capability inspection', metric: '0 deps' },
      { step: '03', label: 'Isolated Build', detail: 'Deterministic compile path', metric: 'verified' },
      { step: '04', label: 'Exhibition Node', detail: 'Synced into SIFR Atlas', metric: 'active' },
    ],
  };
}

export function getLineageConnections(repoId: string): {
  builtUpon: string[];
  powers: string[];
} {
  const lower = repoId.toLowerCase();
  const current = getLineageForRepo(repoId);
  const builtUpon: string[] = [];

  for (const [candidateId, spec] of Object.entries(REPO_LINEAGE)) {
    if (spec.feedsInto.some((target) => target.toLowerCase() === lower)) {
      builtUpon.push(candidateId);
    }
  }

  return {
    builtUpon,
    powers: current.feedsInto,
  };
}

export type AtlasFilterId = 'all' | ActId;

export function filterAtlasRepos<T extends RepoSpec>(repos: T[], filter: AtlasFilterId): T[] {
  if (filter === 'all') return repos;
  return repos.filter((repo) => getActForRepoId(repo.id).id === filter);
}

export function getActFilterOptions(): Array<{ id: AtlasFilterId; label: string }> {
  return [
    { id: 'all', label: 'All Acts (12)' },
    ...CANONICAL_ACTS.map((act) => ({
      id: act.id,
      label: `${act.roman} · ${act.title}`,
    })),
  ];
}
