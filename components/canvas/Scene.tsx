'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { THEME_COLORS } from '@/lib/colors';
import { useAcehStore } from '@/lib/store';
import AcehMap from './AcehMap';
import Sea from './Sea';
import Clouds from './Clouds';
import CameraRig from './CameraRig';

export default function Scene() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <div className="absolute inset-0 z-0 h-full w-full bg-[#0b1220]">
      <Canvas
        shadows
        dpr={[1, 2]}
        frameloop="always"
        camera={{ position: [0, 6.1, 4.35], fov: 40, near: 0.1, far: 45 }}
        onPointerMissed={() => {
          useAcehStore.getState().selectRegion(null);
        }}
      >
        <color attach="background" args={[THEME_COLORS.bg]} />
        {/* Fog satu warna solid sesuai latar (#0b1220) */}
        <fog attach="fog" args={[THEME_COLORS.bg, 9.5, 22]} />

        {/* Pencahayaan: hemisphere light, key light hangat + bayangan lembut, rim light biru */}
        <hemisphereLight args={['#fff4e0', '#162847', 0.68]} />

        <directionalLight
          position={[5.5, 8.5, 4.2]}
          intensity={1.55}
          color="#ffe6c2"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={1}
          shadow-camera-far={22}
          shadow-camera-left={-7}
          shadow-camera-right={7}
          shadow-camera-top={7}
          shadow-camera-bottom={-7}
          shadow-bias={-0.0005}
        />

        <directionalLight
          position={[-6.0, 4.5, -5.0]}
          intensity={0.85}
          color="#4cc9f0"
        />

        <Sea reducedMotion={reducedMotion} />
        <AcehMap reducedMotion={reducedMotion} />
        <Clouds reducedMotion={reducedMotion} />
        <CameraRig reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
