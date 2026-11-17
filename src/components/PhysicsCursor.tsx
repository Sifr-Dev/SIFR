import { useEffect, useRef, useState } from 'react';

type CursorMode = 'default' | 'action' | 'cipher' | 'schematic' | 'text';

interface PhysicsCursorProps {
  enabled: boolean;
}

function classifyTarget(target: EventTarget | null): { mode: CursorMode; label: string } {
  if (!(target instanceof Element)) {
    return { mode: 'default', label: '' };
  }

  if (target.closest('[data-testid="cipher-physics-canvas"]')) {
    return { mode: 'cipher', label: 'CIPHER · DRAG' };
  }
  if (target.closest('[data-testid^="schematic-"]')) {
    return { mode: 'schematic', label: '2D FIELD' };
  }
  if (target.closest('input[type="text"], input[type="search"], textarea')) {
    return { mode: 'text', label: 'INPUT' };
  }

  const interactive = target.closest('button, a, [role="tab"], input[type="range"], summary');
  if (interactive) {
    const customLabel = interactive.getAttribute('data-cursor-label');
    if (customLabel) return { mode: 'action', label: customLabel };
    const text = (interactive.getAttribute('aria-label') || interactive.textContent || '').trim();
    const isExternalLink =
      interactive.tagName === 'A' && interactive.getAttribute('target') === '_blank';
    if (isExternalLink || /^(repository|source|github)/i.test(text)) {
      return { mode: 'action', label: 'SRC ↗' };
    }
    if (/inspect/i.test(text)) {
      return { mode: 'action', label: 'INSPECT' };
    }
    if (/launch lab|live demo|interactive demo/i.test(text)) {
      return { mode: 'action', label: 'LAB' };
    }
    if (/reel|film|play/i.test(text)) {
      return { mode: 'action', label: 'REEL' };
    }
    return { mode: 'action', label: 'ENGAGE' };
  }

  return { mode: 'default', label: '' };
}

