'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { CONFIG, EDUCATION_ERAS } from '@/lib/data';
import { audioManager } from '@/lib/audio';
import { useJourneyStore } from '@/lib/store';
import Logo from '@/components/ui/Logo';
import NavPill from '@/components/ui/NavPill';
import MenuButton from '@/components/ui/MenuButton';
import HeroTitle from '@/components/ui/HeroTitle';
import InfoPanel from '@/components/ui/InfoPanel';
import OutfitCard from '@/components/ui/OutfitCard';
import Pagination from '@/components/ui/Pagination';
import AudioControl from '@/components/ui/AudioControl';
import Loader from '@/components/ui/Loader';
import GlitchOverlay from '@/components/ui/GlitchOverlay';
import MenuOverlay from '@/components/ui/MenuOverlay';

const Scene = dynamic(() => import('@/components/canvas/Scene'), {
  ssr: false
});

export default function HomePage() {
  const isStarted = useJourneyStore((s) => s.isStarted);
  const isMenuOpen = useJourneyStore((s) => s.isMenuOpen);
  const activeEraIndex = useJourneyStore((s) => s.activeEraIndex);
  const nextEra = useJourneyStore((s) => s.nextEra);
  const prevEra = useJourneyStore((s) => s.prevEra);
  const toggleMute = useJourneyStore((s) => s.toggleMute);
  const setMenuOpen = useJourneyStore((s) => s.setMenuOpen);
  const touchInteraction = useJourneyStore((s) => s.touchInteraction);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Navigasi Keyboard: ← → ganti jenjang, M mute, Esc tutup menu
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isStarted) return;
      touchInteraction();

      if (e.key === 'ArrowRight') {
        const nextIdx = (useJourneyStore.getState().activeEraIndex + 1) % EDUCATION_ERAS.length;
        audioManager.playClick();
        audioManager.playOutfitMorph(nextIdx);
        nextEra();
      } else if (e.key === 'ArrowLeft') {
        const prevIdx =
          (useJourneyStore.getState().activeEraIndex - 1 + EDUCATION_ERAS.length) %
          EDUCATION_ERAS.length;
        audioManager.playClick();
        audioManager.playOutfitMorph(prevIdx);
        prevEra();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'Escape' && isMenuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isStarted, isMenuOpen, nextEra, prevEra, toggleMute, setMenuOpen, touchInteraction]);

  // Auto-demo ganti jenjang otomatis bila idle selama 12 detik
  useEffect(() => {
    if (!isStarted) return;
    const interval = setInterval(() => {
      const state = useJourneyStore.getState();
      if (state.isMenuOpen) return;
      if (Date.now() - state.lastInteractionAt >= CONFIG.timings.autoDemoIdleMs) {
        const nextIdx = (state.activeEraIndex + 1) % EDUCATION_ERAS.length;
        audioManager.playOutfitMorph(nextIdx);
        state.nextEra();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isStarted]);

  return (
    <div
      onPointerDown={(e) => {
        touchInteraction();
        touchStartRef.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        if (!touchStartRef.current) return;
        const dx = e.clientX - touchStartRef.current.x;
        const dy = e.clientY - touchStartRef.current.y;
        touchStartRef.current = null;

        // Swipe kiri/kanan pada layar mobile
        if (window.innerWidth < 768 && Math.abs(dx) > 68 && Math.abs(dy) < 48) {
          audioManager.playClick();
          if (dx < 0) {
            const nextIdx = (activeEraIndex + 1) % EDUCATION_ERAS.length;
            audioManager.playOutfitMorph(nextIdx);
            nextEra();
          } else {
            const prevIdx =
              (activeEraIndex - 1 + EDUCATION_ERAS.length) % EDUCATION_ERAS.length;
            audioManager.playOutfitMorph(prevIdx);
            prevEra();
          }
        }
      }}
      className="relative h-screen w-screen overflow-hidden bg-[#05080a] select-none"
    >
      {/* Background Cahaya Abstrak di Luar Browser Frame (Seperti Referensi Gambar 2) */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute right-[3%] top-[2%] h-[16vh] w-[38vw] rounded-full bg-gradient-to-r from-transparent via-[#28aac8]/45 to-transparent blur-[28px]" />
        <div className="absolute -right-[4%] top-[10%] h-[7vh] w-[24vw] rounded-full bg-[#50c8e6]/40 blur-[24px]" />
        <div className="absolute bottom-[5%] left-[8%] h-[11vh] w-[30vw] rounded-full bg-gradient-to-r from-transparent via-[#1e5a8c]/45 to-transparent blur-[28px]" />
      </div>

      {/*Satu "Browser Frame" Besar Rounded 22px dengan Glassmorphism & Glow Biru-Hijau */}
      <main
        aria-label="Interactive 3D Education Journey Stage"
        className="fixed inset-2.5 z-10 overflow-hidden rounded-[22px] border-[1.5px] border-white/30 bg-[#0a1014]/40 backdrop-blur-md shadow-[0_0_0_1px_rgba(120,255,200,0.06),0_0_34px_rgba(70,200,230,0.22),0_0_110px_rgba(168,255,96,0.08),inset_0_0_70px_rgba(0,0,0,0.58)] md:inset-x-[4.4vw] md:inset-y-[4.8vh]"
      >
        {/* Canvas 3D React Three Fiber Mengisi Penuh di Dalam Frame */}
        <Scene />

        {/* Sheen Garis Atas Frame */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[8%] top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
        />

        {/* Baris Navigasi Atas: Logo (Kiri), NavPill (Tengah), MenuButton (Kanan) */}
        <header className="pointer-events-none absolute inset-x-3.5 top-3.5 z-20 flex items-center justify-between md:inset-x-6 md:top-5">
          <div className="pointer-events-auto">
            <Logo />
          </div>
          <div className="pointer-events-auto">
            <NavPill />
          </div>
          <div className="pointer-events-auto">
            <MenuButton />
          </div>
        </header>

        {/* Teks Hero Glitch di Kiri Tengah */}
        <HeroTitle />

        {/* Panel Informasi Glass di Kiri Bawah */}
        <InfoPanel />

        {/* Kartu Outfit Neon Chamfer di Kanan */}
        <OutfitCard />

        {/* Indikator Pagination ( 01 ) ( 02 ) ( 03 ) di Bawah Tengah */}
        <Pagination />

        {/* Kontrol Speaker + Equalizer + Volume di Kiri Bawah */}
        <AudioControl />

        {/* Hint Interaksi di Kanan Bawah */}
        <div className="pointer-events-none absolute bottom-5 right-6 z-20 hidden font-mono text-[9.5px] tracking-[0.18em] text-white/40 md:block">
          DRAG = PUTAR · ← → = JENJANG · M = MUTE
        </div>
      </main>

      {/* Overlay Glitch, Scanline & Grain */}
      <GlitchOverlay />

      {/* Overlay Menu Fullscreen GSAP */}
      <MenuOverlay />

      {/* Layar Loader & Tombol "KLIK UNTUK MULAI" */}
      <Loader />
    </div>
  );
}

