'use client';

import React, { useMemo, useState } from 'react';
import { audioEngine } from '@/lib/audio';
import { THEME_COLORS } from '@/lib/colors';
import { getRegionCentroid } from '@/lib/geo';
import { REGION_BY_ID, REGIONS_ACEH, TRADISI_LINTAS_ACEH } from '@/lib/regions';
import { useAcehStore } from '@/lib/store';

type SabukBudaya = 'semua' | 'pesisir' | 'gayo-alas' | 'barat-selatan' | 'kepulauan';

const SABUK_ZONES: { id: SabukBudaya; label: string; ids: string[] }[] = [
  {
    id: 'semua',
    label: 'Semua (23)',
    ids: REGIONS_ACEH.map((r) => r.id)
  },
  {
    id: 'pesisir',
    label: 'Pesisir Utara–Timur',
    ids: [
      'banda-aceh',
      'aceh-besar',
      'pidie',
      'pidie-jaya',
      'bireuen',
      'aceh-utara',
      'lhokseumawe',
      'aceh-timur',
      'langsa',
      'aceh-tamiang'
    ]
  },
  {
    id: 'gayo-alas',
    label: 'Gayo–Alas',
    ids: ['aceh-tengah', 'bener-meriah', 'gayo-lues', 'aceh-tenggara']
  },
  {
    id: 'barat-selatan',
    label: 'Barat–Selatan',
    ids: [
      'aceh-jaya',
      'aceh-barat',
      'nagan-raya',
      'aceh-barat-daya',
      'aceh-selatan',
      'subulussalam',
      'aceh-singkil'
    ]
  },
  {
    id: 'kepulauan',
    label: 'Kepulauan',
    ids: ['sabang', 'simeulue']
  }
];

