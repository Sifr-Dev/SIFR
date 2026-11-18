import { useEffect, useRef } from 'react';
import type { SchematicKind } from '../data/repos';

interface ProjectPhysicsIllustrationProps {
  schematic: SchematicKind;
  heightClass?: string;
  onInteract?: (kind: 'hover' | 'touch') => void;
  onScrub?: (normX: number) => void;
}

interface SpringNode {
  rx: number;
  ry: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function ProjectPhysicsIllustration({
  schematic,
  heightClass = 'h-36',
  onInteract,
  onScrub,
}: ProjectPhysicsIllustrationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number; active: boolean; pulse: number }>({
    x: 0,
    y: 0,
    active: false,
    pulse: 0,
  });
  const wakeRef = useRef<(() => void) | null>(null);
  const onInteractRef = useRef(onInteract);
  onInteractRef.current = onInteract;
  const onScrubRef = useRef(onScrub);
  onScrubRef.current = onScrub;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 320;
    let height = 144;
    let dpr = 1;

    const nodes: SpringNode[] = [];
    const nodeCount = schematic === 'verrev-mesh' ? 14 : schematic === 'ml-tensor' ? 18 : 12;
    for (let i = 0; i < nodeCount; i++) {
      const col = i % 6;
      const row = Math.floor(i / 6);
      const rx = 0.14 + (col / 5) * 0.72;
      const ry = 0.24 + (row / 2) * 0.52;
      nodes.push({ rx, ry, x: 0, y: 0, vx: 0, vy: 0 });
    }

    let rafId = 0;
    let running = false;
    let inView = false;
    let prevTime = performance.now();
    let lastDrawMs = 0;

