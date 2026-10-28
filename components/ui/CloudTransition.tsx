'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useAcehStore } from '@/lib/store';

export default function CloudTransition() {
  const isCloudTransitioning = useAcehStore((s) => s.isCloudTransitioning);
  const setCloudTransitioning = useAcehStore((s) => s.setCloudTransitioning);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftCloudRef = useRef<HTMLDivElement>(null);
  const rightCloudRef = useRef<HTMLDivElement>(null);
  const topCloudRef = useRef<HTMLDivElement>(null);
  const bottomCloudRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const spark1Ref = useRef<HTMLDivElement>(null);
  const spark2Ref = useRef<HTMLDivElement>(null);

  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isCloudTransitioning) {
      setIsActive(false);
      return;
    }

    setIsActive(true);

    const isMobile = window.innerWidth < 768;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Tunggu 1 frame agar elemen DOM terpasang sempurna
    const raf = requestAnimationFrame(() => {
      if (!containerRef.current || !logoWrapperRef.current) return;

      const tl = gsap.timeline({
        onComplete: () => {
          setIsActive(false);
          setCloudTransitioning(false);
        }
      });

      // Target akhir posisi badge di header ("di ujung atas di bawah logo")
      const targetBadge = document.getElementById('the-light-of-aceh-badge');
      let targetX = isMobile ? 12 : 24;
      let targetY = isMobile ? 54 : 64;
      let targetScale = isMobile ? 0.28 : 0.34;

      if (targetBadge) {
        const rect = targetBadge.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
        // Rasio skala logo dari ukuran tengah (~320px) ke ukuran header (~110px)
        const logoWidth = isMobile ? 260 : 340;
        targetScale = Math.max(0.24, Math.min(0.38, rect.width / logoWidth));
      }

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // 1. Kondisi Awal
      gsap.set(logoWrapperRef.current, {
        x: centerX,
        y: centerY,
        xPercent: -50,
        yPercent: -50,
        scale: 0.72,
        opacity: 0,
        filter: 'drop-shadow(0 0 10px rgba(249,199,79,0.3)) drop-shadow(0 15px 25px rgba(0,0,0,0.5))'
      });

      if (leftCloudRef.current) {
        gsap.set(leftCloudRef.current, { xPercent: 0, opacity: 1 });
      }
      if (rightCloudRef.current) {
        gsap.set(rightCloudRef.current, { xPercent: 0, opacity: 1 });
      }
      if (topCloudRef.current) {
        gsap.set(topCloudRef.current, { yPercent: 0, opacity: 1 });
      }
      if (bottomCloudRef.current) {
        gsap.set(bottomCloudRef.current, { yPercent: 0, opacity: 1 });
      }
      if (glowRef.current) {
        gsap.set(glowRef.current, { scale: 0.5, opacity: 0 });
      }

      const durationMultiplier = reducedMotion ? 0.4 : 1.0;

      // 2. Tahap 1: Teks muncul di tengah, menyatu dalam awan dan mulai menyala
      tl.to(
        logoWrapperRef.current,
        {
          scale: 1.06,
          opacity: 1,
          duration: 0.75 * durationMultiplier,
          ease: 'power3.out'
        },
        0
      )
        .to(
          glowRef.current,
          {
            scale: 1.4,
            opacity: 0.95,
            duration: 0.8 * durationMultiplier,
            ease: 'power2.out'
          },
          0.1
        )
        // Kilau intan emas menyala
        .to(
          [spark1Ref.current, spark2Ref.current],
          {
            scale: 1.2,
            opacity: 1,
            rotation: 45,
            duration: 0.5 * durationMultiplier,
            stagger: 0.1,
            ease: 'back.out(2)'
          },
          0.25
        )
        // 3. Tahap 2: Puncak nyala terang ("menyala") dan awan mulai memudar & membelah
        .to(
          logoWrapperRef.current,
          {
            filter:
              'drop-shadow(0 0 35px rgba(249,199,79,0.95)) drop-shadow(0 0 65px rgba(243,156,18,0.75)) drop-shadow(0 20px 30px rgba(0,0,0,0.7))',
            duration: 0.45 * durationMultiplier,
            ease: 'sine.inOut'
          },
          0.7 * durationMultiplier
        )
        // Awan membelah ke kiri, kanan, atas, dan bawah
        .to(
          leftCloudRef.current,
          {
            xPercent: -125,
            opacity: 0,
            duration: 1.35 * durationMultiplier,
            ease: 'power3.inOut'
          },
          0.65 * durationMultiplier
        )
        .to(
          rightCloudRef.current,
          {
            xPercent: 125,
            opacity: 0,
            duration: 1.35 * durationMultiplier,
            ease: 'power3.inOut'
          },
          0.65 * durationMultiplier
        )
        .to(
          [topCloudRef.current, bottomCloudRef.current],
          {
            opacity: 0,
            duration: 0.95 * durationMultiplier,
            ease: 'power2.inOut'
          },
          0.75 * durationMultiplier
        )
        .to(
          glowRef.current,
          {
            opacity: 0,
            scale: 0.8,
            duration: 0.6 * durationMultiplier,
            ease: 'power2.in'
          },
          1.15 * durationMultiplier
        )
        // 4. Tahap 3: Teks meluncur & bertransisi ke ujung atas di bawah logo
        .to(
          logoWrapperRef.current,
          {
            x: targetX,
            y: targetY,
            scale: targetScale,
            filter:
              'drop-shadow(0 0 8px rgba(249,199,79,0.65)) drop-shadow(0 4px 8px rgba(0,0,0,0.45))',
            duration: 1.15 * durationMultiplier,
            ease: 'power3.inOut'
          },
          1.15 * durationMultiplier
        )
        .to(
          [spark1Ref.current, spark2Ref.current],
          {
            opacity: 0,
            scale: 0.3,
            duration: 0.4 * durationMultiplier,
            ease: 'power2.in'
          },
          1.4 * durationMultiplier
        );
    });

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [isCloudTransitioning, setCloudTransitioning]);

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {/* 1. Lapisan Awan Kertas Kiri (Papercut Cloud Bank Left) */}
      <div
        ref={leftCloudRef}
        className="absolute -left-12 -top-12 bottom-0 w-[58vw] max-w-[850px] select-none"
      >
        <svg
          viewBox="0 0 600 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-2xl"
        >
          {/* Lapisan Awan Belakang */}
          <path
            d="M-50,0 Q180,60 220,180 T340,360 T260,540 T380,720 T-50,850 Z"
            fill="#0f192b"
            opacity="0.9"
          />
          {/* Lapisan Awan Tengah */}
          <path
            d="M-50,30 Q140,110 180,240 T300,420 T210,600 T310,780 T-50,850 Z"
            fill="#1e2c47"
            opacity="0.85"
          />
          {/* Lapisan Awan Depan Putih Kertas Lembut */}
          <path
            d="M-50,60 Q100,160 140,300 T250,480 T170,660 T260,820 T-50,850 Z"
            fill="#f3efe6"
            opacity="0.16"
          />
        </svg>
      </div>

      {/* 2. Lapisan Awan Kertas Kanan (Papercut Cloud Bank Right) */}
      <div
        ref={rightCloudRef}
        className="absolute -right-12 -top-12 bottom-0 w-[58vw] max-w-[850px] select-none"
      >
        <svg
          viewBox="0 0 600 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-2xl"
        >
          {/* Lapisan Awan Belakang */}
          <path
            d="M650,0 Q420,60 380,180 T260,360 T340,540 T220,720 T650,850 Z"
            fill="#0f192b"
            opacity="0.9"
          />
          {/* Lapisan Awan Tengah */}
          <path
            d="M650,30 Q460,110 420,240 T300,420 T390,600 T290,780 T650,850 Z"
            fill="#1e2c47"
            opacity="0.85"
          />
          {/* Lapisan Awan Depan Putih Kertas Lembut */}
          <path
            d="M650,60 Q500,160 460,300 T350,480 T430,660 T340,820 T650,850 Z"
            fill="#f3efe6"
            opacity="0.16"
          />
        </svg>
      </div>

      {/* 3. Kabut Awan Lembut Atas & Bawah */}
      <div
        ref={topCloudRef}
        className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#0b1220]/95 via-[#0b1220]/60 to-transparent"
      />
      <div
        ref={bottomCloudRef}
        className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0b1220]/95 via-[#0b1220]/60 to-transparent"
      />

      {/* 4. Lingkaran Aura Cahaya Emas ("Menyala") */}
      <div
        ref={glowRef}
        className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(249,199,79,0.55) 0%, rgba(243,156,18,0.28) 38%, rgba(11,18,32,0) 72%)'
        }}
      />

      {/* 5. Teks & Logo HD The Light of Aceh yang Bertransisi */}
      <div
        ref={logoWrapperRef}
        className="absolute left-0 top-0 z-10 will-change-transform"
        style={{ transformOrigin: 'center center' }}
      >
        <div className="relative flex flex-col items-center">
          {/* Kilau Intan Emas 1 */}
          <div
            ref={spark1Ref}
            className="absolute -right-3 -top-3 h-4 w-4 bg-[#f9c74f] opacity-0"
            style={{
              clipPath:
                'polygon(50% 0%, 65% 35%, 100% 50%, 65% 65%, 50% 100%, 35% 65%, 0% 50%, 35% 35%)',
              filter: 'drop-shadow(0 0 6px #ffeaa7)'
            }}
          />

          {/* Kilau Intan Emas 2 */}
          <div
            ref={spark2Ref}
            className="absolute -bottom-2 -left-3 h-3.5 w-3.5 bg-[#f9c74f] opacity-0"
            style={{
              clipPath:
                'polygon(50% 0%, 65% 35%, 100% 50%, 65% 65%, 50% 100%, 35% 65%, 0% 50%, 35% 35%)',
              filter: 'drop-shadow(0 0 5px #ffeaa7)'
            }}
          />

          {/* Gambar HD The Light of Aceh */}
          <Image
            src="/images/the-light-of-aceh-hd.png"
            alt="The Light of Aceh"
            width={410}
            height={227}
            priority
            className="h-auto w-[280px] max-w-[85vw] select-none object-contain sm:w-[350px] md:w-[410px]"
            style={{
              imageRendering: 'crisp-edges'
            }}
          />
        </div>
      </div>
    </div>
  );
}
