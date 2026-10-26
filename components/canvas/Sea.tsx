'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { THEME_COLORS } from '@/lib/colors';

interface BoatRoute {
  centerX: number;
  centerZ: number;
  radiusX: number;
  radiusZ: number;
  speed: number;
  phase: number;
  sailColor: string;
}

const BOAT_ROUTES: BoatRoute[] = [
  { centerX: -3.2, centerZ: -3.8, radiusX: 1.4, radiusZ: 0.7, speed: 0.22, phase: 0.0, sailColor: '#2ec4b6' },
  { centerX: 2.1, centerZ: -2.4, radiusX: 1.8, radiusZ: 0.8, speed: 0.18, phase: 2.1, sailColor: '#f9c74f' },
  { centerX: -2.6, centerZ: 1.9, radiusX: 1.5, radiusZ: 1.1, speed: 0.2, phase: 4.2, sailColor: '#48cae4' }
];

export default function Sea({ reducedMotion }: { reducedMotion: boolean }) {
  const seaMeshRef = useRef<THREE.Mesh>(null);
  const boatsGroupRef = useRef<THREE.Group>(null);

  const { seaGeometry, baseZ } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(34, 28, 44, 36);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const orig = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = Math.sin(x * 0.65) * Math.cos(y * 0.65) * 0.055;
      pos.setZ(i, z);
      orig[i] = z;
    }
    geo.computeVertexNormals();
    return { seaGeometry: geo, baseZ: orig };
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
    const mast = new THREE.MeshStandardMaterial({
      color: '#d4c3a3',
      roughness: 0.75,
      flatShading: true
    });
    return { sea, hull, mast };
  }, []);

  useEffect(() => {
    return () => {
      seaGeometry.dispose();
      materials.sea.dispose();
      materials.hull.dispose();
      materials.mast.dispose();
    };
  }, [seaGeometry, materials]);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;

    const pos = seaGeometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const wave =
        Math.sin(x * 0.7 + t * 1.15) * 0.038 +
        Math.cos(y * 0.8 - t * 0.95) * 0.032;
      pos.setZ(i, baseZ[i] * 0.4 + wave);
    }
    pos.needsUpdate = true;

    if (boatsGroupRef.current) {
      boatsGroupRef.current.children.forEach((boat, idx) => {
        const route = BOAT_ROUTES[idx];
        if (!route) return;
        const angle = t * route.speed + route.phase;
        const nx = route.centerX + Math.cos(angle) * route.radiusX;
        const nz = route.centerZ + Math.sin(angle) * route.radiusZ;
        const dx = -Math.sin(angle) * route.radiusX;
        const dz = Math.cos(angle) * route.radiusZ;

        boat.position.set(nx, 0.03 + Math.sin(t * 2.2 + idx) * 0.015, nz);
        boat.rotation.y = Math.atan2(dx, dz);
        boat.rotation.z = Math.sin(t * 2.5 + idx) * 0.06;
      });
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

      {/* Kapal-kapal kecil low-poly berlayar di perairan Aceh */}
      <group ref={boatsGroupRef}>
        {BOAT_ROUTES.map((route, idx) => (
          <group
            key={idx}
            position={[route.centerX + route.radiusX, 0.03, route.centerZ]}
            scale={0.75}
          >
            {/* 1. Lambung perahu */}
            <mesh material={materials.hull} position={[0, 0.025, 0]} castShadow>
              <boxGeometry args={[0.11, 0.05, 0.28]} />
            </mesh>
            {/* 2. Tiang layar */}
            <mesh material={materials.mast} position={[0, 0.13, 0]}>
              <cylinderGeometry args={[0.008, 0.01, 0.2, 6]} />
            </mesh>
            {/* 3. Layar segitiga low-poly */}
            <mesh position={[0, 0.14, 0.02]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[0.085, 0.16, 3]} />
              <meshStandardMaterial color={route.sailColor} roughness={0.65} flatShading />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

