'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { THEME_COLORS } from '@/lib/colors';
import { LightingMode, useAcehStore } from '@/lib/store';
import AcehMap from './AcehMap';
import Sea from './Sea';
import Clouds from './Clouds';
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
    hemiGround: '#162847',
    hemiIntensity: 0.72,
    keyPos: [5.2, 9.2, 4.6],
    keyColor: '#ffe6c2',
    keyIntensity: 1.65,
    rimColor: '#4cc9f0',
    rimIntensity: 0.85
  },
  senja: {
    bg: '#141326',
    hemiSky: '#ffb347',
    hemiGround: '#241938',
    hemiIntensity: 0.78,
    keyPos: [-6.8, 5.4, 5.2], // Sudut matahari sore rendah untuk bayangan jatuh memanjang
    keyColor: '#ff9f43',
    keyIntensity: 1.9,
    rimColor: '#c77dff',
    rimIntensity: 0.92
  },
  siang: {
    bg: '#10243e',
    hemiSky: '#ffffff',
    hemiGround: '#1d3b66',
    hemiIntensity: 0.95,
    keyPos: [4.5, 10.5, 5.5],
    keyColor: '#fffaf0',
    keyIntensity: 1.85,
    rimColor: '#90e0ef',
    rimIntensity: 0.75
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
      className="absolute inset-0 z-0 h-full w-full transition-colors duration-700"
      style={{ backgroundColor: preset.bg }}
    >
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        frameloop="always"
        camera={{ position: [-4.6, 2.7, 7.4], fov: 35, near: 0.1, far: 45 }}
        onPointerMissed={() => {
          const store = useAcehStore.getState();
          store.setTourPlaying(false);
          store.selectRegion(null);
        }}
      >
        <color attach="background" args={[preset.bg]} />
        {/* Fog satu warna solid sesuai suasana cahaya */}
        <fog attach="fog" args={[preset.bg, 10.5, 24]} />

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
        <Clouds reducedMotion={reducedMotion} />
        <CameraRig reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