export default function Legend() {
  const activeRegionId = useAcehStore((s) => s.activeRegionId);
  const hoveredRegionId = useAcehStore((s) => s.hoveredRegionId);
  const isCreditsOpen = useAcehStore((s) => s.isCreditsOpen);
  const setCreditsOpen = useAcehStore((s) => s.setCreditsOpen);
  const selectRegion = useAcehStore((s) => s.selectRegion);
  const setHoveredRegion = useAcehStore((s) => s.setHoveredRegion);
  const triggerRipple = useAcehStore((s) => s.triggerRipple);

  const [activeZone, setActiveZone] = useState<SabukBudaya>('semua');

  const activeRegion = activeRegionId ? REGION_BY_ID[activeRegionId] : null;
  const accentColor = activeRegion ? activeRegion.warna : THEME_COLORS.defaultAccent;

  const displayedRegions = useMemo(() => {
    const zone = SABUK_ZONES.find((z) => z.id === activeZone);
    if (!zone || zone.id === 'semua') return REGIONS_ACEH;
    return REGIONS_ACEH.filter((r) => zone.ids.includes(r.id));
  }, [activeZone]);

  const handleQuickSelect = (id: string, warna: string) => {
    selectRegion(id);
    const centroid = getRegionCentroid(id);
    if (centroid) {
      triggerRipple(centroid[0], centroid[1], warna);
    }
    audioEngine.playRegionClick(id);
  };

  return (
    <>
      {/* Modal Sumber & Kredit + Tradisi Lintas Aceh */}
      {isCreditsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="credits-modal-title"
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#0b1220]/85 p-3 backdrop-blur-sm sm:p-4"
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border-2 bg-[#121a2b] p-5 shadow-2xl sm:p-6"
            style={{ borderColor: accentColor }}
          >
            <div className="flex items-center justify-between gap-2">
              <h2
                id="credits-modal-title"
                className="font-display text-lg font-bold text-[#f3efe6] sm:text-xl"
              >
                Tradisi Lintas Aceh &amp; Sumber
              </h2>
              <button
                type="button"
                onClick={() => setCreditsOpen(false)}
                aria-label="Tutup jendela sumber dan kredit"
                className="flex h-7 w-7 items-center justify-center rounded-xl border border-[#25324d] bg-[#0b1220] text-xs text-[#93a0ba] transition-colors hover:text-[#f3efe6]"
              >
                ✕
              </button>
            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-[#93a0ba] sm:text-xs">
              Masyarakat di seluruh Aceh berbagi tiga tradisi utama yang mengikat kebersamaan:
            </p>

            <div className="mt-3 space-y-2">
              {TRADISI_LINTAS_ACEH.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#25324d] bg-[#0b1220] p-3"
                >
                  <h3
                    className="font-display text-xs font-semibold sm:text-sm"
                    style={{ color: accentColor }}
                  >
                    {item.judul}
                  </h3>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[#93a0ba]">
                    {item.isi}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-[#25324d] bg-[#0b1220] p-3 text-[11px] text-[#93a0ba]">
              <h3 className="font-display text-xs font-semibold text-[#f3efe6]">
                Sumber &amp; Catatan Verifikasi
              </h3>
              <div className="mt-1.5 space-y-1.5">
                <p className="border-l-2 border-[#2ec4b6] pl-2">
                  Batas administrasi 23 Kabupaten/Kota Provinsi Aceh (ADM2: 18 kabupaten &amp; 5 kota).
                </p>
                <p className="border-l-2 border-[#f9c74f] pl-2">
                  Data Warisan Budaya Takbenda Kemendikbudristek &amp; Balai Pelestarian Kebudayaan Aceh.
                </p>
                <p className="border-l-2 border-[#ff6b6b] pl-2">
                  Iringan Bungong Jeumpa &amp; sintesis instrumen Web Audio API.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dock Melayang Bawah: Muncul di Desktop & Mobile (disembunyikan saat panel wilayah terbuka di layar HP agar tidak menumpuk) */}
      <footer
        className={`pointer-events-none fixed inset-x-0 bottom-2.5 z-20 flex flex-col items-center gap-1.5 px-2.5 sm:bottom-3 sm:px-4 ${
          activeRegionId ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="pointer-events-auto flex w-full max-w-4xl flex-col gap-1.5 rounded-2xl border border-[#25324d] bg-[#121a2b]/95 p-2 shadow-2xl backdrop-blur-md sm:gap-2 sm:px-3.5 sm:py-2.5">
          {/* Baris Atas Dock: Filter Sabuk Budaya Aceh */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto border-b border-[#1d2942] pb-1">
            <div className="flex items-center gap-1">
              {SABUK_ZONES.map((zone) => {
                const isSelectedZone = activeZone === zone.id;
                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => setActiveZone(zone.id)}
                    className="shrink-0 rounded-xl px-2 py-0.5 text-[10px] font-medium transition-all duration-200 sm:px-2.5 sm:py-1 sm:text-[11px]"
                    style={{
                      backgroundColor: isSelectedZone ? '#0b1220' : 'transparent',
                      color: isSelectedZone ? accentColor : '#93a0ba'
                    }}
                  >
                    {zone.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCreditsOpen(true)}
              className="hidden shrink-0 rounded-xl border border-[#25324d] bg-[#0b1220] px-2 py-0.5 text-[10px] font-medium text-[#93a0ba] transition-colors hover:text-[#f3efe6] sm:inline-block"
            >
              Sumber
            </button>
          </div>

          {/* Baris Bawah Dock: Kapsul Wilayah Interaktif (Touch-scrollable) */}
          <div className="flex w-full items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            {displayedRegions.map((r) => {
              const isActive = r.id === activeRegionId;
              const isHovered = r.id === hoveredRegionId;

              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleQuickSelect(r.id, r.warna)}
                  onMouseEnter={() => {
                    setHoveredRegion(r.id);
                    audioEngine.playHoverTick();
                  }}
                  onMouseLeave={() => {
                    if (hoveredRegionId === r.id) {
                      setHoveredRegion(null);
                    }
                  }}
                  className="shrink-0 rounded-xl border px-2.5 py-1 text-[10px] font-medium transition-all duration-200 hover:-translate-y-0.5 sm:px-3 sm:text-[11px]"
                  style={{
                    backgroundColor: isActive ? r.warna : '#0b1220',
                    borderColor: isActive || isHovered ? r.warna : '#25324d',
                    color: isActive ? '#0b1220' : isHovered ? r.warna : '#f3efe6',
                    fontWeight: isActive ? 700 : 500
                  }}
                >
                  {r.nama}
                </button>
              );
            })}
          </div>
        </div>
      </footer>
    </>
  );
}
