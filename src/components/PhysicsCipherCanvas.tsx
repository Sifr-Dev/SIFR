import { useEffect, useRef, useState } from 'react';
import {
  CELL_COUNT,
  SIFR_BITS,
  STEP_DEG,
  angleToShift,
  decodeRingAtShift,
  normalizeShift,
  shiftToAngle,
  stepAngularSpring,
  type AngularSpringState,
} from '../lib/cipher';
import { haptics } from '../lib/haptics';
import { ambientSoundscape } from '../lib/ambientSoundscape';

interface PhysicsCipherCanvasProps {
  shift: number;
  onShiftChange: (nextShift: number) => void;
  compact?: boolean;
  paused?: boolean;
  minimal?: boolean;
  scrollProgress?: number;
  scrollProgressRef?: React.RefObject<number>;
}

interface PolarNode {
  baseAngle: number;
  baseRadius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isKeySpoke: boolean;
}

interface PulseWave {
  radius: number;
  alpha: number;
  color: string;
}

export function PhysicsCipherCanvas({
  shift,
  onShiftChange,
  compact = false,
  paused = false,
  minimal = false,
  scrollProgress,
  scrollProgressRef,
}: PhysicsCipherCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wakeRef = useRef<(() => void) | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const springRef = useRef<AngularSpringState>({
    angleDeg: shiftToAngle(shift),
    velocityDeg: 0,
    targetAngleDeg: shiftToAngle(shift),
    dragging: false,
  });
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const dragRef = useRef<{
    active: boolean;
    lastPointerAngleDeg: number;
    angularVelocityDeg: number;
    lastMoveTs: number;
    moved: boolean;
  }>({
    active: false,
    lastPointerAngleDeg: 0,
    angularVelocityDeg: 0,
    lastMoveTs: 0,
    moved: false,
  });
  const lastDetentShiftRef = useRef<number>(shift);
  const wavesRef = useRef<PulseWave[]>([]);
  const onShiftChangeRef = useRef(onShiftChange);
  onShiftChangeRef.current = onShiftChange;

  const [isDragging, setIsDragging] = useState(false);

  // Sync external shift changes (e.g. Step / Zero buttons) into spring target
  useEffect(() => {
    if (!dragRef.current.active) {
      const target = shiftToAngle(shift);
      springRef.current.targetAngleDeg = target;
      if (shift !== lastDetentShiftRef.current) {
        wavesRef.current.push({
          radius: 18,
          alpha: 0.75,
          color: shift === 0 ? '#eab444' : '#f3f7fe',
        });
        lastDetentShiftRef.current = shift;
      }
      wakeRef.current?.();
    }
  }, [shift, paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initialize 48 polar field nodes across 2 orbital rings aligned to 24 spokes
    const nodes: PolarNode[] = [];
    for (let ringIdx = 0; ringIdx < 2; ringIdx++) {
      const rFactor = ringIdx === 0 ? 1.24 : 1.44;
      for (let i = 0; i < CELL_COUNT; i++) {
        const a = (-90 + i * STEP_DEG) * (Math.PI / 180);
        nodes.push({
          baseAngle: a,
          baseRadius: rFactor,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          isKeySpoke: i === 0,
        });
      }
    }

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let running = false;
    let lastTime = performance.now();

    const syncCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextWidth = Math.max(240, Math.round(rect.width));
      const nextHeight = Math.max(240, Math.round(rect.height));
      if (nextWidth !== width || nextHeight !== height) {
        width = nextWidth;
        height = nextHeight;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        for (const node of nodes) {
          node.x = 0;
          node.y = 0;
          node.vx = 0;
          node.vy = 0;
        }
      }
    };

    syncCanvasSize();

    const draw = (now: number) => {
      if (pausedRef.current) {
        running = false;
        return;
      }
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Step rotational spring when released
      if (!prefersReduced) {
        springRef.current = stepAngularSpring(springRef.current, dt, 210, 22);
      } else {
        springRef.current.angleDeg = springRef.current.targetAngleDeg;
        springRef.current.velocityDeg = 0;
      }

      const cx = width / 2;
      const cy = height / 2;
      const diskBaseRadius = Math.min(width, height) * (compact ? 0.29 : 0.27);
      const innerR = diskBaseRadius * 0.75;
      const thinThick = diskBaseRadius * 0.105;
      const bitThick = diskBaseRadius * 0.265;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Subtle pin-centered ambient brass glow (only gradient permitted per DESIGN.md)
      const currentShift = angleToShift(springRef.current.angleDeg);
      const pinGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, diskBaseRadius * 1.45);
      pinGlow.addColorStop(
        0,
        currentShift === 0 ? 'rgba(234, 180, 68, 0.14)' : 'rgba(243, 247, 254, 0.05)'
      );
      pinGlow.addColorStop(0.55, 'rgba(234, 180, 68, 0.025)');
      pinGlow.addColorStop(1, 'rgba(4, 6, 11, 0)');
      ctx.fillStyle = pinGlow;
      ctx.fillRect(0, 0, width, height);

      // 24 polar grid spokes & concentric tracks
      ctx.lineWidth = 1;
      for (let i = 0; i < CELL_COUNT; i++) {
        const angle = (-90 + i * STEP_DEG) * (Math.PI / 180);
        const rStart = diskBaseRadius * 0.34;
        const rEnd = diskBaseRadius * 1.56;
        ctx.strokeStyle = i === 0 ? 'rgba(234, 180, 68, 0.38)' : 'rgba(45, 48, 56, 0.62)';
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * rStart, cy + Math.sin(angle) * rStart);
        ctx.lineTo(cx + Math.cos(angle) * rEnd, cy + Math.sin(angle) * rEnd);
        ctx.stroke();
      }

      for (const mult of [0.5, 1.24, 1.44]) {
        ctx.strokeStyle = 'rgba(45, 48, 56, 0.55)';
        ctx.beginPath();
        ctx.arc(cx, cy, diskBaseRadius * mult, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 2D Spring-Physics Polar Nodes reactive to cursor field
      const ptr = pointerRef.current;
      let maxNodeEnergy = 0;
      for (const node of nodes) {
        const restX = cx + Math.cos(node.baseAngle) * diskBaseRadius * node.baseRadius;
        const restY = cy + Math.sin(node.baseAngle) * diskBaseRadius * node.baseRadius;
        if (node.x === 0 && node.y === 0) {
          node.x = restX;
          node.y = restY;
        }

        if (!prefersReduced) {
          let fx = (restX - node.x) * 140;
          let fy = (restY - node.y) * 140;

          if (ptr.active) {
            const dx = node.x - ptr.x;
            const dy = node.y - ptr.y;
            const distSq = dx * dx + dy * dy;
            const influenceRadius = 110;
            if (distSq < influenceRadius * influenceRadius && distSq > 4) {
              const dist = Math.sqrt(distSq);
              const force = ((influenceRadius - dist) / influenceRadius) * 1800;
              fx += (dx / dist) * force;
              fy += (dy / dist) * force;
            }
          }

          node.vx = (node.vx + fx * dt) * Math.exp(-11 * dt);
          node.vy = (node.vy + fy * dt) * Math.exp(-11 * dt);
          node.x += node.vx * dt;
          node.y += node.vy * dt;
          const e = Math.abs(node.vx) + Math.abs(node.vy) + Math.abs(restX - node.x) + Math.abs(restY - node.y);
          if (e > maxNodeEnergy) maxNodeEnergy = e;
        } else {
          node.x = restX;
          node.y = restY;
        }

        // Tether hairline when displaced
        const disp = Math.hypot(node.x - restX, node.y - restY);
        if (disp > 1.2) {
          ctx.strokeStyle = node.isKeySpoke
            ? 'rgba(234, 180, 68, 0.45)'
            : 'rgba(148, 152, 161, 0.3)';
          ctx.beginPath();
          ctx.moveTo(restX, restY);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();
        }

        ctx.fillStyle = node.isKeySpoke
          ? '#eab444'
          : disp > 4
            ? '#f3f7fe'
            : 'rgba(148, 152, 161, 0.65)';
        const nodeSize = node.isKeySpoke ? 3.2 : 2;
        ctx.fillRect(node.x - nodeSize / 2, node.y - nodeSize / 2, nodeSize, nodeSize);
      }

      // Click / Detent Shockwave Rings
      for (let i = wavesRef.current.length - 1; i >= 0; i--) {
        const w = wavesRef.current[i];
        w.radius += 260 * dt;
        w.alpha -= 1.8 * dt;
        if (w.alpha <= 0) {
          wavesRef.current.splice(i, 1);
          continue;
        }
        ctx.strokeStyle =
          w.color === '#eab444'
            ? `rgba(234, 180, 68, ${w.alpha.toFixed(3)})`
            : `rgba(243, 247, 254, ${w.alpha.toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, w.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 12 o'clock brass fixed index triangle
      const markerY = cy - diskBaseRadius * 1.15;
      ctx.fillStyle = '#eab444';
      ctx.beginPath();
      ctx.moveTo(cx - 6, markerY - 8);
      ctx.lineTo(cx + 6, markerY - 8);
      ctx.lineTo(cx, markerY);
      ctx.closePath();
      ctx.fill();

      // Rotating 24-cell Alberti Cipher Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((springRef.current.angleDeg * Math.PI) / 180);

      const gapRad = (1.1 * Math.PI) / 180;
      const halfCellRad = (7.5 * Math.PI) / 180;

      for (let i = 0; i < CELL_COUNT; i++) {
        const bit = SIFR_BITS[i];
        const centerRad = ((-90 + i * STEP_DEG) * Math.PI) / 180;
        const a0 = centerRad - halfCellRad + gapRad;
        const a1 = centerRad + halfCellRad - gapRad;
        const r1 = innerR + (bit === 1 ? bitThick : thinThick);

        ctx.beginPath();
        ctx.arc(0, 0, r1, a0, a1, false);
        ctx.arc(0, 0, innerR, a1, a0, true);
        ctx.closePath();

        if (i === 0) {
          ctx.fillStyle = '#eab444';
        } else {
          ctx.fillStyle = currentShift === 0 ? '#f3f7fe' : '#b9bec7';
        }
        ctx.fill();
      }
      ctx.restore();

      // Central brass pin (zero dot)
      ctx.fillStyle = '#eab444';
      ctx.beginPath();
      ctx.arc(cx, cy, diskBaseRadius * 0.13, 0, Math.PI * 2);
      ctx.fill();

      // Hairline reticle around pin
      ctx.strokeStyle = 'rgba(234, 180, 68, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, diskBaseRadius * 0.21, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      const springMoving =
        springRef.current.dragging ||
        Math.abs(springRef.current.velocityDeg) > 0.2 ||
        Math.abs(springRef.current.targetAngleDeg - springRef.current.angleDeg) > 0.08;
      const shouldContinue =
        !prefersReduced &&
        !pausedRef.current &&
        (ptr.active || springMoving || wavesRef.current.length > 0 || maxNodeEnergy > 0.35);

      if (shouldContinue) {
        rafId = requestAnimationFrame(draw);
      } else {
        running = false;
      }
    };

    const wake = () => {
      if (pausedRef.current) return;
      if (running) return;
      running = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(draw);
    };
    wakeRef.current = wake;

    const ro = new ResizeObserver(() => {
      syncCanvasSize();
      if (!pausedRef.current) {
        draw(performance.now());
      }
    });
    ro.observe(canvas);

    draw(performance.now());
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      wakeRef.current = null;
    };
  }, [compact]);

  const getPointerAngle = (clientX: number, clientY: number): number => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const rect = canvas.getBoundingClientRect();
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const angle = getPointerAngle(e.clientX, e.clientY);
    dragRef.current = {
      active: true,
      lastPointerAngleDeg: angle,
      angularVelocityDeg: 0,
      lastMoveTs: performance.now(),
      moved: false,
    };
    springRef.current.dragging = true;
    setIsDragging(true);
    wakeRef.current?.();
    haptics.trigger('tap');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    pointerRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
    wakeRef.current?.();

    if (!dragRef.current.active) return;

    const currentAngle = getPointerAngle(e.clientX, e.clientY);
    let delta = currentAngle - dragRef.current.lastPointerAngleDeg;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    if (Math.abs(delta) > 0.6) {
      dragRef.current.moved = true;
    }

    const now = performance.now();
    const dt = Math.max(0.004, (now - dragRef.current.lastMoveTs) / 1000);
    dragRef.current.angularVelocityDeg = delta / dt;
    dragRef.current.lastMoveTs = now;
    dragRef.current.lastPointerAngleDeg = currentAngle;

    springRef.current.angleDeg += delta;
    springRef.current.targetAngleDeg = springRef.current.angleDeg;

    const nextShift = angleToShift(springRef.current.angleDeg);
    if (nextShift !== lastDetentShiftRef.current) {
      lastDetentShiftRef.current = nextShift;
      haptics.trigger(nextShift === 0 ? 'snapZero' : 'detent');
      onShiftChangeRef.current(nextShift);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    if (!dragRef.current.active) return;

    const wasClick = !dragRef.current.moved;
    dragRef.current.active = false;
    springRef.current.dragging = false;
    setIsDragging(false);

    if (wasClick) {
      const next = normalizeShift(shift + 1);
      springRef.current.targetAngleDeg = shiftToAngle(next);
      lastDetentShiftRef.current = next;
      haptics.trigger(next === 0 ? 'snapZero' : 'detent');
      wavesRef.current.push({
        radius: 14,
        alpha: 0.85,
        color: next === 0 ? '#eab444' : '#f3f7fe',
      });
      onShiftChange(next);
      return;
    }

    // Apply rotational inertia before snapping to nearest 15 deg detent
    const throwAngle = springRef.current.angleDeg + dragRef.current.angularVelocityDeg * 0.12;
    const snappedShift = angleToShift(throwAngle);
    springRef.current.velocityDeg = dragRef.current.angularVelocityDeg * 0.35;
    springRef.current.targetAngleDeg = shiftToAngle(snappedShift);
    lastDetentShiftRef.current = snappedShift;
    haptics.trigger(snappedShift === 0 ? 'snapZero' : 'confirm');
    wavesRef.current.push({
      radius: 16,
      alpha: 0.8,
      color: snappedShift === 0 ? '#eab444' : '#f3f7fe',
    });
    onShiftChange(snappedShift);
  };

  const decoded = decodeRingAtShift(shift);

  useEffect(() => {
    if (!minimal || scrollProgress === undefined) return;
    if (!dragRef.current.active) {
      springRef.current.targetAngleDeg = shiftToAngle(shift) + scrollProgress * 120;
      wakeRef.current?.();
    }
  }, [minimal, scrollProgress, shift]);

  useEffect(() => {
    if (!minimal || !scrollProgressRef) return;
    const onScrollSync = () => {
      if (!dragRef.current.active) {
        springRef.current.targetAngleDeg = shiftToAngle(shift) + (scrollProgressRef.current ?? 0) * 120;
        wakeRef.current?.();
      }
    };
    window.addEventListener('sifr-scroll-sync', onScrollSync, { passive: true });
    return () => window.removeEventListener('sifr-scroll-sync', onScrollSync);
  }, [minimal, scrollProgressRef, shift]);

  if (minimal) {
    return (
      <div className="flex flex-col items-center w-full">
        <div className="relative w-full aspect-square max-w-[410px] border border-[#2d3038] hover:border-[#eab444]/60 transition-colors duration-200 bg-[#0a0d13] chamfer overflow-hidden">
          <canvas
            ref={canvasRef}
            data-testid="cipher-physics-canvas"
            data-shift={shift}
            aria-label="SIFR 24-cell cipher dial"
            onPointerMove={(e) => {
              const canvas = canvasRef.current;
              if (!canvas) return;
              const rect = canvas.getBoundingClientRect();
              const lx = e.clientX - rect.left;
              const ly = e.clientY - rect.top;
              pointerRef.current = {
                x: lx,
                y: ly,
                active: true,
              };
              const angleRad = Math.atan2(ly - rect.height * 0.5, lx - rect.width * 0.5);
              ambientSoundscape.playScrubTick((angleRad + Math.PI) / (Math.PI * 2));
              wakeRef.current?.();
            }}
            onPointerDown={(e) => {
              const canvas = canvasRef.current;
              if (!canvas) return;
              const rect = canvas.getBoundingClientRect();
              pointerRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                active: true,
              };
              wavesRef.current.push({
                radius: 16,
                alpha: 0.78,
                color: '#eab444',
              });
              ambientSoundscape.playPanelShimmer(shift, 'touch');
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
            className="w-full h-full block select-none touch-pan-x touch-pan-y cursor-crosshair"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className={`relative w-full aspect-square ${compact ? 'max-w-[440px]' : 'max-w-[392px]'} border border-[#2d3038] bg-[#0a0d13] chamfer overflow-hidden`}>
        <canvas
          ref={canvasRef}
          data-testid="cipher-physics-canvas"
          data-shift={shift}
          aria-label={`Interactive 24-cell cipher disk at shift ${shift}, decoding ${decoded.word}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={() => {
            pointerRef.current.active = false;
            wakeRef.current?.();
          }}
          className={`w-full h-full block touch-none select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        />
        <div className="pointer-events-none absolute left-4 top-3 flex items-center gap-2 font-mobilis text-[11px] uppercase tracking-[0.14em] text-[#9498a1]">
          <span>24 Cells</span>
          <span aria-hidden="true">·</span>
          <span>15° Detent</span>
        </div>
        <div className="pointer-events-none absolute right-6 bottom-3 font-mobilis text-[11px] text-[#9498a1]">
          Drag ring or click
        </div>
      </div>

      {/* Live Cipher Controls + Bitstream Readout */}
      <div className={`w-full ${compact ? 'max-w-[440px]' : 'max-w-[392px]'} mt-4 border border-[#2d3038] bg-[#0a0d13] p-4`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = normalizeShift(shift - 1);
                  haptics.trigger(next === 0 ? 'snapZero' : 'detent');
                  onShiftChange(next);
                }}
                className="min-h-[40px] px-3 py-2 border border-[#2d3038] bg-[#171b21] hover:border-[#eab444] text-[#f3f7fe] font-mobilis text-xs uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                aria-label="Step cipher disk backward 15 degrees"
              >
                -15°
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = normalizeShift(shift + 1);
                  haptics.trigger(next === 0 ? 'snapZero' : 'detent');
                  onShiftChange(next);
                }}
                className="min-h-[40px] px-3 py-2 border border-[#2d3038] bg-[#171b21] hover:border-[#eab444] text-[#f3f7fe] font-mobilis text-xs uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                aria-label="Step cipher disk forward one cell"
              >
                Step +15°
              </button>
              <button
                type="button"
                onClick={() => {
                  haptics.trigger('snapZero');
                  onShiftChange(0);
                }}
                className={`min-h-[40px] px-3 py-2 font-mobilis text-xs uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  decoded.isZeroShift
                    ? 'bg-[#eab444] text-[#04060b] font-bold'
                    : 'border border-[#eab444] text-[#eab444] hover:bg-[#eab444] hover:text-[#04060b]'
                }`}
              >
                Shift 0
              </button>
            </div>
            <span className="font-mobilis text-xs text-[#9498a1]">
              shift <span className="text-[#f3f7fe] font-bold">{decoded.shift}</span>
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-[#2d3038] flex items-baseline justify-between gap-4">
            <div
              data-testid="cipher-decoded-word"
              className={`font-mobilis text-2xl font-bold tracking-[0.22em] ${
                decoded.isZeroShift ? 'text-[#eab444]' : 'text-[#fc5855]'
              }`}
            >
              {decoded.word}
            </div>
            <div className="font-mobilis text-[11px] text-[#9498a1] whitespace-nowrap">
              {decoded.isZeroShift ? 'aligned · ok' : 'garble · shift ≠ 0'}
            </div>
          </div>
          <div className="mt-2 font-mobilis text-[11px] text-[#9498a1] tracking-wider flex flex-wrap gap-x-2">
            {decoded.binaryGroups.map((grp, idx) => (
              <span key={idx} className={idx === 0 && decoded.isZeroShift ? 'text-[#eab444]' : ''}>
                {grp}
              </span>
            ))}
          </div>
      </div>
    </div>
  );
}
