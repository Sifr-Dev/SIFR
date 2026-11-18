export type RepoCategory = 'systems' | 'ml' | 'infra';

export type SchematicKind =
  | 'verrev-mesh'
  | 'ml-tensor'
  | 'wayland-ring'
  | 'tachyon-deck'
  | 'greenlens-cnn'
  | 'malloc-heap'
  | 'godb-hex'
  | 'redis-kv'
  | 'sysmon-proc'
  | 'churn-sigmoid'
  | 'task-queue'
  | 'sifr-cipher'
  | 'vulkan-apps'
  | 'sifr-probe'
  | 'sifr-query'
  | 'sifr-crypt'
  | 'sifr-md'
  | 'sifr-inflate'
  | 'sifr-diff'
  | 'sifr-serve'
  | 'cli-tool';

export interface RepoSpec {
  id: string;
  name: string;
  displayName: string;
  subtitle: string;
  category: RepoCategory;
  categoryLabel: string;
  featured: boolean;
  htmlUrl: string;
  primaryLanguage: string;
  languages: Record<string, number>;
  updatedAt: string;
  createdAt: string;
  stars: number;
  forks: number;
  summary: string;
  proofMetric: string;
  architectureNote: string;
  stack: string[];
  schematic: SchematicKind;
  codeExcerpt: string;
  highlights: { label: string; value: string }[];
}

export interface GitHubActivityItem {
  id: string;
  type: string;
  repo: string;
  createdAt: string;
  actionLabel: string;
}

export interface GitHubProfileSnapshot {
  login: string;
  name: string;
  bio: string;
  company: string;
  blog: string;
  htmlUrl: string;
  avatarUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
}

export const INITIAL_PROFILE: GitHubProfileSnapshot = {
  login: 'Sifr-dev',
  name: 'SIFR-dev',
  bio: 'Systems and machine learning engineer. Head engineer, tech lead and co-founder of @Argos-Security.',
  company: 'Argos',
  blog: 'https://Sifr-dev.vercel.app/',
  htmlUrl: 'https://github.com/Sifr-dev',
  avatarUrl: '/brand/png/avatar-400.png',
  publicRepos: 20,
  followers: 5,
  following: 4,
};

