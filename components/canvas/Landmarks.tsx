'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
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
    case 'rumoh-aceh':
      // Maksimal 3 bentuk: (1) Kolong tiang kayu, (2) Badan rumah panggung, (3) Atap pelana tinggi
      return (
        <group>
          <mesh position={[0, 0.03, 0]} castShadow>
            <boxGeometry args={[0.14, 0.05, 0.1]} />
            <meshStandardMaterial color="#6f4e37" roughness={0.78} flatShading />
          </mesh>
          <mesh position={[0, 0.085, 0]} castShadow>
            <boxGeometry args={[0.17, 0.065, 0.12]} />
            <meshStandardMaterial color="#c89b6e" roughness={0.72} flatShading />
          </mesh>
          <mesh position={[0, 0.15, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.145, 0.095, 4]} />
            <meshStandardMaterial color={accentColor} roughness={0.62} flatShading />
          </mesh>
        </group>
      );

    case 'tugu-nol':
      // Maksimal 3 bentuk: (1) Alas bundar, (2) Pilar tugu, (3) Cincin angka Nol di puncak
      return (
        <group>
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.085, 0.1, 0.04, 8]} />
            <meshStandardMaterial color="#d8d4cb" roughness={0.68} flatShading />
          </mesh>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.028, 0.05, 0.14, 6]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.58} flatShading />
          </mesh>
          <mesh position={[0, 0.195, 0]} castShadow>
            <torusGeometry args={[0.042, 0.013, 6, 12]} />
            <meshStandardMaterial color={accentColor} roughness={0.5} flatShading />
          </mesh>
        </group>
      );

    case 'cangkir-kopi':
      // Maksimal 3 bentuk: (1) Lepek piring kecil, (2) Badan cangkir/gelas kopi, (3) Permukaan kopi gelap
      return (
        <group>
          <mesh position={[0, 0.015, 0]} castShadow>
            <cylinderGeometry args={[0.095, 0.08, 0.022, 10]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.55} flatShading />
          </mesh>
          <mesh position={[0, 0.075, 0]} castShadow>
            <cylinderGeometry args={[0.062, 0.048, 0.1, 10]} />
            <meshStandardMaterial color={accentColor} roughness={0.58} flatShading />
          </mesh>
          <mesh position={[0, 0.126, 0]}>
            <cylinderGeometry args={[0.054, 0.054, 0.012, 10]} />
            <meshStandardMaterial color="#3b2314" roughness={0.45} flatShading />
          </mesh>
        </group>
      );

    case 'gendang-rapai':
      // Maksimal 3 bentuk: (1) Bingkai kayu bundar, (2) Membran kulit, (3) Penyangga bawah
      return (
        <group>
          <mesh position={[0, 0.02, 0]} castShadow>
            <boxGeometry args={[0.09, 0.03, 0.09]} />
            <meshStandardMaterial color="#5c3d28" roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0, 0.1, 0]} rotation={[0.35, 0, 0]} castShadow>
            <cylinderGeometry args={[0.082, 0.068, 0.055, 10]} />
            <meshStandardMaterial color={accentColor} roughness={0.62} flatShading />
          </mesh>
          <mesh position={[0, 0.112, 0.01]} rotation={[0.35, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.036, 10]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.55} flatShading />
          </mesh>
        </group>
      );

    case 'kapal-nelayan':
      // Maksimal 3 bentuk: (1) Lambung perahu tradisional, (2) Cadik/dek tengah, (3) Layar segitiga
      return (
        <group>
          <mesh position={[0, 0.035, 0]} castShadow>
            <boxGeometry args={[0.08, 0.045, 0.2]} />
            <meshStandardMaterial color="#7c4dff" roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.009, 0.13, 6]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.65} flatShading />
          </mesh>
          <mesh position={[0, 0.12, 0.01]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.068, 0.11, 3]} />
            <meshStandardMaterial color={accentColor} roughness={0.6} flatShading />
          </mesh>
        </group>
      );

    case 'tapak-naga':
      // Maksimal 3 bentuk: (1) Tebing batu karang, (2) Punggung sisik naga hijau zamrud, (3) Puncak tanduk
      return (
        <group>
          <mesh position={[-0.03, 0.045, 0]} castShadow>
            <dodecahedronGeometry args={[0.065, 0]} />
            <meshStandardMaterial color="#6c757d" roughness={0.82} flatShading />
          </mesh>
          <mesh position={[0.03, 0.09, 0]} rotation={[0, 0, 0.25]} castShadow>
            <torusGeometry args={[0.062, 0.022, 6, 9, Math.PI * 1.25]} />
            <meshStandardMaterial color={accentColor} roughness={0.55} flatShading />
          </mesh>
          <mesh position={[0.06, 0.155, 0]} castShadow>
            <coneGeometry args={[0.032, 0.075, 4]} />
            <meshStandardMaterial color="#f4a261" roughness={0.6} flatShading />
          </mesh>
        </group>
      );

    case 'gelombang-smong':
      // Maksimal 3 bentuk: (1) Dasar pulau karang, (2) Lengkung ombak utama, (3) Puncak buih putih
      return (
        <group>
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.085, 0.095, 0.035, 8]} />
            <meshStandardMaterial color="#d9c39e" roughness={0.78} flatShading />
          </mesh>
          <mesh position={[0, 0.095, 0]} rotation={[0, 0, 0.4]} castShadow>
            <torusGeometry args={[0.065, 0.024, 6, 10, Math.PI * 1.15]} />
            <meshStandardMaterial color={accentColor} roughness={0.52} flatShading />
          </mesh>
          <mesh position={[0.04, 0.155, 0]} castShadow>
            <dodecahedronGeometry args={[0.028, 0]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.5} flatShading />
          </mesh>
        </group>
      );

    case 'padi-sigupai':
      // Maksimal 3 bentuk: (1) Tangkai kiri, (2) Tangkai tengah tertinggi, (3) Tangkai kanan emas
      return (
        <group>
          <mesh position={[-0.038, 0.075, 0]} rotation={[0, 0, 0.22]} castShadow>
            <coneGeometry args={[0.03, 0.13, 5]} />
            <meshStandardMaterial color="#e9c46a" roughness={0.62} flatShading />
          </mesh>
          <mesh position={[0, 0.095, 0]} castShadow>
            <coneGeometry args={[0.034, 0.16, 5]} />
            <meshStandardMaterial color={accentColor} roughness={0.58} flatShading />
          </mesh>
          <mesh position={[0.038, 0.075, 0]} rotation={[0, 0, -0.22]} castShadow>
            <coneGeometry args={[0.03, 0.13, 5]} />
            <meshStandardMaterial color="#f9c74f" roughness={0.62} flatShading />
          </mesh>
        </group>
      );

    case 'rebana-melayu':
      // Maksimal 3 bentuk: (1) Alas songket segi delapan, (2) Badan rebana, (3) Keping logam tepi
      return (
        <group>
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.085, 0.095, 0.03, 8]} />
            <meshStandardMaterial color="#f9c74f" roughness={0.55} flatShading />
          </mesh>
          <mesh position={[0, 0.085, 0]} rotation={[0.45, 0, 0]} castShadow>
            <cylinderGeometry args={[0.072, 0.056, 0.048, 8]} />
            <meshStandardMaterial color={accentColor} roughness={0.6} flatShading />
          </mesh>
          <mesh position={[0, 0.095, 0.008]} rotation={[0.45, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.03, 8]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.5} flatShading />
          </mesh>
        </group>
      );

    case 'gong-alas':
    default:
      // Maksimal 3 bentuk: (1) Tiang gawang penyangga, (2) Piringan gong bundar, (3) Pencu tengah
      return (
        <group>
          <mesh position={[0, 0.09, 0]} castShadow>
            <boxGeometry args={[0.17, 0.16, 0.022]} />
            <meshStandardMaterial color="#6f4e37" roughness={0.78} flatShading />
          </mesh>
          <mesh position={[0, 0.09, 0.018]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.062, 0.062, 0.022, 10]} />
            <meshStandardMaterial color={accentColor} roughness={0.45} metalness={0.25} flatShading />
          </mesh>
          <mesh position={[0, 0.09, 0.034]} castShadow>
            <dodecahedronGeometry args={[0.022, 0]} />
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
  const currentYRef = useRef(BASE_EXTRUDE_HEIGHT + 0.04);
  const currentScaleRef = useRef(1);

  const region = REGION_BY_ID[anchor.id];
  const kind: JenisLandmark = region ? region.landmark : 'rumoh-aceh';
  const color = region ? region.warna : '#2ec4b6';

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const state = useAcehStore.getState();
    const isHovered = state.hoveredRegionId === anchor.id;
    const isActive = state.activeRegionId === anchor.id;
    const hasSelection = state.activeRegionId !== null;

    let targetLift = 0;
    if (isActive) {
      targetLift = HOVER_EXTRUDE_OFFSET + 0.08;
    } else if (isHovered) {
      targetLift = HOVER_EXTRUDE_OFFSET;
    } else if (hasSelection) {
      targetLift = -0.06;
    }

    const t = clock.elapsedTime;
    const floatOffset = reducedMotion ? 0 : Math.sin(t * 2.1 + index * 0.7) * 0.025;
    const targetY = BASE_EXTRUDE_HEIGHT + 0.045 + targetLift + floatOffset;

    const targetScale = isActive ? 1.42 : isHovered ? 1.3 : hasSelection ? 0.86 : 1.0;

    const step = Math.min(1, delta * 9);
    currentYRef.current = THREE.MathUtils.lerp(currentYRef.current, targetY, step);
    currentScaleRef.current = THREE.MathUtils.lerp(currentScaleRef.current, targetScale, step);

    groupRef.current.position.set(
      anchor.centroid[0],
      currentYRef.current,
      anchor.centroid[1]
    );
    groupRef.current.scale.setScalar(currentScaleRef.current);

    if (!reducedMotion) {
      groupRef.current.rotation.y = Math.sin(t * 0.9 + index) * 0.25;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[anchor.centroid[0], BASE_EXTRUDE_HEIGHT + 0.045, anchor.centroid[1]]}
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

