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
  GO_DB: {
    repoId: 'GO_DB',
    stationNumber: '01',
    eraLabel: 'Layered Backend',
    chapterTitle: 'Clean Architecture API',
    beatLine: 'Started with a strict 4-layer Go backend, sqlc queries, Redis rate limits, and a React client.',
    tagline: 'Part I · Go, PostgreSQL, Redis, TypeScript',
    openingHook:
      'A full-stack backend and frontend built with strict boundary rules between HTTP transport, domain logic, and Postgres persistence.',
    engineeringNarrative:
      'Uses Go chi routing, sqlc compile-time SQL generation over pgx/v5, Redis sessions and sliding-window rate limits, plus JWT access tokens and a TypeScript client.',
    turningPoint:
      'Keeping the domain package free of SQL and HTTP imports made persistence swappable and behavior explicit.',
    bridgeToNext: 'Next: collapsing CLI and HTTP handlers around a single in-memory store.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Layers',
        body: 'Delivery (chi, JWT, Redis limiter) -> UseCase -> Domain (pure Go) -> Repository (sqlc + pgx/v5).',
      },
      {
        heading: 'Scope',
        body: 'Handles registration, auth, task ownership, and explicit admin roles with real tests.',
      },
    ],
    readmeMarkdown: `# GO_DB: Clean Architecture API in Go

A layered Go REST API and TypeScript client for user authentication, task ownership, and administrator management.

## Architecture
- **Delivery**: go-chi router, JWT verification, Redis rate limiter
- **UseCase**: application workflows and permission rules
- **Domain**: zero external imports
- **Repository**: sqlc compile-time queries over PostgreSQL 16 + pgx/v5
`,
  },

  task_manager_cli: {
    repoId: 'task_manager_cli',
    stationNumber: '02',
    eraLabel: 'Shared Store',
    chapterTitle: 'Shared CLI and HTTP Store',
    beatLine: 'One Go TaskStore protected by a mutex, driven equally from terminal stdin and REST calls.',
    tagline: 'Part I · Go, Mutex, HTTP JSON',
    openingHook:
      'A concurrent Go task manager unifying local CLI commands with an in-memory HTTP JSON API.',
    engineeringNarrative:
      'Both terminal commands and HTTP handlers mutate the same mutex-protected TaskStore in memory with zero external packages.',
    turningPoint:
      'Eliminated file-lock races between separate CLI and server paths by keeping state in one thread-safe store.',
    bridgeToNext: 'From one mutex store to serving concurrent clients directly over TCP sockets.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Endpoints',
        body: 'GET /api/tasks, POST /api/tasks, PATCH /api/tasks?id=N shared with CLI commands.',
      },
    ],
    readmeMarkdown: `# task_manager_cli

Concurrency-safe Go task manager sharing one mutex-locked store across CLI and HTTP.
`,
  },

  redis_clone: {
    repoId: 'redis_clone',
    stationNumber: '03',
    eraLabel: 'Raw TCP',
    chapterTitle: 'In-Memory Store in Go',
    beatLine: 'A TCP key-value server on port 6379 handling concurrent clients with RWMutex read locks.',
    tagline: 'Part I · Go, TCP Sockets, RWMutex',
    openingHook:
      'An in-memory key-value engine built from scratch over TCP sockets in Go.',
    engineeringNarrative:
      'Supports SET, GET, DEL, and PING over port 6379 and an interactive CLI loop with shared read locks for GET.',
    turningPoint:
      'Switching GET queries to sync.RWMutex RLock let concurrent readers run without blocking each other.',
    bridgeToNext: 'Once raw TCP connections worked cleanly, the next step was serving full HTTP/1.1 without frameworks.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Commands',
        body: 'PING, SET key value, GET key, DEL key over concurrent goroutine connections.',
      },
    ],
    readmeMarkdown: `# redis_clone

In-memory key-value server in pure Go on TCP port 6379 with \`sync.RWMutex\`.
`,
  },

  'sifr-serve': {
    repoId: 'sifr-serve',
    stationNumber: '04',
    eraLabel: 'HTTP Server',
    chapterTitle: 'HTTP/1.1 Server in Pure Rust',
    beatLine: 'A thread-per-connection HTTP/1.1 static server built to host real sites with zero crates.',
    tagline: 'Part I · Rust, HTTP/1.1, TcpListener',
    openingHook:
      'Built to serve real static sites cleanly with path traversal protection and proper HTTP status handling directly on TcpListener.',
    engineeringNarrative:
      'Handles GET and HEAD requests, MIME types, index.html lookup, canonicalized root guards against path traversal, and conditional requests.',
    turningPoint:
      'Replacing every web framework with std::net::TcpListener showed how little code a real HTTP server actually needs.',
    bridgeToNext: 'After serving HTTP from scratch, the next question was measuring what every socket handshake costs.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Capabilities',
        body: 'GET/HEAD, MIME mapping, index.html directories, conditional responses, and canonical traversal guard.',
      },
    ],
    readmeMarkdown: `# sifr-serve

Zero-dependency static HTTP/1.1 file server in Rust with MIME detection and path traversal guards.
`,
  },

  'sifr-probe': {
    repoId: 'sifr-probe',
    stationNumber: '05',
    eraLabel: 'Socket Timing',
    chapterTitle: 'Zero-Dep Latency Prober',
    beatLine: 'Measured TCP connect RTT and HTTP first-byte p50, p90, and p99 percentiles in 150 lines of C++17.',
    tagline: 'Part I · C++17, POSIX Sockets',
    openingHook:
      'A tiny C++17 network prober linking nothing beyond libc over POSIX sockets.',
    engineeringNarrative:
      'Separates TCP connect timing from HTTP first-byte latency and reports min, p50, p90, p99, max, and mean as text or JSON.',
    turningPoint:
      'Kept the entire prober cleanly readable in ~150 lines without Boost or curl.',
    bridgeToNext: 'With network foundations grounded, the story moved into machine learning stripped down to plain arithmetic.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Usage',
        body: 'sifrprobe example.com:80 -n 20 --http --json',
      },
    ],
    readmeMarkdown: `# sifr-probe

Zero-dependency TCP/HTTP latency prober in ~150 lines of C++17 with p50/p90/p99 percentiles and JSON output.
`,
  },

  churn_analytics_engine: {
    repoId: 'churn_analytics_engine',
    stationNumber: '06',
    eraLabel: 'Plain Math ML',
    chapterTitle: 'Zero-Dependency Churn Inference',
    beatLine: 'Stripped pandas and scikit-learn out of production inference down to 300 bytes of JSON weights.',
    tagline: 'Part II · Python, Logistic Regression',
    openingHook:
      'A churn model trained offline, exported to 300 bytes of weights, and evaluated in plain Python math.',
    engineeringNarrative:
      'Instead of shipping a heavy ML container to run a simple linear dot product, predict_churn parses the trained JSON weights and runs directly.',
    turningPoint:
      'Cold inference dropped under one millisecond with zero runtime packages.',
    bridgeToNext: 'From 300 bytes of regression weights to running deep vision inference inside a native desktop app.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Inference',
        body: 'Offline training writes weights JSON; runtime executes pure Python math.',
      },
    ],
    readmeMarkdown: `# churn_analytics_engine

Serverless logistic regression inference without scikit-learn or pandas at runtime.

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
    chapterTitle: 'Native Rust Desktop Plant Classifier',
    beatLine: 'Paired a Rust egui desktop interface with a local TensorFlow VGG16 worker hitting 95.54% accuracy offline.',
    tagline: 'Part II · Rust egui, TensorFlow VGG16, SQLite',
    openingHook:
      'A native desktop application identifying 15 crop leaf diseases from photos completely offline.',
    engineeringNarrative:
      'An egui/eframe frontend in Rust communicates over JSON-lines stdio with a supervised Python VGG16 inference worker and SQLite guidance store.',
    turningPoint:
      'Reached 95.54% accuracy (0.950 macro F1) across 3,095 held-out PlantVillage test images with local treatment advice.',
    bridgeToNext: 'Running VGG16 locally led directly to asking what PyTorch executes on the GPU underneath.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Pipeline',
        body: 'Rust egui opens images -> JSON-lines stdio IPC -> local VGG16 worker -> SQLite guidance.',
      },
    ],
    readmeMarkdown: `# GreenLens

