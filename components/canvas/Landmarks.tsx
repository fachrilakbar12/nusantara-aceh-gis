'use client';

import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { audioEngine } from '@/lib/audio';
import { BASE_EXTRUDE_HEIGHT, HOVER_EXTRUDE_OFFSET } from '@/lib/geo';
import { JenisLandmark, REGION_BY_ID } from '@/lib/regions';
import { useAcehStore } from '@/lib/store';

export interface LandmarkAnchor {
  id: string;
  centroid: [number, number];
}

function LandmarkPrimitives({
  kind,
  accentColor
}: {
  kind: JenisLandmark;
  accentColor: string;
}) {
  switch (kind) {
    case 'masjid-baiturrahman':
      // 5 bentuk sederhana arsitektural (tanpa bola/bulatan): (1) Bangunan putih utama, (2) Kubah prisma utama, (3) Kubah kiri, (4) Kubah kanan, (5) Mustaka emas
      return (
        <group>
          <mesh position={[0, 0.042, 0]} castShadow>
            <boxGeometry args={[0.21, 0.072, 0.13]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.62} flatShading />
          </mesh>
          <mesh position={[0, 0.12, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.064, 0.09, 4]} />
            <meshStandardMaterial color="#1e2430" roughness={0.5} flatShading />
          </mesh>
          <mesh position={[-0.068, 0.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.042, 0.065, 4]} />
            <meshStandardMaterial color="#283040" roughness={0.52} flatShading />
          </mesh>
          <mesh position={[0.068, 0.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.042, 0.065, 4]} />
            <meshStandardMaterial color="#283040" roughness={0.52} flatShading />
          </mesh>
          <mesh position={[0, 0.18, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.015, 0.045, 4]} />
            <meshStandardMaterial color="#f9c74f" roughness={0.4} flatShading />
          </mesh>
        </group>
      );

    case 'rumoh-aceh':
      // 4 bentuk sederhana: (1) Tiang panggung kayu, (2) Badan rumah adat, (3) Atap pelana tinggi, (4) Ampig/tulayang depan
      return (
        <group>
          <mesh position={[0, 0.03, 0]} castShadow>
            <boxGeometry args={[0.15, 0.055, 0.105]} />
            <meshStandardMaterial color="#5c3d28" roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0, 0.088, 0]} castShadow>
            <boxGeometry args={[0.185, 0.068, 0.125]} />
            <meshStandardMaterial color="#d4a373" roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0, 0.158, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.158, 0.105, 4]} />
            <meshStandardMaterial color={accentColor} roughness={0.6} flatShading />
          </mesh>
          <mesh position={[0, 0.135, 0.066]} castShadow>
            <coneGeometry args={[0.048, 0.055, 3]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.58} flatShading />
          </mesh>
        </group>
      );

    case 'tugu-nol':
      // 4 bentuk sederhana: (1) Alas persegi bertingkat, (2) Pilar kiri, (3) Pilar kanan, (4) Mahkota atas tugu
      return (
        <group>
          <mesh position={[0, 0.02, 0]} castShadow>
            <boxGeometry args={[0.15, 0.038, 0.15]} />
            <meshStandardMaterial color="#d8d4cb" roughness={0.68} flatShading />
          </mesh>
          <mesh position={[-0.028, 0.105, 0]} rotation={[0, 0, -0.08]} castShadow>
            <boxGeometry args={[0.026, 0.145, 0.034]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.58} flatShading />
          </mesh>
          <mesh position={[0.028, 0.105, 0]} rotation={[0, 0, 0.08]} castShadow>
            <boxGeometry args={[0.026, 0.145, 0.034]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.58} flatShading />
          </mesh>
          <mesh position={[0, 0.195, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.055, 0.065, 4]} />
            <meshStandardMaterial color={accentColor} roughness={0.48} flatShading />
          </mesh>
        </group>
      );

    case 'cangkir-kopi':
      // 4 bentuk sederhana: (1) Tatakan segi empat kertas, (2) Badan cangkir bersegi, (3) Gagang siku, (4) Permukaan kopi Gayo
      return (
        <group>
          <mesh position={[0, 0.015, 0]} castShadow>
            <boxGeometry args={[0.15, 0.022, 0.15]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.55} flatShading />
          </mesh>
          <mesh position={[0, 0.076, 0]} rotation={[0, Math.PI / 6, 0]} castShadow>
            <cylinderGeometry args={[0.064, 0.048, 0.1, 6]} />
            <meshStandardMaterial color={accentColor} roughness={0.58} flatShading />
          </mesh>
          <mesh position={[0.068, 0.08, 0]} castShadow>
            <boxGeometry args={[0.032, 0.052, 0.018]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.55} flatShading />
          </mesh>
          <mesh position={[0, 0.128, 0]} rotation={[0, Math.PI / 6, 0]}>
            <cylinderGeometry args={[0.054, 0.054, 0.012, 6]} />
            <meshStandardMaterial color="#3b2314" roughness={0.42} flatShading />
          </mesh>
        </group>
      );

    case 'gendang-rapai':
      // 3 bentuk sederhana: (1) Penyangga kayu, (2) Bingkai rapa'i segi enam miring, (3) Membran kulit tepuk
      return (
        <group>
          <mesh position={[0, 0.022, 0]} castShadow>
            <boxGeometry args={[0.11, 0.032, 0.095]} />
            <meshStandardMaterial color="#5c3d28" roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0, 0.105, 0]} rotation={[0.52, 0, 0]} castShadow>
            <cylinderGeometry args={[0.084, 0.068, 0.054, 6]} />
            <meshStandardMaterial color={accentColor} roughness={0.62} flatShading />
          </mesh>
          <mesh position={[0, 0.118, 0.012]} rotation={[0.52, 0, 0]}>
            <cylinderGeometry args={[0.068, 0.068, 0.036, 6]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.55} flatShading />
          </mesh>
        </group>
      );

    case 'kapal-nelayan':
      // 4 bentuk sederhana: (1) Lambung perahu, (2) Cadik penyeimbang, (3) Tiang layar, (4) Layar segitiga
      return (
        <group>
          <mesh position={[0, 0.035, 0]} castShadow>
            <boxGeometry args={[0.075, 0.045, 0.21]} />
            <meshStandardMaterial color="#6f4e37" roughness={0.72} flatShading />
          </mesh>
          <mesh position={[0, 0.028, 0]} castShadow>
            <boxGeometry args={[0.17, 0.014, 0.09]} />
            <meshStandardMaterial color="#d4a373" roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0, 0.105, 0]} castShadow>
            <boxGeometry args={[0.014, 0.135, 0.014]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.65} flatShading />
          </mesh>
          <mesh position={[0, 0.125, 0.01]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.072, 0.115, 3]} />
            <meshStandardMaterial color={accentColor} roughness={0.58} flatShading />
          </mesh>
        </group>
      );

    case 'tapak-naga':
      // 5 bentuk sederhana: (1) Tebing batu Tapaktuan, (2) Punggung naga 1, (3) Punggung naga 2, (4) Kepala naga, (5) Tanduk emas
      return (
        <group>
          <mesh position={[-0.06, 0.055, 0]} rotation={[0, Math.PI / 5, 0]} castShadow>
            <coneGeometry args={[0.065, 0.11, 4]} />
            <meshStandardMaterial color="#6c757d" roughness={0.82} flatShading />
          </mesh>
          <mesh position={[0.0, 0.075, 0]} rotation={[0, 0, 0.3]} castShadow>
            <boxGeometry args={[0.065, 0.095, 0.042]} />
            <meshStandardMaterial color={accentColor} roughness={0.52} flatShading />
          </mesh>
          <mesh position={[0.055, 0.065, 0]} rotation={[0, 0, -0.25]} castShadow>
            <boxGeometry args={[0.055, 0.08, 0.038]} />
            <meshStandardMaterial color="#43aa8b" roughness={0.55} flatShading />
          </mesh>
          <mesh position={[0.085, 0.135, 0]} castShadow>
            <boxGeometry args={[0.058, 0.044, 0.044]} />
            <meshStandardMaterial color={accentColor} roughness={0.5} flatShading />
          </mesh>
          <mesh position={[0.078, 0.178, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.024, 0.055, 4]} />
            <meshStandardMaterial color="#f9c74f" roughness={0.48} flatShading />
          </mesh>
        </group>
      );

    case 'gelombang-smong':
      // 4 bentuk sederhana: (1) Pesisir pulau, (2) Dinding ombak luar, (3) Punggung ombak melengkung, (4) Puncak buih putih datar
      return (
        <group>
          <mesh position={[0, 0.018, 0]} castShadow>
            <boxGeometry args={[0.16, 0.032, 0.14]} />
            <meshStandardMaterial color="#d9c39e" roughness={0.78} flatShading />
          </mesh>
          <mesh position={[-0.02, 0.075, 0]} rotation={[0, 0, -0.25]} castShadow>
            <boxGeometry args={[0.055, 0.11, 0.12]} />
            <meshStandardMaterial color="#1982c4" roughness={0.52} flatShading />
          </mesh>
          <mesh position={[0.018, 0.125, 0]} rotation={[0, 0, -0.58]} castShadow>
            <boxGeometry args={[0.05, 0.09, 0.115]} />
            <meshStandardMaterial color={accentColor} roughness={0.5} flatShading />
          </mesh>
          <mesh position={[0.052, 0.162, 0]} rotation={[0, 0, -0.78]} castShadow>
            <boxGeometry args={[0.055, 0.026, 0.125]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.48} flatShading />
          </mesh>
        </group>
      );

    case 'padi-sigupai':
      // 3 bentuk sederhana: (1) Bulir padi kiri, (2) Bulir padi utama tengah, (3) Bulir padi kanan
      return (
        <group>
          <mesh position={[-0.04, 0.075, 0]} rotation={[0, 0, 0.22]} castShadow>
            <coneGeometry args={[0.03, 0.13, 4]} />
            <meshStandardMaterial color="#e9c46a" roughness={0.62} flatShading />
          </mesh>
          <mesh position={[0, 0.098, 0]} castShadow>
            <coneGeometry args={[0.035, 0.165, 4]} />
            <meshStandardMaterial color={accentColor} roughness={0.58} flatShading />
          </mesh>
          <mesh position={[0.04, 0.075, 0]} rotation={[0, 0, -0.22]} castShadow>
            <coneGeometry args={[0.03, 0.13, 4]} />
            <meshStandardMaterial color="#f9c74f" roughness={0.62} flatShading />
          </mesh>
        </group>
      );

    case 'rebana-melayu':
      // 3 bentuk sederhana: (1) Alas songket persegi, (2) Badan rebana segi enam miring, (3) Membran tepuk putih
      return (
        <group>
          <mesh position={[0, 0.018, 0]} castShadow>
            <boxGeometry args={[0.14, 0.028, 0.14]} />
            <meshStandardMaterial color="#f9c74f" roughness={0.55} flatShading />
          </mesh>
          <mesh position={[0, 0.088, 0]} rotation={[0.52, 0, 0]} castShadow>
            <cylinderGeometry args={[0.072, 0.056, 0.048, 6]} />
            <meshStandardMaterial color={accentColor} roughness={0.6} flatShading />
          </mesh>
          <mesh position={[0, 0.098, 0.01]} rotation={[0.52, 0, 0]}>
            <cylinderGeometry args={[0.058, 0.058, 0.032, 6]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.5} flatShading />
          </mesh>
        </group>
      );

    case 'gong-alas':
    default:
      // 3 bentuk sederhana: (1) Gawang kayu penyangga, (2) Lempeng gong segi enam, (3) Pencu piramida emas di tengah
      return (
        <group>
          <mesh position={[0, 0.09, 0]} castShadow>
            <boxGeometry args={[0.175, 0.165, 0.022]} />
            <meshStandardMaterial color="#6f4e37" roughness={0.78} flatShading />
          </mesh>
          <mesh position={[0, 0.09, 0.018]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.064, 0.064, 0.024, 6]} />
            <meshStandardMaterial color={accentColor} roughness={0.45} metalness={0.25} flatShading />
          </mesh>
          <mesh position={[0, 0.09, 0.036]} rotation={[Math.PI / 2, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.026, 0.025, 4]} />
            <meshStandardMaterial color="#f9c74f" roughness={0.35} metalness={0.35} flatShading />
          </mesh>
        </group>
      );
  }
}

