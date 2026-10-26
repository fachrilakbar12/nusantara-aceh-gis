'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Stage from './Stage';
import Avatar from './Avatar';
import CameraRig from './CameraRig';
import Effects from './Effects';

export default function Scene() {
  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        frameloop="always"
        camera={{ position: [0.14, 0.54, 2.68], fov: 36, near: 0.1, far: 45 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false
        }}
        className="h-full w-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={['#05080a']} />
        <Suspense fallback={null}>
          <Stage />
          <Avatar />
          <CameraRig />
          <Effects />
        </Suspense>
      </Canvas>
    </div>
  );
}

