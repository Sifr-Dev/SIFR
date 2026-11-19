import { useEffect, useState } from 'react';
import { Search, Volume2, VolumeX } from 'lucide-react';
import { SifrMark } from './SifrMark';
import { ambientSoundscape, type SoundscapeStatus } from '../lib/ambientSoundscape';
import { haptics } from '../lib/haptics';

interface NavbarProps {
  onFocusSearch: () => void;
}

const NAV_LINKS = [
  { href: '#overview', label: 'Overview' },
  { href: '#flagships', label: 'Flagships' },
  { href: '#catalog', label: 'All Systems' },
  { href: '#chronicle', label: 'Chronicle' },
  { href: '#dispatch', label: 'Contact' },
] as const;

export function Navbar({ onFocusSearch }: NavbarProps) {
  const [audioStatus, setAudioStatus] = useState<SoundscapeStatus>(() =>
    ambientSoundscape.getStatus()
  );

  useEffect(() => {
    const unsub = ambientSoundscape.subscribeStatus(setAudioStatus);
    return () => unsub();
  }, []);

  const handleToggleAudio = () => {
    haptics.trigger('detent');
    if (audioStatus === 'muted') {
      // Reloading gesture unlock cleanly lets user re-enable audio
      window.dispatchEvent(new Event('pointerdown'));
    } else if (audioStatus === 'playing') {
      ambientSoundscape.dispose();
    } else {
      window.dispatchEvent(new Event('pointerdown'));
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#2d3038] bg-[#04060b]/92 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <a href="#overview" className="inline-flex items-center gap-2.5 group shrink-0">
          <SifrMark
            size={22}
            className="text-[#f3f7fe] group-hover:text-[#eab444] transition-colors"
          />
          <span className="font-stabilis text-sm font-extrabold tracking-wide text-[#ffffff]">
            SIFR
          </span>
          <span className="hidden sm:inline font-mobilis text-xs text-[#a6acb9]">
            · Mohamed Salahy
          </span>
        </a>

        <nav aria-label="Primary sections" className="hidden md:flex items-center gap-5">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-semibold text-[#c9d0de] hover:text-[#eab444] transition-colors whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onFocusSearch}
            className="min-h-[34px] px-3 py-1 border border-[#2d3038] bg-[#0a0d13] hover:border-[#eab444] text-xs font-semibold text-[#e4e8f1] inline-flex items-center gap-2 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
            <span>Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mobilis border border-[#2d3038] bg-[#04060b] text-[#a6acb9]">
              /
            </kbd>
          </button>

          <button
            type="button"
            onClick={handleToggleAudio}
            aria-label={audioStatus === 'playing' ? 'Audio soundscape active' : 'Enable ambient audio'}
            title="Ambient acoustic soundscape"
            className="min-h-[34px] min-w-[34px] px-2.5 py-1 border border-[#2d3038] bg-[#0a0d13] hover:border-[#eab444] text-xs font-mobilis text-[#a6acb9] hover:text-[#f3f7fe] inline-flex items-center gap-1.5 cursor-pointer"
          >
            {audioStatus === 'playing' ? (
              <Volume2 className="w-3.5 h-3.5 text-[#eab444]" aria-hidden="true" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-[#6f7685]" aria-hidden="true" />
            )}
            <span className="hidden lg:inline">
              {audioStatus === 'playing' ? 'Audio On' : 'Sound'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
