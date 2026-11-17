export type ShortcutAction =
  | 'advance'
  | 'back'
  | 'tab-1'
  | 'tab-2'
  | 'tab-3'
  | 'toggle-audio'
  | 'open-lab'
  | 'open-reel'
  | 'toggle-help'
  | 'close-help'
  | 'jump-dispatch'
  | 'jump-top';

export interface KeyboardContextState {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  isInputTarget: boolean;
  hasEntered: boolean;
  hasExited: boolean;
  paused: boolean;
  helpOpen: boolean;
  currentIndex: number;
}

export interface KeyboardResolution {
  action: ShortcutAction | null;
  preventDefault: boolean;
}

export interface ShortcutItem {
  keys: string;
  label: string;
  scope: string;
}

export const KEYBOARD_SHORTCUTS: ShortcutItem[] = [
  { keys: '→ / J', label: 'Advance to next chapter', scope: 'Active Ride' },
  { keys: '← / K', label: 'Return to previous chapter', scope: 'Active Ride' },
  { keys: '1 · 2 · 3', label: 'Switch Lab, README.md, or Benchmarks', scope: 'Chapter Lens' },
  { keys: 'F', label: 'Open fullscreen Inspection Lab', scope: 'Active Ride' },
  { keys: 'S', label: 'Open Motion Film reel', scope: 'Anywhere' },
  { keys: 'M', label: 'Toggle procedural audio soundscape', scope: 'Anywhere' },
  { keys: 'D', label: 'Jump to Transmit Signal console', scope: 'Grand Exit' },
  { keys: '? / Esc', label: 'Toggle or close this keyboard guide', scope: 'Anywhere' },
];

export function resolveKeyboardAction(ctx: KeyboardContextState): KeyboardResolution {
  if (ctx.ctrlKey || ctx.metaKey || ctx.altKey) {
    return { action: null, preventDefault: false };
  }

  if (ctx.isInputTarget) {
    return { action: null, preventDefault: false };
  }

  const lower = ctx.key.toLowerCase();

  if (ctx.helpOpen) {
    if (ctx.key === 'Escape' || ctx.key === '?') {
      return { action: 'close-help', preventDefault: true };
    }
    return { action: null, preventDefault: false };
  }

  if (ctx.paused) {
    return { action: null, preventDefault: false };
  }

  if (ctx.key === '?') {
    return { action: 'toggle-help', preventDefault: true };
  }

  if (lower === 'm') {
    return { action: 'toggle-audio', preventDefault: true };
  }

  if (lower === 's') {
    return { action: 'open-reel', preventDefault: true };
  }

  if (!ctx.hasEntered) {
    return { action: null, preventDefault: false };
  }

  if (ctx.hasExited) {
    if (lower === 'd') {
      return { action: 'jump-dispatch', preventDefault: true };
    }
    if (ctx.key === 'Home') {
      return { action: 'jump-top', preventDefault: true };
    }
    return { action: null, preventDefault: false };
  }

  // Active Station Ride (Chapters 01 -> 12)
  if (ctx.key === 'ArrowRight' || lower === 'j') {
    return { action: 'advance', preventDefault: true };
  }
  if ((ctx.key === 'ArrowLeft' || lower === 'k') && ctx.currentIndex > 0) {
    return { action: 'back', preventDefault: true };
  }
  if (ctx.key === '1') {
    return { action: 'tab-1', preventDefault: true };
  }
  if (ctx.key === '2') {
    return { action: 'tab-2', preventDefault: true };
  }
  if (ctx.key === '3') {
    return { action: 'tab-3', preventDefault: true };
  }
  if (lower === 'f') {
    return { action: 'open-lab', preventDefault: true };
  }

  return { action: null, preventDefault: false };
}

export function getTablistTargetIndex(
  key: string,
  currentIndex: number,
  totalTabs: number
): number | null {
  if (totalTabs <= 0) return null;
  if (key === 'ArrowRight') return (currentIndex + 1) % totalTabs;
  if (key === 'ArrowLeft') return (currentIndex - 1 + totalTabs) % totalTabs;
  if (key === 'Home') return 0;
  if (key === 'End') return totalTabs - 1;
  return null;
}
