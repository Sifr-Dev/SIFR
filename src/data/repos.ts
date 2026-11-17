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
  | 'task-queue';

export interface RepoSpec {
  id: string;
  name: string;
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
  login: 'mohamedsalahi',
  name: 'SIFR-dev',
  bio: 'Aspiring systems and machine learning engineer with a standard that does not accept compromises. Head engineer, tech lead, and co-founder of Argos Security.',
  company: 'Argos',
  blog: 'https://mohamedsalahi.vercel.app/',
  htmlUrl: 'https://github.com/mohamedsalahi',
  avatarUrl: '/brand/png/avatar-400.png',
  publicRepos: 11,
  followers: 5,
  following: 4,
};

export const REPOSITORIES: RepoSpec[] = [
  {
    id: 'verrev',
    name: 'verrev',
    subtitle: 'Post-Quantum Peer-to-Peer OS & Network',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: true,
    htmlUrl: 'https://github.com/mohamedsalahi/verrev',
    primaryLanguage: 'Rust',
    languages: { Rust: 205556 },
    updatedAt: '2026-11-16T23:08:57Z',
    createdAt: '2026-08-25T15:32:14Z',
    stars: 0,
    forks: 0,
    summary:
      'Vertically integrated peer-to-peer operating system and network built from the syscall shim up. Zero external dependencies beyond Rust + LLVM; SHA-3 Keccak-f[1600], ML-KEM-1024, ML-DSA-87, XChaCha20-Poly1305, and capability security.',
    proofMetric: '31/31 tests pass · 0 external crates',
    architectureNote:
      '6-layer stack from raw Linux syscalls (Phase 4 microkernel-ready) through post-quantum identity (SHA3-256 of Dilithium-5 key) and 256-bucket Kademlia XOR mesh routing.',
    stack: ['Rust', 'LLVM', 'SHA3-Keccak', 'ML-KEM-1024', 'ML-DSA-87', 'Capability Security'],
    schematic: 'verrev-mesh',
    codeExcerpt: `// Layer 1 · verrev-identity
pub fn derive_identity(dilithium_pk: &[u8]) -> [u8; 32] {
  verrev_hash::sha3_256(dilithium_pk)
}
// KAT-verified Keccak-f[1600] · RC via LFSR · 27 PQ crypto tests pass`,
    highlights: [
      { label: 'Foundation', value: 'verrev-syscall + verrev-hash (KAT verified)' },
      { label: 'PQ Crypto', value: 'ML-KEM-1024 + ML-DSA-87 + XChaCha20' },
      { label: 'Verification', value: 'cargo test -- --test-threads=1 (31 pass)' },
    ],
  },
  {
    id: 'sifr-native',
    name: 'sifr-native',
    subtitle: 'Cipher: Native Linux Wayland & Vulkan Framework',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: true,
    htmlUrl: 'https://github.com/mohamedsalahi/sifr-native',
    primaryLanguage: 'Zig',
    languages: { Zig: 286477 },
    updatedAt: '2026-11-16T03:03:54Z',
    createdAt: '2026-11-16T02:52:22Z',
    stars: 0,
    forks: 0,
    summary:
      'Original native Linux windowing and graphics framework written from the wire up in Zig. Hand-marshaled Wayland wire client (wl_display, xdg_shell, wl_shm, wl_seat) paired with a real Vulkan compute shader rasterizing the SIFR ring.',
    proofMetric: '24 frames @ wayland-0 · 241 ms Vulkan probe',
    architectureNote:
      'Zero generated protocol bindings, zero GTK/X11, zero C dependencies. Fixed silent-black-image VkBufferImageCopy bug by replacing 20B VkSubresourceRange with 16B VkSubresourceLayers.',
    stack: ['Zig', 'Wayland Wire', 'Vulkan Compute', 'SPIR-V', 'xkb', 'Linux SHM'],
    schematic: 'wayland-ring',
    codeExcerpt: `// src/wayland.zig · hand-marshaled wire frame
// wl_display -> wl_registry -> xdg_toplevel -> wl_shm (memfd + SCM_RIGHTS)
// ring.comp GPU compute rasterizer -> WAYLAND_PROTOCOL_OK frames=24`,
    highlights: [
      { label: 'Compositor', value: 'Handwritten Wayland wire client' },
      { label: 'GPU Driver', value: 'NVIDIA RTX 4060 ICD · libvulkan.so.1' },
      { label: 'Shader', value: 'src/ring.comp · 24-cell polar raster' },
    ],
  },
  {
    id: 'sifr-ml-systems',
    name: 'sifr-ml-systems',
    subtitle: 'Hardware-Aware GPU Kernels & Parity Evidence',
    category: 'ml',
    categoryLabel: 'ML & Vision',
    featured: true,
    htmlUrl: 'https://github.com/mohamedsalahi/sifr-ml-systems',
    primaryLanguage: 'Python',
    languages: { Python: 30669 },
    updatedAt: '2026-11-16T03:47:44Z',
    createdAt: '2026-11-16T02:40:04Z',
    stars: 0,
    forks: 0,
    summary:
      'Computation below the high-level framework boundary: fused RMSNorm and causal SDPA kernels implemented and benchmarked across PyTorch, hand-written Triton, torch.compile Inductor, and JAX XLA with executable parity suites.',
    proofMetric: '0.147 ms RMSNorm (22.8× vs reference)',
    architectureNote:
      'Zero narrative assertions—every RMSNorm & FlashAttention kernel claim is gated behind 36 pytest fp32/fp16/bf16 parity tests and zero-copy DLPack cross-framework benchmarking.',
    stack: ['Python', 'Triton', 'PyTorch', 'JAX / XLA', 'CUDA', 'DLPack'],
    schematic: 'ml-tensor',
    codeExcerpt: `# bench.compare_rmsnorm (4096x4096 fp16) & bench.compare_attention (4x16x1024x64)
# RMSNorm JAX XLA: 0.147 ms (22.8x) | Attention Triton: 0.617 ms (causal 0.632 ms)`,
    highlights: [
      { label: 'RMSNorm 4096×4096 fp16', value: '3.360 ms -> 0.147 ms (22.8x)' },
      { label: 'FlashAttn 4×16×1024×64', value: '9.25 ms -> 0.617 ms Triton / 0.372 ms SDPA' },
      { label: 'Parity Suite', value: '36 passed (fp32 1e-5, fp16/bf16 2e-2)' },
    ],
  },
  {
    id: 'tachyon-fetch',
    name: 'tachyon-fetch',
    subtitle: 'Cockpit-Grade Linux System Telemetry Fetch',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: true,
    htmlUrl: 'https://github.com/mohamedsalahi/tachyon-fetch',
    primaryLanguage: 'Rust',
    languages: { Rust: 302711, Shell: 5163, Python: 1209, Nix: 874, Makefile: 293 },
    updatedAt: '2026-10-20T20:55:04Z',
    createdAt: '2026-10-19T17:42:03Z',
    stars: 0,
    forks: 0,
    summary:
      'A cockpit-grade system readout built in Rust. Walks /proc, /sys, DMI tables, hwmon, and NVML in a single process and single pass—never shelling out to uname, df, ip, or nvidia-smi. Ships with a full ratatui --tui configurator and Kitty graphics.',
    proofMetric: '1.9 MB binary · 25 modules · 0 child forks',
    architectureNote:
      'Two-column flight-deck HUD with 6 built-in themes (Solitude, Vantablack, Hackerman, Retro 82, Rose Pine, Flexoki Light), Nix flake packaging, and braille text-logo rasterization.',
    stack: ['Rust 2021', 'ratatui', 'NVML', 'Linux /proc', 'Kitty Graphics', 'Nix'],
    schematic: 'tachyon-deck',
    codeExcerpt: `// Direct kernel surface walk · 0 forked subprocesses
// /proc/stat + /sys/class/hwmon + DMI + NVML -> single composed frame
tachyon --theme vantablack --modules cpu,gpu,mem,nvme,net`,
    highlights: [
      { label: 'Footprint', value: '1.9 MB release binary · 0 forks' },
      { label: 'Telemetry', value: '25 toggleable kernel/NVML modules' },
      { label: 'Configurator', value: '6 themes + live ratatui TUI' },
    ],
  },
  {
    id: 'GreenLens',
    name: 'GreenLens',
    subtitle: 'Native Rust + VGG16 Plant Pathology Desktop App',
    category: 'ml',
    categoryLabel: 'ML & Vision',
    featured: false,
    htmlUrl: 'https://github.com/mohamedsalahi/GreenLens',
    primaryLanguage: 'Rust',
    languages: { Rust: 64998, Python: 47242, Nix: 2216, Dockerfile: 503, Shell: 10 },
    updatedAt: '2026-10-19T21:52:43Z',
    createdAt: '2026-10-16T19:54:13Z',
    stars: 0,
    forks: 0,
    summary:
      'Native desktop application combining an egui/eframe OpenGL frontend in Rust with a long-lived Python VGG16 TensorFlow worker over JSON-lines stdio, backed by an SQLite guidance database sourced from agricultural institutions.',
    proofMetric: '95.54% accuracy · macro F1 0.950 (3,095 test imgs)',
    architectureNote:
      '15 crop-disease classes across Pepper, Potato, and Tomato trained on 14,434 train / 3,095 val / 3,095 test PlantVillage leaves with non-blocking worker supervision.',
    stack: ['Rust', 'egui / OpenGL', 'TensorFlow VGG16', 'SQLite', 'Nix Flake'],
    schematic: 'greenlens-cnn',
    codeExcerpt: `// JSON-lines IPC: Rust egui <-> Python VGG16 inference worker
{"image": "potato_late_blight.jpg"} -> {"class": "Potato___Late_blight", "prob": 0.961}`,
    highlights: [
      { label: 'Dataset', value: '14,434 train · 3,095 val · 3,095 test' },
      { label: 'Accuracy', value: '95.54% held-out · 0.950 macro F1' },
      { label: 'Guidance', value: 'SQLite diseases.db cited extension protocols' },
    ],
  },
  {
    id: 'GO_DB',
    name: 'GO_DB',
    subtitle: 'Hexagonal Clean Architecture Service in Go',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    htmlUrl: 'https://github.com/mohamedsalahi/GO_DB',
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
    updatedAt: '2026-06-21T20:49:23Z',
    createdAt: '2026-06-21T20:38:29Z',
    stars: 0,
    forks: 0,
    summary:
      'Strict 4-layer Hexagonal Architecture REST backend in Go 1.23+ pairing go-chi routing, sqlc compile-time SQL generation on PostgreSQL 16 + pgx/v5, JWT access/refresh auth, and Redis 7 sliding-window rate limiting.',
    proofMetric: '4 isolated layers · zero-runtime-SQL via sqlc',
    architectureNote:
      'Domain layer holds zero external dependencies; Repository implements Domain interfaces via sqlc; Delivery layer enforces RBAC and structured slog JSON telemetry.',
    stack: ['Go 1.23', 'go-chi', 'PostgreSQL 16', 'sqlc', 'Redis 7', 'TypeScript'],
    schematic: 'godb-hex',
    codeExcerpt: `Delivery (go-chi + JWT + Redis limiter)
  -> UseCase (pure business rules)
  -> Domain (zero external imports)
  -> Repository (sqlc + pgx/v5 pool)`,
    highlights: [
      { label: 'Persistence', value: 'PostgreSQL 16 + pgx/v5 + sqlc' },
      { label: 'Security', value: 'JWT access/refresh + bcrypt + RBAC' },
      { label: 'Rate Limit', value: 'Redis 7 per-IP sliding window' },
    ],
  },
  {
    id: 'malloc_allocator',
    name: 'malloc_allocator',
    subtitle: 'Thread-Safe Free-List Heap Allocator in C99',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: false,
    htmlUrl: 'https://github.com/mohamedsalahi/malloc_allocator',
    primaryLanguage: 'C',
    languages: { C: 6154, Makefile: 553 },
    updatedAt: '2026-06-22T13:40:16Z',
    createdAt: '2026-06-22T13:39:53Z',
    stars: 0,
    forks: 0,
    summary:
      'Drop-in replacement for libc malloc, free, calloc, and realloc written in C99 using POSIX sbrk() heap expansion, 24B header_t free-list reuse, adjacent block coalescing, and pthread_mutex synchronization.',
    proofMetric: '24B header_t · 4 POSIX allocator primitives · coalescing',
    architectureNote:
      'Trails linked-list block headers (size_t size, is_free, *next), merges contiguous freed blocks in O(n) pass, and implements my_calloc zero-fill plus my_realloc copy-on-grow.',
    stack: ['C99', 'POSIX sbrk()', 'pthread_mutex', 'Free-List', 'Makefile'],
    schematic: 'malloc-heap',
    codeExcerpt: `typedef struct header_t { size_t size; unsigned int is_free; struct header_t *next; } header_t;
void *my_malloc(size_t size);   // get_free_block or sbrk(24 + size)
void  my_free(void *ptr);       // coalesce adjacent is_free blocks`,
    highlights: [
      { label: 'Header ABI', value: '24B header_t + POSIX sbrk()' },
      { label: 'Coalescing', value: 'Adjacent free header merge' },
      { label: 'Concurrency', value: 'pthread_mutex thread safety' },
    ],
  },
  {
    id: 'churn_analytics_engine',
    name: 'churn_analytics_engine',
    subtitle: 'Zero-Dependency Serverless Churn Inference',
    category: 'ml',
    categoryLabel: 'ML & Vision',
    featured: false,
    htmlUrl: 'https://github.com/mohamedsalahi/churn_analytics_engine',
    primaryLanguage: 'Python',
    languages: { Python: 5617 },
    updatedAt: '2026-10-09T13:08:51Z',
    createdAt: '2026-06-22T13:39:50Z',
    stars: 0,
    forks: 0,
    summary:
      'Serverless logistic regression inference engine trained offline with scikit-learn and serialized to ~300 bytes of JSON weights, executing pure Python math at sub-millisecond cold start without heavy ML runtime libraries.',
    proofMetric: '~300 B serialized weights · <1 ms inference',
    architectureNote:
      'Strips NumPy, Pandas, and scikit-learn completely out of the AWS Lambda / HTTP production path; classifies customers into HIGH, MEDIUM, and LOW churn risk tiers.',
    stack: ['Python', 'Logistic Regression', 'JSON Weights', 'Serverless HTTP'],
    schematic: 'churn-sigmoid',
    codeExcerpt: `logit = -0.85 - 0.045*tenure + 0.018*monthly - 0.00015*total + w_contract
prob  = 1.0 / (1.0 + math.exp(-logit))`,
    highlights: [
      { label: 'Payload', value: '~300 byte model_weights.json' },
      { label: 'Runtime Deps', value: '0 external ML packages' },
      { label: 'Classification', value: '3-tier HIGH / MEDIUM / LOW' },
    ],
  },
  {
    id: 'sysmon_daemon',
    name: 'sysmon_daemon',
    subtitle: 'Linux /proc Telemetry Daemon in Go',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    htmlUrl: 'https://github.com/mohamedsalahi/sysmon_daemon',
    primaryLanguage: 'Go',
    languages: { Go: 3948 },
    updatedAt: '2026-06-22T13:40:28Z',
    createdAt: '2026-06-22T13:39:54Z',
    stars: 0,
    forks: 0,
    summary:
      'Lightweight Linux system telemetry daemon in Go parsing /proc/stat, /proc/meminfo, and /proc/[pid] directories directly and exposing structured JSON metrics over GET /api/sysmon and /health.',
    proofMetric: '3 /proc parsers · REST telemetry endpoint',
    architectureNote:
      'Designed for minimal CPU overhead with graceful synthetic telemetry fallback when executed on non-Linux hosts.',
    stack: ['Go', '/proc/stat', '/proc/meminfo', 'REST API'],
    schematic: 'sysmon-proc',
    codeExcerpt: `// Direct /proc parsing
cpu := parseProcStat("/proc/stat")
mem := parseProcMeminfo("/proc/meminfo")
pids := scanProcPids("/proc")`,
    highlights: [
      { label: 'CPU', value: 'Direct /proc/stat jiffies delta' },
      { label: 'Memory', value: '/proc/meminfo active & cached' },
      { label: 'Endpoint', value: 'GET /api/sysmon & /health' },
    ],
  },
  {
    id: 'redis_clone',
    name: 'redis_clone',
    subtitle: 'Concurrent In-Memory Key-Value Store in Go',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    htmlUrl: 'https://github.com/mohamedsalahi/redis_clone',
    primaryLanguage: 'Go',
    languages: { Go: 3872 },
    updatedAt: '2026-06-22T13:40:20Z',
    createdAt: '2026-06-22T13:39:53Z',
    stars: 0,
    forks: 0,
    summary:
      'High-performance in-memory key-value engine written in Go implementing POSIX socket transport, mutex-synchronized concurrent map access, and Redis-compatible SET, GET, DEL, and PING commands.',
    proofMetric: 'TCP :6379 · RWMutex thread-safe store',
    architectureNote:
      'Clean command dispatcher with interactive CLI session support and concurrent client goroutine isolation.',
    stack: ['Go', 'POSIX Sockets', 'sync.RWMutex', 'CLI REPL'],
    schematic: 'redis-kv',
    codeExcerpt: `127.0.0.1:6379> SET mykey "Hello World"  -> OK
127.0.0.1:6379> GET mykey                -> "Hello World"
127.0.0.1:6379> PING                     -> PONG`,
    highlights: [
      { label: 'Protocol', value: 'SET / GET / DEL / PING' },
      { label: 'Concurrency', value: 'Mutex-guarded concurrent map' },
      { label: 'Interface', value: 'Socket server + CLI client' },
    ],
  },
  {
    id: 'task_manager_cli',
    name: 'task_manager_cli',
    subtitle: 'Concurrency-Safe Go CLI & HTTP Task API',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    htmlUrl: 'https://github.com/mohamedsalahi/task_manager_cli',
    primaryLanguage: 'Go',
    languages: { Go: 3852 },
    updatedAt: '2026-11-15T23:00:31Z',
    createdAt: '2026-06-22T13:39:52Z',
    stars: 0,
    forks: 0,
    summary:
      'Concurrent Go task scheduler unifying a local terminal CLI with an in-memory HTTP JSON API (GET/POST/PATCH /api/tasks) protected by mutex synchronization and goroutine-safe state mutations.',
    proofMetric: 'Shared CLI + HTTP state · race-free mutexes',
    architectureNote:
      'Single binary serving both interactive command-line task operations and JSON API consumers without external database setup.',
    stack: ['Go', 'Goroutines', 'sync.Mutex', 'net/http JSON'],
    schematic: 'task-queue',
    codeExcerpt: `GET   /api/tasks       // list all tasks
POST  /api/tasks       // {"title": "..."}
PATCH /api/tasks?id=N  // toggle completion`,
    highlights: [
      { label: 'Dual Surface', value: 'Shared CLI & HTTP JSON API' },
      { label: 'Safety', value: 'Mutex-locked concurrent store' },
      { label: 'Runtime', value: 'Zero external dependencies' },
    ],
  },
];