export const REPOSITORIES: RepoSpec[] = [
  {
    id: 'GO_DB',
    name: 'GO_DB',
    displayName: 'mizan',
    subtitle: 'Clean Architecture Go REST API and React Client',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    htmlUrl: 'https://github.com/Sifr-dev/GO_DB',
    primaryLanguage: 'TypeScript',
    languages: {
      TypeScript: 64625,
      Go: 63386,
      Makefile: 2464,
      CSS: 1227,
      Dockerfile: 1105,
      JavaScript: 1023,
      HTML: 813,
    },
    updatedAt: '2026-11-17T22:34:08Z',
    createdAt: '2026-06-21T20:38:29Z',
    stars: 0,
    forks: 0,
    summary:
      'A layered Go REST API and React client for authentication, task ownership, and administrator management using chi, sqlc on PostgreSQL, Redis rate limits, and JWT tokens.',
    proofMetric: '4 isolated layers · sqlc compile-time queries',
    architectureNote:
      'Domain stays independent of external packages. Repository implements domain interfaces via sqlc and pgx/v5 while Delivery handles RBAC and structured logs.',
    stack: ['Go', 'chi', 'PostgreSQL', 'sqlc', 'Redis', 'TypeScript'],
    schematic: 'godb-hex',
    codeExcerpt: `Delivery (chi + JWT + Redis limiter)
  -> UseCase (business rules)
  -> Domain (zero external imports)
  -> Repository (sqlc + pgx/v5 pool)`,
    highlights: [
      { label: 'Database', value: 'PostgreSQL + pgx/v5 + sqlc' },
      { label: 'Auth', value: 'JWT access/refresh + bcrypt + RBAC' },
      { label: 'Cache', value: 'Redis sliding-window rate limit' },
    ],
  },
  {
    id: 'churn_analytics_engine',
    name: 'churn_analytics_engine',
    displayName: 'logitrisk',
    subtitle: 'Zero-Dependency Serverless Churn Inference',
    category: 'ml',
    categoryLabel: 'ML & Vision',
    featured: false,
    htmlUrl: 'https://github.com/Sifr-dev/churn_analytics_engine',
    primaryLanguage: 'Python',
    languages: { Python: 5617 },
    updatedAt: '2026-11-17T22:34:00Z',
    createdAt: '2026-06-22T13:39:50Z',
    stars: 0,
    forks: 0,
    summary:
      'Logistic regression inference engine trained offline and serialized to 300 bytes of JSON weights, running in pure Python without pandas or scikit-learn in production.',
    proofMetric: '300 B weights · <1 ms cold inference',
    architectureNote:
      'Separates offline training from serverless production execution so predictions execute with pure arithmetic in sub-millisecond startup time.',
    stack: ['Python', 'Logistic Regression', 'JSON Weights', 'HTTP'],
    schematic: 'churn-sigmoid',
    codeExcerpt: `logit = -0.85 - 0.045*tenure + 0.018*monthly - 0.00015*total + w_contract
prob  = 1.0 / (1.0 + math.exp(-logit))`,
    highlights: [
      { label: 'Weights Size', value: '~300 byte model_weights.json' },
      { label: 'Runtime Deps', value: '0 third-party ML packages' },
      { label: 'Tiers', value: 'HIGH / MEDIUM / LOW' },
    ],
  },
  {
    id: 'task_manager_cli',
    name: 'task_manager_cli',
    displayName: 'lockstep',
    subtitle: 'Concurrency-Safe Go CLI and HTTP Task API',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    htmlUrl: 'https://github.com/Sifr-dev/task_manager_cli',
    primaryLanguage: 'Go',
    languages: { Go: 3852 },
    updatedAt: '2026-11-17T22:34:55Z',
    createdAt: '2026-06-22T13:39:52Z',
    stars: 0,
    forks: 0,
    summary:
      'Concurrent Go task manager combining a terminal CLI and an in-memory HTTP JSON API protected by a mutex store.',
    proofMetric: 'Shared CLI + HTTP store · zero deps',
    architectureNote:
      'Single binary backing interactive CLI input and REST JSON handlers through one mutex-locked TaskStore.',
    stack: ['Go', 'Goroutines', 'sync.Mutex', 'net/http'],
    schematic: 'task-queue',
    codeExcerpt: `GET   /api/tasks
POST  /api/tasks
PATCH /api/tasks?id=N`,
    highlights: [
      { label: 'Interfaces', value: 'Terminal CLI + HTTP JSON API' },
      { label: 'Locking', value: 'sync.Mutex state protection' },
      { label: 'Dependencies', value: 'Go stdlib only' },
    ],
  },
  {
    id: 'malloc_allocator',
    name: 'malloc_allocator',
    displayName: 'freelist',
    subtitle: 'Thread-Safe Free-List Heap Allocator in C',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: false,
    htmlUrl: 'https://github.com/Sifr-dev/malloc_allocator',
    primaryLanguage: 'C',
    languages: { C: 6154, Makefile: 553 },
    updatedAt: '2026-11-17T22:34:20Z',
    createdAt: '2026-06-22T13:39:53Z',
    stars: 0,
    forks: 0,
    summary:
      'Custom malloc, free, calloc, and realloc implementation in C99 using POSIX sbrk, 24-byte header blocks, free-block coalescing, and pthread_mutex locks.',
    proofMetric: '24B header_t · POSIX sbrk() · coalescing',
    architectureNote:
      'Tracks blocks via header_t (size, is_free, next) and merges neighboring free headers on my_free to prevent fragmentation.',
    stack: ['C99', 'POSIX sbrk()', 'pthread_mutex', 'Free-List'],
    schematic: 'malloc-heap',
    codeExcerpt: `typedef struct header_t {
  size_t size; unsigned int is_free; struct header_t *next;
} header_t;
void *my_malloc(size_t size);
void  my_free(void *ptr);`,
    highlights: [
      { label: 'Header ABI', value: '24B header_t + POSIX sbrk()' },
      { label: 'Coalescing', value: 'Adjacent free block merge' },
      { label: 'Thread Safety', value: 'Global pthread_mutex_t' },
    ],
  },
  {
    id: 'redis_clone',
    name: 'redis_clone',
    displayName: 'redwire',
    subtitle: 'In-Memory Key-Value Store in Go',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    htmlUrl: 'https://github.com/Sifr-dev/redis_clone',
    primaryLanguage: 'Go',
    languages: { Go: 3872 },
    updatedAt: '2026-11-17T22:34:33Z',
    createdAt: '2026-06-22T13:39:53Z',
    stars: 0,
    forks: 0,
    summary:
      'In-memory TCP key-value store in Go handling concurrent clients with RWMutex synchronization and SET, GET, DEL, and PING commands.',
    proofMetric: 'TCP :6379 · RWMutex concurrent map',
    architectureNote:
      'Splits shared read locks from exclusive write locks across goroutine-per-connection socket handlers.',
    stack: ['Go', 'TCP Sockets', 'sync.RWMutex', 'REPL'],
    schematic: 'redis-kv',
    codeExcerpt: `127.0.0.1:6379> SET key value -> OK
127.0.0.1:6379> GET key       -> "value"
127.0.0.1:6379> PING          -> PONG`,
    highlights: [
      { label: 'Commands', value: 'SET / GET / DEL / PING' },
      { label: 'Concurrency', value: 'RWMutex reader parallelism' },
      { label: 'Transport', value: 'TCP :6379 + CLI client' },
    ],
  },
  {
    id: 'sysmon_daemon',
    name: 'sysmon_daemon',
    displayName: 'procstatd',
    subtitle: 'Linux /proc System Telemetry Daemon in Go',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    htmlUrl: 'https://github.com/Sifr-dev/sysmon_daemon',
    primaryLanguage: 'Go',
    languages: { Go: 3948 },
    updatedAt: '2026-11-17T22:34:48Z',
    createdAt: '2026-06-22T13:39:54Z',
    stars: 0,
    forks: 0,
    summary:
      'Go monitoring daemon that parses /proc/stat, /proc/meminfo, and /proc/[pid] directly to serve CPU, memory, and process metrics over HTTP.',
    proofMetric: 'Direct /proc parser · 0 shell forks',
    architectureNote:
      'Computes CPU jiffy deltas directly from kernel files instead of spawning subprocess tools.',
    stack: ['Go', '/proc/stat', '/proc/meminfo', 'HTTP JSON'],
    schematic: 'sysmon-proc',
    codeExcerpt: `cpu  := parseProcStat("/proc/stat")
mem  := parseProcMeminfo("/proc/meminfo")
pids := scanProcPids("/proc")`,
    highlights: [
      { label: 'CPU', value: 'Direct /proc/stat delta' },
      { label: 'Memory', value: '/proc/meminfo parser' },
      { label: 'Routes', value: 'GET /api/sysmon and /health' },
    ],
  },
  {
    id: 'verrev',
    name: 'verrev',
    displayName: 'verrev',
    subtitle: 'Post-Quantum P2P OS Prototype in Rust',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: true,
    htmlUrl: 'https://github.com/Sifr-dev/verrev',
    primaryLanguage: 'Rust',
    languages: { Rust: 205556 },
    updatedAt: '2026-11-17T22:35:00Z',
    createdAt: '2026-08-25T15:32:14Z',
    stars: 0,
    forks: 0,
    summary:
      'Early-stage prototype for a peer-to-peer operating system in pure Rust: custom Keccak SHA-3, ML-KEM-1024, ML-DSA-87, capability security, and CRDTs.',
    proofMetric: 'Early prototype · 0 external crates',
    architectureNote:
      'Implements post-quantum cryptography and Linux syscall shims from scratch while the network transport and microkernel layers remain in active prototype development.',
    stack: ['Rust', 'Keccak SHA-3', 'ML-KEM-1024', 'ML-DSA-87', 'Capabilities'],
    schematic: 'verrev-mesh',
    codeExcerpt: `pub fn derive_identity(dilithium_pk: &[u8]) -> [u8; 32] {
  verrev_hash::sha3_256(dilithium_pk)
}`,
    highlights: [
      { label: 'Crypto', value: 'Keccak, ML-KEM-1024, ML-DSA-87' },
      { label: 'Dependencies', value: 'Zero third-party Rust crates' },
      { label: 'Phase', value: 'Core crypto & capability prototype' },
    ],
  },
  {
    id: 'GreenLens',
    name: 'GreenLens',
    displayName: 'GreenLens',
    subtitle: 'Native Rust Desktop App for Plant Disease Identification',
    category: 'ml',
    categoryLabel: 'ML & Vision',
    featured: false,
    htmlUrl: 'https://github.com/Sifr-dev/GreenLens',
    primaryLanguage: 'Rust',
    languages: { Rust: 64998, Python: 47242, Nix: 2216, Dockerfile: 503, Shell: 10 },
    updatedAt: '2026-11-17T22:34:12Z',
    createdAt: '2026-10-16T19:54:13Z',
    stars: 0,
    forks: 0,
    summary:
      'Native Rust egui desktop app paired with a local TensorFlow VGG16 worker and SQLite guidance database to classify 15 plant leaf diseases offline.',
    proofMetric: '95.54% test accuracy · Rust egui + VGG16',
    architectureNote:
      'Rust frontend communicates over JSON-lines stdio with a supervised Python Keras VGG16 process trained on 20,624 PlantVillage leaf images.',
    stack: ['Rust', 'egui', 'TensorFlow VGG16', 'SQLite', 'Nix'],
    schematic: 'greenlens-cnn',
    codeExcerpt: `// JSON-lines stdio between egui and VGG16 worker
{"image": "potato_late_blight.jpg"}
// -> {"class": "Potato___Late_blight", "prob": 0.961}`,
    highlights: [
      { label: 'Accuracy', value: '95.54% on 3,095 test images' },
      { label: 'Frontend', value: 'Native Rust egui/eframe' },
      { label: 'Guidance', value: 'Offline SQLite treatment records' },
    ],
  },
  {
    id: 'tachyon-fetch',
    name: 'tachyon-fetch',
    displayName: 'tachyon-fetch',
    subtitle: 'Single-Process Linux System Fetch Engine in Rust',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: true,
    htmlUrl: 'https://github.com/Sifr-dev/tachyon-fetch',
    primaryLanguage: 'Rust',
    languages: { Rust: 302711, Shell: 5163, Python: 1209, Nix: 874, Makefile: 293 },
    updatedAt: '2026-10-20T20:55:00Z',
    createdAt: '2026-10-19T17:42:03Z',
    stars: 0,
    forks: 0,
    summary:
      'Fast Rust system fetch engine with a built-in ratatui configurator that reads /proc, /sys, hwmon, DMI, and NVML in one pass with zero child processes.',
    proofMetric: '1.9 MB binary · 25 modules · 0 child forks',
    architectureNote:
      'Replaces shell scripts that spawn external binaries; includes 6 themes, Kitty image support, and Nix packaging.',
    stack: ['Rust', 'ratatui', 'NVML', '/proc + /sys', 'Nix'],
    schematic: 'tachyon-deck',
    codeExcerpt: `// Reads kernel surfaces directly without shelling out
tachyon --theme vantablack --modules cpu,gpu,mem`,
    highlights: [
      { label: 'Size', value: '1.9 MB release binary' },
      { label: 'Probes', value: '25 hardware/OS modules' },
      { label: 'Configurator', value: 'Interactive ratatui TUI' },
    ],
  },
  {
    id: 'sifr-ml-systems',
    name: 'sifr-ml-systems',
    displayName: 'subtorch',
    subtitle: 'Triton and JAX GPU Kernels with Parity Evidence',
    category: 'ml',
    categoryLabel: 'ML & Vision',
    featured: true,
    htmlUrl: 'https://github.com/Sifr-dev/sifr-ml-systems',
    primaryLanguage: 'Python',
    languages: { Python: 30669 },
    updatedAt: '2026-11-17T22:34:40Z',
    createdAt: '2026-11-16T02:40:04Z',
    stars: 0,
    forks: 0,
    summary:
      'Hardware-aware ML systems repository implementing fused RMSNorm and causal SDPA kernels across PyTorch, custom Triton, Inductor, and JAX XLA with executable parity suites.',
    proofMetric: '0.147 ms RMSNorm (22.8x vs PyTorch eager)',
    architectureNote:
      'Every speedup claim is gated behind 36 numerical tolerance tests across fp32, fp16, and bf16 with reproducible benchmark commands.',
    stack: ['Python', 'Triton', 'PyTorch', 'JAX / XLA', 'CUDA'],
    schematic: 'ml-tensor',
    codeExcerpt: `# RMSNorm (4096x4096 fp16): JAX XLA 0.147 ms vs PyTorch 3.360 ms
# Triton SDPA (4x16x1024x64): 0.617 ms (causal 0.632 ms)`,
    highlights: [
      { label: 'RMSNorm Speedup', value: '22.8x (0.147 ms XLA)' },
      { label: 'FlashAttn SDPA', value: '0.617 ms custom Triton' },
      { label: 'Tests', value: '36 fp32/fp16/bf16 parity checks' },
    ],
  },
  {
    id: 'sifr-native',
    name: 'sifr-native',
    displayName: 'Cipher',
    subtitle: 'Cipher: Zero-Dependency Linux Wayland and Vulkan UI Framework in Zig',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: true,
    htmlUrl: 'https://github.com/Sifr-dev/sifr-native',
    primaryLanguage: 'Zig',
    languages: { Zig: 505917, GLSL: 2573 },
    updatedAt: '2026-11-18T10:57:36Z',
    createdAt: '2026-11-16T02:52:22Z',
    stars: 0,
    forks: 0,
    summary:
      'Cipher is an original, zero-dependency Linux UI and graphics framework written in Zig 0.17.1: handwritten Wayland wire protocol, Vulkan GPU renderer, flexbox layout, and text engine.',
    proofMetric: '505 KB Zig · Wayland + Vulkan + GLSL shaders',
    architectureNote:
      'Talks directly to the Wayland Unix socket and Vulkan driver with fractional HiDPI scaling, xdg_shell, xkb keyboard handling, and custom GLSL shaders. Zero GTK or C wrappers.',
    stack: ['Zig 0.17.1', 'Wayland Wire', 'Vulkan', 'GLSL', 'HiDPI'],
    schematic: 'wayland-ring',
    codeExcerpt: `// Direct Wayland wire client + Vulkan compute surface in Zig
// No toolkit, no C glue, every byte owned`,
    highlights: [
      { label: 'Windowing', value: 'Handwritten Wayland + HiDPI' },
      { label: 'Rendering', value: 'Native Vulkan + GLSL compute' },
      { label: 'Layout', value: 'Built-in flexbox & font engine' },
    ],
  },
  {
    id: 'SIFR',
    name: 'SIFR',
    displayName: 'SIFR',
    subtitle: '24-Cell Physics Canvas and Engineering Chronicle',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: true,
    htmlUrl: 'https://github.com/Sifr-dev/SIFR',
    primaryLanguage: 'TypeScript',
    languages: { TypeScript: 224937, CSS: 3268, HTML: 1277 },
    updatedAt: '2026-11-17T22:34:37Z',
    createdAt: '2026-11-16T23:59:36Z',
    stars: 0,
    forks: 0,
    summary:
      'This site. A TypeScript and Canvas 2D portfolio moving chronologically across all 20 systems with live demos, Web Audio ticks, and real GitHub telemetry.',
    proofMetric: '20 live systems · custom physics canvas',
    architectureNote:
      'Pairs spring-damped canvas loops that settle to zero idle CPU with an Express telemetry cache and direct email dispatch.',
    stack: ['TypeScript', 'React', 'Canvas 2D', 'Recharts', 'Express'],
    schematic: 'sifr-cipher',
    codeExcerpt: `const decoded = decodeRingAtShift(normalizeShift(shift));
// shift === 0 locks SIFR calibration ring`,
    highlights: [
      { label: 'Canvas', value: 'Horizontal scroll cinema on desktop' },
      { label: 'Dial', value: '24-cell spring-damped cipher ring' },
      { label: 'Backend', value: 'Cached GitHub REST + Resend API' },
    ],
  },
  {
    id: 'sifr-apps',
    name: 'sifr-apps',
    displayName: 'CipherDesk',
    subtitle: 'Native Vulkan Apps Built on Cipher: rex, cipherterm, nocturne',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: true,
    htmlUrl: 'https://github.com/Sifr-dev/sifr-apps',
    primaryLanguage: 'Zig',
    languages: { Zig: 84380, 'C++': 4134, Shell: 2983, C: 2379 },
    updatedAt: '2026-11-18T08:48:01Z',
    createdAt: '2026-11-17T18:05:51Z',
    stars: 0,
    forks: 0,
    summary:
      'Real desktop applications built directly on Cipher (sifr-native): the rex terminal multiplexer, cipherterm GPU terminal emulator, and nocturne offline FLAC player.',
    proofMetric: '3 native apps · libc + dlopen only',
    architectureNote:
      'Links only libc and runtime-loaded system libraries. Rex manages unix socket mux panes, cipherterm renders GPU terminals with live RSS telemetry, and nocturne plays offline FLAC.',
    stack: ['Zig', 'Cipher UI', 'Vulkan', 'PTY / Unix Sockets', 'FLAC Audio'],
    schematic: 'vulkan-apps',
    codeExcerpt: `// Built purely atop ../sifr-native
rex         -> multiplexer daemon + unix socket CLI
cipherterm  -> GPU terminal with pane splits & live RSS
nocturne    -> offline FLAC music player`,
    highlights: [
      { label: 'rex', value: 'Unix-socket multiplexer & panes' },
      { label: 'cipherterm', value: 'Vulkan GPU terminal client' },
      { label: 'nocturne', value: 'Offline FLAC audio engine' },
    ],
  },
  {
    id: 'sifr-probe',
    name: 'sifr-probe',
    displayName: 'wireprobe',
    subtitle: 'Zero-Dependency TCP and HTTP Latency Prober in C++17',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    htmlUrl: 'https://github.com/Sifr-dev/sifr-probe',
    primaryLanguage: 'C++',
    languages: { 'C++': 5056, Makefile: 158 },
    updatedAt: '2026-11-17T19:08:13Z',
    createdAt: '2026-11-17T19:08:07Z',
    stars: 0,
    forks: 0,
    summary:
      'A 150-line zero-dependency TCP and HTTP latency prober in C++17 reporting connect RTT and first-byte p50, p90, and p99 percentiles in text or JSON.',
    proofMetric: '150 lines C++17 · p50/p90/p99 percentiles',
    architectureNote:
      'Links only libc over raw POSIX sockets to isolate TCP handshake timing separately from HTTP TTFB.',
    stack: ['C++17', 'POSIX Sockets', 'Percentiles', 'JSON'],
    schematic: 'sifr-probe',
    codeExcerpt: `$ sifrprobe 127.0.0.1:8899 --http
connect    p50 0.073  p99 0.076 ms
first_byte p50 2.021  p99 5.321 ms`,
    highlights: [
      { label: 'Footprint', value: '~150 lines C++17' },
      { label: 'Metrics', value: 'Connect RTT + HTTP first byte' },
      { label: 'Output', value: 'Human summary or --json' },
    ],
  },
  {
    id: 'sifr-query',
    name: 'sifr-query',
    displayName: 'rowscan',
    subtitle: 'Streaming CSV Query Engine in Rust',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    htmlUrl: 'https://github.com/Sifr-dev/sifr-query',
    primaryLanguage: 'Rust',
    languages: { Rust: 11053 },
    updatedAt: '2026-11-17T19:54:05Z',
    createdAt: '2026-11-17T19:53:59Z',
    stars: 0,
    forks: 0,
    summary:
      'Zero-dependency streaming CSV query engine in 350 lines of Rust supporting filter, select, group-by aggregates, and top-N sorting over stdin or files.',
    proofMetric: '350 lines Rust · 0 crates · CSV or Markdown',
    architectureNote:
      'Replaces heavy pandas workflows for quick terminal inspection with constant-memory streaming row scans.',
    stack: ['Rust', 'Streaming Parser', 'Group-By', 'Markdown Out'],
    schematic: 'sifr-query',
    codeExcerpt: `sifr-query data.csv filter country = ke
sifr-query data.csv group-by plan count
sifr-query data.csv top 10 age`,
    highlights: [
      { label: 'Aggregates', value: 'count / sum / avg / min / max' },
      { label: 'Dependencies', value: '0 external crates' },
      { label: 'Output', value: 'CSV or formatted Markdown table' },
    ],
  },
  {
    id: 'sifr-crypt',
    name: 'sifr-crypt',
    displayName: 'sha-zero',
    subtitle: 'FIPS 180-4 SHA-256 Hasher in C++17',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: false,
    htmlUrl: 'https://github.com/Sifr-dev/sifr-crypt',
    primaryLanguage: 'C++',
    languages: { 'C++': 5611 },
    updatedAt: '2026-11-17T20:05:45Z',
    createdAt: '2026-11-17T20:05:39Z',
    stars: 0,
    forks: 0,
    summary:
      'Zero-dependency FIPS 180-4 SHA-256 implementation in C++17 hashing files or stdin with built-in test vector verification and no OpenSSL.',
    proofMetric: 'FIPS 180-4 selftest · no OpenSSL',
    architectureNote:
      'Implements exact SHA-256 message schedule, compression rounds, and padding cleanly in pure C++17 POSIX.',
    stack: ['C++17', 'FIPS 180-4', 'SHA-256', 'POSIX'],
    schematic: 'sifr-crypt',
    codeExcerpt: `$ ./sifr-crypt sha256 --selftest
SHA256_SELFTEST PASS got=e3b0c44298fc1c149afbf4c8996fb924`,
    highlights: [
      { label: 'Standard', value: 'FIPS 180-4 verified' },
      { label: 'Inputs', value: 'Files or streaming stdin (-)' },
      { label: 'Libraries', value: 'None linked' },
    ],
  },
  {
    id: 'sifr-md',
    name: 'sifr-md',
    displayName: 'glyphmd',
    subtitle: 'Single-Pass Markdown to ANSI Terminal Renderer in Rust',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    htmlUrl: 'https://github.com/Sifr-dev/sifr-md',
    primaryLanguage: 'Rust',
    languages: { Rust: 11638 },
    updatedAt: '2026-11-17T20:20:32Z',
    createdAt: '2026-11-17T20:20:26Z',
    stars: 0,
    forks: 0,
    summary:
      'Zero-dependency 350-line Rust tool rendering headings, lists, blockquotes, inline styles, and fenced code to clean UTF-8 ANSI terminal output in one pass.',
    proofMetric: '1 pass · 0 crates · 0 regex engine',
    architectureNote:
      'Uses deterministic character scanning without dynamic dispatch or external Markdown parsers.',
    stack: ['Rust', 'ANSI 256', 'UTF-8', 'Single-Pass Parser'],
    schematic: 'sifr-md',
    codeExcerpt: `sifr-md README.md
cat notes.md | sifr-md`,
    highlights: [
      { label: 'Coverage', value: 'Headings, fences, lists, links' },
      { label: 'Engine', value: 'No regex crate, one pass' },
      { label: 'Footprint', value: '~350 lines pure Rust' },
    ],
  },
  {
    id: 'sifr-inflate',
    name: 'sifr-inflate',
    displayName: 'huffstream',
    subtitle: 'RFC 1951 DEFLATE and Gzip Decompressor in Rust',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: false,
    htmlUrl: 'https://github.com/Sifr-dev/sifr-inflate',
    primaryLanguage: 'Rust',
    languages: { Rust: 12627 },
    updatedAt: '2026-11-17T20:28:04Z',
    createdAt: '2026-11-17T20:27:57Z',
    stars: 0,
    forks: 0,
    summary:
      'DEFLATE and gzip decompressor written from scratch in Rust handling stored, fixed, and dynamic Huffman blocks with a 32 KiB sliding window and CRC-32 checks.',
    proofMetric: 'Byte-exact vs zcat on 21 fixtures',
    architectureNote:
      'Verified across empty, binary, unicode, and 160 KB fixtures at levels 1, 6, and 9 without linking zlib.',
    stack: ['Rust', 'RFC 1951 DEFLATE', 'RFC 1952 Gzip', 'CRC-32'],
    schematic: 'sifr-inflate',
    codeExcerpt: `sifr-inflate archive.gz out.bin
// Dynamic Huffman + 32 KiB window + CRC-32`,
    highlights: [
      { label: 'Huffman', value: 'Stored, fixed & dynamic trees' },
      { label: 'Parity', value: '21 fixtures byte-exact vs zcat' },
      { label: 'Integrity', value: 'Full CRC-32 + ISIZE checks' },
    ],
  },
  {
    id: 'sifr-diff',
    name: 'sifr-diff',
    displayName: 'hunkdiff',
    subtitle: 'Unified Line Diff Using Dynamic Programming LCS in Rust',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: false,
    htmlUrl: 'https://github.com/Sifr-dev/sifr-diff',
    primaryLanguage: 'Rust',
    languages: { Rust: 6932 },
    updatedAt: '2026-11-17T20:34:38Z',
    createdAt: '2026-11-17T20:34:29Z',
    stars: 0,
    forks: 0,
    summary:
      'Zero-dependency unified diff tool in Rust computing Longest Common Subsequence via dynamic programming with byte-identical diff -u hunks and exit codes.',
    proofMetric: 'Byte-identical to diff -u · 0 crates',
    architectureNote:
      'Implements 3-line context framing, hunk splitting across gaps >6 lines, and stdin comparison (-).',
    stack: ['Rust', 'LCS DP', 'Unified Hunks', 'POSIX Diff'],
    schematic: 'sifr-diff',
    codeExcerpt: `$ sifr-diff file_a.txt file_b.txt
@@ -2,7 +2,7 @@
-old line
+new line`,
    highlights: [
      { label: 'Algorithm', value: 'DP Longest Common Subsequence' },
      { label: 'Parity', value: 'Byte-identical hunks vs diff -u' },
      { label: 'Exit Codes', value: '0 same · 1 changed · 2 err' },
    ],
  },
  {
    id: 'sifr-serve',
    name: 'sifr-serve',
    displayName: 'barehttp',
    subtitle: 'Zero-Dependency HTTP/1.1 Static File Server in Rust',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    htmlUrl: 'https://github.com/Sifr-dev/sifr-serve',
    primaryLanguage: 'Rust',
    languages: { Rust: 8518 },
    updatedAt: '2026-11-17T21:40:02Z',
    createdAt: '2026-11-17T21:39:56Z',
    stars: 0,
    forks: 0,
    summary:
      'Minimal thread-per-connection HTTP/1.1 static file server in pure Rust with MIME type detection, directory indexes, conditional headers, and traversal guards.',
    proofMetric: 'Raw TcpListener · canonicalized root guard',
    architectureNote:
      'Handles GET/HEAD with 200/400/403/404/405 status codes and rejects path traversal attempts cleanly.',
    stack: ['Rust', 'HTTP/1.1', 'TcpListener', 'MIME Types'],
    schematic: 'sifr-serve',
    codeExcerpt: `$ sifr-serve ./dist --port 8080
// GET/HEAD, traversal guard, conditional requests`,
    highlights: [
      { label: 'Methods', value: 'GET / HEAD over raw TCP' },
      { label: 'Security', value: 'Canonicalized root path guard' },
      { label: 'Dependencies', value: 'Rust stdlib only' },
    ],
  },
];

