'use client';

import React, { useEffect, useRef } from 'react';
import { EDUCATION_ERAS, EducationEra } from '@/lib/data';
import { audioManager } from '@/lib/audio';
import { useJourneyStore } from '@/lib/store';

/**
 * Menggambar preview avatar hidup per jenjang pada canvas di dalam masing-masing kartu
 * agar kartu depan maupun kartu yang bertumpuk di belakang memiliki visual panggung & outfit yang akurat.
 */
function MiniAvatarPreviewCanvas({
  era,
  isFront
}: {
  era: EducationEra;
  isFront: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let frame = 0;

    const renderPreview = (t: number) => {
      frame++;
      // Kartu belakang dirender lebih jarang untuk menghemat performa
      if (!isFront && frame % 4 !== 0) {
        rafId = requestAnimationFrame(renderPreview);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;
      const sec = t * 0.001;

      ctx.clearRect(0, 0, w, h);

      // Background studio gelap dengan pilar & light streak
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#0c151a');
      bgGrad.addColorStop(0.55, '#070c0f');
      bgGrad.addColorStop(1, '#040709');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Light streaks vertikal di belakang
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(w * 0.18, h * 0.06, 2, h * 0.55);
      ctx.fillStyle = '#a8ff60';
      ctx.fillRect(w * 0.82, h * 0.1, 2, h * 0.52);
      ctx.restore();

      // Ring cahaya panggung di bawah
      const cx = w * 0.5 + Math.sin(sec * 1.4) * 2.5;
      const stageY = h * 0.79;

      ctx.save();
      ctx.strokeStyle = '#d8f8ff';
      ctx.shadowColor = '#a8ff60';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, stageY, w * 0.42, 16, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(168,255,96,0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, stageY + 3, w * 0.46, 19, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Bayangan lantai di bawah sepatu
      const shadowGrad = ctx.createRadialGradient(cx, stageY - 2, 2, cx, stageY - 2, 42);
      shadowGrad.addColorStop(0, 'rgba(0,0,0,0.75)');
      shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(cx - 50, stageY - 18, 100, 36);

      const breathY = Math.sin(sec * 2.1) * 2.2;

      // Gambar siluet stylized karakter sesuai era
      // 1. Kaki & Celana
      if (era.id === 'smp') {
        // Celana pendek biru dongker + kaos kaki putih + sepatu hitam
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(cx - 23, h * 0.49 + breathY, 19, 44);
        ctx.fillRect(cx + 4, h * 0.49 + breathY, 19, 44);
        // Betis kulit
        ctx.fillStyle = '#d69c75';
        ctx.fillRect(cx - 20, h * 0.61 + breathY, 13, 24);
        ctx.fillRect(cx + 7, h * 0.61 + breathY, 13, 24);
        // Kaos kaki putih
        ctx.fillStyle = '#f3f5f8';
        ctx.fillRect(cx - 21, h * 0.68, 15, 26);
        ctx.fillRect(cx + 6, h * 0.68, 15, 26);
        // Sepatu hitam
        ctx.fillStyle = '#14171d';
        ctx.beginPath();
        ctx.ellipse(cx - 15, h * 0.76, 13, 7, -0.1, 0, Math.PI * 2);
        ctx.ellipse(cx + 15, h * 0.76, 13, 7, 0.1, 0, Math.PI * 2);
        ctx.fill();
      } else if (era.id === 'smk') {
        // Celana panjang abu-abu SMK + sepatu hitam
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(cx - 23, h * 0.48 + breathY, 19, 92);
        ctx.fillRect(cx + 4, h * 0.48 + breathY, 19, 92);
        ctx.fillStyle = '#14171d';
        ctx.beginPath();
        ctx.ellipse(cx - 15, h * 0.76, 14, 7.5, -0.1, 0, Math.PI * 2);
        ctx.ellipse(cx + 15, h * 0.76, 14, 7.5, 0.1, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Celana chino krem + sepatu putih Converse
        ctx.fillStyle = '#d6c4a0';
        ctx.fillRect(cx - 23, h * 0.48 + breathY, 19, 92);
        ctx.fillRect(cx + 4, h * 0.48 + breathY, 19, 92);
        ctx.fillStyle = '#f4f4ee';
        ctx.beginPath();
        ctx.ellipse(cx - 15, h * 0.76, 14, 7.5, -0.1, 0, Math.PI * 2);
        ctx.ellipse(cx + 15, h * 0.76, 14, 7.5, 0.1, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Torso & Atasan
      if (era.id === 'kuliah') {
        // Kemeja dalam putih + Jaket almamater hijau Unimal (#166534)
        ctx.fillStyle = '#f3f5f8';
        ctx.fillRect(cx - 14, h * 0.27 + breathY, 28, 74);
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.roundRect(cx - 34, h * 0.26 + breathY, 24, 78, 8);
        ctx.roundRect(cx + 10, h * 0.26 + breathY, 24, 78, 8);
        ctx.fill();
        // Lanyard + ID Card + Kancing Emas
        ctx.strokeStyle = '#0d3b1e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - 9, h * 0.26 + breathY);
        ctx.lineTo(cx, h * 0.39 + breathY);
        ctx.lineTo(cx + 9, h * 0.26 + breathY);
        ctx.stroke();
        ctx.fillStyle = '#1e2428';
        ctx.strokeStyle = '#a8ff60';
        ctx.lineWidth = 1;
        ctx.fillRect(cx - 6, h * 0.39 + breathY, 12, 16);
        ctx.strokeRect(cx - 6, h * 0.39 + breathY, 12, 16);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(cx + 18, h * 0.32 + breathY, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Kemeja putih SMP / SMK
        ctx.fillStyle = '#f3f5f8';
        ctx.beginPath();
        ctx.roundRect(cx - 32, h * 0.26 + breathY, 64, 76, 9);
        ctx.fill();

        if (era.id === 'smp') {
          // Badge saku SMP + tali ransel biru
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(cx - 29, h * 0.27 + breathY, 5, 68);
          ctx.fillRect(cx + 24, h * 0.27 + breathY, 5, 68);
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(cx + 10, h * 0.33 + breathY, 9, 11);
        } else {
          // SMK: Dasi abu-abu + Pin Emas OSIS + Lanyard KETUA OSIS
          ctx.fillStyle = '#4b5563';
          ctx.fillRect(cx - 3.5, h * 0.28 + breathY, 7, 46);
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(cx + 14, h * 0.32 + breathY, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(cx - 6, h * 0.4 + breathY, 12, 15);
        }
      }

      // 3. Leher & Kepala Stylized
      ctx.fillStyle = '#d69c75';
      ctx.fillRect(cx - 7, h * 0.22 + breathY, 14, 15);
      ctx.beginPath();
      ctx.ellipse(cx, h * 0.17 + breathY, 18, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rambut hitam bergelombang
      ctx.fillStyle = '#17191e';
      ctx.beginPath();
      ctx.ellipse(cx, h * 0.13 + breathY, 20, 13, 0, Math.PI, Math.PI * 2);
      ctx.arc(cx - 10, h * 0.14 + breathY, 10, 0, Math.PI * 2);
      ctx.arc(cx + 10, h * 0.14 + breathY, 10, 0, Math.PI * 2);
      ctx.fill();

      // Rim highlight hijau neon di sisi kanan siluet
      ctx.strokeStyle = 'rgba(168,255,96,0.65)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + 32, h * 0.27 + breathY);
      ctx.lineTo(cx + 24, h * 0.74);
      ctx.stroke();

      rafId = requestAnimationFrame(renderPreview);
    };

    rafId = requestAnimationFrame(renderPreview);
    return () => cancelAnimationFrame(rafId);
  }, [era, isFront]);

  return (
    <canvas
      ref={canvasRef}
      width={220}
      height={350}
      className="h-full w-full object-cover"
    />
  );
}

export default function OutfitCard() {
  const activeEraIndex = useJourneyStore((s) => s.activeEraIndex);
  const setEraIndex = useJourneyStore((s) => s.setEraIndex);
  const nextEra = useJourneyStore((s) => s.nextEra);

  const handleCardSelect = (targetIdx: number) => {
    audioManager.playClick();
    if (targetIdx === activeEraIndex) {
      const nextIdx = (activeEraIndex + 1) % EDUCATION_ERAS.length;
      audioManager.playOutfitMorph(nextIdx);
      nextEra();
    } else {
      audioManager.playOutfitMorph(targetIdx);
      setEraIndex(targetIdx);
    }
  };

  return (
    <div
      aria-label="Pilihan kartu outfit pendidikan"
      className="card-perspective absolute bottom-[calc(24vh+52px)] right-3.5 z-20 aspect-[0.62] w-[112px] md:bottom-auto md:right-[5%] md:top-1/2 md:w-[clamp(188px,16.5vw,252px)] md:-translate-y-1/2"
    >
      {EDUCATION_ERAS.map((era, idx) => {
        const stackPos =
          (idx - activeEraIndex + EDUCATION_ERAS.length) % EDUCATION_ERAS.length;
        const isFront = stackPos === 0;

        return (
          <div
            key={era.id}
            data-pos={stackPos}
            role="button"
            tabIndex={0}
            aria-label={`Pilih jenjang ${era.shortLabel} (${era.outfitTitle})`}
            onMouseEnter={() => audioManager.playHover()}
            onMouseMove={(e) => {
              if (!isFront) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
              const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
              e.currentTarget.style.setProperty('--ry', `${-6 + nx * 12}deg`);
              e.currentTarget.style.setProperty('--rx', `${-ny * 10}deg`);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.setProperty('--ry', '-6deg');
              e.currentTarget.style.setProperty('--rx', '0deg');
            }}
            onClick={() => handleCardSelect(idx)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardSelect(idx);
              }
            }}
            className="outfit-card group absolute inset-0 cursor-pointer select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neon"
          >
            {/* Border luar hijau neon chamfer 2px */}
            <div className="clip-chamfer absolute inset-0 bg-gradient-to-br from-[#d3ffab] via-neon to-[#5ca82e]" />

            {/* Isi kartu gelap chamfer */}
            <div className="clip-chamfer absolute inset-[2px] overflow-hidden bg-[#090e12]">
              {/* Preview Avatar */}
              <div className="absolute inset-0">
                <MiniAvatarPreviewCanvas era={era} isFront={isFront} />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-[#05080a]/95" />
              </div>

              {/* Garis scan vertikal halus */}
              <div className="card-scanline pointer-events-none absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-neon/20 to-transparent" />

              {/* Baris Atas: Badge & 2 Titik Status */}
              <div className="absolute inset-x-2 top-2 z-10 flex items-center justify-between md:inset-x-2.5 md:top-2.5">
                <span className="clip-chamfer-sm border border-neon/50 bg-black/65 px-1.5 py-0.5 font-mono text-[7px] tracking-[0.12em] text-[#e7ffd2] md:px-2 md:py-1 md:text-[9px]">
                  {era.badge}
                </span>
                <span className="flex items-center gap-1">
                  <i className="h-1.5 w-1.5 animate-pulse rounded-full border border-neon bg-neon shadow-[0_0_8px_#a8ff60] md:h-2 md:w-2" />
                  <i className="h-1.5 w-1.5 rounded-full border border-neon/75 md:h-2 md:w-2" />
                </span>
              </div>

              {/* Nomor Outline Besar & Label Outfit */}
              <div className="absolute bottom-11 left-2.5 z-10 md:bottom-[62px] md:left-3">
                <div className="card-outline-num font-orbitron text-lg font-extrabold leading-none md:text-[28px]">
                  {era.numberLabel}
                </div>
                <div className="mt-0.5 hidden font-mono text-[8.5px] tracking-[0.2em] text-white/75 md:block">
                  {era.outfitTitle.toUpperCase()}
                </div>
              </div>

              {/* Tombol Chamfer Hijau Neon "PILIH & LIHAT" (Gaya PLACE A BID) */}
              <div className="clip-chamfer-sm absolute inset-x-1.5 bottom-1.5 z-10 h-7 bg-neon text-[#081209] transition-all duration-200 group-hover:bg-[#c8ff99] group-hover:shadow-neon md:inset-x-2.5 md:bottom-2.5 md:h-[38px]">
                <span className="clip-chamfer-sm absolute inset-[2.5px] flex items-center justify-center border border-black/45 font-mono text-[7.5px] font-bold tracking-[0.14em] md:text-[10.5px] md:tracking-[0.2em]">
                  PILIH &amp; LIHAT
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

