import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const slidesOutDir = path.join(__dirname, 'slides');
fs.mkdirSync(slidesOutDir, { recursive: true });

const require = createRequire('/usr/local/share/bun-global/node_modules/playwright/package.json');
const { chromium } = require('/usr/local/share/bun-global/node_modules/playwright');

function fontDataUri(fileName, mime) {
  const buf = fs.readFileSync(path.join(rootDir, 'public', 'fonts', fileName));
  return `data:${mime};base64,${buf.toString('base64')}`;
}

const FONT_CSS = `
@font-face {
  font-family: "Instrument Sans";
  font-weight: 400 800;
  src: url("${fontDataUri('InstrumentSans-Var.ttf', 'font/ttf')}") format("truetype");
}
@font-face {
  font-family: "Instrument Sans Bold";
  font-weight: 700;
  src: url("${fontDataUri('InstrumentSans-Bold.ttf', 'font/ttf')}") format("truetype");
}
@font-face {
  font-family: "Geist Mono";
  font-weight: 400;
  src: url("${fontDataUri('GeistMono-Regular.ttf', 'font/ttf')}") format("truetype");
}
@font-face {
  font-family: "Geist Mono";
  font-weight: 500;
  src: url("${fontDataUri('GeistMono-Medium.woff2', 'font/woff2')}") format("woff2");
}
@font-face {
  font-family: "Geist Mono";
  font-weight: 700;
  src: url("${fontDataUri('GeistMono-Bold.ttf', 'font/ttf')}") format("truetype");
}
`;

const SIFR_MARK_SVG = `
<svg width="42" height="42" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="28" stroke="#2d3038" stroke-width="2" />
  <circle cx="32" cy="32" r="20" stroke="#eab444" stroke-width="2" />
  <line x1="32" y1="4" x2="32" y2="18" stroke="#eab444" stroke-width="2.5" />
  <circle cx="32" cy="32" r="5" fill="#eab444" />
  <circle cx="32" cy="12" r="3" fill="#f3f7fe" />
</svg>
`;

function ringDiagramSvg(size = 340) {
  const dots = Array.from({ length: 24 }, (_, i) => {
    const a = ((-90 + i * 15) * Math.PI) / 180;
    const x = (170 + Math.cos(a) * 124).toFixed(2);
    const y = (170 + Math.sin(a) * 124).toFixed(2);
    const isZero = i === 0;
    return `<circle cx="${x}" cy="${y}" r="${isZero ? 6.5 : 3.5}" fill="${isZero ? '#eab444' : '#f3f7fe'}" fill-opacity="${isZero ? '1' : '0.68'}" />`;
  }).join('\n');

  const spokes = Array.from({ length: 12 }, (_, i) => {
    const a = ((-90 + i * 30) * Math.PI) / 180;
    const x1 = (170 + Math.cos(a) * 62).toFixed(2);
    const y1 = (170 + Math.sin(a) * 62).toFixed(2);
    const x2 = (170 + Math.cos(a) * 116).toFixed(2);
    const y2 = (170 + Math.sin(a) * 116).toFixed(2);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${i === 0 ? '#eab444' : '#2d3038'}" stroke-width="${i === 0 ? 2 : 1}" />`;
  }).join('\n');

  return `
  <svg width="${size}" height="${size}" viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="170" cy="170" r="154" stroke="#2d3038" stroke-width="1" stroke-dasharray="4 6" />
    <circle cx="170" cy="170" r="124" stroke="#2d3038" stroke-width="1.5" />
    <circle cx="170" cy="170" r="88" stroke="#eab444" stroke-opacity="0.35" stroke-width="1" />
    <circle cx="170" cy="170" r="56" stroke="#2d3038" stroke-width="1.5" />
    ${spokes}
    ${dots}
    <circle cx="170" cy="170" r="12" fill="#eab444" />
    <circle cx="170" cy="170" r="5" fill="#04060b" />
  </svg>`;
}

