import { resolveCanonicalRepoId } from '../lib/identity';

export interface RepoStorySpec {
  repoId: string;
  stationNumber: string;
  eraLabel: string;
  chapterTitle: string;
  beatLine: string;
  tagline: string;
  openingHook: string;
  engineeringNarrative: string;
  turningPoint: string;
  bridgeToNext: string;
  readmeFilename: string;
  readmeSections: {
    heading: string;
    body: string;
  }[];
  readmeMarkdown: string;
}

export const REPO_STORIES: Record<string, RepoStorySpec> = {
  mizan: {
    repoId: 'mizan',
    stationNumber: '01',
    eraLabel: 'Layered Backend',
    chapterTitle: 'Clean Architecture API & Token Security',
    beatLine: 'Built a strict 4-layer Go backend, sqlc queries, fixed-window Redis limiter, and React client.',
    tagline: 'Part I · Go, PostgreSQL, Redis, TypeScript',
    openingHook:
      'A full-stack backend and React client built with explicit boundaries between HTTP delivery, workflows, domain rules, and sqlc persistence.',
    engineeringNarrative:
      'Uses Go chi routing, sqlc compile-time SQL generation on pgx/v5, Redis sessions with atomic JTI family rotation, fixed-window rate limits, and host-only HttpOnly refresh cookies coordinated across tabs via Web Locks.',
    turningPoint:
      'Explicit cmd/admin provisioning and purpose-bound HS256 JWTs prevent implicit admin escalation and cross-token misuse.',
    bridgeToNext: 'Next: unifying local CLI and HTTP state around a single concurrency-safe store.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Architecture',
        body: 'Delivery (chi, HS256 JWT, fixed-window Redis limiter) -> UseCase -> Domain (entities, DTOs, google/uuid) -> Repository (sqlc + pgx/v5).',
      },
      {
        heading: 'Security Contract',
        body: 'Explicit cmd/admin creation, purpose-bound HS256 tokens (token_use, sid, jti), host-only HttpOnly cookies, and BroadcastChannel / Web Locks refresh coordination.',
      },
    ],
    readmeMarkdown: `# mizan: Layered Go REST API & React Client

A layered Go REST API (\`chi\` + PostgreSQL/\`sqlc\` + Redis sessions & fixed-window rate limits) paired with a React TypeScript client.

## Architecture
- **Delivery**: \`go-chi\` router, purpose-bound HS256 JWT checks, Origin allowlist, fixed-window Redis limiter
- **UseCase**: application workflows and resource ownership rules
- **Domain**: entities, DTOs, and repository/service interfaces (\`google/uuid\`)
- **Repository**: \`sqlc\` compile-time SQL over \`pgx/v5\`
`,
  },

  lockstep: {
    repoId: 'lockstep',
    stationNumber: '02',
    eraLabel: 'Shared Store',
    chapterTitle: 'Concurrency-Safe CLI & HTTP Store',
    beatLine: 'One Go internal/task.Manager returning value copies under RWMutex across CLI and HTTP.',
    tagline: 'Part I · Go, RWMutex, HTTP JSON',
    openingHook:
      'A Go task manager unifying local CLI commands with an in-memory HTTP JSON API backed by a single manager.',
    engineeringNarrative:
      'Both terminal commands and HTTP handlers mutate internal/task.Manager under sync.RWMutex while returning value copies so readers cannot mutate internal slices.',
    turningPoint:
      'Keeping state inside one mutex-safe stdlib manager eliminated duplicate storage paths and race hazards.',
    bridgeToNext: 'From in-process mutex locks to serving bounded TCP wire frames directly.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Endpoints',
        body: 'GET /api/tasks, POST /api/tasks, PATCH /api/tasks?id=N sharing internal/task.Manager.',
      },
    ],
    readmeMarkdown: `# lockstep

Concurrency-safe Go task manager sharing \`internal/task.Manager\` (\`sync.RWMutex\`, value-copy reads) across CLI and HTTP.
`,
  },

  redwire: {
    repoId: 'redwire',
    stationNumber: '03',
    eraLabel: 'Raw TCP & RESP2',
    chapterTitle: 'Bounded RESP2 Key-Value Store',
    beatLine: 'A TCP RESP2 server on port 6379 handling concurrent clients with strict size bounds and RWMutex.',
    tagline: 'Part I · Go, TCP Sockets, RESP2, RWMutex',
    openingHook:
      'An in-memory TCP key-value engine in Go speaking a bounded subset of the RESP2 wire protocol.',
    engineeringNarrative:
      'Supports PING, SET, GET, DEL, EXISTS, and QUIT over port 6379 with RWMutex reader parallelism, 1024-item arity bounds, 1 MiB bulk limits, and 30-second socket read deadlines.',
    turningPoint:
      'Enforcing hard RESP2 frame caps before allocation kept malformed packets from exhausting memory.',
    bridgeToNext: 'Once raw TCP framing worked cleanly, the next step was full HTTP/1.1 static serving without frameworks.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Wire Bounds',
        body: 'Supports PING, SET, GET, DEL, EXISTS, QUIT; max 1024 arity, 1 MiB bulk limit, 512 B header lines, 30s read deadline.',
      },
    ],
    readmeMarkdown: `# redwire

Bounded RESP2 in-memory key-value server in pure Go on TCP port 6379 with \`sync.RWMutex\` (\`-race\` clean).
`,
  },

  barehttp: {
    repoId: 'barehttp',
    stationNumber: '04',
    eraLabel: 'HTTP/1.1 Server',
    chapterTitle: 'Static HTTP/1.1 Server in Pure Rust',
    beatLine: 'A thread-per-connection HTTP/1.1 static server built over TcpListener with 304 caching and traversal guards.',
    tagline: 'Part I · Rust, HTTP/1.1, TcpListener',
    openingHook:
      'Built to serve static assets safely over std::net::TcpListener with canonicalized path guards and conditional headers.',
    engineeringNarrative:
      'Handles GET and HEAD requests (returning 405 on unsupported verbs), MIME mapping, 304 If-Modified-Since caching, and strict root containment checks.',
    turningPoint:
      'Replacing external web frameworks with std::net::TcpListener kept parsing, caching, and traversal safety explicit.',
    bridgeToNext: 'After serving HTTP from scratch, the next step was measuring socket handshake and TTFB latency directly.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Capabilities',
        body: 'GET/HEAD, 405 enforcement, 304 If-Modified-Since, MIME lookup, canonicalized root traversal guard.',
      },
    ],
    readmeMarkdown: `# barehttp

Zero-dependency static HTTP/1.1 file server in Rust with MIME detection, \`304 If-Modified-Since\`, and canonical path guards.
`,
  },

  wireprobe: {
    repoId: 'wireprobe',
    stationNumber: '05',
    eraLabel: 'Socket Timing',
    chapterTitle: 'Zero-Dep TCP & HTTP Latency Prober',
    beatLine: 'Measured TCP connect RTT and HTTP first-byte p50, p90, and p99 percentiles in ~150 lines of C++17.',
    tagline: 'Part I · C++17, POSIX Sockets',
    openingHook:
      'A tiny C++17 latency prober linking nothing beyond libc over raw POSIX sockets.',
    engineeringNarrative:
      'Separates TCP connect handshake latency from HTTP first-byte timing and reports min, p50, p90, p99, max, and mean as text or JSON.',
    turningPoint:
      'Measured p50 0.073 ms TCP connect and p50 2.021 ms first-byte in ~150 lines without curl or Boost.',
    bridgeToNext: 'With networking grounded, exploration shifted to stripped-down inference math and vision models.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Usage',
        body: 'wireprobe 127.0.0.1:8899 -n 20 --http --json',
      },
    ],
    readmeMarkdown: `# wireprobe

Zero-dependency TCP/HTTP latency prober in ~150 lines of C++17 with p50/p90/p99 percentiles and JSON output.
`,
  },

  logitrisk: {
    repoId: 'logitrisk',
    stationNumber: '06',
    eraLabel: 'Logistic Scorer',
    chapterTitle: 'Zero-Dep Churn Scoring Prototype',
    beatLine: 'Stripped heavy ML dependencies down to a stdlib Python logistic scorer using hand-set JSON weights.',
    tagline: 'Part II · Python 3 Stdlib, Prototype',
    openingHook:
      'A serverless-shaped Python logistic scorer running pure stdlib arithmetic on ~300-byte JSON coefficients.',
    engineeringNarrative:
      'Provides CLI and stdlib HTTP POST scoring over four customer features into HIGH/MEDIUM/LOW tiers using illustrative hand-set weights rather than a bundled training dataset.',
    turningPoint:
      'Explicitly scopes model_weights.json as illustrative coefficients so downstream teams know where real dataset training plugs in.',
    bridgeToNext: 'From lightweight linear scoring to running a fine-tuned VGG16 model inside a native Rust GUI.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Honest Scope',
        body: 'Logistic-scoring prototype (stdlib only, 5 unittest checks). Shipped model_weights.json contains illustrative hand-set coefficients, not a trained benchmark.',
      },
    ],
    readmeMarkdown: `# logitrisk

Zero-dependency Python stdlib logistic-scoring prototype (illustrative hand-set weights in \`model_weights.json\`, 5 \`unittest\` checks).

## Tiers
- \`> 0.65\`: HIGH risk
- \`> 0.35\`: MEDIUM risk
- \`<= 0.35\`: LOW risk
`,
  },

  GreenLens: {
    repoId: 'GreenLens',
    stationNumber: '07',
    eraLabel: 'Desktop Vision',
    chapterTitle: 'Offline Crop Disease Classifier in Rust & VGG16',
    beatLine: 'Paired a Rust egui OpenGL GUI with a local TensorFlow VGG16 worker reaching 95.5% test accuracy offline.',
    tagline: 'Part II · Rust egui, VGG16, SQLite',
    openingHook:
      'A native OpenGL desktop application classifying 15 Pepper, Potato, and Tomato leaf classes offline with SQLite field guidance.',
    engineeringNarrative:
      'A non-blocking Rust egui frontend talks via stdin/stdout JSON-lines to a persistent Python VGG16 worker trained on 20,624 deduplicated PlantVillage images (95.5% accuracy, 0.95 macro F1 on 3,095 held-out test images).',
    turningPoint:
      'Documents both cited agricultural treatment guidance in diseases.db and the controlled-lab caveat of PlantVillage imagery.',
    bridgeToNext: 'Running VGG16 locally led directly to studying custom GPU kernels beneath PyTorch and JAX.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Pipeline & Caveat',
        body: 'Rust egui opens images -> JSON-lines stdio IPC -> local VGG16 worker -> SQLite guidance. 95.5% test accuracy on held-out controlled lab images.',
      },
    ],
    readmeMarkdown: `# GreenLens

Native desktop plant disease identifier combining a Rust \`egui\` interface with a local TensorFlow VGG16 worker and cited SQLite guidance.

- **Accuracy**: 95.5% on 3,095 test images (macro F1 0.95)
- **Caveat**: Evaluated on controlled PlantVillage lab photos rather than unconstrained field conditions
`,
  },

  subtorch: {
    repoId: 'subtorch',
    stationNumber: '08',
    eraLabel: 'GPU Kernels',
    chapterTitle: 'Triton & JAX GPU Kernels with Parity Evidence',
    beatLine: 'Benchmarked fused RMSNorm and FlashAttention SDPA across PyTorch, Triton, Inductor, and JAX XLA with 36 parity tests.',
    tagline: 'Part II · Triton, JAX XLA, PyTorch CUDA',
    openingHook:
      'Hardware-aware ML systems engineering measuring fused RMSNorm and SDPA kernels head-to-head on RTX 4060.',
    engineeringNarrative:
      'Compares PyTorch eager, torch.compile Inductor, custom Triton fused kernels, and zero-copy DLPack JAX XLA kernels across 10-warmup CUDA-event medians gated behind 36 fp32/fp16/bf16 tolerance tests.',
    turningPoint:
      'Publishes the unspun result: XLA wins RMSNorm (0.147 ms vs Triton 0.311 ms), causal SDPA beats Triton (0.372 ms vs 0.632 ms), while Triton edges out SDPA on bf16 non-causal (0.617 ms).',
    bridgeToNext: 'Dropping below ML runtimes opened the deeper question: how does software own heap memory, procfs, and trust?',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Verified Methodology',
        body: 'RTX 4060 Laptop (compute 8.9), 10 warmup + 50/100 timed CUDA event iterations, zero-copy DLPack, and 36 pytest parity checks.',
      },
    ],
    readmeMarkdown: `# subtorch

Hardware-aware ML kernels across PyTorch, custom Triton, Inductor, and JAX XLA with reproducible commands and 36 parity checks.
`,
  },

  freelist: {
    repoId: 'freelist',
    stationNumber: '09',
    eraLabel: 'Heap Memory',
    chapterTitle: 'Thread-Safe Free-List Allocator in C99',
    beatLine: 'Built my_malloc, my_free, my_calloc, and my_realloc over POSIX sbrk with 24B headers, magic canaries, and coalescing.',
    tagline: 'Part III · C99, POSIX sbrk, pthread_mutex',
    openingHook:
      'Implemented dynamic heap allocation directly over POSIX sbrk() in C instead of treating libc malloc as a black box.',
    engineeringNarrative:
      'Tracks allocations via 24-byte header_t nodes with magic canary checks, merges neighboring free blocks on my_free, guards overflows on calloc, and serializes cleanly with pthread_mutex_t.',
    turningPoint:
      'Passed 7 unit tests and a 1000-block mixed allocation stress suite without fragmentation leaks.',
    bridgeToNext: 'After allocating heap bytes directly, the next step was reading Linux procfs without child forks.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Block Layout',
        body: '24B header_t (size, is_free, magic canary, next pointer) over POSIX sbrk() with coalescing.',
      },
    ],
    readmeMarkdown: `# freelist

Thread-safe free-list allocator in C99 over POSIX \`sbrk()\` with magic canary verification and adjacent block coalescing.
`,
  },

  procstatd: {
    repoId: 'procstatd',
    stationNumber: '10',
    eraLabel: 'Procfs Daemon',
    chapterTitle: 'Direct Linux /proc Telemetry in Go',
    beatLine: 'Parsed /proc/stat, /proc/meminfo, and /proc/[pid] directly in Go with explicit 503 failure states.',
    tagline: 'Part III · Go, Linux /proc, HTTP',
    openingHook:
      'Reads Linux procfs directly inside one persistent Go daemon without spawning ps or top.',
    engineeringNarrative:
      'Computes CPU jiffy deltas (emitting warming_up on boot sample and handling counter_reset), accounts Buffers + Cached + SReclaimable memory, and returns HTTP 503 if kernel inputs are absent.',
    turningPoint:
      'Refusing to emit fabricated zero metrics made health probes honest across container environments.',
    bridgeToNext: 'That direct procfs approach grew into a full single-pass Rust hardware fetch engine.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Sources & Readiness',
        body: 'Reads /proc/stat, /proc/meminfo, and numeric PID directories directly; serves warming_up on sample 1 and 503 when /proc is unavailable.',
      },
    ],
    readmeMarkdown: `# procstatd

Lightweight Go daemon reading Linux \`/proc\` directly and serving honest JSON metrics on \`GET /api/sysmon\`.
`,
  },

  'tachyon-fetch': {
    repoId: 'tachyon-fetch',
    stationNumber: '11',
    eraLabel: 'Hardware Probe',
    chapterTitle: 'Single-Pass Hardware Fetch in Rust',
    beatLine: 'Replaced forked shell fetch scripts with a 1.9 MB Rust binary walking 25 kernel and hardware surfaces.',
    tagline: 'Part III · Rust, ratatui, NVML, Nix',
    openingHook:
      'A cockpit-grade Linux system fetch tool and ratatui TUI configurator with zero child process forks.',
    engineeringNarrative:
      'Walks /proc, /sys, hwmon, DMI, and optional NVML in a single pass with 6 themes, dark/light variants, Kitty image protocol support, and Nix packaging.',
    turningPoint:
      'Zero external binary spawning keeps interactive terminal telemetry sub-millisecond.',
    bridgeToNext: 'With hardware inspection solved, focus turned to implementing cryptographic standards from zero.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Highlights',
        body: '1.9 MB release binary, 25 hardware modules, 6 themes, ratatui TUI configurator, Kitty image protocol.',
      },
    ],
    readmeMarkdown: `# tachyon-fetch

Single-process Linux fetch engine in Rust with 25 modules, \`ratatui\` configurator, and zero child forks.
`,
  },

  'sha-zero': {
    repoId: 'sha-zero',
    stationNumber: '12',
    eraLabel: 'Cryptography',
    chapterTitle: 'FIPS 180-4 SHA-256 From the Spec',
    beatLine: 'Wrote FIPS 180-4 SHA-256 in pure C++17 matching sha256sum with built-in self-test vectors and zero crypto libs.',
    tagline: 'Part III · C++17, FIPS 180-4',
    openingHook:
      'Standalone C++17 SHA-256 hasher for files and stdin built cleanly without linking OpenSSL.',
    engineeringNarrative:
      'Implements 512-bit padding, 64-word schedule expansion, and compression rounds verified against Known Answer Tests via --selftest.',
    turningPoint:
      'Matching coreutils sha256sum across arbitrary files confirmed exact bit-order handling.',
    bridgeToNext: 'Writing crypto primitives from zero laid the groundwork for a post-quantum capability OS prototype.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Commands',
        body: './sha-zero sha256 file.bin | ./sha-zero sha256 - | ./sha-zero sha256 --selftest',
      },
    ],
    readmeMarkdown: `# sha-zero

Zero-dependency FIPS 180-4 SHA-256 hasher in C++17 with built-in self-test vectors.
`,
  },

  verrev: {
    repoId: 'verrev',
    stationNumber: '13',
    eraLabel: 'PQ Capability OS',
    chapterTitle: 'Post-Quantum P2P OS Prototype in Pure Rust',
    beatLine: 'Tested 48 workspace cases across 7 crates covering Keccak, ML-KEM-1024, ML-DSA-87, and capabilities with 0 external crates.',
    tagline: 'Part III · Rust, PQ Crypto, Prototype Scope',
    openingHook:
      'Pure Rust exploration of a post-quantum capability OS with working Layer 0-1 crypto crates and clearly labeled incomplete stubs.',
    engineeringNarrative:
      'Complete and passing crates cover raw Linux syscall shims, KAT-verified Keccak-f[1600], ML-KEM-1024 + ML-DSA-87 + XChaCha20-Poly1305 (27 crypto tests), identity keys, capabilities, and local storage (48 tests across 7 crates), while transport, Kademlia discovery, CRDTs, and Wasm runtime remain stubs.',
    turningPoint:
      'Explicitly documenting complete vs stub crates keeps cryptographic progress verifiable without overclaiming a working OS.',
    bridgeToNext: 'Alongside OS research came rebuilding core Unix pipelines and bit-level tools from zero crates.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Measured Test Matrix',
        body: 'cargo test --workspace passes 48 tests across 7 crates (verrev-hash, 27 crypto tests, identity, capability, diststore, relay, fs). Transport, p2p find_closest, CRDT sync, and Wasm runtime remain prototype shells.',
      },
    ],
    readmeMarkdown: `# verrev

Early-stage prototype for a peer-to-peer operating system in pure Rust (zero third-party crates).

- **48 tests pass across 7 crates**: Keccak-f[1600], ML-KEM-1024, ML-DSA-87, XChaCha20-Poly1305, identity, capability
- **Prototype stubs**: transport, mesh, CRDT sync, Wasm runtime are explicit interface shells
`,
  },

  rowscan: {
    repoId: 'rowscan',
    stationNumber: '14',
    eraLabel: 'Streaming Data',
    chapterTitle: 'Streaming CSV Query Engine (~2M rows/s)',
    beatLine: 'Filter, group-by aggregate, and sort CSV streams at ~2M rows/s in ~350 lines of zero-crate Rust.',
    tagline: 'Part IV · Rust, Streaming CSV',
    openingHook:
      'A standalone streaming CSV CLI scanning 100,000 rows in 0.080 seconds without third-party crates.',
    engineeringNarrative:
      'Streams files or stdin through filter predicates, column selection, count/sum/avg/min/max group-by folds, and top-N Markdown output with 4 passing unit tests.',
    turningPoint:
      'Bounded-memory line streaming handles multi-megabyte exports instantaneously in terminal pipelines.',
    bridgeToNext: 'Next came formatting documentation directly to clean UTF-8 ANSI output in one pass.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Operations',
        body: 'filter, select, group-by (count/sum/avg/min/max), and top-N sorting at ~2M rows/s (0.080s on 100k rows).',
      },
    ],
    readmeMarkdown: `# rowscan

Zero-dependency streaming CSV query engine in ~350 lines of Rust (~2M rows/s, 4 unit tests).
`,
  },

  glyphmd: {
    repoId: 'glyphmd',
    stationNumber: '15',
    eraLabel: 'Single-Pass Text',
    chapterTitle: 'Single-Pass Markdown to ANSI Renderer',
    beatLine: 'Formats headings, code fences, lists, quotes, and inline styles to UTF-8 ANSI in ~350 lines of Rust.',
    tagline: 'Part IV · Rust, ANSI Terminal',
    openingHook:
      'Single-pass UTF-8 Markdown terminal renderer built without regex engines or parser dependencies.',
    engineeringNarrative:
      'Scans headings, nested lists, code fences, quotes, links, and inline styles cleanly with ANSI-aware column wrapping and 7 passing tests.',
    turningPoint:
      'Combining UTF-8 column accounting with ANSI escape skipping kept terminal wrapping crisp.',
    bridgeToNext: 'After plain UTF-8 streams came decoding binary DEFLATE bitstreams bit by bit.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Verified Coverage',
        body: 'Headings, ordered/unordered lists, code fences, blockquotes, UTF-8 wrapping, and 7 unit tests.',
      },
    ],
    readmeMarkdown: `# glyphmd

Single-pass Markdown to ANSI terminal renderer in ~350 lines of pure Rust (7 unit tests).
`,
  },

  huffstream: {
    repoId: 'huffstream',
    stationNumber: '16',
    eraLabel: 'Bitstreams',
    chapterTitle: 'DEFLATE & Gzip Without zlib',
    beatLine: 'Implemented RFC 1951 Huffman decoding, 32 KiB sliding window, and CRC-32 matching zcat on 21 fixtures.',
    tagline: 'Part IV · Rust, RFC 1951/1952',
    openingHook:
      'Full stored, fixed, and dynamic Huffman DEFLATE and gzip decompression written from zero in Rust.',
    engineeringNarrative:
      'Decodes dynamic code-length trees, copies backward matches across a 32 KiB sliding window, and verifies CRC-32 and ISIZE trailers without zlib.',
    turningPoint:
      'Achieved byte-exact parity against system zcat across 21 fixtures (empty, binary, UTF-8, 160 KB levels 1/6/9) plus 3 release checks.',
    bridgeToNext: 'From decoding compressed bitstreams to computing exact unified diffs with bounded memory.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Verification',
        body: 'Byte-exact match against system zcat across 21 compression fixtures plus 3 release checks.',
      },
    ],
    readmeMarkdown: `# huffstream

Zero-dependency DEFLATE (RFC 1951) and gzip (RFC 1952) decompressor in Rust matching \`zcat\` on 21 fixtures.
`,
  },

  hunkdiff: {
    repoId: 'hunkdiff',
    stationNumber: '17',
    eraLabel: 'Edit Distance',
    chapterTitle: 'Bounded DP LCS Unified Diff Engine',
    beatLine: 'Computes dynamic-programming LCS line diffs matching GNU diff -u hunks while guarding n*m > 64M cells.',
    tagline: 'Part IV · Rust, Dynamic Programming',
    openingHook:
      'Standalone unified diff tool matching GNU diff -u hunk output, context splitting, and POSIX exit codes.',
    engineeringNarrative:
      'Runs DP Longest Common Subsequence with 3-line context windows, splits gaps >6 lines, matches GNU diff -u exit codes (0/1/2), and rejects pathological n*m > 64M matrices.',
    turningPoint:
      'Byte-identical hunk bodies against diff -u on 3 fixtures paired with an explicit memory-safety bound.',
    bridgeToNext: 'Then taking that zero-dependency discipline into Linux Wayland windows, Vulkan swapchains, and TrueType rasterization.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Semantics & Safety',
        body: 'Byte-identical hunk bodies vs diff -u on 3 fixtures; exits 2 gracefully if DP table exceeds 64M cells.',
      },
    ],
    readmeMarkdown: `# hunkdiff

Zero-dependency unified line diff in Rust using dynamic programming LCS with an explicit 64M cell guardrail.
`,
  },

  Cipher: {
    repoId: 'Cipher',
    stationNumber: '18',
    eraLabel: 'Cipher Framework',
    chapterTitle: 'Cipher: Native Linux UI Framework in Zig',
    beatLine: '505 KB Zig 0.17.1 UI stack: dlopen Wayland + generated wl_interface tables, dlopen Vulkan WSI, SFNT parser & R8 glyph atlas.',
    tagline: 'Part IV · Zig 0.17.1, Wayland dlopen, Vulkan WSI',
    openingHook:
      'Cipher is an original Linux graphics and immediate-mode UI framework in Zig 0.17.1 with runtime-loaded Wayland/Vulkan and software SHM fallback.',
    engineeringNarrative:
      'Uses tools/gen_wayland_tables.py to emit wl_interface tables for dlopen libwayland-client, dlopen libvulkan.so.1 validated across 114 struct offsets (DR-001 fix), custom SFNT/glyf TrueType rasterizer -> R8 1024x1024 atlas, 2-pass flexbox layout, and zero-initialized struct bases that fixed ReleaseFast execution (10/10 runs pass).',
    turningPoint:
      'Fixing VkRenderPassBeginInfo alignment and uninitialized ReleaseFast struct bases brought debug, ReleaseSafe, and ReleaseFast builds cleanly to WAYLAND_PROTOCOL_OK.',
    bridgeToNext: 'Once Cipher presented real Vulkan frames reliably, CipherDesk put it to work in Janus, rex, and nocturne.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Architecture & Fixes',
        body: 'dlopen libwayland-client.so.0 + generated XML interface tables + libxkbcommon + libvulkan.so.1 (or wl_shm fallback). Fixed DR-001 struct alignment and ReleaseFast zero-init bases (10/10 runs).',
      },
    ],
    readmeMarkdown: `# Cipher

Zero-dependency, Vulkan-native Linux UI framework in Zig 0.17.1.

- **Display**: \`dlopen("libwayland-client.so.0")\` + generated \`wl_interface\` tables (\`tools/gen_wayland_tables.py\`) + \`libxkbcommon\`
- **Rendering**: \`dlopen("libvulkan.so.1")\` WSI swapchain or \`wl_shm\` software fallback
- **Typography & Layout**: custom SFNT TrueType parser, scanline AA rasterizer, R8 1024x1024 atlas, 2-pass flexbox
`,
  },

  CipherDesk: {
    repoId: 'CipherDesk',
    stationNumber: '19',
    eraLabel: 'Native Apps',
    chapterTitle: 'CipherDesk: janus, rex & nocturne',
    beatLine: 'Built janus GPU terminal, rex Unix-socket multiplexer engine, and nocturne bit-exact FLAC player linking only libc.',
    tagline: 'Part IV · Zig, Vulkan, POSIX, FLAC',
    openingHook:
      'Real desktop applications compiled directly atop Cipher linking solely libc and runtime dlopen() system handles.',
    engineeringNarrative:
      'Ships janus (flagship GPU terminal replacing cipherterm with built-in panes/tabs/themes), rex (framework Unix-socket multiplexer engine), and nocturne (from-zero FLAC decoder matching flac/ffmpeg with synced LRC/Vorbis lyrics and PulseAudio dlopen), backed by same-hardware Qt6/GTK4 benchmarks.',
    turningPoint:
      'Stripped cipher-hello runs in 628 KB / 4 linked libs (vs Qt6 45 libs, GTK4 113 libs) and 0.030–0.035 ms heavy-scene CPU onFrame vs Qt6 0.925–0.950 ms.',
    bridgeToNext: 'Finally, unifying all twenty systems inside SIFR with two-layer technical depth and chronological storytelling.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Applications & Same-Box Benchmarks',
        body: 'janus flagship terminal, rex multiplexer engine, nocturne bit-exact FLAC player. bench/BENCH.md verifies 628 KB stripped binary, 23.4 MB software RSS vs Qt6 offscreen 38.6 MB, and 0.031 ms heavy-scene onFrame.',
      },
    ],
    readmeMarkdown: `# CipherDesk

Native applications built cleanly on Cipher:

- **janus**: flagship GPU terminal (panes, tabs, void/paper/ember themes, live RSS; replaces \`cipherterm\`)
- **rex**: Unix-socket JSON-lines multiplexer engine folded into Janus
- **nocturne**: offline FLAC player (bit-exact vs \`flac\`/\`ffmpeg\`, LRC/Vorbis lyrics, PulseAudio \`dlopen\`)
`,
  },

  SIFR: {
    repoId: 'SIFR',
    stationNumber: '20',
    eraLabel: 'The Chronicle',
    chapterTitle: 'SIFR Engineering Portfolio & Physics Canvas',
    beatLine: 'This site. Unifies two-layer technical dossiers, keyboard-accessible filtering, benchmarks, and the 24-cell cipher canvas.',
    tagline: 'Part IV · TypeScript, Canvas 2D, Express',
    openingHook:
      'Synchronized portfolio linking Sifr-Dev’s 20 repositories through immediate technical depth and chronological flow.',
    engineeringNarrative:
      'Combines instant keyboard-accessible search/filtering, hardware-contextual flagship benchmark tables, Recharts commit timelines, live interactive simulations, and the 24-cell polar cipher story canvas.',
    turningPoint:
      'Pairs un-gated engineering specs with demand-driven canvas motion and live GitHub telemetry.',
    bridgeToNext: 'End of the chronicle.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Design',
        body: 'Two-layer engineering dossiers (Layer A intuitive summary + Layer B verifiable depth), keyboard search, benchmark comparisons, and 24-cell spring physics.',
      },
    ],
    readmeMarkdown: `# SIFR

Interactive engineering portfolio, two-layer technical dossiers, and 24-cell physics canvas for Mohamed Salahy (Sifr-Dev).
`,
  },
};

export function getStoryForRepo(repoId: string): RepoStorySpec {
  const canonical = resolveCanonicalRepoId(repoId);
  const direct = REPO_STORIES[canonical] ?? REPO_STORIES[repoId];
  if (direct) return direct;
  const ciKey = Object.keys(REPO_STORIES).find(
    (k) => k.toLowerCase() === canonical.toLowerCase() || k.toLowerCase() === repoId.toLowerCase()
  );
  if (ciKey) return REPO_STORIES[ciKey];
  return {
    repoId,
    stationNumber: '21',
    eraLabel: 'Archive',
    chapterTitle: repoId,
    beatLine: 'Added to the archive from live GitHub telemetry.',
    tagline: 'Live Repository',
    openingHook: `${repoId} pulled dynamically from Sifr-Dev on GitHub.`,
    engineeringNarrative: 'Synced live into the portfolio archive.',
    turningPoint: 'Available in the repository catalog.',
    bridgeToNext: 'Continue through the archive.',
    readmeFilename: 'README.md',
    readmeSections: [{ heading: 'Overview', body: `Live entry for ${repoId}.` }],
    readmeMarkdown: `# ${repoId}\n\nPulled dynamically from Sifr-Dev GitHub telemetry.`,
  };
}