export const INITIAL_ACTIVITY: GitHubActivityItem[] = [
  {
    id: 'ev-1',
    type: 'PushEvent',
    repo: 'sifr-ml-systems',
    createdAt: '2026-11-16T06:52:35Z',
    actionLabel: 'Pushed RMSNorm & causal SDPA parity benchmarks',
  },
  {
    id: 'ev-2',
    type: 'PushEvent',
    repo: 'sifr-native',
    createdAt: '2026-11-16T06:01:35Z',
    actionLabel: 'Verified Vulkan compute shader ring.comp on wayland-0',
  },
  {
    id: 'ev-3',
    type: 'PullRequestEvent',
    repo: 'malloc_allocator',
    createdAt: '2026-11-16T09:55:42Z',
    actionLabel: 'Updated free-list coalescing & stress verification',
  },
  {
    id: 'ev-4',
    type: 'PullRequestEvent',
    repo: 'redis_clone',
    createdAt: '2026-11-16T07:06:05Z',
    actionLabel: 'Refined concurrent socket command dispatch',
  },
  {
    id: 'ev-5',
    type: 'PublicEvent',
    repo: 'verrev',
    createdAt: '2026-08-25T15:32:14Z',
    actionLabel: 'Published Verrev P2P OS architecture & 31 passing tests',
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
    body: 'Speed is a feature, measured with warmup and medians, never claimed.',
  },
  {
    index: '03',
    title: 'zero-trust, zero-lock-in',
    body: 'Capability security, post-quantum primitives, self-hosted, open mechanism.',
  },
  {
    index: '04',
    title: 'zero-downtime',
    body: 'Declarative end to end: reproducible Nix flakes, containers, and clean APIs.',
  },
  {
    index: '05',
    title: 'zero-shot',
    body: 'Start from first principles across kernels, GPU compute, and ML systems.',
  },
];
