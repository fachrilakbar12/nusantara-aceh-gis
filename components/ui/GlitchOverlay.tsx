'use client';

import React, { useEffect, useState } from 'react';
import { CONFIG } from '@/lib/data';
import { audioManager } from '@/lib/audio';
import { useJourneyStore } from '@/lib/store';

interface GlitchBar {
  id: number;
  top: string;
  left: string;
  width: string;
  height: string;
  color: string;
}

export default function GlitchOverlay() {
  const isStarted = useJourneyStore((s) => s.isStarted);
  const transitionId = useJourneyStore((s) => s.transitionId);
  const triggerGlitchBurst = useJourneyStore((s) => s.triggerGlitchBurst);

  const [bars, setBars] = useState<GlitchBar[]>([]);

  const spawnBars = () => {
    const count = 2 + Math.floor(Math.random() * 2);
    const next: GlitchBar[] = Array.from({ length: count }, (_, idx) => ({
      id: Date.now() + idx,
      top: `${12 + Math.random() * 76}%`,
      left: `${Math.random() * 35}%`,
      width: `${22 + Math.random() * 52}%`,
      height: `${2 + Math.random() * 5}px`,
      color: idx % 2 === 0 ? 'rgba(255,36,85,0.72)' : 'rgba(40,205,255,0.72)'
    }));
    setBars(next);
    setTimeout(() => setBars([]), 75);
  };

  // Jadwalkan glitch acak tiap 4–9 detik
  useEffect(() => {
    if (!isStarted) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay =
        CONFIG.timings.glitchMinMs +
        Math.random() * (CONFIG.timings.glitchMaxMs - CONFIG.timings.glitchMinMs);
      timeoutId = setTimeout(() => {
        audioManager.playGlitch();
        triggerGlitchBurst();
        spawnBars();
        schedule();
      }, delay);
    };

    schedule();
    return () => clearTimeout(timeoutId);
  }, [isStarted, triggerGlitchBurst]);

  // Spawn garis glitch singkat saat ganti outfit
  useEffect(() => {
    if (transitionId === 0) return;
    spawnBars();
  }, [transitionId]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      {/* Scanline CRT & Film Grain Halus */}
      <div className="crt-scanlines absolute inset-0" />
      <div className="film-grain absolute -inset-1/2 h-[200%] w-[200%] opacity-[0.06]" />

      {/* Garis Glitch RGB Merah/Biru Berkedip di Tepi Layar */}
      <div className="edge-glitch edge-glitch-1 absolute left-0 top-[18%] h-[2px] w-[9vw] bg-[#ff2455]/75 mix-blend-screen" />
      <div className="edge-glitch edge-glitch-2 absolute right-0 top-[62%] h-[2px] w-[12vw] bg-[#28cdff]/75 mix-blend-screen" />
      <div className="edge-glitch edge-glitch-3 absolute left-0 top-[84%] h-[2px] w-[6vw] bg-[#28cdff]/65 mix-blend-screen" />
      <div className="edge-glitch edge-glitch-4 absolute right-0 top-[29%] h-[2px] w-[7vw] bg-[#ff2455]/65 mix-blend-screen" />

      {/* Burst Garis Horizontal saat Glitch Aktif */}
      {bars.map((bar) => (
        <div
          key={bar.id}
          style={{
            top: bar.top,
            left: bar.left,
            width: bar.width,
            height: bar.height,
            background: bar.color
          }}
          className="absolute mix-blend-screen"
        />
      ))}
    </div>
  );
}

