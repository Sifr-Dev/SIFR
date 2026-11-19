import { resolveCanonicalRepoId } from '../lib/identity';

export type RepoCategory = 'systems' | 'ml' | 'infra';
export type RepoMaturity = 'Verified' | 'Prototype' | 'Illustrative';

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
  | 'sifr-serve';

export interface RepoDeepDive {
  problem: string;
  built: string;
  approach: string;
  mechanisms: string[];
  methodology: string;
  correctness: string;
  tradeoffs: string;
}

export interface RepoSpec {
  id: string;
  name: string;
  displayName: string;
  subtitle: string;
  category: RepoCategory;
  categoryLabel: string;
  featured: boolean;
  maturity: RepoMaturity;
  defaultBranch: 'main' | 'master';
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
  deepDive: RepoDeepDive;
  engineeringDepthMarkdown?: string;
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
  login: 'Sifr-Dev',
  name: 'SIFR-dev',
  bio: "Aspiring systems and machine learning engineer with a standard that doesn't accept compromises / head engineer, tech lead and CO-founder of @Argos-Security",
  company: 'Argos Security',
  blog: 'https://sifr-dev.vercel.app',
  htmlUrl: 'https://github.com/Sifr-Dev',
  avatarUrl: '/brand/png/avatar-400.png',
  publicRepos: 20,
  followers: 5,
  following: 4,
};

