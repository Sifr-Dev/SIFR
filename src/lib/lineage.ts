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
  GO_DB: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/mizan.git && cd GO_DB && go test ./... && go run ./cmd/server',
    feedsInto: ['churn_analytics_engine', 'verrev'],
    stages: [
      { step: '01', label: 'Redis Rate Limiter', detail: 'Sliding window cap per IP', metric: 'RAM hit' },
      { step: '02', label: 'JWT Auth Guard', detail: 'Stateless claim verification', metric: '0 DB trip' },
      { step: '03', label: 'Domain Port', detail: 'Isolated business rules', metric: '0 infra' },
      { step: '04', label: 'sqlc + pgx/v5', detail: 'Compile-time SQL queries', metric: '2.1ms p99' },
    ],
  },
  churn_analytics_engine: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/logitrisk.git && cd churn_analytics_engine && python3 -m unittest && python3 inference.py',
    feedsInto: ['GreenLens', 'sifr-ml-systems'],
    stages: [
      { step: '01', label: 'Feature Vector', detail: 'Normalize account tenure and spend', metric: '0 deps' },
      { step: '02', label: 'Closed-Form Weights', detail: 'Evaluate serialized 300B JSON', metric: '0.04ms' },
      { step: '03', label: 'Risk Threshold', detail: 'Classify HIGH, MEDIUM, or LOW', metric: '950x boost' },
      { step: '04', label: 'Output', detail: 'Return plain prediction payload', metric: 'JSON clean' },
    ],
  },
  task_manager_cli: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/lockstep.git && cd task_manager_cli && go test ./... && go run ./cmd/cli',
    feedsInto: ['GO_DB'],
    stages: [
      { step: '01', label: 'CLI / HTTP Router', detail: 'Terminal and REST handlers', metric: 'dual entry' },
      { step: '02', label: 'TaskStore Mutex', detail: 'Thread-safe CRUD mutations', metric: '14us op' },
      { step: '03', label: 'Query Filter', detail: 'Filter by priority and status', metric: 'O(n) scan' },
      { step: '04', label: 'Snapshot', detail: 'Flush JSON store safely', metric: '0 race' },
    ],
  },
  malloc_allocator: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/freelist.git && cd malloc_allocator && gcc -O2 -pthread -Wall malloc.c -o alloc && ./alloc',
    feedsInto: ['redis_clone', 'verrev'],
    stages: [
      { step: '01', label: 'pthread_mutex_lock', detail: 'Lock global heap list', metric: '~18ns' },
      { step: '02', label: 'find_free_block()', detail: 'Scan 24B header_t nodes', metric: 'first-fit' },
      { step: '03', label: 'sbrk(total_size)', detail: 'Extend OS program break', metric: '1 syscall' },
      { step: '04', label: 'coalesce_free()', detail: 'Merge adjacent free neighbors', metric: '1.2% waste' },
    ],
  },
  redis_clone: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/redwire.git && cd redis_clone && go test -race ./... && go run .',
    feedsInto: ['GO_DB'],
    stages: [
      { step: '01', label: 'TCP 6379 Accept', detail: 'Per-client goroutine loop', metric: '164k ops/s' },
      { step: '02', label: 'Command Parse', detail: 'Match PING, SET, GET, DEL', metric: '0 regex' },
      { step: '03', label: 'sync.RWMutex', detail: 'Parallel reads, locked writes', metric: '4x R-scale' },
      { step: '04', label: 'Socket Reply', detail: 'Write plain response frame', metric: 'inline' },
    ],
  },
  sysmon_daemon: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/procstatd.git && cd sysmon_daemon && go test ./... && go run .',
    feedsInto: ['tachyon-fetch'],
    stages: [
      { step: '01', label: '/proc/stat Read', detail: 'Parse kernel CPU tick deltas', metric: '0 forks' },
      { step: '02', label: '/proc/meminfo', detail: 'Compute physical page usage', metric: '0.38ms' },
      { step: '03', label: 'PID Walker', detail: 'Scan active numeric PID dirs', metric: '1 pass' },
      { step: '04', label: 'HTTP /api/sysmon', detail: 'Serve JSON telemetry payload', metric: 'std http' },
    ],
  },
  verrev: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/verrev.git && cd verrev && cargo test --workspace',
    feedsInto: ['SIFR', 'sifr-crypt'],
    stages: [
      { step: '01', label: 'ML-KEM-1024', detail: 'Crate-free lattice handshake', metric: 'NIST L5' },
      { step: '02', label: 'Keccak-f[1600]', detail: 'SHA-3 identity hashing', metric: 'KAT pass' },
      { step: '03', label: 'XChaCha20-Poly', detail: 'Authenticated packet sealing', metric: '148us' },
      { step: '04', label: 'Capabilities', detail: 'Fine-grained capability checks', metric: 'prototype' },
    ],
  },
  GreenLens: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/GreenLens.git && cd GreenLens && cargo run --release',
    feedsInto: ['sifr-ml-systems'],
    stages: [
      { step: '01', label: 'Rust egui Window', detail: 'Open leaf photo locally', metric: 'native' },
      { step: '02', label: 'JSON-Lines Pipe', detail: 'Send path to Python worker', metric: 'stdio IPC' },
      { step: '03', label: 'VGG16 Inference', detail: '15-class leaf classification', metric: '95.54% acc' },
      { step: '04', label: 'SQLite Lookup', detail: 'Display cited field treatment', metric: 'offline' },
    ],
  },
  'tachyon-fetch': {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/tachyon-fetch.git && cd tachyon-fetch && cargo test --release && cargo run --release',
    feedsInto: ['sifr-native'],
    stages: [
      { step: '01', label: 'sysfs / procfs', detail: 'Direct kernel file reads', metric: '0 forks' },
      { step: '02', label: 'Zero-Copy Scan', detail: 'Parse hardware tables once', metric: '0.25% CPU' },
      { step: '03', label: 'NVML + DMI', detail: 'Collect GPU and board stats', metric: '25 mods' },
      { step: '04', label: 'ratatui HUD', detail: 'Render terminal or TUI config', metric: '1.9 MB' },
    ],
  },
  'sifr-ml-systems': {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/subtorch.git && cd sifr-ml-systems && pytest',
    feedsInto: ['sifr-native'],
    stages: [
      { step: '01', label: 'SRAM Tiling', detail: 'Keep Q*K^T inside GPU SRAM', metric: 'tiled' },
      { step: '02', label: 'Triton Kernel', detail: 'Fused RMSNorm and causal SDPA', metric: '0.617ms' },
      { step: '03', label: 'JAX XLA Path', detail: 'Compiled graph verification', metric: '0.147ms' },
      { step: '04', label: 'Parity Suite', detail: '36 fp32/fp16/bf16 checks', metric: '36 pass' },
    ],
  },
  'sifr-native': {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/Cipher.git && cd sifr-native && zig build test && zig build run',
    feedsInto: ['sifr-apps', 'SIFR'],
    stages: [
      { step: '01', label: 'Wayland Wire', detail: 'Handwritten Unix socket protocol', metric: '0 C glue' },
      { step: '02', label: 'Vulkan Pipeline', detail: 'GLSL compute and swapchain', metric: '0.85ms' },
      { step: '03', label: 'HiDPI Scaling', detail: 'Fractional display scaling', metric: 'native' },
      { step: '04', label: 'UI Layout', detail: 'Custom flexbox and font atlas', metric: '505KB Zig' },
    ],
  },
  SIFR: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/SIFR.git && cd SIFR && npm install && npm run build',
    feedsInto: ['sifr-apps', 'sifr-serve'],
    stages: [
      { step: '01', label: '24-Cell Shutter', detail: 'Alberti cipher ring at 15 deg', metric: 'shift 0' },
      { step: '02', label: 'Moving Canvas', detail: 'Scroll right across 20 chapters', metric: '0.42ms' },
      { step: '03', label: 'GitHub + Resend', detail: 'Live sync and email dispatch', metric: 'REST API' },
      { step: '04', label: 'Idle Sleep Gate', detail: 'Pause canvas loop at rest', metric: '0% idle' },
    ],
  },
  'sifr-apps': {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/CipherDesk.git && cd sifr-apps && zig build',
    feedsInto: [],
    stages: [
      { step: '01', label: 'Cipher Path Dep', detail: 'Consume sifr-native directly', metric: 'libc only' },
      { step: '02', label: 'rex Multiplexer', detail: 'Unix socket mux server and CLI', metric: '0600 sock' },
      { step: '03', label: 'cipherterm', detail: 'GPU terminal with live paned HUD', metric: 'Vulkan' },
      { step: '04', label: 'nocturne', detail: 'Offline FLAC playback engine', metric: 'lossless' },
    ],
  },
  'sifr-probe': {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/wireprobe.git && cd sifr-probe && make && ./sifrprobe 127.0.0.1:80 -n 5',
    feedsInto: [],
    stages: [
      { step: '01', label: 'POSIX Socket', detail: 'Open non-blocking TCP stream', metric: 'C++17' },
      { step: '02', label: 'Connect RTT', detail: 'Measure handshake duration', metric: 'p50/p99' },
      { step: '03', label: 'HTTP First Byte', detail: 'Time first response byte', metric: '0 deps' },
      { step: '04', label: 'JSON / Text', detail: 'Emit min, p50, p90, p99, max', metric: '150 loc' },
    ],
  },
  'sifr-query': {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/rowscan.git && cd sifr-query && cargo build --release',
    feedsInto: [],
    stages: [
      { step: '01', label: 'CSV Stream', detail: 'Read rows from file or stdin', metric: 'O(1) mem' },
      { step: '02', label: 'Filter Predicate', detail: 'Evaluate column comparisons', metric: '0 crates' },
      { step: '03', label: 'Group-By Fold', detail: 'Compute count, sum, avg, min, max', metric: '350 loc' },
      { step: '04', label: 'Table Output', detail: 'Write plain CSV or Markdown', metric: 'fast' },
    ],
  },
  'sifr-crypt': {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/sha-zero.git && cd sifr-crypt && g++ -O2 -std=c++17 *.cpp -o sifr-crypt && ./sifr-crypt sha256 --selftest',
    feedsInto: [],
    stages: [
      { step: '01', label: '512-Bit Pad', detail: 'Append 1-bit and length tail', metric: 'FIPS 180-4' },
      { step: '02', label: 'Msg Schedule', detail: 'Expand 16 words to 64 words', metric: 'C++17' },
      { step: '03', label: 'Compress', detail: 'Run 64 SHA-256 bitmix rounds', metric: '0 OpenSSL' },
      { step: '04', label: 'Self-Test', detail: 'Verify built-in FIPS vectors', metric: 'PASS' },
    ],
  },
  'sifr-md': {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/glyphmd.git && cd sifr-md && cargo run -- README.md',
    feedsInto: [],
    stages: [
      { step: '01', label: 'UTF-8 Line Scan', detail: 'Read stdin or Markdown file', metric: '1 pass' },
      { step: '02', label: 'Block Match', detail: 'Parse headings, fences, quotes', metric: '0 regex' },
      { step: '03', label: 'Inline Wrap', detail: 'Bold, italic, links, soft wrap', metric: '0 crates' },
      { step: '04', label: 'ANSI Output', detail: 'Emit clean terminal escapes', metric: '350 loc' },
    ],
  },
  'sifr-inflate': {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/huffstream.git && cd sifr-inflate && cargo test',
    feedsInto: [],
    stages: [
      { step: '01', label: 'Gzip Header', detail: 'Verify magic bytes and flags', metric: 'RFC 1952' },
      { step: '02', label: 'Huffman Trees', detail: 'Decode fixed and dynamic codes', metric: 'RFC 1951' },
      { step: '03', label: '32 KiB Window', detail: 'Copy backward length matches', metric: '0 zlib' },
      { step: '04', label: 'CRC-32 Check', detail: 'Match checksum and ISIZE', metric: '21/21 pass' },
    ],
  },
  'sifr-diff': {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/hunkdiff.git && cd sifr-diff && cargo test',
    feedsInto: [],
    stages: [
      { step: '01', label: 'Line Tokenize', detail: 'Read both files or stdin', metric: 'Rust' },
      { step: '02', label: 'LCS Matrix', detail: 'Dynamic programming edit table', metric: 'exact' },
      { step: '03', label: 'Hunk Merge', detail: 'Split gaps >6 lines, 3 context', metric: 'diff -u' },
      { step: '04', label: 'Exit Semantics', detail: 'Return 0, 1, or 2 cleanly', metric: '0 crates' },
    ],
  },
  'sifr-serve': {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/barehttp.git && cd sifr-serve && cargo run -- . --port 8080',
    feedsInto: [],
    stages: [
      { step: '01', label: 'TcpListener', detail: 'Spawn worker thread per req', metric: 'HTTP/1.1' },
      { step: '02', label: 'Path Guard', detail: 'Canonicalize root, block ..', metric: '403 safe' },
      { step: '03', label: 'MIME + Range', detail: 'Resolve extension and headers', metric: '0 async' },
      { step: '04', label: 'Stream File', detail: 'Serve GET or HEAD response', metric: '0 crates' },
    ],
  },
};

export function getLineageForRepo(repoId: string): RepoLineageSpec {
  const direct = REPO_LINEAGE[repoId];
  if (direct) return direct;
  const ciKey = Object.keys(REPO_LINEAGE).find((k) => k.toLowerCase() === repoId.toLowerCase());
  if (ciKey) return REPO_LINEAGE[ciKey];
  return {
    buildCommand: `git clone https://github.com/Sifr-Dev/${repoId}.git && cd ${repoId}`,
    feedsInto: [],
    stages: [
      { step: '01', label: 'Repository Fetch', detail: 'Cloned from GitHub', metric: 'live' },
      { step: '02', label: 'Interface Scan', detail: 'Inspect primary source', metric: '0 deps' },
      { step: '03', label: 'Build', detail: 'Compile locally', metric: 'clean' },
      { step: '04', label: 'Verify', detail: 'Run test suite', metric: 'ready' },
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
    { id: 'all', label: 'All (20)' },
    ...CANONICAL_ACTS.map((act) => ({
      id: act.id,
      label: `${act.roman} · ${act.title}`,
    })),
  ];
}
