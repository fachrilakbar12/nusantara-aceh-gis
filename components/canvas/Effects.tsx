'use client';

import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Glitch,
  Noise,
  Scanline,
  Vignette
} from '@react-three/postprocessing';
import { BlendFunction, GlitchMode } from 'postprocessing';
import { useJourneyStore } from '@/lib/store';

export default function Effects() {
  const transitionId = useJourneyStore((s) => s.transitionId);
  const glitchBurstId = useJourneyStore((s) => s.glitchBurstId);

  const [glitchActive, setGlitchActive] = useState(false);
  const [bloomBoost, setBloomBoost] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const chromaticOffset = useMemo(
    () => new THREE.Vector2(bloomBoost ? 0.0028 : 0.001, bloomBoost ? 0.0018 : 0.0006),
    [bloomBoost]
  );
  const glitchDelay = useMemo(() => new THREE.Vector2(0.0, 0.0), []);
  const glitchDuration = useMemo(() => new THREE.Vector2(0.08, 0.18), []);
  const glitchStrength = useMemo(() => new THREE.Vector2(0.06, 0.16), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Flash bloom singkat & glitch saat ganti outfit
  useEffect(() => {
    if (transitionId === 0) return;
    setBloomBoost(true);
    if (!reducedMotion) {
      setGlitchActive(true);
    }

    const tGlitch = setTimeout(() => setGlitchActive(false), 240);
    const tBloom = setTimeout(() => setBloomBoost(false), 520);

    return () => {
      clearTimeout(tGlitch);
      clearTimeout(tBloom);
    };
  }, [transitionId, reducedMotion]);

  // Glitch singkat saat glitchBurstId dipicu (4–9 detik sekali)
  useEffect(() => {
    if (glitchBurstId === 0 || reducedMotion) return;
    setGlitchActive(true);
    const timer = setTimeout(() => setGlitchActive(false), 120);
    return () => clearTimeout(timer);
  }, [glitchBurstId, reducedMotion]);

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={0.22}
        mipmapBlur
        intensity={bloomBoost ? 1.55 : 0.78}
        radius={0.68}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={chromaticOffset}
        radialModulation={false}
        modulationOffset={0.15}
      />
      <Scanline
        blendFunction={BlendFunction.OVERLAY}
        density={1.35}
        opacity={0.07}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={0.14}
      />
      <Vignette
        eskil={false}
        offset={0.26}
        darkness={0.76}
        blendFunction={BlendFunction.NORMAL}
      />
      <Glitch
        active={glitchActive && !reducedMotion}
        delay={glitchDelay}
        duration={glitchDuration}
        strength={glitchStrength}
        mode={GlitchMode.CONSTANT_MILD}
        ratio={0.85}
      />
    </EffectComposer>
  );
}

