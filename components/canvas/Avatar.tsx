'use client';

import React, { Component, ReactNode, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import gsap from 'gsap';
import { CONFIG, EDUCATION_ERAS } from '@/lib/data';
import { useJourneyStore } from '@/lib/store';

// Preload dilakukan setelah verifikasi ukuran file /models/avatar.glb pada useEffect Avatar

interface MorphUniformSet {
  uScanY: { value: number };
  uMode: { value: number }; // 0 = normal, 1 = dissolve (outfit lama), 2 = materialize (outfit baru)
  uProgress: { value: number };
  uFlash: { value: number };
  uGlitch: { value: number };
  uTime: { value: number };
}

/**
 * Suntikkan GLSL noise-dissolve & scan-line clipping ke MeshStandardMaterial
 * menggunakan onBeforeCompile agar pencahayaan & shadow PBR tetap utuh.
 */
function injectOutfitMorphShader(
  sourceMat: THREE.Material,
  uniformSet: MorphUniformSet
): THREE.MeshStandardMaterial {
  const mat = (sourceMat as THREE.MeshStandardMaterial).clone();
  mat.transparent = true;
  mat.depthWrite = true;

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uScanY = uniformSet.uScanY;
    shader.uniforms.uMode = uniformSet.uMode;
    shader.uniforms.uProgress = uniformSet.uProgress;
    shader.uniforms.uFlash = uniformSet.uFlash;
    shader.uniforms.uGlitch = uniformSet.uGlitch;
    shader.uniforms.uTime = uniformSet.uTime;

    shader.vertexShader =
      `
      varying vec3 vMorphWorldPos;
      uniform float uGlitch;
      uniform float uTime;
      ` +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        if (uGlitch > 0.001) {
          float slice = sin(position.y * 28.0 + uTime * 42.0);
          if (slice > 0.65) {
            transformed.x += sin(uTime * 90.0 + position.y * 15.0) * 0.032 * uGlitch;
            transformed.z += cos(uTime * 75.0 + position.y * 12.0) * 0.022 * uGlitch;
          }
        }
        `
      ).replace(
        '#include <worldpos_vertex>',
        `
        #include <worldpos_vertex>
        vec4 morphWp = modelMatrix * vec4(transformed, 1.0);
        vMorphWorldPos = morphWp.xyz;
        `
      );

    shader.fragmentShader =
      `
      varying vec3 vMorphWorldPos;
      uniform float uScanY;
      uniform float uMode;
      uniform float uProgress;
      uniform float uFlash;
      uniform float uTime;

      float hash31(vec3 p) {
        p = fract(p * 0.1031);
        p += dot(p, p.yzx + 33.33);
        return fract((p.x + p.y) * p.z);
      }
      ` +
      shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        #include <dithering_fragment>
        float distToScan = abs(vMorphWorldPos.y - uScanY);
        float scanGlow = smoothstep(0.24, 0.0, distToScan);
        vec3 neonColor = vec3(0.659, 1.0, 0.376); // #a8ff60

        // Mode 1: Outfit lama dissolve dari bawah ke atas + noise alpha
        if (uMode > 0.5 && uMode < 1.5) {
          float n = hash31(floor(vMorphWorldPos * 36.0) + vec3(uTime * 8.0));
          float sweepMask = smoothstep(uScanY - 0.18, uScanY + 0.12, vMorphWorldPos.y);
          if (n > sweepMask || vMorphWorldPos.y < uScanY - 0.14) {
            discard;
          }
          gl_FragColor.rgb = mix(gl_FragColor.rgb, neonColor, scanGlow * 0.85);
        }

        // Mode 2: Outfit baru materialize dari bawah ke atas + emissive flash hijau
        if (uMode > 1.5) {
          float n = hash31(floor(vMorphWorldPos * 38.0));
          if (vMorphWorldPos.y > uScanY + 0.08 || (vMorphWorldPos.y > uScanY - 0.08 && n < 0.45)) {
            discard;
          }
          gl_FragColor.rgb = mix(gl_FragColor.rgb, neonColor, clamp(scanGlow * 0.92 + uFlash * 0.42, 0.0, 1.0));
        }
        `
      );
  };

  mat.needsUpdate = true;
  return mat;
}

/**
 * Custom ShaderMaterial untuk piringan garis scan hijau neon (#a8ff60)
 */
function createScanLaserMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uColor: { value: new THREE.Color('#a8ff60') }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uIntensity;
      uniform vec3 uColor;
      void main() {
        vec2 centered = vUv * 2.0 - 1.0;
        float r = length(centered);
        if (r > 1.0) discard;
        float ring = smoothstep(0.65, 0.96, r) * smoothstep(1.0, 0.92, r);
        float grid = 0.5 + 0.5 * sin(centered.x * 40.0 + uTime * 12.0) * sin(centered.y * 40.0 - uTime * 10.0);
        float core = (1.0 - r) * 0.28 * grid;
        float alpha = (ring * 1.15 + core) * uIntensity;
        gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 1.0));
      }
    `
  });
}

/**
 * ErrorBoundary khusus apabila /models/avatar.glb gagal dimuat atau rusak
 */
class AvatarLoadErrorBoundary extends Component<
  { fallback: ReactNode; onErrorOnce: () => void; children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: ReactNode; onErrorOnce: () => void; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(err: unknown): void {
    console.warn(
      '[Avatar] Gagal memuat /models/avatar.glb, beralih ke Stylized Fallback Avatar:',
      err
    );
    this.props.onErrorOnce();
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Membuat tekstur badge & ID card prosedural untuk outfit
 */
function makeOutfitDetailTexture(kind: 'smp' | 'smk' | 'kuliah'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    if (kind === 'smp') {
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, 128, 160);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 10, 108, 140);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(16, 16, 96, 42);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(64, 104, 24, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'smk') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 128, 160);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 6;
      ctx.strokeRect(5, 5, 118, 150);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(14, 14, 100, 32);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('KETUA OSIS', 64, 35);
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(64, 82, 22, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#181c20';
      ctx.fillRect(0, 0, 128, 160);
      ctx.strokeStyle = '#a8ff60';
      ctx.lineWidth = 6;
      ctx.strokeRect(5, 5, 118, 150);
      ctx.fillStyle = '#166534';
      ctx.fillRect(14, 14, 100, 30);
      ctx.fillStyle = '#a8ff60';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('UNIMAL · TI', 64, 34);
      ctx.fillStyle = '#334155';
      ctx.fillRect(26, 56, 76, 62);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Komponen utama yang merender model /models/avatar.glb dengan useGLTF & useAnimations
 */
function GLBAvatarMesh({
  outfitUniforms,
  scanRingRef,
  scanLaserMat
}: {
  outfitUniforms: MorphUniformSet[];
  scanRingRef: React.RefObject<THREE.Group>;
  scanLaserMat: THREE.ShaderMaterial;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(CONFIG.modelPath, true);
  const { actions, names } = useAnimations(gltf.animations, groupRef);

  const outfitGroupsRef = useRef<(THREE.Object3D[])[]>([[], [], []]);
  const spineBoneRef = useRef<THREE.Object3D | null>(null);
  const headBoneRef = useRef<THREE.Object3D | null>(null);

  // Clone scene dan pasangkan shader morph pada masing-masing grup outfit
  const clonedScene = useMemo(() => {
    const root = gltf.scene.clone(true);
    const foundBody: THREE.Object3D[] = [];
    const foundSMP: THREE.Object3D[] = [];
    const foundSMK: THREE.Object3D[] = [];
    const foundKuliah: THREE.Object3D[] = [];

    root.traverse((obj) => {
      const lower = obj.name.toLowerCase();
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }

      if (!spineBoneRef.current && (lower.includes('spine') || lower.includes('upper') || lower.includes('torso_pivot'))) {
        spineBoneRef.current = obj;
      }
      if (!headBoneRef.current && lower.includes('head')) {
        headBoneRef.current = obj;
      }

      if (lower.includes('outfit_smp') || lower.endsWith('_smp')) {
        foundSMP.push(obj);
      } else if (lower.includes('outfit_smk') || lower.endsWith('_smk')) {
        foundSMK.push(obj);
      } else if (
        lower.includes('outfit_kuliah') ||
        lower.endsWith('_kuliah') ||
        lower.includes('outfit_uni')
      ) {
        foundKuliah.push(obj);
      } else if (lower.includes('body')) {
        foundBody.push(obj);
      }
    });

    if (foundBody.length === 0) {
      console.warn('[Avatar] Mesh "body" tidak ditemukan di avatar.glb (dicek via traverse + includes).');
    }
    if (foundSMP.length === 0) {
      console.warn('[Avatar] Mesh "outfit_smp" tidak ditemukan di avatar.glb.');
    }
    if (foundSMK.length === 0) {
      console.warn('[Avatar] Mesh "outfit_smk" tidak ditemukan di avatar.glb.');
    }
    if (foundKuliah.length === 0) {
      console.warn('[Avatar] Mesh "outfit_kuliah" tidak ditemukan di avatar.glb.');
    }

    const groups = [foundSMP, foundSMK, foundKuliah];
    groups.forEach((list, idx) => {
      list.forEach((node) => {
        node.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh && mesh.material) {
            mesh.material = injectOutfitMorphShader(
              Array.isArray(mesh.material) ? mesh.material[0] : mesh.material,
              outfitUniforms[idx]
            );
          }
        });
      });
    });

    outfitGroupsRef.current = groups;
    return root;
  }, [gltf.scene, outfitUniforms]);

  // Putar animasi idle bawaan GLB jika tersedia
  useEffect(() => {
    if (names.length > 0) {
      const idleName =
        names.find((n) => n.toLowerCase().includes('idle')) || names[0];
      const action = actions[idleName];
      if (action) {
        action.reset().fadeIn(0.4).play();
      }
    }
  }, [actions, names]);

  // Sinkronisasi visibility awal
  useEffect(() => {
    const initialIdx = useJourneyStore.getState().activeEraIndex;
    outfitGroupsRef.current.forEach((nodes, idx) => {
      nodes.forEach((n) => {
        n.visible = idx === initialIdx;
      });
    });
  }, [clonedScene]);

  // Update visibilitas saat morph selesai atau aktif
  useMorphTimeline(outfitGroupsRef, outfitUniforms, scanRingRef, scanLaserMat);

  // Gerakan organik halus (nafas, contrapposto, ayunan kepala natural)
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    outfitUniforms.forEach((u) => {
      u.uTime.value = t;
    });
    scanLaserMat.uniforms.uTime.value = t;

    if (groupRef.current) {
      // Ayunan contrapposto dan pernapasan sangat organik
      groupRef.current.position.y = Math.sin(t * 1.9) * 0.008;
      groupRef.current.rotation.z = Math.sin(t * 0.95) * 0.012;
    }
    if (spineBoneRef.current) {
      const breath = 1 + Math.sin(t * 2.1) * 0.007;
      spineBoneRef.current.scale.set(breath, breath, breath);
      spineBoneRef.current.rotation.x = Math.sin(t * 1.05) * 0.018;
    }
    if (headBoneRef.current) {
      headBoneRef.current.rotation.y =
        Math.sin(t * 0.72) * 0.065 + state.pointer.x * 0.12;
      headBoneRef.current.rotation.x =
        Math.cos(t * 0.58) * 0.025 - state.pointer.y * 0.06;
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={clonedScene} />
    </group>
  );
}

/**
 * Fallback Stylized Avatar (digunakan bila /models/avatar.glb belum ada atau gagal dimuat).
 * Memiliki struktur mesh body, outfit_smp, outfit_smk, outfit_kuliah serta shader morph yang sama.
 */
function StylizedFallbackAvatar({
  outfitUniforms,
  scanRingRef,
  scanLaserMat
}: {
  outfitUniforms: MorphUniformSet[];
  scanRingRef: React.RefObject<THREE.Group>;
  scanLaserMat: THREE.ShaderMaterial;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const spineRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const smpRef = useRef<THREE.Group>(null);
  const smkRef = useRef<THREE.Group>(null);
  const kuliahRef = useRef<THREE.Group>(null);
  const outfitGroupsRef = useRef<(THREE.Object3D[])[]>([[], [], []]);

  const materials = useMemo(() => {
    const skin = new THREE.MeshStandardMaterial({
      color: '#d69c75',
      roughness: 0.62,
      metalness: 0.04
    });
    const hair = new THREE.MeshStandardMaterial({
      color: '#17191e',
      roughness: 0.58,
      metalness: 0.12
    });
    const darkEye = new THREE.MeshStandardMaterial({
      color: '#0b0e12',
      roughness: 0.15
    });
    const white = new THREE.MeshStandardMaterial({
      color: '#f4f6f8',
      roughness: 0.65
    });

    // SMP materials
    const smpShirt = injectOutfitMorphShader(
      new THREE.MeshStandardMaterial({ color: '#f3f5f8', roughness: 0.65 }),
      outfitUniforms[0]
    );
    const smpNavy = injectOutfitMorphShader(
      new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.7 }),
      outfitUniforms[0]
    );
    const smpBadge = injectOutfitMorphShader(
      new THREE.MeshStandardMaterial({ map: makeOutfitDetailTexture('smp'), roughness: 0.5 }),
      outfitUniforms[0]
    );
    const blackShoeSMP = injectOutfitMorphShader(
      new THREE.MeshStandardMaterial({ color: '#14171d', roughness: 0.4, metalness: 0.15 }),
      outfitUniforms[0]
    );

    // SMK materials
    const smkShirt = injectOutfitMorphShader(
      new THREE.MeshStandardMaterial({ color: '#f3f5f8', roughness: 0.65 }),
      outfitUniforms[1]
    );
    const smkGrey = injectOutfitMorphShader(
      new THREE.MeshStandardMaterial({ color: '#6b7280', roughness: 0.7 }),
      outfitUniforms[1]
    );
    const smkGold = injectOutfitMorphShader(
      new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.25, metalness: 0.85 }),
      outfitUniforms[1]
    );
    const smkCard = injectOutfitMorphShader(
      new THREE.MeshStandardMaterial({ map: makeOutfitDetailTexture('smk'), roughness: 0.45 }),
      outfitUniforms[1]
    );
    const blackShoeSMK = injectOutfitMorphShader(
      new THREE.MeshStandardMaterial({ color: '#14171d', roughness: 0.4, metalness: 0.15 }),
      outfitUniforms[1]
    );

    // KULIAH materials
    const uniJacket = injectOutfitMorphShader(
      new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.66 }),
      outfitUniforms[2]
    );
    const uniInner = injectOutfitMorphShader(
      new THREE.MeshStandardMaterial({ color: '#f3f5f8', roughness: 0.65 }),
      outfitUniforms[2]
    );
    const uniChino = injectOutfitMorphShader(
      new THREE.MeshStandardMaterial({ color: '#d6c4a0', roughness: 0.68 }),
      outfitUniforms[2]
    );
    const uniGold = injectOutfitMorphShader(
      new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.25, metalness: 0.88 }),
      outfitUniforms[2]
    );
    const uniCard = injectOutfitMorphShader(
      new THREE.MeshStandardMaterial({ map: makeOutfitDetailTexture('kuliah'), roughness: 0.45 }),
      outfitUniforms[2]
    );
    const converseShoe = injectOutfitMorphShader(
      new THREE.MeshStandardMaterial({ color: '#eceae2', roughness: 0.65 }),
      outfitUniforms[2]
    );

    return {
      skin,
      hair,
      darkEye,
      white,
      smp: { smpShirt, smpNavy, smpBadge, blackShoeSMP },
      smk: { smkShirt, smkGrey, smkGold, smkCard, blackShoeSMK },
      kuliah: { uniJacket, uniInner, uniChino, uniGold, uniCard, converseShoe }
    };
  }, [outfitUniforms]);

  useEffect(() => {
    if (smpRef.current && smkRef.current && kuliahRef.current) {
      outfitGroupsRef.current = [
        [smpRef.current],
        [smkRef.current],
        [kuliahRef.current]
      ];
      const active = useJourneyStore.getState().activeEraIndex;
      smpRef.current.visible = active === 0;
      smkRef.current.visible = active === 1;
      kuliahRef.current.visible = active === 2;
    }
  }, []);

  useMorphTimeline(outfitGroupsRef, outfitUniforms, scanRingRef, scanLaserMat);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    outfitUniforms.forEach((u) => {
      u.uTime.value = t;
    });
    scanLaserMat.uniforms.uTime.value = t;

    if (rootRef.current) {
      rootRef.current.position.y = Math.sin(t * 1.9) * 0.008;
      rootRef.current.rotation.z = -0.01 + Math.sin(t * 0.95) * 0.012;
    }
    if (spineRef.current) {
      const b = 1 + Math.sin(t * 2.1) * 0.006;
      spineRef.current.scale.set(b, b, b);
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.75) * 0.06 + state.pointer.x * 0.12;
      headRef.current.rotation.x = Math.cos(t * 0.6) * 0.025 - state.pointer.y * 0.06;
    }
  });

  return (
    <group ref={rootRef} name="avatar_root">
      {/* BODY & KEPALA */}
      <group ref={spineRef} name="body" position={[0, 1.82, 0]}>
        <mesh position={[0, 0.98, 0.01]} material={materials.skin} castShadow>
          <capsuleGeometry args={[0.088, 0.16, 12, 20]} />
        </mesh>
        {/* Punggung tangan di saku */}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 0.23, -0.1, 0.13]}
            rotation={[0, 0, side * 0.32]}
            material={materials.skin}
            castShadow
          >
            <sphereGeometry args={[0.06, 16, 14]} />
          </mesh>
        ))}

        {/* Kepala & Rambut */}
        <group ref={headRef} name="head" position={[0, 1.24, 0.02]}>
          <mesh material={materials.skin} scale={[0.96, 1.08, 0.98]} castShadow>
            <sphereGeometry args={[0.235, 28, 24]} />
          </mesh>
          <mesh position={[0, -0.085, 0.03]} scale={[0.95, 0.92, 0.9]} material={materials.skin} castShadow>
            <sphereGeometry args={[0.195, 24, 20]} />
          </mesh>
          {/* Mata + Highlight */}
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.082, 0.018, 0.2]} rotation={[0, side * 0.15, 0]}>
              <mesh material={materials.darkEye} scale={[1, 1.04, 0.55]}>
                <sphereGeometry args={[0.029, 16, 14]} />
              </mesh>
              <mesh position={[0.009, 0.01, 0.018]}>
                <sphereGeometry args={[0.008, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              <mesh position={[0, 0.056, 0.005]} rotation={[0, 0, side * -0.08]} material={materials.hair}>
                <boxGeometry args={[0.076, 0.015, 0.02]} />
              </mesh>
            </group>
          ))}
          {/* Hidung & Senyum */}
          <mesh position={[0, -0.025, 0.232]} material={materials.skin}>
            <sphereGeometry args={[0.025, 14, 12]} />
          </mesh>
          <mesh position={[0, -0.095, 0.205]} rotation={[0, 0, Math.PI]} material={materials.white}>
            <torusGeometry args={[0.048, 0.01, 10, 20, Math.PI]} />
          </mesh>
          {/* Volume rambut ikal bergelombang */}
          <mesh position={[0, 0.07, -0.02]} scale={[1.05, 1.02, 1.06]} material={materials.hair} castShadow>
            <sphereGeometry args={[0.24, 22, 18]} />
          </mesh>
          <mesh position={[-0.08, 0.19, 0.11]} rotation={[0.35, 0.25, 0.4]} scale={[0.52, 0.32, 0.58]} material={materials.hair} castShadow>
            <sphereGeometry args={[0.24, 18, 14]} />
          </mesh>
          <mesh position={[0.08, 0.19, 0.11]} rotation={[0.35, -0.25, -0.4]} scale={[0.52, 0.32, 0.58]} material={materials.hair} castShadow>
            <sphereGeometry args={[0.24, 18, 14]} />
          </mesh>
        </group>
      </group>

      {/* OUTFIT 0: SMP — PUTIH BIRU */}
      <group ref={smpRef} name="outfit_smp">
        <mesh position={[0, 2.24, 0.01]} scale={[1.06, 1, 0.74]} material={materials.smp.smpShirt} castShadow receiveShadow>
          <cylinderGeometry args={[0.285, 0.245, 0.92, 24]} />
        </mesh>
        <mesh position={[0.115, 2.38, 0.198]} material={materials.smp.smpBadge}>
          <boxGeometry args={[0.072, 0.088, 0.015]} />
        </mesh>
        {/* Tas ransel biru SMP */}
        <mesh position={[0, 2.28, -0.22]} material={materials.smp.smpNavy} castShadow>
          <boxGeometry args={[0.42, 0.52, 0.18]} />
        </mesh>
        {/* Lengan pendek + lengan kulit */}
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh position={[side * 0.33, 2.42, 0]} rotation={[0, 0, side * -0.18]} material={materials.smp.smpShirt} castShadow>
              <capsuleGeometry args={[0.09, 0.22, 10, 16]} />
            </mesh>
            <mesh position={[side * 0.29, 1.98, 0.05]} rotation={[0.24, 0, side * 0.22]} material={materials.skin} castShadow>
              <capsuleGeometry args={[0.064, 0.42, 10, 16]} />
            </mesh>
            {/* Celana pendek biru dongker + betis + kaos kaki putih */}
            <mesh position={[side * 0.145, 1.32, 0.01]} material={materials.smp.smpNavy} castShadow>
              <capsuleGeometry args={[0.125, 0.46, 12, 18]} />
            </mesh>
            <mesh position={[side * 0.155, 0.82, 0.01]} material={materials.skin} castShadow>
              <capsuleGeometry args={[0.082, 0.34, 10, 16]} />
            </mesh>
            <mesh position={[side * 0.16, 0.36, 0]} material={materials.smp.smpShirt} castShadow>
              <capsuleGeometry args={[0.076, 0.36, 10, 16]} />
            </mesh>
            <mesh position={[side * 0.165, 0.07, 0.05]} rotation={[0, side * -0.15, 0]} scale={[0.78, 0.68, 1.65]} material={materials.smp.blackShoeSMP} castShadow>
              <sphereGeometry args={[0.11, 18, 14]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* OUTFIT 1: SMK — PUTIH ABU-ABU (KETUA OSIS) */}
      <group ref={smkRef} name="outfit_smk">
        <mesh position={[0, 2.24, 0.01]} scale={[1.06, 1, 0.74]} material={materials.smk.smkShirt} castShadow receiveShadow>
          <cylinderGeometry args={[0.285, 0.245, 0.92, 24]} />
        </mesh>
        {/* Dasi + Lanyard KETUA OSIS + Pin Emas */}
        <mesh position={[0, 2.42, 0.2]} material={materials.smk.smkGrey}>
          <boxGeometry args={[0.06, 0.48, 0.018]} />
        </mesh>
        <mesh position={[0.115, 2.48, 0.202]} rotation={[Math.PI / 2, 0, 0]} material={materials.smk.smkGold}>
          <cylinderGeometry args={[0.025, 0.025, 0.012, 16]} />
        </mesh>
        <mesh position={[0, 2.11, 0.218]} material={materials.smk.smkCard}>
          <boxGeometry args={[0.105, 0.145, 0.014]} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh position={[side * 0.33, 2.36, 0]} rotation={[0, 0, side * -0.16]} material={materials.smk.smkShirt} castShadow>
              <capsuleGeometry args={[0.092, 0.34, 10, 16]} />
            </mesh>
            <mesh position={[side * 0.29, 1.94, 0.06]} rotation={[0.26, 0, side * 0.22]} material={materials.skin} castShadow>
              <capsuleGeometry args={[0.064, 0.36, 10, 16]} />
            </mesh>
            {/* Celana panjang abu-abu SMK */}
            <mesh position={[side * 0.152, 0.92, 0.01]} material={materials.smk.smkGrey} castShadow receiveShadow>
              <capsuleGeometry args={[0.118, 1.32, 14, 22]} />
            </mesh>
            <mesh position={[side * 0.165, 0.07, 0.05]} rotation={[0, side * -0.15, 0]} scale={[0.78, 0.68, 1.65]} material={materials.smk.blackShoeSMK} castShadow>
              <sphereGeometry args={[0.11, 18, 14]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* OUTFIT 2: KULIAH — ALMAMATER HIJAU UNIMAL */}
      <group ref={kuliahRef} name="outfit_kuliah">
        <mesh position={[0, 2.24, 0.01]} scale={[1.05, 1, 0.72]} material={materials.kuliah.uniInner} castShadow>
          <cylinderGeometry args={[0.275, 0.24, 0.9, 24]} />
        </mesh>
        {/* Jaket Almamater Hijau Unimal */}
        <mesh position={[0, 2.25, 0.01]} scale={[1.09, 1, 0.77]} material={materials.kuliah.uniJacket} castShadow receiveShadow>
          <cylinderGeometry args={[0.305, 0.268, 0.94, 24, 1, false, Math.PI * 0.14, Math.PI * 1.72]} />
        </mesh>
        {/* Kartu ID + Lanyard Unimal */}
        <mesh position={[0, 2.08, 0.224]} material={materials.kuliah.uniCard}>
          <boxGeometry args={[0.108, 0.15, 0.014]} />
        </mesh>
        {/* Pin/Logo Emas Unimal di dada kiri */}
        <mesh position={[0.15, 2.5, 0.215]} rotation={[Math.PI / 2, 0, 0]} material={materials.kuliah.uniGold}>
          <cylinderGeometry args={[0.032, 0.032, 0.014, 18]} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh position={[side * 0.31, 2.16, 0.04]} rotation={[0.16, 0, side * 0.12]} material={materials.kuliah.uniJacket} castShadow>
              <capsuleGeometry args={[0.094, 0.74, 12, 18]} />
            </mesh>
            {/* Celana Chino Krem */}
            <mesh position={[side * 0.152, 0.92, 0.01]} material={materials.kuliah.uniChino} castShadow receiveShadow>
              <capsuleGeometry args={[0.116, 1.32, 14, 22]} />
            </mesh>
            {/* Sepatu Putih ala Converse */}
            <mesh position={[side * 0.165, 0.07, 0.05]} rotation={[0, side * -0.15, 0]} scale={[0.78, 0.7, 1.68]} material={materials.kuliah.converseShoe} castShadow>
              <sphereGeometry args={[0.11, 18, 14]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/**
 * Hook GSAP timeline untuk animasi Scan-Line Morph (±1 detik):
 * 1. Garis scan hijau neon (#a8ff60) menyapu dari kaki (y = 0) ke kepala (y = 3.55)
 * 2. Outfit lama dissolve (noise-threshold alpha) + glitch jitter
 * 3. Outfit baru materialize dari bawah ke atas dengan emissive flash hijau
 */
function useMorphTimeline(
  outfitGroupsRef: React.MutableRefObject<(THREE.Object3D[])[]>,
  outfitUniforms: MorphUniformSet[],
  scanRingRef: React.RefObject<THREE.Group>,
  scanLaserMat: THREE.ShaderMaterial
): void {
  const activeEraIndex = useJourneyStore((s) => s.activeEraIndex);
  const previousEraIndex = useJourneyStore((s) => s.previousEraIndex);
  const transitionId = useJourneyStore((s) => s.transitionId);
  const setTransitioning = useJourneyStore((s) => s.setTransitioning);

  useEffect(() => {
    if (transitionId === 0) return;

    const groups = outfitGroupsRef.current;
    const fromIdx = previousEraIndex;
    const toIdx = activeEraIndex;

    // Pastikan hanya outfit lama & baru yang visible selama transisi berlangsung
    groups.forEach((nodeList, idx) => {
      nodeList.forEach((n) => {
        n.visible = idx === fromIdx || idx === toIdx;
      });
    });

    const fromU = outfitUniforms[fromIdx];
    const toU = outfitUniforms[toIdx];

    if (fromU) {
      fromU.uMode.value = 1; // Dissolve
      fromU.uScanY.value = -0.1;
      fromU.uProgress.value = 0;
      fromU.uGlitch.value = 1;
    }

    if (toU) {
      toU.uMode.value = 2; // Materialize
      toU.uScanY.value = -0.1;
      toU.uProgress.value = 0;
      toU.uFlash.value = 1;
      toU.uGlitch.value = 0.35;
    }

    if (scanRingRef.current) {
      scanRingRef.current.visible = true;
      scanRingRef.current.position.y = 0.02;
    }
    scanLaserMat.uniforms.uIntensity.value = 0;

    const proxy = {
      scanY: -0.05,
      progress: 0,
      laser: 0,
      flash: 1,
      glitch: 1
    };

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onUpdate: () => {
        if (fromU) {
          fromU.uScanY.value = proxy.scanY;
          fromU.uProgress.value = proxy.progress;
          fromU.uGlitch.value = proxy.glitch;
        }
        if (toU) {
          toU.uScanY.value = proxy.scanY;
          toU.uProgress.value = proxy.progress;
          toU.uFlash.value = proxy.flash;
          toU.uGlitch.value = proxy.glitch * 0.4;
        }
        if (scanRingRef.current) {
          scanRingRef.current.position.y = Math.max(0.02, Math.min(3.55, proxy.scanY));
        }
        scanLaserMat.uniforms.uIntensity.value = proxy.laser;
      },
      onComplete: () => {
        // Setelah morph selesai: hanya outfit aktif yang visible, kembalikan ke mode render standar
        groups.forEach((nodeList, idx) => {
          nodeList.forEach((n) => {
            n.visible = idx === toIdx;
          });
        });
        outfitUniforms.forEach((u) => {
          u.uMode.value = 0;
          u.uFlash.value = 0;
          u.uGlitch.value = 0;
          u.uScanY.value = 4.0;
        });
        if (scanRingRef.current) {
          scanRingRef.current.visible = false;
        }
        scanLaserMat.uniforms.uIntensity.value = 0;
        setTransitioning(false);
      }
    });

    tl.to(
      proxy,
      {
        scanY: 3.65,
        progress: 1,
        duration: CONFIG.timings.morphDuration,
        ease: 'power2.inOut'
      },
      0
    )
      .to(
        proxy,
        {
          laser: 1.35,
          duration: 0.22,
          ease: 'power2.out'
        },
        0
      )
      .to(
        proxy,
        {
          laser: 0,
          duration: 0.32,
          ease: 'power2.in'
        },
        CONFIG.timings.morphDuration - 0.3
      )
      .to(
        proxy,
        {
          flash: 0,
          glitch: 0,
          duration: CONFIG.timings.morphDuration * 0.85,
          ease: 'power2.out'
        },
        0.15
      );

    return () => {
      tl.kill();
    };
  }, [
    transitionId,
    activeEraIndex,
    previousEraIndex,
    outfitGroupsRef,
    outfitUniforms,
    scanRingRef,
    scanLaserMat,
    setTransitioning
  ]);
}

export default function Avatar() {
  const setLoaded = useJourneyStore((s) => s.setLoaded);
  const setUsingFallbackAvatar = useJourneyStore((s) => s.setUsingFallbackAvatar);
  const [glbAvailable, setGlbAvailable] = useState<boolean | null>(null);
  const scanRingRef = useRef<THREE.Group>(null);

  const outfitUniforms = useMemo<MorphUniformSet[]>(
    () =>
      EDUCATION_ERAS.map(() => ({
        uScanY: { value: 4.0 },
        uMode: { value: 0 },
        uProgress: { value: 1 },
        uFlash: { value: 0 },
        uGlitch: { value: 0 },
        uTime: { value: 0 }
      })),
    []
  );

  const scanLaserMat = useMemo(() => createScanLaserMaterial(), []);

  // Cek apakah /models/avatar.glb tersedia dan valid (>100 bytes) agar aman bila file belum ada
  useEffect(() => {
    let active = true;
    fetch(CONFIG.modelPath, { method: 'HEAD' })
      .then((res) => {
        if (!active) return;
        const len = Number(res.headers.get('content-length') || '0');
        const ok = res.ok && len > 100;
        if (ok) {
          useGLTF.preload(CONFIG.modelPath, true);
        }
        setGlbAvailable(ok);
        setUsingFallbackAvatar(!ok);
        setLoaded(true);
      })
      .catch(() => {
        if (!active) return;
        setGlbAvailable(false);
        setUsingFallbackAvatar(true);
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [setLoaded, setUsingFallbackAvatar]);

  const fallbackNode = (
    <StylizedFallbackAvatar
      outfitUniforms={outfitUniforms}
      scanRingRef={scanRingRef}
      scanLaserMat={scanLaserMat}
    />
  );

  return (
    <group position={[0, 0, 0]}>
      {glbAvailable === false ? (
        fallbackNode
      ) : glbAvailable === true ? (
        <AvatarLoadErrorBoundary
          fallback={fallbackNode}
          onErrorOnce={() => setUsingFallbackAvatar(true)}
        >
          <Suspense fallback={fallbackNode}>
            <GLBAvatarMesh
              outfitUniforms={outfitUniforms}
              scanRingRef={scanRingRef}
              scanLaserMat={scanLaserMat}
            />
          </Suspense>
        </AvatarLoadErrorBoundary>
      ) : (
        fallbackNode
      )}

      {/* Cincin & Piringan Scan-Line Hijau Neon (#a8ff60) */}
      <group ref={scanRingRef} visible={false} position={[0, 0.1, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={scanLaserMat}>
          <planeGeometry args={[1.65, 1.65]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.74, 0.018, 12, 64]} />
          <meshBasicMaterial color="#a8ff60" toneMapped={false} />
        </mesh>
        <pointLight color="#a8ff60" intensity={2.4} distance={2.8} />
      </group>
    </group>
  );
}
