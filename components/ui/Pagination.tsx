'use client';

import React from 'react';
import { EDUCATION_ERAS } from '@/lib/data';
import { audioManager } from '@/lib/audio';
import { useJourneyStore } from '@/lib/store';

export default function Pagination() {
  const activeEraIndex = useJourneyStore((s) => s.activeEraIndex);
  const setEraIndex = useJourneyStore((s) => s.setEraIndex);

  return (
    <nav
      aria-label="Indikator jenjang pendidikan"
      className="absolute bottom-[calc(24vh+12px)] left-1/2 z-20 flex -translate-x-1/2 items-center gap-5 md:bottom-5 md:gap-8"
    >
      {EDUCATION_ERAS.map((era, idx) => {
        const isActive = idx === activeEraIndex;
        return (
          <button
            key={era.id}
            type="button"
            aria-label={`Pindah ke jenjang ${era.shortLabel}`}
            aria-current={isActive ? 'step' : undefined}
            onMouseEnter={() => audioManager.playHover()}
            onClick={() => {
              audioManager.playClick();
              if (!isActive) {
                audioManager.playOutfitMorph(idx);
                setEraIndex(idx);
              }
            }}
            className={`group flex flex-col items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neon ${
              isActive ? 'text-neon' : 'text-white/45 hover:text-white'
            }`}
          >
            <span>( {era.numberLabel} )</span>
            <span
              className={`rounded-full transition-all duration-300 ${
                isActive
                  ? 'h-2.5 w-2.5 bg-neon shadow-[0_0_12px_#a8ff60]'
                  : 'h-1.5 w-1.5 bg-white/55 group-hover:bg-white'
              }`}
            />
            <span className="text-[8.5px] tracking-[0.2em] opacity-75">
              {era.shortLabel}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

