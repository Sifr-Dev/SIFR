import { useEffect, useRef } from 'react';
import type { SchematicKind } from '../data/repos';
import { haptics } from '../lib/haptics';

interface ProjectPhysicsIllustrationProps {
  schematic: SchematicKind;
  heightClass?: string;
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
}: ProjectPhysicsIllustrationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number; active: boolean; pulse: number }>({
    x: 0,
    y: 0,
    active: false,
    pulse: 0,
  });
  const wakeRef = useRef<(() => void) | null>(null);

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
    let prevTime = performance.now();

    const renderFrame = (now: number) => {
      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;

      const ptr = pointerRef.current;
      if (ptr.pulse > 0) {
        ptr.pulse = Math.max(0, ptr.pulse - dt * 2.4);
      }

      let maxKinetic = 0;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const restX = n.rx * width;
        const restY = n.ry * height;
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
              const mag = ((90 - dist) / 90) * 1300 * (1 + ptr.pulse * 1.5);
              fx += (dx / dist) * mag;
              fy += (dy / dist) * mag;
            }
          }
          n.vx = (n.vx + fx * dt) * Math.exp(-10 * dt);
          n.vy = (n.vy + fy * dt) * Math.exp(-10 * dt);
          n.x += n.vx * dt;
          n.y += n.vy * dt;
          const energy = Math.abs(n.vx) + Math.abs(n.vy) + Math.abs(restX - n.x) + Math.abs(restY - n.y);
          if (energy > maxKinetic) maxKinetic = energy;
        } else {
          n.x = restX;
          n.y = restY;
        }
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(45, 48, 56, 0.35)';
      ctx.lineWidth = 1;
      for (let x = 24; x < width; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      const cx = width * 0.5;
      const cy = height * 0.5;
      const ptrOffsetX = ptr.active ? (ptr.x - cx) * 0.08 : 0;
      const ptrOffsetY = ptr.active ? (ptr.y - cy) * 0.08 : 0;

      // Ethereal ambient spotlight behind center schematic
      const focusX = ptr.active ? ptr.x * 0.35 + cx * 0.65 : cx;
      const focusY = ptr.active ? ptr.y * 0.35 + cy * 0.65 : cy;
      const bloom = ctx.createRadialGradient(focusX, focusY, 4, focusX, focusY, Math.max(width, height) * 0.55);
      bloom.addColorStop(0, ptr.active ? 'rgba(234, 180, 68, 0.11)' : 'rgba(234, 180, 68, 0.055)');
      bloom.addColorStop(1, 'rgba(4, 6, 11, 0)');
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, width, height);

      // Click pulse expanding ripple ring
      if (ptr.pulse > 0.02) {
        const ringR = (1 - ptr.pulse) * 90 + 10;
        ctx.strokeStyle = `rgba(234, 180, 68, ${(ptr.pulse * 0.55).toFixed(2)})`;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.arc(ptr.x || cx, ptr.y || cy, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (schematic === 'verrev-mesh') {
        ctx.strokeStyle = 'rgba(185, 190, 199, 0.24)';
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
      } else if (schematic === 'wayland-ring' || schematic === 'sifr-cipher') {
        const r = Math.min(width, height) * 0.34;
        const rx = cx + ptrOffsetX * 1.4;
        const ry = cy + ptrOffsetY * 1.4;
        if (schematic === 'wayland-ring') {
          ctx.strokeStyle = 'rgba(45, 48, 56, 0.9)';
          ctx.strokeRect(rx - r * 1.35, ry - r * 1.15, r * 2.7, r * 2.3);
        }
        const stepOffset = ptr.active ? Math.floor(((ptr.x / width) * 24) % 24) : 0;
        for (let i = 0; i < 24; i++) {
          const a = ((-90 + i * 15) * Math.PI) / 180;
          const isKey = i === stepOffset;
          const len = i % 3 === 0 ? 12 : 6;
          ctx.strokeStyle = isKey ? '#eab444' : '#f3f7fe';
          ctx.lineWidth = isKey ? 3 : 1.5;
          ctx.beginPath();
          ctx.moveTo(rx + Math.cos(a) * (r * 0.72), ry + Math.sin(a) * (r * 0.72));
          ctx.lineTo(rx + Math.cos(a) * (r * 0.72 + len), ry + Math.sin(a) * (r * 0.72 + len));
          ctx.stroke();
        }
        ctx.fillStyle = '#eab444';
        ctx.beginPath();
        ctx.arc(rx, ry, 4.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (schematic === 'ml-tensor') {
        const cols = 6;
        const rows = 3;
        const cellW = (width - 48) / cols;
        const cellH = (height - 32) / rows;
        const sweep = ptr.active ? (ptr.x / width) * cols : 1.5;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = 24 + c * cellW;
            const y = 16 + r * cellH;
            const dPtr = ptr.active
              ? Math.hypot(ptr.x - (x + cellW / 2), ptr.y - (y + cellH / 2))
              : 999;
            const active = Math.abs(c - sweep) < 0.75 || dPtr < 44;
            ctx.strokeStyle = active ? '#eab444' : '#2d3038';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 3, y + 3, cellW - 6, cellH - 6);
            if (active) {
              ctx.fillStyle = 'rgba(234, 180, 68, 0.14)';
              ctx.fillRect(x + 3, y + 3, cellW - 6, cellH - 6);
            }
          }
        }
      } else if (schematic === 'tachyon-deck' || schematic === 'sysmon-proc') {
        const phase = ptr.active ? (ptr.x / width) * Math.PI * 2 : 0.4;
        ctx.strokeStyle = '#eab444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 16; x <= width - 16; x += 6) {
          const t = (x / width) * Math.PI * 4 + phase;
          const ptrPull = ptr.active ? Math.exp(-Math.pow((x - ptr.x) / 48, 2)) * (ptr.y - cy) * 0.45 : 0;
          const y = cy + Math.sin(t) * 18 + Math.cos(t * 2.3) * 8 + ptrPull;
          if (x === 16) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(243, 247, 254, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 16; x <= width - 16; x += 6) {
          const t = (x / width) * Math.PI * 3 - phase;
          const y = cy + Math.cos(t) * 14;
          if (x === 16) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (schematic === 'malloc-heap') {
        const blocks = [0.22, 0.14, 0.28, 0.12, 0.24];
        let xCursor = 20;
        const usableW = width - 40;
        blocks.forEach((frac, idx) => {
          const bw = frac * usableW - 4;
          const bx = xCursor;
          const by = cy - 18 + (ptr.active && Math.abs(ptr.x - (bx + bw / 2)) < 42 ? -6 : 0);
          const isFree = idx === 1 || idx === 3;
          ctx.strokeStyle = isFree ? '#2d3038' : '#eab444';
          ctx.fillStyle = isFree ? '#0a0d13' : 'rgba(234, 180, 68, 0.16)';
          ctx.fillRect(bx, by, bw, 36);
          ctx.strokeRect(bx, by, bw, 36);
          xCursor += frac * usableW;
        });
      } else if (schematic === 'godb-hex') {
        const ox = cx + ptrOffsetX;
        const oy = cy + ptrOffsetY;
        const spin = ptr.active ? (ptr.x / width) * 0.8 : 0;
        [44, 30, 16].forEach((r, idx) => {
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (k * Math.PI) / 3 + spin * (idx % 2 === 0 ? 1 : -1);
            const px = ox + Math.cos(a) * r;
            const py = oy + Math.sin(a) * r;
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.strokeStyle = idx === 2 ? '#eab444' : 'rgba(185, 190, 199, 0.45)';
          ctx.lineWidth = idx === 2 ? 1.5 : 1;
          ctx.stroke();
        });
      } else if (schematic === 'churn-sigmoid') {
        ctx.strokeStyle = '#2d3038';
        ctx.beginPath();
        ctx.moveTo(20, cy);
        ctx.lineTo(width - 20, cy);
        ctx.stroke();

        ctx.strokeStyle = '#eab444';
        ctx.lineWidth = 1.75;
        ctx.beginPath();
        for (let i = 0; i <= 40; i++) {
          const t = i / 40;
          const x = 24 + t * (width - 48);
          const k = (t - 0.5) * 9 + (ptr.active ? (ptr.x - cx) * 0.015 : 0);
          const sig = 1 / (1 + Math.exp(-k));
          const y = height - 22 - sig * (height - 44);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(234, 180, 68, 0.25)';
        for (let i = 0; i < nodes.length - 1; i++) {
          if (i % 6 < 5) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[i + 1].x, nodes[i + 1].y);
            ctx.stroke();
          }
        }
        nodes.forEach((n, idx) => {
          ctx.fillStyle = idx % 4 === 0 ? '#eab444' : '#f3f7fe';
          ctx.fillRect(n.x - 2, n.y - 2, 4, 4);
        });
      }

      // Subtle corner coordinate notches
      ctx.strokeStyle = 'rgba(234, 180, 68, 0.32)';
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

      const shouldContinue = !prefersReduced && (ptr.active || ptr.pulse > 0.01 || maxKinetic > 0.35);
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
      renderFrame(performance.now());
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      wakeRef.current = null;
    };
  }, [schematic]);

  return (
    <canvas
      ref={canvasRef}
      data-testid={`schematic-${schematic}`}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        pointerRef.current.x = e.clientX - rect.left;
        pointerRef.current.y = e.clientY - rect.top;
        pointerRef.current.active = true;
        wakeRef.current?.();
      }}
      onPointerDown={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        pointerRef.current.x = e.clientX - rect.left;
        pointerRef.current.y = e.clientY - rect.top;
        pointerRef.current.active = true;
        pointerRef.current.pulse = 1;
        wakeRef.current?.();
        haptics.trigger('detent');
      }}
      onPointerUp={() => {
        pointerRef.current.active = false;
        wakeRef.current?.();
      }}
      onPointerLeave={() => {
        pointerRef.current.active = false;
        wakeRef.current?.();
      }}
      onPointerCancel={() => {
        pointerRef.current.active = false;
        wakeRef.current?.();
      }}
      className={`w-full ${heightClass} block bg-[#04060b] border-b border-[#2d3038] cursor-crosshair touch-none`}
      aria-hidden="true"
    />
  );
}
