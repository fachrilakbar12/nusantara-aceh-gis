'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { THEME_COLORS } from '@/lib/colors';
import { getRegionCentroid } from '@/lib/geo';
import { useAcehStore } from '@/lib/store';

interface BoatRoute {
  centerX: number;
  centerZ: number;
  radiusX: number;
  radiusZ: number;
  speed: number;
  phase: number;
  sailColor: string;
}

interface FoamStripData {
  x: number;
  z: number;
  length: number;
  width: number;
  angle: number;
  speed: number;
  phase: number;
  driftAmp: number;
}

const BOAT_ROUTES: BoatRoute[] = [
  { centerX: -3.5, centerZ: -4.1, radiusX: 1.35, radiusZ: 0.65, speed: 0.24, phase: 0.0, sailColor: '#2ec4b6' },
  { centerX: 1.9, centerZ: -2.8, radiusX: 1.75, radiusZ: 0.75, speed: 0.19, phase: 1.6, sailColor: '#f9c74f' },
  { centerX: -2.9, centerZ: 1.8, radiusX: 1.45, radiusZ: 1.05, speed: 0.21, phase: 3.1, sailColor: '#48cae4' },
  { centerX: 3.8, centerZ: 0.3, radiusX: 1.15, radiusZ: 0.85, speed: 0.22, phase: 4.4, sailColor: '#ff6b6b' },
  { centerX: -2.4, centerZ: 4.3, radiusX: 1.25, radiusZ: 0.68, speed: 0.2, phase: 2.3, sailColor: '#06d6a0' },
  { centerX: 0.4, centerZ: 4.6, radiusX: 1.4, radiusZ: 0.6, speed: 0.17, phase: 5.2, sailColor: '#ffb347' }
];

// Garis datar buih putih di sekitar pesisir Aceh, Sabang, Simeulue, dan laut lepas
const FOAM_STRIPS: FoamStripData[] = [
  { x: -3.9, z: -4.4, length: 0.52, width: 0.036, angle: 0.35, speed: 1.4, phase: 0.2, driftAmp: 0.09 },
  { x: -3.1, z: -4.0, length: 0.64, width: 0.038, angle: -0.2, speed: 1.2, phase: 1.1, driftAmp: 0.08 },
  { x: -4.3, z: -3.5, length: 0.48, width: 0.034, angle: 0.65, speed: 1.5, phase: 2.4, driftAmp: 0.09 },
  { x: -1.6, z: -3.2, length: 0.75, width: 0.04, angle: -0.18, speed: 1.1, phase: 0.8, driftAmp: 0.1 },
  { x: 0.2, z: -2.7, length: 0.68, width: 0.038, angle: -0.32, speed: 1.3, phase: 1.9, driftAmp: 0.1 },
  { x: 1.8, z: -1.9, length: 0.72, width: 0.04, angle: -0.52, speed: 1.25, phase: 3.0, driftAmp: 0.09 },
  { x: 3.1, z: -0.6, length: 0.62, width: 0.036, angle: -0.68, speed: 1.15, phase: 4.1, driftAmp: 0.09 },
  { x: 3.7, z: 0.9, length: 0.56, width: 0.035, angle: -0.8, speed: 1.35, phase: 2.7, driftAmp: 0.08 },
  { x: -3.4, z: -1.6, length: 0.7, width: 0.04, angle: 0.72, speed: 1.3, phase: 0.5, driftAmp: 0.11 },
  { x: -2.4, z: -0.4, length: 0.66, width: 0.038, angle: 0.68, speed: 1.4, phase: 1.7, driftAmp: 0.1 },
  { x: -1.3, z: 0.8, length: 0.74, width: 0.042, angle: 0.64, speed: 1.2, phase: 2.9, driftAmp: 0.11 },
  { x: -0.1, z: 2.1, length: 0.68, width: 0.038, angle: 0.6, speed: 1.35, phase: 3.8, driftAmp: 0.1 },
  { x: 0.9, z: 3.4, length: 0.62, width: 0.036, angle: 0.52, speed: 1.25, phase: 4.9, driftAmp: 0.09 },
  { x: -2.3, z: 3.5, length: 0.58, width: 0.038, angle: 0.45, speed: 1.5, phase: 0.4, driftAmp: 0.1 },
  { x: -1.5, z: 4.5, length: 0.65, width: 0.04, angle: 0.38, speed: 1.4, phase: 1.6, driftAmp: 0.1 },
  { x: -0.9, z: 3.6, length: 0.5, width: 0.035, angle: -0.4, speed: 1.3, phase: 2.8, driftAmp: 0.08 },
  { x: -4.8, z: 0.5, length: 0.55, width: 0.032, angle: 0.25, speed: 1.0, phase: 1.2, driftAmp: 0.12 },
  { x: -4.2, z: 2.6, length: 0.6, width: 0.034, angle: 0.3, speed: 1.1, phase: 3.4, driftAmp: 0.12 },
  { x: 2.6, z: -3.8, length: 0.52, width: 0.032, angle: -0.25, speed: 1.05, phase: 2.1, driftAmp: 0.11 },
  { x: 4.5, z: -2.1, length: 0.58, width: 0.034, angle: -0.35, speed: 1.15, phase: 4.5, driftAmp: 0.11 }
];

