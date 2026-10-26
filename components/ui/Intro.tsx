'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { audioEngine } from '@/lib/audio';
import { useAcehStore } from '@/lib/store';

export default function Intro() {
  const hasEntered = useAcehStore((s) => s.hasEntered);
  const setEntered = useAcehStore((s) => s.setEntered);
  const showToast = useAcehStore((s) => s.showToast);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ornamentRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (hasEntered || !contentRef.current) return;

    const elements = contentRef.current.querySelectorAll('[data-intro-step]');
    const tl = gsap.timeline();

    tl.fromTo(
      elements,
      { y: 22, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.65,
        stagger: 0.09,
        ease: 'power3.out'
      }
    );

    let floatTween: gsap.core.Tween | null = null;
    if (ornamentRef.current) {
      floatTween = gsap.to(ornamentRef.current, {
        y: -5,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    return () => {
      tl.kill();
      if (floatTween) floatTween.kill();
    };
  }, [hasEntered]);

  if (hasEntered) return null;

  const handleEnter = () => {
    audioEngine.startExperience((missingMsg) => {
      showToast(missingMsg);
    });
    audioEngine.playInstrument('rapai');

    if (containerRef.current && contentRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          setEntered(true);
        }
      });

      tl.to(contentRef.current, {
        scale: 0.96,
        y: -16,
        opacity: 0,
        duration: 0.45,
        ease: 'power3.in'
      }).to(
        containerRef.current,
        {
          opacity: 0,
          duration: 0.42,
          ease: 'power2.out'
        },
        '-=0.22'
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/80 p-4 backdrop-blur-md md:p-8"
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-2xl rounded-3xl border border-[#25324d] bg-[#121a2b]/95 px-6 py-8 text-center shadow-2xl md:px-12 md:py-11"
      >
        {/* Ornamen Puncak Pinto Aceh & Bungong Jeumpa */}
        <div data-intro-step className="mx-auto mb-5 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#25324d] bg-[#0b1220]">
            <svg
              ref={ornamentRef}
              width="40"
              height="40"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Mahkota Pinto Aceh & Kelopak Bungong Jeumpa */}
              <polygon
                points="24,4 32,13 36,26 36,41 12,41 12,26 16,13"
                stroke="#f9c74f"
                strokeWidth="2"
              />
              <polygon
                points="24,10 29,17 31,37 17,37 19,17"
                stroke="#2ec4b6"
                strokeWidth="1.6"
              />
              <polygon points="24,16 28,24 24,33 20,24" fill="#f9c74f" />
              <polygon points="8,24 12,21 12,27" fill="#2ec4b6" />
              <polygon points="40,24 36,21 36,27" fill="#2ec4b6" />
              <rect x="9" y="41" width="30" height="2.5" fill="#f3efe6" />
            </svg>
          </div>

          <span className="mt-3 inline-block rounded-xl border border-[#25324d] bg-[#0b1220] px-4 py-1 text-[11px] font-medium tracking-wide text-[#2ec4b6]">
            Ensiklopedia Peta Diorama Interaktif 3D
          </span>
        </div>

        {/* Judul Utama */}
        <h1
          id="intro-title"
          data-intro-step
          className="font-display text-3xl font-bold tracking-tight text-[#f3efe6] sm:text-5xl"
        >
          Nusantara Aceh
        </h1>

        <p
          data-intro-step
          className="mt-2 font-display text-base font-medium text-[#f9c74f] sm:text-xl"
        >
          23 Negeri, Satu Tanah Rencong
        </p>

        <p
          data-intro-step
          className="mx-auto mt-4 max-w-xl text-xs leading-relaxed text-[#93a0ba] sm:text-sm"
        >
          Menyusuri lanskap budaya dari Sabang di Pulau Weh, dataran tinggi Tanoh Gayo,
          pesisir Selat Malaka, hingga kepulauan Simeulue. Setiap wilayah dirancang
          sebagai maket kertas berlapis yang hidup dengan instrumen dan kisahnya sendiri.
        </p>

        {/* 3 Pilar Pengalaman Interaktif (Pengganti kotak warna yang kaku) */}
        <div
          data-intro-step
          className="mt-7 grid grid-cols-1 gap-3 text-left sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-[#25324d] bg-[#0b1220] p-3.5 transition-transform duration-200 hover:-translate-y-0.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#f3efe6]">
              <svg className="h-4 w-4 shrink-0 text-[#2ec4b6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 12 12 17 22 12" />
                <polyline points="2 17 12 22 22 17" />
              </svg>
              <span>Diorama 23 Wilayah</span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[#93a0ba]">
              18 kabupaten &amp; 5 kota berlapis kertas dengan landmark khas dan pegunungan Bukit Barisan.
            </p>
          </div>

          <div className="rounded-2xl border border-[#25324d] bg-[#0b1220] p-3.5 transition-transform duration-200 hover:-translate-y-0.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#f3efe6]">
              <svg className="h-4 w-4 shrink-0 text-[#f9c74f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13" />
                <rect x="4" y="16" width="5" height="4" />
                <rect x="16" y="14" width="5" height="4" />
              </svg>
              <span>Musik &amp; 5 Instrumen</span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[#93a0ba]">
              Iringan petikan Bungong Jeumpa serta tabuhan Rapa’i, Bambu Gayo, Gong Alas, dan Rebana.
            </p>
          </div>

          <div className="rounded-2xl border border-[#25324d] bg-[#0b1220] p-3.5 transition-transform duration-200 hover:-translate-y-0.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#f3efe6]">
              <svg className="h-4 w-4 shrink-0 text-[#ff6b6b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3 7h7l-5.5 4.2L18.5 21 12 16.8 5.5 21l2-7.8L2 9h7z" />
              </svg>
              <span>Khazanah Budaya</span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[#93a0ba]">
              Catatan tari tradisional, sejarah kesultanan, kearifan smong, kopi Gayo, dan ragam motif Aceh.
            </p>
          </div>
        </div>

        {/* Tombol Masuk Interaktif */}
        <div
          data-intro-step
          className="mt-8 flex flex-col items-center justify-center gap-3"
        >
          <button
            type="button"
            onClick={handleEnter}
            className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-[#2ec4b6] px-8 py-4 text-sm font-bold text-[#0b1220] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#48cae4] focus:outline-none focus:ring-2 focus:ring-[#f3efe6]"
          >
            <span>Mulai Jelajahi Peta 3D</span>
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </button>

          <p className="text-[11px] text-[#93a0ba]">
            Klik wilayah untuk terbang mendekat · Geser untuk memutar sudut pandang
          </p>
        </div>
      </div>
    </div>
  );
}
