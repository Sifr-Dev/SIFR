import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MALLOC_HEADER_SIZE,
  callocBlock,
  computeXorDistanceHex,
  createHeap,
  evaluateCapabilityCheck,
  executeRedisCommand,
  formatHeapDump,
  freeBlock,
  mallocBlock,
  predictChurn,
  reallocBlock,
  type CapabilityRight,
  type ChurnContract,
  type HeapState,
} from '../lib/simulations';
import { haptics } from '../lib/haptics';
import { decodeRingAtShift, normalizeShift } from '../lib/cipher';
import { resolveCanonicalRepoId } from '../lib/identity';
import type { RepoSpec } from '../data/repos';
import { PhysicsCipherCanvas } from './PhysicsCipherCanvas';

interface InteractiveDemoProps {
  repo: RepoSpec;
}

export function InteractiveRepoDemo({ repo }: InteractiveDemoProps) {
  const canonicalId = resolveCanonicalRepoId(repo.id);
  switch (canonicalId) {
    case 'tachyon-fetch':
      return <TachyonFetchDemo />;
    case 'subtorch':
      return <MlSystemsDemo />;
    case 'verrev':
      return <VerrevDemo />;
    case 'Cipher':
      return <SifrNativeDemo />;
    case 'GreenLens':
      return <GreenLensDemo />;
    case 'logitrisk':
      return <ChurnEngineDemo />;
    case 'freelist':
      return <MallocAllocatorDemo />;
    case 'redwire':
      return <RedisCloneDemo />;
    case 'procstatd':
      return <SysmonDaemonDemo />;
    case 'mizan':
      return <GoDbHexDemo />;
    case 'lockstep':
      return <TaskManagerCliDemo />;
    case 'SIFR':
      return <SifrCipherDemo />;
    case 'CipherDesk':
      return <SifrAppsDemo />;
    case 'wireprobe':
    case 'rowscan':
    case 'sha-zero':
    case 'glyphmd':
    case 'huffstream':
    case 'hunkdiff':
    case 'barehttp':
      return <SifrCliToolDemo repoId={canonicalId} />;
    default:
      return (
        <pre className="border border-[#2d3038] bg-[#04060b] p-4 font-mobilis text-xs text-[#b9bec7] overflow-x-auto">
          {repo.codeExcerpt}
        </pre>
      );
  }
}

/* ============================================================================
 * 1. TACHYON-FETCH (Sifr-Dev/tachyon-fetch/src/config.rs)
 * Exact 6 BUILTIN_THEMES RGB palettes + dark/light variants + MODULE_GLYPHS
 * ==========================================================================*/
const TACHYON_THEMES = {
  Vantablack: {
    dark: { bg: '#000000', fg: '#ffffff', dim: '#7a7a7a', accent: '#cecece', warn: '#a4a4a4' },
    light: { bg: '#000000', fg: '#ffffff', dim: '#7a7a7a', accent: '#cecece', warn: '#a4a4a4' },
  },
  Solitude: {
    dark: { bg: '#101315', fg: '#cacccc', dim: '#4b4e55', accent: '#d9dbdc', warn: '#798186' },
    light: { bg: '#101315', fg: '#cacccc', dim: '#4b4e55', accent: '#d9dbdc', warn: '#798186' },
  },
  Hackerman: {
    dark: { bg: '#0b0c16', fg: '#ddf7ff', dim: '#6a6e95', accent: '#82fb9c', warn: '#7cf8f7' },
    light: { bg: '#0b0c16', fg: '#ddf7ff', dim: '#6a6e95', accent: '#82fb9c', warn: '#7cf8f7' },
  },
  'Retro 82': {
    dark: { bg: '#05182e', fg: '#f6dcac', dim: '#3f8f8a', accent: '#faa968', warn: '#e97b3c' },
    light: { bg: '#05182e', fg: '#f6dcac', dim: '#3f8f8a', accent: '#faa968', warn: '#e97b3c' },
  },
  'Rose Pine': {
    dark: { bg: '#191724', fg: '#e0def4', dim: '#908caa', accent: '#c4a7e7', warn: '#ebbcba' },
    light: { bg: '#faf4ed', fg: '#575279', dim: '#9893a5', accent: '#56949f', warn: '#d7827e' },
  },
  'Flexoki Light': {
    dark: { bg: '#1c1b1a', fg: '#cecdc3', dim: '#878580', accent: '#4385be', warn: '#d0a215' },
    light: { bg: '#fffcf0', fg: '#100f0f', dim: '#6f6e69', accent: '#205ea6', warn: '#ad8301' },
  },
} as const;

const TACHYON_MODULES = [
  { id: 'os', glyph: '◈', label: 'OS', value: 'NixOS 25.05 x86_64' },
  { id: 'kernel', glyph: '◆', label: 'Kernel', value: '7.3.4-zen2-2-zen' },
  { id: 'cpu', glyph: '▣', label: 'CPU', value: 'i7-13620H (16) @ 4.9GHz' },
  { id: 'gpu', glyph: '▧', label: 'GPU', value: 'RTX 4060 Laptop (NVML)' },
  { id: 'memory', glyph: '●', label: 'Memory', value: '6.2 / 32.0 GiB (19%)' },
  { id: 'disk_root', glyph: '▩', label: 'Disk /', value: '184 / 931 GiB (nvme0n1)' },
  { id: 'processes', glyph: '≡', label: 'Procs', value: '198 (0 child forks)' },
  { id: 'cpu_temp', glyph: '△', label: 'Temp', value: '48.0 °C (hwmon)' },
] as const;

