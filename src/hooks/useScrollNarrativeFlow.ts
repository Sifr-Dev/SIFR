import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { computeMotionBlurPx, computeSpreadFocusState } from '../lib/scrollNarrative';

interface RegisteredSpread {
  el: HTMLElement;
  label?: string;
  pinEdge?: 'start' | 'end';
}

interface UseScrollNarrativeFlowOptions {
  trackRef: RefObject<HTMLDivElement | null>;
  motionBlurContainerRef?: RefObject<HTMLElement | null>;
  isMobile: boolean;
  onActiveLabelChange?: (label: string) => void;
  onSyncFrame?: (progress: number) => void;
  onMotionVelocityChange?: (velocityNorm: number, blurPx: number) => void;
}

/**
 * Scroll-linked animation hook using requestAnimationFrame to drive:
 * 1) Gradual fade-out of older spreads as new sections enter focus.
 * 2) Velocity-coupled CSS filter motion blur on the moving container during fast scroll transitions,
 *    resolving smoothly back to crisp `filter: none` when resting.
 */
export function useScrollNarrativeFlow({
  trackRef,
  motionBlurContainerRef,
  isMobile,
  onActiveLabelChange,
  onSyncFrame,
  onMotionVelocityChange,
}: UseScrollNarrativeFlowOptions) {
  const entriesRef = useRef<Map<string, RegisteredSpread>>(new Map());
  const rafRef = useRef(0);
  const motionRafRef = useRef(0);
  const lastLabelRef = useRef<string>('');
  const lastProgressRef = useRef<number>(-1);
  const velocityStateRef = useRef<{
    lastScrollPx: number;
    lastSampleMs: number;
    currentBlurPx: number;
    smoothedVelocity: number;
  }>({
    lastScrollPx: 0,
    lastSampleMs: 0,
    currentBlurPx: 0,
    smoothedVelocity: 0,
  });

  const onActiveLabelRef = useRef(onActiveLabelChange);
  const onSyncFrameRef = useRef(onSyncFrame);
  const onMotionVelocityRef = useRef(onMotionVelocityChange);
  onActiveLabelRef.current = onActiveLabelChange;
  onSyncFrameRef.current = onSyncFrame;
  onMotionVelocityRef.current = onMotionVelocityChange;

  const getScrollPos = useCallback((): number => {
    if (typeof window === 'undefined') return 0;
    if (isMobile) return window.scrollY;
    return trackRef.current ? trackRef.current.scrollLeft : 0;
  }, [isMobile, trackRef]);

  const applyContainerBlur = useCallback(
    (blurPx: number, velocityNorm: number) => {
      const targetEl = motionBlurContainerRef?.current;
      if (targetEl) {
        if (blurPx >= 0.08) {
          targetEl.style.filter = `blur(${blurPx.toFixed(2)}px)`;
          targetEl.dataset.motionBlur = blurPx.toFixed(2);
        } else {
          if (targetEl.style.filter && targetEl.style.filter !== 'none') {
            targetEl.style.filter = 'none';
          }
          delete targetEl.dataset.motionBlur;
        }
      }
      onMotionVelocityRef.current?.(velocityNorm, blurPx);
    },
    [motionBlurContainerRef]
  );

  const stepMotionBlur = useCallback(
    (now: number) => {
      motionRafRef.current = 0;
      if (typeof window === 'undefined') return;

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const state = velocityStateRef.current;
      const currentPos = getScrollPos();

      if (state.lastSampleMs === 0) {
        state.lastSampleMs = now;
        state.lastScrollPx = currentPos;
        return;
      }

      const dt = Math.min(0.06, Math.max(0.008, (now - state.lastSampleMs) / 1000));
      const instantVelocity = Math.abs(currentPos - state.lastScrollPx) / dt;
      state.lastScrollPx = currentPos;
      state.lastSampleMs = now;

      // Fast attack, smooth optical decay
      const attackOrDecay = instantVelocity > state.smoothedVelocity ? 18 : 11;
      state.smoothedVelocity +=
        (instantVelocity - state.smoothedVelocity) * (1 - Math.exp(-attackOrDecay * dt));

      const targetBlur = computeMotionBlurPx(state.smoothedVelocity, 2.35, reducedMotion);
      state.currentBlurPx +=
        (targetBlur - state.currentBlurPx) * (1 - Math.exp(-15 * dt));

      const velocityNorm = Math.max(0, Math.min(1, state.smoothedVelocity / 2400));

      if (state.currentBlurPx < 0.06 && state.smoothedVelocity < 18) {
        state.currentBlurPx = 0;
        state.smoothedVelocity = 0;
        applyContainerBlur(0, 0);
        return;
      }

      applyContainerBlur(state.currentBlurPx, velocityNorm);
      motionRafRef.current = requestAnimationFrame(stepMotionBlur);
    },
    [applyContainerBlur, getScrollPos]
  );

  const wakeMotionBlur = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!motionRafRef.current) {
      if (velocityStateRef.current.lastSampleMs === 0) {
        velocityStateRef.current.lastSampleMs = performance.now() - 16;
      }
      motionRafRef.current = requestAnimationFrame(stepMotionBlur);
    }
  }, [stepMotionBlur]);

  const evaluate = useCallback(() => {
    rafRef.current = 0;
    if (typeof window === 'undefined') return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const viewportSize = isMobile ? window.innerHeight || 844 : window.innerWidth || 1440;
    const viewportCenter = isMobile ? viewportSize * 0.45 : viewportSize * 0.48;

    let scrollProgress = 0;
    if (isMobile) {
      const maxY = Math.max(1, document.documentElement.scrollHeight - (window.innerHeight || 844));
      scrollProgress = Math.max(0, Math.min(1, window.scrollY / maxY));
    } else if (trackRef.current) {
      const el = trackRef.current;
      const maxX = Math.max(1, el.scrollWidth - el.clientWidth);
      scrollProgress = Math.max(0, Math.min(1, el.scrollLeft / maxX));
    }

    let closestLabel = '';
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const entry of entriesRef.current.values()) {
      const rect = entry.el.getBoundingClientRect();
      const itemCenter = isMobile
        ? rect.top + rect.height * 0.5
        : rect.left + rect.width * 0.5;

      const focus = computeSpreadFocusState({
        itemCenter,
        viewportCenter,
        viewportSize,
        scrollProgress,
        pinEdge: entry.pinEdge,
        reducedMotion,
      });

      entry.el.style.opacity = String(focus.opacity);
      const intDrift = Math.round(focus.driftPx);
      entry.el.style.transform = isMobile
        ? `translate3d(0, ${intDrift}px, 0)`
        : `translate3d(${intDrift}px, 0, 0)`;
      entry.el.dataset.focusState = focus.state;
      entry.el.dataset.focusOpacity = focus.opacity.toFixed(2);

      if (entry.label) {
        const dist = Math.abs(itemCenter - viewportCenter);
        if (dist < closestDistance) {
          closestDistance = dist;
          closestLabel = entry.label;
        }
      }
    }

    if (closestLabel && closestLabel !== lastLabelRef.current) {
      lastLabelRef.current = closestLabel;
      onActiveLabelRef.current?.(closestLabel);
    }

    const roundedProgress = Math.round(scrollProgress * 1000) / 1000;
    if (roundedProgress !== lastProgressRef.current) {
      lastProgressRef.current = roundedProgress;
      onSyncFrameRef.current?.(scrollProgress);
    }
  }, [isMobile, trackRef]);

  const scheduleEvaluate = useCallback(() => {
    wakeMotionBlur();
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(evaluate);
  }, [evaluate, wakeMotionBlur]);

  useEffect(() => {
    velocityStateRef.current.lastScrollPx = getScrollPos();
    velocityStateRef.current.lastSampleMs = performance.now();
    evaluate();
    const target: EventTarget | null = isMobile ? window : trackRef.current;
    target?.addEventListener('scroll', scheduleEvaluate, { passive: true });
    window.addEventListener('resize', scheduleEvaluate, { passive: true });

    return () => {
      target?.removeEventListener('scroll', scheduleEvaluate);
      window.removeEventListener('resize', scheduleEvaluate);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      if (motionRafRef.current) {
        cancelAnimationFrame(motionRafRef.current);
        motionRafRef.current = 0;
      }
    };
  }, [isMobile, trackRef, evaluate, scheduleEvaluate, getScrollPos]);

  const registerSpread = useCallback(
    (id: string, meta?: { label?: string; pinEdge?: 'start' | 'end' }) =>
      (el: HTMLElement | null) => {
        if (!el) {
          entriesRef.current.delete(id);
          return;
        }
        entriesRef.current.set(id, {
          el,
          label: meta?.label,
          pinEdge: meta?.pinEdge,
        });
      },
    []
  );

  return {
    registerSpread,
    syncNow: evaluate,
  };
}