const BASE_CSS = `
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
html, body {
  width: 1080px;
  background: #04060b;
  color: #f3f7fe;
  font-family: "Instrument Sans", sans-serif;
  -webkit-font-smoothing: antialiased;
}
.mono {
  font-family: "Geist Mono", monospace;
  font-variant-numeric: tabular-nums;
}
.slide {
  width: 1080px;
  height: 1350px;
  background: #04060b;
  position: relative;
  overflow: hidden;
  padding: 64px 72px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  page-break-after: always;
}
.slide:last-child {
  page-break-after: auto;
}
.grid-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(ellipse 55% 45% at 80% 18%, rgba(234, 180, 68, 0.085), transparent 72%),
    radial-gradient(circle at 1px 1px, rgba(243, 247, 254, 0.055) 1px, transparent 0);
  background-size: 100% 100%, 40px 40px;
}
.content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24px;
  border-bottom: 1px solid #2d3038;
}
.brand-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
}
.brand-title {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #ffffff;
}
.brand-sub {
  font-size: 15px;
  color: #a6acb9;
}
.slide-num {
  font-size: 16px;
  font-weight: 700;
  color: #eab444;
  border: 1px solid #2d3038;
  background: #0a0d13;
  padding: 8px 16px;
}
.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 22px;
  border-top: 1px solid #2d3038;
  font-size: 15px;
  color: #a6acb9;
}
.eyebrow {
  font-size: 15px;
  font-weight: 700;
  color: #eab444;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 14px;
}
h1, h2 {
  color: #ffffff;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.08;
}
.card {
  background: #0a0d13;
  border: 1px solid #2d3038;
  padding: 28px 30px;
}
.pill-badge {
  display: inline-block;
  border: 1px solid rgba(64, 224, 128, 0.55);
  color: #40e080;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 700;
}
.pill-warn {
  display: inline-block;
  border: 1px solid rgba(234, 180, 68, 0.65);
  color: #eab444;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 700;
}
`;

function wrapSlideHtml(slideIndex, totalSlides, headerTag, bodyHtml) {
  return `
  <section class="slide">
    <div class="grid-bg"></div>
    <div class="content">
      <div class="top-bar">
        <div class="brand-wrap">
          ${SIFR_MARK_SVG}
          <div>
            <div class="brand-title">SIFR · MOHAMED SALAHY</div>
            <div class="brand-sub mono">github.com/Sifr-Dev · Co-Founder &amp; Tech Lead @Argos-Security</div>
          </div>
        </div>
        <div class="slide-num mono">${String(slideIndex).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')} · ${headerTag}</div>
      </div>

      <div style="flex:1; display:flex; flex-direction:column; justify-content:center; padding: 34px 0;">
        ${bodyHtml}
      </div>

      <div class="bottom-bar mono">
        <span>https://sifr-dev.vercel.app</span>
        <span style="color:#eab444;">20 PUBLIC REPOSITORIES · NO BLACK BOXES</span>
      </div>
    </div>
  </section>`;
}

