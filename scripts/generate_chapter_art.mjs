import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '..', 'public', 'chapters');

fs.mkdirSync(outDir, { recursive: true });

const W = 1200;
const H = 800;

function round(n) {
  return Math.round(n * 100) / 100;
}

function wrapSvg(id, defs, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" fill="none" role="img" aria-label="Chapter geometric plate ${id}">
  <defs>
    <radialGradient id="glow-${id}" cx="50%" cy="50%" r="54%">
      <stop offset="0%" stop-color="#eab444" stop-opacity="0.16" />
      <stop offset="55%" stop-color="#7c879c" stop-opacity="0.06" />
      <stop offset="100%" stop-color="#04060b" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="fade-${id}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f3f7fe" stop-opacity="0.04" />
      <stop offset="50%" stop-color="#eab444" stop-opacity="0.28" />
      <stop offset="100%" stop-color="#f3f7fe" stop-opacity="0.04" />
    </linearGradient>
    ${defs}
  </defs>
  <ellipse cx="${W / 2}" cy="${H / 2}" rx="460" ry="300" fill="url(#glow-${id})" />
  ${body}
</svg>
`;
}

// Part I: Concentric hexagonal boundary layers + orthogonal socket transmission rays
function generatePart1() {
  const cx = 600;
  const cy = 400;
  const lines = [];

  // Concentric rotated hexagons
  for (let ring = 1; ring <= 8; ring++) {
    const r = ring * 38;
    const rot = ring * 0.08;
    const pts = [];
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3 + rot;
      pts.push(`${round(cx + Math.cos(a) * r)},${round(cy + Math.sin(a) * r)}`);
    }
    const stroke = ring % 3 === 0 ? '#eab444' : '#949eb3';
    const op = ring % 3 === 0 ? 0.34 : 0.16;
    lines.push(`<polygon points="${pts.join(' ')}" stroke="${stroke}" stroke-opacity="${op}" stroke-width="${ring === 6 ? 1.5 : 1}" />`);
  }

  // Orthogonal transmission lines radiating cleanly across protocol planes
  for (let i = -5; i <= 5; i++) {
    const y = cy + i * 52;
    const op = i === 0 ? 0.28 : 0.1;
    lines.push(`<line x1="80" y1="${y}" x2="1120" y2="${y}" stroke="${i === 0 ? '#eab444' : '#949eb3'}" stroke-opacity="${op}" stroke-width="1" stroke-dasharray="${i % 2 === 0 ? 'none' : '4 8'}" />`);
  }

  // Signal nodes along outer perimeter
  for (let k = 0; k < 12; k++) {
    const a = (k * Math.PI) / 6;
    const px = round(cx + Math.cos(a) * 304);
    const py = round(cy + Math.sin(a) * 304);
    lines.push(`<circle cx="${px}" cy="${py}" r="${k % 4 === 0 ? 4 : 2.2}" fill="${k % 4 === 0 ? '#eab444' : '#dde2ec'}" fill-opacity="0.55" />`);
  }

  return wrapSvg('part1', '', lines.join('\n  '));
}

// Part II: Isometric warped tensor lattice & sigmoidal manifold waves
function generatePart2() {
  const lines = [];
  const cols = 14;
  const rows = 9;
  const x0 = 190;
  const y0 = 150;
  const dx = 62;
  const dy = 56;

  const grid = [];
  for (let r = 0; r < rows; r++) {
    const rowPts = [];
    for (let c = 0; c < cols; c++) {
      const nx = c / (cols - 1);
      const ny = r / (rows - 1);
      const wave = Math.sin(nx * Math.PI * 2.4 + ny * 1.9) * 26;
      const isoShift = (r - rows / 2) * 14;
      const px = round(x0 + c * dx + isoShift);
      const py = round(y0 + r * dy + wave);
      rowPts.push([px, py]);
    }
    grid.push(rowPts);
  }

  for (let r = 0; r < rows; r++) {
    const d = grid[r].map(([px, py], idx) => `${idx === 0 ? 'M' : 'L'}${px},${py}`).join(' ');
    const isMid = r === 4;
    lines.push(`<path d="${d}" stroke="${isMid ? '#eab444' : '#949eb3'}" stroke-opacity="${isMid ? 0.42 : 0.16}" stroke-width="${isMid ? 1.5 : 1}" />`);
  }

  for (let c = 0; c < cols; c++) {
    const d = grid.map((row, idx) => `${idx === 0 ? 'M' : 'L'}${row[c][0]},${row[c][1]}`).join(' ');
    lines.push(`<path d="${d}" stroke="${c % 4 === 0 ? '#eab444' : '#7a8499'}" stroke-opacity="${c % 4 === 0 ? 0.25 : 0.12}" stroke-width="1" />`);
  }

  // Highlighted tensor contraction intersections
  for (let r = 2; r < rows - 2; r += 2) {
    for (let c = 3; c < cols - 2; c += 3) {
      const [px, py] = grid[r][c];
      lines.push(`<rect x="${round(px - 3)}" y="${round(py - 3)}" width="6" height="6" stroke="#eab444" stroke-opacity="0.55" fill="#04060b" />`);
    }
  }

  return wrapSvg('part2', '', lines.join('\n  '));
}

// Part III: Coalescing golden-ratio heap partitions + cryptographic orbital lattice
function generatePart3() {
  const lines = [];
  const phi = 1.61803398875;

  // Golden subdivision architectural framing
  let x = 160;
  let y = 130;
  let w = 880;
  let h = 540;
  for (let step = 0; step < 7; step++) {
    const isGold = step % 2 === 1;
    lines.push(`<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}" stroke="${isGold ? '#eab444' : '#949eb3'}" stroke-opacity="${isGold ? 0.28 : 0.16}" stroke-width="1" />`);
    if (step % 2 === 0) {
      const cut = w / phi;
      x += cut;
      w -= cut;
    } else {
      const cut = h / phi;
      y += cut;
      h -= cut;
    }
  }

  // Radial cryptographic parity ring anchored at focal intersection
  const cx = 620;
  const cy = 400;
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const r1 = 110;
    const r2 = i % 4 === 0 ? 225 : 175;
    lines.push(`<line x1="${round(cx + Math.cos(a) * r1)}" y1="${round(cy + Math.sin(a) * r1)}" x2="${round(cx + Math.cos(a) * r2)}" y2="${round(cy + Math.sin(a) * r2)}" stroke="${i % 8 === 0 ? '#eab444' : '#949eb3'}" stroke-opacity="${i % 8 === 0 ? 0.36 : 0.14}" stroke-width="1" />`);
  }
  lines.push(`<circle cx="${cx}" cy="${cy}" r="110" stroke="#eab444" stroke-opacity="0.24" stroke-width="1" />`);
  lines.push(`<circle cx="${cx}" cy="${cy}" r="225" stroke="#949eb3" stroke-opacity="0.14" stroke-width="1" stroke-dasharray="3 7" />`);

  return wrapSvg('part3', '', lines.join('\n  '));
}

