'use client';

import React, { useMemo } from 'react';
import { audioEngine } from '@/lib/audio';
import { THEME_COLORS } from '@/lib/colors';
import { getRegionCentroid } from '@/lib/geo';
import { REGION_BY_ID, REGIONS_ACEH } from '@/lib/regions';
import { useAcehStore } from '@/lib/store';

export default function RegionList() {
  const isDrawerOpen = useAcehStore((s) => s.isDrawerOpen);
  const activeRegionId = useAcehStore((s) => s.activeRegionId);
  const searchQuery = useAcehStore((s) => s.searchQuery);
  const setDrawerOpen = useAcehStore((s) => s.setDrawerOpen);
  const setSearchQuery = useAcehStore((s) => s.setSearchQuery);
  const selectRegion = useAcehStore((s) => s.selectRegion);
  const triggerRipple = useAcehStore((s) => s.triggerRipple);

  const activeRegion = activeRegionId ? REGION_BY_ID[activeRegionId] : null;
  const accentColor = activeRegion ? activeRegion.warna : THEME_COLORS.defaultAccent;

  const filteredRegions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return REGIONS_ACEH;
    return REGIONS_ACEH.filter(
      (r) =>
        r.nama.toLowerCase().includes(q) ||
        r.jenis.toLowerCase().includes(q) ||
        r.budaya.some(
          (b) =>
            b.judul.toLowerCase().includes(q) || b.isi.toLowerCase().includes(q)
        )
    );
  }, [searchQuery]);

  if (!isDrawerOpen) return null;

  const handlePickRegion = (id: string, warna: string) => {
    selectRegion(id);
    const centroid = getRegionCentroid(id);
    if (centroid) {
      triggerRipple(centroid[0], centroid[1], warna);
    }
    audioEngine.playRegionClick(id);
    // Di mobile, tutup drawer otomatis setelah memilih wilayah
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setDrawerOpen(false);
    }
  };

  return (
    <aside
      aria-label="Daftar 23 wilayah Aceh"
      className="fixed inset-x-3 bottom-3 top-14 z-40 flex flex-col rounded-3xl border-2 bg-[#121a2b]/95 p-4 shadow-2xl backdrop-blur-md transition-colors duration-300 sm:bottom-24 sm:right-6 sm:top-20 sm:max-w-xs md:inset-x-auto md:w-80"
      style={{ borderColor: accentColor }}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#25324d] pb-2.5">
        <div>
          <h2 className="font-display text-base font-bold text-[#f3efe6]">
            Daftar 23 Wilayah
          </h2>
          <p className="text-[10px] text-[#93a0ba] sm:text-[11px]">
            18 Kabupaten &amp; 5 Kota di Aceh
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          aria-label="Tutup daftar wilayah"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#25324d] bg-[#0b1220] text-xs text-[#93a0ba] hover:text-[#f3efe6]"
        >
          ✕
        </button>
      </div>

      {/* Input Pencarian Cepat */}
      <div className="mt-3">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari wilayah, tarian, atau kuliner…"
          aria-label="Cari wilayah atau budaya Aceh"
          className="w-full rounded-2xl border border-[#25324d] bg-[#0b1220] px-3.5 py-2.5 text-xs text-[#f3efe6] placeholder-[#93a0ba] focus:border-[#f3efe6] focus:outline-none"
        />
      </div>

      {/* Daftar Wilayah */}
      <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {filteredRegions.length === 0 ? (
          <p className="py-6 text-center text-xs text-[#93a0ba]">
            Tidak ditemukan wilayah yang cocok dengan “{searchQuery}”.
          </p>
        ) : (
          filteredRegions.map((item) => {
            const isSelected = item.id === activeRegionId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePickRegion(item.id, item.warna)}
                className="flex w-full items-center justify-between gap-2.5 rounded-2xl border px-3 py-2 text-left transition-all duration-200 active:scale-[0.98] sm:px-3.5 sm:py-2.5"
                style={{
                  borderColor: isSelected ? item.warna : '#25324d',
                  backgroundColor: isSelected ? '#182238' : '#0b1220'
                }}
              >
                <div className="min-w-0 truncate">
                  <span
                    className="block truncate text-xs font-semibold"
                    style={{ color: isSelected ? item.warna : '#f3efe6' }}
                  >
                    {item.nama}
                  </span>
                  <span className="block text-[10px] capitalize text-[#93a0ba]">
                    {item.jenis} — {item.budaya.length} budaya
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer Drawer: Tombol Keluar ke Halaman Awal */}
      <div className="mt-3 border-t border-[#25324d] pt-2.5">
        <button
          type="button"
          onClick={() => {
            selectRegion(null);
            setDrawerOpen(false);
            audioEngine.stopExperience();
            audioEngine.playHoverTick();
            useAcehStore.getState().setTourPlaying(false);
            useAcehStore.getState().setCloudTransitioning(false);
            useAcehStore.getState().setLogoDocked(false);
            useAcehStore.getState().setEntered(false);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#ff6b6b]/40 bg-[#0b1220] py-2 text-xs font-semibold text-[#ff6b6b] transition-all hover:border-[#ff6b6b] hover:bg-[#ff6b6b]/15"
        >
          <svg
            className="h-3.5 w-3.5"
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
          <span>Keluar ke Halaman Awal</span>
        </button>
      </div>
    </aside>
  );
}
