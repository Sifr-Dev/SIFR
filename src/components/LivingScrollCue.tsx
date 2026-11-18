import { useEffect, useRef } from 'react';

interface LivingScrollCueProps {
  isMobile: boolean;
  scrollProgressRef: React.RefObject<number>;
}

/**
 * Living-canvas visual motion cue replacing literal "Scroll right" / "Scroll down" text.
 * Uses pure compositor-level SVG + rAF opacity syncing so there are zero React re-renders.
 */
export function LivingScrollCue({ isMobile, scrollProgressRef }: LivingScrollCueProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const syncVisibility = () => {
      if (!wrapRef.current) return;
      const p = scrollProgressRef.current ?? 0;
      const fade = Math.max(0.18, 1 - p * 9);
      wrapRef.current.style.opacity = fade.toFixed(2);
    };
    syncVisibility();
    window.addEventListener('sifr-scroll-sync', syncVisibility);
    return () => window.removeEventListener('sifr-scroll-sync', syncVisibility);
  }, [scrollProgressRef]);

  if (isMobile) {
    return (
      <div
        ref={wrapRef}
        data-testid="living-scroll-cue"
        aria-hidden="true"
        className="flex items-center gap-3 pt-1 transition-opacity duration-300"
      >
        <svg width="24" height="44" viewBox="0 0 24 44" fill="none" className="overflow-visible">
          <line x1="12" y1="2" x2="12" y2="38" stroke="#2d3038" strokeWidth="1" />
          <path d="M7 33 L12 39 L17 33" stroke="#eab444" strokeWidth="1.25" strokeLinecap="square" />
          <circle cx="12" cy="8" r="2.2" fill="#eab444">
            <animate
              attributeName="cy"
              values="6;34;6"
              dur="2.4s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
            />
            <animate
              attributeName="opacity"
              values="0.2;1;0.2"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      data-testid="living-scroll-cue"
      aria-hidden="true"
      className="pt-3 flex items-center gap-3 transition-opacity duration-300"
    >
      <svg width="136" height="20" viewBox="0 0 136 20" fill="none" className="overflow-visible">
        {/* Baseline trajectory */}
        <line x1="0" y1="10" x2="128" y2="10" stroke="#2d3038" strokeWidth="1" />
        {/* Travelling optical pulse */}
        <line x1="0" y1="10" x2="36" y2="10" stroke="#eab444" strokeWidth="1.5" strokeOpacity="0.85">
          <animate
            attributeName="x1"
            values="0;92;0"
            dur="2.8s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
          />
          <animate
            attributeName="x2"
            values="28;126;28"
            dur="2.8s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
          />
        </line>
        {/* Origin node + directional chevron */}
        <circle cx="2" cy="10" r="2" fill="#eab444" />
        <path d="M123 5 L129 10 L123 15" stroke="#eab444" strokeWidth="1.35" strokeLinecap="square" />
        <path
          d="M113 6 L118 10 L113 14"
          stroke="#eab444"
          strokeOpacity="0.45"
          strokeWidth="1.15"
          strokeLinecap="square"
        />
      </svg>
    </div>
  );
}
