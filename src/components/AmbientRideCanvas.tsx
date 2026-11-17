import { useEffect, useRef } from 'react';
import type { SchematicKind } from '../data/repos';

interface AmbientRideCanvasProps {
  schematic: SchematicKind;
  paused?: boolean;
}

export function AmbientRideCanvas({ schematic, paused = false }: AmbientRideCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{ nx: number; ny: number }>({ nx: 0, ny: 0 });
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const wakeRef = useRef<((ms?: number) => void) | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (window.innerWidth <= 0 || window.innerHeight <= 0) return;
      pointerRef.current.nx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerRef.current.ny = (e.clientY / window.innerHeight - 0.5) * 2;
      wakeRef.current?.(650);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let running = false;
    let wakeUntil = 0;
    let t = 0;
    let smoothNx = 0;
    let smoothNy = 0;
    let prev = performance.now();

    const draw = (now: number) => {
      if (pausedRef.current) {
        running = false;
        return;
      }
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      if (!prefersReduced) {
        t += dt;
        smoothNx += (pointerRef.current.nx - smoothNx) * Math.min(1, dt * 5);
        smoothNy += (pointerRef.current.ny - smoothNy) * Math.min(1, dt * 5);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.52 + smoothNx * 28;
      const cy = height * 0.48 + smoothNy * 20;

      const glow = ctx.createRadialGradient(cx, cy, 12, cx, cy, Math.max(width, height) * 0.55);
      glow.addColorStop(0, 'rgba(234, 180, 68, 0.045)');
      glow.addColorStop(0.6, 'rgba(23, 27, 33, 0.02)');
      glow.addColorStop(1, 'rgba(4, 6, 11, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(234, 180, 68, 0.08)';
      ctx.lineWidth = 1;

      if (schematic === 'godb-hex' || schematic === 'verrev-mesh') {
        const sides = schematic === 'godb-hex' ? 6 : 8;
        [240, 380, 520].forEach((r, idx) => {
          ctx.beginPath();
          for (let i = 0; i <= sides; i++) {
            const a = (i / sides) * Math.PI * 2 + t * (idx % 2 === 0 ? 0.04 : -0.03);
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
      } else if (schematic === 'wayland-ring' || schematic === 'greenlens-cnn') {
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * Math.PI * 2 + t * 0.05;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * 220, cy + Math.sin(a) * 220);
          ctx.lineTo(cx + Math.cos(a) * 460, cy + Math.sin(a) * 460);
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 28) {
          const wave = Math.sin(x * 0.004 + t * 0.55 + smoothNx) * 38;
          const y = cy + wave;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.restore();

      if (!prefersReduced && !pausedRef.current && now < wakeUntil) {
        rafId = requestAnimationFrame(draw);
      } else {
        smoothNx = pointerRef.current.nx;
        smoothNy = pointerRef.current.ny;
        running = false;
      }
    };

    const wake = (ms = 400) => {
      if (prefersReduced || pausedRef.current) return;
      wakeUntil = Math.max(wakeUntil, performance.now() + ms);
      if (running) return;
      running = true;
      prev = performance.now();
      rafId = requestAnimationFrame(draw);
    };
    wakeRef.current = wake;

    const resize = () => {
      dpr = 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      draw(performance.now());
    };
    resize();
    wake(450);

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      wakeRef.current = null;
    };
  }, [schematic]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
