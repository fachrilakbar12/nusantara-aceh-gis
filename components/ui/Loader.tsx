'use client';

import React, { useEffect, useState } from 'react';
import { audioManager } from '@/lib/audio';
import { useJourneyStore } from '@/lib/store';

const BOOT_STEPS = [
  { pct: 20, status: 'initializing three.js & r3f pipeline...', log: '> [OK] WebGL2 + Postprocessing pipeline ready' },
  { pct: 48, status: 'loading /models/avatar.glb & draco...', log: '> [OK] 3D Character rig & shader uniforms armed' },
  { pct: 76, status: 'compiling outfit scan-line shaders...', log: '> [OK] Outfits ready: SMP · SMK · UNIMAL' },
  { pct: 100, status: 'system ready — awaiting user launch', log: '> [READY] Klik tombol di bawah untuk memulai' }
];

export default function Loader() {
  const isLoaded = useJourneyStore((s) => s.isLoaded);
  const isStarted = useJourneyStore((s) => s.isStarted);
  const volume = useJourneyStore((s) => s.volume);
  const isMuted = useJourneyStore((s) => s.isMuted);
  const setStarted = useJourneyStore((s) => s.setStarted);

  const [stepIdx, setStepIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>([BOOT_STEPS[0].log]);

  useEffect(() => {
    if (stepIdx >= BOOT_STEPS.length - 1) return;
    const timer = setTimeout(() => {
      const next = stepIdx + 1;
      setStepIdx(next);
      setLogs((prev) => [...prev, BOOT_STEPS[next].log]);
    }, 240);
    return () => clearTimeout(timer);
  }, [stepIdx]);

  const currentStep = BOOT_STEPS[stepIdx];
  const ready = stepIdx >= BOOT_STEPS.length - 1 && isLoaded;

  const handleStart = () => {
    if (!ready || isStarted) return;
    audioManager.init(volume, isMuted);
    audioManager.playClick();
    audioManager.playOutfitMorph(0);
    setStarted(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Layar inisialisasi 3D Education Journey"
      onClick={() => {
        if (ready) handleStart();
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,#0c151a_0%,#05080a_72%)] transition-all duration-1000 ${
        isStarted
          ? 'pointer-events-none invisible opacity-0'
          : ready
          ? 'cursor-pointer opacity-100'
          : 'opacity-100'
      }`}
    >
      <div className="w-[min(460px,88vw)]">
        {/* Logo Bulat Hijau Neon */}
        <div className="mb-6 flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-neon text-[#071109] shadow-neon-lg">
          <svg
            viewBox="0 0 40 40"
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="4.2"
            strokeLinecap="round"
          >
            <path d="M13 32V15a6 6 0 0 1 6-6h9" />
            <path d="M13 21h9" />
          </svg>
        </div>

        {/* Judul Loader */}
        <div className="mb-4 font-orbitron text-[clamp(18px,3vw,26px)] font-bold tracking-[0.12em] text-white [text-shadow:-2px_0_rgba(255,40,80,0.5),2px_0_rgba(40,200,255,0.5)]">
          INITIALIZING AVATAR<span className="animate-pulse text-neon">_</span>
        </div>

        {/* Progress Bar Hijau Neon */}
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-neon shadow-[0_0_14px_#a8ff60] transition-all duration-300"
            style={{ width: `${currentStep.pct}%` }}
          />
        </div>

        {/* Status & Persentase */}
        <div className="mt-2.5 flex justify-between font-mono text-[10px] tracking-[0.15em] text-white/60">
          <span>{currentStep.status}</span>
          <span className="text-neon">{currentStep.pct}%</span>
        </div>

        {/* Terminal Log */}
        <div className="mt-4 h-24 overflow-hidden rounded-lg border border-white/10 bg-black/35 p-3 font-mono text-[10px] leading-relaxed text-neon/75">
          {logs.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        {/* Tombol KLIK UNTUK MULAI */}
        <button
          type="button"
          disabled={!ready}
          onMouseEnter={() => {
            if (ready) audioManager.playHover();
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleStart();
          }}
          className={`clip-chamfer-sm relative mt-5 h-12 w-full bg-neon font-mono text-xs font-bold tracking-[0.28em] text-[#081209] transition-all duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neon ${
            ready
              ? 'translate-y-0 opacity-100 shadow-neon hover:bg-[#c8ff99]'
              : 'pointer-events-none translate-y-2 opacity-0'
          }`}
        >
          <span className="clip-chamfer-sm absolute inset-1 flex items-center justify-center border border-black/45">
            KLIK UNTUK MULAI
          </span>
        </button>

        <p className="mt-3.5 text-center font-mono text-[9.5px] tracking-[0.12em] text-white/40">
          Audio aktif setelah klik pertama · Gunakan headphone untuk pengalaman terbaik
        </p>
      </div>
    </div>
  );
}

