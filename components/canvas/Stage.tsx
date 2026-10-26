'use client';

import React, { Component, ReactNode, Suspense, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  Sparkles
} from '@react-three/drei';

class EnvErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }
  render(): ReactNode {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function ProceduralNightEnvironment() {
  return (
    <Environment resolution={128} frames={1} environmentIntensity={0.28}>
      <color attach="background" args={['#05080a']} />
      <Lightformer
        intensity={1.8}
        color="#a8ff60"
        position={[4, 3, -4]}
        scale={[3, 6, 1]}
      />
      <Lightformer
        intensity={1.2}
        color="#38bdf8"
        position={[-4, 2, 2]}
        scale={[4, 4, 1]}
      />
      <Lightformer
        intensity={0.8}
        color="#fff1dc"
        position={[0, 6, 3]}
        scale={[5, 2, 1]}
      />
    </Environment>
  );
}

const PILLARS: { x: number; z: number; radius: number; height: number; neon: boolean }[] = [
  { x: -3.5, z: -4.4, radius: 0.3, height: 9.0, neon: false },
  { x: -1.85, z: -5.4, radius: 0.34, height: 10.0, neon: true },
  { x: -0.35, z: -5.9, radius: 0.26, height: 10.0, neon: false },
  { x: 1.45, z: -5.2, radius: 0.32, height: 10.0, neon: true },
  { x: 3.1, z: -4.1, radius: 0.28, height: 9.0, neon: false },
  { x: 4.55, z: -3.1, radius: 0.32, height: 8.5, neon: true }
];

export default function Stage() {
  const innerRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (innerRingRef.current) {
      const s = 1 + Math.sin(t * 2.2) * 0.004;
      innerRingRef.current.scale.set(s, s, 1);
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = t * 0.08;
    }
  });

  return (
    <group name="stage_environment">
      {/* Fog gelap kebiruan */}
      <fog attach="fog" args={['#05080a', 5.5, 17.5]} />

      {/* Environment preset "night" intensitas rendah dengan fallback prosedural instan */}
      <EnvErrorBoundary fallback={<ProceduralNightEnvironment />}>
        <Suspense fallback={<ProceduralNightEnvironment />}>
          <Environment preset="night" environmentIntensity={0.28} />
        </Suspense>
      </EnvErrorBoundary>

      {/* Pencahayaan Sinematik */}
      <ambientLight intensity={0.32} color="#b8d8e8" />

      {/* Key Light Hangat */}
      <directionalLight
        position={[2.6, 5.2, 3.8]}
        intensity={1.65}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      {/* Rim Light Hijau Neon (#a8ff60) dari Belakang Kanan */}
      <spotLight
        position={[3.2, 3.8, -3.4]}
        intensity={4.2}
        angle={0.65}
        penumbra={0.85}
        color="#a8ff60"
        distance={12}
      />

      {/* Fill Light Teal dari Kiri */}
      <directionalLight
        position={[-3.4, 2.6, 2.2]}
        intensity={1.05}
        color="#2dd4bf"
      />

      {/* Bounce Light dari Cincin Lantai */}
      <pointLight position={[0, 0.35, 1.1]} intensity={0.85} color="#a5f3fc" distance={5.5} />

      {/* Lantai Lingkaran Hitam Glossy dengan MeshReflectorMaterial */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <circleGeometry args={[3.15, 72]} />
        <MeshReflectorMaterial
          blur={[320, 90]}
          resolution={512}
          mixBlur={0.9}
          mixStrength={18}
          roughness={0.26}
          depthScale={1.1}
          minDepthThreshold={0.35}
          maxDepthThreshold={1.35}
          color="#080d11"
          metalness={0.78}
          mirror={0.55}
        />
      </mesh>

      {/* Lantai Dasar Gelap di Luar Panggung */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#040709" roughness={0.55} metalness={0.5} />
      </mesh>

      {/* Bevel Panggung Bundar */}
      <mesh position={[0, -0.032, 0]} receiveShadow>
        <cylinderGeometry args={[3.16, 3.32, 0.06, 72]} />
        <meshStandardMaterial color="#090e13" roughness={0.32} metalness={0.75} />
      </mesh>

      {/* Ring Cahaya Putih-Kebiruan Emissive Berlapis di Lantai */}
      <mesh ref={innerRingRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <torusGeometry args={[2.76, 0.028, 16, 120]} />
        <meshStandardMaterial
          color="#eefbff"
          emissive="#bfefff"
          emissiveIntensity={2.8}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={outerRingRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <torusGeometry args={[2.95, 0.015, 12, 120]} />
        <meshStandardMaterial
          color="#a8ff60"
          emissive="#a8ff60"
          emissiveIntensity={1.65}
          toneMapped={false}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <torusGeometry args={[2.52, 0.008, 10, 100]} />
        <meshStandardMaterial
          color="#7dd3fc"
          emissive="#38bdf8"
          emissiveIntensity={1.35}
          toneMapped={false}
        />
      </mesh>

      {/* Shadow Lembut di Bawah Karakter */}
      <ContactShadows
        position={[0, 0.004, 0]}
        opacity={0.68}
        scale={4.8}
        blur={2.1}
        far={2.6}
        resolution={512}
        color="#020406"
      />

      {/* Partikel Debu Melayang (drei Sparkles) */}
      <Sparkles
        count={110}
        scale={[7.5, 4.6, 6.5]}
        position={[0, 2.1, 0]}
        size={1.6}
        speed={0.28}
        opacity={0.55}
        color="#c6ff94"
      />
      <Sparkles
        count={65}
        scale={[8.5, 4.2, 6.5]}
        position={[0, 1.8, -1]}
        size={1.2}
        speed={0.18}
        opacity={0.4}
        color="#bae6fd"
      />

      {/* Kolom / Pilar Siluet Gelap di Belakang dengan Vertical Light Streak */}
      {PILLARS.map((p, idx) => (
        <group key={idx} position={[p.x, p.height * 0.42, p.z]}>
          <mesh receiveShadow>
            <cylinderGeometry args={[p.radius, p.radius, p.height, 24]} />
            <meshStandardMaterial color="#080c10" roughness={0.42} metalness={0.68} />
          </mesh>
          {/* Vertical Light Streak */}
          <mesh
            position={[
              p.x < 0 ? p.radius * 0.85 : -p.radius * 0.85,
              0,
              p.radius * 0.85
            ]}
          >
            <boxGeometry args={[0.028, p.height * 0.78, 0.028]} />
            <meshStandardMaterial
              color={p.neon ? '#a8ff60' : '#dcfce7'}
              emissive={p.neon ? '#a8ff60' : '#7dd3fc'}
              emissiveIntensity={2.2}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {/* Barisan Balok Cahaya Bertingkat di Kiri Belakang (Mirip Referensi Gambar 2) */}
      <group position={[-3.35, 0.25, -2.55]} rotation={[0, 0.32, 0]}>
        {[0, 1, 2, 3, 4, 5].map((step) => (
          <mesh
            key={step}
            position={[-step * 0.12, step * 0.22, -step * 0.34]}
          >
            <boxGeometry args={[2.35, 0.055, 0.22]} />
            <meshStandardMaterial
              color="#f0f9ff"
              emissive="#bae6fd"
              emissiveIntensity={1.85 - step * 0.18}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

