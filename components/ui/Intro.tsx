'use client';

import React, { useEffect, useCallback } from 'react';
import { audioEngine } from '@/lib/audio';
import { useAcehStore } from '@/lib/store';

export default function Intro() {
  const hasEntered = useAcehStore((s) => s.hasEntered);
  const setEntered = useAcehStore((s) => s.setEntered);

  const handleEnter = useCallback(() => {
    // 1. Eksekusi state masuk secara langsung dan instan ke store
    useAcehStore.getState().setEntered(true);
    setEntered(true);

    // 2. Putar audio pengiring di background secara aman tanpa memblokir thread UI
    setTimeout(() => {
      try {
        audioEngine.startExperience((missingMsg) => {
          useAcehStore.getState().showToast(missingMsg);
        });
        audioEngine.playInstrument('rapai');
      } catch (err) {
        console.warn('Audio start error:', err);
      }
    }, 16);
  }, [setEntered]);

  // Dukungan tombol Enter, Spasi, atau Escape pada keyboard untuk langsung masuk
  useEffect(() => {
    if (hasEntered) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hasEntered, handleEnter]);

  if (hasEntered) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0b1220]/85 p-3 backdrop-blur-md sm:items-center sm:p-6 md:p-8"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))'
      }}
      onClick={(e) => {
        // Klik pada backdrop luar kartu juga bisa masuk
        if (e.target === e.currentTarget) {
          handleEnter();
        }
      }}
    >
      <div
        className="relative my-auto w-full max-w-2xl shrink-0 select-auto rounded-3xl border border-[#25324d] bg-[#121a2b]/95 px-5 py-6 text-center shadow-2xl sm:px-8 sm:py-8 md:px-12 md:py-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ornamen Puncak Pinto Aceh & Bungong Jeumpa (Aman dari potongan layar di mobile) */}
        <div className="mx-auto mb-3 flex flex-col items-center sm:mb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#25324d] bg-[#0b1220] shadow-md sm:h-16 sm:w-16">
            <svg
              width="36"
              height="36"
              className="animate-gentle-float overflow-visible sm:h-10 sm:w-10"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Mahkota Pinto Aceh & Kelopak Bungong Jeumpa - proporsi aman tidak mepet atas */}
              <polygon
                points="24,6 32,15 36,27 36,41 12,41 12,27 16,15"
                stroke="#f9c74f"
                strokeWidth="2"
              />
              <polygon
                points="24,12 29,18 31,37 17,37 19,18"
                stroke="#2ec4b6"
                strokeWidth="1.6"
              />
              <polygon points="24,18 28,25 24,33 20,25" fill="#f9c74f" />
              <polygon points="8,26 12,23 12,29" fill="#2ec4b6" />
              <polygon points="40,26 36,23 36,29" fill="#2ec4b6" />
              <rect x="9" y="41" width="30" height="2.5" fill="#f3efe6" />
            </svg>
          </div>

          <span className="mt-2.5 inline-block rounded-xl border border-[#25324d] bg-[#0b1220] px-3.5 py-1 text-[10px] font-medium tracking-wide text-[#2ec4b6] sm:mt-3 sm:text-[11px]">
            Ensiklopedia Peta Diorama Interaktif 3D
          </span>
        </div>

        {/* Judul Utama */}
        <h1
          id="intro-title"
          className="font-display text-2xl font-bold tracking-tight text-[#f3efe6] sm:text-4xl md:text-5xl"
        >
          Nusantara Aceh
        </h1>

        <p className="mt-1 font-display text-sm font-medium text-[#f9c74f] sm:mt-2 sm:text-lg md:text-xl">
          23 Negeri, Satu Tanah Rencong
        </p>

        <p className="mx-auto mt-2.5 max-w-xl text-[11px] leading-relaxed text-[#93a0ba] sm:mt-4 sm:text-xs md:text-sm">
          Menyusuri lanskap budaya dari Sabang di Pulau Weh, dataran tinggi Tanoh Gayo,
          pesisir Selat Malaka, hingga kepulauan Simeulue. Setiap wilayah dirancang
          sebagai maket kertas berlapis yang hidup dengan instrumen dan kisahnya sendiri.
        </p>

        {/* 3 Pilar Pengalaman Interaktif */}
        <div className="mt-4 grid grid-cols-1 gap-2 text-left sm:mt-6 sm:grid-cols-3 sm:gap-3">
          <div className="rounded-2xl border border-[#25324d] bg-[#0b1220] p-2.5 transition-transform duration-200 hover:-translate-y-0.5 sm:p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#f3efe6]">
              <svg className="h-4 w-4 shrink-0 text-[#2ec4b6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 12 12 17 22 12" />
                <polyline points="2 17 12 22 22 17" />
              </svg>
              <span>Diorama 23 Wilayah</span>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-[#93a0ba] sm:mt-1.5 sm:text-[11px]">
              18 kabupaten &amp; 5 kota berlapis kertas dengan landmark khas dan pegunungan Bukit Barisan.
            </p>
          </div>

          <div className="rounded-2xl border border-[#25324d] bg-[#0b1220] p-2.5 transition-transform duration-200 hover:-translate-y-0.5 sm:p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#f3efe6]">
              <svg className="h-4 w-4 shrink-0 text-[#f9c74f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13" />
                <rect x="4" y="16" width="5" height="4" />
                <rect x="16" y="14" width="5" height="4" />
              </svg>
              <span>Musik &amp; 5 Instrumen</span>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-[#93a0ba] sm:mt-1.5 sm:text-[11px]">
              Iringan petikan Bungong Jeumpa serta tabuhan Rapa’i, Bambu Gayo, Gong Alas, dan Rebana.
            </p>
          </div>

          <div className="rounded-2xl border border-[#25324d] bg-[#0b1220] p-2.5 transition-transform duration-200 hover:-translate-y-0.5 sm:p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#f3efe6]">
              <svg className="h-4 w-4 shrink-0 text-[#ff6b6b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3 7h7l-5.5 4.2L18.5 21 12 16.8 5.5 21l2-7.8L2 9h7z" />
              </svg>
              <span>Khazanah Budaya</span>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-[#93a0ba] sm:mt-1.5 sm:text-[11px]">
              Catatan tari tradisional, sejarah kesultanan, kearifan smong, kopi Gayo, dan ragam motif Aceh.
            </p>
          </div>
        </div>

        {/* Tombol Masuk Interaktif (Mendukung Klik Mouse, Sentuhan Mobile, & Keyboard) */}
        <div className="mt-5 flex flex-col items-center justify-center gap-2.5 sm:mt-7 sm:gap-3">
          <button
            type="button"
            onClick={handleEnter}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleEnter();
            }}
            className="group pointer-events-auto select-none cursor-pointer inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#2ec4b6] px-6 py-3.5 text-xs font-bold text-[#0b1220] shadow-lg transition-all duration-200 active:scale-95 hover:-translate-y-0.5 hover:bg-[#48cae4] focus:outline-none focus:ring-2 focus:ring-[#f3efe6] sm:px-9 sm:py-4 sm:text-sm"
          >
            <span>Mulai Jelajahi Peta 3D</span>
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-200 group-hover:translate-x-1"
            >
              →
            </span>
          </button>

          <p className="text-[10px] text-[#93a0ba] sm:text-[11px]">
            Tekan <kbd className="rounded border border-[#25324d] bg-[#0b1220] px-1.5 py-0.5 font-mono text-[9px] text-[#f3efe6]">Enter</kbd> atau klik tombol di atas untuk membuka peta
          </p>
        </div>
      </div>
    </div>
  );
}
