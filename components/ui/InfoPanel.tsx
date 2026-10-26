'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { EDUCATION_ERAS } from '@/lib/data';
import { audioManager } from '@/lib/audio';
import { useJourneyStore } from '@/lib/store';

export default function InfoPanel() {
  const activeEraIndex = useJourneyStore((s) => s.activeEraIndex);
  const activeNavTab = useJourneyStore((s) => s.activeNavTab);
  const setEraIndex = useJourneyStore((s) => s.setEraIndex);

  const era = EDUCATION_ERAS[activeEraIndex];

  const panelRef = useRef<HTMLElement>(null);
  const xpFillRef = useRef<HTMLDivElement>(null);
  const [yearStart, setYearStart] = useState(era.yearStart);
  const [yearEnd, setYearEnd] = useState(era.yearEnd);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // GSAP stagger slide + fade setiap kali jenjang atau tab berubah, disertai count-up tahun & XP bar
  useEffect(() => {
    if (panelRef.current) {
      const rows = panelRef.current.querySelectorAll('.stagger-row');
      gsap.fromTo(
        rows,
        { opacity: 0, x: -18 },
        {
          opacity: 1,
          x: 0,
          duration: 0.46,
          stagger: 0.06,
          ease: 'power2.out'
        }
      );
    }

    const counterProxy = {
      start: era.yearStart - 16,
      end: era.yearEnd - 16
    };

    const yearTween = gsap.to(counterProxy, {
      start: era.yearStart,
      end: era.yearEnd,
      duration: 0.78,
      ease: 'power3.out',
      onUpdate: () => {
        setYearStart(Math.round(counterProxy.start));
        setYearEnd(Math.round(counterProxy.end));
      }
    });

    if (xpFillRef.current) {
      gsap.fromTo(
        xpFillRef.current,
        { width: '0%' },
        {
          width: `${era.xp}%`,
          duration: 1.15,
          ease: 'power3.out'
        }
      );
    }

    return () => {
      yearTween.kill();
    };
  }, [era, activeNavTab]);

  const timelineProgress =
    activeEraIndex === 0 ? '15%' : activeEraIndex === 1 ? '54%' : '100%';

  return (
    <aside
      ref={panelRef}
      aria-label="Informasi detail jenjang pendidikan"
      className={`z-20 overflow-y-auto border border-white/15 bg-gradient-to-br from-[#162025]/70 to-[#080d10]/65 backdrop-blur-xl transition-all duration-300 scrollbar-thin ${
        mobileExpanded ? 'max-h-[68vh]' : 'max-h-[24vh]'
      } fixed inset-x-2.5 bottom-2.5 rounded-t-2xl p-4 shadow-[0_12px_42px_rgba(0,0,0,0.55)] md:absolute md:bottom-[72px] md:left-6 md:right-auto md:max-h-[47%] md:w-[min(390px,38%)] md:rounded-2xl md:p-5`}
    >
      {/* Handle Bottom Sheet untuk Mobile */}
      <button
        type="button"
        aria-label={mobileExpanded ? 'Kecilkan panel info' : 'Perluas panel info'}
        onClick={() => setMobileExpanded((v) => !v)}
        className="mx-auto mb-2.5 block h-1 w-11 rounded-full bg-white/30 md:hidden"
      />

      {/* Baris Header */}
      <div className="stagger-row mb-2 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-neon">
        <span>// DATA PENDIDIKAN · {era.numberLabel}</span>
        <span className="rounded-full border border-neon/45 bg-neon/10 px-2.5 py-0.5 text-[9px] text-[#e2ffc2]">
          {era.outfitTitle.toUpperCase()}
        </span>
      </div>

      {/* Nama Institusi */}
      <h2 className="stagger-row mb-2.5 font-orbitron text-[15px] font-bold leading-snug tracking-[0.03em] text-white md:text-[16px]">
        {era.institusi}
      </h2>

      {/* Counter Tahun & Progress Bar XP */}
      <div className="stagger-row mb-3 grid grid-cols-[auto_1fr] items-end gap-4 border-y border-dashed border-white/15 py-2.5">
        <div className="font-orbitron text-[19px] font-bold text-neon drop-shadow-[0_0_12px_rgba(168,255,96,0.45)]">
          <span>{yearStart}</span>
          <span className="mx-1.5 text-xs text-white/50">→</span>
          <span>{yearEnd}</span>
          <span className="mt-0.5 block font-mono text-[8.5px] font-normal tracking-[0.18em] text-white/45">
            PERIODE {era.yearNote ? `(${era.yearNote.toUpperCase()})` : 'PENDIDIKAN'}
          </span>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between font-mono text-[9px] tracking-[0.16em] text-white/60">
            <span className="truncate pr-2">{era.xpLabel}</span>
            <strong className="text-neon">{era.xp}%</strong>
          </div>
          <div className="relative h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              ref={xpFillRef}
              className="xp-bar-shine h-full rounded-full bg-gradient-to-r from-[#509e2b] to-neon shadow-[0_0_10px_#a8ff60]"
            />
          </div>
        </div>
      </div>

      {/* Konten Berdasarkan Tab NavPill */}
      {activeNavTab === 'info' ? (
        <div className="stagger-row space-y-2 font-mono text-[10.5px] leading-relaxed text-[#b4bec2]">
          <div>
            <kbd className="mr-1.5 rounded border border-white/25 px-1.5 py-0.5 text-[9.5px] text-white">
              DRAG
            </kbd>
            Putar karakter horizontal di panggung
          </div>
          <div>
            <kbd className="mr-1.5 rounded border border-white/25 px-1.5 py-0.5 text-[9.5px] text-white">
              ← →
            </kbd>
            Ganti jenjang pendidikan via keyboard
          </div>
          <div>
            <kbd className="mr-1.5 rounded border border-white/25 px-1.5 py-0.5 text-[9.5px] text-white">
              M
            </kbd>
            Mute / Unmute suara synthesizer
          </div>
        </div>
      ) : (
        <>
          {/* Metadata Institusi / Periode / Jurusan / Peran */}
          <dl className="stagger-row mb-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[10.5px]">
            <dt className="text-white/45">PERIODE</dt>
            <dd className="text-white/90">{era.periode}</dd>
            {era.jurusan && (
              <>
                <dt className="text-white/45">JURUSAN</dt>
                <dd className="text-white/90">{era.jurusan}</dd>
              </>
            )}
            {era.peran && (
              <>
                <dt className="text-white/45">PERAN</dt>
                <dd className="text-neon">{era.peran}</dd>
              </>
            )}
          </dl>

          {/* Deskripsi */}
          {activeNavTab !== 'trophy' && (
            <p className="stagger-row mb-3 font-sans text-[11.5px] leading-[1.68] text-[#b8c3c7]">
              {era.deskripsi}
            </p>
          )}

          {/* Poin Peran Organisasi */}
          {era.poinOrganisasi.length > 0 && (
            <div className="stagger-row mb-3">
              <div className="mb-1.5 font-mono text-[9px] tracking-[0.22em] text-white/45">
                PERAN &amp; ORGANISASI
              </div>
              <ul className="space-y-1 font-sans text-[11px] text-white/90">
                {era.poinOrganisasi.map((poin, i) => (
                  <li
                    key={i}
                    className="relative border-b border-white/5 py-1 pl-4"
                  >
                    <span className="absolute left-0.5 top-2.5 h-1.5 w-1.5 rotate-45 bg-neon shadow-[0_0_8px_#a8ff60]" />
                    {poin}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tag Pencapaian */}
          <div className="stagger-row mb-3.5 flex flex-wrap gap-1.5">
            {era.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-neon/35 bg-neon/10 px-2.5 py-1 font-mono text-[9.5px] text-[#dcffc0]"
              >
                {tag}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Timeline Mini Interaktif */}
      <div className="stagger-row pt-1">
        <div className="mb-1.5 font-mono text-[8.5px] tracking-[0.24em] text-white/40">
          TIMELINE PENDIDIKAN
        </div>
        <div className="relative mx-2 h-9">
          <div className="absolute inset-x-0 top-1.5 h-0.5 bg-white/15">
            <div
              className="h-full bg-neon shadow-[0_0_8px_#a8ff60] transition-all duration-700"
              style={{ width: timelineProgress }}
            />
          </div>
          {EDUCATION_ERAS.map((item, idx) => {
            const leftPos = idx === 0 ? '10%' : idx === 1 ? '52%' : '90%';
            const reached = idx <= activeEraIndex;
            const current = idx === activeEraIndex;
            return (
              <button
                key={item.id}
                type="button"
                style={{ left: leftPos }}
                onMouseEnter={() => audioManager.playHover()}
                onClick={() => {
                  audioManager.playClick();
                  audioManager.playOutfitMorph(idx);
                  setEraIndex(idx);
                }}
                className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1 focus-visible:outline focus-visible:outline-1 focus-visible:outline-neon"
              >
                <span
                  className={`h-3.5 w-3.5 rounded-full border-2 transition-all ${
                    current
                      ? 'scale-110 border-neon bg-neon shadow-[0_0_12px_#a8ff60]'
                      : reached
                      ? 'border-neon bg-[#0a1013]'
                      : 'border-white/30 bg-[#0a1013]'
                  }`}
                />
                <span
                  className={`whitespace-nowrap font-mono text-[8px] tracking-wider ${
                    current ? 'text-neon' : 'text-white/55'
                  }`}
                >
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