// Titik-titik jahitan kertas untuk Jalur Pelayaran Kepulauan Aceh
const MARITIME_STITCHES: { x: number; z: number; angle: number }[] = [
  // Jalur 1: Banda Aceh <-> Pulau Weh (Sabang)
  { x: -3.62, z: -3.82, angle: -0.2 },
  { x: -3.65, z: -4.02, angle: -0.15 },
  { x: -3.67, z: -4.22, angle: -0.1 },
  // Jalur 2: Aceh Barat / Aceh Selatan <-> Pulau Simeulue
  { x: -1.75, z: 1.85, angle: -0.15 },
  { x: -1.72, z: 2.25, angle: -0.12 },
  { x: -1.68, z: 2.65, angle: -0.1 },
  { x: -1.62, z: 3.05, angle: -0.08 },
  { x: -1.56, z: 3.45, angle: -0.05 },
  // Jalur 3: Aceh Singkil <-> Pulau Banyak / Simeulue
  { x: 0.55, z: 4.55, angle: 1.15 },
  { x: 0.12, z: 4.42, angle: 1.18 },
  { x: -0.32, z: 4.28, angle: 1.2 },
  { x: -0.78, z: 4.16, angle: 1.22 }
];

export default function Sea({ reducedMotion }: { reducedMotion: boolean }) {
  const seaMeshRef = useRef<THREE.Mesh>(null);
  const boatsGroupRef = useRef<THREE.Group>(null);
  const foamGroupRef = useRef<THREE.Group>(null);
  const compassRef = useRef<THREE.Group>(null);
  const smongGroupRef = useRef<THREE.Group>(null);
  const smongWave1Ref = useRef<THREE.Group>(null);
  const smongWave2Ref = useRef<THREE.Group>(null);
  const smongIntensityRef = useRef(0);

  const { seaGeometry, cartographicGridGeo } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(34, 28, 1, 1);
    geo.computeVertexNormals();

    // Grid kartografi laut (garis lintang, bujur, dan garis mata angin kompas)
    const gridVerts: number[] = [];
    const gridY = 0.012;
    for (let x = -6.0; x <= 6.0; x += 1.5) {
      gridVerts.push(x, gridY, -5.0, x, gridY, 5.2);
    }
    for (let z = -4.5; z <= 4.5; z += 1.5) {
      gridVerts.push(-6.4, gridY, z, 6.4, gridY, z);
    }
    // Garis sinar mata angin dari Kompas (-4.5, 2.1)
    const cx = -4.5;
    const cz = 2.1;
    for (let a = 0; a < 8; a++) {
      const ang = (a * Math.PI) / 4;
      gridVerts.push(
        cx + Math.cos(ang) * 0.65,
        gridY + 0.004,
        cz + Math.sin(ang) * 0.65,
        cx + Math.cos(ang) * 2.4,
        gridY + 0.004,
        cz + Math.sin(ang) * 2.4
      );
    }

    const gGeo = new THREE.BufferGeometry();
    gGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridVerts, 3));

    return { seaGeometry: geo, cartographicGridGeo: gGeo };
  }, []);

  const materials = useMemo(() => {
    const sea = new THREE.MeshStandardMaterial({
      color: THEME_COLORS.sea,
      roughness: 0.72,
      metalness: 0.12,
      flatShading: true
    });
    const hull = new THREE.MeshStandardMaterial({
      color: '#8d5b3c',
      roughness: 0.8,
      flatShading: true
    });
    const outrigger = new THREE.MeshStandardMaterial({
      color: '#c89b6e',
      roughness: 0.78,
      flatShading: true
    });
    const mast = new THREE.MeshStandardMaterial({
      color: '#f3efe6',
      roughness: 0.7,
      flatShading: true
    });
    const foam = new THREE.MeshStandardMaterial({
      color: '#f3efe6',
      roughness: 0.65,
      metalness: 0.02,
      flatShading: true
    });
    const stitch = new THREE.MeshStandardMaterial({
      color: '#f9c74f',
      roughness: 0.55,
      flatShading: true
    });
    const frameDark = new THREE.MeshStandardMaterial({
      color: '#121d33',
      roughness: 0.82,
      flatShading: true
    });
    const frameRim = new THREE.MeshStandardMaterial({
      color: '#1e3054',
      roughness: 0.72,
      flatShading: true
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: '#f9c74f',
      roughness: 0.45,
      metalness: 0.2,
      flatShading: true
    });
    const tealMat = new THREE.MeshStandardMaterial({
      color: '#2ec4b6',
      roughness: 0.55,
      flatShading: true
    });
    const gridLineMat = new THREE.LineBasicMaterial({
      color: '#294370',
      transparent: true,
      opacity: 0.45
    });
    const smongDeep = new THREE.MeshStandardMaterial({
      color: '#1982c4',
      roughness: 0.58,
      metalness: 0.08,
      flatShading: true
    });
    const smongCrest = new THREE.MeshStandardMaterial({
      color: '#48cae4',
      roughness: 0.52,
      metalness: 0.06,
      flatShading: true
    });
    return {
      sea,
      hull,
      outrigger,
      mast,
      foam,
      stitch,
      frameDark,
      frameRim,
      goldMat,
      tealMat,
      gridLineMat,
      smongDeep,
      smongCrest
    };
  }, []);

  useEffect(() => {
    return () => {
      seaGeometry.dispose();
      cartographicGridGeo.dispose();
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [seaGeometry, cartographicGridGeo, materials]);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const state = useAcehStore.getState();
    const isSimeulueSelected = state.activeRegionId === 'simeulue';

    // Sesuaikan warna laut berdasarkan mode pencahayaan
    const targetSeaColor =
      state.lightingMode === 'siang'
        ? '#173863'
        : state.lightingMode === 'senja'
          ? '#14223d'
          : THEME_COLORS.sea;
    materials.sea.color.lerp(new THREE.Color(targetSeaColor), Math.min(1, dt * 4));

    if (!reducedMotion) {
      if (seaMeshRef.current) {
        seaMeshRef.current.position.y = Math.sin(t * 0.7) * 0.008;
      }

      if (compassRef.current) {
        compassRef.current.rotation.y = Math.sin(t * 0.35) * 0.12;
      }

      if (boatsGroupRef.current) {
        boatsGroupRef.current.children.forEach((boat, idx) => {
          const route = BOAT_ROUTES[idx];
          if (!route) return;
          const angle = t * route.speed + route.phase;
          const nx = route.centerX + Math.cos(angle) * route.radiusX;
          const nz = route.centerZ + Math.sin(angle) * route.radiusZ;
          const dx = -Math.sin(angle) * route.radiusX;
          const dz = Math.cos(angle) * route.radiusZ;

          boat.position.set(nx, 0.032 + Math.sin(t * 2.2 + idx) * 0.015, nz);
          boat.rotation.y = Math.atan2(dx, dz);
          boat.rotation.z = Math.sin(t * 2.5 + idx) * 0.06;
        });
      }

      if (foamGroupRef.current) {
        foamGroupRef.current.children.forEach((strip, idx) => {
          const cfg = FOAM_STRIPS[idx];
          if (!cfg) return;
          const waveCycle = Math.sin(t * cfg.speed + cfg.phase);
          const nx = cfg.x + Math.cos(cfg.angle) * waveCycle * cfg.driftAmp;
          const nz = cfg.z + Math.sin(cfg.angle) * waveCycle * cfg.driftAmp;
          strip.position.set(nx, 0.024 + waveCycle * 0.012, nz);
          const scaleX = 0.82 + 0.25 * (0.5 + 0.5 * Math.cos(t * cfg.speed * 1.2 + cfg.phase));
          strip.scale.set(scaleX, 1, 1);
        });
      }
    }

    // Animasi Ombak Besar Smong di Simeulue saat wilayah Simeulue dibuka
    const targetSmong = isSimeulueSelected ? 1 : 0;
    smongIntensityRef.current = THREE.MathUtils.lerp(
      smongIntensityRef.current,
      targetSmong,
      Math.min(1, dt * 5)
    );

    if (smongGroupRef.current) {
      const simeulueCenter = getRegionCentroid('simeulue') || [-1.51, 4.05];
      smongGroupRef.current.position.set(simeulueCenter[0], 0.01, simeulueCenter[1]);
      const intensity = smongIntensityRef.current;
      smongGroupRef.current.visible = intensity > 0.01;
      smongGroupRef.current.scale.set(1, Math.max(0.01, intensity), 1);

      if (intensity > 0.01) {
        const cycle1 = reducedMotion ? 0.55 : (t * 0.55) % 1;
        const cycle2 = reducedMotion ? 0.15 : (t * 0.55 + 0.5) % 1;

        const updateWaveTrain = (waveGroup: THREE.Group | null, phase01: number) => {
          if (!waveGroup) return;
          const startX = -0.98;
          const startZ = 0.68;
          const endX = -0.24;
          const endZ = 0.16;

          const wx = THREE.MathUtils.lerp(startX, endX, phase01);
          const wz = THREE.MathUtils.lerp(startZ, endZ, phase01);
          const crestEnvelope = Math.sin(phase01 * Math.PI);

          waveGroup.position.set(wx, crestEnvelope * 0.05, wz);
          waveGroup.scale.set(
            0.85 + crestEnvelope * 0.35,
            0.35 + crestEnvelope * 1.15,
            0.85 + crestEnvelope * 0.25
          );
        };

        updateWaveTrain(smongWave1Ref.current, cycle1);
        updateWaveTrain(smongWave2Ref.current, cycle2);
      }
    }
  });

  return (
    <group name="aceh-sea">
      <mesh
        ref={seaMeshRef}
        geometry={seaGeometry}
        material={materials.sea}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
      />

      {/* Grid Kartografi Laut & Garis Sinar Mata Angin */}
      <lineSegments geometry={cartographicGridGeo} material={materials.gridLineMat} />

      {/* Bingkai Meja Maket Pameran (Diorama Exhibition Frame) */}
      <group name="diorama-exhibition-frame" position={[0, 0.02, 0]}>
        {/* Balok Bingkai Utara & Selatan */}
        <mesh material={materials.frameDark} position={[0, 0.02, -5.25]} receiveShadow castShadow>
          <boxGeometry args={[13.2, 0.09, 0.22]} />
        </mesh>
        <mesh material={materials.frameDark} position={[0, 0.02, 5.45]} receiveShadow castShadow>
          <boxGeometry args={[13.2, 0.09, 0.22]} />
        </mesh>
        {/* Balok Bingkai Barat & Timur */}
        <mesh material={materials.frameDark} position={[-6.5, 0.02, 0.1]} receiveShadow castShadow>
          <boxGeometry args={[0.22, 0.09, 10.9]} />
        </mesh>
        <mesh material={materials.frameDark} position={[6.5, 0.02, 0.1]} receiveShadow castShadow>
          <boxGeometry args={[0.22, 0.09, 10.9]} />
        </mesh>

        {/* 4 Siku Ornamen Emas di Empat Penjuru Bingkai Maket */}
        {[
          [-6.5, -5.25],
          [6.5, -5.25],
          [-6.5, 5.45],
          [6.5, 5.45]
        ].map(([cx, cz], i) => (
          <mesh key={i} material={materials.goldMat} position={[cx, 0.068, cz]} castShadow>
            <boxGeometry args={[0.38, 0.03, 0.38]} />
          </mesh>
        ))}
      </group>

      {/* Kompas Mata Angin Kertas 3D (Compass Rose) di Samudra Hindia */}
      <group ref={compassRef} position={[-4.5, 0.035, 2.1]} name="compass-rose-3d">
        {/* Pelat segi-delapan dasar kompas */}
        <mesh material={materials.frameRim} position={[0, 0.01, 0]} receiveShadow>
          <boxGeometry args={[0.78, 0.02, 0.78]} />
        </mesh>
        <mesh
          material={materials.frameDark}
          position={[0, 0.02, 0]}
          rotation={[0, Math.PI / 4, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.72, 0.022, 0.72]} />
        </mesh>
        {/* Jarum Bintang Mata Angin Utara-Selatan & Barat-Timur */}
        <mesh material={materials.goldMat} position={[0, 0.042, 0]} castShadow>
          <boxGeometry args={[0.14, 0.035, 1.05]} />
        </mesh>
        <mesh material={materials.goldMat} position={[0, 0.042, 0]} castShadow>
          <boxGeometry args={[1.05, 0.035, 0.14]} />
        </mesh>
        {/* Jarum Diagonal */}
        <mesh
          material={materials.tealMat}
          position={[0, 0.034, 0]}
          rotation={[0, Math.PI / 4, 0]}
          castShadow
        >
          <boxGeometry args={[0.1, 0.028, 0.78]} />
        </mesh>
        <mesh
          material={materials.tealMat}
          position={[0, 0.034, 0]}
          rotation={[0, Math.PI / 4, 0]}
          castShadow
        >
          <boxGeometry args={[0.78, 0.028, 0.1]} />
        </mesh>
        {/* Puncak Piramida Penunjuk Utara */}
        <mesh
          material={materials.foam}
          position={[0, 0.075, -0.45]}
          rotation={[0, Math.PI / 4, 0]}
          castShadow
        >
          <coneGeometry args={[0.09, 0.09, 4]} />
        </mesh>
      </group>

      {/* Jalur Pelayaran Kepulauan (Garis Putus-Putus Kertas Emas) */}
      <group name="maritime-stitch-routes">
        {MARITIME_STITCHES.map((st, idx) => (
          <mesh
            key={idx}
            material={materials.stitch}
            position={[st.x, 0.028, st.z]}
            rotation={[0, st.angle, 0]}
          >
            <boxGeometry args={[0.032, 0.014, 0.13]} />
          </mesh>
        ))}
      </group>

      {/* Buih putih berupa garis datar di pesisir dan permukaan laut */}
      <group ref={foamGroupRef} name="sea-foam-lines">
        {FOAM_STRIPS.map((cfg, idx) => (
          <mesh
            key={idx}
            material={materials.foam}
            position={[cfg.x, 0.024, cfg.z]}
            rotation={[0, cfg.angle, 0]}
          >
            <boxGeometry args={[cfg.length, 0.012, cfg.width]} />
          </mesh>
        ))}
      </group>

      {/* Kapal-kapal nelayan bercadik berlayar di perairan Aceh */}
      <group ref={boatsGroupRef} name="fishing-boats">
        {BOAT_ROUTES.map((route, idx) => (
          <group
            key={idx}
            position={[route.centerX + route.radiusX, 0.032, route.centerZ]}
            scale={0.78}
          >
            <mesh material={materials.hull} position={[0, 0.026, 0]} castShadow>
              <boxGeometry args={[0.1, 0.05, 0.29]} />
            </mesh>
            <mesh material={materials.outrigger} position={[0, 0.02, 0]}>
              <boxGeometry args={[0.24, 0.014, 0.12]} />
            </mesh>
            <mesh material={materials.mast} position={[0, 0.135, 0]}>
              <boxGeometry args={[0.014, 0.21, 0.014]} />
            </mesh>
            <mesh position={[0, 0.145, 0.02]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[0.09, 0.165, 3]} />
              <meshStandardMaterial color={route.sailColor} roughness={0.62} flatShading />
            </mesh>
          </group>
        ))}
      </group>

      {/* Ombak Besar Smong yang bergerak di Simeulue saat bagian Smong dibuka */}
      <group ref={smongGroupRef} name="simeulue-smong-great-waves" visible={false}>
        {[smongWave1Ref, smongWave2Ref].map((wRef, idx) => (
          <group key={idx} ref={wRef} rotation={[0, 0.62, 0]}>
            <mesh material={materials.smongDeep} position={[0, 0.08, 0]} castShadow>
              <boxGeometry args={[0.18, 0.16, 0.88]} />
            </mesh>
            <mesh
              material={materials.smongCrest}
              position={[0.055, 0.19, 0]}
              rotation={[0, 0, -0.38]}
              castShadow
            >
              <boxGeometry args={[0.14, 0.14, 0.82]} />
            </mesh>
            <mesh
              material={materials.foam}
              position={[0.11, 0.265, 0]}
              rotation={[0, 0, -0.55]}
              castShadow
            >
              <boxGeometry args={[0.09, 0.045, 0.84]} />
            </mesh>
            <mesh material={materials.foam} position={[0.17, 0.022, 0]}>
              <boxGeometry args={[0.05, 0.016, 0.92]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
