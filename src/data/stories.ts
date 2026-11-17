export interface RepoStorySpec {
  repoId: string;
  stationNumber: string;
  chapterTitle: string;
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
  malloc_allocator: {
    repoId: 'malloc_allocator',
    stationNumber: '01',
    chapterTitle: 'Before You Own a System, Own a Single Byte',
    tagline: 'Chapter 01 · POSIX sbrk() & Free-List Coalescing in C99',
    openingHook:
      'Every high-level framework begins by calling malloc() and assuming memory simply appears. The SIFR chronicle starts at Station 01 by tearing away that illusion.',
    engineeringNarrative:
      'Written in pure C99 against POSIX sbrk(), malloc_allocator builds a drop-in replacement for libc malloc, free, calloc, and realloc from zero. Each allocation carries an explicit 24-byte header_t struct tracking block size, freedom flag, and linked-list neighbor pointers under a global pthread_mutex_t.',
    turningPoint:
      'Repeated allocations and frees fragment a naive heap into unusable slivers. Implementing forward free-block coalescing—merging contiguous headers via curr->size += sizeof(header_t) + curr->next->size—turned an experimental slab into a self-healing arena.',
    bridgeToNext:
      'Once dynamic memory can be carved, reused, and coalesced safely on Linux, the next step upward is listening directly to what the running Linux kernel exposes about CPU, memory, and processes.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Why Build malloc() From Scratch',
        body: 'Calling libc malloc treats virtual memory like a black box. By walking the program break directly via sbrk(), every 24-byte metadata header, alignment decision, and mutex lock becomes observable.',
      },
      {
        heading: 'Block Layout & Lifecycle',
        body: '1. get_free_block(size) scans the linked list for a first-fit reusable header.\n2. On miss, sbrk(sizeof(header_t) + size) requests contiguous virtual pages from the OS.\n3. my_free(ptr) marks headers free and coalesces adjacent free blocks before printing [USED]/[FREE] diagnostics via print_heap().',
      },
      {
        heading: 'Build & Stress Verification',
        body: 'make test && ./allocator_test — exercises my_malloc, my_calloc zero-fill, my_realloc growth/copy, and multi-block coalescing sweeps.',
      },
    ],
    readmeMarkdown: `# malloc_allocator — Thread-Safe POSIX Heap Allocator in C99

> **Station 01 · Act I (Metal & Memory)**  
> *"Before you own a system, you must earn a single byte of virtual memory."*

## The Story
High-level runtimes hide the cost of dynamic memory behind opaque allocators. \`malloc_allocator\` strips away \`libc\` convenience to implement \`my_malloc\`, \`my_free\`, \`my_calloc\`, and \`my_realloc\` directly atop POSIX \`sbrk()\` and \`pthread_mutex_t\`.

## Memory Architecture
\`\`\`
[ header_t (24B) | payload bytes ... ] -> [ header_t (24B) | payload bytes ... ] -> NULL
  ├── size_t size
  ├── unsigned int is_free
  └── struct header_t *next
\`\`\`

1. **First-Fit Free-List Reuse**: \`get_free_block(size)\` walks the arena before ever touching the kernel break.
2. **Program Break Expansion**: On cache miss, \`sbrk(sizeof(header_t) + size)\` requests raw heap growth.
3. **Adjacent Coalescing**: Freed contiguous blocks collapse backward/forward (\`curr->size += sizeof(header_t) + curr->next->size\`) to prevent heap fragmentation.
4. **Thread Safety**: Every arena mutation is serialized via \`pthread_mutex_lock\`.

## Quick Start
\`\`\`bash
make
./test_allocator
\`\`\`

## Heap Telemetry Format
\`print_heap()\` emits canonical block states:
\`\`\`text
[USED] size=64 bytes | addr=0x55a8f1000018
[FREE] size=128 bytes | addr=0x55a8f1000070
\`\`\`
`,
  },

  sysmon_daemon: {
    repoId: 'sysmon_daemon',
    stationNumber: '02',
    chapterTitle: 'Listening to the Kernel Heartbeat',
    tagline: 'Chapter 02 · Direct /proc Telemetry Daemon in Go',
    openingHook:
      'With heap allocation mastered in C, Station 02 looks outward to the host operating system—reading raw kernel counters straight from procfs instead of parsing shell tools.',
    engineeringNarrative:
      'sysmon_daemon is a lightweight Go service that reads /proc/stat CPU jiffies, /proc/meminfo physical page tables, and active /proc/[pid] directories directly, serving clean telemetry JSON on GET /api/sysmon and liveness probes on GET /health.',
    turningPoint:
      'Differential sampling across consecutive /proc/stat snapshots eliminated instantaneous jitter spikes, while synthetic non-Linux fallbacks ensured development and container verification remained deterministic.',
    bridgeToNext:
      'Reading telemetry is passive; the next frontier is holding live shared state under concurrent client pressure across real network sockets.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Zero Subprocess Telemetry',
        body: 'Spawning top or free wastes fork/exec cycles and brittle string splits. sysmon_daemon reads Linux procfs files directly inside Go byte scanners.',
      },
      {
        heading: 'HTTP Endpoints',
        body: 'GET /api/sysmon -> {"cpu": float64, "mem": int, "procs": int}\nGET /health -> {"status": "OK"}',
      },
    ],
    readmeMarkdown: `# sysmon_daemon — Direct /proc Kernel Telemetry Daemon in Go

> **Station 02 · Act I (Metal & Memory)**  
> *"Stop shelling out to measure the machine. Read /proc directly."*

## The Story
Monitoring tools often wrap external CLI utilities inside fragile shell pipelines. \`sysmon_daemon\` goes straight to the kernel filesystem interface in Go, computing live CPU utilization deltas, memory footprints, and process table counts in microseconds.

## Data Sources
| Metric | Source File | Method |
| --- | --- | --- |
| \`cpu\` | \`/proc/stat\` | User/Nice/Sys/Idle jiffy delta |
| \`mem\` | \`/proc/meminfo\` | Total vs Available KB normalization |
| \`procs\` | \`/proc/[pid]\` | Numeric PID directory scan |

## Endpoints
\`\`\`http
GET /api/sysmon  -> {"cpu": 24.8, "mem": 6420, "procs": 198}
GET /health      -> {"status": "OK"}
\`\`\`

## Run
\`\`\`bash
go run .
\`\`\`
`,
  },

  redis_clone: {
    repoId: 'redis_clone',
    stationNumber: '03',
    chapterTitle: 'Speed Lives in RAM',
    tagline: 'Chapter 03 · Concurrent TCP :6379 Key-Value Store in Go',
    openingHook:
      'Station 03 moves from observing kernel state to owning network transport and in-memory mutation under concurrent load.',
    engineeringNarrative:
      'Built in pure Go over raw POSIX TCP sockets on port 6379, redis_clone pairs per-connection goroutines with a sync.RWMutex-protected in-memory store supporting PING, SET, GET, DEL, and KEYS.',
    turningPoint:
      'Splitting shared read locks (RLock) for high-frequency GET queries from exclusive write locks (Lock) on SET/DEL prevented reader starvation while guaranteeing exact Redis-compatible command arity diagnostics.',
    bridgeToNext:
      'Once a concurrent in-memory engine can serve clients over TCP, the next challenge is unifying dual interfaces—interactive terminal CLI and HTTP API—over one shared locked core.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Protocol & Concurrency Model',
        body: 'Each client connection spawns a lightweight goroutine dispatching commands against internal/store.go under sync.RWMutex.',
      },
      {
        heading: 'Supported Commands',
        body: 'PING -> PONG | SET key value -> OK | GET key -> value / (nil) | DEL key -> OK | KEYS -> listed keys',
      },
    ],
    readmeMarkdown: `# redis_clone — Concurrent In-Memory Key-Value Engine in Go

> **Station 03 · Act I (Metal & Memory)**  
> *"Every round-trip saved is latency earned back for the user."*

## The Story
Databases feel magical until you build the socket loop and lock table yourself. \`redis_clone\` implements a TCP \`:6379\` server, interactive REPL client, and thread-safe hash store using zero third-party packages.

## Command Grammar
\`\`\`text
127.0.0.1:6379> PING
PONG
127.0.0.1:6379> SET sifr zero
OK
127.0.0.1:6379> GET sifr
"zero"
127.0.0.1:6379> DEL sifr
OK
\`\`\`

## Concurrency Guarantee
- Reads (\`GET\`, \`KEYS\`) acquire \`sync.RWMutex.RLock()\` concurrently.
- Mutations (\`SET\`, \`DEL\`) acquire exclusive \`sync.RWMutex.Lock()\`.
- Exact arity validation mirrors Redis error responses (\`(error) ERR wrong number of arguments...\`).
`,
  },

  task_manager_cli: {
    repoId: 'task_manager_cli',
    stationNumber: '04',
    chapterTitle: 'One Concurrent Core, Two Interfaces',
    tagline: 'Chapter 04 · Unified CLI & HTTP JSON Scheduler in Go',
    openingHook:
      'Closing Act I, Station 04 proves a clean core shouldn’t care whether a human types at a terminal prompt or a browser calls an API.',
    engineeringNarrative:
      'task_manager_cli compiles a single race-free Go scheduler seeding initial engineering tasks (#1 "Initialize neural network", #2 "Deploy microservices") and exposing both CLI commands and GET/POST/PATCH /api/tasks over one mutex-synchronized store.',
    turningPoint:
      'Unifying terminal command dispatch and net/http JSON handlers around a single TaskStore mutex meant dual-surface mutations could never diverge or race.',
    bridgeToNext:
      'Act I mastered single-binary memory, procfs, sockets, and mutexes. Act II scales up into enterprise boundaries: strict 4-layer Hexagonal Architecture backed by PostgreSQL 16 and Redis 7.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Shared State Architecture',
        body: 'Both interactive stdin commands and HTTP JSON handlers route into a single mutex-guarded slice of tasks.',
      },
      {
        heading: 'HTTP Contract',
        body: 'GET /api/tasks · POST /api/tasks {"title":"..."} · PATCH /api/tasks?id=N toggles done/pending state.',
      },
    ],
    readmeMarkdown: `# task_manager_cli — Concurrent Go CLI & HTTP Task Scheduler

> **Station 04 · Act I (Metal & Memory · Finale)**  
> *"Two surfaces, one mutex-guarded source of truth."*

## The Story
Real infrastructure rarely has only one consumer. \`task_manager_cli\` combines a crisp terminal command runner with an embedded \`net/http\` JSON API inside one zero-dependency Go binary.

## Initial Seed & API
\`\`\`bash
GET   /api/tasks          # Returns #1 "Initialize neural network" (done), #2 "Deploy microservices" (pending)
POST  /api/tasks          # {"title": "Audit kernel rings"} -> 201 Created
PATCH /api/tasks?id=2     # Toggles pending <-> done atomically
\`\`\`

## Verification
\`\`\`bash
go test -race ./...
\`\`\`
`,
  },

  GO_DB: {
    repoId: 'GO_DB',
    stationNumber: '05',
    chapterTitle: 'Enforcing Boundaries at Compile Time',
    tagline: 'Chapter 05 · Strict 4-Layer Hexagonal Go Service + pgx/v5 + sqlc',
    openingHook:
      'Welcome to Act II. As systems grow beyond single files, entropy destroys velocity unless architectural boundaries are enforced structurally by the compiler.',
    engineeringNarrative:
      'GO_DB implements strict 4-layer Hexagonal Clean Architecture in Go 1.23+: a pure Domain core with zero external imports, UseCase orchestration, sqlc compile-time typed SQL repositories over PostgreSQL 16 (pgx/v5), and a go-chi Delivery layer guarded by JWT access/refresh auth, RBAC AdminMiddleware, and a Redis 7 sliding-window rate limiter.',
    turningPoint:
      'Pairing sqlc code generation with pgx/v5 eliminated runtime SQL reflection bugs completely—schema mismatches fail compilation before a container ever boots.',
    bridgeToNext:
      'With transactional data pipelines isolated and rate-limited, Station 06 asks the opposite question: what happens when analytical intelligence must run in under 1 millisecond with zero heavy dependencies?',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'The 4 Hexagonal Rings',
        body: 'Delivery (go-chi + JWT + Redis 7 100 req/min limiter) -> UseCase (business logic) -> Domain (zero external imports) <- Repository (PostgreSQL 16 + pgx/v5 + sqlc).',
      },
      {
        heading: 'Route & RBAC Surface',
        body: '/health, /api/v1/auth/register, /api/v1/auth/login, /api/v1/tasks/*, and AdminMiddleware-protected /api/v1/admin/users.',
      },
    ],
    readmeMarkdown: `# GO_DB — Hexagonal Clean Architecture Backend in Go 1.23+

> **Station 05 · Act II (Boundaries & Signal)**  
> *"If your domain layer imports a database driver, your architecture is already coupled."*

## The Story
Production backends rot when HTTP handlers talk directly to SQL strings. \`GO_DB\` enforces strict Hexagonal Architecture across four isolated layers paired with a TypeScript management surface (\`GodEye\`).

## Dependency Direction
\`\`\`text
Delivery (go-chi · JWT · Redis 7 Limiter) ──▶ UseCase ──▶ Domain (0 imports)
                                                            ▲
Repository (PostgreSQL 16 · pgx/v5 · sqlc) ─────────────────┘
\`\`\`

## Key Engineering Guarantees
- **Compile-Time SQL**: \`sqlc\` compiles verified PostgreSQL queries directly into type-safe Go methods.
- **Sliding-Window Protection**: Redis 7 limits traffic at \`100 req/min\` per IP before database pools feel pressure.
- **Role-Based Access Control**: \`AdminMiddleware\` isolates \`/api/v1/admin/users\` from standard JWT bearer sessions.
`,
  },

  churn_analytics_engine: {
    repoId: 'churn_analytics_engine',
    stationNumber: '06',
    chapterTitle: 'Shipping Intelligence in 300 Bytes',
    tagline: 'Chapter 06 · Dependency-Free Serverless Logistic Inference',
    openingHook:
      'Too many ML deployments ship 400 MB of NumPy and scikit-learn to evaluate four multiplications and one sigmoid curve. Station 06 cuts the dead weight away.',
    engineeringNarrative:
      'churn_analytics_engine trains offline in scikit-learn, exports coefficients into a ~300-byte model_weights.json artifact, and runs serverless inference in pure stdlib Python math—outputting {"churnProbability": float, "riskLevel": "HIGH" | "MEDIUM" | "LOW"}.',
    turningPoint:
      'Replacing cold-start runtime dependencies with pre-extracted scalar weights slashed container size and cold latency under 1 ms while keeping exact parity with Python threshold boundaries (> 0.65 HIGH, > 0.35 MEDIUM).',
    bridgeToNext:
      'From 300-byte tabular weights, Act III escalates to full convolutional computer vision on the desktop, single-process hardware telemetry, and custom Triton/XLA GPU kernels.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Offline Train, Zero-Dep Serve',
        body: 'Train once with scikit-learn, serialize coefficients into model_weights.json (~300B), and execute pure Python math.exp() inference on AWS Lambda or HTTP.',
      },
      {
        heading: 'Exact Risk Classification',
        body: 'probability > 0.65 -> "HIGH" | probability > 0.35 -> "MEDIUM" | else "LOW".',
      },
    ],
    readmeMarkdown: `# churn_analytics_engine — Zero-Dependency Serverless Churn Inference

> **Station 06 · Act II (Boundaries & Signal · Finale)**  
> *"Train with full tooling offline. Deploy only the mathematics."*

## The Story
Shipping gigabyte ML images to evaluate a logistic regression equation makes serverless cold starts miserable. \`churn_analytics_engine\` separates training from serving cleanly: offline training exports a ~300-byte \`model_weights.json\`, and production executes pure Python \`math.exp\`.

## Inference Contract
\`\`\`python
logit = intercept + w_tenure*tenure + w_monthly*monthly + w_total*total + w_contract
probability = 1.0 / (1.0 + math.exp(-logit))
risk_level = "HIGH" if probability > 0.65 else ("MEDIUM" if probability > 0.35 else "LOW")
\`\`\`

\`\`\`json
{"churnProbability": 0.784, "riskLevel": "HIGH"}
\`\`\`
`,
  },

  GreenLens: {
    repoId: 'GreenLens',
    stationNumber: '07',
    chapterTitle: 'Putting Neural Pathology in a Grower’s Hands',
    tagline: 'Chapter 07 · Native Rust egui + VGG16 Agricultural Workbench',
    openingHook:
      'Act III begins in the physical world: helping agricultural growers diagnose crop disease in seconds on an offline native desktop GPU application.',
    engineeringNarrative:
      'GreenLens marries a crisp Rust egui/eframe OpenGL desktop shell (#080f0b canvas, #40e080 emerald indicators) with a supervised Python VGG16 Block5 TensorFlow worker communicating over JSON-lines stdio, backed by an SQLite extension guidance database.',
    turningPoint:
      'Decoupling the 60 FPS Rust UI thread from heavy TensorFlow inference over a long-lived JSON-lines worker kept the viewport responsive while achieving 95.54% held-out test accuracy (0.950 macro F1) across 3,095 test images and 15 PlantVillage classes.',
    bridgeToNext:
      'Pairing Rust UI discipline with direct system data sparked an obsession: what if a full Linux system cockpit ran natively in Rust with zero subprocesses at all?',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Hybrid Architecture (Rust + Python Worker)',
        body: 'src/app.rs renders the native OpenGL egui workbench while keeping a persistent Python VGG16 process alive over JSON-lines stdio for sub-second classification.',
      },
      {
        heading: 'Held-Out PlantVillage Benchmarks',
        body: '14,434 train / 3,095 val / 3,095 test images across 15 Pepper, Potato & Tomato classes: 95.54% Test Accuracy · 0.950 Macro F1 · Institution-cited SQLite diseases.db guidance.',
      },
    ],
    readmeMarkdown: `# GreenLens — Native Rust + VGG16 Plant Pathology Workbench

> **Station 07 · Act III (Vision, Flight & Silicon)**  
> *"Offline agricultural diagnostics pairing a Rust OpenGL cockpit with institution-cited extension guidance."*

## The Story
Farmers shouldn’t need cloud round-trips or sluggish web wrappers to identify blight on a field laptop. \`GreenLens\` wraps fine-tuned VGG16 convolutional vision inside a native Rust \`egui/eframe\` desktop interface with zero frame drops.

## Held-Out Test Performance (3,095 Images · 15 Classes)
- **Test Accuracy**: \`95.54%\`
- **Macro F1**: \`0.950\`
- **Split**: \`14,434\` Train · \`3,095\` Validation · \`3,095\` Test (PlantVillage)

## IPC & Guidance Pipeline
\`\`\`text
[Rust egui OpenGL UI] ──JSON-lines stdio──▶ [Python VGG16 Block5 Worker]
         │
         ▼
[SQLite diseases.db] ──▶ Clickable Top-3 Pathogen Guidance (NC State / UF / ARC Egypt)
\`\`\`
`,
  },

  'tachyon-fetch': {
    repoId: 'tachyon-fetch',
    stationNumber: '08',
    chapterTitle: 'Zero Forks. Zero Lies.',
    tagline: 'Chapter 08 · Cockpit-Grade Rust Hardware Telemetry Fetch',
    openingHook:
      'Traditional CLI fetch scripts spawn dozens of sluggish shells just to print six lines of system specs. Station 08 bans child processes completely.',
    engineeringNarrative:
      'tachyon-fetch is a 1.9 MB Rust 2021 binary that walks /proc, /sys, DMI tables, hwmon thermals, and NVML GPU counters in one process and one pass—shipping 25 toggleable modules, 6 curated color themes in src/config.rs, Kitty graphics support, and an interactive ratatui --tui configurator.',
    turningPoint:
      'Replacing external commands (uname, lspci, df, nvidia-smi) with direct Rust byte-slice parsing compressed end-to-end execution into single-digit milliseconds—packaged reproducibly via Nix flakes.',
    bridgeToNext:
      'Having stripped overhead out of the operating system telemetry path, Station 09 dives beneath PyTorch’s runtime abstractions straight into GPU shared memory.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Zero Child Process Rule',
        body: 'Zero shells spawned. Direct reads of /proc, /sys/class/hwmon, DMI SMBIOS, and libnvidia-ml (NVML) inside a 1.9 MB static binary.',
      },
      {
        heading: '6 Built-In Palettes & 25 Modules',
        body: 'Solitude, Vantablack, Hackerman, Retro 82, Rose Pine (dark/light), and Flexoki Light (dark/light), configurable live via tachyon --tui.',
      },
    ],
    readmeMarkdown: `# tachyon-fetch — Cockpit-Grade Linux System Telemetry Fetch

> **Station 08 · Act III (Vision, Flight & Silicon)**  
> *"One process. One pass. 25 modules. Zero child forks."*

## The Story
System readouts shouldn’t fork 18 subprocesses just to tell you which GPU is mounted. \`tachyon-fetch\` walks kernel virtual filesystems, hwmon sensors, DMI tables, and NVML directly in Rust—rendering a flight-deck HUD in a 1.9 MB binary.

## Built-In Palettes (\`src/config.rs\`)
\`Vantablack\` · \`Solitude\` · \`Hackerman\` · \`Retro 82\` · \`Rose Pine\` · \`Flexoki Light\`

## Usage
\`\`\`bash
tachyon --theme "Vantablack" --variant dark
tachyon --tui   # Live interactive ratatui configurator
\`\`\`
`,
  },

  'sifr-ml-systems': {
    repoId: 'sifr-ml-systems',
    stationNumber: '09',
    chapterTitle: 'Stepping Below the PyTorch Boundary',
    tagline: 'Chapter 09 · Fused Triton & JAX XLA GPU Kernels (36/36 Parity)',
    openingHook:
      'Calling high-level tensor ops leaves massive memory-bandwidth performance on the table. At Station 09, speed becomes an empirical science.',
    engineeringNarrative:
      'sifr-ml-systems implements fused RMSNorm and FlashAttention-style causal SDPA kernels across PyTorch reference, hand-written Triton, torch.compile Inductor, and JAX XLA—measuring medians over 100 CUDA events after 10 warmup passes via zero-copy DLPack.',
    turningPoint:
      'Fusing RMSNorm row reductions inside SRAM cut 4096×4096 fp16 latency from 3.360 ms down to 0.147 ms (22.8× via JAX XLA; 0.258 ms via Triton), while custom tiled online-softmax FlashAttention reached 0.617 ms on RTX 4060 with all 36 pytest numerical parity checks green.',
    bridgeToNext:
      'Now only two layers of abstraction remained unbuilt from scratch: the display compositor & GPU driver stack itself, and the operating system beneath it. Welcome to Act IV.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Evidence-First Engineering',
        body: 'Zero unmeasured claims. Every speedup in EVIDENCE.md is backed by 10 warmup + 100 CUDA event medians and 36 executable pytest fp32/fp16/bf16 parity assertions.',
      },
      {
        heading: 'Benchmarked Workloads (RTX 4060 · cap 8.9)',
        body: 'bench/compare_rmsnorm.py (4096x4096 fp16 -> 0.147 ms XLA, 22.8x) and bench/compare_attention.py (4x16x1024x64 causal -> 0.632 ms Triton, 14.6x vs naive ref).',
      },
    ],
    readmeMarkdown: `# sifr-ml-systems — Hardware-Aware GPU Kernels & Parity Evidence

> **Station 09 · Act III (Vision, Flight & Silicon · Finale)**  
> *"Speed is never claimed—it is measured with warmup passes, CUDA events, and 36 numerical parity tests."*

## The Story
High-level deep learning frameworks hide redundant HBM round-trips behind convenient abstractions. \`sifr-ml-systems\` drops beneath the framework boundary to write fused RMSNorm and online-softmax Attention kernels in Triton and compare them apples-to-apples over zero-copy DLPack against PyTorch, \`torch.compile\`, and JAX XLA.

## Verified Evidence (\`EVIDENCE.md\` · NVIDIA RTX 4060)
| Workload | PyTorch Naive | Hand-Written Triton | Fastest / SDPA | Parity |
| --- | --- | --- | --- | --- |
| RMSNorm \`4096×4096 fp16\` | \`3.360 ms\` | \`0.258 ms (13.0×)\` | \`0.147 ms JAX XLA (22.8×)\` | \`1e-2\` |
| FlashAttn \`4×16×1024×64\` | \`9.25 ms\` | \`0.617 ms (15.0×)\` | \`0.372 ms PyTorch SDPA\` | \`2e-2\` |

\`\`\`bash
pytest -q   # 36 passed (fp32 1e-5, fp16/bf16 2e-2)
python -m bench.compare_attention
\`\`\`
`,
  },

  'sifr-native': {
    repoId: 'sifr-native',
    stationNumber: '10',
    chapterTitle: 'Throwing Away X11, GTK, and libwayland',
    tagline: 'Chapter 10 · Cipher: Zig Wire-Protocol Wayland & Vulkan Compute Engine',
    openingHook:
      'Entering Act IV (Built From Zero): why link libwayland-client, GTK, or GLFW when the Linux kernel gives you a Unix domain socket and an NVIDIA Vulkan ICD?',
    engineeringNarrative:
      'sifr-native (Cipher) is an original windowing and compute graphics engine written from the binary wire up in Zig. It hand-marshals Wayland wl_display, xdg_toplevel, memfd wl_shm, and xkb keyboard events—and dispatches src/ring.comp directly onto the GPU via Vulkan compute.',
    turningPoint:
      'Early runs presented 24 valid frames that rendered silent solid black (0x000000). Auditing the Vulkan C ABI byte-by-byte uncovered a 20-byte VkSubresourceRange passed where VkBufferImageCopy expected a 16-byte VkSubresourceLayers—fixing those 4 bytes snapped the 24-cell brass & bone SIFR ring onto wayland-0 in crisp RGBA8.',
    bridgeToNext:
      'Having conquered the windowing wire and GPU compute without a single C dependency, only one capstone remains at Station 11: the operating system and post-quantum mesh network itself.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Zero C Dependencies · Pure Zig Wire Client',
        body: 'Hand-encoded Wayland binary frames (wl_display, wl_registry, xdg_shell, wl_shm with SCM_RIGHTS memfd) plus direct Vulkan compute dispatch.',
      },
      {
        heading: 'The 4-Byte VkBufferImageCopy Breakthrough',
        body: 'Replacing 20B VkSubresourceRange with 16B VkSubresourceLayers eliminated stride misalignment and brought src/ring.comp live across 24 presented frames.',
      },
    ],
    readmeMarkdown: `# sifr-native (Cipher) — Native Zig Wayland & Vulkan Compute Framework

> **Station 10 · Act IV (Built From Zero)**  
> *"Zero GTK. Zero X11. Zero libwayland. Just Zig, a Unix socket, and SPIR-V compute."*

## The Story
Modern UI toolkits stack megabytes of C libraries between your pixels and the display compositor. \`Cipher\` (\`sifr-native\`) speaks the Linux Wayland wire protocol directly in Zig and runs \`src/ring.comp\` compute shaders on bare \`libvulkan.so.1\`.

## The 4-Byte ABI Fix That Lit Up the Screen
When the first Vulkan compute output buffer copied cleanly on Wayland yet rendered \`0x000000\` black pixels, ABI byte inspection revealed \`VkBufferImageCopy\` had received a **20-byte** \`VkSubresourceRange\` instead of a **16-byte** \`VkSubresourceLayers\`. Fixing that 4-byte offset illuminated all 24 frames on \`wayland-0\`.

\`\`\`text
[Zig Wayland Wire] ──▶ wl_display / xdg_toplevel / wl_shm (SCM_RIGHTS memfd)
[Vulkan Compute]   ──▶ src/ring.comp (24-cell polar cipher · 241 ms probe · 24 frames)
\`\`\`
`,
  },

  verrev: {
    repoId: 'verrev',
    stationNumber: '11',
    chapterTitle: 'The Capstone: Zero External Crates, Post-Quantum Mesh OS',
    tagline: 'Chapter 11 · Vertically Integrated P2P Operating System in Rust',
    openingHook:
      'Every station along the track—C memory headers, Linux procfs, TCP locks, isolated layers, and bare-metal shaders—converges here at the final stop before the Exit.',
    engineeringNarrative:
      'verrev is a vertically integrated peer-to-peer operating system and encrypted mesh built in Rust + LLVM with zero external crates. Across Layers 0–7, it houses raw Linux syscall shims, KAT-verified Keccak-f[1600] SHA-3 hashes, ML-KEM-1024 + ML-DSA-87 + XChaCha20-Poly1305 cryptography, unforgeable capability tokens, and 256-bucket Kademlia XOR mesh routing.',
    turningPoint:
      'Proving the LFSR-generated Keccak-f[1600] round constants against NIST Known Answer Tests and verifying 27 post-quantum crypto tests plus full workspace integration (31/31 passing under cargo test) delivered a complete sovereign trust root built 100% from zero.',
    bridgeToNext:
      'With post-quantum systems architecture verified end to end, one final chapter turns the lens inward: SIFR itself—the 24-cell cipher canvas, spring physics engine, and zero-template exhibition carrying all twelve repositories.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: 'Zero External Crates Architecture (Layers 0–4)',
        body: 'L0: verrev-syscall + verrev-hash (KAT Keccak) · L1: verrev-crypto (ML-KEM-1024, ML-DSA-87, XChaCha20) + verrev-identity + verrev-capability · L2/4: verrev-store, verrev-p2p (256 KBuckets), verrev-db.',
      },
      {
        heading: 'Test Verification Ledger',
        body: 'cargo test -- --test-threads=1 -> 31 passed across workspace crates (27 cryptographic primitives + P2P routing + capability ACL enforcement).',
      },
    ],
    readmeMarkdown: `# verrev — Vertically Integrated Post-Quantum Peer-to-Peer OS

> **Station 11 · Act IV (Built From Zero)**  
> *"Zero external crates beyond Rust + LLVM. From syscall shims to post-quantum mesh routing."*

## The Story
Most distributed systems glue together dozens of unaudited third-party dependencies. \`verrev\` owns the entire vertical stack—cryptographic hash permutations, key encapsulation, post-quantum signatures, capability tokens, content addressing, and Kademlia XOR peer discovery—under one zero-dependency workspace.

## Vertical Architecture Matrix
| Layer | Crates | Verification |
| --- | --- | --- |
| **L0 · Foundation** | \`verrev-syscall\`, \`verrev-hash\` (SHA3/SHAKE) | NIST KAT-verified Keccak-f[1600] |
| **L1 · PQ Security** | \`verrev-crypto\`, \`verrev-identity\`, \`verrev-capability\` | 27 PQ tests (ML-KEM-1024, ML-DSA-87, XChaCha20) |
| **L2–4 · Data & Mesh** | \`verrev-store\`, \`verrev-p2p\` (256 KBuckets), \`verrev-db\` | \`cargo test -- --test-threads=1\` (31/31 pass) |
`,
  },

  SIFR: {
    repoId: 'SIFR',
    stationNumber: '12',
    chapterTitle: 'The Living Canvas: SIFR Built From Zero',
    tagline: 'Chapter 12 · 24-Cell Alberti Cipher Physics & Cinema Architecture',
    openingHook:
      'Closing Act IV, Chapter 12 steps inside the very instrument you are navigating—an original TypeScript and 2D physics architecture rejecting generic templates and locking all twelve repositories into one unbroken story.',
    engineeringNarrative:
      'SIFR combines a custom 24-cell radial Alberti cipher wheel snapping at crisp 15-degree spring detents, gravitational particle fields bending dynamically under pointer velocity, synthesized Web Audio tactile clicks, live GitHub REST telemetry, and dual bespoke stages tailored for desktop cinema and native mobile thumbs.',
    turningPoint:
      'Replacing static portfolio cards with a continuous directed journey—a reactive Framer Motion grand entrance, live executable hardware/kernel simulations per chapter, and dynamic GitHub REST synchronization—turned passive browsing into an experiential exhibition.',
    bridgeToNext:
      'Chapter 12 completes the twelve-station ascent—from a single 24-byte C allocator header to the SIFR exhibition canvas itself. Step through the Grand Exit to inspect live GitHub telemetry and revisit any work freely.',
    readmeFilename: 'README.md',
    readmeSections: [
      {
        heading: '24-Cell Alberti Cipher & Spring Detent Engine',
        body: 'Pure angular spring solver (stepAngularSpring) snaps across 24 radial bit cells (15 deg detents), locking into SIFR alignment at shift zero.',
      },
      {
        heading: 'Twelve Live Interactive Labs + GitHub REST Sync',
        body: 'Synchronizes repository metadata, pushed timestamps, language byte trees, and recent push activity live against github.com/mohamedsalahi.',
      },
    ],
    readmeMarkdown: `# SIFR — Interactive 24-Cell Cipher Canvas & Systems Exhibition

> **Station 12 · Act IV (Built From Zero · Grand Capstone)**  
> *"One entrance, one canonical track, zero borrowed scaffolding."*

## The Story
\`SIFR\` (zero / صفر) unifies visual brand identity, mathematical cryptography, 2D pointer-reactive physics, synthesized Web Audio feedback, and twelve live systems engineering sandboxes into a single coherent experience.

## Architectural Pillars
- **Sequenced Grand Entrance**: Framer Motion + reactive 76-node orbital gravitational field triggering automatically on load.
- **24-Cell Cipher Core**: Bijective 15° detent cipher mapping (\`decodeRingAtShift(0) -> "SIFR····"\`).
- **Live GitHub Sync**: Merges live \`pushed_at\` timestamps, language distributions, and public events directly from \`api.github.com/users/mohamedsalahi\`.
`,
  },
};

export function getStoryForRepo(repoId: string): RepoStorySpec {
  const direct = REPO_STORIES[repoId];
  if (direct) return direct;
  const ci = Object.values(REPO_STORIES).find((s) => s.repoId.toLowerCase() === repoId.toLowerCase());
  if (ci) return ci;
  return {
    repoId,
    stationNumber: '13',
    chapterTitle: `${repoId} · Live Repository`,
    tagline: `Chapter 13 · Synchronized from github.com/mohamedsalahi/${repoId}`,
    openingHook: `${repoId} is newly published on github.com/mohamedsalahi and automatically integrated into the SIFR exhibition sequence.`,
    engineeringNarrative: `Synced directly via the GitHub REST API with live repository metadata, primary language breakdown, and architecture summary.`,
    turningPoint: `Dynamic GitHub discovery keeps the exhibition continuously aligned with every new repository pushed upstream.`,
    bridgeToNext: `Explore the live metadata and architecture before continuing to the Grand Exit.`,
    readmeFilename: 'README.md',
    readmeSections: [],
    readmeMarkdown: `# ${repoId}\n\nSynchronized directly from [github.com/mohamedsalahi/${repoId}](https://github.com/mohamedsalahi/${repoId}).\n`,
  };
}