const SLIDE_BODIES = [
  // SLIDE 01: COVER
  {
    tag: 'COMEBACK',
    html: `
      <div style="display:grid; grid-template-columns: 1.25fr 0.75fr; gap: 36px; align-items:center;">
        <div>
          <div class="eyebrow mono">ONE YEAR BUILDING FROM FIRST PRINCIPLES</div>
          <h1 style="font-size: 74px; margin-bottom: 26px;">Rebuilt From the Layer Underneath.</h1>
          <p style="font-size: 25px; line-height: 1.5; color: #d5dce8; font-weight: 500;">
            I stepped away from posting to write every layer myself: Wayland/Vulkan UI in Zig,
            Triton GPU kernels, Linux telemetry daemons, fixed-window Go APIs, and pure-Rust cryptography.
          </p>
        </div>
        <div style="display:flex; justify-content:center; align-items:center;">
          ${ringDiagramSvg(330)}
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 54px;">
        <div class="card" style="padding: 24px 22px;">
          <div class="mono" style="font-size: 32px; font-weight: 700; color:#eab444; white-space: nowrap;">20</div>
          <div style="font-size: 15px; color:#c9d0de; margin-top:8px;">Canonical Sifr-Dev Repos</div>
        </div>
        <div class="card" style="padding: 24px 22px;">
          <div class="mono" style="font-size: 32px; font-weight: 700; color:#eab444; white-space: nowrap;">628 KB</div>
          <div style="font-size: 15px; color:#c9d0de; margin-top:8px;">Cipher Binary (4 Libs)</div>
        </div>
        <div class="card" style="padding: 24px 22px;">
          <div class="mono" style="font-size: 32px; font-weight: 700; color:#eab444; white-space: nowrap;">0.147ms</div>
          <div style="font-size: 15px; color:#c9d0de; margin-top:8px;">RMSNorm XLA Kernel</div>
        </div>
        <div class="card" style="padding: 24px 22px;">
          <div class="mono" style="font-size: 32px; font-weight: 700; color:#eab444; white-space: nowrap;">48 / 48</div>
          <div style="font-size: 15px; color:#c9d0de; margin-top:8px;">Verrev Rust Crypto Tests</div>
        </div>
      </div>
    `,
  },

  // SLIDE 02: THE 4-ACT STACK MAP
  {
    tag: 'ARCHITECTURE',
    html: `
      <div class="eyebrow mono">THE FULL PROGRESSION · 4 ACTS ACROSS 20 REPOSITORIES</div>
      <h2 style="font-size: 52px; margin-bottom: 18px;">Four Layers Owned End to End</h2>
      <p style="font-size: 22px; color:#c9d0de; line-height:1.45; margin-bottom: 34px;">
        Each project answered one technical question and removed one abstraction boundary.
      </p>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 22px;">
        <div class="card" style="border-top: 3px solid #eab444;">
          <div class="mono" style="font-size:15px; color:#eab444; font-weight:700;">PART I · WEB &amp; SOCKETS</div>
          <div style="font-size:28px; font-weight:800; margin: 10px 0 12px;">First Systems</div>
          <p style="font-size:18px; color:#d5dce8; line-height:1.5; margin-bottom:16px;">
            Clean-architecture Go REST APIs, Redis fixed-window limiters, RESP2 TCP servers, and static HTTP servers.
          </p>
          <div class="mono" style="font-size:14px; color:#a6acb9;">mizan · lockstep · redwire · barehttp · wireprobe</div>
        </div>

        <div class="card" style="border-top: 3px solid #eab444;">
          <div class="mono" style="font-size:15px; color:#eab444; font-weight:700;">PART II · MODELS &amp; SILICON</div>
          <div style="font-size:28px; font-weight:800; margin: 10px 0 12px;">Math to Silicon</div>
          <p style="font-size:18px; color:#d5dce8; line-height:1.5; margin-bottom:16px;">
            Stdlib scoring prototypes, PlantVillage VGG16 offline diagnostics, and fused Triton/XLA kernels on RTX 4060.
          </p>
          <div class="mono" style="font-size:14px; color:#a6acb9;">logitrisk · GreenLens · subtorch</div>
        </div>

        <div class="card" style="border-top: 3px solid #eab444;">
          <div class="mono" style="font-size:15px; color:#eab444; font-weight:700;">PART III · KERNEL &amp; CRYPTO</div>
          <div style="font-size:28px; font-weight:800; margin: 10px 0 12px;">Memory &amp; Trust</div>
          <p style="font-size:18px; color:#d5dce8; line-height:1.5; margin-bottom:16px;">
            POSIX sbrk allocators, /proc telemetry daemons, FIPS SHA-256, and pure-Rust PQ capability primitives.
          </p>
          <div class="mono" style="font-size:14px; color:#a6acb9;">freelist · procstatd · tachyon-fetch · sha-zero · verrev</div>
        </div>

        <div class="card" style="border-top: 3px solid #eab444;">
          <div class="mono" style="font-size:15px; color:#eab444; font-weight:700;">PART IV · TOOLS &amp; NATIVE UI</div>
          <div style="font-size:28px; font-weight:800; margin: 10px 0 12px;">Crafted From Zero</div>
          <p style="font-size:18px; color:#d5dce8; line-height:1.5; margin-bottom:16px;">
            RFC 1951 gunzip, Myers LCS diff, CSV query engine, Zig Wayland/Vulkan toolkit, and native desktop suite.
          </p>
          <div class="mono" style="font-size:14px; color:#a6acb9;">rowscan · glyphmd · huffstream · hunkdiff · Cipher · CipherDesk</div>
        </div>
      </div>
    `,
  },

  // SLIDE 03: CIPHER + CIPHERDESK
  {
    tag: 'FLAGSHIP 01',
    html: `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <div class="eyebrow mono" style="margin:0;">ZIG · NATIVE LINUX UI TOOLKIT &amp; DESKTOP SUITE</div>
        <span class="pill-badge mono">Links libc only · dlopen() Wayland/Vulkan</span>
      </div>
      <h2 style="font-size: 56px; margin-bottom: 18px;">Cipher &amp; CipherDesk</h2>
      <p style="font-size: 21px; color:#d5dce8; line-height:1.5; margin-bottom: 28px;">
        Built without GTK, Qt, Skia, FreeType, or C-SDK wrappers. Generated wl_interface XML tables,
        handwritten Vulkan WSI or wl_shm fallback, custom SFNT parser (2,620 glyphs), and 2-pass flexbox.
      </p>

      <div class="card" style="margin-bottom: 24px; padding: 24px 28px;">
        <div class="mono" style="font-size: 14px; color:#eab444; font-weight:700; margin-bottom:14px;">
          SAME-HARDWARE BENCHMARK (RYZEN 7 7435HS · RTX 4060 · bench/BENCH.md)
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:18px;" class="mono">
          <thead>
            <tr style="border-bottom: 2px solid #2d3038; color:#eab444; text-align:left;">
              <th style="padding:12px 8px;">Toolkit</th>
              <th style="padding:12px 8px;">Stripped Bin</th>
              <th style="padding:12px 8px;">Shared Libs</th>
              <th style="padding:12px 8px;">105-Ctrl CPU Frame</th>
            </tr>
          </thead>
          <tbody style="color:#f3f7fe;">
            <tr style="border-bottom: 1px solid #2d3038; background:#04060b;">
              <td style="padding:14px 8px; color:#eab444; font-weight:700;">Cipher (wl_shm / VK)</td>
              <td style="padding:14px 8px;">628 KB</td>
              <td style="padding:14px 8px;">4 (libc/m/dl)</td>
              <td style="padding:14px 8px; color:#40e080; font-weight:700;">0.030 - 0.035 ms</td>
            </tr>
            <tr style="border-bottom: 1px solid #2d3038;">
              <td style="padding:14px 8px;">Qt6 Reference</td>
              <td style="padding:14px 8px;">49 MB +deps</td>
              <td style="padding:14px 8px;">45 libs</td>
              <td style="padding:14px 8px;">0.925 - 0.950 ms</td>
            </tr>
            <tr>
              <td style="padding:14px 8px;">GTK4 Reference</td>
              <td style="padding:14px 8px;">~294-305 MB</td>
              <td style="padding:14px 8px;">113 libs</td>
              <td style="padding:14px 8px;">1.086 - 1.197 ms</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <div class="card" style="padding: 20px;">
          <div class="mono" style="font-size: 20px; font-weight:700; color:#eab444;">janus</div>
          <div style="font-size: 16px; color:#d5dce8; margin-top:8px;">Flagship GPU terminal with panes, tabs, void/paper/ember themes, and live RSS.</div>
        </div>
        <div class="card" style="padding: 20px;">
          <div class="mono" style="font-size: 20px; font-weight:700; color:#eab444;">rex</div>
          <div style="font-size: 16px; color:#d5dce8; margin-top:8px;">AF_UNIX JSON-lines multiplexer engine folded directly into apps.</div>
        </div>
        <div class="card" style="padding: 20px;">
          <div class="mono" style="font-size: 20px; font-weight:700; color:#eab444;">nocturne</div>
          <div style="font-size: 16px; color:#d5dce8; margin-top:8px;">Bit-exact from-zero FLAC decoder (6 fixtures) + LRC/Vorbis lyrics.</div>
        </div>
      </div>

      <p class="mono" style="font-size: 13px; color:#a6acb9; margin-top: 20px;">
        Caveat: Vulkan GPU RSS reflects ~270-325 MB NVIDIA driver floor; Cipher omits HarfBuzz shaping, IME, AT-SPI, printing.
      </p>
    `,
  },

  // SLIDE 04: SUBTORCH
  {
    tag: 'FLAGSHIP 02',
    html: `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <div class="eyebrow mono" style="margin:0;">PYTHON · TRITON · JAX XLA · CUDA BENCHMARKS</div>
        <span class="pill-badge mono">pytest -q: 36 passed · Zero-Copy DLPack</span>
      </div>
      <h2 style="font-size: 56px; margin-bottom: 18px;">subtorch</h2>
      <p style="font-size: 22px; color:#d5dce8; line-height:1.5; margin-bottom: 30px;">
        Cross-backend GPU kernel suite timing fused Triton primitives and JAX XLA against PyTorch
        Inductor and cuDNN/CUTLASS SDPA using CUDA events and shared DLPack tensor views.
      </p>

      <div class="card" style="margin-bottom: 24px;">
        <div class="mono" style="font-size:15px; color:#eab444; font-weight:700; margin-bottom: 18px;">
          RMSNORM · 4096 x 4096 FP16 · RTX 4060 LAPTOP (LOWER IS FASTER)
        </div>
        ${[
          { label: 'PyTorch Reference', val: '3.360 ms', pct: 100, color: '#494d55', note: '1.0x baseline' },
          { label: 'torch.compile (Inductor)', val: '0.318 ms', pct: 14, color: '#f3f7fe', note: '10.6x' },
          { label: 'Triton Fused Kernel', val: '0.311 ms', pct: 13, color: '#f3f7fe', note: '10.8x' },
          { label: 'JAX JIT (XLA + DLPack)', val: '0.147 ms', pct: 8, color: '#eab444', note: '22.8x fastest' },
        ]
          .map(
            (r) => `
          <div style="margin-bottom:16px;">
            <div class="mono" style="display:flex; justify-content:space-between; font-size:17px; margin-bottom:6px;">
              <span style="font-weight:700; color:#f3f7fe;">${r.label}</span>
              <span style="color:${r.color === '#eab444' ? '#eab444' : '#d5dce8'};">${r.val} · ${r.note}</span>
            </div>
            <div style="height:14px; width:100%; background:#171b21;">
              <div style="height:100%; width:${r.pct}%; background:${r.color};"></div>
            </div>
          </div>`
          )
          .join('')}
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div class="card">
          <div class="mono" style="font-size:14px; color:#eab444; font-weight:700;">RMSNORM 8192x4096 FP32</div>
          <div class="mono" style="font-size:32px; font-weight:700; color:#ffffff; margin: 10px 0;">0.173 ms <span style="font-size:18px; color:#eab444;">(23.6x)</span></div>
          <div style="font-size:16px; color:#c9d0de;">XLA beats Triton (1.203 ms) and Inductor (1.215 ms) vs 4.078 ms PyTorch baseline.</div>
        </div>
        <div class="card">
          <div class="mono" style="font-size:14px; color:#eab444; font-weight:700;">FLASHATTENTION · SDPA PARITY</div>
          <div class="mono" style="font-size:32px; font-weight:700; color:#ffffff; margin: 10px 0;">0.617 ms <span style="font-size:18px; color:#40e080;">bf16</span></div>
          <div style="font-size:16px; color:#c9d0de;">Matches non-causal fp16 SDPA (0.614 ms), while SDPA wins causal fp16 (0.372 vs 0.632 ms).</div>
        </div>
      </div>
    `,
  },

  // SLIDE 05: VERREV + GREENLENS
  {
    tag: 'PROTOTYPES & VISION',
    html: `
      <div class="eyebrow mono">PURE RUST PQ CAPABILITY &amp; OFFLINE PLANT DIAGNOSTICS</div>
      <h2 style="font-size: 50px; margin-bottom: 24px;">Verrev &amp; GreenLens</h2>

      <div style="display:grid; grid-template-columns: 1fr; gap: 26px;">
        <div class="card" style="border-left: 4px solid #eab444;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="font-size: 32px; font-weight:800;">verrev (Rust)</div>
            <span class="pill-warn mono">Early Prototype · 48 tests / 7 crates</span>
          </div>
          <p style="font-size: 19px; color:#e4e8f1; line-height:1.55; margin-bottom:18px;">
            Zero-crate post-quantum capability OS exploration. Working crates verify SHA3/SHAKE (Keccak-f[1600]),
            ML-KEM-1024, ML-DSA-87, XChaCha20-Poly1305 (27 crypto tests), identity, capability ACLs, and storage.
          </p>
          <div class="mono" style="background:#04060b; border:1px solid #2d3038; padding:14px 18px; font-size:15px; color:#c9d0de;">
            Honest scope: 9 crates (transport, p2p discovery, mesh, CRDT sync, wasm) are explicit interface stubs.
          </div>
        </div>

        <div class="card" style="border-left: 4px solid #40e080;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="font-size: 32px; font-weight:800;">GreenLens (Rust + Python)</div>
            <span class="pill-badge mono">95.5% Accuracy · 0.95 Macro F1</span>
          </div>
          <p style="font-size: 19px; color:#e4e8f1; line-height:1.55; margin-bottom:18px;">
            Native Rust egui OpenGL GUI communicating over JSON-lines stdio with a fine-tuned VGG16 Block5
            leaf classifier and offline SQLite extension guidance database across 15 crop classes.
          </p>
          <div class="mono" style="background:#04060b; border:1px solid #2d3038; padding:14px 18px; font-size:15px; color:#c9d0de;">
            Evaluated on 3,095 held-out PlantVillage images (70/15/15 deduplicated split; controlled lighting caveat).
          </div>
        </div>
      </div>
    `,
  },

  // SLIDE 06: CTA & REPRODUCE
  {
    tag: 'EXPLORE SIFR',
    html: `
      <div style="text-align:left; margin-bottom: 34px;">
        <div class="eyebrow mono">TWO-LAYER PRESENTATION · FULL SOURCE ACCESS</div>
        <h2 style="font-size: 62px; margin-bottom: 22px;">Investigate Every System &amp; Benchmark Live.</h2>
        <p style="font-size: 24px; color:#d5dce8; line-height:1.5;">
          Filter all 20 repositories by language or subsystem, inspect architecture dossiers, test
          simulations in the browser, or clone and run every benchmark directly from GitHub.
        </p>
      </div>

      <div class="card" style="margin-bottom: 28px; background:#04060b; padding: 24px 26px;">
        <div class="mono" style="font-size:14px; color:#eab444; font-weight:700; margin-bottom:14px;">
          REPRODUCE FROM TERMINAL
        </div>
        <pre class="mono" style="font-size:14.5px; color:#f3f7fe; line-height:1.85; white-space:pre-wrap;">$ git clone https://github.com/Sifr-Dev/Cipher.git && cd Cipher && zig build test
$ git clone https://github.com/Sifr-Dev/subtorch.git && cd subtorch && pytest -q
$ git clone https://github.com/Sifr-Dev/verrev.git && cd verrev && cargo test --workspace
$ git clone https://github.com/Sifr-Dev/mizan.git && cd mizan && go test ./...</pre>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div class="card">
          <div class="mono" style="font-size:14px; color:#a6acb9;">LIVE PORTFOLIO &amp; DOSSIERS</div>
          <div class="mono" style="font-size:24px; font-weight:700; color:#eab444; margin-top:8px;">https://sifr-dev.vercel.app</div>
        </div>
        <div class="card">
          <div class="mono" style="font-size:14px; color:#a6acb9;">GITHUB REPOSITORIES</div>
          <div class="mono" style="font-size:24px; font-weight:700; color:#f3f7fe; margin-top:8px;">https://github.com/Sifr-Dev</div>
        </div>
      </div>
    `,
  },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1080, height: 1350 },
      deviceScaleFactor: 1,
    });

    const slideSections = [];
    for (let i = 0; i < SLIDE_BODIES.length; i++) {
      const { tag, html } = SLIDE_BODIES[i];
      const slideHtml = wrapSlideHtml(i + 1, SLIDE_BODIES.length, tag, html);
      slideSections.push(slideHtml);

      await page.setContent(`
        <!doctype html>
        <html lang="en">
          <head><meta charset="utf-8" /><style>${FONT_CSS}${BASE_CSS}</style></head>
          <body>${slideHtml}</body>
        </html>
      `);
      await page.evaluate(() => document.fonts.ready);

      const pngPath = path.join(slidesOutDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
      await page.screenshot({ path: pngPath, fullPage: false });
      console.log(`Rendered ${pngPath}`);
    }

    // Combined 6-page LinkedIn Carousel PDF (exact 1080px x 1350px per page)
    await page.setContent(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <style>
            @page { size: 1080px 1350px; margin: 0; }
            ${FONT_CSS}
            ${BASE_CSS}
          </style>
        </head>
        <body>${slideSections.join('\n')}</body>
      </html>
    `);
    await page.evaluate(() => document.fonts.ready);

    const pdfPath = path.join(__dirname, 'sifr-carousel.pdf');
    await page.pdf({
      path: pdfPath,
      width: '1080px',
      height: '1350px',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
    });
    console.log(`Generated ${pdfPath}`);
  } finally {
    await browser.close();
  }
}

await main();
