'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { THEME_COLORS } from '@/lib/colors';
import { LightingMode, useAcehStore } from '@/lib/store';
import AcehMap from './AcehMap';
import Sea from './Sea';
import CameraRig from './CameraRig';

const LIGHTING_PRESETS: Record<
  LightingMode,
  {
    bg: string;
    hemiSky: string;
    hemiGround: string;
    hemiIntensity: number;
    keyPos: [number, number, number];
    keyColor: string;
    keyIntensity: number;
    rimColor: string;
    rimIntensity: number;
  }
> = {
  malam: {
    bg: THEME_COLORS.bg,
    hemiSky: '#fff4e0',
    hemiGround: '#1e3357',
    hemiIntensity: 0.88,
    keyPos: [5.2, 9.2, 4.6],
    keyColor: '#ffe8cc',
    keyIntensity: 1.85,
    rimColor: '#64d2ff',
    rimIntensity: 0.95
  },
  senja: {
    bg: '#141326',
    hemiSky: '#ffc078',
    hemiGround: '#2d1f42',
    hemiIntensity: 0.92,
    keyPos: [-6.8, 5.4, 5.2], // Sudut matahari sore rendah untuk bayangan jatuh memanjang
    keyColor: '#ffa94d',
    keyIntensity: 2.1,
    rimColor: '#d084ff',
    rimIntensity: 1.05
  },
  siang: {
    bg: '#10243e',
    hemiSky: '#ffffff',
    hemiGround: '#24487a',
    hemiIntensity: 1.05,
    keyPos: [4.5, 10.5, 5.5],
    keyColor: '#ffffff',
    keyIntensity: 2.15,
    rimColor: '#a0e7ff',
    rimIntensity: 0.9
  }
};

export default function Scene() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const lightingMode = useAcehStore((s) => s.lightingMode);
  const preset = LIGHTING_PRESETS[lightingMode];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <div
      className="absolute inset-0 z-0 h-full w-full transition-colors duration-700 touch-none"
      style={{ backgroundColor: preset.bg, touchAction: 'none' }}
    >
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        frameloop="always"
        style={{ touchAction: 'none' }}
        camera={{ position: [-4.6, 2.7, 7.4], fov: 35, near: 0.1, far: 50 }}
        onPointerMissed={() => {
          const store = useAcehStore.getState();
          store.setTourPlaying(false);
          store.selectRegion(null);
        }}
      >
        <color attach="background" args={[preset.bg]} />
        {/* Fog ditempatkan jauh di luar jangkauan kamera mobile maupun desktop agar tidak menggelapkan peta */}
        <fog attach="fog" args={[preset.bg, 42, 95]} />

        {/* Cahaya ambien merata agar warna diorama tetap terang & konsisten di layar HP */}
        <ambientLight intensity={0.42} color="#ffffff" />

        <hemisphereLight
          args={[preset.hemiSky, preset.hemiGround, preset.hemiIntensity]}
        />

        <directionalLight
          position={preset.keyPos}
          intensity={preset.keyIntensity}
          color={preset.keyColor}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={1}
          shadow-camera-far={24}
          shadow-camera-left={-7.5}
          shadow-camera-right={7.5}
          shadow-camera-top={7.5}
          shadow-camera-bottom={-7.5}
          shadow-bias={-0.0003}
          shadow-radius={4}
        />

        <directionalLight
          position={[-6.0, 4.8, -5.0]}
          intensity={preset.rimIntensity}
          color={preset.rimColor}
        />

        <Sea reducedMotion={reducedMotion} />
        <AcehMap reducedMotion={reducedMotion} />
        <CameraRig reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
