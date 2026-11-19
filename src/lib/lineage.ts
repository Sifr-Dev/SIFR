import type { RepoCategory, RepoSpec } from '../data/repos';
import { resolveCanonicalRepoId } from './identity';
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
  mizan: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/mizan.git && cd mizan && go test ./... && go run ./cmd/server',
    feedsInto: ['logitrisk', 'verrev'],
    stages: [
      { step: '01', label: 'Redis Rate Limiter', detail: 'Fixed-window cap + Origin check', metric: 'RAM hit' },
      { step: '02', label: 'HS256 Family Auth', detail: 'Purpose-bound claims + HostOnly cookie', metric: 'sid+jti' },
      { step: '03', label: 'Domain Port', detail: 'Entities, DTOs & google/uuid IDs', metric: 'clean port' },
      { step: '04', label: 'sqlc + pgx/v5', detail: 'Compile-time SQL queries', metric: '2.1ms p99' },
    ],
  },
  logitrisk: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/logitrisk.git && cd logitrisk && python3 -m unittest discover -s tests -v && python3 src/inference.py',
    feedsInto: ['GreenLens', 'subtorch'],
    stages: [
      { step: '01', label: 'Feature Vector', detail: 'Read tenure, spend & contract flag', metric: 'stdlib' },
      { step: '02', label: 'Hand-Set Weights', detail: 'Load 300B illustrative JSON coeffs', metric: 'prototype' },
      { step: '03', label: 'Overflow-Safe Sigmoid', detail: 'Classify HIGH, MEDIUM, or LOW', metric: '0 deps' },
      { step: '04', label: 'HTTP JSON POST', detail: 'Emit prediction payload on :8899', metric: '5 tests' },
    ],
  },
  lockstep: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/lockstep.git && cd lockstep && go test -race ./... && go run .',
    feedsInto: ['mizan'],
    stages: [
      { step: '01', label: 'CLI / HTTP Router', detail: 'Terminal and REST handlers', metric: 'dual entry' },
      { step: '02', label: 'internal/task.Manager', detail: 'RWMutex-guarded state store', metric: '14us op' },
      { step: '03', label: 'Value-Copy Reads', detail: 'Isolate caller slices safely', metric: '-race clean' },
      { step: '04', label: 'JSON Dispatch', detail: 'Serve /api/tasks synchronously', metric: '0 deps' },
    ],
  },
  freelist: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/freelist.git && cd freelist && make test',
    feedsInto: ['redwire', 'verrev'],
    stages: [
      { step: '01', label: 'pthread_mutex_lock', detail: 'Lock global heap list', metric: 'C99' },
      { step: '02', label: '24B header_t + Canary', detail: 'Scan free blocks & magic tag', metric: 'first-fit' },
      { step: '03', label: 'sbrk(total_size)', detail: 'Extend OS program break', metric: '1 syscall' },
      { step: '04', label: 'coalesce_free()', detail: 'Merge adjacent free neighbors', metric: '1k stress' },
    ],
  },
  redwire: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/redwire.git && cd redwire && go test -race ./... && go run .',
    feedsInto: ['mizan'],
    stages: [
      { step: '01', label: 'TCP 6379 Accept', detail: '30s idle read deadline', metric: '164k ops/s' },
      { step: '02', label: 'Bounded RESP2 Parse', detail: '<=1024 arity, <=1 MiB bulk', metric: '512B hdr' },
      { step: '03', label: 'sync.RWMutex', detail: 'Parallel reads across GET/EXISTS', metric: '-race clean' },
      { step: '04', label: 'Socket Reply', detail: 'Inline RESP2 status/bulk reply', metric: '0 deps' },
    ],
  },
  procstatd: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/procstatd.git && cd procstatd && go test ./... && go run .',
    feedsInto: ['tachyon-fetch'],
    stages: [
      { step: '01', label: '/proc/stat Read', detail: 'Jiffy deltas + counter_reset', metric: 'warming_up' },
      { step: '02', label: '/proc/meminfo', detail: 'Buffers + Cached + SReclaimable', metric: '0.38ms' },
      { step: '03', label: 'PID Walker', detail: 'Scan numeric /proc/[pid] dirs', metric: '0 forks' },
      { step: '04', label: 'Honest 503 Guard', detail: 'Return 503 when inputs absent', metric: 'no fakes' },
    ],
  },
  verrev: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/verrev.git && cd verrev && cargo test --workspace',
    feedsInto: ['SIFR', 'sha-zero'],
    stages: [
      { step: '01', label: 'Keccak & PQ Crypto', detail: 'ML-KEM-1024, ML-DSA-87, XChaCha20', metric: '27 tests' },
      { step: '02', label: 'Identity & Capability', detail: 'SHA3-256 bindings & ACLs', metric: 'complete' },
      { step: '03', label: 'Local Store & Relay', detail: 'ContentStore & store-forward', metric: '48 pass' },
      { step: '04', label: 'Transport / CRDT / Wasm', detail: 'Explicit prototype shells', metric: 'stubbed' },
    ],
  },
  GreenLens: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/GreenLens.git && cd GreenLens && cargo run --release',
    feedsInto: ['subtorch'],
    stages: [
      { step: '01', label: 'Rust egui OpenGL', detail: 'Open leaf image non-blocking', metric: 'native' },
      { step: '02', label: 'JSON-Lines Pipe', detail: 'Send path to Python worker', metric: 'stdio IPC' },
      { step: '03', label: 'VGG16 Block5 Fine-Tune', detail: '15 classes across 3,095 test imgs', metric: '95.5% acc' },
      { step: '04', label: 'SQLite diseases.db', detail: 'Cited agricultural extension guide', metric: 'offline' },
    ],
  },
  'tachyon-fetch': {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/tachyon-fetch.git && cd tachyon-fetch && cargo test --release && cargo run --release',
    feedsInto: ['Cipher'],
    stages: [
      { step: '01', label: 'sysfs / procfs', detail: 'Direct kernel file reads', metric: '0 forks' },
      { step: '02', label: 'Zero-Copy Scan', detail: 'Single-pass hardware probe', metric: '25 mods' },
      { step: '03', label: 'NVML + DMI', detail: 'GPU, thermal & board collectors', metric: '6 themes' },
      { step: '04', label: 'ratatui HUD', detail: 'Interactive TUI + Kitty protocol', metric: '1.9 MB' },
    ],
  },
  subtorch: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/subtorch.git && cd subtorch && pytest -q',
    feedsInto: ['Cipher'],
    stages: [
      { step: '01', label: 'SRAM Tiling', detail: 'Fused Triton RMSNorm & softmax', metric: 'RTX 4060' },
      { step: '02', label: '4-Backend Timing', detail: 'PyTorch, Inductor, Triton, JAX XLA', metric: '0.147ms' },
      { step: '03', label: 'DLPack Zero-Copy', detail: 'Identical tensor view comparison', metric: 'no copy' },
      { step: '04', label: 'Parity Suite', detail: 'fp32/fp16/bf16 tolerance checks', metric: '36 pass' },
    ],
  },
  Cipher: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/Cipher.git && cd Cipher && zig build test && zig build run',
    feedsInto: ['CipherDesk', 'SIFR'],
    stages: [
      { step: '01', label: 'dlopen Wayland + XML', detail: 'Generated wl_interface + xkb', metric: 'libc only' },
      { step: '02', label: 'SFNT + R8 Atlas', detail: 'TrueType parser + scanline AA', metric: '1024x1024' },
      { step: '03', label: 'Vulkan WSI / wl_shm', detail: 'Swapchain GPU OR software fallback', metric: '0.032ms' },
      { step: '04', label: 'ReleaseFast Verified', detail: 'Zero-initialized runtime bases', metric: '10/10 ok' },
    ],
  },
  SIFR: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/SIFR.git && cd SIFR && npm install && npm test && npm run build',
    feedsInto: ['CipherDesk', 'barehttp'],
    stages: [
      { step: '01', label: '24-Cell Shutter', detail: 'Alberti cipher ring at 15 deg', metric: 'shift 0' },
      { step: '02', label: 'Search & Dossiers', detail: 'Language/category filter + Layer B', metric: '20 repos' },
      { step: '03', label: 'Story Canvas', detail: 'Parallax + RAF motion blur rail', metric: '0% idle' },
      { step: '04', label: 'Express Telemetry', detail: 'Cached GitHub sync & email API', metric: 'REST API' },
    ],
  },
  CipherDesk: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/CipherDesk.git && cd CipherDesk && zig build',
    feedsInto: [],
    stages: [
      { step: '01', label: 'Cipher Path Dep', detail: 'Links libc & runtime dlopen only', metric: '628 KB' },
      { step: '02', label: 'janus Terminal', detail: 'Flagship GPU terminal w/ panes', metric: 'Vulkan WSI' },
      { step: '03', label: 'rex Engine', detail: 'Unix-socket JSON-lines multiplexer', metric: '0600 sock' },
      { step: '04', label: 'nocturne Audio', detail: 'Bit-exact FLAC + LRC/Vorbis lyrics', metric: '6 fixtures' },
    ],
  },
  wireprobe: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/wireprobe.git && cd wireprobe && make && ./wireprobe 127.0.0.1:80 -n 5',
    feedsInto: [],
    stages: [
      { step: '01', label: 'POSIX Socket', detail: 'Open TCP stream directly', metric: 'C++17' },
      { step: '02', label: 'Connect RTT', detail: 'Measure handshake duration', metric: '0.073ms' },
      { step: '03', label: 'HTTP First Byte', detail: 'Time first response byte', metric: '2.021ms' },
      { step: '04', label: 'JSON / Text', detail: 'Emit min, p50, p90, p99, max', metric: '150 loc' },
    ],
  },
  rowscan: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/rowscan.git && cd rowscan && cargo test && cargo build --release',
    feedsInto: [],
    stages: [
      { step: '01', label: 'CSV Stream', detail: 'RFC 4180 linear BufReader scan', metric: '2M rows/s' },
      { step: '02', label: 'Filter Predicate', detail: 'Evaluate column comparisons', metric: '0 crates' },
      { step: '03', label: 'Group-By Fold', detail: 'count, sum, avg, min, max', metric: '0.080s' },
      { step: '04', label: 'Markdown Out', detail: 'Formatted table or CSV emit', metric: '4 tests' },
    ],
  },
  'sha-zero': {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/sha-zero.git && cd sha-zero && g++ -O2 -std=c++17 *.cpp -o sha-zero && ./sha-zero sha256 --selftest',
    feedsInto: [],
    stages: [
      { step: '01', label: '512-Bit Pad', detail: 'Append 1-bit and length tail', metric: 'FIPS 180-4' },
      { step: '02', label: 'Msg Schedule', detail: 'Expand 16 words to 64 words', metric: 'C++17' },
      { step: '03', label: 'Compress', detail: 'Run 64 SHA-256 bitmix rounds', metric: '0 OpenSSL' },
      { step: '04', label: 'Self-Test', detail: 'Verify KAT vs sha256sum', metric: 'PASS' },
    ],
  },
  glyphmd: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/glyphmd.git && cd glyphmd && cargo test && cargo run -- README.md',
    feedsInto: [],
    stages: [
      { step: '01', label: 'UTF-8 Line Scan', detail: 'Read stdin or Markdown file', metric: '1 pass' },
      { step: '02', label: 'Block Match', detail: 'Headings, fences, quotes, lists', metric: '0 regex' },
      { step: '03', label: 'ANSI Wrap', detail: 'UTF-8 width-safe wrapping', metric: '7 tests' },
      { step: '04', label: 'Terminal Emit', detail: 'Style with SIFR #659eff accent', metric: '350 loc' },
    ],
  },
  huffstream: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/huffstream.git && cd huffstream && cargo test',
    feedsInto: [],
    stages: [
      { step: '01', label: 'Gzip Header', detail: 'Verify magic bytes and flags', metric: 'RFC 1952' },
      { step: '02', label: 'Huffman Trees', detail: 'Stored, fixed & dynamic codes', metric: 'RFC 1951' },
      { step: '03', label: '32 KiB Window', detail: 'Copy backward length matches', metric: '0 zlib' },
      { step: '04', label: 'CRC-32 Check', detail: 'Byte-exact parity vs zcat', metric: '21 fixtures' },
    ],
  },
  hunkdiff: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/hunkdiff.git && cd hunkdiff && cargo test',
    feedsInto: [],
    stages: [
      { step: '01', label: 'Line Tokenize', detail: 'Read files or stdin cleanly', metric: 'Rust' },
      { step: '02', label: 'Bounded DP LCS', detail: 'Reject n*m > 64M matrices', metric: 'OOM guard' },
      { step: '03', label: 'Hunk Merge', detail: '3 context lines, >6 gap split', metric: 'diff -u' },
      { step: '04', label: 'Exit Codes', detail: 'Match GNU 0/1/2 exit semantics', metric: '3 fixtures' },
    ],
  },
  barehttp: {
    buildCommand:
      'git clone https://github.com/Sifr-Dev/barehttp.git && cd barehttp && cargo run -- . --port 8080',
    feedsInto: [],
    stages: [
      { step: '01', label: 'TcpListener', detail: 'Thread-per-request GET/HEAD', metric: '405 guard' },
      { step: '02', label: 'Path Guard', detail: 'Canonicalize root, block ..', metric: '403 safe' },
      { step: '03', label: '304 Conditional', detail: 'If-Modified-Since caching', metric: 'HTTP/1.1' },
      { step: '04', label: 'Stream File', detail: 'Serve MIME types with 0 crates', metric: '310 loc' },
    ],
  },
};