export const REPOSITORIES: RepoSpec[] = [
  {
    id: 'mizan',
    name: 'mizan',
    displayName: 'mizan',
    subtitle: 'Layered Go REST API with Auth Sessions, RBAC & React Client',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    maturity: 'Verified',
    defaultBranch: 'master',
    htmlUrl: 'https://github.com/Sifr-Dev/mizan',
    primaryLanguage: 'Go',
    languages: {
      TypeScript: 64625,
      Go: 63386,
      Makefile: 2464,
      CSS: 1227,
      Dockerfile: 1105,
      JavaScript: 1023,
      HTML: 813,
    },
    updatedAt: '2026-11-18T11:20:00Z',
    createdAt: '2026-06-21T20:38:29Z',
    stars: 0,
    forks: 0,
    summary:
      'Clean-architecture Go REST API (chi + PostgreSQL/sqlc + Redis sessions & fixed-window rate limits) paired with a React TypeScript client supporting task ownership, explicit admin CLI provisioning, and multi-tab token rotation.',
    proofMetric: '4 clean layers · fixed-window Redis · HS256 family rotation',
    architectureNote:
      'Domain defines entities, DTOs, and repository/service ports using standard Go + google/uuid; Repository implements sqlc queries on pgx/v5 while Delivery enforces Origin checks, RBAC, and Redis-backed JTI families.',
    stack: ['Go', 'chi', 'PostgreSQL', 'sqlc', 'Redis', 'TypeScript'],
    schematic: 'godb-hex',
    codeExcerpt: `Delivery (chi + HS256 JWT + fixed-window Redis limiter)
  -> UseCase (workflow & ownership checks)
  -> Domain (entities, DTOs, interfaces, google/uuid)
  -> Repository (sqlc + pgx/v5 pool)`,
    highlights: [
      { label: 'Database', value: 'PostgreSQL + pgx/v5 + sqlc' },
      { label: 'Auth', value: 'Purpose-bound HS256 + HostOnly cookie' },
      { label: 'Rate Limit', value: 'Fixed-window Redis limiter' },
    ],
    deepDive: {
      problem:
        'Full-stack web services frequently leak database handles into domain logic, silently promote first users to admin, or expose refresh tokens to JavaScript storage.',
      built:
        'A four-layer Go service and React SPA enforcing strict boundary separation, Redis fixed-window request limiting, session-tracked JWT families, and an explicit cmd/admin creation CLI.',
      approach:
        'Refresh tokens stay in host-only HttpOnly SameSite cookies while short-lived access tokens stay strictly in memory; browser tabs coordinate token refresh using Web Locks and BroadcastChannel.',
      mechanisms: [
        'Explicit cmd/admin binary rejects existing emails instead of promoting accounts implicitly',
        'Purpose-bound HS256 JWTs carrying token_use, sid, jti, iss, aud, nbf, exp',
        'Atomic Redis session-family JTI rotation revoking successor chains on reuse',
        'Credentialed CORS allowlist and browser Origin enforcement on cookie routes',
      ],
      methodology:
        'Domain imports google/uuid for identifiers alongside stdlib; Redis limiter uses fixed-window counters per IP and route.',
      correctness: 'Integration checks across auth registration, RBAC rejection, refresh reuse revocation, and task ownership.',
      tradeoffs:
        'Fixed-window limiting is simple and atomic in Redis though slightly burstier at window boundaries compared to sliding logs.',
    },
  },
  {
    id: 'logitrisk',
    name: 'logitrisk',
    displayName: 'logitrisk',
    subtitle: 'Zero-Dependency Logistic Churn Scoring Prototype in Python',
    category: 'ml',
    categoryLabel: 'ML & Vision',
    featured: false,
    maturity: 'Illustrative',
    defaultBranch: 'master',
    htmlUrl: 'https://github.com/Sifr-Dev/logitrisk',
    primaryLanguage: 'Python',
    languages: { Python: 5617 },
    updatedAt: '2026-11-17T22:34:00Z',
    createdAt: '2026-06-22T13:39:50Z',
    stars: 0,
    forks: 0,
    summary:
      'A dependency-free Python logistic-scoring prototype (stdlib only) mapping tenure, monthly charges, total charges, and contract flags through JSON weights into HIGH, MEDIUM, and LOW risk tiers.',
    proofMetric: 'Illustrative prototype · ~300 B JSON · stdlib only',
    architectureNote:
      'Runs pure stdlib Python math (src/inference.py and api/churn.py) without importing scikit-learn, pandas, or NumPy; shipped weights in model_weights.json are illustrative hand-set coefficients.',
    stack: ['Python 3 Stdlib', 'Sigmoid Math', 'JSON Artifact', 'HTTP Handler'],
    schematic: 'churn-sigmoid',
    codeExcerpt: `# Illustrative coefficients (not fitted on a dataset)
logit = -0.85 - 0.045*tenure + 0.018*monthly - 0.00015*total + w_contract
prob  = 1.0 / (1.0 + math.exp(-logit))`,
    highlights: [
      { label: 'Maturity', value: 'Logistic prototype (hand-set weights)' },
      { label: 'Runtime Deps', value: '0 third-party packages (stdlib only)' },
      { label: 'Tests', value: '5 unittest checks passing' },
    ],
    deepDive: {
      problem:
        'Simple linear scoring endpoints often ship bloated pandas and scikit-learn container images even when runtime execution is a five-term dot product and sigmoid.',
      built:
        'A minimal CLI scorer (src/inference.py), BaseHTTPRequestHandler POST endpoint (api/churn.py), JSON weight schema, and 5 stdlib unittest tests.',
      approach:
        'Decouples JSON coefficient loading and overflow-safe sigmoid evaluation from external numerical packages.',
      mechanisms: [
        'Overflow-safe sigmoid math over serialized model_weights.json (~300 bytes)',
        'Three-tier risk classification (HIGH > 0.65, MEDIUM > 0.35, LOW <= 0.35)',
        'Pure Python stdlib BaseHTTPRequestHandler serverless-shaped JSON POST route',
      ],
      methodology:
        'Honesty note verified from README: shipped weights are hand-set illustrative coefficients; scripts/train_model.py re-exports the artifact with no bundled dataset or accuracy claim.',
      correctness: 'python3 -m unittest discover -s tests -v -> 5 stdlib tests passing.',
      tradeoffs:
        'Must be paired with an offline training pipeline on labeled customer data before drawing empirical predictive metrics.',
    },
  },
  {
    id: 'lockstep',
    name: 'lockstep',
    displayName: 'lockstep',
    subtitle: 'Concurrency-Safe Go CLI & In-Memory HTTP Task API',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    maturity: 'Verified',
    defaultBranch: 'master',
    htmlUrl: 'https://github.com/Sifr-Dev/lockstep',
    primaryLanguage: 'Go',
    languages: { Go: 3852 },
    updatedAt: '2026-11-17T22:34:55Z',
    createdAt: '2026-06-22T13:39:52Z',
    stars: 0,
    forks: 0,
    summary:
      'Stdlib-only Go task manager sharing a concurrency-safe internal/task.Manager (sync.RWMutex returning value copies) across a terminal CLI and HTTP JSON endpoints.',
    proofMetric: 'Shared Manager · sync.RWMutex value copies · 0 deps',
    architectureNote:
      'Both interactive CLI paths and net/http JSON handlers drive one internal/task.Manager protected by RWMutex, returning value copies so callers cannot mutate shared slice storage.',
    stack: ['Go', 'sync.RWMutex', 'net/http', 'Terminal CLI'],
    schematic: 'task-queue',
    codeExcerpt: `GET   /api/tasks
POST  /api/tasks
PATCH /api/tasks?id=N`,
    highlights: [
      { label: 'Interfaces', value: 'Terminal CLI + HTTP JSON API' },
      { label: 'Locking', value: 'sync.RWMutex + value-copy reads' },
      { label: 'Dependencies', value: 'Go stdlib only' },
    ],
    deepDive: {
      problem:
        'Concurrent Go tools often leak references to internal slice elements outside mutex locks or maintain separate logic for CLI and HTTP modes.',
      built:
        'Unified internal/task.Manager backed by sync.RWMutex, terminal interactive loop, and REST JSON routes.',
      approach:
        'Read locks return shallow value copies rather than pointers into backed memory, keeping race-detector tests clean under concurrent HTTP and CLI traffic.',
      mechanisms: [
        'internal/task.Manager protected by sync.RWMutex',
        'GET/POST/PATCH HTTP handlers sharing core domain state with CLI',
        'Zero external Go modules outside standard library',
      ],
      methodology: 'Verified under Go race detector with concurrent task reads and state mutations.',
      correctness: 'go test -race ./... passes cleanly with zero data races.',
      tradeoffs: 'State lives in-memory during process lifetime without external persistence.',
    },
  },
  {
    id: 'freelist',
    name: 'freelist',
    displayName: 'freelist',
    subtitle: 'Thread-Safe Free-List Heap Allocator in C99',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: false,
    maturity: 'Verified',
    defaultBranch: 'master',
    htmlUrl: 'https://github.com/Sifr-Dev/freelist',
    primaryLanguage: 'C',
    languages: { C: 6154, Makefile: 553 },
    updatedAt: '2026-11-17T22:34:20Z',
    createdAt: '2026-06-22T13:39:53Z',
    stars: 0,
    forks: 0,
    summary:
      'Custom malloc, free, calloc, and realloc written in C99 over POSIX sbrk with 24-byte header_t blocks, magic canary validation, adjacent block coalescing, and pthread_mutex locking.',
    proofMetric: '24B header_t · POSIX sbrk() · 7 unit + 1000-block stress test',
    architectureNote:
      'Each block embeds size, free flag, magic canary, and next pointer in a 24-byte header_t; my_free checks the canary and coalesces neighboring free blocks immediately.',
    stack: ['C99', 'POSIX sbrk()', 'pthread_mutex', 'Free-List'],
    schematic: 'malloc-heap',
    codeExcerpt: `typedef struct header_t {
  size_t size; unsigned int is_free; unsigned int magic; struct header_t *next;
} header_t;`,
    highlights: [
      { label: 'Header ABI', value: '24B header_t + magic canary' },
      { label: 'Coalescing', value: 'Adjacent free-block merge' },
      { label: 'Tests', value: '7 unit + 1000-block stress test' },
    ],
    deepDive: {
      problem:
        'Application code takes heap allocation for granted without seeing how program break syscalls, header alignment, double-free detection, and fragmentation interact.',
      built:
        'Drop-in my_malloc, my_free, my_calloc, and my_realloc implementation in C99 using sbrk(), block splitting/coalescing, and pthread mutex protection.',
      approach:
        'Maintains a singly-linked block chain with magic integrity checks and immediate neighbor coalescing upon free.',
      mechanisms: [
        '24-byte header_t metadata with magic value guard against invalid pointers',
        'First-fit search across free blocks before advancing sbrk()',
        'Adjacent free block coalescing on my_free',
        'Overflow-checked my_calloc multiplication and global pthread_mutex_t lock',
      ],
      methodology: 'Compiled with strict warnings (-Wall -Wextra) and executed under 1000-block mixed allocation stress tests.',
      correctness: '7 unit tests + 1000-block randomized allocate/free/realloc stress test pass.',
      tradeoffs: 'Single global mutex and first-fit list favor clarity over multi-arena per-thread scaling.',
    },
  },
  {
    id: 'redwire',
    name: 'redwire',
    displayName: 'redwire',
    subtitle: 'Bounded RESP2 In-Memory Key-Value Server in Go',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    maturity: 'Verified',
    defaultBranch: 'master',
    htmlUrl: 'https://github.com/Sifr-Dev/redwire',
    primaryLanguage: 'Go',
    languages: { Go: 3872 },
    updatedAt: '2026-11-17T22:34:33Z',
    createdAt: '2026-06-22T13:39:53Z',
    stars: 0,
    forks: 0,
    summary:
      'TCP key-value server in pure Go speaking a bounded subset of the RESP2 wire protocol (PING, SET, GET, DEL, EXISTS, QUIT) with RWMutex reader parallelism and frame-size DOS bounds.',
    proofMetric: 'Bounded RESP2 · 30s read deadline · -race clean',
    architectureNote:
      'Enforces explicit wire safety caps (arity <= 1024, bulk strings <= 1 MiB, 512 B header lines, 30s idle read deadlines) across concurrent goroutine TCP handlers.',
    stack: ['Go', 'TCP :6379', 'RESP2 Wire', 'sync.RWMutex'],
    schematic: 'redis-kv',
    codeExcerpt: `// Bounded RESP2 parser
const (
  maxArrayLen = 1024
  maxBulkLen  = 1 << 20 // 1 MiB
  maxLineLen  = 512
)`,
    highlights: [
      { label: 'Commands', value: 'PING / SET / GET / DEL / EXISTS / QUIT' },
      { label: 'Safety Caps', value: '1024 arity · 1 MiB bulk · 30s timeout' },
      { label: 'Concurrency', value: 'sync.RWMutex (-race clean)' },
    ],
    deepDive: {
      problem:
        'Naive toy socket servers crash or OOM on unbounded RESP bulk headers or stalled TCP connections.',
      built:
        'bounded RESP2 wire codec, goroutine-per-connection listener on port 6379, RWMutex-guarded store, and interactive CLI client.',
      approach:
        'Bounds array length, bulk byte allocations, CRLF header length, and per-read socket deadlines before allocating buffers.',
      mechanisms: [
        'Strict RESP2 parser with pre-allocation size guards',
        'RWMutex read-lock sharing across concurrent GET/EXISTS operations',
        'Explicit 30s socket read timeout prevents slow-loris goroutine leaks',
      ],
      methodology: 'Verified with go test -race across multi-client concurrent TCP commands.',
      correctness: 'Go race detector test suite passes cleanly across wire edge cases and bounds errors.',
      tradeoffs: 'Implements documented in-memory core subset without AOF/RDB persistence or clustering.',
    },
  },
  {
    id: 'procstatd',
    name: 'procstatd',
    displayName: 'procstatd',
    subtitle: 'Direct Linux /proc Telemetry Daemon in Go',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    maturity: 'Verified',
    defaultBranch: 'master',
    htmlUrl: 'https://github.com/Sifr-Dev/procstatd',
    primaryLanguage: 'Go',
    languages: { Go: 3948 },
    updatedAt: '2026-11-17T22:34:48Z',
    createdAt: '2026-06-22T13:39:54Z',
    stars: 0,
    forks: 0,
    summary:
      'Go monitoring daemon parsing /proc/stat, /proc/meminfo, and /proc/[pid] directly over HTTP without subprocess forks, returning explicit 503 states instead of fabricating missing kernel metrics.',
    proofMetric: '0 shell forks · explicit 503 + counter_reset · Buffers+Cached+SReclaimable',
    architectureNote:
      'Tracks consecutive /proc/stat jiffy snapshots, reports warming_up on initial boot sample, detects counter_reset regressions, and calculates used memory including kernel SReclaimable.',
    stack: ['Go', 'Linux /proc', 'HTTP JSON', 'Zero Shell Forks'],
    schematic: 'sysmon-proc',
    codeExcerpt: `// Honest readiness instead of synthetic 0% CPU on boot sample:
// first sample -> state: "warming_up"
// missing /proc -> HTTP 503 Service Unavailable`,
    highlights: [
      { label: 'CPU', value: 'Jiffy delta + counter_reset guard' },
      { label: 'Memory', value: 'Buffers + Cached + SReclaimable' },
      { label: 'Honesty', value: 'Explicit 503 vs fabricated 0s' },
    ],
    deepDive: {
      problem:
        'Lightweight monitors often shell out to ps/top every interval or silently emit 0% CPU before a second delta sample exists.',
      built:
        'In-process Linux /proc reader serving JSON metrics on GET /api/sysmon and readiness on GET /health.',
      approach:
        'Emits explicit state transitions (warming_up on sample 1, counter_reset if kernel counters jump backwards, HTTP 503 if procfs is unreadable).',
      mechanisms: [
        'Direct /proc/stat CPU jiffy delta computation across consecutive reads',
        '/proc/meminfo calculation subtracting Buffers, Cached, and SReclaimable',
        'Numeric /proc/[pid] scanner with explicit unavailable error propagation',
      ],
      methodology: 'Verified against synthetic /proc fixtures covering cold start, counter wrap, and unreadable paths.',
      correctness: 'Go unit suite tests delta math, warming_up handling, and HTTP 503 responses.',
      tradeoffs: 'Targets Linux procfs systems explicitly; non-Linux hosts surface 503 rather than mocking data.',
    },
  },
  {
    id: 'verrev',
    name: 'verrev',
    displayName: 'verrev',
    subtitle: 'Post-Quantum Peer-to-Peer OS Prototype in Pure Rust',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: true,
    maturity: 'Prototype',
    defaultBranch: 'master',
    htmlUrl: 'https://github.com/Sifr-Dev/verrev',
    primaryLanguage: 'Rust',
    languages: { Rust: 205556 },
    updatedAt: '2026-11-18T11:30:00Z',
    createdAt: '2026-08-25T15:32:14Z',
    stars: 0,
    forks: 0,
    summary:
      'Early-stage peer-to-peer OS prototype built from scratch in Rust with zero external crates: verified Keccak-f[1600], ML-KEM-1024, ML-DSA-87, XChaCha20-Poly1305, identity, and capability primitives, while transport/CRDT/runtime layers remain explicit stubs.',
    proofMetric: '48 workspace tests across 7 crates · 0 crates · explicit prototype scope',
    architectureNote:
      'Cleanly separates tested cryptographic and local foundation crates (verrev-syscall, verrev-hash, verrev-crypto, verrev-identity, verrev-capability) from incomplete mesh/CRDT/runtime shells.',
    stack: ['Rust', 'Keccak SHA-3', 'ML-KEM-1024', 'ML-DSA-87', 'Capabilities'],
    schematic: 'verrev-mesh',
    codeExcerpt: `// Verified Layer 1 identity derivation (verrev-identity):
pub fn derive_identity(dilithium_pk: &[u8]) -> [u8; 32] {
  verrev_hash::sha3_256(dilithium_pk)
}`,
    highlights: [
      { label: 'Complete Crates', value: 'syscall, hash (KAT), crypto (27 tests), identity' },
      { label: 'Test Suite', value: '48 tests pass across 7 crates' },
      { label: 'Honest Status', value: '9 shell/stub crates (prototype, not OS yet)' },
    ],
    deepDive: {
      problem:
        'Explore whether a post-quantum identity, capability, and peer-to-peer OS architecture can be built in pure Rust without pulling a single third-party crate.',
      built:
        'An 8-layer Rust workspace: raw Linux syscall shims, formula-generated Keccak SHA-3/SHAKE, full NTT ML-KEM-1024 (10 tests) + ML-DSA-87 (11 tests) + XChaCha20-Poly1305/AES-256-GCM (6 tests), identity derivation, capability tokens, and early local storage/relay crates.',
      approach:
        'Documents crate readiness honestly layer-by-layer so cryptographic primitives can be audited independently while incomplete transport, Kademlia discovery, CRDT, and Wasm runtime crates are clearly labeled as stubs.',
      mechanisms: [
        'verrev-hash: formula-generated Keccak-f[1600] (LFSR RC, (t*(t+1)/2 mod 64) RHO), KAT-verified',
        'verrev-crypto: full NTT ML-KEM-1024, ML-DSA-87, XChaCha20-Poly1305 & constant-time helpers (27 tests)',
        'verrev-identity & verrev-capability: SHA3-256 identity binding, delegation, revocation checks',
        'verrev-transport / p2p / mesh / sync / diststore / runtime / compute: explicitly scoped interface shells',
      ],
      methodology:
        'cargo test --workspace measures 48 passing tests across 7 active crates (README explicitly corrects stale "31" and "60" counts).',
      correctness: '48 workspace tests passing (hash KAT, 27 crypto tests, identity, capability, diststore, relay, fs).',
      tradeoffs:
        'Prototype, not a deployable OS: verrev-transport has no wire I/O yet, verrev-p2p find_closest returns empty Vec, verrev-sync CRDT ops are no-ops, and verrev-runtime Wasm calls return empty Vec.',
    },
    engineeringDepthMarkdown: `## Architecture

\`verrev\` is a 28-crate Rust \`edition = "2024"\` workspace (\`19\` \`#![no_std]\` libraries + \`9\` application stubs in \`Cargo.toml\`) structured into strictly acyclic vertical layers with **zero external crates**:

\`\`\`
Layer 0 (Foundation): verrev-syscall (inline asm) + verrev-hash (Keccak-f[1600])
Layer 1 (Primitives): verrev-crypto (ML-KEM-1024, ML-DSA-87, AEAD) -> verrev-identity -> verrev-capability
Layer 2 (Local State): verrev-store -> verrev-fs
Layer 3-5 (Network Stubs): verrev-transport -> verrev-p2p -> verrev-relay -> verrev-mesh
Layer 6-7 (Runtime Stubs): verrev-sync -> verrev-runtime -> verrev-ui
\`\`\`

## Implementation Details (Verified in Source)

- **Foundation Hashing (\`libs/verrev-hash/src/sha3.rs\`, 234 lines)**: Implements Keccak-f[1600], \`SHA3-256\`, \`SHA3-512\`, \`SHAKE128\`, and \`SHAKE256\`. Round constants (\`RC\`) are generated via LFSR formula and rotation offsets (\`RHO\`) from \`(t*(t+1)/2) mod 64\` rather than static lookup tables.
- **Post-Quantum KEM (\`libs/verrev-crypto/src/kyber.rs\`, 764 lines)**: Full ML-KEM-1024 (\`Q = 3329\`, \`N = 256\`, \`K = 4\`, \`PUBLIC_KEY_BYTES = 1568\`, \`SECRET_KEY_BYTES = 4096\`) using \`barrett_reduce\`, \`montgomery_reduce\`, NTT \`fqmul\`, and bit-reversal helper \`brv7\`.
- **Post-Quantum Signatures (\`libs/verrev-crypto/src/dilithium.rs\`, 1,762 lines)**: Full ML-DSA-87 (\`Q = 8380417\`, \`K = 8\`, \`L = 7\`, \`PUBLIC_KEY_BYTES = 2592\`, \`SIGNATURE_BYTES = 4627\`) with zeta tables computed directly from \`R * zeta^(2 * br7(i))\`.
- **Zero-Allocation AEAD & Constant-Time Helpers (\`libs/verrev-crypto/src/aead.rs\`, \`util.rs\`)**: Streaming \`Poly1305Ctx\` and \`GhashCtx\` structs avoid heap buffer copies across XChaCha20-Poly1305 and AES-256-GCM; comparisons use \`util::ct_eq\`, \`ct_select\`, and \`ct_swap\`.
- **Identity & Capabilities (\`libs/verrev-capability/src/lib.rs\`)**: \`Capability\` binds \`target: Identity\`, \`resource_hash = sha3_256(resource)\`, \`rights_mask: u64\`, and \`issuer: Identity\`, with overflow-safe custom right masks (\`4 + c.min(59)\`).

## Benchmarks & Verification

| Crate / Layer | Source Evidence | Measured Status |
| :--- | :--- | :--- |
| \`verrev-crypto\` (\`kyber.rs\`, \`dilithium.rs\`, \`aead.rs\`) | \`cargo test --workspace\` | **27 passing tests** (10 Kyber + 11 Dilithium + 6 AEAD) |
| \`verrev-hash\` + Layer 0-2 crates | \`sha3.rs\` KATs + identity/cap/fs/relay | **48 total passing tests across 7 active crates** |
| \`verrev-syscall\` (\`linux.rs\`, 186 lines) | Inline \`asm!\` \`getrandom\`, \`socket\`, \`mmap\` | Compiles cleanly; audited dead-code/errno improvements tracked in \`AGENTS.md\` |
| \`verrev-transport\`, \`p2p\`, \`mesh\`, \`sync\`, \`runtime\` | Structural stubs & trait boundaries | Explicit phase-0 stubs (\`WasmModule::compile\` checks \`\\0asm\` header only; \`MerkleTree::diff\` scans leaves) |

## Trade-Offs & Scope Caveats

- **Early-Stage Prototype, Not a Working OS**: \`verrev-mesh::MeshNode::route_message\` documents simulated direct routes, \`verrev-p2p\` lacks live UDP wire routing, and none of the \`apps/*\` binaries run a usable distributed desktop yet.
- **No Side-Channel Hardware Audit**: Keeping 100% pure Rust without \`ring\`, \`pqcrypto\`, or external crates guarantees supply-chain inspectability, but LLVM codegen has not been verified against constant-time assembly traces in a lab.`,
  },
  {
    id: 'GreenLens',
    name: 'GreenLens',
    displayName: 'GreenLens',
    subtitle: 'Native Rust Desktop App for Offline Crop Disease Identification',
    category: 'ml',
    categoryLabel: 'ML & Vision',
    featured: false,
    maturity: 'Verified',
    defaultBranch: 'master',
    htmlUrl: 'https://github.com/Sifr-Dev/GreenLens',
    primaryLanguage: 'Rust',
    languages: { Rust: 64998, Python: 47242, Nix: 2216, Dockerfile: 503, Shell: 10 },
    updatedAt: '2026-11-17T22:34:12Z',
    createdAt: '2026-10-16T19:54:13Z',
    stars: 0,
    forks: 0,
    summary:
      'Native Rust egui/eframe OpenGL desktop app communicating over JSON-lines stdio with a local TensorFlow VGG16 worker and committed SQLite treatment database across 15 crop disease classes.',
    proofMetric: '95.5% test accuracy · 0.95 macro F1 · offline Rust + SQLite',
    architectureNote:
      'Keeps inference non-blocking on a persistent Python child worker over stdin/stdout JSON-lines while surfacing confidence gauges, top ranked predictions, and cited extension guidance from diseases.db.',
    stack: ['Rust egui/eframe', 'TensorFlow VGG16', 'JSON-lines IPC', 'SQLite', 'Nix'],
    schematic: 'greenlens-cnn',
    codeExcerpt: `// Non-blocking JSON-lines IPC between Rust egui & Python VGG16 worker
{"image": "potato_late_blight.jpg"}
-> {"class": "Potato___Late_blight", "prob": 0.961}`,
    highlights: [
      { label: 'Held-Out Score', value: '95.5% acc / 0.95 macro F1 (3,095 imgs)' },
      { label: 'Dataset Split', value: '20,624 deduplicated imgs (70/15/15)' },
      { label: 'Treatment Data', value: 'Cited offline SQLite (NC State, ARC Egypt)' },
    ],
    deepDive: {
      problem:
        'Farmers and field technicians often lack reliable internet access when inspecting crop leaves and cannot rely on cloud-only inference APIs.',
      built:
        'A native OpenGL Rust egui desktop GUI, two-stage fine-tuned VGG16 Python worker over stdio JSON-lines, deduplicated dataset manifest, confusion matrix artifact, and cited SQLite guidance store.',
      approach:
        'Trained in two stages (frozen backbone head 10 epochs Adam 1e-3, then block5 fine-tune 6 epochs Adam 1e-5 with mixed_float16 and balanced class weights) across 15 Pepper, Potato, and Tomato classes.',
      mechanisms: [
        'Rust egui/eframe UI with crash-resilient worker health reporting',
        'Persistent Python Keras VGG16 process over non-blocking stdin/stdout JSON-lines',
        'Committed SQLite disease_info guidance referencing university & ARC Egypt sources',
      ],
      methodology:
        'Exact duplicate images removed before 70/15/15 stratified split (seed 42); evaluated on 3,095 held-out PlantVillage images in artifacts/test_report.json.',
      correctness: '95.5% accuracy and 0.95 macro F1 verified on held-out split.',
      tradeoffs:
        'README caveat explicitly notes PlantVillage contains controlled lab single-leaf photos and near-duplicates, so score measures controlled conditions rather than unconstrained field photography.',
    },
  },
  {
    id: 'tachyon-fetch',
    name: 'tachyon-fetch',
    displayName: 'tachyon-fetch',
    subtitle: 'Single-Process Linux System Fetch Engine & TUI Configurator',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: false,
    maturity: 'Verified',
    defaultBranch: 'main',
    htmlUrl: 'https://github.com/Sifr-Dev/tachyon-fetch',
    primaryLanguage: 'Rust',
    languages: { Rust: 302711, Shell: 5163, Python: 1209, Nix: 874, Makefile: 293 },
    updatedAt: '2026-10-20T20:55:00Z',
    createdAt: '2026-10-19T17:42:03Z',
    stars: 0,
    forks: 0,
    summary:
      'Cockpit-grade Rust system fetch binary and interactive ratatui configurator probing 25 OS and hardware surfaces (/proc, /sys, hwmon, DMI, optional NVML) in one pass with zero child forks.',
    proofMetric: '1.9 MB binary · 25 hardware modules · 0 child forks',
    architectureNote:
      'Eliminates shell-script process spawning by walking kernel virtual files and GPU telemetry interfaces in-process, paired with 6 themes and Kitty image protocol rendering.',
    stack: ['Rust', 'ratatui', 'NVML', '/proc + /sys', 'Kitty Protocol', 'Nix'],
    schematic: 'tachyon-deck',
    codeExcerpt: `// Direct kernel probe without subprocess forks
tachyon --theme Vantablack --modules os,kernel,cpu,gpu,memory`,
    highlights: [
      { label: 'Binary Footprint', value: '1.9 MB compiled release' },
      { label: 'Telemetry', value: '25 modules (/proc, /sys, DMI, NVML)' },
      { label: 'Interface', value: 'Interactive ratatui TUI + 6 themes' },
    ],
    deepDive: {
      problem:
        'Traditional shell-based fetch tools fork dozens of external processes just to display OS, CPU, memory, thermal, and GPU lines.',
      built:
        'Compiled Rust fetch CLI, 25 direct kernel/hardware collectors, Kitty graphics image pipeline, 6 curated color palettes with dark/light variants, and live ratatui layout configurator.',
      approach:
        'Gathers host, kernel, DMI, hwmon temps, disk, memory, and NVML GPU telemetry inside a single pass of direct file reads and native bindings.',
      mechanisms: [
        '25 kernel & hardware collectors reading /proc, /sys/class/hwmon, DMI, and NVML',
        'Zero external subprocess forks during telemetry sweep',
        'Interactive ratatui TUI configurator with instant config serialization',
      ],
      methodology: 'Reproducible release build & Nix flake packaging tested on Linux.',
      correctness: 'Unit and formatting tests across 25 collectors and config serializer.',
      tradeoffs: 'Specialized for Linux kernel interfaces and modern terminals supporting truecolor/Kitty graphics.',
    },
  },
  {
    id: 'subtorch',
    name: 'subtorch',
    displayName: 'subtorch',
    subtitle: 'Fused Triton & JAX GPU Kernels with Parity & Reproducibility Evidence',
    category: 'ml',
    categoryLabel: 'ML & Vision',
    featured: true,
    maturity: 'Verified',
    defaultBranch: 'main',
    htmlUrl: 'https://github.com/Sifr-Dev/subtorch',
    primaryLanguage: 'Python',
    languages: { Python: 30669 },
    updatedAt: '2026-11-18T11:40:00Z',
    createdAt: '2026-11-16T02:40:04Z',
    stars: 0,
    forks: 0,
    summary:
      'Hardware-aware ML systems engineering comparing unfused PyTorch, torch.compile Inductor, hand-written Triton fused kernels, and JAX JIT XLA (zero-copy DLPack) for RMSNorm and FlashAttention-style SDPA under explicit RTX 4060 CUDA event protocols.',
    proofMetric: '0.147 ms RMSNorm XLA (22.8x) · 0.617 ms Triton SDPA · 36 parity tests',
    architectureNote:
      'Refuses narrative spin: reports exact medians on NVIDIA RTX 4060 Laptop (compute 8.9) where XLA wins RMSNorm (0.147 ms vs Triton 0.311 ms), PyTorch causal SDPA beats Triton (0.372 ms vs 0.632 ms), and Triton edges out SDPA on bf16 non-causal (0.617 ms vs 0.627 ms).',
    stack: ['Python', 'Triton 3.9', 'JAX 0.12 XLA', 'PyTorch 2.15', 'CUDA Events', 'DLPack'],
    schematic: 'ml-tensor',
    codeExcerpt: `# RTX 4060 (10 warmup, 100 timed CUDA events, median):
# RMSNorm 4096x4096 fp16: Ref 3.360 ms | Inductor 0.318 ms | Triton 0.311 ms | XLA 0.147 ms
# Attn 4x16x1024x64 bf16: Ref 8.31 ms  | SDPA 0.627 ms    | Triton 0.617 ms`,
    highlights: [
      { label: 'RMSNorm Best', value: 'JAX XLA 0.147 ms fp16 (22.8x) / 0.173 ms fp32 (23.6x)' },
      { label: 'Attention Best', value: 'SDPA 0.372 ms causal fp16 · Triton 0.617 ms bf16' },
      { label: 'Verification', value: '36 pytest parity checks (fp32/fp16/bf16)' },
    ],
    deepDive: {
      problem:
        'Custom kernel repositories often cherry-pick easy baselines and hide cases where compiler stacks or vendor cuDNN paths actually outperform hand-written code.',
      built:
        'Hand-written Triton fused RMSNorm and online-softmax FlashAttention forward kernels, zero-copy DLPack JAX XLA harness, torch.compile Inductor comparison, reproducible CLI runners, and EVIDENCE.md.',
      approach:
        'Runs every kernel against identical input tensors (via DLPack for XLA) inside 10-warmup + 50/100 CUDA-event median loops and gates all results behind tolerance tests.',
      mechanisms: [
        'Fused Triton RMSNorm keeping row variance/normalization inside SRAM registers',
        'FlashAttention-style tiled online softmax forward kernel in Triton',
        'Zero-copy jax.dlpack.from_dlpack view comparisons against PyTorch SDPA & Inductor',
        '36 parameterized parity checks across fp32 (1e-5), fp16, and bf16 (2e-2)',
      ],
      methodology:
        'RTX 4060 Laptop (7.66 GiB, driver 620.70.06, PyTorch 2.15.0+cu132, Triton 3.9, JAX 0.12.0.1); kernel wall-clock time only via CUDA events.',
      correctness: 'pytest -q -> 36 parity checks covering numerical accuracy across fp32, fp16, and bf16.',
      tradeoffs:
        'Measured, not spun: XLA beats hand-written Triton on RMSNorm layout/vectorization, and cuDNN/CUTLASS SDPA beats Triton on causal fp16 & seq=2048/hd=128.',
    },
    engineeringDepthMarkdown: `## Architecture

\`subtorch\` compares custom GPU kernels side-by-side against compiler and vendor stacks on shared device memory with zero narrative spin:

- **Package Core (\`src/sifr_ml_systems/\`)**: Exposes unified RMSNorm implementations (\`rmsnorm.py\`, \`rmsnorm_torch.py\`, \`rmsnorm_triton.py\`, \`rmsnorm_jax.py\`), Attention kernels (\`attention.py\`, \`attention_triton.py\`), and \`bench.py\` (CUDA-event timer with CPU fallback).
- **Zero-Copy Interop**: JAX benchmarks exchange PyTorch CUDA tensors over \`jax.dlpack.from_dlpack\` without host round-trips.
- **Reproducibility Harness**: \`bench/compare_rmsnorm.py\` and \`bench/compare_attention.py\` back every number recorded in \`EVIDENCE.md\`.

## Implementation Details (Verified in Source)

- **Fused Triton RMSNorm (\`kernels/rmsnorm_triton.py\`)**: Launches one program per row (\`_rmsnorm_forward_kernel[(rows,)]\`) with \`BLOCK = triton.next_power_of_2(n_cols)\`. Loads row elements directly into \`tl.float32\`, fuses \`tl.sum(x * x) / n_cols\`, \`tl.rsqrt(mean_square + eps)\`, and weight scaling in SRAM registers before writing back in \`out_ptr.dtype.element_ty\`.
- **JAX / XLA RMSNorm (\`kernels/rmsnorm_jax.py\`)**: Compiles \`_rmsnorm_jax\` with \`jax.jit(..., static_argnums=(2,))\`, emitting a single fused XLA \`rsqrt\` kernel.
- **Online-Softmax FlashAttention (\`kernels/attention_triton.py\`)**: One program per \`(block_m, batch_head)\` tile carries running max \`m_i\`, denominator \`l_i\`, and \`acc\` purely in \`tl.float32\` registers across \`BLOCK_N\` KV blocks so \`QK^T\` never touches HBM. Handles causal masking (\`m_new == -inf -> 0.0\`) and toggles \`input_precision="ieee"\` on \`tl.dot\` so \`fp32\` parity passes cleanly without TF32 \`~1e-3\` error.

## Benchmarks & Verification (RTX 4060 Laptop, Compute 8.9)

\`\`\`bash
python -m bench.compare_rmsnorm --rows 4096 --cols 4096 --dtype float16 --backend all
python -m bench.compare_attention --batch 4 --heads 16 --seq 1024 --head-dim 64 --dtype float16 --backend all
\`\`\`

| Kernel & Shape | PyTorch / Ref | Triton Fused | \`torch.compile\` / SDPA | JAX \`jit\` (XLA) | Winner |
| :--- | ---: | ---: | ---: | ---: | :--- |
| RMSNorm \`4096x4096 fp16\` | \`3.360 ms\` | \`0.311 ms\` (10.8x) | \`0.318 ms\` (10.6x) | **\`0.147 ms\` (22.8x)** | JAX XLA |
| RMSNorm \`8192x4096 fp32\` | \`4.078 ms\` | \`1.203 ms\` (3.4x) | \`1.215 ms\` (3.4x) | **\`0.173 ms\` (23.6x)** | JAX XLA |
| Attn \`4x16x1024x64 fp16\` (non-causal) | \`9.25 ms\` | \`0.617 ms\` | **\`0.614 ms\`** | n/a | Parity (~1%) |
| Attn \`4x16x1024x64 bf16\` (non-causal) | \`8.31 ms\` | **\`0.617 ms\`** | \`0.627 ms\` | n/a | Triton Fused |
| Attn \`4x16x1024x64 fp16\` (causal) | \`12.92 ms\` | \`0.632 ms\` | **\`0.372 ms\`** | n/a | PyTorch SDPA |
| Attn \`2x8x2048x128 fp16\` (non-causal) | \`9.18 ms\` | \`1.613 ms\` | **\`1.245 ms\`** | n/a | PyTorch SDPA |

**Correctness (\`pytest -q\`)**: **36 / 36 tests passing** (\`test_rmsnorm_parity.py\` + \`test_attention_parity.py\`), checking \`fp32\` within \`1e-5\` and \`fp16\`/\`bf16\` within \`2e-2\`.

## Trade-Offs & Honest Scope

- **Compiler vs Hand-Written Kernels**: XLA beat the single-row Triton RMSNorm kernel across both tested shapes via better vectorization and memory scheduling, and PyTorch SDPA (cuDNN/CUTLASS) outperformed Triton on causal masks and \`head_dim = 128\`. Both outcomes are explicitly documented rather than spun.
- **Forward-Pass Scope**: Benchmarks cover forward passes via CUDA events (10 warmups, median of 50/100 runs); backward autograd kernels and multi-GPU collectives are intentionally out of scope.`,
  },
  {
    id: 'Cipher',
    name: 'Cipher',
    displayName: 'Cipher',
    subtitle: 'Zero-Dependency Linux Graphics & UI Framework in Zig 0.17.1',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: true,
    maturity: 'Verified',
    defaultBranch: 'main',
    htmlUrl: 'https://github.com/Sifr-Dev/Cipher',
    primaryLanguage: 'Zig',
    languages: { Zig: 505917, GLSL: 2573 },
    updatedAt: '2026-11-18T11:45:00Z',
    createdAt: '2026-11-16T02:52:22Z',
    stars: 0,
    forks: 0,
    summary:
      'Original Linux GPU UI framework written in Zig 0.17.1 with zero toolkit baggage: runtime-dlopen libwayland-client with generated wl_interface tables, dlopen Vulkan WSI swapchain (plus wl_shm software fallback), handwritten SFNT TrueType parser, R8 glyph atlas, and immediate-mode flexbox UI.',
    proofMetric: '505 KB Zig · 628 KB app binary · 0.031 ms/frame vs Qt6 0.925 ms',
    architectureNote:
      'Replaces the legacy reference wire client with dlopen("libwayland-client.so.0") + generated protocol tables (tools/gen_wayland_tables.py) and dlopen("libvulkan.so.1") validated across 114 struct offsets against C Vulkan headers.',
    stack: ['Zig 0.17.1', 'Wayland dlopen', 'Vulkan WSI', 'GLSL', 'SFNT/R8 Atlas'],
    schematic: 'wayland-ring',
    codeExcerpt: `// Immediate UI -> 2-pass flexbox -> SFNT R8 atlas -> VK_KHR_wayland_surface
// Fixed DR-001 (VkRenderPassBeginInfo offset) & ReleaseFast zero-init bases`,
    highlights: [
      { label: 'Window/Input', value: 'dlopen libwayland-client + generated wl_interface + xkb' },
      { label: 'GPU & Fallback', value: 'dlopen libvulkan (WSI) OR wl_shm CPU fallback' },
      { label: 'Release Fix', value: 'Zero-init bases fixed ReleaseFast (10/10 pass)' },
    ],
    deepDive: {
      problem:
        'Modern GUI frameworks pull 45 to 113 shared libraries, deep C++ object trees, and heavyweight build toolchains even for crisp, responsive desktop interfaces.',
      built:
        'A complete UI stack in Zig 0.17.1: Python generator emitting C-ABI wl_interface tables from XML protocols, runtime-dlopen Wayland/xkb/Vulkan bindings, SFNT TrueType parser (2,620 glyphs), scanline AA rasterizer, shelf-packed 1024x1024 R8 atlas, 2-pass flexbox, and immediate-mode widgets.',
      approach:
        'Keeps binaries self-contained linking only libc/libm/ld-linux and loading Wayland and Vulkan via dlopen on demand (falling back cleanly to wl_shm CPU rasterization if CIPHER_FORCE_SOFTWARE=1 or no ICD exists).',
      mechanisms: [
        'tools/gen_wayland_tables.py generating wl_interface tables for dlopen("libwayland-client.so.0")',
        '114 Vulkan extern struct offsets diffed verbatim against /usr/include/vulkan/vulkan.h (DR-001 fix)',
        'Custom SFNT cmap 4/12 + simple/composite glyf parser + scanline AA -> R8 1024x1024 GPU atlas',
        'Zero-initialized Runtime/GpuText/FramePipeline bases eliminating ReleaseFast stack-garbage segfaults',
      ],
      methodology:
        'Verified on umbriel compositor (RTX 4060 NVIDIA 620.70.06 & lavapipe) with GPU_FRAME_OK pixel check, GPU_TEXT_OK, WAYLAND_PROTOCOL_OK frames=24, and ReleaseFast 10/10 runs.',
      correctness: 'zig build test + ReleaseFast 10/10 + ReleaseSafe 3/3 + Debug passing.',
      tradeoffs:
        'GPU mode shares NVIDIA Vulkan driver ~270–325 MB RSS floor; Cipher does not yet implement HarfBuzz complex script shaping, IME, or AT-SPI accessibility.',
    },
    engineeringDepthMarkdown: `## Architecture

\`Cipher\` is a self-contained native Linux UI & graphics stack (~7,495 core Zig lines + GLSL shaders) requiring zero C/C++ build-time SDK headers (\`libwayland-client-dev\`, \`libvulkan-dev\`, \`freetype\`, \`gtk4\`, \`qt6\`):

- **OS & Window Layer (\`src/os/linux/wayland/\`, \`tools/gen_wayland_tables.py\`)**: Generates static C-ABI \`wl_interface\` descriptors directly from Wayland XML protocols and dynamically binds \`libwayland-client.so.0\` via \`dlopen()\`.
- **Runtime & Event Loop (\`src/framework/runtime.zig\`, 1,153 lines)**: Drives frame pacing, \`xkb\` keyboard/pointer routing, immediate-mode UI ticks, and dual GPU/software presentation backends.
- **UI & Text Engine (\`src/ui/\`, \`src/ui/text/\`)**: Immediate-mode widget toolkit (\`ui.zig\`, \`widgets.zig\`, \`layout.zig\`) backed by a from-zero TrueType rasterizer (\`font.zig\`, \`raster.zig\`, \`atlas.zig\`).

## Implementation Details (Verified in Source)

- **Handwritten Vulkan Pipeline (\`src/gpu/vulkan/\`)**: \`loader.zig\` (122 lines) opens \`libvulkan.so.1\`; \`device.zig\` (1,318 lines), \`frame.zig\` (536 lines), \`swapchain.zig\` (478 lines), and \`text.zig\` (941 lines, \`MAX_QUADS = 65536\`) batch UI rectangles and glyph quads into device-local \`R8\` textures, presenting via \`VK_KHR_wayland_surface\` or offscreen \`vkCmdCopyImageToBuffer\` BGRA readback into \`wl_shm\`.
- **SFNT TrueType Parser & Rasterizer (\`font.zig\` 420 lines, \`raster.zig\` 189 lines, \`atlas.zig\` 267 lines)**: Parses \`cmap\` format 4/12 and simple/composite \`glyf\` contours, flattens quadratic Beziers adaptively, and runs nonzero-winding scanline fill with \`SS = 4\` vertical subsamples (\`0..255\` coverage) into a \`1024x1024\` R8 atlas.
- **Root-Caused Bugs Resolved**: Fixed \`VkRenderPassBeginInfo\` / Vulkan enum constants flagged by Khronos validation layers (\`DR-001\`, 114 struct offsets checked against C headers), and eliminated \`ReleaseFast\` segfaults by zero-initializing \`Runtime\`, \`GpuText\`, and \`FramePipeline\` base structs (\`core/types.zig\`, \`gpu/vulkan/zero.zig\`).

## Benchmarks & Verification (Ryzen 7 7435HS + RTX 4060, \`CipherDesk/bench/BENCH.md\`)

| Stack | Stripped Binary | Shared Libs (\`ldd\`) | 105-Ctrl CPU \`onFrame\` | RSS Footprint |
| :--- | ---: | ---: | ---: | :--- |
| **Cipher (software \`wl_shm\`)** | **628 KB** | **3-4 (\`libc/m/dl\`)** | **0.030-0.032 ms** | **23.4 MB** |
| **Cipher (Vulkan GPU)** | **628 KB** | **4 (+ \`dlopen\`)** | **0.031-0.035 ms** | ~269-325 MB (NV driver floor) |
| Qt6 Reference | 49 MB + deps | 45 libs | 0.925-0.950 ms (\`QWidget::render\`) | 38.6-40.4 MB |
| GTK4 / Cairo Ref | ~294-305 MB | 113 libs | 1.086-1.197 ms (cairo lower bound) | ~18.6 MB (cairo) / ~294 MB (gtk4) |

**Stability**: Debug, \`ReleaseSafe\` (3/3), \`ReleaseFast\` (10/10 runs \`WAYLAND_PROTOCOL_OK\`), and \`zig build test\` all pass.

## Trade-Offs & Scope Caveats

- **Apple-to-Apples Boundary**: \`onFrame\` measures declaration + 2-pass flexbox layout + quad emission (excluding \`~0.020 ms\` SHM blit, so total CPU paint is \`~0.05 ms\`, still ~18x faster than Qt6 offscreen CPU repaint).
- **Driver Allocation Floor**: Vulkan GPU RSS (~270-325 MB) is dominated by the NVIDIA Vulkan ICD floor on Linux, not Zig heap allocations.
- **Omitted Desktop Platform Features**: Deliberately excludes HarfBuzz complex script shaping, IME input methods, AT-SPI accessibility bridges, and printing subsystems that Qt6/GTK4 ship out of the box.`,
  },
  {
    id: 'CipherDesk',
    name: 'CipherDesk',
    displayName: 'CipherDesk',
    subtitle: 'Native Vulkan Apps on Cipher: janus, rex & nocturne',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: true,
    maturity: 'Verified',
    defaultBranch: 'master',
    htmlUrl: 'https://github.com/Sifr-Dev/CipherDesk',
    primaryLanguage: 'Zig',
    languages: { Zig: 84380, 'C++': 4134, Shell: 2983, C: 2379 },
    updatedAt: '2026-11-18T11:50:00Z',
    createdAt: '2026-11-17T18:05:51Z',
    stars: 0,
    forks: 0,
    summary:
      'Daily-driver desktop suite built as a pure path dependency on Cipher linking only libc: janus (flagship GPU terminal replacing old cipherterm), rex (framework multiplexer engine), and nocturne (offline bit-exact FLAC music player).',
    proofMetric: '628 KB binary · 4 linked libs · 0.031 ms/frame (30x vs Qt6 offscreen)',
    architectureNote:
      'Each executable depends solely on libc and dlopen() at runtime. Ships bench/BENCH.md comparing identical 120-frame startup and 105-control heavy UI redraws head-to-head against Qt6 and GTK4 on the same hardware.',
    stack: ['Zig', 'Cipher UI', 'Vulkan', 'Unix Socket IPC', 'Bit-Exact FLAC'],
    schematic: 'vulkan-apps',
    codeExcerpt: `janus    -> flagship GPU terminal (tabs, panes, themes, live RSS; replaces cipherterm)
rex      -> Unix-socket multiplexer engine folded in-process
nocturne -> from-zero FLAC decoder (LRC/Vorbis lyrics, crossfade, PulseAudio dlopen)`,
    highlights: [
      { label: 'janus Terminal', value: 'Flagship GPU terminal with built-in panes & tabs' },
      { label: 'nocturne Audio', value: 'Bit-exact FLAC vs flac/ffmpeg + LRC/Vorbis' },
      { label: 'Same-Box Bench', value: '0.030–0.035 ms onFrame vs Qt6 0.925 ms' },
    ],
    deepDive: {
      problem:
        'A UI framework only proves its layout, text rendering, event loop, and swapchain pacing when used inside real multi-pane terminal and audio-streaming desktop applications.',
      built:
        'Three standalone Zig executables on Cipher (janus terminal, rex multiplexer engine, nocturne offline FLAC player) plus bench-hello / Qt6 / GTK4 same-hardware benchmark harness.',
      approach:
        'Unifies multiplexing inside Janus using the rex Unix-socket JSON-lines engine while nocturne implements full native FLAC decoding, Vorbis synced lyrics, and dlopen PulseAudio-simple output.',
      mechanisms: [
        'janus: flagship terminal (formerly cipherterm) with void/paper/ember themes, pane splits & live RSS',
        'rex: JSON-lines 0600 Unix-socket multiplexer engine (spawn, split, scrollback, attach)',
        'nocturne: bit-exact FLAC decoder verified on 6 fixtures, sample-exact crossfade, 5.000000s offline WAV',
        'bench/BENCH.md: 105-control CPU redraw & stripped 628 KB vs Qt6 45 libs / GTK4 113 libs',
      ],
      methodology:
        'Same machine (Ryzen 7 7435HS + RTX 4060): stripped hello 1046–1099 ms vs Qt6 1966–1976 ms; software SHM 23.4 MB RSS (3 mappings) vs Qt6 offscreen 38.6–39.0 MB (45 libs); 105-control onFrame 0.030–0.032 ms vs Qt6 QWidget::render 0.925–0.950 ms.',
      correctness: 'janus WAYLAND_PROTOCOL_OK frames=30/40; nocturne live exit 0 + bit-exact FLAC decode across 6 fixtures.',
      tradeoffs:
        'GPU RSS reflects NVIDIA Vulkan driver floor (~269–325 MB); Qt/GTK retain broad widget sets, printing, HarfBuzz shaping, and AT-SPI accessibility.',
    },
    engineeringDepthMarkdown: `## Architecture

\`CipherDesk\` compiles daily-driver Linux desktop executables directly atop \`Cipher\` via a pure Zig path dependency (\`build.zig\`), proving the UI runtime under real VT/PTY streaming, Unix-socket IPC, and audio decode workloads:

- **\`apps/janus.zig\`**: Flagship GPU-native terminal emulator (replacing older \`cipherterm\`) attaching to PTY panes, mirroring VT streams into \`Grid\` buffers, and submitting cell quads via \`MAX_QUADS = 65536\`.
- **\`apps/rex.zig\`**: Lightweight Unix-socket (\`0600\`) JSON-lines multiplexer engine managing pane spawn, splits, scrollback, and client re-attach.
- **\`apps/nocturne.zig\`**: Offline-only music player built with a from-zero FLAC decoder, \`LRC\` / Vorbis lyrics parser, sample-exact crossfader, and \`dlopen()\` PulseAudio output (PipeWire compatible).
- **\`bench/\`**: Same-hardware comparison binaries (\`bench_hello.zig\`, \`bench_qt.cpp\`, \`bench_gtk.c\`, \`bench_gtk_cairo.c\`).

## Implementation Details (Verified in Source)

- **Janus GPU Terminal**: Supports live theme switching (\`void\`, \`paper\`, \`ember\`), Kitty graphics frames, follow-scrollback mode, clipboard drag selection, and live process RSS telemetry in the status bar.
- **Nocturne Audio Pipeline**: Decodes lossless FLAC bitstreams in pure Zig with zero libFLAC dependency and outputs via \`dlopen("libpulse-simple.so.0")\` or deterministic offline WAV rendering (\`--render-wav OUT.wav\`).

## Benchmarks & Verification

- **120-Frame Startup + Teardown (Same Machine)**: Stripped ReleaseSafe \`cipher-hello\` completes in \`1.046-1.099 s\` (~46% faster than Qt6 \`1.966-1.976 s\` and GTK4 \`2.095-2.104 s\`).
- **Audio & Protocol Checks**: \`nocturne\` achieves bit-exact PCM parity vs \`flac\`/\`ffmpeg\` across 6 fixtures with \`5.000000s\` offline WAV duration accuracy; \`janus\` passes \`WAYLAND_PROTOCOL_OK\` compositor frame sweeps.

## Trade-Offs & Scope Caveats

- Same caveats as \`Cipher\`: GPU mode inherits the NVIDIA ICD ~269-325 MB RSS baseline, while \`CIPHER_FORCE_SOFTWARE=1\` runs at \`23.4 MB\` RSS with 3 library mappings (\`libc\`, \`ld-linux\`, \`vdso\`).
- GTK4 widget-tree snapshot rendering (\`GskRenderNode\`) segfaulted on the benchmark host GPU/compositor, so \`bench/BENCH.md\` marks full GTK4 heavy-scene DOM repaint as "not run" and compares \`bench_gtk_cairo\` as an explicit lower bound.`,
  },
  {
    id: 'wireprobe',
    name: 'wireprobe',
    displayName: 'wireprobe',
    subtitle: 'Zero-Dependency TCP & HTTP Latency Prober in C++17',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    maturity: 'Verified',
    defaultBranch: 'master',
    htmlUrl: 'https://github.com/Sifr-Dev/wireprobe',
    primaryLanguage: 'C++',
    languages: { 'C++': 5056, Makefile: 158 },
    updatedAt: '2026-11-17T19:08:13Z',
    createdAt: '2026-11-17T19:08:07Z',
    stars: 0,
    forks: 0,
    summary:
      'A ~150-line C++17 TCP connect RTT and HTTP first-byte latency prober over raw POSIX sockets emitting min, p50, p90, p99, max, and mean statistics in human text or JSON.',
    proofMetric: '~150 lines C++17 · 0.073 ms p50 connect · 0 external deps',
    architectureNote:
      'Uses POSIX getaddrinfo and monotonic high-resolution clocks to isolate raw TCP handshake time cleanly from HTTP server TTFB.',
    stack: ['C++17', 'POSIX Sockets', 'Percentiles', 'JSON Output'],
    schematic: 'sifr-probe',
    codeExcerpt: `$ ./wireprobe 127.0.0.1:8899 --http
connect    p50 0.073  p99 0.076 ms
first_byte p50 2.021  p99 5.321 ms`,
    highlights: [
      { label: 'Footprint', value: '~150 lines C++17 (libc only)' },
      { label: 'Metrics', value: 'TCP handshake + HTTP TTFB percentiles' },
      { label: 'Output', value: 'Human text table or --json' },
    ],
    deepDive: {
      problem:
        'Debugging tail latency requires separating transport TCP handshake time from application response generation without heavy curl/Boost dependencies.',
      built: 'Single-binary C++17 POSIX socket prober with text and machine-readable JSON output.',
      approach: 'Times connect() and recv() first byte using steady_clock across N sequential probes.',
      mechanisms: [
        'Raw POSIX socket connect() and non-buffered HTTP request header dispatch',
        'Percentile calculator emitting min, p50, p90, p99, max, mean',
      ],
      methodology: 'Measured loopback probe p50 0.073 ms connect / p50 2.021 ms HTTP TTFB.',
      correctness: 'Builds cleanly with g++ -O2 -std=c++17 and verified against local test HTTP endpoints.',
      tradeoffs: 'Plain TCP + HTTP/1.1 without full TLS termination.',
    },
  },
  {
    id: 'rowscan',
    name: 'rowscan',
    displayName: 'rowscan',
    subtitle: 'Streaming Zero-Crate CSV Query Engine in Rust',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    maturity: 'Verified',
    defaultBranch: 'master',
    htmlUrl: 'https://github.com/Sifr-Dev/rowscan',
    primaryLanguage: 'Rust',
    languages: { Rust: 11053 },
    updatedAt: '2026-11-17T19:54:05Z',
    createdAt: '2026-11-17T19:53:59Z',
    stars: 0,
    forks: 0,
    summary:
      'Zero-dependency ~350-line Rust streaming CSV engine supporting filter predicates, column selection, group-by aggregates (count/sum/avg/min/max), and top-N sorting directly from files or stdin.',
    proofMetric: '~350 lines Rust · ~2M rows/s (0.080s / 100k rows) · 0 crates',
    architectureNote:
      'Processes quoted RFC 4180 CSV records row-by-row in bounded memory instead of loading multi-megabyte tables into dataframe heaps.',
    stack: ['Rust', 'Streaming Parser', 'Group-By', 'Markdown Output'],
    schematic: 'sifr-query',
    codeExcerpt: `rowscan data.csv filter country = ke
rowscan data.csv group-by plan count
rowscan data.csv top 10 age`,
    highlights: [
      { label: 'Throughput', value: '0.080s on 100,000 rows (~2M rows/s)' },
      { label: 'Aggregates', value: 'count / sum / avg / min / max + Markdown' },
      { label: 'Tests', value: '4 Rust tests passing · 0 crates' },
    ],
    deepDive: {
      problem:
        'Quick terminal checks on CSV exports shouldn’t wait seconds for Python/pandas interpreter startup or allocate huge dataframe buffers.',
      built:
        'Single-file ~350-line pure Rust CSV parser & query evaluator with filter, select, group-by, top-N, and Markdown table formatter.',
      approach: 'Streams records linearly from BufReader and accumulates group aggregates in Rust std collections.',
      mechanisms: [
        'RFC 4180 quoted-field scanner with escaped quote handling',
        'Streaming filter & column projection without materializing full tables',
        'Count/sum/avg/min/max hash aggregation & aligned Markdown table formatting',
      ],
      methodology: 'Timed 100,000-row CSV scan completing in 0.080s real.',
      correctness: '4 unit tests passing across quoting, filtering, grouping, and sorting.',
      tradeoffs: 'Built for single-table scans rather than multi-table joins.',
    },
  },
  {
    id: 'sha-zero',
    name: 'sha-zero',
    displayName: 'sha-zero',
    subtitle: 'FIPS 180-4 SHA-256 Hasher in C++17 (Zero OpenSSL)',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: false,
    maturity: 'Verified',
    defaultBranch: 'master',
    htmlUrl: 'https://github.com/Sifr-Dev/sha-zero',
    primaryLanguage: 'C++',
    languages: { 'C++': 5611 },
    updatedAt: '2026-11-17T20:05:45Z',
    createdAt: '2026-11-17T20:05:39Z',
    stars: 0,
    forks: 0,
    summary:
      'Zero-dependency FIPS 180-4 SHA-256 implementation in C++17 hashing arbitrary files or streaming stdin with built-in KAT vector verification matching sha256sum byte for byte.',
    proofMetric: 'FIPS 180-4 selftest · exact match vs sha256sum · 0 crypto libs',
    architectureNote:
      'Implements 512-bit big-endian padding, 64-word message schedule expansion, and sigma/ch/maj compression rounds cleanly in standard C++17.',
    stack: ['C++17', 'FIPS 180-4', 'SHA-256', 'KAT Vectors'],
    schematic: 'sifr-crypt',
    codeExcerpt: `$ ./sha-zero sha256 --selftest
SHA256_SELFTEST PASS`,
    highlights: [
      { label: 'Standard', value: 'FIPS 180-4 verified' },
      { label: 'Parity', value: 'Matches coreutils sha256sum' },
      { label: 'Dependencies', value: '0 linked libraries' },
    ],
    deepDive: {
      problem:
        'Verify exact cryptographic digest behavior and endian padding rules without wrapping OpenSSL.',
      built: 'Standalone C++17 SHA-256 streaming engine with file/stdin CLI and built-in FIPS 180-4 self-test.',
      approach: 'Processes fixed 64-byte blocks with streaming bit-length accounting and zero heap churn.',
      mechanisms: [
        'Exact FIPS 180-4 64-round compression function & initial hash constants',
        'Streaming stdin (`-`) and multi-file digest matching GNU sha256sum output format',
      ],
      methodology: 'Verified against empty string, "abc", 448-bit boundary vectors, and system sha256sum.',
      correctness: '--selftest passes built-in Known Answer Tests.',
      tradeoffs: 'Scalar portable C++ implementation rather than SHA-NI intrinsics.',
    },
  },
  {
    id: 'glyphmd',
    name: 'glyphmd',
    displayName: 'glyphmd',
    subtitle: 'Single-Pass Markdown to ANSI Terminal Renderer in Rust',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    maturity: 'Verified',
    defaultBranch: 'master',
    htmlUrl: 'https://github.com/Sifr-Dev/glyphmd',
    primaryLanguage: 'Rust',
    languages: { Rust: 11638 },
    updatedAt: '2026-11-17T20:20:32Z',
    createdAt: '2026-11-17T20:20:26Z',
    stars: 0,
    forks: 0,
    summary:
      'Single-pass UTF-8 Markdown to ANSI terminal renderer in ~350 lines of Rust formatting headings, fences, lists, blockquotes, links, and inline emphasis with zero regex or parser crates.',
    proofMetric: '~350 lines Rust · 7 passing tests · 0 regex / 0 crates',
    architectureNote:
      'Scans lines and inline UTF-8 codepoints deterministically in one linear pass styled with SIFR #659eff accent highlights.',
    stack: ['Rust', 'ANSI Escapes', 'UTF-8 Wrap', 'Single-Pass'],
    schematic: 'sifr-md',
    codeExcerpt: `glyphmd README.md
cat notes.md | glyphmd --width 80`,
    highlights: [
      { label: 'Parser', value: 'Single-pass state machine (0 regex)' },
      { label: 'Styling', value: 'UTF-8 ANSI 256 + SIFR accent palette' },
      { label: 'Tests', value: '7 unit tests passing' },
    ],
    deepDive: {
      problem:
        'Reading raw Markdown READMEs in SSH sessions or minimal terminals is noisy without a fast, zero-dependency formatter.',
      built: '~350-line Rust CLI rendering structured headings, nested lists, code blocks, quotes, and inline styles.',
      approach: 'Line-state tracker plus UTF-8-aware ANSI-skipping word wrapper.',
      mechanisms: [
        'ANSI escape-aware UTF-8 column wrapper preserving visual alignment',
        'Fenced code block highlighting and blockquote bars',
      ],
      methodology: 'Tested across headings, tables, code fences, and multi-byte UTF-8 text.',
      correctness: '7 Rust unit tests passing with cargo test.',
      tradeoffs: 'Targets clean terminal reading over full GFM AST HTML emission.',
    },
  },
  {
    id: 'huffstream',
    name: 'huffstream',
    displayName: 'huffstream',
    subtitle: 'RFC 1951 DEFLATE & Gzip Decompressor in Pure Rust',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: false,
    maturity: 'Verified',
    defaultBranch: 'master',
    htmlUrl: 'https://github.com/Sifr-Dev/huffstream',
    primaryLanguage: 'Rust',
    languages: { Rust: 12627 },
    updatedAt: '2026-11-17T20:28:04Z',
    createdAt: '2026-11-17T20:27:57Z',
    stars: 0,
    forks: 0,
    summary:
      'From-scratch RFC 1951 DEFLATE and RFC 1952 gzip decompressor in pure Rust decoding stored, fixed, and dynamic Huffman blocks with a 32 KiB sliding window and full CRC-32 validation.',
    proofMetric: '21 byte-exact fixtures vs zcat + 3 release tests · 0 zlib',
    architectureNote:
      'Constructs canonical Huffman code tables bit-by-bit including RLE code-length trees, copies LZ77 back-references cleanly across a 32 KiB window, and checks CRC-32 + ISIZE trailers.',
    stack: ['Rust', 'RFC 1951 DEFLATE', 'RFC 1952 Gzip', 'CRC-32'],
    schematic: 'sifr-inflate',
    codeExcerpt: `huffstream archive.gz out.bin
// Dynamic Huffman + 32 KiB LZ77 window + CRC-32 trailer check`,
    highlights: [
      { label: 'Block Modes', value: 'Stored, Fixed & Dynamic Huffman' },
      { label: 'Parity Suite', value: '21 byte-exact fixtures vs zcat' },
      { label: 'Integrity', value: 'CRC-32 + ISIZE verification' },
    ],
    deepDive: {
      problem:
        'Understand canonical Huffman bitstreams, LZ77 window back-references, and gzip framing by writing the entire decoder without linking zlib or flate2.',
      built:
        'LSB-first bit reader, canonical Huffman tree decoder, 32 KiB ring back-reference engine, and CRC-32/ISIZE validator.',
      approach: 'Strictly checks malformed trees, out-of-window distances, and checksum mismatches.',
      mechanisms: [
        'Dynamic Huffman code-length alphabet decoding (CLEN / HLIT / HDIST)',
        '32 KiB LZ77 overlapping distance/length byte copy loop',
        'IEEE 802.3 CRC-32 checksum and modulo-2^32 ISIZE check',
      ],
      methodology: 'Cross-checked against system zcat on empty, text, UTF-8, binary, and 160 KB files across levels 1, 6, 9.',
      correctness: '21 byte-exact fixtures vs zcat + 3 release build checks pass.',
      tradeoffs: 'Decompression only; omits deflate compression encoder.',
    },
  },
  {
    id: 'hunkdiff',
    name: 'hunkdiff',
    displayName: 'hunkdiff',
    subtitle: 'Unified Line Diff Using Dynamic Programming LCS in Rust',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: false,
    maturity: 'Verified',
    defaultBranch: 'master',
    htmlUrl: 'https://github.com/Sifr-Dev/hunkdiff',
    primaryLanguage: 'Rust',
    languages: { Rust: 6932 },
    updatedAt: '2026-11-17T20:34:38Z',
    createdAt: '2026-11-17T20:34:29Z',
    stars: 0,
    forks: 0,
    summary:
      'Zero-dependency unified line diff engine in Rust computing dynamic programming Longest Common Subsequence with 3-line hunk framing, >6-line gap splitting, and explicit n*m > 64M cell protection.',
    proofMetric: 'Byte-identical hunks vs GNU diff -u · 3 fixtures · OOM guard',
    architectureNote:
      'Refuses pathological quadratic DP matrices exceeding 64 million cells rather than silently exhausting memory, while matching GNU diff -u exit codes (0 identical, 1 differs, 2 error).',
    stack: ['Rust', 'LCS DP', 'Unified Hunks', 'POSIX Exit Codes'],
    schematic: 'sifr-diff',
    codeExcerpt: `$ hunkdiff file_a.txt file_b.txt
@@ -2,7 +2,7 @@
-old line
+new line`,
    highlights: [
      { label: 'Algorithm', value: 'DP Longest Common Subsequence' },
      { label: 'Parity', value: 'Byte-identical hunks vs diff -u (3 fixtures)' },
      { label: 'Guardrail', value: 'Rejects DP matrix > 64M cells cleanly' },
    ],
    deepDive: {
      problem:
        'Implement exact unified diff hunk clustering and exit semantics cleanly without diff crates or unbounded DP memory blowups.',
      built: 'Pure Rust LCS edit script solver, 3-line context hunk builder, stdin comparison (`-`), and cell-count guard.',
      approach: 'Backtracks optimal LCS edit sequence, groups edits separated by <= 6 context lines, and matches POSIX exit codes.',
      mechanisms: [
        'Dynamic programming LCS table with explicit 64M cell guardrail (exit 2)',
        'Standard @@ -start,len +start,len @@ hunk merger',
      ],
      methodology: 'Verified byte-identical hunk bodies against GNU diff -u across 3 regression fixtures.',
      correctness: 'All fixture comparisons pass with exact hunk output and exit codes 0/1/2.',
      tradeoffs: 'Quadratic DP table prioritizes exact clarity within the 64M cell budget rather than Myers linear space.',
    },
  },
  {
    id: 'barehttp',
    name: 'barehttp',
    displayName: 'barehttp',
    subtitle: 'Zero-Dependency HTTP/1.1 Static File Server in Rust',
    category: 'infra',
    categoryLabel: 'Backend & Infra',
    featured: false,
    maturity: 'Verified',
    defaultBranch: 'master',
    htmlUrl: 'https://github.com/Sifr-Dev/barehttp',
    primaryLanguage: 'Rust',
    languages: { Rust: 8518 },
    updatedAt: '2026-11-17T21:40:02Z',
    createdAt: '2026-11-17T21:39:56Z',
    stars: 0,
    forks: 0,
    summary:
      'Minimal thread-per-connection HTTP/1.1 static file server in pure Rust over TcpListener supporting GET/HEAD, MIME lookup, 304 If-Modified-Since caching, 405 method guards, and canonicalized traversal protection.',
    proofMetric: 'Raw TcpListener · 304 conditional · canonical root guard · 0 crates',
    architectureNote:
      'Decodes URL percent paths, canonicalizes target paths against the root directory to reject symlink/dot-dot traversal with 403, and answers conditional requests cleanly.',
    stack: ['Rust', 'HTTP/1.1', 'TcpListener', '304 Caching'],
    schematic: 'sifr-serve',
    codeExcerpt: `$ barehttp ./dist --port 8080
// GET/HEAD, 304 If-Modified-Since, 405 non-GET, traversal guard`,
    highlights: [
      { label: 'Methods', value: 'GET / HEAD (405 on others)' },
      { label: 'Caching & Safety', value: '304 If-Modified-Since + root guard' },
      { label: 'Dependencies', value: 'Rust stdlib only' },
    ],
    deepDive: {
      problem:
        'Static site serving is an ideal testbed for raw HTTP/1.1 framing, safe filesystem canonicalization, and conditional HTTP caching without async runtime bloat.',
      built: 'Pure std::net::TcpListener HTTP/1.1 static server in Rust.',
      approach: 'Parses request line and headers safely, enforces strict root prefix containment after canonicalization, and emits RFC HTTP status headers.',
      mechanisms: [
        'Percent-decode + fs::canonicalize traversal guard returning 403 Forbidden',
        '304 Not Modified response handling via If-Modified-Since timestamp checks',
        '405 Method Not Allowed for unsupported HTTP verbs',
      ],
      methodology: 'Tested via curl/HTTP scripts against normal files, directory indexes, traversal vectors, and conditional headers.',
      correctness: 'Passes integration checks covering 200/304/403/404/405 status handling.',
      tradeoffs: 'Thread-per-connection without TLS; intended for local serving or behind a reverse proxy.',
    },
  },
  {
    id: 'SIFR',
    name: 'SIFR',
    displayName: 'SIFR',
    subtitle: 'Engineering Portfolio, Two-Layer Dossiers & 24-Cell Physics Canvas',
    category: 'systems',
    categoryLabel: 'Systems & Kernel',
    featured: false,
    maturity: 'Verified',
    defaultBranch: 'main',
    htmlUrl: 'https://github.com/Sifr-Dev/SIFR',
    primaryLanguage: 'TypeScript',
    languages: { TypeScript: 224937, CSS: 3268, HTML: 1277 },
    updatedAt: '2026-11-18T11:55:00Z',
    createdAt: '2026-11-16T23:59:36Z',
    stars: 0,
    forks: 0,
    summary:
      'This site. Combines immediate two-layer engineering dossiers, keyboard-accessible filtering across all 20 Sifr-Dev repositories, hardware benchmark tables, Recharts contribution timelines, interactive system simulations, and a spring-damped 24-cell polar cipher story canvas.',
    proofMetric: '20 synchronized systems · interactive labs · 0% idle canvas CPU',
    architectureNote:
      'Spring physics & scroll-velocity motion blur loops run on demand and halt completely at equilibrium; Express backend caches live GitHub telemetry and handles signal dispatch.',
    stack: ['TypeScript', 'React 19', 'Canvas 2D', 'Recharts', 'Express'],
    schematic: 'sifr-cipher',
    codeExcerpt: `const decoded = decodeRingAtShift(normalizeShift(shift));
// shift === 0 locks SIFR calibration ring`,
    highlights: [
      { label: 'Search & Depth', value: 'Keyboard / search + Layer A/B dossiers' },
      { label: 'Canvas Engine', value: '24-cell spring dial + story scroll rail' },
      { label: 'Backend', value: 'Express GitHub sync + Resend signal API' },
    ],
    deepDive: {
      problem:
        'Technical portfolios either dump plain uninformative card lists or hide substantive engineering behind slow scroll-only animations.',
      built:
        'A dual-access portfolio featuring immediate architectural overviews, flagship benchmark evidence tables, keyboard-accessible language/category search across all 20 repos, deep-dive simulations, and the interactive SIFR chronicle canvas.',
      approach:
        'Decouples pure logic (cipher physics, heap coalescing, RESP2 execution, scroll motion blur, filtering) into tested TypeScript modules while keeping animation loops demand-driven.',
      mechanisms: [
        '24-cell Alberti cipher dial settling via spring-damper physics to 0 idle RAF ticks',
        'Keyboard / filter engine across programming languages, categories, and stack keywords',
        'Recharts 12-month commit frequency timeline + WebAssembly/WebGL2/CPU repository demos',
      ],
      methodology: 'Verified via node:test unit suite, tsc --noEmit, vite build, and headless Chromium Playwright checks.',
      correctness: 'Full TypeScript + unit test + desktop/mobile Playwright UI verification passing.',
      tradeoffs: 'Maintains cached snapshot fallback when GitHub unauthenticated REST rate limits occur on cloud IPs.',
    },
  },
];