export const INITIAL_ACTIVITY: GitHubActivityItem[] = [
  {
    id: 'ev-sifr-native',
    type: 'PushEvent',
    repo: 'sifr-native',
    createdAt: '2026-11-18T10:57:36Z',
    actionLabel: 'Added fractional HiDPI scaling and wl_display error decoding in Cipher',
  },
  {
    id: 'ev-sifr-apps',
    type: 'PushEvent',
    repo: 'sifr-apps',
    createdAt: '2026-11-18T08:48:01Z',
    actionLabel: 'Built rex multiplexer, cipherterm GPU terminal, and nocturne FLAC player',
  },
  {
    id: 'ev-sifr-serve',
    type: 'PushEvent',
    repo: 'sifr-serve',
    createdAt: '2026-11-17T21:40:02Z',
    actionLabel: 'Shipped zero-dependency HTTP/1.1 static file server in Rust',
  },
  {
    id: 'ev-sifr-inflate',
    type: 'PushEvent',
    repo: 'sifr-inflate',
    createdAt: '2026-11-17T20:28:04Z',
    actionLabel: 'Verified byte-exact DEFLATE/gzip decompression against zcat fixtures',
  },
  {
    id: 'ev-sifr-probe',
    type: 'PushEvent',
    repo: 'sifr-probe',
    createdAt: '2026-11-17T19:08:13Z',
    actionLabel: 'Shipped 150-line C++17 TCP and HTTP latency prober',
  },
  {
    id: 'ev-verrev',
    type: 'PushEvent',
    repo: 'verrev',
    createdAt: '2026-11-17T22:35:00Z',
    actionLabel: 'Updated workspace crates and prototype documentation',
  },
];

export const ZERO_DOCTRINES = [
  {
    index: '01',
    title: 'zero-dependency',
    body: 'Own the stack. No framework where a few hundred lines do the job.',
  },
  {
    index: '02',
    title: 'zero-copy, zero-cost',
    body: 'Speed is measured with warmups and medians, never claimed.',
  },
  {
    index: '03',
    title: 'zero-trust, zero-lock-in',
    body: 'Capability security, post-quantum primitives, open mechanism.',
  },
  {
    index: '04',
    title: 'zero-downtime',
    body: 'Reproducible builds across Nix flakes, containers, and clean APIs.',
  },
  {
    index: '05',
    title: 'zero-shot',
    body: 'Work from first principles across kernels, GPU compute, and tools.',
  },
];
