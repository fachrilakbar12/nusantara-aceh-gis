'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { THEME_COLORS } from '@/lib/colors';

interface CloudSpec {
  baseX: number;
  y: number;
  z: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  speed: number;
}

const CLOUD_SPECS: CloudSpec[] = [
  { baseX: -5.2, y: 2.35, z: -4.2, scaleX: 0.72, scaleY: 0.16, scaleZ: 0.42, speed: 0.08 },
  { baseX: -1.4, y: 2.55, z: -4.8, scaleX: 0.9, scaleY: 0.18, scaleZ: 0.48, speed: 0.065 },
  { baseX: 3.1, y: 2.4, z: -3.6, scaleX: 0.78, scaleY: 0.15, scaleZ: 0.44, speed: 0.075 },
  { baseX: -4.5, y: 2.25, z: 1.8, scaleX: 0.68, scaleY: 0.15, scaleZ: 0.38, speed: 0.09 },
  { baseX: 2.6, y: 2.5, z: 2.7, scaleX: 0.85, scaleY: 0.17, scaleZ: 0.46, speed: 0.07 },
  { baseX: 5.0, y: 2.3, z: -0.6, scaleX: 0.64, scaleY: 0.14, scaleZ: 0.36, speed: 0.085 }
];

export default function Clouds({ reducedMotion }: { reducedMotion: boolean }) {
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const birdsGroupRef = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const cloudGeo = useMemo(() => new THREE.DodecahedronGeometry(0.6, 0), []);
  const cloudMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: THEME_COLORS.cloud,
        roughness: 0.88,
        metalness: 0.02,
        flatShading: true
      }),
    []
  );

  const birdGeo = useMemo(() => new THREE.BoxGeometry(0.11, 0.014, 0.045), []);
  const birdMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f3efe6',
        roughness: 0.7,
        flatShading: true
      }),
    []
  );

  useEffect(() => {
    if (!instancedRef.current) return;
    CLOUD_SPECS.forEach((c, i) => {
      dummy.position.set(c.baseX, c.y, c.z);
      dummy.scale.set(c.scaleX, c.scaleY, c.scaleZ);
      dummy.updateMatrix();
      instancedRef.current!.setMatrixAt(i, dummy.matrix);
    });
    instancedRef.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  useEffect(() => {
    return () => {
      cloudGeo.dispose();
      cloudMat.dispose();
      birdGeo.dispose();
      birdMat.dispose();
    };
  }, [cloudGeo, cloudMat, birdGeo, birdMat]);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;

    if (instancedRef.current) {
      CLOUD_SPECS.forEach((c, i) => {
        const driftX = ((c.baseX + 7 + t * c.speed) % 14) - 7;
        const bobY = c.y + Math.sin(t * 0.8 + i * 1.4) * 0.035;
        dummy.position.set(driftX, bobY, c.z);
        dummy.scale.set(c.scaleX, c.scaleY, c.scaleZ);
        dummy.rotation.y = i * 0.6;
        dummy.updateMatrix();
        instancedRef.current!.setMatrixAt(i, dummy.matrix);
      });
      instancedRef.current.instanceMatrix.needsUpdate = true;
    }

    if (birdsGroupRef.current) {
      const cycle = (t * 0.42) % 14;
      const bx = -6.5 + cycle;
      const bz = -2.2 + Math.sin(t * 0.35) * 1.8;
      birdsGroupRef.current.position.set(bx, 1.85 + Math.sin(t * 1.5) * 0.08, bz);

      birdsGroupRef.current.children.forEach((bird, idx) => {
        const flap = Math.sin(t * 7.5 + idx * 1.2) * 0.42;
        const leftWing = bird.children[0];
        const rightWing = bird.children[1];
        if (leftWing) leftWing.rotation.z = flap;
        if (rightWing) rightWing.rotation.z = -flap;
      });
    }
  });

  return (
    <group name="aceh-clouds-and-birds">
      <instancedMesh
        ref={instancedRef}
        args={[cloudGeo, cloudMat, CLOUD_SPECS.length]}
        castShadow
      />

      {/* Kawanan kecil 3 burung low-poly melintas pelan */}
      <group ref={birdsGroupRef} position={[-4, 1.85, -2]}>
        {[
          [0, 0, 0],
          [-0.22, 0.05, 0.18],
          [-0.18, -0.03, -0.2]
        ].map((offset, idx) => (
          <group key={idx} position={offset as [number, number, number]}>
            <mesh
              geometry={birdGeo}
              material={birdMat}
              position={[-0.05, 0, 0]}
            />
            <mesh
              geometry={birdGeo}
              material={birdMat}
              position={[0.05, 0, 0]}
            />
          </group>
        ))}
      </group>
    </group>
  );
}