Native desktop plant disease identifier combining a Rust \`egui\` interface with a local TensorFlow VGG16 worker and SQLite database.

- **Accuracy**: 95.54% on 3,095 test images (macro F1 0.950)
- **Classes**: 15 Pepper, Potato, and Tomato leaf classes
`,
  },

  'sifr-ml-systems': {
    repoId: 'sifr-ml-systems',
    stationNumber: '08',
    eraLabel: 'GPU Kernels',
    chapterTitle: 'GPU Kernels Below PyTorch',
    beatLine: 'Wrote custom Triton and JAX XLA RMSNorm and SDPA kernels with 36 numerical parity tests.',
    tagline: 'Part II · Triton, JAX XLA, PyTorch, CUDA',
    openingHook:
      'Studied and implemented computation beneath the high-level ML framework boundary.',
    engineeringNarrative:
      'Benchmarks fused RMSNorm and causal SDPA across PyTorch, custom Triton, Inductor, and JAX XLA using DLPack zero-copy interop.',
    turningPoint:
      'RMSNorm dropped from 3.360 ms to 0.147 ms in JAX XLA while gating every speedup behind 36 fp32/fp16/bf16 parity tests.',
    bridgeToNext: 'Dropping below frameworks opened a deeper question: how does software own memory, processes, and trust itself?',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Scope',
        body: 'Reproducible commands, warmup + medians, explicit GPU reporting, and 36 numerical parity tests.',
      },
    ],
    readmeMarkdown: `# sifr-ml-systems

Hardware-aware ML kernels in Triton, JAX XLA, and PyTorch with reproducible benchmarks and 36 parity checks.
`,
  },

  malloc_allocator: {
    repoId: 'malloc_allocator',
    stationNumber: '09',
    eraLabel: 'Heap Memory',
    chapterTitle: 'Custom malloc in C',
    beatLine: 'Replaced libc malloc, free, calloc, and realloc using POSIX sbrk, 24-byte headers, and coalescing.',
    tagline: 'Part III · C99, POSIX sbrk, pthread_mutex',
    openingHook:
      'Built dynamic memory allocation by hand in C instead of treating libc malloc as magic.',
    engineeringNarrative:
      'Every allocated block carries a 24-byte header_t struct storing size, free status, and next pointer under a global pthread_mutex_t.',
    turningPoint:
      'Coalescing adjacent free blocks on my_free kept repeated alloc/free cycles from fragmenting the heap.',
    bridgeToNext: 'After allocating heap blocks by hand, the next step was reading what the Linux kernel exposes directly.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Block Layout',
        body: '24B header_t (size_t size, unsigned int is_free, struct header_t *next) followed by payload bytes.',
      },
    ],
    readmeMarkdown: `# malloc_allocator

Thread-safe free-list allocator in C99 over POSIX \`sbrk()\`.

\`\`\`c
typedef struct header_t {
  size_t size;
  unsigned int is_free;
  struct header_t *next;
} header_t;
\`\`\`
`,
  },

  sysmon_daemon: {
    repoId: 'sysmon_daemon',
    stationNumber: '10',
    eraLabel: 'Procfs Daemon',
    chapterTitle: 'Reading Linux /proc Directly',
    beatLine: 'Parsed /proc/stat, /proc/meminfo, and /proc/[pid] directly in Go without spawning shell tools.',
    tagline: 'Part III · Go, Linux /proc, HTTP',
    openingHook:
      'Stopped shelling out to ps or top by reading Linux procfs files directly inside a small Go daemon.',
    engineeringNarrative:
      'Computes CPU tick deltas, memory usage, and active process counts in one process and serves them on GET /api/sysmon.',
    turningPoint:
      'Computing jiffy deltas across consecutive /proc/stat samples removed noisy single-tick spikes.',
    bridgeToNext: 'That direct procfs reader evolved into a full single-pass hardware telemetry engine in Rust.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Sources',
        body: 'Reads /proc/stat, /proc/meminfo, and numeric PID directories directly.',
      },
    ],
    readmeMarkdown: `# sysmon_daemon

Lightweight Go daemon reading Linux \`/proc\` directly and serving JSON metrics on \`GET /api/sysmon\`.
`,
  },

  'tachyon-fetch': {
    repoId: 'tachyon-fetch',
    stationNumber: '11',
    eraLabel: 'Hardware Probe',
    chapterTitle: 'Single-Pass Hardware Fetch in Rust',
    beatLine: 'Replaced slow shell fetch scripts with a 1.9 MB Rust binary walking /proc, /sys, DMI, and NVML.',
    tagline: 'Part III · Rust, ratatui, NVML, Nix',
    openingHook:
      'A cockpit-style Linux system fetch tool and ratatui TUI configurator with zero child forks.',
    engineeringNarrative:
      'Reads 25 OS and hardware modules directly from kernel interfaces in a single pass inside a 1.9 MB binary.',
    turningPoint:
      'Removing every external command fork cut poll footprint down to a fraction of a CPU percent.',
    bridgeToNext: 'With OS telemetry covered, attention turned to implementing cryptography straight from standards.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Highlights',
        body: '25 telemetry modules, 6 themes, ratatui TUI configurator, Kitty image protocol, Nix flake.',
      },
    ],
    readmeMarkdown: `# tachyon-fetch

Single-process Linux fetch engine in Rust with 25 modules, \`ratatui\` configurator, and zero child forks.
`,
  },

  'sifr-crypt': {
    repoId: 'sifr-crypt',
    stationNumber: '12',
    eraLabel: 'Cryptography',
    chapterTitle: 'SHA-256 From the Spec',
    beatLine: 'Wrote FIPS 180-4 SHA-256 in pure C++17 with built-in self-test vectors and zero linked libraries.',
    tagline: 'Part III · C++17, FIPS 180-4',
    openingHook:
      'Clean FIPS 180-4 SHA-256 hashing for files and stdin with zero OpenSSL or external crypto dependencies.',
    engineeringNarrative:
      'Implements padding, message schedule expansion, and compression rounds verified against built-in test vectors via --selftest.',
    turningPoint:
      'Passes SHA256_SELFTEST byte-for-byte straight out of a standalone C++17 binary.',
    bridgeToNext: 'Writing crypto primitives from zero became the foundation for a capability-secured OS prototype.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Commands',
        body: 'sifr-crypt sha256 file.bin | sifr-crypt sha256 - | sifr-crypt sha256 --selftest',
      },
    ],
    readmeMarkdown: `# sifr-crypt

Zero-dependency FIPS 180-4 SHA-256 hasher in C++17 with built-in self-test vectors.
`,
  },

  verrev: {
    repoId: 'verrev',
    stationNumber: '13',
    eraLabel: 'Capability OS',
    chapterTitle: 'Post-Quantum P2P OS Prototype',
    beatLine: 'Early-stage Rust OS prototype implementing Keccak SHA-3, ML-KEM-1024, ML-DSA-87, and capabilities with zero crates.',
    tagline: 'Part III · Rust, Post-Quantum Crypto, Prototype',
    openingHook:
      'Started building the cryptographic and capability core of a peer-to-peer operating system with zero external Rust crates.',
    engineeringNarrative:
      'Implements Keccak-f[1600], ML-KEM-1024, ML-DSA-87, XChaCha20-Poly1305, capability primitives, and CRDT foundations cleanly in Rust.',
    turningPoint:
      'Scoped transparently as an early prototype: the crypto and syscall shims run and test cleanly while transport and storage remain in active exploration.',
    bridgeToNext: 'Alongside OS research came rebuilding everyday Unix and graphics tools with zero dependencies.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Honest Scope',
        body: 'Core post-quantum crypto and capability primitives exist and compile cleanly; network transport and storage remain early prototype stubs.',
      },
    ],
    readmeMarkdown: `# verrev

Early-stage prototype for a peer-to-peer operating system in pure Rust (zero third-party crates).

- Custom Keccak SHA-3, ML-KEM-1024, ML-DSA-87, XChaCha20-Poly1305
- Capability security & CRDT primitives
- Network transport and object store layers are in early prototype phase
`,
  },

  'sifr-query': {
    repoId: 'sifr-query',
    stationNumber: '14',
    eraLabel: 'Streaming Data',
    chapterTitle: 'Streaming CSV Query Engine',
    beatLine: 'Filter, group-by aggregate, and sort CSV files or stdin in 350 lines of Rust with zero crates.',
    tagline: 'Part IV · Rust, Streaming CSV',
    openingHook:
      'Built a standalone CSV query CLI in pure Rust instead of waiting on heavy dataframe tools.',
    engineeringNarrative:
      'Streams stdin or files for filter conditions, column selection, group-by count/sum/avg/min/max, and top-N sorting to CSV or Markdown.',
    turningPoint:
      'Constant-memory streaming keeps large logs snappy in everyday terminal pipes.',
    bridgeToNext: 'Next came formatting documentation directly to clean ANSI terminal escapes in one pass.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Operations',
        body: 'filter, select, group-by (count/sum/avg/min/max), and top-N over stdin or files.',
      },
    ],
    readmeMarkdown: `# sifr-query

Zero-dependency streaming CSV query engine in ~350 lines of Rust.
`,
  },

  'sifr-md': {
    repoId: 'sifr-md',
    stationNumber: '15',
    eraLabel: 'Single-Pass Text',
    chapterTitle: 'Markdown to ANSI in One Pass',
    beatLine: 'Renders headings, lists, blockquotes, links, and code blocks to ANSI escapes in 350 lines of Rust.',
    tagline: 'Part IV · Rust, ANSI Terminal',
    openingHook:
      'Single-pass UTF-8 Markdown terminal renderer built without regex engines or parser crates.',
    engineeringNarrative:
      'Formats headings, lists, bold/italic/code inline styles, quotes, and code fences cleanly for terminal reading.',
    turningPoint:
      'Zero crates and a single pass keep startup instantaneous in Unix pipes.',
    bridgeToNext: 'After plain text streams came decoding compressed binary bitstreams bit by bit.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Features',
        body: 'Headings, ordered/unordered lists, code fences, inline emphasis, links, UTF-8 wrapping.',
      },
    ],
    readmeMarkdown: `# sifr-md

Single-pass Markdown to ANSI terminal renderer in ~350 lines of pure Rust.
`,
  },

  'sifr-inflate': {
    repoId: 'sifr-inflate',
    stationNumber: '16',
    eraLabel: 'Bitstreams',
    chapterTitle: 'DEFLATE and Gzip Without zlib',
    beatLine: 'Implemented RFC 1951 Huffman decompression and CRC-32 verification in Rust, matching zcat on 21 fixtures.',
    tagline: 'Part IV · Rust, RFC 1951/1952',
    openingHook:
      'Full stored, fixed, and dynamic Huffman DEFLATE and gzip decompression written from scratch in Rust.',
    engineeringNarrative:
      'Maintains a 32 KiB sliding window and checks CRC-32 and ISIZE trailers without linking zlib.',
    turningPoint:
      'Byte-exact output against zcat across 21 text, binary, empty, unicode, and 160 KB fixtures at levels 1, 6, and 9.',
    bridgeToNext: 'From decompressing bytes to computing exact line diffs from first principles.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Verification',
        body: 'Byte-exact match against system zcat across 21 compression fixtures.',
      },
    ],
    readmeMarkdown: `# sifr-inflate

Zero-dependency DEFLATE (RFC 1951) and gzip (RFC 1952) decompressor in Rust.
`,
  },

  'sifr-diff': {
    repoId: 'sifr-diff',
    stationNumber: '17',
    eraLabel: 'Edit Distance',
    chapterTitle: 'LCS Unified Diff Engine',
    beatLine: 'Computes dynamic-programming LCS line diffs with hunk bodies byte-identical to GNU diff -u.',
    tagline: 'Part IV · Rust, Dynamic Programming',
    openingHook:
      'A standalone unified diff engine matching standard Unix diff output and exit codes.',
    engineeringNarrative:
      'Runs dynamic programming Longest Common Subsequence with 3 context lines and clean hunk splitting.',
    turningPoint:
      'Matches GNU diff -u hunk bodies byte-for-byte with exit code 0, 1, or 2.',
    bridgeToNext: 'Then taking that zero-dependency discipline all the way down to Wayland sockets and Vulkan shaders.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Semantics',
        body: 'Matches GNU diff -u exit codes (0 same, 1 diff, 2 error) and 3-line hunk context.',
      },
    ],
    readmeMarkdown: `# sifr-diff

Zero-dependency unified line diff in Rust using dynamic programming LCS.
`,
  },

  'sifr-native': {
    repoId: 'sifr-native',
    stationNumber: '18',
    eraLabel: 'Cipher Toolkit',
    chapterTitle: 'Cipher: Native Linux UI in Zig',
    beatLine: 'Zero-dependency Linux UI framework in Zig 0.17.1: handwritten Wayland protocol, Vulkan renderer, and flexbox layout.',
    tagline: 'Part IV · Zig 0.17.1, Wayland, Vulkan, GLSL',
    openingHook:
      'Cipher builds a complete Linux graphics and application framework from the Wayland Unix socket up, with zero C wrappers or GTK.',
    engineeringNarrative:
      'Over 505 KB of Zig and GLSL shaders covering handwritten Wayland wire frames, Vulkan GPU rendering, fractional HiDPI scaling, flexbox layout, and text rendering.',
    turningPoint:
      'Owning every byte from wl_display error decoding down to Vulkan image copies turned a bare window test into a full toolkit.',
    bridgeToNext: 'Once Cipher could open windows and draw on Vulkan, I proved it inside three native desktop applications.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'No Toolkit Baggage',
        body: 'Handwritten Wayland client, Vulkan GPU rendering, flexbox layout, text engine, and HiDPI support purely in Zig 0.17.1.',
      },
    ],
    readmeMarkdown: `# Cipher (sifr-native)

Zero-dependency, Vulkan-native Linux UI framework written in Zig 0.17.1.
No toolkit, no C wrapper, no generated bindings.
`,
  },

  'sifr-apps': {
    repoId: 'sifr-apps',
    stationNumber: '19',
    eraLabel: 'Native Apps',
    chapterTitle: 'Native Apps Built on Cipher',
    beatLine: 'Built rex multiplexer, cipherterm GPU terminal, and nocturne offline FLAC player natively on Cipher.',
    tagline: 'Part IV · Zig, Vulkan, POSIX, FLAC',
    openingHook:
      'Real desktop applications compiled directly on Cipher, linking only libc and dlopen system handles.',
    engineeringNarrative:
      'Ships rex (a Unix-socket pane multiplexer + CLI), cipherterm (Vulkan GPU terminal with live RSS and themes), and nocturne (offline FLAC player).',
    turningPoint:
      'Running real daily driver tools directly on your own Zig graphics stack verified every UI layout and GPU primitive under pressure.',
    bridgeToNext: 'Finally, gathering all twenty systems into a single moving canvas so every idea leads into the next.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Three Applications',
        body: 'rex multiplexer, cipherterm GPU terminal emulator, and nocturne offline FLAC player, linking only libc.',
      },
    ],
    readmeMarkdown: `# sifr-apps

Desktop applications built directly on Cipher (\`../sifr-native\`):

- **rex**: multiplexer server and scriptable CLI over a Unix socket
- **cipherterm**: Vulkan GPU terminal client with panes and live RSS readout
- **nocturne**: offline FLAC player
`,
  },

  SIFR: {
    repoId: 'SIFR',
    stationNumber: '20',
    eraLabel: 'The Chronicle',
    chapterTitle: 'The SIFR Moving Canvas',
    beatLine: 'This portfolio. A TypeScript and Canvas 2D chronicle unifying all twenty systems into one continuous story.',
    tagline: 'Part IV · TypeScript, Canvas 2D, Express',
    openingHook:
      'Turned the entire progression into a moving narrative canvas where earlier chapters fade cleanly behind each new idea.',
    engineeringNarrative:
      'Pairs scroll-linked focus and multi-depth parallax with sleeping Canvas 2D schematics and live GitHub telemetry sync.',
    turningPoint:
      'Replaced static card grids and calendar timelines with a continuous story progression from first APIs to bare-metal graphics.',
    bridgeToNext: 'End of the chronicle.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Design',
        body: 'Entrance, horizontal story progression on desktop and tablets, vertical flow on mobile, and clean ending.',
      },
    ],
    readmeMarkdown: `# SIFR

Interactive TypeScript + Canvas 2D engineering chronicle and telemetry showcase.
`,
  },
};

export function getStoryForRepo(repoId: string): RepoStorySpec {
  const direct = REPO_STORIES[repoId];
  if (direct) return direct;
  const ciKey = Object.keys(REPO_STORIES).find((k) => k.toLowerCase() === repoId.toLowerCase());
  if (ciKey) return REPO_STORIES[ciKey];
  return {
    repoId,
    stationNumber: '21',
    eraLabel: 'Archive',
    chapterTitle: repoId,
    beatLine: 'Added to the archive from live GitHub telemetry.',
    tagline: 'Live Repository',
    openingHook: `${repoId} pulled dynamically from GitHub.`,
    engineeringNarrative: 'Synced live into the portfolio archive.',
    turningPoint: 'Available on the story canvas.',
    bridgeToNext: 'Continue through the archive.',
    readmeFilename: 'README.md',
    readmeSections: [{ heading: 'Overview', body: `Live entry for ${repoId}.` }],
    readmeMarkdown: `# ${repoId}\n\nPulled dynamically from GitHub telemetry.`,
  };
}
