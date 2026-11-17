import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Play, Volume2, VolumeX } from 'lucide-react';
import { CELL_COUNT, SIFR_BITS, STEP_DEG, decodeRingAtShift } from '../lib/cipher';
import { haptics } from '../lib/haptics';

interface CinematicEntranceProps {
  shift: number;
  onShiftChange: (nextShift: number) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onEnter: () => void;
  onOpenShowreel: () => void;
  compact?: boolean;
  paused?: boolean;
}

interface StarParticle {
  angle: number;
  radiusFrac: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  brass: boolean;
}

interface GateWave {
  radius: number;
  alpha: number;
  width: number;
  color: string;
}

export function CinematicEntrance({
  shift,
  onShiftChange,
  audioEnabled,
  onToggleAudio,
  onEnter,
  onOpenShowreel,
  compact = false,
  paused = false,
}: CinematicEntranceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [igniting, setIgniting] = useState(false);
  const [hoverDare, setHoverDare] = useState(false);
  const hoverDareRef = useRef(false);
  hoverDareRef.current = hoverDare;
  const ignitingRef = useRef(false);
  ignitingRef.current = igniting;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const pointerRef = useRef<{ x: number; y: number; active: boolean; nx: number; ny: number }>({
    x: 0,
    y: 0,
    active: false,
    nx: 0,
    ny: 0,
  });
  const wavesRef = useRef<GateWave[]>([]);
  const igniteStartRef = useRef<number>(0);
  const wakeRef = useRef<((ms?: number) => void) | null>(null);

  const decoded = decodeRingAtShift(shift);

  const triggerIgnition = () => {
    if (ignitingRef.current) return;
    setIgniting(true);
    ignitingRef.current = true;
    igniteStartRef.current = performance.now();
    onShiftChange(0);
    haptics.trigger('snapZero');

    const canvas = canvasRef.current;
    const baseR = canvas ? Math.min(canvas.clientWidth, canvas.clientHeight) * 0.14 : 80;
    wavesRef.current.push(
      { radius: baseR * 0.4, alpha: 0.95, width: 2.2, color: '#eab444' },
      { radius: baseR * 0.15, alpha: 0.75, width: 1.4, color: '#f3f7fe' }
    );
    wakeRef.current?.(1400);

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.setTimeout(
      () => {
        onEnter();
      },
      prefersReduced ? 80 : 1050
    );
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (pausedRef.current || ignitingRef.current) return;
      if (e.key === 'Enter' || e.key === ' ') {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'BUTTON' || tag === 'A') return;
        e.preventDefault();
        triggerIgnition();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const particleCount = compact ? 42 : 76;
    const particles: StarParticle[] = Array.from({ length: particleCount }, (_, i) => ({
      angle: (i / particleCount) * Math.PI * 2 + (i % 3) * 0.17,
      radiusFrac: 0.22 + ((i * 37) % 100) / 145,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: i % 9 === 0 ? 2.6 : 1.6,
      brass: i % 5 === 0,
    }));

    let width = 320;
    let height = 420;
    let dpr = 1;
    let rafId = 0;
    let running = false;
    let lastTime = performance.now();
    let ringAngle = (shift * STEP_DEG * Math.PI) / 180;
    let wakeTimer = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      width = Math.max(320, Math.round(rect.width));
      height = Math.max(420, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      for (const p of particles) {
        p.x = 0;
        p.y = 0;
        p.vx = 0;
        p.vy = 0;
      }
      draw(performance.now());
    };

    const draw = (now: number) => {
      if (pausedRef.current) {
        running = false;
        return;
      }
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const ptr = pointerRef.current;
      const isIgniting = ignitingRef.current;
      const igniteProgress = isIgniting
        ? Math.min(1, (now - igniteStartRef.current) / 1050)
        : 0;
      const easeOut = 1 - Math.pow(1 - igniteProgress, 3);

      const cx = width * 0.5 + (ptr.active && !prefersReduced ? ptr.nx * 14 : 0);
      const cy = height * 0.46 + (ptr.active && !prefersReduced ? ptr.ny * 10 : 0);
      const baseR = Math.min(width, height) * (compact ? 0.34 : 0.32);

      // Ring responds fluidly to cursor angle, hover acceleration, or ignition warp
      const speed = isIgniting ? 4.2 : hoverDareRef.current ? 0.45 : ptr.active ? 0.18 : 0.06;
      if (!prefersReduced) {
        ringAngle += speed * dt;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Subtle pin-centered ambient brass bloom
      const bloomRadius = baseR * (1.7 + easeOut * 1.4);
      const bloom = ctx.createRadialGradient(cx, cy, 4, cx, cy, bloomRadius);
      bloom.addColorStop(
        0,
        isIgniting
          ? `rgba(234, 180, 68, ${(0.28 + easeOut * 0.24).toFixed(3)})`
          : hoverDareRef.current
            ? 'rgba(234, 180, 68, 0.14)'
            : 'rgba(234, 180, 68, 0.08)'
      );
      bloom.addColorStop(0.55, 'rgba(234, 180, 68, 0.025)');
      bloom.addColorStop(1, 'rgba(4, 6, 11, 0)');
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, width, height);

      // Architectural polar spokes radiating softly across void
      ctx.lineWidth = 1;
      for (let i = 0; i < CELL_COUNT; i++) {
        const a = (-90 + i * STEP_DEG) * (Math.PI / 180) + (ptr.active ? ptr.nx * 0.04 : 0);
        const rInner = baseR * (0.48 + easeOut * 0.35);
        const rOuter = Math.max(width, height) * 0.78;
        ctx.strokeStyle =
          i % 6 === 0
            ? `rgba(234, 180, 68, ${(0.12 + easeOut * 0.2).toFixed(3)})`
            : 'rgba(45, 48, 56, 0.32)';
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * rInner, cy + Math.sin(a) * rInner);
        ctx.lineTo(cx + Math.cos(a) * rOuter, cy + Math.sin(a) * rOuter);
        ctx.stroke();
      }

      // Concentric calibrated rails
      for (const mult of [0.92, 1.32, 1.8]) {
        ctx.strokeStyle = 'rgba(45, 48, 56, 0.38)';
        ctx.beginPath();
        ctx.arc(cx, cy, baseR * mult * (1 + easeOut * 0.35), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Spring-tethered starlight particles reacting to pointer gravity
      const maxDim = Math.max(width, height) * 0.6;
      let maxEnergy = 0;
      for (const p of particles) {
        const orbitAngle = p.angle + (prefersReduced ? 0 : ringAngle * 0.14);
        const warpExpand = 1 + easeOut * 1.35;
        const restX = cx + Math.cos(orbitAngle) * maxDim * p.radiusFrac * warpExpand;
        const restY = cy + Math.sin(orbitAngle) * maxDim * p.radiusFrac * warpExpand;

        if (p.x === 0 && p.y === 0) {
          p.x = restX;
          p.y = restY;
        }

        if (!prefersReduced) {
          let fx = (restX - p.x) * 60;
          let fy = (restY - p.y) * 60;

          if (ptr.active && !isIgniting) {
            const dx = p.x - ptr.x;
            const dy = p.y - ptr.y;
            const d2 = dx * dx + dy * dy;
            const rad = 160;
            if (d2 < rad * rad && d2 > 9) {
              const d = Math.sqrt(d2);
              const mag = ((rad - d) / rad) * 950;
              fx += (dx / d) * mag;
              fy += (dy / d) * mag;
            }
          }

          p.vx = (p.vx + fx * dt) * Math.exp(-13 * dt);
          p.vy = (p.vy + fy * dt) * Math.exp(-13 * dt);
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          const energy = Math.abs(p.vx) + Math.abs(p.vy) + Math.abs(restX - p.x) + Math.abs(restY - p.y);
          if (energy > maxEnergy) maxEnergy = energy;
        } else {
          p.x = restX;
          p.y = restY;
        }

        const disp = Math.hypot(p.x - restX, p.y - restY);
        if (disp > 4) {
          ctx.strokeStyle = p.brass ? 'rgba(234, 180, 68, 0.25)' : 'rgba(185, 190, 199, 0.14)';
          ctx.beginPath();
          ctx.moveTo(restX, restY);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }

        ctx.fillStyle = p.brass
          ? `rgba(234, 180, 68, ${(0.55 + Math.min(0.4, disp / 30)).toFixed(2)})`
          : 'rgba(243, 247, 254, 0.42)';
        ctx.fillRect(p.x - p.size * 0.5, p.y - p.size * 0.5, p.size, p.size);
      }

      // Monumental Outer 24-Cell SIFR Shutter Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ringAngle);

      const scaleBoost = 1 + easeOut * 0.72;
      const ringInner = baseR * 0.76 * scaleBoost;
      const thinThick = baseR * 0.065;
      const bitThick = baseR * 0.16;
      const gap = (1.3 * Math.PI) / 180;
      const halfCell = (7.5 * Math.PI) / 180;

      for (let i = 0; i < CELL_COUNT; i++) {
        const bit = SIFR_BITS[i];
        const center = ((-90 + i * STEP_DEG) * Math.PI) / 180;
        const a0 = center - halfCell + gap;
        const a1 = center + halfCell - gap;
        const r1 = ringInner + (bit === 1 ? bitThick : thinThick);

        ctx.beginPath();
        ctx.arc(0, 0, r1, a0, a1, false);
        ctx.arc(0, 0, ringInner, a1, a0, true);
        ctx.closePath();

        if (i === 0 || isIgniting) {
          ctx.fillStyle = `rgba(234, 180, 68, ${(i === 0 ? 0.75 : 0.22 + easeOut * 0.45).toFixed(2)})`;
        } else {
          ctx.fillStyle = hoverDareRef.current
            ? 'rgba(243, 247, 254, 0.26)'
            : 'rgba(243, 247, 254, 0.14)';
        }
        ctx.fill();
      }
      ctx.restore();

      // Shockwaves
      for (let i = wavesRef.current.length - 1; i >= 0; i--) {
        const w = wavesRef.current[i];
        w.radius += 420 * dt;
        w.alpha -= 1.25 * dt;
        if (w.alpha <= 0) {
          wavesRef.current.splice(i, 1);
          continue;
        }
        ctx.strokeStyle =
          w.color === '#eab444'
            ? `rgba(234, 180, 68, ${w.alpha.toFixed(3)})`
            : `rgba(243, 247, 254, ${w.alpha.toFixed(3)})`;
        ctx.lineWidth = w.width;
        ctx.beginPath();
        ctx.arc(cx, cy, w.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      const activeMotion =
        !prefersReduced &&
        !pausedRef.current &&
        (isIgniting ||
          wavesRef.current.length > 0 ||
          maxEnergy > 1.8 ||
          now < wakeTimer);

      if (activeMotion) {
        rafId = requestAnimationFrame(draw);
      } else {
        running = false;
      }
    };

    const wake = (durationMs = 500) => {
      if (prefersReduced || pausedRef.current) return;
      wakeTimer = Math.max(wakeTimer, performance.now() + durationMs);
      if (running) return;
      running = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(draw);
    };
    wakeRef.current = wake;

    const onWakeEvent = () => wake(500);
    canvas.parentElement?.addEventListener('pointermove', onWakeEvent, { passive: true });
    canvas.parentElement?.addEventListener('pointerdown', onWakeEvent, { passive: true });

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    return () => {
      cancelAnimationFrame(rafId);
      canvas.parentElement?.removeEventListener('pointermove', onWakeEvent);
      canvas.parentElement?.removeEventListener('pointerdown', onWakeEvent);
      ro.disconnect();
      wakeRef.current = null;
    };
  }, [compact]);

  return (
    <section
      aria-label="SIFR Grand Entrance"
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        pointerRef.current = {
          x,
          y,
          active: true,
          nx: (x / rect.width - 0.5) * 2,
          ny: (y / rect.height - 0.5) * 2,
        };
      }}
      onPointerLeave={() => {
        pointerRef.current.active = false;
      }}
      onPointerDown={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a')) return;
        const rect = e.currentTarget.getBoundingClientRect();
        wavesRef.current.push({
          radius: 18,
          alpha: 0.72,
          width: 1.5,
          color: '#eab444',
        });
        pointerRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          active: true,
          nx: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
          ny: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
        };
        haptics.trigger('detent');
      }}
      className="relative min-h-[100dvh] w-full overflow-hidden bg-[#04060b] flex flex-col justify-between select-none"
    >
      {/* Full-Stage Reactive 2D Physics Field */}
      <canvas
        ref={canvasRef}
        data-testid="entrance-physics-canvas"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Top Whisper Bar — Pure 3-Zone Contract with Zero Spoiled Chapters */}
      <header className="relative z-20 w-full max-w-[1200px] mx-auto px-6 sm:px-10 h-16 flex items-center justify-between gap-8">
        <div className="inline-flex items-center gap-3 whitespace-nowrap shrink-0">
          <span
            aria-hidden="true"
            className="w-2.5 h-2.5 bg-[#eab444] inline-block"
          />
          <span className="text-[15px] font-bold tracking-[0.08em] text-[#f3f7fe]">
            SIFR
          </span>
        </div>

        <div className="hidden md:block text-sm text-[#9ca2af] whitespace-nowrap">
          Mohamed Salahi · Original Systems Exhibition
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleAudio}
            aria-label={audioEnabled ? 'Mute haptic audio' : 'Enable haptic audio'}
            className={`min-h-[40px] min-w-[40px] px-3 border flex items-center justify-center gap-2 text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              audioEnabled
                ? 'border-[#eab444] text-[#eab444] bg-[#0a0d13]'
                : 'border-[#2d3038] text-[#9ca2af] bg-[#0a0d13]/80 hover:text-[#f3f7fe]'
            }`}
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4" aria-hidden="true" />
            ) : (
              <VolumeX className="w-4 h-4" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">{audioEnabled ? 'Sound On' : 'Sound'}</span>
          </button>
        </div>
      </header>

      {/* Center Stage Monumental Prologue */}
      <motion.div
        animate={
          igniting
            ? { opacity: 0, scale: 1.06 }
            : { opacity: 1, scale: 1 }
        }
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-10 max-w-3xl mx-auto"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 inset-y-12 -z-10"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(4, 6, 11, 0.78) 0%, rgba(4, 6, 11, 0.42) 55%, rgba(4, 6, 11, 0) 80%)',
          }}
        />
        <p className="text-sm sm:text-[15px] font-medium tracking-[0.04em] text-[#eab444] mb-5">
          SIFR · صفر · Architecture in Eleven Chapters
        </p>

        <h1 className="text-[44px] sm:text-[64px] lg:text-[74px] font-bold tracking-[-0.03em] leading-[1.03] text-[#f3f7fe] text-balance">
          built from <span className="text-[#eab444]">zero.</span>
        </h1>

        <p className="mt-6 text-[16px] sm:text-[18px] text-[#d2d7e2] leading-[1.65] max-w-[50ch] font-normal">
          Nothing borrowed. Nothing simulated. Step inside an unbroken ride carved straight from raw
          C heap memory, Linux kernels, custom GPU shaders, and a post-quantum operating system.
        </p>

        {/* Single Daring Provocation Trigger */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={triggerIgnition}
            onMouseEnter={() => {
              setHoverDare(true);
              wakeRef.current?.(900);
            }}
            onMouseLeave={() => {
              setHoverDare(false);
              wakeRef.current?.(400);
            }}
            disabled={igniting}
            className="group relative min-h-[54px] px-9 py-3.5 bg-[#eab444] hover:bg-[#f2c15c] text-[#04060b] text-[15px] font-bold tracking-[0.02em] inline-flex items-center justify-center gap-3 transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer chamfer-sm"
          >
            <span>{igniting ? 'Entering Stage...' : 'Dare to build.'}</span>
            <ArrowRight
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={() => {
              haptics.trigger('tap');
              onOpenShowreel();
            }}
            className="min-h-[54px] px-6 py-3.5 border border-[#2d3038] bg-[#0a0d13]/90 hover:border-[#eab444] text-[#f3f7fe] text-[14px] font-medium inline-flex items-center justify-center gap-2.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
            <span>Motion Film</span>
          </button>
        </div>

        {/* Interactive Cipher Signature Strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] text-[#9ca2af]">
          <span>Move pointer to bend orbital field</span>
          <span aria-hidden="true">·</span>
          <span className="font-mobilis text-[#eab444] tracking-[0.14em]">{decoded.word}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mobilis text-xs text-[#9ca2af]">
            {decoded.binaryGroups.join(' ')}
          </span>
        </div>
      </motion.div>

      {/* Bottom Whisper Attribution */}
      <footer className="relative z-10 w-full max-w-[1200px] mx-auto px-6 sm:px-10 py-5 flex items-center justify-between text-[13px] text-[#9ca2af]">
        <span>One entrance · One track · Total control</span>
        <span className="hidden sm:inline">Press Enter or Dare to build to begin</span>
      </footer>
    </section>
  );
}