    const renderFrame = (now: number) => {
      const ptr = pointerRef.current;
      const isInteractive = ptr.active || ptr.pulse > 0.01;

      // Throttle passive idle frames (~30fps) while keeping pointer/touch hover unlocked at full 60fps
      if (!isInteractive && now - lastDrawMs < 32 && lastDrawMs > 0) {
        if (!prefersReduced && inView) {
          rafId = requestAnimationFrame(renderFrame);
        } else {
          running = false;
        }
        return;
      }
      lastDrawMs = now;

      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;
      const ambientTime = prefersReduced ? 0 : now * 0.00095;

      if (ptr.pulse > 0) {
        ptr.pulse = Math.max(0, ptr.pulse - dt * 2.2);
      }

      let maxKinetic = 0;

      if (schematic === 'verrev-mesh') {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const driftX = prefersReduced ? 0 : Math.sin(ambientTime + i * 0.9) * 2.6;
          const driftY = prefersReduced ? 0 : Math.cos(ambientTime * 0.8 + i * 1.1) * 2.6;
          const restX = n.rx * width + driftX;
          const restY = n.ry * height + driftY;
          if (n.x === 0 && n.y === 0) {
            n.x = restX;
            n.y = restY;
          }
          if (!prefersReduced) {
            let fx = (restX - n.x) * 145;
            let fy = (restY - n.y) * 145;
            if (ptr.active) {
              const dx = n.x - ptr.x;
              const dy = n.y - ptr.y;
              const d2 = dx * dx + dy * dy;
              if (d2 < 8100 && d2 > 4) {
                const dist = Math.sqrt(d2);
                const mag = ((90 - dist) / 90) * 1350 * (1 + ptr.pulse * 1.4);
                fx += (dx / dist) * mag;
                fy += (dy / dist) * mag;
              }
            }
            n.vx = (n.vx + fx * dt) * Math.exp(-10 * dt);
            n.vy = (n.vy + fy * dt) * Math.exp(-10 * dt);
            n.x += n.vx * dt;
            n.y += n.vy * dt;
            const energy =
              Math.abs(n.vx) + Math.abs(n.vy) + Math.abs(restX - n.x) + Math.abs(restY - n.y);
            if (energy > maxKinetic) maxKinetic = energy;
          } else {
            n.x = restX;
            n.y = restY;
          }
        }
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#04060b';
      ctx.fillRect(0, 0, width, height);

      // Subtle architectural vertical ticks
      ctx.strokeStyle = 'rgba(45, 48, 56, 0.34)';
      ctx.lineWidth = 1;
      for (let x = 24; x < width; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      const cx = width * 0.5;
      const cy = height * 0.5;
      const ptrNormX = ptr.active ? Math.max(0, Math.min(1, ptr.x / width)) : 0.5;
      const ptrNormY = ptr.active ? Math.max(0, Math.min(1, ptr.y / height)) : 0.5;
      const ptrOffsetX = ptr.active ? (ptr.x - cx) * 0.1 : Math.sin(ambientTime * 0.7) * 4;
      const ptrOffsetY = ptr.active ? (ptr.y - cy) * 0.1 : Math.cos(ambientTime * 0.55) * 3;

      // Ambient spotlight responding to pointer/touch
      const focusX = ptr.active ? ptr.x * 0.55 + cx * 0.45 : cx;
      const focusY = ptr.active ? ptr.y * 0.55 + cy * 0.45 : cy;
      const bloom = ctx.createRadialGradient(
        focusX,
        focusY,
        4,
        focusX,
        focusY,
        Math.max(width, height) * 0.58
      );
      bloom.addColorStop(0, ptr.active ? 'rgba(234, 180, 68, 0.15)' : 'rgba(234, 180, 68, 0.05)');
      bloom.addColorStop(1, 'rgba(4, 6, 11, 0)');
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, width, height);

      // Interactive pointer/touch pulse ring
      if (ptr.pulse > 0.02) {
        const ringR = (1 - ptr.pulse) * 86 + 10;
        ctx.strokeStyle = `rgba(234, 180, 68, ${(ptr.pulse * 0.6).toFixed(2)})`;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.arc(ptr.x || cx, ptr.y || cy, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // =========================================================================
      // 20 DISTINCT DOMAIN-AUTHENTIC VISUALIZATIONS
      // =========================================================================
      if (schematic === 'godb-hex') {
        // 01 GO_DB: 4-layer hexagonal clean architecture rings + orbiting packets
        const ox = cx + ptrOffsetX * 0.8;
        const oy = cy + ptrOffsetY * 0.8;
        const spin = ptr.active ? ptrNormX * 1.4 : ambientTime * 0.25;
        const radii = [48, 36, 24, 12];
        radii.forEach((r, idx) => {
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (k * Math.PI) / 3 + spin * (idx % 2 === 0 ? 1 : -1);
            const px = ox + Math.cos(a) * r;
            const py = oy + Math.sin(a) * r;
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.strokeStyle =
            idx === 2 || (ptr.active && idx === 1) ? '#eab444' : 'rgba(185, 190, 199, 0.42)';
          ctx.lineWidth = idx === 2 ? 1.6 : 1;
          ctx.stroke();
        });
        const orbA = ambientTime * 1.4 + ptrNormX * Math.PI;
        ctx.fillStyle = '#eab444';
        ctx.beginPath();
        ctx.arc(ox + Math.cos(orbA) * 42, oy + Math.sin(orbA) * 42, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (schematic === 'task-queue') {
        // 02 task_manager_cli: Dual ingress lanes (CLI + HTTP) through central Mutex Gate
        const gateX = cx + ptrOffsetX * 0.9;
        const lanes = [cy - 20, cy + 20];
        lanes.forEach((ly, laneIdx) => {
          ctx.strokeStyle = 'rgba(166, 172, 185, 0.28)';
          ctx.beginPath();
          ctx.moveTo(22, ly);
          ctx.lineTo(width - 22, ly);
          ctx.stroke();

          for (let p = 0; p < 4; p++) {
            const speed = ptr.active ? 0.55 : 0.28;
            const t = (ambientTime * speed + p * 0.25 + laneIdx * 0.12) % 1;
            const px = 26 + t * (width - 52);
            const nearGate = Math.abs(px - gateX) < 26;
            ctx.fillStyle = nearGate ? '#eab444' : '#f3f7fe';
            ctx.fillRect(px - 5, ly - 4, 10, 8);
          }
        });
        ctx.strokeStyle = ptr.active ? '#eab444' : '#dde2ec';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(gateX - 10, cy - 34, 20, 68);
        ctx.fillStyle = 'rgba(234, 180, 68, 0.14)';
        ctx.fillRect(gateX - 10, cy - 34, 20, 68);
      } else if (schematic === 'redis-kv') {
        // 03 redis_clone: Port 6379 RWMutex concurrent slot table & read rays
        const cols = 8;
        const slotW = (width - 64) / cols;
        const hoveredCol = ptr.active ? Math.floor((ptr.x - 32) / slotW) : Math.floor((ambientTime * 2) % cols);
        for (let i = 0; i < cols; i++) {
          const sx = 32 + i * slotW + 3;
          const sw = slotW - 6;
          const active = i === hoveredCol || Math.abs(i - hoveredCol) === 1;
          ctx.strokeStyle = active ? '#eab444' : '#2d3038';
          ctx.fillStyle = active ? 'rgba(234, 180, 68, 0.16)' : '#0a0d13';
          ctx.fillRect(sx, cy - 16, sw, 32);
          ctx.strokeRect(sx, cy - 16, sw, 32);
          // RLock reader rays converging to top & bottom
          if (active) {
            ctx.strokeStyle = 'rgba(234, 180, 68, 0.55)';
            ctx.beginPath();
            ctx.moveTo(sx + sw * 0.5, cy - 16);
            ctx.lineTo(ptr.active ? ptr.x : cx, 14);
            ctx.moveTo(sx + sw * 0.5, cy + 16);
            ctx.lineTo(ptr.active ? ptr.x : cx, height - 14);
            ctx.stroke();
          }
        }
      } else if (schematic === 'sifr-serve') {
        // 04 sifr-serve: TcpListener fan-out with path traversal shield wall
        const listenX = 34;
        const guardX = cx - 10 + ptrOffsetX * 0.7;
        ctx.fillStyle = '#eab444';
        ctx.beginPath();
        ctx.arc(listenX, cy, 5, 0, Math.PI * 2);
        ctx.fill();

        const routes = [-34, -17, 0, 17, 34];
        routes.forEach((dy, idx) => {
          const isBlocked = idx === 1 || idx === 4;
          const endX = isBlocked ? guardX - 4 : width - 26;
          ctx.strokeStyle = isBlocked
            ? 'rgba(252, 88, 85, 0.6)'
            : idx === 2 || ptr.active
              ? '#eab444'
              : 'rgba(243, 247, 254, 0.4)';
          ctx.lineWidth = isBlocked ? 1 : 1.3;
          ctx.beginPath();
          ctx.moveTo(listenX, cy);
          ctx.lineTo(endX, cy + dy);
          ctx.stroke();
          if (!isBlocked) {
            const p = (ambientTime * 0.55 + idx * 0.2) % 1;
            ctx.fillStyle = '#f3f7fe';
            ctx.fillRect(listenX + p * (endX - listenX) - 2, cy + p * dy - 2, 4, 4);
          }
        });
        ctx.strokeStyle = '#eab444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(guardX, 16);
        ctx.lineTo(guardX, height - 16);
        ctx.stroke();
      } else if (schematic === 'sifr-probe') {
        // 05 sifr-probe: Latency waterfall & interactive p50 / p90 / p99 percentile scrub
        const markers = [0.32, 0.62, 0.84];
        const scrubX = ptr.active ? Math.max(24, Math.min(width - 24, ptr.x)) : cx;
        ctx.strokeStyle = 'rgba(234, 180, 68, 0.25)';
        markers.forEach((m) => {
          const mx = 24 + m * (width - 48);
          ctx.beginPath();
          ctx.moveTo(mx, 14);
          ctx.lineTo(mx, height - 14);
          ctx.stroke();
        });

        // Bell/tail percentile latency curve
        ctx.strokeStyle = '#eab444';
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        for (let i = 0; i <= 48; i++) {
          const t = i / 48;
          const x = 20 + t * (width - 40);
          const spike = Math.exp(-Math.pow((t - 0.34) / 0.14, 2)) * 0.68 + Math.exp(-Math.pow((t - 0.72) / 0.08, 2)) * 0.32;
          const y = height - 20 - spike * (height - 44);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Pointer scrub cursor
        ctx.strokeStyle = ptr.active ? '#f3f7fe' : 'rgba(243, 247, 254, 0.35)';
        ctx.beginPath();
        ctx.moveTo(scrubX, 12);
        ctx.lineTo(scrubX, height - 12);
        ctx.stroke();
      } else if (schematic === 'churn-sigmoid') {
        // 06 churn_analytics_engine: Logistic sigmoid + interactive evaluation sample dot
        ctx.strokeStyle = '#2d3038';
        ctx.beginPath();
        ctx.moveTo(20, cy);
        ctx.lineTo(width - 20, cy);
        ctx.stroke();

        const shiftK = ptr.active ? (ptr.x - cx) * 0.015 : Math.sin(ambientTime * 0.8) * 0.65;
        ctx.strokeStyle = '#eab444';
        ctx.lineWidth = 1.75;
        ctx.beginPath();
        for (let i = 0; i <= 44; i++) {
          const t = i / 44;
          const x = 24 + t * (width - 48);
          const k = (t - 0.5) * 9 + shiftK;
          const sig = 1 / (1 + Math.exp(-k));
          const y = height - 20 - sig * (height - 40);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        const evalT = ptr.active ? ptrNormX : 0.5 + Math.sin(ambientTime * 0.9) * 0.35;
        const ex = 24 + evalT * (width - 48);
        const ey = height - 20 - (1 / (1 + Math.exp(-((evalT - 0.5) * 9 + shiftK)))) * (height - 40);
        ctx.fillStyle = '#f3f7fe';
        ctx.beginPath();
        ctx.arc(ex, ey, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (schematic === 'greenlens-cnn') {
        // 07 GreenLens: Leaf feature grid + 3x3 sliding CNN kernel + 15-class confidence bars
        const gridW = width * 0.48;
        const kernX = ptr.active
          ? Math.max(24, Math.min(gridW, ptr.x))
          : 28 + ((ambientTime * 28) % (gridW - 32));
        const kernY = ptr.active ? Math.max(20, Math.min(height - 24, ptr.y)) : cy + Math.sin(ambientTime * 1.4) * 18;

        // Organic leaf vein wireframe
        ctx.strokeStyle = 'rgba(185, 190, 199, 0.35)';
        ctx.beginPath();
        ctx.moveTo(24, cy);
        ctx.quadraticCurveTo(gridW * 0.55, cy - 36, gridW, cy);
        ctx.quadraticCurveTo(gridW * 0.55, cy + 36, 24, cy);
        ctx.moveTo(24, cy);
        ctx.lineTo(gridW, cy);
        ctx.stroke();

        // Sliding 3x3 convolution kernel box
        ctx.strokeStyle = '#eab444';
        ctx.fillStyle = 'rgba(234, 180, 68, 0.14)';
        ctx.fillRect(kernX - 14, kernY - 14, 28, 28);
        ctx.strokeRect(kernX - 14, kernY - 14, 28, 28);

        // Class probability bars on right
        const barStart = gridW + 24;
        const barMaxW = width - barStart - 22;
        for (let b = 0; b < 5; b++) {
          const by = 22 + b * ((height - 44) / 4);
          const act = b === (Math.floor((kernX / gridW) * 5) % 5) ? 0.92 : 0.22 + ((b * 19) % 35) / 100;
          ctx.fillStyle = act > 0.7 ? '#eab444' : 'rgba(243, 247, 254, 0.28)';
          ctx.fillRect(barStart, by - 3, barMaxW * act, 6);
        }
      } else if (schematic === 'ml-tensor') {
        // 08 sifr-ml-systems: Fused causal SRAM attention tiles (Q * K^T)
        const cols = 6;
        const rows = 4;
        const cellW = (width - 48) / cols;
        const cellH = (height - 28) / rows;
        const sweep = ptr.active ? (ptr.x / width) * cols : (ambientTime * 1.1) % cols;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = 24 + c * cellW;
            const y = 14 + r * cellH;
            const causalMasked = c > r + 2;
            const nearPtr = ptr.active && Math.hypot(ptr.x - (x + cellW / 2), ptr.y - (y + cellH / 2)) < 42;
            const active = !causalMasked && (Math.abs(c - sweep) < 0.7 || nearPtr);
            ctx.strokeStyle = causalMasked ? 'rgba(45, 48, 56, 0.4)' : active ? '#eab444' : '#2d3038';
            ctx.strokeRect(x + 2, y + 2, cellW - 4, cellH - 4);
            if (active) {
              ctx.fillStyle = 'rgba(234, 180, 68, 0.18)';
              ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);
            }
          }
        }
      } else if (schematic === 'malloc-heap') {
        // 09 malloc_allocator: 24B header_t blocks + interactive coalesce near cursor
        const blocks = [0.22, 0.14, 0.26, 0.14, 0.24];
        let xCursor = 20;
        const usableW = width - 40;
        blocks.forEach((frac, idx) => {
          const bw = frac * usableW - 4;
          const bx = xCursor;
          const hovered = ptr.active && Math.abs(ptr.x - (bx + bw / 2)) < 44;
          const breath = Math.sin(ambientTime * 1.3 + idx) * 2;
          const by = cy - 18 + breath + (hovered ? -6 : 0);
          const isFree = idx === 1 || idx === 3;
          ctx.strokeStyle = hovered ? '#f3f7fe' : isFree ? '#3a404c' : '#eab444';
          ctx.fillStyle = isFree ? '#0a0d13' : 'rgba(234, 180, 68, 0.16)';
          ctx.fillRect(bx, by, bw, 36);
          ctx.strokeRect(bx, by, bw, 36);
          // 24B header stripe on left edge of block
          ctx.fillStyle = isFree ? '#3a404c' : '#eab444';
          ctx.fillRect(bx, by, 4, 36);
          xCursor += frac * usableW;
        });
      } else if (schematic === 'sysmon-proc') {
        // 10 ProcPulse (sysmon_daemon): /proc/stat + /proc/meminfo + /proc/[pid] -> Jiffy Delta -> HTTP JSON stream
        const nodeX = 24;
        const deltaX = cx - 44;
        const apiX = width - 44;
        const rows = [
          { y: cy - 26, label: 'stat' },
          { y: cy, label: 'mem' },
          { y: cy + 26, label: 'pid' },
        ];
        const activeRow = ptr.active
          ? Math.min(2, Math.max(0, Math.floor(ptrNormY * 3)))
          : Math.floor((ambientTime * 1.4) % 3);

        // /proc virtual filesystem kernel sources -> dual-sample delta engine
        rows.forEach((row, idx) => {
          const isHot = idx === activeRow;
          ctx.strokeStyle = isHot ? '#eab444' : 'rgba(166, 172, 185, 0.35)';
          ctx.fillStyle = isHot ? '#eab444' : '#0a0d13';
          ctx.lineWidth = isHot ? 1.5 : 1;
          ctx.fillRect(nodeX, row.y - 6, 12, 12);
          ctx.strokeRect(nodeX, row.y - 6, 12, 12);

          // Direct file-descriptor read line (zero child fork)
          ctx.beginPath();
          ctx.moveTo(nodeX + 12, row.y);
          ctx.lineTo(deltaX, row.y);
          ctx.stroke();

          // Kernel sample pulse travelling from /proc node to delta parser
          const pulseT = (ambientTime * 0.75 + idx * 0.33) % 1;
          ctx.fillStyle = isHot ? '#f3f7fe' : '#eab444';
          ctx.fillRect(nodeX + 14 + pulseT * (deltaX - nodeX - 18), row.y - 2, 4, 4);
        });

        // Center t0 -> t1 jiffy delta bar sampler (4 core buckets)
        const meterW = 68;
        ctx.strokeStyle = ptr.active ? '#eab444' : '#2d3038';
        ctx.fillStyle = 'rgba(10, 13, 19, 0.9)';
        ctx.fillRect(deltaX, cy - 34, meterW, 68);
        ctx.strokeRect(deltaX, cy - 34, meterW, 68);
        for (let b = 0; b < 4; b++) {
          const by = cy - 24 + b * 15;
          const load =
            0.28 +
            0.55 *
              Math.abs(
                Math.sin(ambientTime * 1.1 + b * 1.2 + (ptr.active ? ptrNormX * 3 : 0))
              );
          ctx.fillStyle = 'rgba(45, 48, 56, 0.8)';
          ctx.fillRect(deltaX + 8, by, meterW - 16, 7);
          ctx.fillStyle = b === activeRow || load > 0.7 ? '#eab444' : '#dde2ec';
          ctx.fillRect(deltaX + 8, by, (meterW - 16) * load, 7);
        }

        // Emitted JSON telemetry packet toward /api/sysmon
        ctx.strokeStyle = 'rgba(234, 180, 68, 0.55)';
        ctx.beginPath();
        ctx.moveTo(deltaX + meterW, cy);
        ctx.lineTo(apiX, cy);
        ctx.stroke();

        const pktX =
          deltaX + meterW + ((ambientTime * 58) % Math.max(24, apiX - (deltaX + meterW)));
        ctx.fillStyle = '#eab444';
        ctx.fillRect(pktX - 4, cy - 5, 8, 10);
        ctx.strokeStyle = '#eab444';
        ctx.strokeRect(apiX, cy - 16, 18, 32);
        ctx.fillStyle = 'rgba(234, 180, 68, 0.16)';
        ctx.fillRect(apiX, cy - 16, 18, 32);
      } else if (schematic === 'tachyon-deck') {
        // 11 Tachyon (tachyon-fetch): Single-pass /proc + /sys + NVML probe cockpit & 25-module rack
        const busX = 24;
        const spineX = Math.round(width * 0.34);
        const rackX = spineX + 20;
        const rackW = width - rackX - 24;

        // Left: Single-pass kernel surface bus (one root process -> 4 direct subsystem conduits, zero forks)
        ctx.fillStyle = '#eab444';
        ctx.fillRect(busX, cy - 8, 14, 16);

        const conduits = [-30, -10, 10, 30];
        const focusedSubsystem = ptr.active
          ? Math.min(3, Math.max(0, Math.floor(ptrNormY * 4)))
          : Math.floor((ambientTime * 1.2) % 4);

        conduits.forEach((dy, idx) => {
          const hot = idx === focusedSubsystem;
          ctx.strokeStyle = hot ? '#eab444' : 'rgba(166, 172, 185, 0.34)';
          ctx.lineWidth = hot ? 1.6 : 1;
          ctx.beginPath();
          ctx.moveTo(busX + 14, cy);
          ctx.lineTo(busX + 34, cy + dy);
          ctx.lineTo(spineX, cy + dy);
          ctx.stroke();

          // Single-pass hardware sweep beacon
          const sweep = (ambientTime * 0.9 + idx * 0.18) % 1;
          ctx.fillStyle = hot ? '#f3f7fe' : '#eab444';
          const sx = busX + 34 + sweep * Math.max(12, spineX - (busX + 34));
          ctx.fillRect(sx - 2, cy + dy - 2, 4, 4);
        });

        // Right: Cockpit ratatui TUI frame housing 5x5 (25) hardware & OS telemetry modules
        const padY = 18;
        const rackH = height - padY * 2;
        ctx.strokeStyle = ptr.active ? '#eab444' : '#3a404c';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(rackX - 6, padY - 4, rackW + 12, rackH + 8);

        const cols = 5;
        const rows = 5;
        const cellW = rackW / cols;
        const cellH = rackH / rows;
        const hoverCol = ptr.active ? Math.floor(((ptr.x - rackX) / rackW) * cols) : -1;
        const hoverRow = ptr.active ? Math.floor(((ptr.y - padY) / rackH) * rows) : -1;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            const x = rackX + c * cellW + 2;
            const y = padY + r * cellH + 2;
            const w = Math.max(6, cellW - 4);
            const h = Math.max(4, cellH - 4);
            const swept =
              (hoverCol === c && hoverRow === r) ||
              (!ptr.active && Math.floor((ambientTime * 5) % 25) === idx);
            const fillRatio = 0.35 + ((idx * 17) % 60) / 100;

            ctx.fillStyle = swept ? 'rgba(234, 180, 68, 0.22)' : 'rgba(23, 27, 33, 0.9)';
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = swept ? '#eab444' : 'rgba(221, 226, 236, 0.45)';
            ctx.fillRect(x, y, w * (swept ? 1 : fillRatio), h);
          }
        }
      } else if (schematic === 'sifr-crypt') {
        // 12 sifr-crypt: 64-round FIPS 180-4 SHA-256 bitmix matrix with avalanche pulse
        const cols = 16;
        const rows = 4;
        const cw = (width - 48) / cols;
        const ch = (height - 32) / rows;
        const seedShift = ptr.active ? Math.floor(ptrNormX * 64) : Math.floor(ambientTime * 4);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const bit = ((r * 17 + c * 31 + seedShift * 7) % 13) < 4;
            const bx = 24 + c * cw + 2;
            const by = 16 + r * ch + 2;
            ctx.fillStyle = bit ? '#eab444' : 'rgba(45, 48, 56, 0.7)';
            ctx.fillRect(bx, by, cw - 4, ch - 4);
          }
        }
      } else if (schematic === 'verrev-mesh') {
        // 13 verrev: Post-quantum P2P spring mesh
        ctx.strokeStyle = 'rgba(185, 190, 199, 0.28)';
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
            if (d < 92) {
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.stroke();
            }
          }
        }
        nodes.forEach((n, idx) => {
          ctx.fillStyle = idx % 5 === 0 ? '#eab444' : '#f3f7fe';
          ctx.fillRect(n.x - 2.5, n.y - 2.5, 5, 5);
        });
      } else if (schematic === 'sifr-query') {
        // 14 sifr-query: Streaming CSV rows passing predicate sieve into group-by bars
        const sieveX = cx - 12 + ptrOffsetX * 0.8;
        for (let r = 0; r < 5; r++) {
          const ry = 22 + r * ((height - 44) / 4);
          const pass = r % 2 === 0 || ptrNormY > 0.5;
          ctx.strokeStyle = pass ? '#eab444' : 'rgba(166, 172, 185, 0.2)';
          ctx.beginPath();
          ctx.moveTo(22, ry);
          ctx.lineTo(pass ? width - 34 : sieveX - 6, ry);
          ctx.stroke();
          if (pass) {
            const dotX = 22 + ((ambientTime * 55 + r * 35) % (width - 60));
            ctx.fillStyle = '#f3f7fe';
            ctx.fillRect(dotX - 3, ry - 2, 6, 4);
          }
        }
        ctx.strokeStyle = '#eab444';
        ctx.beginPath();
        ctx.moveTo(sieveX, 14);
        ctx.lineTo(sieveX, height - 14);
        ctx.stroke();
      } else if (schematic === 'sifr-md') {
        // 15 sifr-md: Single-pass UTF-8 Markdown line scanner illuminating syntax tokens
        const beamX = ptr.active ? ptr.x : 24 + ((ambientTime * 75) % (width - 48));
        const lines = [0.72, 0.45, 0.85, 0.58, 0.66];
        lines.forEach((frac, idx) => {
          const ly = 22 + idx * ((height - 44) / 4);
          const lw = (width - 64) * frac;
          const scanned = beamX >= 32 + lw * 0.3;
          ctx.fillStyle = idx === 0 && scanned ? '#eab444' : scanned ? '#dde2ec' : '#2d3038';
          ctx.fillRect(32, ly - 2, lw, idx === 0 ? 4 : 2.5);
        });
        ctx.strokeStyle = '#eab444';
        ctx.beginPath();
        ctx.moveTo(beamX, 12);
        ctx.lineTo(beamX, height - 12);
        ctx.stroke();
      } else if (schematic === 'sifr-inflate') {
        // 16 sifr-inflate: Huffman tree branches + 32 KiB sliding-window back-reference arc
        const rootX = cx;
        const rootY = 18;
        const leaves = [0.16, 0.34, 0.52, 0.7, 0.86].map((f) => width * f);
        leaves.forEach((lx, idx) => {
          const midX = (rootX + lx) * 0.5;
          const midY = (rootY + height * 0.52) * 0.5;
          const activeLeaf = ptr.active ? Math.abs(ptr.x - lx) < 34 : idx === Math.floor((ambientTime * 1.4) % leaves.length);
          ctx.strokeStyle = activeLeaf ? '#eab444' : 'rgba(166, 172, 185, 0.32)';
          ctx.beginPath();
          ctx.moveTo(rootX, rootY);
          ctx.lineTo(midX, midY);
          ctx.lineTo(lx, height * 0.58);
          ctx.stroke();
          ctx.fillStyle = activeLeaf ? '#eab444' : '#f3f7fe';
          ctx.fillRect(lx - 2.5, height * 0.58 - 2.5, 5, 5);
        });
        // Sliding window back-reference arc along bottom
        ctx.strokeStyle = '#eab444';
        ctx.beginPath();
        ctx.moveTo(leaves[1], height - 20);
        ctx.quadraticCurveTo(cx, height * 0.62, leaves[3], height - 20);
        ctx.stroke();
      } else if (schematic === 'sifr-diff') {
        // 17 sifr-diff: LCS dynamic-programming edit matrix & diagonal edit trace
        const cols = 9;
        const rows = 5;
        const cw = (width - 56) / cols;
        const ch = (height - 28) / rows;
        const focusStep = ptr.active ? Math.floor(ptrNormX * cols) : Math.floor((ambientTime * 2) % cols);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = 28 + c * cw;
            const y = 14 + r * ch;
            const onPath = Math.abs(r - Math.round((c / (cols - 1)) * (rows - 1))) === 0;
            const active = onPath && c <= focusStep;
            ctx.strokeStyle = active ? '#eab444' : onPath ? 'rgba(234, 180, 68, 0.35)' : '#232730';
            ctx.strokeRect(x + 2, y + 2, cw - 4, ch - 4);
            if (active) {
              ctx.fillStyle = 'rgba(234, 180, 68, 0.22)';
              ctx.fillRect(x + 2, y + 2, cw - 4, ch - 4);
            }
          }
        }
      } else if (schematic === 'wayland-ring') {
        // 18 sifr-native (Cipher): Wayland wire frame stack + Vulkan raster triangle
        const tilt = ptr.active ? (ptr.x - cx) * 0.06 : Math.sin(ambientTime * 0.8) * 6;
        [0, 1, 2].forEach((layer) => {
          const lx = cx - 64 + layer * 10 + tilt * layer * 0.3;
          const ly = 20 + layer * 10;
          ctx.strokeStyle = layer === 2 ? '#eab444' : 'rgba(166, 172, 185, 0.35)';
          ctx.strokeRect(lx, ly, 112, height - 58);
        });
        ctx.fillStyle = 'rgba(234, 180, 68, 0.22)';
        ctx.strokeStyle = '#eab444';
        ctx.beginPath();
        ctx.moveTo(cx + tilt * 0.5, 42);
        ctx.lineTo(cx + 32 + tilt * 0.5, height - 34);
        ctx.lineTo(cx - 24 + tilt * 0.5, height - 34);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (schematic === 'vulkan-apps') {
        // 19 sifr-apps: rex split panes + cipherterm + nocturne audio bars
        const panes = [
          { x: 0.12, y: 0.18, w: 0.46, h: 0.64 },
          { x: 0.62, y: 0.18, w: 0.26, h: 0.29 },
          { x: 0.62, y: 0.53, w: 0.26, h: 0.29 },
        ];
        panes.forEach((p, idx) => {
          const px = p.x * width + ptrOffsetX * (idx + 1) * 0.45;
          const py = p.y * height + ptrOffsetY * (idx + 1) * 0.45;
          const pw = p.w * width;
          const ph = p.h * height;
          const hovered =
            ptr.active && ptr.x >= px && ptr.x <= px + pw && ptr.y >= py && ptr.y <= py + ph;
          const accent = hovered || (!ptr.active && idx === 1);
          ctx.fillStyle = accent ? 'rgba(234, 180, 68, 0.14)' : 'rgba(23, 27, 33, 0.85)';
          ctx.fillRect(px, py, pw, ph);
          ctx.strokeStyle = accent ? '#eab444' : '#3a404c';
          ctx.strokeRect(px, py, pw, ph);
          ctx.fillStyle = accent ? '#eab444' : 'rgba(243, 247, 254, 0.42)';
          ctx.fillRect(px + 8, py + 8, Math.min(28, pw * 0.35), 2);
          ctx.fillRect(px + 8, py + 14, Math.min(44, pw * 0.55), 2);
        });
      } else if (schematic === 'sifr-cipher') {
        // 20 SIFR: 24-cell Alberti ring reacting to pointer angle
        const r = Math.min(width, height) * 0.36;
        const rx = cx + ptrOffsetX * 0.8;
        const ry = cy + ptrOffsetY * 0.8;
        const keyCell = ptr.active
          ? Math.floor((((Math.atan2(ptr.y - ry, ptr.x - rx) + Math.PI * 2.5) / (Math.PI * 2)) * 24) % 24)
          : Math.floor((ambientTime * 3) % 24);
        for (let i = 0; i < 24; i++) {
          const a = ((-90 + i * 15) * Math.PI) / 180;
          const isKey = i === keyCell;
          const len = i % 3 === 0 ? 12 : 6;
          ctx.strokeStyle = isKey ? '#eab444' : '#f3f7fe';
          ctx.lineWidth = isKey ? 3 : 1.4;
          ctx.beginPath();
          ctx.moveTo(rx + Math.cos(a) * (r * 0.72), ry + Math.sin(a) * (r * 0.72));
          ctx.lineTo(rx + Math.cos(a) * (r * 0.72 + len), ry + Math.sin(a) * (r * 0.72 + len));
          ctx.stroke();
        }
        ctx.fillStyle = '#eab444';
        ctx.beginPath();
        ctx.arc(rx, ry, 4.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Fallback safety mesh
        const cols = 8;
        const barW = Math.max(8, (width - 72) / cols - 6);
        for (let i = 0; i < cols; i++) {
          const bx = 36 + i * ((width - 72) / cols);
          const bh = 24 + ((i * 23) % 48);
          ctx.fillStyle = i % 3 === 0 ? '#eab444' : 'rgba(243, 247, 254, 0.3)';
          ctx.fillRect(bx, cy - bh * 0.5, barW, bh);
        }
      }

      // Subtle corner coordinate notches
      ctx.strokeStyle = ptr.active ? 'rgba(234, 180, 68, 0.7)' : 'rgba(234, 180, 68, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(8, 16);
      ctx.lineTo(8, 8);
      ctx.lineTo(16, 8);
      ctx.moveTo(width - 16, height - 8);
      ctx.lineTo(width - 8, height - 8);
      ctx.lineTo(width - 8, height - 16);
      ctx.stroke();

      ctx.restore();

      const shouldContinue =
        !prefersReduced && (inView || ptr.active || ptr.pulse > 0.01 || maxKinetic > 0.35);
      if (shouldContinue) {
        rafId = requestAnimationFrame(renderFrame);
      } else {
        running = false;
      }
    };

    const wake = () => {
      if (running) return;
      running = true;
      prevTime = performance.now();
      rafId = requestAnimationFrame(renderFrame);
    };
    wakeRef.current = wake;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(180, Math.round(rect.width));
      height = Math.max(100, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      for (const n of nodes) {
        n.x = n.rx * width;
        n.y = n.ry * height;
        n.vx = 0;
        n.vy = 0;
      }
      lastDrawMs = 0;
      renderFrame(performance.now());
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              inView = entries.some((entry) => entry.isIntersecting);
              if (inView) wake();
            },
            { threshold: 0.05 }
          )
        : null;
    io?.observe(canvas);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io?.disconnect();
      wakeRef.current = null;
    };
  }, [schematic]);

  const updatePointer = (clientX: number, clientY: number): number => {
    const canvas = canvasRef.current;
    if (!canvas) return 0.5;
    const rect = canvas.getBoundingClientRect();
    const lx = clientX - rect.left;
    const ly = clientY - rect.top;
    pointerRef.current.x = lx;
    pointerRef.current.y = ly;
    pointerRef.current.active = true;
    wakeRef.current?.();
    return rect.width > 0 ? Math.max(0, Math.min(1, lx / rect.width)) : 0.5;
  };

  return (
    <canvas
      ref={canvasRef}
      data-testid={`schematic-${schematic}`}
      onPointerEnter={(e) => {
        updatePointer(e.clientX, e.clientY);
        onInteractRef.current?.('hover');
      }}
      onPointerMove={(e) => {
        const normX = updatePointer(e.clientX, e.clientY);
        onScrubRef.current?.(normX);
      }}
      onPointerDown={(e) => {
        updatePointer(e.clientX, e.clientY);
        pointerRef.current.pulse = 1;
        wakeRef.current?.();
        onInteractRef.current?.('touch');
      }}
      onPointerLeave={() => {
        pointerRef.current.active = false;
        wakeRef.current?.();
      }}
      onPointerCancel={() => {
        pointerRef.current.active = false;
        wakeRef.current?.();
      }}
      className={`w-full ${heightClass} block bg-[#04060b] border-y border-[#2d3038] touch-pan-x touch-pan-y cursor-crosshair transition-colors duration-200 hover:border-[#eab444]/60`}
      aria-hidden="true"
    />
  );
}
