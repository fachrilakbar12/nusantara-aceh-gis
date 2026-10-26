'use client';

import React from 'react';
import { audioManager } from '@/lib/audio';
import { useJourneyStore } from '@/lib/store';

export default function MenuButton() {
  const isMenuOpen = useJourneyStore((s) => s.isMenuOpen);
  const setMenuOpen = useJourneyStore((s) => s.setMenuOpen);

  return (
    <button
      type="button"
      aria-label={isMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
      aria-expanded={isMenuOpen}
      onMouseEnter={() => audioManager.playHover()}
      onClick={() => {
        audioManager.playClick();
        setMenuOpen(!isMenuOpen);
      }}
      className="z-20 flex items-center gap-3 rounded-xl border border-white/20 bg-[#12181c]/65 px-3.5 py-2.5 font-mono text-[11px] tracking-[0.22em] text-white/90 backdrop-blur-md transition-all duration-200 hover:border-neon hover:text-neon hover:shadow-neon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon md:px-4"
    >
      <span className="hidden sm:inline">MENU</span>
      <span className="flex flex-col gap-1" aria-hidden="true">
        <span className="block h-[1.5px] w-4 bg-current transition-transform" />
        <span className="block h-[1.5px] w-4 bg-current transition-transform" />
        <span className="block h-[1.5px] w-4 bg-current transition-transform" />
      </span>
    </button>
  );
}

