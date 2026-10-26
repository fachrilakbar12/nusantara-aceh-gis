'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import gsap from 'gsap';
import { getRegionCentroid } from '@/lib/geo';
import { useAcehStore } from '@/lib/store';

const OVERVIEW_POS: [number, number, number] = [0, 6.1, 4.35];
const OVERVIEW_TARGET: [number, number, number] = [0, 0.1, 0];

export default function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const activeRegionId = useAcehStore((s) => s.activeRegionId);

  const isDraggingRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const baseTargetRef = useRef<[number, number, number]>([...OVERVIEW_TARGET]);

  useEffect(() => {
    camera.position.set(...OVERVIEW_POS);
    if (controlsRef.current) {
      controlsRef.current.target.set(...OVERVIEW_TARGET);
      controlsRef.current.update();
    }
  }, [camera]);

  useEffect(() => {
    if (!controlsRef.current) return;

    const centroid = activeRegionId ? getRegionCentroid(activeRegionId) : null;
    const destPos: [number, number, number] = centroid
      ? [centroid[0] + 0.18, 2.65, centroid[1] + 2.05]
      : [...OVERVIEW_POS];
    const destTarget: [number, number, number] = centroid
      ? [centroid[0], 0.32, centroid[1]]
      : [...OVERVIEW_TARGET];

    baseTargetRef.current = destTarget;

    const startPos = camera.position.clone();
    const startTarget = controlsRef.current.target.clone();
    const arcHeight = centroid ? 0.65 : 0.45;

    const proxy = { t: 0 };
    isAnimatingRef.current = true;

    const tl = gsap.timeline({
      onUpdate: () => {
        const p = proxy.t;
        const arc = Math.sin(p * Math.PI) * arcHeight;

        camera.position.set(
          THREE.MathUtils.lerp(startPos.x, destPos[0], p),
          THREE.MathUtils.lerp(startPos.y, destPos[1], p) + arc,
          THREE.MathUtils.lerp(startPos.z, destPos[2], p)
        );

        if (controlsRef.current) {
          controlsRef.current.target.set(
            THREE.MathUtils.lerp(startTarget.x, destTarget[0], p),
            THREE.MathUtils.lerp(startTarget.y, destTarget[1], p),
            THREE.MathUtils.lerp(startTarget.z, destTarget[2], p)
          );
          controlsRef.current.update();
        }
      },
      onComplete: () => {
        isAnimatingRef.current = false;
      }
    });

    tl.to(proxy, {
      t: 1,
      duration: reducedMotion ? 0.45 : 1.4,
      ease: 'power3.inOut'
    });

    return () => {
      tl.kill();
      isAnimatingRef.current = false;
    };
  }, [activeRegionId, camera, reducedMotion]);

  useFrame((state, delta) => {
    if (
      reducedMotion ||
      isDraggingRef.current ||
      isAnimatingRef.current ||
      !controlsRef.current
    ) {
      return;
    }

    const t = state.clock.elapsedTime;
    const [bx, by, bz] = baseTargetRef.current;

    // Parallax halus mengikuti mouse + camera breathing lembut
    const targetX = bx + state.pointer.x * 0.14 + Math.sin(t * 0.45) * 0.025;
    const targetY = by + Math.cos(t * 0.6) * 0.015;
    const targetZ = bz - state.pointer.y * 0.12 + Math.cos(t * 0.38) * 0.02;

    const lerpFactor = Math.min(1, delta * 4);
    controlsRef.current.target.x = THREE.MathUtils.lerp(
      controlsRef.current.target.x,
      targetX,
      lerpFactor
    );
    controlsRef.current.target.y = THREE.MathUtils.lerp(
      controlsRef.current.target.y,
      targetY,
      lerpFactor
    );
    controlsRef.current.target.z = THREE.MathUtils.lerp(
      controlsRef.current.target.z,
      targetZ,
      lerpFactor
    );
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.07}
      rotateSpeed={0.62}
      zoomSpeed={0.75}
      minDistance={2.2}
      maxDistance={10.5}
      minPolarAngle={0.38}
      maxPolarAngle={Math.PI * 0.39}
      minAzimuthAngle={-Math.PI * 0.38}
      maxAzimuthAngle={Math.PI * 0.38}
      onStart={() => {
        isDraggingRef.current = true;
      }}
      onEnd={() => {
        isDraggingRef.current = false;
      }}
    />
  );
}
