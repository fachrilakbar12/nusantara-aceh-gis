'use client';

import React, { useEffect } from 'react';
import { audioEngine } from '@/lib/audio';
import { THEME_COLORS } from '@/lib/colors';
import { getRegionCentroid } from '@/lib/geo';
import { REGION_BY_ID } from '@/lib/regions';
import { LightingMode, useAcehStore } from '@/lib/store';
import AudioControl from './AudioControl';

const LIGHTING_ORDER: LightingMode[] = ['malam', 'senja', 'siang'];
const LIGHTING_LABELS: Record<LightingMode, string> = {
  malam: 'Malam',
  senja: 'Senja',
  siang: 'Siang'
};

export default function Header() {
  const activeRegionId = useAcehStore((s) => s.activeRegionId);
  const isDrawerOpen = useAcehStore((s) => s.isDrawerOpen);
  const lightingMode = useAcehStore((s) => s.lightingMode);
  const isTourPlaying = useAcehStore((s) => s.isTourPlaying);

  const setDrawerOpen = useAcehStore((s) => s.setDrawerOpen);
  const selectRegion = useAcehStore((s) => s.selectRegion);
  const setLightingMode = useAcehStore((s) => s.setLightingMode);
  const setTourPlaying = useAcehStore((s) => s.setTourPlaying);
  const setEntered = useAcehStore((s) => s.setEntered);

  const activeRegion = activeRegionId ? REGION_BY_ID[activeRegionId] : null;
  const accentColor = activeRegion ? activeRegion.warna : THEME_COLORS.defaultAccent;

  // Interval Tur Sinematik Otomatis 23 Negeri
  useEffect(() => {
    if (!isTourPlaying) return;

    const stepTour = () => {
      const store = useAcehStore.getState();
      const nextId = store.nextRegion();
      const region = REGION_BY_ID[nextId];
      const centroid = getRegionCentroid(nextId);
      if (centroid && region) {
        store.triggerRipple(centroid[0], centroid[1], region.warna);
      }
      audioEngine.playRegionClick(nextId);
    };

    if (!useAcehStore.getState().activeRegionId) {
      stepTour();
    }

    const timer = setInterval(stepTour, 4500);
    return () => clearInterval(timer);
  }, [isTourPlaying]);

  const handleCycleLighting = () => {
    const idx = LIGHTING_ORDER.indexOf(lightingMode);
    const nextMode = LIGHTING_ORDER[(idx + 1) % LIGHTING_ORDER.length];
    setLightingMode(nextMode);
    audioEngine.playHoverTick();
  };

  const handleToggleTour = () => {
    setTourPlaying(!isTourPlaying);
  };

  const handleExit = () => {
    setTourPlaying(false);
    selectRegion(null);
    setDrawerOpen(false);
    audioEngine.stopExperience();
    audioEngine.playHoverTick();
    setEntered(false);
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-1 px-2.5 py-2 sm:px-6 sm:py-4">
      {/* Kiri: Logo & Info Wilayah Aktif */}
      <div className="pointer-events-auto flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => {
            setTourPlaying(false);
            selectRegion(null);
          }}
          className="group flex items-center gap-1.5 rounded-2xl border bg-[#121a2b]/95 p-1.5 text-left shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 sm:gap-3 sm:px-3.5 sm:py-2"
          style={{
            borderColor: activeRegion ? accentColor : '#25324d'
          }}
        >
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[#25324d] bg-[#0b1220] transition-transform duration-300 sm:h-8 sm:w-8 group-hover:scale-105"
            style={{ color: accentColor }}
            aria-hidden="true"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <polygon
                points="12,2 17,7 19,14 19,21 5,21 5,14 7,7"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <polygon points="12,7 15,12 12,18 9,12" fill="currentColor" />
            </svg>
          </span>
          <div className="max-w-[105px] sm:max-w-none">
            <span className="block truncate font-display text-xs font-bold leading-none text-[#f3efe6] sm:text-base">
              Nusantara Aceh
            </span>
            <span className="mt-0.5 block truncate text-[9px] text-[#93a0ba] sm:text-[11px]">
              {activeRegion ? activeRegion.nama : '23 Negeri'}
            </span>
          </div>
        </button>

        {activeRegion && (
          <button
            type="button"
            onClick={() => {
              setTourPlaying(false);
              selectRegion(null);
            }}
            aria-label="Kembali ke tampilan seluruh Aceh"
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[#25324d] bg-[#121a2b]/95 text-xs font-medium text-[#f3efe6] shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 sm:h-auto sm:w-auto sm:px-3 sm:py-2"
          >
            <span aria-hidden="true">↖</span>
            <span className="hidden sm:inline sm:ml-1.5">Seluruh Aceh</span>
          </button>
        )}
      </div>

      {/* Kanan: Tur, Cahaya, Cari Wilayah, Audio, & Keluar */}
      <div className="pointer-events-auto flex items-center gap-1 sm:gap-2">
        {/* Tombol Tur */}
        <button
          type="button"
          onClick={handleToggleTour}
          title={isTourPlaying ? 'Hentikan Tur' : 'Mulai Tur 23 Wilayah'}
          className="flex h-9 items-center gap-1 rounded-2xl border px-2 text-xs font-semibold shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 sm:px-3.5 sm:py-2"
          style={{
            backgroundColor: isTourPlaying ? accentColor : 'rgba(18, 26, 43, 0.95)',
            borderColor: isTourPlaying ? accentColor : '#25324d',
            color: isTourPlaying ? '#0b1220' : '#f3efe6'
          }}
        >
          <span>{isTourPlaying ? '■' : '▶'}</span>
          <span className="hidden sm:inline">{isTourPlaying ? 'Hentikan' : 'Tur 23 Negeri'}</span>
        </button>

        {/* Sakelar Cahaya (Malam / Senja / Siang) */}
        <button
          type="button"
          onClick={handleCycleLighting}
          title="Ubah Suasana Cahaya Maket"
          className="flex h-9 items-center rounded-2xl border border-[#25324d] bg-[#121a2b]/95 px-2 text-xs font-medium text-[#f3efe6] shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 sm:px-3"
        >
          <span className="sm:hidden">
            {lightingMode === 'malam' ? '🌙' : lightingMode === 'senja' ? '🌅' : '☀️'}
          </span>
          <span className="hidden sm:inline">Suasana: {LIGHTING_LABELS[lightingMode]}</span>
        </button>

        {/* Tombol Cari Wilayah */}
        <button
          type="button"
          onClick={() => setDrawerOpen(!isDrawerOpen)}
          aria-label="Cari 23 Wilayah"
          className="flex h-9 items-center gap-1.5 rounded-2xl border bg-[#121a2b]/95 px-2 text-xs font-semibold text-[#f3efe6] shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 sm:px-3.5"
          style={{
            borderColor: isDrawerOpen ? accentColor : '#25324d'
          }}
        >
          <svg
            className="h-3.5 w-3.5"
            style={{ color: accentColor }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 12 12 17 22 12" />
            <polyline points="2 17 12 22 22 17" />
          </svg>
          <span className="hidden sm:inline">Cari Wilayah</span>
        </button>

        {/* Kontrol Audio */}
        <AudioControl accentColor={accentColor} />

        {/* Tombol Exit / Keluar (Tersedia di Mode Mobile & Desktop) */}
        <button
          type="button"
          onClick={handleExit}
          title="Keluar dari Peta ke Halaman Awal"
          aria-label="Keluar dari peta ke halaman awal"
          className="flex h-9 items-center gap-1 rounded-2xl border border-[#ff6b6b]/40 bg-[#121a2b]/95 px-2 text-xs font-semibold text-[#ff6b6b] shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ff6b6b] hover:bg-[#ff6b6b]/15 sm:px-3"
        >
          <svg
            className="h-3.5 w-3.5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