export function PhysicsCursor({ enabled }: PhysicsCursorProps) {
  const pinRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const trailRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);

  const [canRender, setCanRender] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>('default');
  const [label, setLabel] = useState('');

  const modeRef = useRef<CursorMode>('default');
  const visibleRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setCanRender(false);
      delete document.documentElement.dataset.customCursor;
      return;
    }

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) {
      setCanRender(false);
      delete document.documentElement.dataset.customCursor;
      return;
    }

    setCanRender(true);
    document.documentElement.dataset.customCursor = 'active';
    return () => {
      delete document.documentElement.dataset.customCursor;
    };
  }, [enabled]);

  useEffect(() => {
    if (!canRender) return;

    const state = {
      tx: window.innerWidth / 2,
      ty: window.innerHeight / 2,
      fx: window.innerWidth / 2,
      fy: window.innerHeight / 2,
      vx: 0,
      vy: 0,
      hx: window.innerWidth / 2,
      hy: window.innerHeight / 2,
      hvx: 0,
      hvy: 0,
      pulse: 0,
      hoverX: 0,
      hoverY: 0,
    };

    let rafId = 0;
    let running = false;
    let lastTs = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - lastTs) / 1000, 0.05);
      lastTs = now;

      // Second-order spring-damper trailing frame
      const stiffness = modeRef.current === 'action' ? 280 : 210;
      const damping = 22;
      const ax = (state.tx - state.fx) * stiffness - state.vx * damping;
      const ay = (state.ty - state.fy) * stiffness - state.vy * damping;
      state.vx += ax * dt;
      state.vy += ay * dt;
      state.fx += state.vx * dt;
      state.fy += state.vy * dt;

      // Softer ghost orbital halo spring
      const hStiff = 96;
      const hDamp = 15;
      const hax = (state.tx - state.hx) * hStiff - state.hvx * hDamp;
      const hay = (state.ty - state.hy) * hStiff - state.hvy * hDamp;
      state.hvx += hax * dt;
      state.hvy += hay * dt;
      state.hx += state.hvx * dt;
      state.hy += state.hvy * dt;

      if (state.pulse > 0) {
        state.pulse = Math.max(0, state.pulse - dt * 4.5);
      }

      const speed = Math.hypot(state.vx, state.vy);
      const tiltDeg = Math.max(-14, Math.min(14, (state.vx - state.vy) * 0.012));
      const baseRot = modeRef.current === 'cipher' ? 45 : 0;
      const scale =
        modeRef.current === 'action'
          ? 0.92 + state.pulse * 0.35
          : modeRef.current === 'cipher'
            ? 1.08 + state.pulse * 0.25
            : 1 + state.pulse * 0.28 + Math.min(0.12, speed * 0.00018);

      const haloScale = 1 + state.pulse * 0.55 + Math.min(0.45, speed * 0.00035);

      if (pinRef.current) {
        pinRef.current.style.transform = `translate3d(${state.tx}px, ${state.ty}px, 0) scale(${1 + state.pulse * 0.45})`;
      }
      if (frameRef.current) {
        frameRef.current.style.transform = `translate3d(${state.fx}px, ${state.fy}px, 0) rotate(${baseRot + tiltDeg}deg) scale(${scale})`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${state.hx}px, ${state.hy}px, 0) scale(${haloScale})`;
        trailRef.current.style.opacity = modeRef.current === 'text' ? '0' : String(Math.min(0.55, 0.2 + speed * 0.0003 + state.pulse * 0.35));
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${state.fx + 18}px, ${state.fy + 16}px, 0)`;
      }

      const delta = Math.hypot(state.tx - state.fx, state.ty - state.fy) + Math.hypot(state.tx - state.hx, state.ty - state.hy);
      const kinetic = Math.abs(state.vx) + Math.abs(state.vy) + Math.abs(state.hvx) + Math.abs(state.hvy);
      if (delta > 0.2 || kinetic > 0.8 || state.pulse > 0.01) {
        rafId = requestAnimationFrame(step);
      } else {
        state.fx = state.tx;
        state.fy = state.ty;
        state.hx = state.tx;
        state.hy = state.ty;
        state.vx = 0;
        state.vy = 0;
        state.hvx = 0;
        state.hvy = 0;
        if (frameRef.current) {
          frameRef.current.style.transform = `translate3d(${state.fx}px, ${state.fy}px, 0) rotate(${baseRot}deg) scale(${
            modeRef.current === 'action' ? 0.92 : modeRef.current === 'cipher' ? 1.08 : 1
          })`;
        }
        if (trailRef.current) {
          trailRef.current.style.transform = `translate3d(${state.hx}px, ${state.hy}px, 0) scale(1)`;
          trailRef.current.style.opacity = modeRef.current === 'text' ? '0' : '0.18';
        }
        running = false;
      }
    };

    const wake = () => {
      if (running) return;
      running = true;
      lastTs = performance.now();
      rafId = requestAnimationFrame(step);
    };

    const onPointerMove = (e: PointerEvent) => {
      state.tx = e.clientX;
      state.ty = e.clientY;
      if (!visibleRef.current) {
        state.fx = e.clientX;
        state.fy = e.clientY;
        state.hx = e.clientX;
        state.hy = e.clientY;
        visibleRef.current = true;
        setVisible(true);
      }
      const next = classifyTarget(e.target);
      if (next.mode !== modeRef.current) {
        modeRef.current = next.mode;
        setMode(next.mode);
      }
      setLabel((prev) => (prev === next.label ? prev : next.label));
      wake();
    };

    const onPointerDown = (e: PointerEvent) => {
      state.tx = e.clientX;
      state.ty = e.clientY;
      state.pulse = 1;
      wake();
    };

    const onPointerLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('mouseleave', onPointerLeave);
    };
  }, [canRender]);

  if (!canRender) return null;

  const isBrass = mode !== 'default';
  const bracketSize =
    mode === 'cipher' ? 42 : mode === 'schematic' ? 36 : mode === 'action' ? 30 : mode === 'text' ? 22 : 24;

  return (
    <div
      data-testid="sifr-physics-cursor"
      data-cursor-mode={mode}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-150"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Ghost celestial halo ring */}
      <div
        ref={trailRef}
        className="absolute top-0 left-0 will-change-transform border border-[#eab444]/40"
        style={{
          width: '44px',
          height: '44px',
          marginLeft: '-22px',
          marginTop: '-22px',
          borderRadius: '9999px',
          opacity: 0.18,
        }}
      />

      {/* Spring-damper trailing architectural reticle */}
      <div
        ref={frameRef}
        className="absolute top-0 left-0 will-change-transform"
        style={{
          width: `${bracketSize}px`,
          height: mode === 'text' ? '22px' : `${bracketSize}px`,
          marginLeft: `${-bracketSize / 2}px`,
          marginTop: `${-(mode === 'text' ? 22 : bracketSize) / 2}px`,
        }}
      >
        {mode === 'text' ? (
          <div className="w-[2px] h-full mx-auto bg-[#eab444]" />
        ) : (
          <>
            <span
              className={`absolute top-0 left-0 w-2 h-2 border-t border-l transition-colors duration-150 ${
                isBrass ? 'border-[#eab444]' : 'border-[#b9bec7]/70'
              }`}
            />
            <span
              className={`absolute top-0 right-0 w-2 h-2 border-t border-r transition-colors duration-150 ${
                isBrass ? 'border-[#eab444]' : 'border-[#b9bec7]/70'
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l transition-colors duration-150 ${
                isBrass ? 'border-[#eab444]' : 'border-[#b9bec7]/70'
              }`}
            />
            <span
              className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r transition-colors duration-150 ${
                isBrass ? 'border-[#eab444]' : 'border-[#b9bec7]/70'
              }`}
            />
          </>
        )}
      </div>

      {/* Precision center pin */}
      <div
        ref={pinRef}
        className="absolute top-0 left-0 will-change-transform"
        style={{
          width: '4px',
          height: '4px',
          marginLeft: '-2px',
          marginTop: '-2px',
          backgroundColor: isBrass ? '#eab444' : '#f3f7fe',
          opacity: mode === 'text' ? 0 : 1,
        }}
      />

      {/* Micro monospace context tag */}
      <div
        ref={labelRef}
        className="absolute top-0 left-0 will-change-transform font-mobilis text-[10px] uppercase tracking-[0.14em] px-1.5 py-0.5 border border-[#2d3038] bg-[#04060b]/90 text-[#eab444] whitespace-nowrap transition-opacity duration-150"
        style={{ opacity: label && mode !== 'text' ? 1 : 0 }}
      >
        {label}
      </div>
    </div>
  );
}
