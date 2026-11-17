import { useEffect, useRef } from 'react';
import { Keyboard, X } from 'lucide-react';
import { KEYBOARD_SHORTCUTS } from '../lib/keyboard';
import { haptics } from '../lib/haptics';

interface KeyboardHelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardHelpModal({ open, onClose }: KeyboardHelpModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '?') {
        e.preventDefault();
        haptics.trigger('tap');
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#04060b]/92 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-help-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          haptics.trigger('tap');
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg ethereal-surface border border-[#2d3038] chamfer overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2d3038] bg-[#04060b] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-4 h-4 text-[#eab444]" aria-hidden="true" />
            <h2 id="keyboard-help-title" className="text-base font-bold text-[#f3f7fe]">
              Keyboard Controls
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => {
              haptics.trigger('tap');
              onClose();
            }}
            aria-label="Close keyboard shortcuts"
            className="min-h-[36px] min-w-[36px] border border-[#2d3038] bg-[#171b21] hover:border-[#eab444] text-[#f3f7fe] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="divide-y divide-[#2d3038]">
          {KEYBOARD_SHORTCUTS.map((item) => (
            <div key={item.keys} className="px-5 py-3 flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <div className="text-[13px] font-semibold text-[#f3f7fe]">{item.label}</div>
                <div className="text-[11px] font-medium text-[#9ca2af]">{item.scope}</div>
              </div>
              <kbd className="font-mobilis text-xs font-bold text-[#eab444] border border-[#2d3038] bg-[#04060b] px-2.5 py-1 whitespace-nowrap shrink-0">
                {item.keys}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-[#2d3038] bg-[#04060b] flex items-center justify-between text-[11px] text-[#9ca2af]">
          <span>Tabs support Left/Right/Home/End keys</span>
          <span className="font-mobilis text-[#eab444]">Esc to close</span>
        </div>
      </div>
    </div>
  );
}