function SingleLandmark({
  anchor,
  index,
  reducedMotion
}: {
  anchor: LandmarkAnchor;
  index: number;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const currentYRef = useRef(BASE_EXTRUDE_HEIGHT + 0.06);
  const currentScaleRef = useRef(1);
  const [directTouch, setDirectTouch] = useState(false);

  const region = REGION_BY_ID[anchor.id];
  const kind: JenisLandmark = region ? region.landmark : 'rumoh-aceh';
  const color = region ? region.warna : '#2ec4b6';

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const state = useAcehStore.getState();
    const isHovered = state.hoveredRegionId === anchor.id || directTouch;
    const isActive = state.activeRegionId === anchor.id;
    const hasSelection = state.activeRegionId !== null;

    let targetLift = 0;
    if (isActive) {
      targetLift = HOVER_EXTRUDE_OFFSET + 0.18;
    } else if (isHovered) {
      targetLift = HOVER_EXTRUDE_OFFSET + 0.07;
    } else if (hasSelection) {
      targetLift = -0.06;
    }

    const t = clock.elapsedTime;
    const floatOffset = reducedMotion ? 0 : Math.sin(t * 2.1 + index * 0.7) * 0.028;
    const targetY = BASE_EXTRUDE_HEIGHT + 0.055 + targetLift + floatOffset;

    const targetScale = directTouch
      ? 1.56
      : isActive
        ? 1.48
        : isHovered
          ? 1.36
          : hasSelection
            ? 0.86
            : 1.04;

    const step = Math.min(1, delta * 10);
    currentYRef.current = THREE.MathUtils.lerp(currentYRef.current, targetY, step);
    currentScaleRef.current = THREE.MathUtils.lerp(currentScaleRef.current, targetScale, step);

    groupRef.current.position.set(
      anchor.centroid[0],
      currentYRef.current,
      anchor.centroid[1]
    );
    groupRef.current.scale.setScalar(currentScaleRef.current);

    if (!reducedMotion) {
      groupRef.current.rotation.y = Math.sin(t * 0.9 + index) * 0.28;
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setDirectTouch(true);
    const store = useAcehStore.getState();
    if (store.hoveredRegionId !== anchor.id) {
      store.setHoveredRegion(anchor.id);
      audioEngine.playHoverTick();
    }
    store.setHoverPointer(e.clientX, e.clientY);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    useAcehStore.getState().setHoverPointer(e.clientX, e.clientY);
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setDirectTouch(false);
    const store = useAcehStore.getState();
    if (store.hoveredRegionId === anchor.id) {
      store.setHoveredRegion(null);
      document.body.style.cursor = 'auto';
    }
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const store = useAcehStore.getState();
    store.selectRegion(anchor.id);
    store.triggerRipple(anchor.centroid[0], anchor.centroid[1], color);
    audioEngine.playRegionClick(anchor.id);
  };

  return (
    <group
      ref={groupRef}
      position={[anchor.centroid[0], BASE_EXTRUDE_HEIGHT + 0.055, anchor.centroid[1]]}
      onPointerOver={handlePointerOver}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <LandmarkPrimitives kind={kind} accentColor={color} />
    </group>
  );
}

export default function Landmarks({
  anchors,
  reducedMotion
}: {
  anchors: LandmarkAnchor[];
  reducedMotion: boolean;
}) {
  const uniqueAnchors = useMemo(() => {
    const seen = new Set<string>();
    return anchors.filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  }, [anchors]);

  return (
    <group name="aceh-landmarks">
      {uniqueAnchors.map((anchor, idx) => (
        <SingleLandmark
          key={anchor.id}
          anchor={anchor}
          index={idx}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
}
