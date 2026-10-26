'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import gsap from 'gsap';
import { CONFIG } from '@/lib/data';
import { CameraPreset, useJourneyStore } from '@/lib/store';

const PRESET_VIEWS: Record<
  CameraPreset,
  { pos: [number, number, number]; target: [number, number, number]; polar: number }
> = {
  default: {
    pos: [0, 1.76, 5.85],
    target: [-0.08, 1.72, 0],
    polar: Math.PI * 0.49
  },
  low: {
    pos: [0.16, 0.96, 4.75],
    target: [-0.06, 1.68, 0],
    polar: Math.PI * 0.56
  },
  closeup: {
    pos: [0.06, 2.48, 2.85],
    target: [-0.04, 2.38, 0],
    polar: Math.PI * 0.48
  }
};

export default function CameraRig() {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const isStarted = useJourneyStore((s) => s.isStarted);
  const transitionId = useJourneyStore((s) => s.transitionId);
  const cameraPreset = useJourneyStore((s) => s.cameraPreset);
  const touchInteraction = useJourneyStore((s) => s.touchInteraction);

  const [introFinished, setIntroFinished] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserDraggingRef = useRef(false);

  // Set posisi awal kamera low-angle fokus kaki & lantai panggung sebelum intro dimulai
  useEffect(() => {
    camera.position.set(0.14, 0.54, 2.68);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0.72, 0);
      controlsRef.current.update();
    }
  }, [camera]);

  // Intro sinematik 3.5 detik saat user klik "KLIK UNTUK MULAI"
  useEffect(() => {
    if (!isStarted) return;

    const view = PRESET_VIEWS.default;
    const camProxy = {
      x: 0.14,
      y: 0.54,
      z: 2.68,
      tx: 0,
      ty: 0.72,
      tz: 0
    };

    const tl = gsap.timeline({
      onUpdate: () => {
        camera.position.set(camProxy.x, camProxy.y, camProxy.z);
        if (controlsRef.current) {
          controlsRef.current.target.set(camProxy.tx, camProxy.ty, camProxy.tz);
          controlsRef.current.update();
        }
      },
      onComplete: () => {
        setIntroFinished(true);
        setAutoRotate(true);
      }
    });

    tl.to(camProxy, {
      x: view.pos[0],
      y: view.pos[1],
      z: view.pos[2],
      tx: view.target[0],
      ty: view.target[1],
      tz: view.target[2],
      duration: CONFIG.timings.introDuration,
      ease: 'power3.inOut'
    });

    return () => {
      tl.kill();
    };
  }, [isStarted, camera]);

  // Transisi saat preset kamera diganti dari NavPill
  useEffect(() => {
    if (!introFinished) return;
    const view = PRESET_VIEWS[cameraPreset];

    const tl = gsap.timeline({
      onUpdate: () => {
        controlsRef.current?.update();
      }
    });

    tl.to(
      camera.position,
      {
        x: view.pos[0],
        y: view.pos[1],
        z: view.pos[2],
        duration: 1.15,
        ease: 'power3.inOut'
      },
      0
    );

    if (controlsRef.current) {
      tl.to(
        controlsRef.current.target,
        {
          x: view.target[0],
          y: view.target[1],
          z: view.target[2],
          duration: 1.15,
          ease: 'power3.inOut'
        },
        0
      );
    }

    return () => {
      tl.kill();
    };
  }, [cameraPreset, introFinished, camera]);

  // Dolly-punch (FOV pulse) saat ganti outfit
  useEffect(() => {
    if (transitionId === 0) return;
    const persp = camera as THREE.PerspectiveCamera;
    if (!persp.isPerspectiveCamera) return;

    const tl = gsap.timeline();
    tl.to(persp, {
      fov: 32.8,
      duration: 0.24,
      ease: 'power2.out',
      onUpdate: () => persp.updateProjectionMatrix()
    }).to(persp, {
      fov: 36,
      duration: 0.72,
      ease: 'elastic.out(1, 0.6)',
      onUpdate: () => persp.updateProjectionMatrix()
    });

    return () => {
      tl.kill();
    };
  }, [transitionId, camera]);

  // Bersihkan timer auto-rotate saat unmount
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  // Mouse parallax halus setelah intro selesai
  useFrame((state) => {
    if (!introFinished || isUserDraggingRef.current || !controlsRef.current) return;
    const view = PRESET_VIEWS[cameraPreset];
    const targetX = view.target[0] + state.pointer.x * 0.08;
    const targetY = view.target[1] + state.pointer.y * 0.06;

    controlsRef.current.target.x = THREE.MathUtils.lerp(
      controlsRef.current.target.x,
      targetX,
      0.06
    );
    controlsRef.current.target.y = THREE.MathUtils.lerp(
      controlsRef.current.target.y,
      targetY,
      0.06
    );
  });

  const activePolar = PRESET_VIEWS[cameraPreset].polar;

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={introFinished}
      enablePan={false}
      enableZoom={false}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.65}
      minPolarAngle={activePolar}
      maxPolarAngle={activePolar}
      autoRotate={introFinished && autoRotate}
      autoRotateSpeed={0.55}
      onStart={() => {
        isUserDraggingRef.current = true;
        setAutoRotate(false);
        touchInteraction();
        if (resumeTimerRef.current) {
          clearTimeout(resumeTimerRef.current);
        }
      }}
      onEnd={() => {
        isUserDraggingRef.current = false;
        touchInteraction();
        if (resumeTimerRef.current) {
          clearTimeout(resumeTimerRef.current);
        }
        resumeTimerRef.current = setTimeout(() => {
          setAutoRotate(true);
        }, CONFIG.timings.orbitResumeMs);
      }}
    />
  );
}

