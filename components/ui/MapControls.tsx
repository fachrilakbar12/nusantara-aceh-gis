'use client';

import React from 'react';
import { useAcehStore } from '@/lib/store';

export default function MapControls() {
  const hasEntered = useAcehStore((s) => s.hasEntered);
  const isCloudTransitioning = useAcehStore((s) => s.isCloudTransitioning);
  const isDrawerOpen = useAcehStore((s) => s.isDrawerOpen);
  const isTopView = useAcehStore((s) => s.isTopView);
  const triggerCameraAction = useAcehStore((s) => s.triggerCameraAction);

  if (!hasEntered || isCloudTransitioning || isDrawerOpen) return null;

  const handleToggleView = () => {
    if (isTopView) {
      triggerCameraAction('resetOverview');
    } else {
      triggerCameraAction('viewTop');
    }
  };

  return (
    <div
      aria-label="Kontrol Sudut Pandang Peta"
      className="pointer-events-auto fixed right-3 bottom-24 z-30 sm:right-6 sm:bottom-28"
    >
      {/* Tombol Tunggal: Beralih Pandangan Atas (Melihat Seluruh Map dari Atas) & Perspektif 3D */}
      <button
        type="button"
        onClick={handleToggleView}
        title={isTopView ? 'Kembali ke Sudut Perspektif 3D' : 'Lihat Seluruh Peta dari Atas'}
        aria-label={isTopView ? 'Kembali ke Sudut Perspektif 3D' : 'Lihat Seluruh Peta dari Atas'}
        className={`group flex h-10 w-10 items-center justify-center rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 active:scale-95 sm:h-11 sm:w-11 ${
          isTopView
            ? 'border-[#f9c74f] bg-[#0b1220] text-[#f9c74f] shadow-[0_0_15px_rgba(249,199,79,0.35)]'
            : 'border-[#25324d] bg-[#121a2b]/95 text-[#f3efe6] hover:border-[#f9c74f]/60 hover:text-[#f9c74f]'
        }`}
      >
        <svg
          className={`h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5 ${
            isTopView ? 'scale-110 rotate-45' : ''
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Ikon Sudut Pandang Tegak Lurus / Peta dari Atas */}
          <rect x="3" y="3" width="18" height="18" rx="3" strokeDasharray={isTopView ? 'none' : '2 2'} />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <line x1="12" y1="3" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="21" />
          <line x1="3" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="21" y2="12" />
        </svg>
      </button>
    </div>
  );
}
