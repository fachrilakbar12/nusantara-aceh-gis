'use client';

import React from 'react';
import { THEME_COLORS } from '@/lib/colors';
import { REGION_BY_ID } from '@/lib/regions';
import { useAcehStore } from '@/lib/store';
import AudioControl from './AudioControl';

export default function Header() {
  const activeRegionId = useAcehStore((s) => s.activeRegionId);
  const isDrawerOpen = useAcehStore((s) => s.isDrawerOpen);
  const isCreditsOpen = useAcehStore((s) => s.isCreditsOpen);
  const setDrawerOpen = useAcehStore((s) => s.setDrawerOpen);
  const setCreditsOpen = useAcehStore((s) => s.setCreditsOpen);
  const selectRegion = useAcehStore((s) => s.selectRegion);

  const activeRegion = activeRegionId ? REGION_BY_ID[activeRegionId] : null;
  const accentColor = activeRegion ? activeRegion.warna : THEME_COLORS.defaultAccent;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-3.5 md:px-6 md:py-4">
      {/* Kiri: Logo teks + tombol reset peta bila ada wilayah aktif */}
      <div className="pointer-events-auto flex items-center gap-3">
        <button
          type="button"
          onClick={() => selectRegion(null)}
          className="flex items-center gap-3 rounded-xl border border-[#25324d] bg-[#121a2b] px-3.5 py-2 text-left transition-colors duration-300 hover:border-[#36486e]"
          style={{ borderColor: activeRegion ? accentColor : '#25324d' }}
        >
          <span
            className="h-3.5 w-3.5 shrink-0 rounded-full transition-colors duration-300"
            style={{ backgroundColor: accentColor }}
          />
          <div>
            <span className="block font-display text-sm font-bold leading-none text-[#f3efe6] md:text-base">
              Nusantara Aceh
            </span>
            <span className="mt-0.5 block text-[11px] text-[#93a0ba]">
              23 Negeri, Satu Tanah Rencong
            </span>
          </div>
        </button>

        {activeRegion && (
          <button
            type="button"
            onClick={() => selectRegion(null)}
            className="hidden items-center gap-1.5 rounded-xl border border-[#25324d] bg-[#121a2b] px-3 py-2 text-xs font-medium text-[#f3efe6] transition-colors duration-200 hover:bg-[#182238] sm:inline-flex"
          >
            <span aria-hidden="true">↖</span>
            <span>Lihat Seluruh Aceh (Esc)</span>
          </button>
        )}
      </div>

      {/* Kanan: Tombol Daftar 23 Wilayah, Sumber & Kredit, serta Kontrol Suara */}
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCreditsOpen(!isCreditsOpen)}
          className="hidden rounded-xl border border-[#25324d] bg-[#121a2b] px-3 py-2 text-xs font-medium text-[#93a0ba] transition-colors duration-200 hover:text-[#f3efe6] md:inline-flex"
          style={{
            borderColor: isCreditsOpen ? accentColor : '#25324d',
            color: isCreditsOpen ? '#f3efe6' : '#93a0ba'
          }}
        >
          Sumber &amp; Tradisi
        </button>

        <button
          type="button"
          onClick={() => setDrawerOpen(!isDrawerOpen)}
          className="inline-flex items-center gap-2 rounded-xl border bg-[#121a2b] px-3.5 py-2 text-xs font-semibold text-[#f3efe6] transition-colors duration-300 hover:bg-[#182238]"
          style={{ borderColor: isDrawerOpen ? accentColor : '#25324d' }}
        >
          <span
            className="h-2 w-2 rounded-full transition-colors duration-300"
            style={{ backgroundColor: accentColor }}
          />
          <span>23 Wilayah</span>
        </button>

        <AudioControl accentColor={accentColor} />
      </div>
    </header>
  );
}

