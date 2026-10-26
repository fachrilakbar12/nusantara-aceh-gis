'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { audioEngine } from '@/lib/audio';
import { getRegionCentroid } from '@/lib/geo';
import { ItemBudaya, REGION_BY_ID, REGIONS_ACEH } from '@/lib/regions';
import { useAcehStore } from '@/lib/store';

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
          <circle cx="12" cy="5" r="2.5" />
          <path d="M7 11l5 2 5-3M12 13v5l-3 3M12 18l3 3" />
        </svg>
      )}
      {ikon === 'musik' && (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )}
      {ikon === 'kuliner' && (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
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
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
  rapai: 'Gendang Rapa’i Pesisir',
  'gayo-bambu': 'Bambu & Kayu Dataran Gayo',
  'gong-alas': 'Gong Kecil Alas–Singkil',
  'petik-barat': 'Petik Senar Pesisir Barat',
  'rebana-tamiang': 'Rebana Melayu Tamiang'
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

    const tl = gsap.timeline();
    tl.fromTo(
      panelRef.current,
      { x: -18, opacity: 0.2 },
      { x: 0, opacity: 1, duration: 0.36, ease: 'power3.out' }
    );

    if (itemsContainerRef.current) {
      const items = itemsContainerRef.current.querySelectorAll('[data-culture-item]');
      if (items.length > 0) {
        tl.fromTo(
          items,
          { x: -10, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.32,
            stagger: 0.065,
            ease: 'power2.out'
          },
          '-=0.2'
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
      className="fixed inset-x-0 bottom-0 z-30 max-h-[56vh] w-full overflow-y-auto rounded-t-2xl border-t-2 bg-[#121a2b] p-5 transition-colors duration-300 md:bottom-11 md:left-6 md:top-20 md:max-h-[calc(100vh-8rem)] md:w-[390px] md:rounded-2xl md:border-2"
      style={{ borderColor: region.warna }}
    >
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
          className="rounded-lg border border-[#25324d] bg-[#0b1220] px-2.5 py-1 text-xs text-[#93a0ba] hover:text-[#f3efe6]"
        >
          ✕
        </button>
      </div>

      {/* Nama Wilayah & Badge Status */}
      <div className="mt-3">
        <h2
          className="font-display text-2xl font-bold leading-tight transition-colors duration-300 md:text-3xl"
          style={{ color: region.warna }}
        >
          {region.nama}
        </h2>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
            style={{
              borderColor: isVerified ? '#2ec4b6' : '#ffb347',
              backgroundColor: '#0b1220',
              color: isVerified ? '#2ec4b6' : '#ffb347'
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: isVerified ? '#2ec4b6' : '#ffb347' }}
            />
            <span>{region.status}</span>
          </span>

          <span className="rounded-full border border-[#25324d] bg-[#0b1220] px-2.5 py-0.5 text-[11px] text-[#93a0ba]">
            Bunyi: {INSTRUMEN_LABEL[region.instrumenKlik]}
          </span>
        </div>
      </div>

      {/* Daftar Budaya Khas */}
      <div ref={itemsContainerRef} className="mt-4 space-y-3">
        {region.budaya.map((item, idx) => (
          <div
            key={idx}
            data-culture-item
            className="flex gap-3 rounded-xl border border-[#25324d] bg-[#0b1220] p-3.5"
          >
            <CultureCategoryIcon ikon={item.ikon} color={region.warna} />
            <div>
              <h3 className="font-display text-sm font-semibold text-[#f3efe6]">
                {item.judul}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#93a0ba]">
                {item.isi}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigasi Sebelumnya / Berikutnya */}
      <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#25324d] pt-4">
        <button
          type="button"
          onClick={() => handleStep('prev')}
          className="flex-1 rounded-xl border border-[#25324d] bg-[#0b1220] px-3 py-2.5 text-xs font-semibold text-[#f3efe6] transition-colors duration-200 hover:bg-[#182238]"
        >
          ← Sebelumnya
        </button>
        <button
          type="button"
          onClick={() => handleStep('next')}
          className="flex-1 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#0b1220] transition-colors duration-300"
          style={{ backgroundColor: region.warna }}
        >
          Berikutnya →
        </button>
      </div>
    </aside>
  );
}