// Part IV: Layered Wayland planes + Vulkan clip frustum + 24-cell Alberti cipher astrolabe
function generatePart4() {
  const cx = 600;
  const cy = 400;
  const lines = [];

  // Layered oblique plane stack
  for (let layer = 0; layer < 4; layer++) {
    const offset = (layer - 1.5) * 44;
    const pw = 560 - layer * 40;
    const ph = 320 - layer * 26;
    const px = round(cx - pw / 2 + offset);
    const py = round(cy - ph / 2 - offset * 0.4);
    lines.push(`<rect x="${px}" y="${py}" width="${pw}" height="${ph}" stroke="${layer === 3 ? '#eab444' : '#949eb3'}" stroke-opacity="${layer === 3 ? 0.34 : 0.14}" stroke-width="1" />`);
  }

  // Vulkan clip-space frustum prism lines
  const corners = [
    [-220, -140],
    [220, -140],
    [220, 140],
    [-220, 140],
  ];
  for (const [dx, dy] of corners) {
    lines.push(`<line x1="${cx}" y1="${cy}" x2="${cx + dx * 1.4}" y2="${cy + dy * 1.4}" stroke="#949eb3" stroke-opacity="0.14" stroke-width="1" />`);
  }

  // 24-cell SIFR calibration astrolabe
  for (let i = 0; i < 24; i++) {
    const a = ((-90 + i * 15) * Math.PI) / 180;
    const rInner = 148;
    const rOuter = i % 3 === 0 ? 210 : 178;
    const isKey = i === 0;
    lines.push(`<line x1="${round(cx + Math.cos(a) * rInner)}" y1="${round(cy + Math.sin(a) * rInner)}" x2="${round(cx + Math.cos(a) * rOuter)}" y2="${round(cy + Math.sin(a) * rOuter)}" stroke="${isKey ? '#eab444' : '#dde2ec'}" stroke-opacity="${isKey ? 0.65 : 0.22}" stroke-width="${isKey ? 2 : 1}" />`);
  }
  lines.push(`<circle cx="${cx}" cy="${cy}" r="148" stroke="#eab444" stroke-opacity="0.28" stroke-width="1" />`);
  lines.push(`<circle cx="${cx}" cy="${cy}" r="210" stroke="#949eb3" stroke-opacity="0.14" stroke-width="1" />`);

  return wrapSvg('part4', '', lines.join('\n  '));
}

const files = [
  ['part-1.svg', generatePart1()],
  ['part-2.svg', generatePart2()],
  ['part-3.svg', generatePart3()],
  ['part-4.svg', generatePart4()],
];

for (const [name, svg] of files) {
  fs.writeFileSync(path.join(outDir, name), svg, 'utf8');
}

console.log(`Generated ${files.length} deterministic geometric chapter plates in ${outDir}`);
