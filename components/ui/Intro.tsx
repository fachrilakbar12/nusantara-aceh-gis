'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { audioEngine } from '@/lib/audio';
import { REGIONS_ACEH } from '@/lib/regions';
import { useAcehStore } from '@/lib/store';

export default function Intro() {
  const hasEntered = useAcehStore((s) => s.hasEntered);
  const setEntered = useAcehStore((s) => s.setEntered);
  const showToast = useAcehStore((s) => s.showToast);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  if (hasEntered) return null;

  const handleEnter = () => {
    void audioEngine.startExperience((missingMsg) => {
      showToast(missingMsg);
    });
    audioEngine.playInstrument('rapai');

    if (containerRef.current && cardRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          setEntered(true);
        }
      });

      tl.to(cardRef.current, {
        y: -14,
        opacity: 0,
        duration: 0.42,
        ease: 'power2.in'
      }).to(
        containerRef.current,
        {
          opacity: 0,
          duration: 0.38,
          ease: 'power2.out'
        },
        '-=0.18'
      );
    } else {
      setEntered(true);
    }
  };

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220] p-5"
    >
      <div
        ref={cardRef}
        className="w-full max-w-xl rounded-2xl border-2 border-[#25324d] bg-[#121a2b] p-7 md:p-10"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#25324d] bg-[#0b1220] px-3.5 py-1.5 text-xs text-[#93a0ba]">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: '#2ec4b6' }}
          />
          <span>Peta Budaya Interaktif 3D · 18 Kabupaten &amp; 5 Kota</span>
        </div>

        <h1
          id="intro-title"
          className="font-display text-3xl font-bold leading-tight text-[#f3efe6] md:text-5xl"
        >
          Nusantara Aceh
        </h1>
        <p className="mt-1.5 font-display text-lg font-medium text-[#2ec4b6] md:text-xl">
          23 Negeri, Satu Tanah Rencong
        </p>

        <p className="mt-4 text-sm leading-relaxed text-[#93a0ba] md:text-base">
          Jelajahi kekayaan seni pertunjukan, adat istiadat, sejarah, dan kuliner khas dari
          23 kabupaten/kota di Aceh melalui peta timbul tiga dimensi. Klik wilayah mana pun
          untuk menerbangkan kamera, mendengarkan instrumen khasnya, dan membaca catatan
          budayanya.
        </p>

        {/* Pita warna solid 23 wilayah */}
        <div
          aria-hidden="true"
          className="mt-6 flex flex-wrap gap-1.5 rounded-xl border border-[#25324d] bg-[#0b1220] p-2.5"
        >
          {REGIONS_ACEH.map((r) => (
            <span
              key={r.id}
              title={r.nama}
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: r.warna }}
            />
          ))}
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleEnter}
            className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#2ec4b6] px-6 py-3.5 text-sm font-semibold text-[#0b1220] transition-colors duration-200 hover:bg-[#48cae4] focus:outline-none focus:ring-2 focus:ring-[#f3efe6]"
          >
            <span>Masuk ke Peta Aceh</span>
            <span aria-hidden="true">→</span>
          </button>

          <span className="text-xs text-[#93a0ba]">
            Menyalakan audio interaktif &amp; instrumen wilayah
          </span>
        </div>
      </div>
    </div>
  );
}

