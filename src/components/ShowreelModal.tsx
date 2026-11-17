import { useEffect } from 'react';
import { X } from 'lucide-react';
import { haptics } from '../lib/haptics';

interface ShowreelModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShowreelModal({ open, onClose }: ShowreelModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        haptics.trigger('tap');
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#04060b]/90 backdrop-blur-xs flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="SIFR Brand Identity Motion Reel"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          haptics.trigger('tap');
          onClose();
        }
      }}
    >
      <div className="w-full max-w-4xl border border-[#2d3038] bg-[#0a0d13] chamfer overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2d3038] bg-[#04060b]">
          <span className="font-mobilis text-xs uppercase tracking-[0.14em] text-[#eab444]">
            SIFR Intro Motion · 1920x1080
          </span>
          <button
            type="button"
            onClick={() => {
              haptics.trigger('tap');
              onClose();
            }}
            aria-label="Close motion reel"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center border border-[#2d3038] bg-[#171b21] hover:border-[#eab444] text-[#f3f7fe] cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <div className="bg-[#04060b] aspect-video w-full">
          <video
            src="/brand/video/sifr-intro-1920x1080.mp4"
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