export function findRepoByIdOrAlias(rawId: string): RepoSpec | undefined {
  const canonical = resolveCanonicalRepoId(rawId).toLowerCase();
  return REPOSITORIES.find(
    (r) =>
      r.id.toLowerCase() === canonical ||
      r.name.toLowerCase() === canonical ||
      r.name.toLowerCase() === rawId.trim().toLowerCase()
  );
}

export const INITIAL_ACTIVITY: GitHubActivityItem[] = [
  {
    id: 'ev-Cipher',
    type: 'PushEvent',
    repo: 'Cipher',
    createdAt: '2026-11-18T11:45:00Z',
    actionLabel: 'Verified dlopen Wayland tables, Vulkan WSI swapchain & ReleaseFast zero-init fix in Cipher',
  },
  {
    id: 'ev-CipherDesk',
    type: 'PushEvent',
    repo: 'CipherDesk',
    createdAt: '2026-11-18T11:50:00Z',
    actionLabel: 'Updated janus GPU terminal, rex multiplexer engine & nocturne FLAC player with Qt6/GTK4 benchmarks',
  },
  {
    id: 'ev-subtorch',
    type: 'PushEvent',
    repo: 'subtorch',
    createdAt: '2026-11-18T11:40:00Z',
    actionLabel: 'Recorded 4-backend RMSNorm & FlashAttention SDPA benchmarks with 36 parity tests',
  },
  {
    id: 'ev-verrev',
    type: 'PushEvent',
    repo: 'verrev',
    createdAt: '2026-11-18T11:30:00Z',
    actionLabel: 'Documented 8-layer crate matrix and 48 passing workspace tests in verrev',
  },
  {
    id: 'ev-mizan',
    type: 'PushEvent',
    repo: 'mizan',
    createdAt: '2026-11-18T11:20:00Z',
    actionLabel: 'Hardened purpose-bound HS256 family rotation & fixed-window Redis limiter in mizan',
  },
  {
    id: 'ev-SIFR',
    type: 'PushEvent',
    repo: 'SIFR',
    createdAt: '2026-11-18T11:55:00Z',
    actionLabel: 'Synchronized SIFR portfolio across Sifr-Dev with two-layer technical dossiers',
  },
];

export const ZERO_DOCTRINES = [
  {
    index: '01',
    title: 'zero-dependency',
    body: 'Own the stack. No heavyweight toolkit where explicit systems code stays clearer.',
  },
  {
    index: '02',
    title: 'zero-copy, zero-cost',
    body: 'Performance is measured with warmups and medians, never claimed without hardware context.',
  },
  {
    index: '03',
    title: 'zero-trust, zero-lock-in',
    body: 'Explicit session boundaries, post-quantum primitives, and inspectable protocols.',
  },
  {
    index: '04',
    title: 'zero-downtime',
    body: 'Reproducible builds, explicit failure semantics, and honest scope documentation.',
  },
  {
    index: '05',
    title: 'zero-shot',
    body: 'Work from first principles across OS interfaces, GPU kernels, and compilers.',
  },
];
