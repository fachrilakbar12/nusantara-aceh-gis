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
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setDrawerOpen(false);
    }
  };

  return (
    <aside
      aria-label="Daftar 23 wilayah Aceh"
      className="fixed bottom-11 right-4 top-16 z-30 flex w-[calc(100vw-2rem)] max-w-xs flex-col rounded-2xl border-2 bg-[#121a2b] p-4 transition-colors duration-300 md:right-6 md:top-20"
      style={{ borderColor: accentColor }}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-base font-bold text-[#f3efe6]">
            Daftar 23 Wilayah
          </h2>
          <p className="text-[11px] text-[#93a0ba]">
            18 Kabupaten &amp; 5 Kota di Aceh
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          aria-label="Tutup daftar wilayah"
          className="rounded-lg border border-[#25324d] bg-[#0b1220] px-2.5 py-1 text-xs text-[#93a0ba] hover:text-[#f3efe6]"
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
          className="w-full rounded-xl border border-[#25324d] bg-[#0b1220] px-3 py-2 text-xs text-[#f3efe6] placeholder-[#93a0ba] focus:border-[#f3efe6] focus:outline-none"
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
                className="flex w-full items-center justify-between gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors duration-200 hover:bg-[#182238]"
                style={{
                  borderColor: isSelected ? item.warna : '#25324d',
                  backgroundColor: isSelected ? '#182238' : '#0b1220'
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="h-3 w-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: item.warna }}
                  />
                  <div className="truncate">
                    <span className="block truncate text-xs font-semibold text-[#f3efe6]">
                      {item.nama}
                    </span>
                    <span className="block text-[10px] capitalize text-[#93a0ba]">
                      {item.jenis} · {item.budaya.length} catatan budaya
                    </span>
                  </div>
                </div>

                <span
                  className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: '#121a2b',
                    color: item.status === 'Terverifikasi' ? '#2ec4b6' : '#ffb347'
                  }}
                >
                  {item.status === 'Terverifikasi' ? '✓' : '•'}
                </span>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}