export function getLineageForRepo(repoId: string): RepoLineageSpec {
  const canonical = resolveCanonicalRepoId(repoId);
  const direct = REPO_LINEAGE[canonical] ?? REPO_LINEAGE[repoId];
  if (direct) return direct;
  const ciKey = Object.keys(REPO_LINEAGE).find(
    (k) => k.toLowerCase() === canonical.toLowerCase() || k.toLowerCase() === repoId.toLowerCase()
  );
  if (ciKey) return REPO_LINEAGE[ciKey];
  return {
    buildCommand: `git clone https://github.com/Sifr-Dev/${repoId}.git && cd ${repoId}`,
    feedsInto: [],
    stages: [
      { step: '01', label: 'Repository Fetch', detail: 'Cloned from Sifr-Dev', metric: 'live' },
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
  const canonical = resolveCanonicalRepoId(repoId).toLowerCase();
  const current = getLineageForRepo(repoId);
  const builtUpon: string[] = [];

  for (const [candidateId, spec] of Object.entries(REPO_LINEAGE)) {
    if (spec.feedsInto.some((target) => target.toLowerCase() === canonical)) {
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

export interface RepositorySearchFilter {
  query?: string;
  language?: string;
  category?: 'all' | RepoCategory;
}

export function getAvailableLanguages<T extends Pick<RepoSpec, 'primaryLanguage'>>(repos: readonly T[]): string[] {
  const counts = new Map<string, number>();
  for (const r of repos) {
    if (!r.primaryLanguage) continue;
    counts.set(r.primaryLanguage, (counts.get(r.primaryLanguage) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([lang]) => lang);
}

export function filterRepositories<T extends RepoSpec>(
  repos: readonly T[],
  filter: RepositorySearchFilter
): T[] {
  const cleanQuery = (filter.query ?? '').trim().toLowerCase();
  const langFilter = filter.language && filter.language !== 'all' ? filter.language.toLowerCase() : null;
  const catFilter = filter.category && filter.category !== 'all' ? filter.category : null;

  return repos.filter((repo) => {
    if (catFilter && repo.category !== catFilter) return false;
    if (langFilter) {
      const hasPrimary = repo.primaryLanguage.toLowerCase() === langFilter;
      const hasSecondary = Object.keys(repo.languages).some((l) => l.toLowerCase() === langFilter);
      if (!hasPrimary && !hasSecondary) return false;
    }
    if (!cleanQuery) return true;

    const haystack = [
      repo.name,
      repo.displayName,
      repo.subtitle,
      repo.summary,
      repo.primaryLanguage,
      repo.categoryLabel,
      repo.proofMetric,
      ...repo.stack,
      ...repo.deepDive.mechanisms,
      repo.deepDive.problem,
      repo.deepDive.built,
    ]
      .join(' ')
      .toLowerCase();

    return cleanQuery.split(/\s+/).every((token) => haystack.includes(token));
  });
}
