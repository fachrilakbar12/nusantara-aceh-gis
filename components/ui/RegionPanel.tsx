'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { audioEngine } from '@/lib/audio';
import { getRegionCentroid } from '@/lib/geo';
import {
  getMotifForRegion,
  ItemBudaya,
  JenisMotifAceh,
  REGION_BY_ID,
  REGIONS_ACEH
} from '@/lib/regions';
import { useAcehStore } from '@/lib/store';

/**
 * Ornamen Visual SVG Motif Tradisional Aceh (C3)
 */
function AcehMotifOrnament({
  jenis,
  color,
  size = 44
}: {
  jenis: JenisMotifAceh;
  color: string;
  size?: number;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl border border-[#25324d] bg-[#0b1220]"
      style={{ width: size, height: size, color }}
      aria-hidden="true"
    >
      <svg
        width={size - 12}
        height={size - 12}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {jenis === 'pucok-reubong' && (
          <>
            <polygon points="20,4 6,30 34,30" stroke="currentColor" strokeWidth="2.2" />
            <polygon points="20,11 11,28 29,28" stroke="#f3efe6" strokeWidth="1.5" />
            <polygon points="20,17 15,27 25,27" fill="currentColor" />
            <rect x="6" y="33" width="28" height="3" fill="currentColor" />
          </>
        )}

        {jenis === 'bungong-jeumpa' && (
          <>
            <polygon points="20,2 23,14 20,18 17,14" fill="currentColor" />
            <polygon points="20,38 23,26 20,22 17,26" fill="currentColor" />
            <polygon points="2,20 14,17 18,20 14,23" fill="currentColor" />
            <polygon points="38,20 26,17 22,20 26,23" fill="currentColor" />
            <polygon points="7,7 16,13 17,17 13,16" fill="#f3efe6" />
            <polygon points="33,7 27,16 23,17 24,13" fill="#f3efe6" />
            <polygon points="7,33 13,24 17,23 16,27" fill="#f3efe6" />
            <polygon points="33,33 24,27 23,23 27,24" fill="#f3efe6" />
            <polygon points="20,15 25,20 20,25 15,20" stroke="currentColor" strokeWidth="1.8" />
          </>
        )}

        {jenis === 'emun-berangkat' && (
          <>
            <polygon points="20,3 37,20 20,37 3,20" stroke="currentColor" strokeWidth="2.2" />
            <polygon points="20,9 31,20 20,31 9,20" stroke="#f3efe6" strokeWidth="1.6" />
            <polygon points="20,14 26,20 20,26 14,20" fill="currentColor" />
            <polyline points="8,8 4,8 4,12" stroke="currentColor" strokeWidth="1.8" />
            <polyline points="32,8 36,8 36,12" stroke="currentColor" strokeWidth="1.8" />
            <polyline points="8,32 4,32 4,28" stroke="currentColor" strokeWidth="1.8" />
            <polyline points="32,32 36,32 36,28" stroke="currentColor" strokeWidth="1.8" />
          </>
        )}

        {jenis === 'pinto-aceh' && (
          <>
            <polygon
              points="20,3 27,10 31,20 31,35 9,35 9,20 13,10"
              stroke="currentColor"
              strokeWidth="2.2"
            />
            <polygon
              points="20,9 25,15 26,32 14,32 15,15"
              stroke="#f3efe6"
              strokeWidth="1.5"
            />
            <polygon points="20,15 23,20 20,29 17,20" fill="currentColor" />
            <rect x="6" y="35" width="28" height="2.5" fill="currentColor" />
          </>
        )}

        {jenis === 'bungong-seulanga' && (
          <>
            <polygon points="20,3 24,15 37,20 24,25 20,37 16,25 3,20 16,15" stroke="currentColor" strokeWidth="2" />
            <polygon points="9,9 18,16 31,9 24,18 31,31 20,24 9,31 16,20" fill="currentColor" />
            <polygon points="20,14 26,20 20,26 14,20" fill="#f3efe6" />
          </>
        )}
      </svg>
    </div>
  );
}

function CultureCategoryIcon({
  ikon,
  color
}: {
  ikon?: ItemBudaya['ikon'];
  color: string;
}) {
  return (
    <span
      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#25324d] bg-[#0b1220]"
      style={{ color }}
      aria-hidden="true"
    >
      {ikon === 'tari' && (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15 6 12 9 9 6" />
          <path d="M6 12l6 2 6-3M12 14v5l-3 3M12 19l3 3" />
        </svg>
      )}
      {ikon === 'musik' && (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13" />
          <rect x="4" y="16" width="5" height="4" />
          <rect x="16" y="14" width="5" height="4" />
        </svg>
      )}
      {ikon === 'kuliner' && (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8h2v6h-2" />
          <path d="M3 8h15v9l-3 3H6l-3-3V8z" />
        </svg>
      )}
      {ikon === 'sejarah' && (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 21h18M5 21V7l7-4 7 4v14" />
        </svg>
      )}
      {ikon === 'kriya' && (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
        </svg>
      )}
      {ikon === 'bahasa' && (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15H7l-4 4V5h18v10z" />
        </svg>
      )}
      {(!ikon || ikon === 'adat') && (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3 7h7l-5.5 4.2L18.5 21 12 16.8 5.5 21l2-7.8L2 9h7z" />
        </svg>
      )}
    </span>
  );
}

const INSTRUMEN_LABEL: Record<string, string> = {
  rapai: 'Gendang Rapa’i',
  'gayo-bambu': 'Bambu Gayo',
  'gong-alas': 'Gong Alas',
  'petik-barat': 'Petik Barat',
  'rebana-tamiang': 'Rebana'
};

export default function RegionPanel() {
  const activeRegionId = useAcehStore((s) => s.activeRegionId);
  const selectRegion = useAcehStore((s) => s.selectRegion);
  const nextRegion = useAcehStore((s) => s.nextRegion);
  const prevRegion = useAcehStore((s) => s.prevRegion);
  const triggerRipple = useAcehStore((s) => s.triggerRipple);

  const panelRef = useRef<HTMLElement>(null);
  const itemsContainerRef = useRef<HTMLDivElement>(null);

  const region = activeRegionId ? REGION_BY_ID[activeRegionId] : null;

  useEffect(() => {
    if (!region || !panelRef.current) return;

    const isMobile = window.innerWidth < 768;
    const tl = gsap.timeline();

    if (isMobile) {
      tl.fromTo(
        panelRef.current,
        { y: '100%', opacity: 0.6 },
        { y: '0%', opacity: 1, duration: 0.35, ease: 'power3.out' }
      );
    } else {
      tl.fromTo(
        panelRef.current,
        { x: -20, opacity: 0.2 },
        { x: 0, opacity: 1, duration: 0.36, ease: 'power3.out' }
      );
    }

    if (itemsContainerRef.current) {
      const items = itemsContainerRef.current.querySelectorAll('[data-culture-item]');
      if (items.length > 0) {
        tl.fromTo(
          items,
          { y: 8, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.3,
            stagger: 0.05,
            ease: 'power2.out'
          },
          '-=0.18'
        );
      }
    }

    return () => {
      tl.kill();
    };
  }, [region]);

  if (!region) return null;

  const regionIndex = REGIONS_ACEH.findIndex((r) => r.id === region.id) + 1;
  const isVerified = region.status === 'Terverifikasi';
  const motifInfo = getMotifForRegion(region.id);

  const handleStep = (dir: 'prev' | 'next') => {
    const newId = dir === 'next' ? nextRegion() : prevRegion();
    const targetRegion = REGION_BY_ID[newId];
    const centroid = getRegionCentroid(newId);
    if (centroid && targetRegion) {
      triggerRipple(centroid[0], centroid[1], targetRegion.warna);
    }
    audioEngine.playRegionClick(newId);
  };

  return (
    <aside
      ref={panelRef}
      aria-label={`Informasi budaya ${region.nama}`}
      className="fixed inset-x-0 bottom-0 z-30 max-h-[58vh] w-full overflow-y-auto rounded-t-3xl border-t-2 bg-[#121a2b]/95 p-4 shadow-2xl backdrop-blur-md transition-colors duration-300 md:bottom-24 md:left-6 md:top-20 md:max-h-[calc(100vh-11rem)] md:w-[395px] md:rounded-3xl md:border-2 md:p-5"
      style={{ borderColor: region.warna }}
    >
      {/* Pegangan Drag Handle khusus Mobile */}
      <div className="mx-auto mb-3 h-1 w-12 rounded bg-[#25324d] md:hidden" />

      {/* Baris atas: nomor urut, jenis wilayah, dan tombol tutup */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-6 items-center rounded-md px-2 text-xs font-bold text-[#0b1220] transition-colors duration-300"
            style={{ backgroundColor: region.warna }}
          >
            {String(regionIndex).padStart(2, '0')} / 23
          </span>
          <span className="rounded-md border border-[#25324d] bg-[#0b1220] px-2.5 py-0.5 text-xs font-medium capitalize text-[#93a0ba]">
            {region.jenis}
          </span>
        </div>

        <button
          type="button"
          onClick={() => selectRegion(null)}
          aria-label="Tutup panel wilayah"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#25324d] bg-[#0b1220] text-xs text-[#93a0ba] hover:text-[#f3efe6]"
        >
          ✕
        </button>
      </div>

      {/* Header Nama Wilayah + Ornamen Visual Motif Aceh (C3) */}
      <div className="mt-3 flex items-start justify-between gap-2.5 sm:mt-3.5">
        <div className="min-w-0 flex-1">
          <h2
            className="font-display text-xl font-bold leading-tight transition-colors duration-300 sm:text-2xl md:text-3xl"
            style={{ color: region.warna }}
          >
            {region.nama}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span
              className="inline-flex items-center rounded-xl border px-2 py-0.5 text-[10px] font-medium sm:text-[11px]"
              style={{
                borderColor: isVerified ? '#2ec4b6' : '#ffb347',
                backgroundColor: '#0b1220',
                color: isVerified ? '#2ec4b6' : '#ffb347'
              }}
            >
              <span>{region.status}</span>
            </span>

            <span className="rounded-xl border border-[#25324d] bg-[#0b1220] px-2 py-0.5 text-[10px] text-[#93a0ba] sm:text-[11px]">
              {INSTRUMEN_LABEL[region.instrumenKlik]}
            </span>
          </div>
        </div>

        {/* Ornamen SVG Motif Aceh di Header Panel */}
        <AcehMotifOrnament jenis={motifInfo.jenis} color={region.warna} size={46} />
      </div>

      {/* Kartu Informasi Motif Tradisional Aceh */}
      <div
        className="mt-3 rounded-2xl border bg-[#0b1220] px-3 py-2 sm:px-3.5 sm:py-2.5"
        style={{ borderColor: region.warna }}
      >
        <div className="text-[11px] font-semibold text-[#f3efe6] sm:text-xs">
          {motifInfo.nama}
        </div>
        <p className="mt-0.5 text-[10px] leading-relaxed text-[#93a0ba] sm:text-[11px]">
          {motifInfo.makna}
        </p>
      </div>

      {/* Daftar Budaya Khas */}
      <div ref={itemsContainerRef} className="mt-3.5 space-y-2.5 sm:mt-4 sm:space-y-3">
        {region.budaya.map((item, idx) => (
          <div
            key={idx}
            data-culture-item
            className="flex gap-2.5 rounded-2xl border border-[#25324d] bg-[#0b1220] p-3 sm:gap-3 sm:p-3.5"
          >
            <CultureCategoryIcon ikon={item.ikon} color={region.warna} />
            <div>
              <h3 className="font-display text-xs font-semibold text-[#f3efe6] sm:text-sm">
                {item.judul}
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[#93a0ba] sm:text-xs">
                {item.isi}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigasi Sebelumnya / Berikutnya */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#25324d] pt-3 sm:mt-5 sm:pt-4">
        <button
          type="button"
          onClick={() => handleStep('prev')}
          className="flex-1 rounded-xl border border-[#25324d] bg-[#0b1220] py-2.5 text-xs font-semibold text-[#f3efe6] transition-colors duration-200 hover:bg-[#182238]"
        >
          ← Sebelumnya
        </button>
        <button
          type="button"
          onClick={() => handleStep('next')}
          className="flex-1 rounded-xl py-2.5 text-xs font-semibold text-[#0b1220] transition-colors duration-300"
          style={{ backgroundColor: region.warna }}
        >
          Berikutnya →
        </button>
      </div>
    </aside>
  );
}
