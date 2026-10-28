'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import gsap from 'gsap';
import { audioEngine } from '@/lib/audio';
import { getRegionCentroid } from '@/lib/geo';
import { useAcehStore } from '@/lib/store';

const OVERVIEW_TARGET: [number, number, number] = [0, 0.12, 0];

export default function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera, size } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const hasEntered = useAcehStore((s) => s.hasEntered);
  const activeRegionId = useAcehStore((s) => s.activeRegionId);
  const cameraActionTrigger = useAcehStore((s) => s.cameraActionTrigger);

  const isDraggingRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const baseTargetRef = useRef<[number, number, number]>([...OVERVIEW_TARGET]);
  const prevEnteredRef = useRef(hasEntered);

  // Deteksi rasio mobile/portrait
  const isMobile = size.width < 768 || size.width < size.height;

  // Kamera overview mundur lebih jauh di mobile agar seluruh Aceh muat di layar vertikal
  // Posisi awal sebelum masuk
  useEffect(() => {
    if (hasEntered) return;
    const start: [number, number, number] = isMobile ? [-4.2, 4.0, 9.2] : [-4.6, 2.7, 7.4];
    camera.position.set(...start);
    if (controlsRef.current) {
      controlsRef.current.target.set(-0.6, 0.15, -0.3);
      controlsRef.current.update();
    }
  }, [camera, isMobile, hasEntered]);

  // Animasi terbang sinematik saat pengguna menekan tombol "Masuk"
  useEffect(() => {
    if (!hasEntered || !controlsRef.current) return;

    audioEngine.playCameraWhoosh();
    const startPos = camera.position.clone();
    const startTarget = controlsRef.current.target.clone();
    const destOverview: [number, number, number] = isMobile ? [0, 8.8, 6.2] : [0, 6.35, 4.55];
    const proxy = { t: 0 };
    isAnimatingRef.current = true;

    const tl = gsap.timeline({
      onUpdate: () => {
        const p = proxy.t;
        const arc = Math.sin(p * Math.PI) * 1.1;

        camera.position.set(
          THREE.MathUtils.lerp(startPos.x, destOverview[0], p),
          THREE.MathUtils.lerp(startPos.y, destOverview[1], p) + arc,
          THREE.MathUtils.lerp(startPos.z, destOverview[2], p)
        );

        if (controlsRef.current) {
          controlsRef.current.target.set(
            THREE.MathUtils.lerp(startTarget.x, OVERVIEW_TARGET[0], p),
            THREE.MathUtils.lerp(startTarget.y, OVERVIEW_TARGET[1], p),
            THREE.MathUtils.lerp(startTarget.z, OVERVIEW_TARGET[2], p)
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
      duration: reducedMotion ? 0.5 : 2.1,
      ease: 'power3.inOut'
    });

    return () => {
      tl.kill();
      isAnimatingRef.current = false;
    };
  }, [hasEntered, camera, reducedMotion, isMobile]);

  // Animasi kamera kembali ke sudut awal intro saat pengguna menekan "Keluar"
  useEffect(() => {
    if (prevEnteredRef.current && !hasEntered && controlsRef.current) {
      audioEngine.playCameraWhoosh();
      const startPos = camera.position.clone();
      const startTarget = controlsRef.current.target.clone();
      const introPos: [number, number, number] = isMobile ? [-4.2, 4.0, 9.2] : [-4.6, 2.7, 7.4];
      const introTarget: [number, number, number] = [-0.6, 0.15, -0.3];
      baseTargetRef.current = introTarget;

      const proxy = { t: 0 };
      isAnimatingRef.current = true;

      const tl = gsap.timeline({
        onUpdate: () => {
          const p = proxy.t;
          camera.position.set(
            THREE.MathUtils.lerp(startPos.x, introPos[0], p),
            THREE.MathUtils.lerp(startPos.y, introPos[1], p),
            THREE.MathUtils.lerp(startPos.z, introPos[2], p)
          );
          if (controlsRef.current) {
            controlsRef.current.target.set(
              THREE.MathUtils.lerp(startTarget.x, introTarget[0], p),
              THREE.MathUtils.lerp(startTarget.y, introTarget[1], p),
              THREE.MathUtils.lerp(startTarget.z, introTarget[2], p)
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
        duration: reducedMotion ? 0.4 : 1.3,
        ease: 'power3.inOut'
      });
    }
    prevEnteredRef.current = hasEntered;
  }, [hasEntered, isMobile, camera, reducedMotion]);

  const prevActiveRegionRef = useRef<string | null>(null);

  // Terbang kamera ke wilayah terpilih
  useEffect(() => {
    if (!hasEntered || !controlsRef.current) return;
    if (prevActiveRegionRef.current === null && activeRegionId === null) return;
    prevActiveRegionRef.current = activeRegionId;

    const centroid = activeRegionId ? getRegionCentroid(activeRegionId) : null;
    const overviewPos: [number, number, number] = isMobile ? [0, 8.8, 6.2] : [0, 6.35, 4.55];

    // Di mobile, sudut kamera ke wilayah sedikit lebih tinggi dan sedikit mundur ke selatan agar tidak tertutup bottom sheet
    const destPos: [number, number, number] = centroid
      ? isMobile
        ? [centroid[0], 3.8, centroid[1] + 2.8]
        : [centroid[0] + 0.18, 2.55, centroid[1] + 2.0]
      : [...overviewPos];

    const destTarget: [number, number, number] = centroid
      ? [centroid[0], 0.34, centroid[1]]
      : [...OVERVIEW_TARGET];

    baseTargetRef.current = destTarget;

    const startPos = camera.position.clone();
    const startTarget = controlsRef.current.target.clone();
    const arcHeight = centroid ? 0.68 : 0.45;

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
  }, [activeRegionId, hasEntered, camera, reducedMotion, isMobile]);

  // Kontrol Aksi Kamera Programatik (Zoom In, Zoom Out, Pandangan Atas, Reset 3D)
  useEffect(() => {
    if (!cameraActionTrigger || !controlsRef.current) return;
    const { action } = cameraActionTrigger;
    const controls = controlsRef.current;

    audioEngine.playHoverTick();

    if (action === 'zoomIn') {
      const dir = camera.position.clone().sub(controls.target);
      const currentLen = dir.length();
      const targetLen = Math.max(1.4, currentLen * 0.72);
      dir.setLength(targetLen);
      const dest = controls.target.clone().add(dir);

      gsap.to(camera.position, {
        x: dest.x,
        y: dest.y,
        z: dest.z,
        duration: 0.35,
        ease: 'power2.out',
        onUpdate: () => controls.update()
      });
    } else if (action === 'zoomOut') {
      const dir = camera.position.clone().sub(controls.target);
      const currentLen = dir.length();
      const targetLen = Math.min(26.0, currentLen * 1.35);
      dir.setLength(targetLen);
      const dest = controls.target.clone().add(dir);

      gsap.to(camera.position, {
        x: dest.x,
        y: dest.y,
        z: dest.z,
        duration: 0.35,
        ease: 'power2.out',
        onUpdate: () => controls.update()
      });
    } else if (action === 'viewTop') {
      // Pandangan Atas Peta Penuh (Bird's Eye Top-Down View)
      audioEngine.playCameraWhoosh();
      isAnimatingRef.current = true;
      const topPos: [number, number, number] = isMobile ? [0, 16.0, 0.05] : [0, 12.5, 0.05];
      baseTargetRef.current = OVERVIEW_TARGET;

      const proxy = { t: 0 };
      const startPos = camera.position.clone();
      const startTarget = controls.target.clone();

      gsap.to(proxy, {
        t: 1,
        duration: reducedMotion ? 0.4 : 1.2,
        ease: 'power3.inOut',
        onUpdate: () => {
          const p = proxy.t;
          camera.position.set(
            THREE.MathUtils.lerp(startPos.x, topPos[0], p),
            THREE.MathUtils.lerp(startPos.y, topPos[1], p),
            THREE.MathUtils.lerp(startPos.z, topPos[2], p)
          );
          controls.target.set(
            THREE.MathUtils.lerp(startTarget.x, OVERVIEW_TARGET[0], p),
            THREE.MathUtils.lerp(startTarget.y, OVERVIEW_TARGET[1], p),
            THREE.MathUtils.lerp(startTarget.z, OVERVIEW_TARGET[2], p)
          );
          controls.update();
        },
        onComplete: () => {
          isAnimatingRef.current = false;
          useAcehStore.getState().setIsTopView(true);
        }
      });
    } else if (action === 'resetOverview') {
      // Kembali ke Sudut Diorama Perspektif 3D
      audioEngine.playCameraWhoosh();
      isAnimatingRef.current = true;
      const overviewPos: [number, number, number] = isMobile ? [0, 8.8, 6.2] : [0, 6.35, 4.55];
      baseTargetRef.current = OVERVIEW_TARGET;

      const proxy = { t: 0 };
      const startPos = camera.position.clone();
      const startTarget = controls.target.clone();

      gsap.to(proxy, {
        t: 1,
        duration: reducedMotion ? 0.4 : 1.2,
        ease: 'power3.inOut',
        onUpdate: () => {
          const p = proxy.t;
          camera.position.set(
            THREE.MathUtils.lerp(startPos.x, overviewPos[0], p),
            THREE.MathUtils.lerp(startPos.y, overviewPos[1], p),
            THREE.MathUtils.lerp(startPos.z, overviewPos[2], p)
          );
          controls.target.set(
            THREE.MathUtils.lerp(startTarget.x, OVERVIEW_TARGET[0], p),
            THREE.MathUtils.lerp(startTarget.y, OVERVIEW_TARGET[1], p),
            THREE.MathUtils.lerp(startTarget.z, OVERVIEW_TARGET[2], p)
          );
          controls.update();
        },
        onComplete: () => {
          isAnimatingRef.current = false;
          useAcehStore.getState().setIsTopView(false);
        }
      });
    }
  }, [cameraActionTrigger, camera, isMobile, reducedMotion]);

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

    // Di mobile, kurangi intensitas parallax agar stabil saat disentuh
    const parallaxFactor = isMobile ? 0.05 : 0.16;
    const targetX = bx + state.pointer.x * parallaxFactor + Math.sin(t * 0.45) * 0.02;
    const targetY = by + Math.cos(t * 0.6) * 0.012;
    const targetZ = bz - state.pointer.y * parallaxFactor + Math.cos(t * 0.38) * 0.02;

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
      dampingFactor={0.08}
      rotateSpeed={0.75}
      zoomSpeed={1.2}
      minDistance={1.4}
      maxDistance={28.0}
      minPolarAngle={0.02}
      maxPolarAngle={Math.PI * 0.45}
      minAzimuthAngle={-Math.PI * 0.55}
      maxAzimuthAngle={Math.PI * 0.55}
      onStart={() => {
        isDraggingRef.current = true;
        useAcehStore.getState().setTourPlaying(false);
        useAcehStore.getState().setIsTopView(false);
      }}
      onEnd={() => {
        isDraggingRef.current = false;
      }}
    />
  );
}
