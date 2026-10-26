'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { EDUCATION_ERAS } from '@/lib/data';
import { audioManager } from '@/lib/audio';
import { useJourneyStore } from '@/lib/store';

const SCRAMBLE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#*+=';

export default function HeroTitle() {
  const activeEraIndex = useJourneyStore((s) => s.activeEraIndex);
  const era = EDUCATION_ERAS[activeEraIndex];

  const [displayText, setDisplayText] = useState(era.heroTitle);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const target = era.heroTitle;
    const proxy = { progress: 0 };

    const tween = gsap.to(proxy, {
      progress: 1,
      duration: 0.58,
      ease: 'power2.out',
      onUpdate: () => {
        const revealed = Math.floor(proxy.progress * target.length);
        let next = '';
        for (let i = 0; i < target.length; i++) {
          if (target[i] === ' ') {
            next += ' ';
          } else if (i < revealed || proxy.progress >= 0.99) {
            next += target[i];
          } else {
            next +=
              SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
          }
        }
        setDisplayText(next);
        audioManager.playScrambleTick();
      },
      onComplete: () => {
        setDisplayText(target);
      }
    });

    if (descRef.current) {
      gsap.fromTo(
        descRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
      );
    }

    return () => {
      tween.kill();
    };
  }, [era.heroTitle, era.deskripsi]);

  return (
    <section
      aria-label="Judul era pendidikan aktif"
      className="pointer-events-none absolute left-4 top-[74px] z-10 w-[calc(100%-2rem)] max-w-[540px] md:left-[4.8%] md:top-[18%] md:w-[44%]"
    >
      <div className="mb-2.5 font-mono text-[10px] tracking-[0.28em] text-neon/90 md:mb-3.5 md:text-[11px]">
        {era.heroSubtitle}
      </div>

      {/* Stacked Ghost / Outline / RGB-Split Glitch Title */}
      <div className="relative select-none font-orbitron text-[clamp(26px,4.4vw,68px)] font-extrabold leading-[1.02] tracking-[0.04em]">
        <span
          aria-hidden="true"
          className="hero-ghost-top pointer-events-none absolute inset-0 -translate-y-[38%] opacity-25"
        >
          {displayText}
        </span>
        <span
          aria-hidden="true"
          className="hero-ghost-bottom pointer-events-none absolute inset-0 translate-y-[38%] opacity-15"
        >
          {displayText}
        </span>
        <span
          aria-hidden="true"
          className="hero-rgb-red pointer-events-none absolute inset-0 -translate-x-[3px] text-[#ff2a55]/55 mix-blend-screen"
        >
          {displayText}
        </span>
        <span
          aria-hidden="true"
          className="hero-rgb-blue pointer-events-none absolute inset-0 translate-x-[3px] text-[#28c8ff]/55 mix-blend-screen"
        >
          {displayText}
        </span>
        <h1 className="hero-main-fill relative">{displayText}</h1>
      </div>

      <p
        ref={descRef}
        className="mt-4 hidden max-w-[345px] font-sans text-[12px] leading-[1.72] text-[#b4bec2] md:block"
      >
        {era.deskripsi}
      </p>
    </section>
  );
}

