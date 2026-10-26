'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { EDUCATION_ERAS } from '@/lib/data';
import { audioManager } from '@/lib/audio';
import { useJourneyStore } from '@/lib/store';

export default function MenuOverlay() {
  const isMenuOpen = useJourneyStore((s) => s.isMenuOpen);
  const activeEraIndex = useJourneyStore((s) => s.activeEraIndex);
  const setMenuOpen = useJourneyStore((s) => s.setMenuOpen);
  const setEraIndex = useJourneyStore((s) => s.setEraIndex);

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    const items = el.querySelectorAll('.menu-era-item');

    if (isMenuOpen) {
      gsap.to(el, {
        clipPath: 'circle(150% at calc(100% - 7vw) 8vh)',
        duration: 0.72,
        ease: 'power3.inOut'
      });
      gsap.fromTo(
        items,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.52,
          stagger: 0.09,
          delay: 0.22,
          ease: 'power3.out'
        }
      );
    } else {
      gsap.to(el, {
        clipPath: 'circle(0% at calc(100% - 7vw) 8vh)',
        duration: 0.58,
        ease: 'power3.inOut'
      });
    }
  }, [isMenuOpen]);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isMenuOpen}
      aria-label="Menu navigasi jenjang pendidikan"
      style={{ clipPath: 'circle(0% at calc(100% - 7vw) 8vh)' }}
      className={`fixed inset-0 z-40 flex flex-col justify-center bg-[#040709]/95 px-[8vw] backdrop-blur-2xl ${
        isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <button
        type="button"
        aria-label="Tutup menu"
        onMouseEnter={() => audioManager.playHover()}
        onClick={() => {
          audioManager.playClick();
          setMenuOpen(false);
        }}
        className="absolute right-[6vw] top-[6vh] rounded-xl border border-white/25 px-4 py-2.5 font-mono text-[11px] tracking-[0.24em] text-white transition-all hover:border-neon hover:text-neon focus-visible:outline focus-visible:outline-2 focus-visible:outline-neon"
      >
        CLOSE ✕
      </button>

      <div className="mb-6 font-mono text-[11px] tracking-[0.34em] text-neon">
        // PILIH JENJANG PENDIDIKAN
      </div>

      <div className="divide-y divide-white/10 border-y border-white/10">
        {EDUCATION_ERAS.map((era, idx) => {
          const isActive = idx === activeEraIndex;
          return (
            <button
              key={era.id}
              type="button"
              onMouseEnter={() => audioManager.playHover()}
              onClick={() => {
                audioManager.playClick();
                setMenuOpen(false);
                if (!isActive) {
                  audioManager.playOutfitMorph(idx);
                  setEraIndex(idx);
                }
              }}
              className="menu-era-item group flex w-full flex-wrap items-baseline gap-4 py-4 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-neon md:gap-8 md:py-6"
            >
              <span className="w-9 font-mono text-xs text-white/45">
                {era.numberLabel}
              </span>
              <span
                className={`font-orbitron text-[clamp(28px,5.6vw,78px)] font-extrabold tracking-wide transition-all duration-300 ${
                  isActive
                    ? 'text-neon drop-shadow-[0_0_26px_rgba(168,255,96,0.55)]'
                    : 'menu-stroke-text group-hover:text-neon group-hover:drop-shadow-[0_0_24px_rgba(168,255,96,0.5)]'
                }`}
              >
                {era.heroTitle}
              </span>
              <span className="ml-auto font-mono text-xs text-[#b4bec2]">
                {era.institusi} · {era.periode}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 font-mono text-[10px] tracking-[0.22em] text-white/40">
        INTERACTIVE 3D EDUCATION JOURNEY — PORTOFOLIO · TEKAN ESC UNTUK MENUTUP
      </div>
    </div>
  );
}

