'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { audioEngine } from '@/lib/audio';
import { useAcehStore } from '@/lib/store';

export default function CloudTransition() {
  const isCloudTransitioning = useAcehStore((s) => s.isCloudTransitioning);
  const setCloudTransitioning = useAcehStore((s) => s.setCloudTransitioning);
  const setLogoDocked = useAcehStore((s) => s.setLogoDocked);

  const containerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const leftCloudRef = useRef<HTMLDivElement>(null);
  const rightCloudRef = useRef<HTMLDivElement>(null);
  const centerMistRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const spark1Ref = useRef<HTMLDivElement>(null);
  const spark2Ref = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isCloudTransitioning) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
  }, [isCloudTransitioning]);

  useEffect(() => {
    if (!isVisible || !isCloudTransitioning) return;

    const isMobile = window.innerWidth < 768;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Safety timeout: jika animasi terhambat di browser, pastikan awan tidak pernah macet
    const fallbackTimer = setTimeout(() => {
      setLogoDocked(true);
      setCloudTransitioning(false);
      setIsVisible(false);
    }, 4800);

    const ctx = gsap.context(() => {
      if (!containerRef.current || !logoWrapperRef.current) return;

      const targetBadge = document.getElementById('the-light-of-aceh-badge');
      let targetX = isMobile ? 65 : 95;
      let targetY = isMobile ? 54 : 68;
      let targetScale = isMobile ? 0.32 : 0.38;

      const initialLogoWidth = isMobile ? 260 : 340;

      if (targetBadge) {
        const rect = targetBadge.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
        const targetInnerWidth = Math.max(70, rect.width - 16);
        targetScale = targetInnerWidth / initialLogoWidth;
      }

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Inisialisasi posisi elemen
      gsap.set(logoWrapperRef.current, {
        x: centerX,
        y: centerY,
        xPercent: -50,
        yPercent: -50,
        scale: 0.82,
        opacity: 0,
        filter: 'drop-shadow(0 0 12px rgba(249,199,79,0.35))'
      });

      if (backdropRef.current) {
        gsap.set(backdropRef.current, { opacity: 0.85 });
      }
      if (leftCloudRef.current) {
        gsap.set(leftCloudRef.current, { x: 0, opacity: 1 });
      }
      if (rightCloudRef.current) {
        gsap.set(rightCloudRef.current, { x: 0, opacity: 1 });
      }
      if (centerMistRef.current) {
        gsap.set(centerMistRef.current, { scale: 1, opacity: 0.95 });
      }
      if (glowRef.current) {
        gsap.set(glowRef.current, { scale: 0.7, opacity: 0 });
      }
      if (spark1Ref.current && spark2Ref.current) {
        gsap.set([spark1Ref.current, spark2Ref.current], { scale: 0, opacity: 0 });
      }

      const mult = reducedMotion ? 0.5 : 1.0;
      const tl = gsap.timeline({
        onComplete: () => {
          clearTimeout(fallbackTimer);
          setLogoDocked(true);
          setCloudTransitioning(false);
          setIsVisible(false);
        }
      });

      // SFX 1: Deru awan menyelimuti layar
      audioEngine.playCloudSweep();

      // ==========================================
      // FASE 1: (0.0s - 1.1s)
      // Awan berkumpul & Logo The Light of Aceh muncul di tengah
      // ==========================================
      tl.to(
        logoWrapperRef.current,
        {
          scale: 1.08,
          opacity: 1,
          duration: 1.0 * mult,
          ease: 'power2.out'
        },
        0.1
      )
        .to(
          glowRef.current,
          {
            scale: 1.3,
            opacity: 0.85,
            duration: 1.0 * mult,
            ease: 'power2.out'
          },
          0.15
        )
        // Kilau intan emas mulai bersinar
        .to(
          [spark1Ref.current, spark2Ref.current],
          {
            scale: 1.25,
            opacity: 1,
            rotation: 45,
            duration: 0.7 * mult,
            stagger: 0.12,
            ease: 'back.out(2)'
          },
          0.35
        )

        // ==========================================
        // FASE 2: (1.1s - 2.4s)
        // "Menyatu dalam pudarnya awan dan menyala"
        // SFX 2: Akor kristal keemasan surgawi
        // ==========================================
        .call(
          () => {
            audioEngine.playLightOfAcehGlow();
          },
          [],
          1.1 * mult
        )
        // Puncak nyala terang keemasan (golden bloom)
        .to(
          logoWrapperRef.current,
          {
            scale: 1.14,
            filter:
              'drop-shadow(0 0 32px rgba(249,199,79,1)) drop-shadow(0 0 65px rgba(243,156,18,0.85)) drop-shadow(0 15px 30px rgba(0,0,0,0.6))',
            duration: 0.8 * mult,
            ease: 'sine.inOut'
          },
          1.1 * mult
        )
        .to(
          glowRef.current,
          {
            scale: 1.6,
            opacity: 1,
            duration: 0.75 * mult,
            ease: 'sine.inOut'
          },
          1.15 * mult
        )
        .to(
          [spark1Ref.current, spark2Ref.current],
          {
            scale: 1.5,
            rotation: 135,
            duration: 0.9 * mult,
            ease: 'power2.out'
          },
          1.2 * mult
        )
        // Awan membelah ke samping & memudar anggun
        .to(
          leftCloudRef.current,
          {
            x: -window.innerWidth * 0.75,
            opacity: 0,
            duration: 1.4 * mult,
            ease: 'power2.inOut'
          },
          1.15 * mult
        )
        .to(
          rightCloudRef.current,
          {
            x: window.innerWidth * 0.75,
            opacity: 0,
            duration: 1.4 * mult,
            ease: 'power2.inOut'
          },
          1.15 * mult
        )
        .to(
          centerMistRef.current,
          {
            scale: 1.55,
            opacity: 0,
            duration: 1.25 * mult,
            ease: 'power2.inOut'
          },
          1.2 * mult
        )
        .to(
          backdropRef.current,
          {
            opacity: 0,
            duration: 1.2 * mult,
            ease: 'power2.inOut'
          },
          1.2 * mult
        )
        .to(
          glowRef.current,
          {
            opacity: 0,
            scale: 0.9,
            duration: 0.75 * mult,
            ease: 'power2.in'
          },
          1.85 * mult
        )

        // ==========================================
        // FASE 3: (2.3s - 3.6s)
        // Meluncur halus & bersandar di bawah logo header
        // ==========================================
        .to(
          logoWrapperRef.current,
          {
            x: targetX,
            y: targetY,
            scale: targetScale,
            filter:
              'drop-shadow(0 0 6px rgba(249,199,79,0.7)) drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
            duration: 1.25 * mult,
            ease: 'power3.inOut'
          },
          2.25 * mult
        )
        .to(
          [spark1Ref.current, spark2Ref.current],
          {
            opacity: 0,
            scale: 0.2,
            duration: 0.5 * mult,
            ease: 'power2.in'
          },
          2.35 * mult
        )

        // ==========================================
        // FASE 4: (3.5s - 3.7s)
        // Mendarat di Header & SFX 3: Denting kristal (Dock Shimmer)
        // ==========================================
        .call(
          () => {
            audioEngine.playDockShimmer();
          },
          [],
          3.45 * mult
        );
    }, containerRef);

    return () => {
      clearTimeout(fallbackTimer);
      ctx.revert();
    };
  }, [isVisible, isCloudTransitioning, setCloudTransitioning, setLogoDocked]);

  if (!isVisible && !isCloudTransitioning) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {/* 1. Latar Belakang Kabut Gelap Halus */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-[#0b1220]/75 backdrop-blur-[2px]"
      />

      {/* 2. Gumpalan Awan Lembut Kiri (Volumetric Organic Mist) */}
      <div
        ref={leftCloudRef}
        className="absolute -left-20 -top-20 -bottom-20 w-[60vw] max-w-[800px] select-none pointer-events-none"
      >
        <div className="relative h-full w-full">
          {/* Puff Awan 1 */}
          <div
            className="absolute left-0 top-1/4 h-[440px] w-[520px] rounded-full filter blur-[32px]"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(250,248,242,0.8) 50%, rgba(255,255,255,0) 72%)'
            }}
          />
          {/* Puff Awan 2 */}
          <div
            className="absolute left-[15%] top-1/2 h-[400px] w-[480px] -translate-y-1/2 rounded-full filter blur-[28px]"
            style={{
              background:
                'radial-gradient(circle, rgba(255,253,248,0.92) 0%, rgba(248,242,230,0.75) 52%, rgba(255,255,255,0) 74%)'
            }}
          />
          {/* Puff Awan 3 Atas */}
          <div
            className="absolute left-[5%] top-0 h-[380px] w-[460px] rounded-full filter blur-[35px]"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(251,246,236,0.7) 48%, rgba(255,255,255,0) 72%)'
            }}
          />
          {/* Puff Awan 4 Bawah */}
          <div
            className="absolute left-[5%] bottom-0 h-[400px] w-[480px] rounded-full filter blur-[35px]"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(251,246,236,0.7) 48%, rgba(255,255,255,0) 72%)'
            }}
          />
        </div>
      </div>

      {/* 3. Gumpalan Awan Lembut Kanan (Volumetric Organic Mist) */}
      <div
        ref={rightCloudRef}
        className="absolute -right-20 -top-20 -bottom-20 w-[60vw] max-w-[800px] select-none pointer-events-none"
      >
        <div className="relative h-full w-full">
          {/* Puff Awan 1 */}
          <div
            className="absolute right-0 top-1/4 h-[440px] w-[520px] rounded-full filter blur-[32px]"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(250,248,242,0.8) 50%, rgba(255,255,255,0) 72%)'
            }}
          />
          {/* Puff Awan 2 */}
          <div
            className="absolute right-[15%] top-1/2 h-[400px] w-[480px] -translate-y-1/2 rounded-full filter blur-[28px]"
            style={{
              background:
                'radial-gradient(circle, rgba(255,253,248,0.92) 0%, rgba(248,242,230,0.75) 52%, rgba(255,255,255,0) 74%)'
            }}
          />
          {/* Puff Awan 3 Atas */}
          <div
            className="absolute right-[5%] top-0 h-[380px] w-[460px] rounded-full filter blur-[35px]"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(251,246,236,0.7) 48%, rgba(255,255,255,0) 72%)'
            }}
          />
          {/* Puff Awan 4 Bawah */}
          <div
            className="absolute right-[5%] bottom-0 h-[400px] w-[480px] rounded-full filter blur-[35px]"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(251,246,236,0.7) 48%, rgba(255,255,255,0) 72%)'
            }}
          />
        </div>
      </div>

      {/* 4. Kabut Tengah Lembut (Penyatu Teks & Awan) */}
      <div
        ref={centerMistRef}
        className="absolute left-1/2 top-1/2 h-[500px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full filter blur-[40px] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(254,250,240,0.6) 38%, rgba(255,255,255,0) 72%)'
        }}
      />

      {/* 5. Aura Cahaya Emas ("Menyala") */}
      <div
        ref={glowRef}
        className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(249,199,79,0.7) 0%, rgba(243,156,18,0.35) 42%, rgba(11,18,32,0) 72%)'
        }}
      />

      {/* 6. Teks & Logo HD The Light of Aceh yang Bertransisi */}
      <div
        ref={logoWrapperRef}
        className="absolute left-0 top-0 z-10 will-change-transform pointer-events-none"
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
            width={360}
            height={200}
            priority
            className="h-auto w-[250px] max-w-[85vw] select-none object-contain sm:w-[320px] md:w-[360px]"
            style={{
              imageRendering: 'crisp-edges'
            }}
          />
        </div>
      </div>
    </div>
  );
}