function TachyonFetchDemo() {
  const [theme, setTheme] = useState<keyof typeof TACHYON_THEMES>('Vantablack');
  const [variant, setVariant] = useState<'dark' | 'light'>('dark');
  const [distro, setDistro] = useState<'NixOS' | 'Arch' | 'Void'>('NixOS');
  const [layout, setLayout] = useState<'hud' | 'stack'>('hud');
  const [enabledMods, setEnabledMods] = useState<string[]>([
    'os',
    'kernel',
    'cpu',
    'gpu',
    'memory',
    'processes',
  ]);

  const palette = TACHYON_THEMES[theme][variant];

  const ascii =
    distro === 'NixOS'
      ? ['  \\  \\ //  ', ' ==\\__\\/   ', '   /   \\== ', '  // \\  \\  ']
      : distro === 'Arch'
        ? ['     /\\    ', '    /  \\   ', '   / /\\ \\  ', '  /_/  \\_\\ ']
        : ['   _____   ', '  / ___ \\  ', ' ( (   ) ) ', '  \\_____/  '];

  const toggleMod = (id: string) => {
    haptics.trigger('detent');
    setEnabledMods((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((x) => x !== id)
          : prev
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(TACHYON_THEMES) as Array<keyof typeof TACHYON_THEMES>).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                haptics.trigger('detent');
                setTheme(t);
              }}
              className={`min-h-[36px] px-2.5 py-1 font-mobilis text-xs border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                theme === t
                  ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                  : 'border-[#2d3038] bg-[#0a0d13] text-[#b9bec7] hover:border-[#9498a1]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['NixOS', 'Arch', 'Void'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                haptics.trigger('tap');
                setDistro(d);
              }}
              className={`min-h-[36px] px-2.5 py-1 font-mobilis text-xs border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                distro === d
                  ? 'border-[#eab444] text-[#eab444] bg-[#171b21]'
                  : 'border-[#2d3038] bg-[#0a0d13] text-[#9498a1]'
              }`}
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              haptics.trigger('tap');
              setVariant((v) => (v === 'dark' ? 'light' : 'dark'));
            }}
            className="min-h-[36px] px-2.5 py-1 font-mobilis text-xs border border-[#2d3038] bg-[#0a0d13] text-[#f3f7fe] hover:border-[#eab444] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Variant: {variant}
          </button>
          <button
            type="button"
            onClick={() => {
              haptics.trigger('tap');
              setLayout((l) => (l === 'hud' ? 'stack' : 'hud'));
            }}
            className="min-h-[36px] px-2.5 py-1 font-mobilis text-xs border border-[#2d3038] bg-[#0a0d13] text-[#f3f7fe] hover:border-[#eab444] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Mode: {layout.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Live Output Frame matching src/config.rs */}
      <div
        className="border border-[#2d3038] p-4 font-mobilis text-xs transition-colors"
        style={{ backgroundColor: palette.bg, color: palette.fg }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b"
          style={{ borderColor: `${palette.dim}66` }}
        >
          <span>
            <strong style={{ color: palette.accent }}>sifr@mobilis</strong> · {distro} x86_64
          </span>
          <span style={{ color: palette.dim }}>
            tachyon --theme "{theme}" --variant {variant}
          </span>
        </div>
        <div
          className={
            layout === 'hud'
              ? 'grid grid-cols-1 sm:grid-cols-[132px_1fr] gap-4 items-center'
              : 'space-y-3'
          }
        >
          <pre className="leading-snug text-xs" style={{ color: palette.accent }}>
            {ascii.join('\n')}
          </pre>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5 text-xs">
            {TACHYON_MODULES.filter((m) => enabledMods.includes(m.id)).map((m) => (
              <div key={m.id} className="truncate">
                <span style={{ color: palette.warn }}>{m.glyph}</span>{' '}
                <span style={{ color: palette.dim }}>{m.label}</span> {m.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TUI Module Configurator */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mobilis text-[11px] text-[#9498a1] mr-1">MODULE_IDS:</span>
        {TACHYON_MODULES.map((m) => {
          const active = enabledMods.includes(m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => toggleMod(m.id)}
              className={`min-h-[32px] px-2 py-1 font-mobilis text-[11px] border cursor-pointer transition-colors ${
                active
                  ? 'border-[#eab444]/80 bg-[#171b21] text-[#f3f7fe]'
                  : 'border-[#2d3038] bg-[#04060b] text-[#9498a1] line-through'
              }`}
            >
              {m.glyph} {m.id}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
 * 2. SUBTORCH (Sifr-Dev/subtorch/EVIDENCE.md)
 * RMSNorm + FlashAttention-style Triton/SDPA verified timings + CLI cmd
 * ==========================================================================*/
type MlSuite = 'rmsnorm' | 'attention';

const RMSNORM_CASES = [
  {
    id: '4096-fp16',
    label: '4096×4096 fp16',
    cmd: 'python -m bench.compare_rmsnorm --rows 4096 --cols 4096 --dtype float16 --backend all',
    rows: [
      { id: 'ref', label: 'PyTorch Reference', ms: 3.36, speedup: '1.0x', tol: 'baseline' },
      { id: 'compile', label: 'torch.compile (Inductor)', ms: 0.318, speedup: '10.6x', tol: 'max diff < 2e-2' },
      { id: 'triton', label: 'Triton Fused Kernel', ms: 0.311, speedup: '10.8x', tol: 'max diff < 2e-2' },
      { id: 'jax', label: 'JAX JIT (XLA + DLPack)', ms: 0.147, speedup: '22.8x', tol: 'max diff < 2e-2' },
    ],
  },
  {
    id: '8192-fp32',
    label: '8192×4096 fp32',
    cmd: 'python -m bench.compare_rmsnorm --rows 8192 --cols 4096 --dtype float32 --backend all',
    rows: [
      { id: 'ref', label: 'PyTorch Reference', ms: 4.078, speedup: '1.0x', tol: 'baseline' },
      { id: 'compile', label: 'torch.compile (Inductor)', ms: 1.215, speedup: '3.4x', tol: 'max diff < 1e-5' },
      { id: 'triton', label: 'Triton Fused Kernel', ms: 1.203, speedup: '3.4x', tol: 'max diff < 1e-5' },
      { id: 'jax', label: 'JAX JIT (XLA + DLPack)', ms: 0.173, speedup: '23.6x', tol: 'max diff < 1e-5' },
    ],
  },
] as const;

const ATTENTION_CASES = [
  {
    id: 'fp16-noncausal',
    label: '4×16×1024×64 fp16',
    cmd: 'python -m bench.compare_attention --batch 4 --heads 16 --seq 1024 --head-dim 64 --dtype float16 --backend all',
    note: 'Triton online-softmax matches PyTorch SDPA within 1% (0.617 vs 0.614 ms).',
    rows: [
      { id: 'ref', label: 'Naive Einsum Reference (fp32)', ms: 9.25, speedup: '1.0x', tol: 'baseline' },
      { id: 'triton', label: 'Triton FlashAttention Forward', ms: 0.617, speedup: '15.0x', tol: 'diff < 2e-2' },
      { id: 'sdpa', label: 'PyTorch SDPA (cuDNN/CUTLASS)', ms: 0.614, speedup: '15.1x', tol: 'diff < 2e-2' },
    ],
  },
  {
    id: 'fp16-causal',
    label: '4×16×1024×64 causal',
    cmd: 'python -m bench.compare_attention --batch 4 --heads 16 --seq 1024 --head-dim 64 --dtype float16 --causal --backend all',
    note: 'SDPA reaches cuDNN/CUTLASS fused causal path (0.372 ms vs Triton 0.632 ms).',
    rows: [
      { id: 'ref', label: 'Naive Einsum Reference (fp32)', ms: 12.92, speedup: '1.0x', tol: 'baseline' },
      { id: 'triton', label: 'Triton FlashAttention Causal', ms: 0.632, speedup: '20.4x', tol: 'diff < 2e-2' },
      { id: 'sdpa', label: 'PyTorch SDPA Causal (Fastest)', ms: 0.372, speedup: '34.7x', tol: 'diff < 2e-2' },
    ],
  },
  {
    id: 'bf16-noncausal',
    label: '4×16×1024×64 bf16',
    cmd: 'python -m bench.compare_attention --batch 4 --heads 16 --seq 1024 --head-dim 64 --dtype bfloat16 --backend all',
    note: 'Triton fused outperforms SDPA slightly (0.617 ms vs 0.627 ms) on bf16 non-causal.',
    rows: [
      { id: 'ref', label: 'Naive Einsum Reference (fp32)', ms: 8.31, speedup: '1.0x', tol: 'baseline' },
      { id: 'sdpa', label: 'PyTorch SDPA', ms: 0.627, speedup: '13.3x', tol: 'diff < 2e-2' },
      { id: 'triton', label: 'Triton FlashAttention (Fastest)', ms: 0.617, speedup: '13.5x', tol: 'diff < 2e-2' },
    ],
  },
  {
    id: 'seq2048-hd128',
    label: '2×8×2048×128 fp16',
    cmd: 'python -m bench.compare_attention --batch 2 --heads 8 --seq 2048 --head-dim 128 --dtype float16 --backend all',
    note: 'Long-context head_dim=128 benchmarked with fp32 accumulator & IEEE tl.dot.',
    rows: [
      { id: 'ref', label: 'Naive Einsum Reference (fp32)', ms: 9.18, speedup: '1.0x', tol: 'baseline' },
      { id: 'triton', label: 'Triton FlashAttention Forward', ms: 1.613, speedup: '5.7x', tol: 'diff < 2e-2' },
      { id: 'sdpa', label: 'PyTorch SDPA (Fastest)', ms: 1.245, speedup: '7.4x', tol: 'diff < 2e-2' },
    ],
  },
] as const;

function MlSystemsDemo() {
  const [suite, setSuite] = useState<MlSuite>('rmsnorm');
  const [rmsIdx, setRmsIdx] = useState(0);
  const [attnIdx, setAttnIdx] = useState(0);

  const activeCase = suite === 'rmsnorm' ? RMSNORM_CASES[rmsIdx] : ATTENTION_CASES[attnIdx];
  const maxMs = Math.max(...activeCase.rows.map((r) => r.ms));
  const minMs = Math.min(...activeCase.rows.map((r) => r.ms));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {(
            [
              { key: 'rmsnorm', label: 'RMSNorm Kernels' },
              { key: 'attention', label: 'FlashAttention (SDPA)' },
            ] as const
          ).map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => {
                haptics.trigger('detent');
                setSuite(s.key);
              }}
              className={`min-h-[38px] px-3 py-1.5 font-mobilis text-xs border transition-colors cursor-pointer ${
                suite === s.key
                  ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                  : 'border-[#2d3038] bg-[#0a0d13] text-[#b9bec7]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(suite === 'rmsnorm' ? RMSNORM_CASES : ATTENTION_CASES).map((c, idx) => {
            const active = (suite === 'rmsnorm' ? rmsIdx : attnIdx) === idx;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  haptics.trigger('tap');
                  if (suite === 'rmsnorm') setRmsIdx(idx);
                  else setAttnIdx(idx);
                }}
                className={`min-h-[38px] px-2.5 py-1.5 font-mobilis text-xs border transition-colors cursor-pointer ${
                  active
                    ? 'border-[#eab444] text-[#eab444] bg-[#171b21]'
                    : 'border-[#2d3038] bg-[#0a0d13] text-[#9498a1]'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border border-[#2d3038] bg-[#04060b] p-4 space-y-3">
        <div className="font-mobilis text-[11px] text-[#9498a1] bg-[#0a0d13] border border-[#2d3038] px-3 py-2 overflow-x-auto whitespace-nowrap">
          $ {activeCase.cmd}
        </div>

        {activeCase.rows.map((r) => {
          const widthPct = Math.max(4, Math.round((r.ms / maxMs) * 100));
          const isFastest = r.ms === minMs;
          return (
            <div key={r.id} className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mobilis text-xs">
                <span className={isFastest ? 'text-[#eab444] font-bold' : 'text-[#f3f7fe]'}>
                  {r.label}
                </span>
                <span className="text-[#b9bec7]">
                  {r.ms.toFixed(3)} ms · <span className="text-[#eab444]">{r.speedup}</span> · {r.tol}
                </span>
              </div>
              <div className="h-2.5 w-full bg-[#171b21]">
                <div
                  className="h-full transition-all duration-200"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: isFastest ? '#eab444' : r.id === 'ref' ? '#494d55' : '#f3f7fe',
                  }}
                />
              </div>
            </div>
          );
        })}

        <p className="pt-2 border-t border-[#2d3038] font-mobilis text-[11px] text-[#9498a1]">
          {'note' in activeCase
            ? activeCase.note
            : 'RTX 4060 (cap 8.9), 10 warmup + 100 CUDA event iterations, zero-copy DLPack · pytest -q: 36 passed.'}
        </p>
      </div>
    </div>
  );
}

/* ============================================================================
 * 3. VERREV (Sifr-Dev/verrev)
 * Exact workspace crate status + XOR Probe + Capability ACL
 * ==========================================================================*/
const VERREV_LAYERS = [
  {
    name: 'L0 · Hashing & Syscalls',
    crates: 'verrev-hash (SHA3-256/512, SHAKE128/256) · verrev-fs · verrev-relay',
    status: 'KAT-verified · 48 workspace tests pass',
  },
  {
    name: 'L1 · PQ Crypto & Capability',
    crates: 'verrev-crypto (ML-KEM-1024 10t, ML-DSA-87 11t, XChaCha20 6t) · verrev-identity · verrev-capability',
    status: '27 crypto tests pass across 7 crates',
  },
  {
    name: 'L2+ · Prototype Shells (Stubbed)',
    crates: 'verrev-transport · verrev-p2p (find_closest stub) · verrev-mesh · verrev-sync (no-op CRDT) · verrev-runtime',
    status: 'Early prototype interface shells',
  },
];

function VerrevDemo() {
  const [peerA, setPeerA] = useState('0x8f3a1c00');
  const [peerB, setPeerB] = useState('0x8f3a1cff');
  const [activeLayer, setActiveLayer] = useState(0);
  const [probeTab, setProbeTab] = useState<'kademlia' | 'capability'>('kademlia');

  const [rights, setRights] = useState<CapabilityRight[]>(['READ', 'WRITE']);
  const [reqRight, setReqRight] = useState<CapabilityRight>('WRITE');
  const [revoked, setRevoked] = useState(false);

  const xorResult = useMemo(() => computeXorDistanceHex(peerA, peerB), [peerA, peerB]);
  const capCheck = useMemo(
    () => evaluateCapabilityCheck(rights, reqRight, revoked),
    [rights, reqRight, revoked]
  );

  const toggleRight = (r: CapabilityRight) => {
    haptics.trigger('detent');
    setRights((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {VERREV_LAYERS.map((l, idx) => (
          <button
            key={l.name}
            type="button"
            onClick={() => {
              haptics.trigger('detent');
              setActiveLayer(idx);
            }}
            className={`text-left p-2.5 border transition-colors cursor-pointer ${
              activeLayer === idx
                ? 'border-[#eab444] bg-[#171b21]'
                : 'border-[#2d3038] bg-[#04060b] hover:border-[#9498a1]'
            }`}
          >
            <div className="font-mobilis text-xs font-bold text-[#f3f7fe]">{l.name}</div>
            <div className="font-mobilis text-[11px] text-[#9498a1] mt-1">{l.status}</div>
          </button>
        ))}
      </div>

      <div className="border border-[#2d3038] bg-[#04060b] p-4 space-y-3">
        <div className="font-mobilis text-xs text-[#eab444]">{VERREV_LAYERS[activeLayer].crates}</div>

        <div className="pt-2 border-t border-[#2d3038] flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              haptics.trigger('tap');
              setProbeTab('kademlia');
            }}
            className={`min-h-[36px] px-3 py-1 font-mobilis text-xs border cursor-pointer ${
              probeTab === 'kademlia'
                ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                : 'border-[#2d3038] bg-[#0a0d13] text-[#b9bec7]'
            }`}
          >
            verrev-p2p · Kademlia XOR
          </button>
          <button
            type="button"
            onClick={() => {
              haptics.trigger('tap');
              setProbeTab('capability');
            }}
            className={`min-h-[36px] px-3 py-1 font-mobilis text-xs border cursor-pointer ${
              probeTab === 'capability'
                ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                : 'border-[#2d3038] bg-[#0a0d13] text-[#b9bec7]'
            }`}
          >
            verrev-capability · ACL
          </button>
        </div>

        {probeTab === 'kademlia' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="font-mobilis text-[11px] text-[#9498a1]">Node ID A (hex)</span>
                <input
                  type="text"
                  value={peerA}
                  onChange={(e) => setPeerA(e.target.value)}
                  className="mt-1 w-full min-h-[38px] px-3 py-1.5 bg-[#0a0d13] border border-[#2d3038] font-mobilis text-xs text-[#f3f7fe]"
                />
              </label>
              <label className="block">
                <span className="font-mobilis text-[11px] text-[#9498a1]">Node ID B (hex)</span>
                <input
                  type="text"
                  value={peerB}
                  onChange={(e) => setPeerB(e.target.value)}
                  className="mt-1 w-full min-h-[38px] px-3 py-1.5 bg-[#0a0d13] border border-[#2d3038] font-mobilis text-xs text-[#f3f7fe]"
                />
              </label>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 font-mobilis text-xs">
              <span>
                XOR Distance: <strong className="text-[#eab444]">{xorResult.distanceHex}</strong>
              </span>
              <span className="text-[#b9bec7]">
                Shared Prefix: {xorResult.leadingZeroBits} bits · KBucket #{Math.max(0, 31 - xorResult.leadingZeroBits)}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 font-mobilis text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[#9498a1]">Token Granted Rights:</span>
              <div className="flex flex-wrap gap-1.5">
                {(['READ', 'WRITE', 'EXEC', 'DELEGATE'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleRight(r)}
                    className={`min-h-[32px] px-2.5 py-1 border cursor-pointer ${
                      rights.includes(r)
                        ? 'border-[#eab444] bg-[#171b21] text-[#eab444]'
                        : 'border-[#2d3038] bg-[#0a0d13] text-[#9498a1]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    haptics.trigger('garble');
                    setRevoked((v) => !v);
                  }}
                  className={`min-h-[32px] px-2.5 py-1 border cursor-pointer ${
                    revoked
                      ? 'border-[#fc5855] bg-[#171b21] text-[#fc5855]'
                      : 'border-[#2d3038] bg-[#0a0d13] text-[#b9bec7]'
                  }`}
                >
                  {revoked ? 'REVOKED' : 'ACTIVE'}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[#9498a1]">Syscall Request:</span>
              <div className="flex gap-1.5">
                {(['READ', 'WRITE', 'EXEC', 'DELEGATE'] as const).map((r) => (
                  <button
                    key={`req-${r}`}
                    type="button"
                    onClick={() => {
                      haptics.trigger('tap');
                      setReqRight(r);
                    }}
                    className={`min-h-[32px] px-2 py-1 border cursor-pointer ${
                      reqRight === r
                        ? 'border-[#f3f7fe] text-[#f3f7fe] bg-[#171b21]'
                        : 'border-[#2d3038] text-[#9498a1]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div
              className={`p-2.5 border ${
                capCheck.allowed
                  ? 'border-[#eab444] text-[#eab444] bg-[#0a0d13]'
                  : 'border-[#fc5855] text-[#fc5855] bg-[#0a0d13]'
              }`}
            >
              {capCheck.reason}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
 * 4. CIPHER (Sifr-Dev/Cipher)
 * Real WebGL2 GLSL fragment shader pipeline executing ring math + Canvas2D fallback
 * ==========================================================================*/
const RING_VERT_SHADER = `#version 300 es
in vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const RING_FRAG_SHADER = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_bug;
out vec4 outColor;

void main() {
  if (u_bug > 0.5) {
    outColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec2 frag = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 center = u_res * 0.5;
  float scale = 0.62;
  float spin = sin(u_time * 0.4) * 6.0 * scale;

  vec3 col = vec3(4.0, 6.0, 11.0) / 255.0;
  float dc = length(frag - center);

  if (
    abs(dc - 140.0 * scale) < 1.0 ||
    abs(dc - 96.0 * scale) < 1.0 ||
    abs(dc - 52.0 * scale) < 1.0
  ) {
    col = vec3(45.0, 48.0, 56.0) / 255.0;
  }

  for (int i = 0; i < 24; i++) {
    float angle = float(i) * 0.2617993877991494 - 1.5707963267948966;
    vec2 cellCenter = vec2(
      center.x + cos(angle) * (140.0 * scale) + spin,
      center.y + sin(angle) * (140.0 * scale)
    );
    float rad = (i == 0 ? 9.0 : 6.0) * scale;
    if (length(frag - cellCenter) <= rad) {
      if (i == 0) {
        col = vec3(234.0, 180.0, 68.0) / 255.0;
      } else {
        col = vec3(243.0, 247.0, 254.0) / 255.0;
      }
    }
  }

  if (dc <= 12.0 * scale) {
    col = vec3(234.0, 180.0, 68.0) / 255.0;
  }

  outColor = vec4(col, 1.0);
}`;

function SifrNativeDemo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glStateRef = useRef<{
    gl: WebGL2RenderingContext;
    program: WebGLProgram;
    uRes: WebGLUniformLocation | null;
    uTime: WebGLUniformLocation | null;
    uBug: WebGLUniformLocation | null;
    vao: WebGLVertexArrayObject | null;
  } | null>(null);
  const modeCheckedRef = useRef<'untested' | 'webgl2' | 'canvas2d'>('untested');
  const [shaderBackend, setShaderBackend] = useState<'GLSL Fragment Pipeline' | 'Software Raster Fallback'>('GLSL Fragment Pipeline');
  const [pcTime, setPcTime] = useState(0);
  const [bugInjected, setBugInjected] = useState(false);
  const [frameIndex, setFrameIndex] = useState(24);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = 360;
    const h = 220;

    if (modeCheckedRef.current === 'untested') {
      const gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });
      if (gl) {
        const vs = gl.createShader(gl.VERTEX_SHADER);
        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        if (vs && fs) {
          gl.shaderSource(vs, RING_VERT_SHADER);
          gl.compileShader(vs);
          gl.shaderSource(fs, RING_FRAG_SHADER);
          gl.compileShader(fs);
          if (gl.getShaderParameter(vs, gl.COMPILE_STATUS) && gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
            const program = gl.createProgram();
            if (program) {
              gl.attachShader(program, vs);
              gl.attachShader(program, fs);
              gl.linkProgram(program);
              if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
                const vao = gl.createVertexArray();
                gl.bindVertexArray(vao);
                const buf = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                gl.bufferData(
                  gl.ARRAY_BUFFER,
                  new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
                  gl.STATIC_DRAW
                );
                const loc = gl.getAttribLocation(program, 'a_pos');
                gl.enableVertexAttribArray(loc);
                gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
                glStateRef.current = {
                  gl,
                  program,
                  uRes: gl.getUniformLocation(program, 'u_res'),
                  uTime: gl.getUniformLocation(program, 'u_time'),
                  uBug: gl.getUniformLocation(program, 'u_bug'),
                  vao,
                };
                modeCheckedRef.current = 'webgl2';
                setShaderBackend('GLSL Fragment Pipeline');
              }
            }
          }
          gl.deleteShader(vs);
          gl.deleteShader(fs);
        }
      }
      if (modeCheckedRef.current !== 'webgl2') {
        modeCheckedRef.current = 'canvas2d';
        setShaderBackend('Software Raster Fallback');
      }
    }

    if (modeCheckedRef.current === 'webgl2' && glStateRef.current) {
      const { gl, program, uRes, uTime, uBug, vao } = glStateRef.current;
      gl.viewport(0, 0, w, h);
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.uniform2f(uRes, w, h);
      gl.uniform1f(uTime, pcTime);
      gl.uniform1f(uBug, bugInjected ? 1.0 : 0.0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = ctx.createImageData(w, h);
    const data = img.data;

    if (bugInjected) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      return;
    }

    const cx = w * 0.5;
    const cy = h * 0.5;
    const scale = 0.62;
    const spin = Math.sin(pcTime * 0.4) * 6.0 * scale;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 4;
        let g = 6;
        let b = 11;
        const dx = x - cx;
        const dy = y - cy;
        const dc = Math.hypot(dx, dy);

        if (
          Math.abs(dc - 140 * scale) < 1.0 ||
          Math.abs(dc - 96 * scale) < 1.0 ||
          Math.abs(dc - 52 * scale) < 1.0
        ) {
          r = 45;
          g = 48;
          b = 56;
        }

        for (let i = 0; i < 24; i++) {
          const angle = i * 0.2617993877991494 - 1.5707963267948966;
          const ccx = cx + Math.cos(angle) * (140 * scale) + spin;
          const ccy = cy + Math.sin(angle) * (140 * scale);
          const rad = (i === 0 ? 9.0 : 6.0) * scale;
          if (Math.hypot(x - ccx, y - ccy) <= rad) {
            if (i === 0) {
              r = 234;
              g = 180;
              b = 68;
            } else {
              r = 243;
              g = 247;
              b = 254;
            }
          }
        }

        if (dc <= 12.0 * scale) {
          r = 234;
          g = 180;
          b = 68;
        }

        const idx = (y * w + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);
  }, [pcTime, bugInjected]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-3 items-stretch">
        <div className="min-w-0 border border-[#2d3038] bg-[#04060b] p-2.5 flex flex-col justify-between gap-2">
          <canvas
            ref={canvasRef}
            width={360}
            height={220}
            className="w-full aspect-[360/220] object-contain border border-[#2d3038]"
            aria-label="Live GLSL ring.comp shader output buffer"
          />
          <div className="flex flex-wrap items-center justify-between gap-1.5 font-mobilis text-[11px] text-[#9498a1]">
            <span className="truncate">{shaderBackend}</span>
            <span className={bugInjected ? 'text-[#fc5855]' : 'text-[#eab444]'}>
              {bugInjected ? '0x000000 black' : 'WAYLAND_OK'}
            </span>
          </div>
        </div>

        <div className="min-w-0 border border-[#2d3038] bg-[#04060b] p-3 flex flex-col justify-between space-y-3 font-mobilis text-xs">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[#9498a1]">VkBufferImageCopy ABI</span>
              <span className="text-[#f3f7fe]">frames={frameIndex}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                haptics.trigger(bugInjected ? 'confirm' : 'garble');
                setBugInjected((b) => !b);
              }}
              className={`w-full min-h-[40px] px-3 py-1.5 border text-left text-[11px] leading-snug transition-colors cursor-pointer ${
                bugInjected
                  ? 'border-[#fc5855] bg-[#171b21] text-[#fc5855]'
                  : 'border-[#eab444] bg-[#171b21] text-[#eab444]'
              }`}
            >
              {bugInjected
                ? 'BUG ACTIVE: VkSubresourceRange (20B) -> Fix to 16B'
                : 'ACTIVE FIX: VkSubresourceLayers (16B) · Inject 20B Bug'}
            </button>
          </div>

          <label className="block space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#9498a1]">push_constant pc.time</span>
              <span className="text-[#f3f7fe]">{pcTime.toFixed(2)}s</span>
            </div>
            <input
              type="range"
              min={0}
              max={15.7}
              step={0.2}
              value={pcTime}
              onChange={(e) => {
                haptics.trigger('detent');
                setPcTime(Number(e.target.value));
              }}
              className="w-full accent-[#eab444] cursor-pointer"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                haptics.trigger('detent');
                setFrameIndex((f) => (f % 24) + 1);
                setPcTime((t) => (t + 0.8) % 15.7);
              }}
              className="flex-1 min-w-[120px] min-h-[38px] px-2.5 py-1 border border-[#2d3038] bg-[#171b21] hover:border-[#eab444] text-[#f3f7fe] cursor-pointer"
            >
              wl_surface.commit
            </button>
            <button
              type="button"
              onClick={() => {
                haptics.trigger('snapZero');
                setFrameIndex(24);
                setPcTime(0);
                setBugInjected(false);
              }}
              className="min-h-[38px] px-3 py-1 bg-[#eab444] text-[#04060b] font-bold cursor-pointer shrink-0"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 5. GREENLENS (Sifr-Dev/GreenLens)
 * Authentic Rust egui split card + clickable Top-3 focused guidance selector
 * ==========================================================================*/
const GREENLENS_SAMPLES = [
  {
    id: 'Potato___Late_blight',
    title: 'Potato: Late Blight',
    pathogen: 'Phytophthora infestans',
    precision: 0.937,
    recall: 0.987,
    f1: 0.961,
    support: 150,
    candidates: [
      { label: 'Potato___Late_blight', prob: 96.1 },
      { label: 'Tomato_Late_blight', prob: 2.4 },
      { label: 'Potato___Early_blight', prob: 0.9 },
    ],
    feedback:
      'Destroy infected vines before tuber harvest; apply systemic/protectant fungicide (mancozeb, cymoxanil, or copper) before cool humid weather.',
    source: 'NC State Extension · PlantVillage Held-Out Test (3,095 imgs)',
  },
  {
    id: 'Tomato_Septoria_leaf_spot',
    title: 'Tomato: Septoria Leaf Spot',
    pathogen: 'Septoria lycopersici',
    precision: 0.969,
    recall: 0.932,
    f1: 0.95,
    support: 266,
    candidates: [
      { label: 'Tomato_Septoria_leaf_spot', prob: 95.0 },
      { label: 'Tomato_Bacterial_spot', prob: 2.8 },
      { label: 'Tomato__Target_Spot', prob: 1.4 },
    ],
    feedback:
      'Circular water-soaked spots with gray centers. Mulch soil splash, avoid overhead irrigation, and remove lower infected leaves early.',
    source: 'UF/IFAS Extension · Cornell Vegetable MD Online',
  },
  {
    id: 'Tomato__Tomato_YellowLeaf__Curl_Virus',
    title: 'Tomato: Yellow Leaf Curl Virus',
    pathogen: 'Begomovirus (TYLCV · Bemisia tabaci vector)',
    precision: 0.994,
    recall: 0.975,
    f1: 0.984,
    support: 481,
    candidates: [
      { label: 'Tomato__Tomato_YellowLeaf__Curl_Virus', prob: 98.4 },
      { label: 'Tomato_Leaf_Mold', prob: 0.9 },
      { label: 'Tomato__Tomato_mosaic_virus', prob: 0.4 },
    ],
    feedback:
      'Severe stunting & upward leaf cupping. Control whitefly vector (Bemisia tabaci) with fine insect netting and rogue infected seedlings.',
    source: 'ARC Egypt Horticulture · EPPO Quarantine Standard',
  },
  {
    id: 'Pepper__bell___Bacterial_spot',
    title: 'Pepper Bell: Bacterial Spot',
    pathogen: 'Xanthomonas euvesicatoria (prevalent in Egypt)',
    precision: 0.993,
    recall: 0.953,
    f1: 0.973,
    support: 150,
    candidates: [
      { label: 'Pepper__bell___Bacterial_spot', prob: 97.3 },
      { label: 'Pepper__bell___healthy', prob: 1.8 },
      { label: 'Tomato_Bacterial_spot', prob: 0.6 },
    ],
    feedback:
      'Never handle plants while wet; use certified pathogen-free seed and preventative copper hydroxide + mancozeb tank mixes.',
    source: 'NC State Extension · World J Microbiol Biotechnol (Egypt)',
  },
] as const;

function GreenLensDemo() {
  const [selected, setSelected] = useState(0);
  const [focusedCand, setFocusedCand] = useState(0);
  const current = GREENLENS_SAMPLES[selected];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {GREENLENS_SAMPLES.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              haptics.trigger('detent');
              setSelected(idx);
              setFocusedCand(0);
            }}
            className={`min-h-[38px] px-2.5 py-1.5 font-mobilis text-xs border transition-colors cursor-pointer ${
              selected === idx
                ? 'border-[#40e080] bg-[#40e080] text-[#061c10] font-bold'
                : 'border-[#2d3038] bg-[#0a0d13] text-[#b9bec7]'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Exact GreenLens egui palette (#080f0b -> #111c15, #40e080 accent) */}
      <div
        className="border p-4 space-y-3"
        style={{ backgroundColor: '#080f0b', borderColor: '#223628', color: '#e6f5eb' }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="font-mobilis text-[11px]" style={{ color: '#40e080' }}>
              VGG16 Block5 Fine-Tune · 95.54% Test Acc · Macro F1 0.950
            </div>
            <div className="font-stabilis text-base font-bold mt-0.5">{current.title}</div>
          </div>
          <div className="font-mobilis text-xs" style={{ color: '#8aa292' }}>
            P {current.precision.toFixed(3)} · R {current.recall.toFixed(3)} · n={current.support}
          </div>
        </div>

        <div className="space-y-1.5">
          {current.candidates.map((cand, idx) => (
            <button
              key={cand.label}
              type="button"
              onClick={() => {
                haptics.trigger('tap');
                setFocusedCand(idx);
              }}
              className="w-full text-left p-2 border transition-colors cursor-pointer"
              style={{
                backgroundColor: '#111c15',
                borderColor: focusedCand === idx ? '#40e080' : '#223628',
              }}
            >
              <div className="flex justify-between font-mobilis text-xs mb-1">
                <span>{cand.label}</span>
                <span style={{ color: idx === 0 ? '#40e080' : '#8aa292' }}>{cand.prob}%</span>
              </div>
              <div className="h-1.5 w-full" style={{ backgroundColor: '#1d2c22' }}>
                <div
                  className="h-full"
                  style={{
                    width: `${cand.prob}%`,
                    backgroundColor: idx === 0 ? '#40e080' : '#267e4c',
                  }}
                />
              </div>
            </button>
          ))}
        </div>

        <div
          className="p-3 border space-y-1 text-xs"
          style={{ backgroundColor: '#111c15', borderColor: '#223628', color: '#bed0c4' }}
        >
          <div className="font-mobilis text-[11px]" style={{ color: '#40e080' }}>
            diseases.db · Pathogen: {current.pathogen}
          </div>
          <p>{current.feedback}</p>
          <div className="font-mobilis text-[11px]" style={{ color: '#8aa292' }}>
            {current.source}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 6. LOGITRISK (Sifr-Dev/logitrisk)
 * ==========================================================================*/
function ChurnEngineDemo() {
  const [tenure, setTenure] = useState(12);
  const [monthlyCharges, setMonthlyCharges] = useState(60);
  const [contract, setContract] = useState<ChurnContract>('month-to-month');

  const totalCharges = tenure * monthlyCharges;
  const result = useMemo(
    () =>
      predictChurn({
        tenure,
        monthlyCharges,
        totalCharges,
        contract,
      }),
    [tenure, monthlyCharges, totalCharges, contract]
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#2d3038] bg-[#04060b] p-4">
        <label className="block space-y-1.5">
          <div className="flex justify-between font-mobilis text-xs">
            <span className="text-[#9498a1]">tenure (months)</span>
            <span className="text-[#f3f7fe]">{tenure} mo</span>
          </div>
          <input
            type="range"
            min={1}
            max={72}
            value={tenure}
            onChange={(e) => {
              haptics.trigger('detent');
              setTenure(Number(e.target.value));
            }}
            className="w-full accent-[#eab444] cursor-pointer"
          />
        </label>

        <label className="block space-y-1.5">
          <div className="flex justify-between font-mobilis text-xs">
            <span className="text-[#9498a1]">monthlyCharges</span>
            <span className="text-[#f3f7fe]">${monthlyCharges}</span>
          </div>
          <input
            type="range"
            min={20}
            max={130}
            value={monthlyCharges}
            onChange={(e) => {
              haptics.trigger('detent');
              setMonthlyCharges(Number(e.target.value));
            }}
            className="w-full accent-[#eab444] cursor-pointer"
          />
        </label>

        <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {(['month-to-month', 'one-year', 'two-year'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  haptics.trigger('tap');
                  setContract(c);
                }}
                className={`min-h-[38px] px-3 py-1 font-mobilis text-xs border cursor-pointer ${
                  contract === c
                    ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                    : 'border-[#2d3038] bg-[#0a0d13] text-[#b9bec7]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <span className="font-mobilis text-xs text-[#9498a1]">
            totalCharges: ${totalCharges}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-3">
        <div className="border border-[#2d3038] bg-[#04060b] p-3 space-y-1.5 font-mobilis text-[11px]">
          <div className="text-[#9498a1] mb-1">model_weights.json logit breakdown (z = {result.logit.toFixed(4)})</div>
          {result.contributions.map((c) => (
            <div key={c.label} className="flex justify-between border-b border-[#2d3038]/60 py-1">
              <span className="text-[#b9bec7]">{c.label}</span>
              <span className={c.delta >= 0 ? 'text-[#fc5855]' : 'text-[#eab444]'}>
                {c.delta >= 0 ? '+' : ''}
                {c.delta.toFixed(4)}
              </span>
            </div>
          ))}
        </div>

        <div className="border border-[#2d3038] bg-[#0a0d13] p-4 flex flex-col justify-between space-y-2">
          <div className="font-mobilis text-[11px] text-[#9498a1]">POST /api/churn</div>
          <pre className="font-mobilis text-xs text-[#f3f7fe]">
{`{
  "churnProbability": ${result.probability.toFixed(4)},
  "riskLevel": "${result.riskTier}"
}`}
          </pre>
          <div
            className={`px-2.5 py-1 font-mobilis text-xs font-bold border text-center ${
              result.riskTier === 'HIGH'
                ? 'border-[#fc5855] text-[#fc5855]'
                : result.riskTier === 'MEDIUM'
                  ? 'border-[#eab444] text-[#eab444]'
                  : 'border-[#2d3038] text-[#f3f7fe]'
            }`}
          >
            {result.percent.toFixed(1)}% · {result.riskTier}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 7. FREELIST (Sifr-Dev/freelist)
 * Real WebAssembly.Memory (64KiB linear buffer) + 24B header_t + coalescing + hex inspector
 * ==========================================================================*/
function MallocAllocatorDemo() {
  const [heap, setHeap] = useState<HeapState>(() => {
    let h = createHeap(0);
    h = mallocBlock(h, 48, 'vec_a');
    h = mallocBlock(h, 64, 'ring_buf');
    return h;
  });
  const [showWasmHex, setShowWasmHex] = useState(false);

  const wasmMemRef = useRef<WebAssembly.Memory | null>(null);

  const wasmHexRows = useMemo(() => {
    if (!wasmMemRef.current && typeof WebAssembly !== 'undefined') {
      wasmMemRef.current = new WebAssembly.Memory({ initial: 1 });
    }
    const mem = wasmMemRef.current;
    if (!mem) return [];

    const bytes = new Uint8Array(mem.buffer);
    const view = new DataView(mem.buffer);
    bytes.fill(0, 0, Math.min(bytes.length, 512));

    heap.blocks.forEach((b, idx) => {
      const off = b.headerOffset;
      if (off + MALLOC_HEADER_SIZE >= bytes.length) return;
      // 24-byte header_t layout: size (8B u64 LE), is_free (4B), pad (4B), next (8B u64 LE)
      view.setUint32(off, b.size, true);
      view.setUint32(off + 8, b.free ? 1 : 0, true);
      const nextPtr = idx < heap.blocks.length - 1 ? heap.blocks[idx + 1].headerOffset : 0;
      view.setUint32(off + 16, nextPtr, true);

      // Write tag signature into first payload bytes for live linear buffer inspection
      const tag = b.free ? 'FREE' : b.zeroed ? '\x00\x00\x00\x00' : (b.label ?? 'blk').slice(0, 8);
      for (let i = 0; i < tag.length && off + MALLOC_HEADER_SIZE + i < bytes.length; i++) {
        bytes[off + MALLOC_HEADER_SIZE + i] = tag.charCodeAt(i);
      }
    });

    const totalLen = Math.min(256, Math.max(64, Math.ceil((heap.brkOffset || 64) / 16) * 16));
    const rows: Array<{ addr: string; hex: string; ascii: string }> = [];
    for (let addr = 0; addr < totalLen; addr += 16) {
      const slice = bytes.slice(addr, addr + 16);
      const hex = Array.from(slice)
        .map((v) => v.toString(16).padStart(2, '0'))
        .join(' ');
      const ascii = Array.from(slice)
        .map((v) => (v >= 32 && v <= 126 ? String.fromCharCode(v) : '.'))
        .join('');
      rows.push({
        addr: `0x${addr.toString(16).padStart(4, '0')}`,
        hex,
        ascii,
      });
    }
    return rows;
  }, [heap]);

  const allocate = (size: number) => {
    haptics.trigger('confirm');
    setHeap((h) => mallocBlock(h, size));
  };

  const firstUsed = heap.blocks.find((b) => !b.free);
  const dumpLines = useMemo(() => formatHeapDump(heap), [heap]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {[32, 48, 96].map((sz) => (
          <button
            key={sz}
            type="button"
            onClick={() => allocate(sz)}
            className="min-h-[38px] px-3 py-1.5 border border-[#2d3038] bg-[#171b21] hover:border-[#eab444] font-mobilis text-xs text-[#f3f7fe] cursor-pointer"
          >
            my_malloc({sz})
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            haptics.trigger('confirm');
            setHeap((h) => callocBlock(h, 4, 8));
          }}
          className="min-h-[38px] px-3 py-1.5 border border-[#2d3038] bg-[#171b21] hover:border-[#eab444] font-mobilis text-xs text-[#f3f7fe] cursor-pointer"
        >
          my_calloc(4, 8)
        </button>
        {firstUsed && (
          <button
            type="button"
            onClick={() => {
              haptics.trigger('detent');
              setHeap((h) => reallocBlock(h, firstUsed.id, firstUsed.size + 32));
            }}
            className="min-h-[38px] px-3 py-1.5 border border-[#2d3038] bg-[#171b21] hover:border-[#eab444] font-mobilis text-xs text-[#eab444] cursor-pointer"
          >
            my_realloc({firstUsed.label}, +32)
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            haptics.trigger('detent');
            setShowWasmHex((v) => !v);
          }}
          className={`min-h-[38px] px-3 py-1.5 border font-mobilis text-xs cursor-pointer ${
            showWasmHex
              ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
              : 'border-[#2d3038] bg-[#0a0d13] text-[#e4e8f1] hover:border-[#eab444]'
          }`}
        >
          {showWasmHex ? 'Hide WASM Heap Bytes' : 'Inspect WASM Heap Bytes'}
        </button>
        <button
          type="button"
          onClick={() => {
            haptics.trigger('garble');
            setHeap(createHeap(0));
          }}
          className="min-h-[38px] px-3 py-1.5 border border-[#2d3038] bg-[#0a0d13] hover:border-[#fc5855] font-mobilis text-xs text-[#9498a1] hover:text-[#fc5855] cursor-pointer"
        >
          Reset Heap
        </button>
      </div>

      <div className="border border-[#2d3038] bg-[#04060b] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 font-mobilis text-xs">
          <span className="text-[#eab444]">{heap.lastOp}</span>
          <span className="text-[#9498a1]">
            WebAssembly.Memory (64KiB page 0) · brk +{heap.brkOffset}B
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {heap.blocks.length === 0 ? (
            <div className="w-full p-4 border border-dashed border-[#2d3038] text-center font-mobilis text-xs text-[#9498a1]">
              Heap empty (head == NULL). Call my_malloc() or my_calloc() to invoke sbrk().
            </div>
          ) : (
            heap.blocks.map((b) =>
              b.free ? (
                <div
                  key={`${b.id}-${b.headerOffset}`}
                  className="min-h-[54px] px-3 py-2 border border-[#2d3038] bg-[#0a0d13] text-[#9ca2af] text-left font-mobilis text-[11px] flex-1 min-w-[120px]"
                >
                  <div className="font-bold">FREE</div>
                  <div>
                    {MALLOC_HEADER_SIZE}B hdr + {b.size}B
                  </div>
                </div>
              ) : (
                <button
                  key={`${b.id}-${b.headerOffset}`}
                  type="button"
                  onClick={() => {
                    haptics.trigger('detent');
                    setHeap((h) => freeBlock(h, b.id));
                  }}
                  className="min-h-[54px] px-3 py-2 border border-[#eab444] bg-[#171b21] text-[#f3f7fe] hover:bg-[#eab444] hover:text-[#04060b] cursor-pointer text-left font-mobilis text-[11px] transition-colors flex-1 min-w-[120px]"
                >
                  <div className="font-bold">
                    {b.label} {b.zeroed ? '(0x00)' : ''}
                  </div>
                  <div>
                    {MALLOC_HEADER_SIZE}B hdr + {b.size}B
                  </div>
                </button>
              )
            )
          )}
        </div>

        {showWasmHex ? (
          <div className="bg-[#0a0d13] border border-[#2d3038] p-2.5 font-mobilis text-[11px] overflow-x-auto space-y-0.5">
            <div className="text-[#eab444] mb-1">
              // WebAssembly.Memory linear buffer (24B LE header_t: size | is_free | next_ptr)
            </div>
            {wasmHexRows.map((row) => (
              <div key={row.addr} className="flex gap-3 whitespace-nowrap">
                <span className="text-[#9498a1]">{row.addr}</span>
                <span className="text-[#e4e8f1]">{row.hex}</span>
                <span className="text-[#78d29c]">{row.ascii}</span>
              </div>
            ))}
          </div>
        ) : (
          <pre className="bg-[#0a0d13] border border-[#2d3038] p-2.5 font-mobilis text-[11px] text-[#b9bec7] overflow-x-auto">
            {`// print_heap()\n${dumpLines.join('\n')}`}
          </pre>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
 * 8. REDWIRE (Sifr-Dev/redwire)
 * ==========================================================================*/
function RedisCloneDemo() {
  const [store, setStore] = useState<Record<string, string>>({
    'sifr:shift': '0',
    'argos:mode': 'strict',
  });
  const [cmdInput, setCmdInput] = useState('SET node mobilis');
  const [history, setHistory] = useState<Array<{ cmd: string; res: string; err: boolean }>>([
    { cmd: 'PING', res: 'PONG', err: false },
    { cmd: 'GET sifr:shift', res: '"0"', err: false },
  ]);

  const runCmd = (raw: string) => {
    const out = executeRedisCommand(store, raw);
    setStore(out.nextStore);
    setHistory((h) => [...h.slice(-4), { cmd: raw, res: out.output, err: out.isError }]);
    haptics.trigger(out.isError ? 'garble' : 'confirm');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {['PING', 'KEYS', 'GET sifr:shift', 'SET bench 147us', 'DEL argos:mode'].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => runCmd(preset)}
            className="min-h-[36px] px-2.5 py-1 border border-[#2d3038] bg-[#171b21] hover:border-[#eab444] font-mobilis text-xs text-[#f3f7fe] cursor-pointer"
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-3">
        <div className="border border-[#2d3038] bg-[#04060b] p-3 font-mobilis text-xs space-y-2">
          {history.map((item, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="text-[#9498a1]">
                127.0.0.1:6379&gt; <span className="text-[#f3f7fe]">{item.cmd}</span>
              </div>
              <div className={item.err ? 'text-[#fc5855]' : 'text-[#eab444] whitespace-pre-wrap'}>
                {item.res}
              </div>
            </div>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (cmdInput.trim()) {
                runCmd(cmdInput);
                setCmdInput('');
              }
            }}
            className="flex gap-2 pt-2 border-t border-[#2d3038]"
          >
            <input
              type="text"
              value={cmdInput}
              onChange={(e) => setCmdInput(e.target.value)}
              aria-label="Redis command input"
              placeholder="SET key value"
              className="flex-1 min-h-[38px] px-3 bg-[#0a0d13] border border-[#2d3038] text-[#f3f7fe] font-mobilis text-xs"
            />
            <button
              type="submit"
              className="min-h-[38px] px-4 bg-[#eab444] text-[#04060b] font-bold uppercase tracking-wider cursor-pointer"
            >
              Exec
            </button>
          </form>
        </div>

        <div className="border border-[#2d3038] bg-[#04060b] p-3 font-mobilis text-[11px] space-y-1.5">
          <div className="text-[#9498a1] border-b border-[#2d3038] pb-1">
            sync.RWMutex map[{Object.keys(store).length}]
          </div>
          {Object.keys(store).length === 0 ? (
            <div className="text-[#9498a1]">(empty)</div>
          ) : (
            Object.entries(store).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 truncate">
                <span className="text-[#eab444] truncate">{k}</span>
                <span className="text-[#f3f7fe] truncate">"{v}"</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 9. PROCSTATD (Sifr-Dev/procstatd)
 * Exact JSON field names {"cpu", "mem", "procs"} + /health + /proc raw lines
 * ==========================================================================*/
function SysmonDaemonDemo() {
  const [tick, setTick] = useState(0);
  const [endpoint, setEndpoint] = useState<'/api/sysmon' | '/health'>('/api/sysmon');

  const samples = [
    { cpu: 16.42, mem: 4812, procs: 147, jiffies: 'cpu  142810 412 31804 904210 1920 0 842 0' },
    { cpu: 21.85, mem: 5196, procs: 154, jiffies: 'cpu  143190 412 32018 905480 1924 0 850 0' },
    { cpu: 15.63, mem: 4620, procs: 144, jiffies: 'cpu  143412 414 32140 906910 1928 0 854 0' },
    { cpu: 23.14, mem: 5480, procs: 158, jiffies: 'cpu  143940 416 32410 908120 1935 0 861 0' },
  ];
  const sample = samples[tick % samples.length];

  return (
    <div className="border border-[#2d3038] bg-[#04060b] p-4 space-y-3 font-mobilis text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {(['/api/sysmon', '/health'] as const).map((ep) => (
            <button
              key={ep}
              type="button"
              onClick={() => {
                haptics.trigger('tap');
                setEndpoint(ep);
              }}
              className={`min-h-[36px] px-3 py-1 border cursor-pointer ${
                endpoint === ep
                  ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                  : 'border-[#2d3038] bg-[#0a0d13] text-[#b9bec7]'
              }`}
            >
              GET {ep}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            haptics.trigger('detent');
            setTick((t) => t + 1);
          }}
          className="min-h-[36px] px-3 border border-[#2d3038] bg-[#171b21] hover:border-[#eab444] text-[#f3f7fe] cursor-pointer"
        >
          Collect() /proc
        </button>
      </div>

      <div className="text-[11px] text-[#9498a1] border border-[#2d3038] bg-[#0a0d13] px-3 py-2 truncate">
        /proc/stat -&gt; {sample.jiffies}
      </div>

      <pre className="text-[#f3f7fe] bg-[#0a0d13] p-3 border border-[#2d3038] overflow-x-auto">
        {endpoint === '/api/sysmon'
          ? JSON.stringify(
              { cpu: sample.cpu, mem: sample.mem, procs: sample.procs },
              null,
              2
            )
          : JSON.stringify({ status: 'OK' }, null, 2)}
      </pre>
    </div>
  );
}

/* ============================================================================
 * 10. MIZAN (Sifr-Dev/mizan)
 * Interactive Hexagonal Request + Purpose-Bound HS256 Role + Fixed-Window Redis Limiter
 * ==========================================================================*/
const GODB_ROUTES = [
  { method: 'GET', path: '/api/v1/tasks/', adminOnly: false, sqlc: 'ListTasksByUser(ctx, userID)' },
  { method: 'POST', path: '/api/v1/tasks/', adminOnly: false, sqlc: 'CreateTask(ctx, CreateTaskParams)' },
  { method: 'GET', path: '/api/v1/admin/users', adminOnly: true, sqlc: 'ListAllUsers(ctx)' },
  { method: 'PUT', path: '/api/v1/admin/users/7/promote', adminOnly: true, sqlc: 'PromoteUserToAdmin(ctx, 7)' },
] as const;

function GoDbHexDemo() {
  const [routeIdx, setRouteIdx] = useState(0);
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [rateRemaining, setRateRemaining] = useState(98);
  const [activeLayer, setActiveLayer] = useState(3);

  const route = GODB_ROUTES[routeIdx];
  const blockedRate = rateRemaining <= 0;
  const blockedRbac = !blockedRate && route.adminOnly && role !== 'admin';
  const statusCode = blockedRate ? 429 : blockedRbac ? 403 : 200;

  const layers = [
    {
      layer: '1. Delivery (chi + HS256 JWT + Fixed-Window Redis)',
      detail: blockedRate
        ? 'Redis fixed-window counter exhausted -> 429 Too Many Requests'
        : blockedRbac
          ? `JWT role="${role}" rejected by AdminMiddleware -> 403 Forbidden`
          : `HS256 valid (role=${role}, sid/jti bound); fixed-window tokens=${rateRemaining}/100 -> passed to UseCase`,
    },
    {
      layer: '2. Use Case (task_service / admin_service)',
      detail: blockedRate || blockedRbac ? 'Aborted at Delivery guard.' : 'Application rules & ownership verified.',
    },
    {
      layer: '3. Domain (domain/task.go, domain/user.go)',
      detail: blockedRate || blockedRbac ? 'Skipped.' : 'Domain entities & interfaces (stdlib + google/uuid).',
    },
    {
      layer: '4. Repository (sqlc + pgx/v5 PostgreSQL)',
      detail: blockedRate || blockedRbac ? 'No DB query executed.' : `sqlc: ${route.sqlc}`,
    },
  ];

  const dispatch = () => {
    setRateRemaining((r) => Math.max(0, r - 1));
    setActiveLayer(statusCode === 200 ? 3 : 0);
    haptics.trigger(statusCode === 200 ? 'confirm' : 'garble');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {GODB_ROUTES.map((rt, idx) => (
            <button
              key={rt.path + rt.method}
              type="button"
              onClick={() => {
                haptics.trigger('tap');
                setRouteIdx(idx);
              }}
              className={`min-h-[36px] px-2.5 py-1 border font-mobilis text-[11px] cursor-pointer ${
                routeIdx === idx
                  ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                  : 'border-[#2d3038] bg-[#0a0d13] text-[#b9bec7]'
              }`}
            >
              {rt.method} {rt.path.replace('/api/v1', '')}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => {
              haptics.trigger('detent');
              setRole((r) => (r === 'user' ? 'admin' : 'user'));
            }}
            className="min-h-[36px] px-2.5 py-1 border border-[#2d3038] bg-[#171b21] font-mobilis text-xs text-[#eab444] cursor-pointer"
          >
            JWT Role: {role}
          </button>
          <button
            type="button"
            onClick={dispatch}
            className="min-h-[36px] px-3 py-1 bg-[#eab444] text-[#04060b] font-mobilis text-xs font-bold cursor-pointer"
          >
            Dispatch ({statusCode})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {layers.map((l, idx) => {
          const isErrorStop = statusCode !== 200 && idx === 0;
          const highlighted = idx <= activeLayer && (statusCode === 200 || idx === 0);
          return (
            <div
              key={l.layer}
              className={`p-2.5 border font-mobilis text-xs transition-colors ${
                isErrorStop
                  ? 'border-[#fc5855] bg-[#171b21] text-[#fc5855]'
                  : highlighted
                    ? 'border-[#eab444]/80 bg-[#171b21] text-[#f3f7fe]'
                    : 'border-[#2d3038] bg-[#04060b] text-[#9498a1]'
              }`}
            >
              <div className="font-bold">{l.layer}</div>
              <div className="mt-0.5 text-[11px] opacity-90">{l.detail}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
 * 11. LOCKSTEP (Sifr-Dev/lockstep)
 * Exact initial tasks (#1 Initialize neural network, #2 Deploy microservices) + shared HTTP API
 * ==========================================================================*/
function TaskManagerCliDemo() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Initialize neural network', status: 'done' as 'done' | 'pending' },
    { id: 2, title: 'Deploy microservices', status: 'pending' as 'done' | 'pending' },
  ]);
  const [title, setTitle] = useState('');
  const [lastHttp, setLastHttp] = useState('GET /api/tasks -> 200 OK (2 tasks)');

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          haptics.trigger('confirm');
          const nextTask = {
            id: tasks.length + 1,
            title: title.trim(),
            status: 'pending' as const,
          };
          setTasks((prev) => [...prev, nextTask]);
          setLastHttp(`POST /api/tasks -> ${JSON.stringify(nextTask)}`);
          setTitle('');
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='POST /api/tasks {"title": "..."}'
          aria-label="New task title"
          className="flex-1 min-h-[38px] px-3 bg-[#04060b] border border-[#2d3038] font-mobilis text-xs text-[#f3f7fe]"
        />
        <button
          type="submit"
          className="min-h-[38px] px-4 bg-[#eab444] text-[#04060b] font-mobilis text-xs font-bold cursor-pointer"
        >
          POST
        </button>
      </form>

      <div className="border border-[#2d3038] bg-[#04060b] divide-y divide-[#2d3038]">
        {tasks.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              haptics.trigger('detent');
              const nextStatus: 'done' | 'pending' = t.status === 'pending' ? 'done' : 'pending';
              setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: nextStatus } : x)));
              setLastHttp(
                `PATCH /api/tasks?id=${t.id} -> ${JSON.stringify({ ...t, status: nextStatus })}`
              );
            }}
            className="w-full min-h-[44px] px-3 py-2 flex items-center justify-between font-mobilis text-xs text-left hover:bg-[#171b21] cursor-pointer"
          >
            <span className={t.status === 'done' ? 'line-through text-[#9498a1]' : 'text-[#f3f7fe]'}>
              #{t.id} {t.title}
            </span>
            <span className={t.status === 'done' ? 'text-[#eab444]' : 'text-[#9498a1]'}>
              {t.status}
            </span>
          </button>
        ))}
      </div>

      <div className="border border-[#2d3038] bg-[#0a0d13] px-3 py-2 font-mobilis text-[11px] text-[#eab444] overflow-x-auto whitespace-nowrap">
        sync.Mutex: {lastHttp}
      </div>
    </div>
  );
}

/* ============================================================================
 * 12. SIFR (Sifr-Dev/SIFR)
 * Interactive 24-cell Alberti cipher wheel & spring detent physics bench
 * ==========================================================================*/
function SifrCipherDemo() {
  const [shift, setShift] = useState(0);
  const decoded = decodeRingAtShift(shift);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => {
              haptics.trigger('detent');
              setShift((s) => normalizeShift(s - 1));
            }}
            className="min-h-[36px] px-3 py-1 border border-[#2d3038] bg-[#171b21] hover:border-[#eab444] font-mobilis text-xs font-medium text-[#f3f7fe] cursor-pointer"
          >
            -15° Detent
          </button>
          <button
            type="button"
            onClick={() => {
              haptics.trigger('detent');
              setShift((s) => normalizeShift(s + 1));
            }}
            className="min-h-[36px] px-3 py-1 border border-[#2d3038] bg-[#171b21] hover:border-[#eab444] font-mobilis text-xs font-medium text-[#f3f7fe] cursor-pointer"
          >
            +15° Detent
          </button>
          <button
            type="button"
            onClick={() => {
              haptics.trigger('snapZero');
              setShift(0);
            }}
            className="min-h-[36px] px-3 py-1 bg-[#eab444] text-[#04060b] font-mobilis text-xs font-bold cursor-pointer"
          >
            Lock Shift 0
          </button>
        </div>
        <span className="font-mobilis text-xs font-semibold text-[#eab444]">
          {decoded.word} · shift {shift}
        </span>
      </div>

      <PhysicsCipherCanvas shift={shift} onShiftChange={setShift} compact />

      <div className="border border-[#2d3038] bg-[#04060b] px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 font-mobilis text-xs font-medium">
        <span className="text-[#a6acb9]">5-bit cells: {decoded.binaryGroups.join(' ')}</span>
        <span className={decoded.isZeroShift ? 'text-[#40e080] font-semibold' : 'text-[#fc5855]'}>
          {decoded.isZeroShift ? 'LOCKED · SIFR ALIGNED' : 'DETENT SHIFTED'}
        </span>
      </div>
    </div>
  );
}

/* ============================================================================
 * 13. CIPHERDESK (janus, rex, nocturne on Cipher)
 * ==========================================================================*/
const CIPHER_APPS = [
  {
    id: 'janus',
    title: 'janus',
    role: 'Flagship GPU terminal built on Cipher (replaces older terminal prototypes)',
    command: 'janus --theme void',
    metric: 'Panes, Tabs, Themes, Live RSS',
    screen: [
      'janus [Cipher Vulkan WSI / wl_shm · themes: void / paper / ember]',
      '> dlopen("libwayland-client.so.0")   OK',
      '> dlopen("libvulkan.so.1")           144 Hz WSI / wl_shm fallback',
      '> tabs: [0:shell] [1:zig-build]      live process RSS bound',
    ].join('\n'),
  },
  {
    id: 'rex',
    title: 'rex',
    role: 'Unix-socket multiplexer engine being folded directly into CipherDesk apps',
    command: 'rex split --vertical && rex send pane:1 "zig build"',
    metric: 'AF_UNIX JSON-lines · 0600 perms',
    screen: [
      '[session: main · 2 panes · socket /tmp/rex-1000.sock]',
      '+-- pane:0 (zsh) -----------------+-- pane:1 (zig) ----------------+',
      '| $ cd CipherDesk                 | $ zig build                    |',
      '| $ ./zig-out/bin/janus           | All workspace targets built.   |',
      '+---------------------------------+--------------------------------+',
    ].join('\n'),
  },
  {
    id: 'nocturne',
    title: 'nocturne',
    role: 'Offline FLAC audio player with from-zero decoder matching flac/ffmpeg on 6 fixtures',
    command: 'nocturne ~/music/album/',
    metric: 'Bit-exact FLAC · LRC/Vorbis lyrics · PulseAudio dlopen',
    screen: [
      'nocturne [from-zero FLAC decoder · PulseAudio dlopen]',
      'Track 03 / 11 · Zero Network Access · LRC/Vorbis lyrics synced',
      '[=================>----------] 02:41 / 04:18',
      'Bit-exact decoded PCM stream verified against reference flac/ffmpeg on 6 fixtures.',
    ].join('\n'),
  },
] as const;

function SifrAppsDemo() {
  const [selectedApp, setSelectedApp] = useState<'janus' | 'rex' | 'nocturne'>('janus');
  const active = CIPHER_APPS.find((a) => a.id === selectedApp) ?? CIPHER_APPS[0];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {CIPHER_APPS.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => {
                haptics.trigger('detent');
                setSelectedApp(app.id);
              }}
              className={`min-h-[36px] px-3 py-1 font-mobilis text-xs border cursor-pointer ${
                selectedApp === app.id
                  ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                  : 'border-[#2d3038] bg-[#0a0d13] text-[#b9bec7]'
              }`}
            >
              {app.title}
            </button>
          ))}
        </div>
        <span className="font-mobilis text-xs text-[#eab444]">{active.metric}</span>
      </div>

      <div className="border border-[#2d3038] bg-[#04060b] p-4 space-y-2.5">
        <div className="text-xs text-[#a6acb9]">{active.role}</div>
        <div className="font-mobilis text-[11px] text-[#eab444] bg-[#0a0d13] border border-[#2d3038] px-3 py-2">
          $ {active.command}
        </div>
        <pre className="font-mobilis text-xs text-[#f3f7fe] bg-[#0a0d13] border border-[#2d3038] p-3 overflow-x-auto leading-relaxed">
          {active.screen}
        </pre>
      </div>
    </div>
  );
}

/* ============================================================================
 * 14. CLI SUITE (wireprobe, rowscan, sha-zero, glyphmd, huffstream, hunkdiff, barehttp)
 * ==========================================================================*/
const CLI_TOOL_SPECS: Record<
  string,
  {
    presets: { label: string; cmd: string; output: string }[];
  }
> = {
  wireprobe: {
    presets: [
      {
        label: 'HTTP Latency',
        cmd: './wireprobe api.github.com:80 -n 20 --http',
        output: [
          'target: api.github.com:80 (20 samples)',
          'tcp connect  min 11.2ms  p50 14.1ms  p90 18.4ms  p99 22.9ms',
          'http 1st-B   min 32.8ms  p50 38.4ms  p90 46.2ms  p99 54.0ms',
        ].join('\n'),
      },
      {
        label: 'JSON Output',
        cmd: './wireprobe localhost:3000 -n 10 --json',
        output: '{"host":"localhost:3000","samples":10,"p50_ms":0.24,"p90_ms":0.39,"p99_ms":0.52,"errors":0}',
      },
    ],
  },
  rowscan: {
    presets: [
      {
        label: 'Group & Sum',
        cmd: 'rowscan events.csv --where "status=200" --group-by route --sum bytes',
        output: [
          'route       | count | sum(bytes)',
          '------------+-------+-----------',
          '/api/signal |    42 |     118420',
          '/api/repos  |   198 |     842100',
        ].join('\n'),
      },
      {
        label: 'Top-N Filter',
        cmd: 'rowscan traces.csv --select service,p99_ms --sort-desc p99_ms --limit 3',
        output: [
          'service,p99_ms',
          'verrev-p2p,14.8',
          'mizan-pgx,6.2',
          'barehttp,0.4',
        ].join('\n'),
      },
    ],
  },
  'sha-zero': {
    presets: [
      {
        label: 'FIPS 180-4 Self-Test',
        cmd: './sha-zero sha256 --selftest',
        output: [
          'KAT ""              -> e3b0c44298fc1c149afbf4c8996fb924... [OK]',
          'KAT "abc"           -> ba7816bf8f01cfea414140de5dae2223... [OK]',
          'KAT 448-bit padding -> 248d6a61d20638b8e5c026930c3e6039... [OK]',
          'SHA256_SELFTEST: 100% PASSED',
        ].join('\n'),
      },
      {
        label: 'Hash Stdin',
        cmd: 'printf "sifr" | ./sha-zero sha256 -',
        output: '9f8e1a44b1c074a5d2e991167c2c44d8f8b2a58c0e4012fa76c218d4029011ab  -',
      },
    ],
  },
  glyphmd: {
    presets: [
      {
        label: 'Render README',
        cmd: 'cat README.md | glyphmd --width 72',
        output: [
          '[H1] Cipher Framework',
          '---------------------',
          '  * dlopen("libwayland-client.so.0") + generated wl_interface tables',
          '  * zig build test passes with Vulkan WSI + wl_shm software fallback',
        ].join('\n'),
      },
      {
        label: 'Code Block Highlight',
        cmd: 'glyphmd docs/spec.md',
        output: [
          '[QUOTE] Keep runtime layers minimal and inspectable.',
          '[CODE:rust] fn inflate_block(bits: &mut BitReader) -> Result<Vec<u8>>',
        ].join('\n'),
      },
    ],
  },
  huffstream: {
    presets: [
      {
        label: 'Gzip Decompress',
        cmd: 'huffstream < archive.tar.gz | sha256sum',
        output: [
          'header: RFC 1952 gzip (CM=8 DEFLATE)',
          'stream: dynamic Huffman blocks (32 KiB sliding window)',
          'trailer: CRC-32 0x84a1c902 MATCH · ISIZE 163840 bytes OK',
        ].join('\n'),
      },
      {
        label: '21-Fixture Parity',
        cmd: 'cargo test --test zcat_parity',
        output: 'running 21 tests: empty, ascii, utf8, binary, 160KB level 1/6/9 ... 21 passed',
      },
    ],
  },
  hunkdiff: {
    presets: [
      {
        label: 'Unified Diff',
        cmd: 'hunkdiff -u old.rs new.rs',
        output: [
          '@@ -12,4 +12,4 @@ fn handle_client(stream: TcpStream) {',
          '     let path = canonicalize_safe(&req.target)?;',
          '-    let mime = "application/octet-stream";',
          '+    let mime = detect_mime_type(&path);',
          ' }',
        ].join('\n'),
      },
      {
        label: 'Exit Codes',
        cmd: 'hunkdiff a.bin b.bin; echo "exit=$?"',
        output: 'exit=0 (identical) | exit=1 (differs) | exit=2 (I/O error) matching GNU diff -u',
      },
    ],
  },
  barehttp: {
    presets: [
      {
        label: 'Serve Directory',
        cmd: 'barehttp ./dist --port 8080',
        output: [
          'Listening on http://127.0.0.1:8080 (root ./dist)',
          'GET /index.html     200 text/html (1.5 KB)',
          'GET /app.js         200 application/javascript (42.8 KB)',
          'GET /../etc/passwd  403 Forbidden (path traversal blocked)',
        ].join('\n'),
      },
      {
        label: 'HEAD Request',
        cmd: 'curl -I http://127.0.0.1:8080/style.css',
        output: [
          'HTTP/1.1 200 OK',
          'Content-Type: text/css; charset=utf-8',
          'Content-Length: 4495',
          'Connection: close',
        ].join('\n'),
      },
    ],
  },
};

function SifrCliToolDemo({ repoId }: { repoId: string }) {
  const spec = CLI_TOOL_SPECS[repoId] ?? CLI_TOOL_SPECS.barehttp;
  const [presetIdx, setPresetIdx] = useState(0);

  useEffect(() => {
    setPresetIdx(0);
  }, [repoId]);

  const preset = spec.presets[presetIdx] ?? spec.presets[0];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {spec.presets.map((p, idx) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              haptics.trigger('detent');
              setPresetIdx(idx);
            }}
            className={`min-h-[36px] px-3 py-1 font-mobilis text-xs border cursor-pointer ${
              presetIdx === idx
                ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                : 'border-[#2d3038] bg-[#0a0d13] text-[#b9bec7]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="border border-[#2d3038] bg-[#04060b] p-4 space-y-2.5">
        <div className="font-mobilis text-[11px] text-[#eab444] bg-[#0a0d13] border border-[#2d3038] px-3 py-2 overflow-x-auto whitespace-nowrap">
          $ {preset.cmd}
        </div>
        <pre className="font-mobilis text-xs text-[#f3f7fe] bg-[#0a0d13] border border-[#2d3038] p-3 overflow-x-auto leading-relaxed">
          {preset.output}
        </pre>
      </div>
    </div>
  );
}
