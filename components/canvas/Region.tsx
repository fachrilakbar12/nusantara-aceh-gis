'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { audioEngine } from '@/lib/audio';
import {
  HOVER_EXTRUDE_OFFSET,
  LAYER_BASE_HEIGHT,
  LAYER_MIDDLE_HEIGHT,
  LAYER_TOP_HEIGHT,
  ProcessedRegionGeometry
} from '@/lib/geo';
import { REGION_BY_ID } from '@/lib/regions';
import { useAcehStore } from '@/lib/store';

interface RegionProps {
  data: ProcessedRegionGeometry;
}

/**
 * Hutan Pohon Kertas Lipat Mini (Origami Trees) & Topografi Pegunungan Bukit Barisan / Danau Laut Tawar
 */
function RegionTopography({
  regionId,
  centroid,
  boundsRadius
}: {
  regionId: string;
  centroid: [number, number];
  boundsRadius: number;
}) {
  const [cx, cz] = centroid;
  const surfaceY = LAYER_TOP_HEIGHT + 0.012;

  // Gugusan pohon kertas mini proporsional di sekitar tiap wilayah
  const r = Math.min(0.22, Math.max(0.07, boundsRadius * 0.28));

  return (
    <group>
      {/* Gugusan 3 Pohon Kertas Lipat (Origami Forest) di tiap wilayah */}
      <group position={[cx - r * 0.65, surfaceY, cz - r * 0.45]}>
        <mesh position={[0, 0.032, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[0.028, 0.065, 4]} />
          <meshStandardMaterial color="#2d6a4f" roughness={0.75} flatShading />
        </mesh>
        <mesh position={[0.036, 0.025, 0.022]} rotation={[0, Math.PI / 6, 0]} castShadow>
          <coneGeometry args={[0.022, 0.05, 4]} />
          <meshStandardMaterial color="#40916c" roughness={0.75} flatShading />
        </mesh>
        <mesh position={[-0.028, 0.022, 0.028]} rotation={[0, Math.PI / 3, 0]} castShadow>
          <coneGeometry args={[0.02, 0.044, 4]} />
          <meshStandardMaterial color="#52b788" roughness={0.75} flatShading />
        </mesh>
      </group>

      {regionId === 'aceh-besar' && (
        // Gunung Seulawah Agam & Seulawah Inong
        <group position={[cx + 0.14, surfaceY, cz + 0.06]}>
          <mesh position={[0, 0.095, 0]} rotation={[0, Math.PI / 5, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.125, 0.19, 4]} />
            <meshStandardMaterial color="#d68c28" roughness={0.72} flatShading />
          </mesh>
          <mesh position={[0, 0.165, 0]} rotation={[0, Math.PI / 5, 0]} castShadow>
            <coneGeometry args={[0.048, 0.06, 4]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.65} flatShading />
          </mesh>
          <mesh position={[-0.12, 0.065, -0.05]} rotation={[0, Math.PI / 3, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.088, 0.13, 4]} />
            <meshStandardMaterial color="#e09836" roughness={0.74} flatShading />
          </mesh>
        </group>
      )}

      {regionId === 'pidie' && (
        // Punggung Bukit Barisan Tangse
        <group position={[cx - 0.12, surfaceY, cz + 0.14]}>
          <mesh position={[0, 0.08, 0]} rotation={[0, Math.PI / 6, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.115, 0.16, 4]} />
            <meshStandardMaterial color="#9c52db" roughness={0.72} flatShading />
          </mesh>
          <mesh position={[0.12, 0.06, 0.06]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.085, 0.12, 4]} />
            <meshStandardMaterial color="#b066ef" roughness={0.72} flatShading />
          </mesh>
        </group>
      )}

      {regionId === 'bener-meriah' && (
        // Gunung Burni Telong
        <group position={[cx - 0.1, surfaceY, cz + 0.03]}>
          <mesh position={[0, 0.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.118, 0.2, 4]} />
            <meshStandardMaterial color="#d43f44" roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0, 0.172, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.046, 0.06, 4]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.65} flatShading />
          </mesh>
        </group>
      )}

      {regionId === 'aceh-tengah' && (
        // Danau Laut Tawar (kepingan air biru 2 lapis) & Pegunungan Tanoh Gayo
        <group position={[cx, surfaceY, cz]}>
          <group position={[0.14, 0.008, -0.02]} rotation={[0, -0.18, 0]}>
            <mesh position={[0, 0, 0]} receiveShadow>
              <boxGeometry args={[0.32, 0.012, 0.12]} />
              <meshStandardMaterial color="#f3efe6" roughness={0.68} flatShading />
            </mesh>
            <mesh position={[0, 0.008, 0]} receiveShadow>
              <boxGeometry args={[0.28, 0.014, 0.092]} />
              <meshStandardMaterial color="#48cae4" roughness={0.5} flatShading />
            </mesh>
            <mesh position={[0, 0.015, 0]} receiveShadow>
              <boxGeometry args={[0.21, 0.014, 0.062]} />
              <meshStandardMaterial color="#1982c4" roughness={0.48} flatShading />
            </mesh>
          </group>

          <mesh position={[-0.18, 0.085, 0.08]} rotation={[0, Math.PI / 5, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.12, 0.17, 4]} />
            <meshStandardMaterial color="#6ca319" roughness={0.72} flatShading />
          </mesh>
          <mesh position={[0.12, 0.07, -0.14]} rotation={[0, Math.PI / 3, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.095, 0.14, 4]} />
            <meshStandardMaterial color="#78b31e" roughness={0.72} flatShading />
          </mesh>
        </group>
      )}

      {regionId === 'gayo-lues' && (
        // Gugusan Puncak Gunung Leuser
        <group position={[cx - 0.14, surfaceY, cz + 0.08]}>
          <mesh position={[0, 0.12, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.15, 0.24, 4]} />
            <meshStandardMaterial color="#13689e" roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0, 0.205, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.056, 0.075, 4]} />
            <meshStandardMaterial color="#f3efe6" roughness={0.62} flatShading />
          </mesh>
          <mesh position={[0.16, 0.09, 0.07]} rotation={[0, Math.PI / 6, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.115, 0.18, 4]} />
            <meshStandardMaterial color="#1674b0" roughness={0.72} flatShading />
          </mesh>
          <mesh position={[-0.14, 0.075, -0.08]} rotation={[0, Math.PI / 3, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.095, 0.15, 4]} />
            <meshStandardMaterial color="#1674b0" roughness={0.72} flatShading />
          </mesh>
        </group>
      )}

      {regionId === 'aceh-tenggara' && (
        // Lembah Alas & Bukit Barisan Tenggara
        <group position={[cx + 0.12, surfaceY, cz - 0.06]}>
          <mesh position={[0, 0.095, 0]} rotation={[0, Math.PI / 5, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.125, 0.19, 4]} />
            <meshStandardMaterial color="#c4593d" roughness={0.72} flatShading />
          </mesh>
          <mesh position={[-0.18, 0.075, 0.1]} rotation={[0, Math.PI / 3, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.098, 0.15, 4]} />
            <meshStandardMaterial color="#d46346" roughness={0.72} flatShading />
          </mesh>
        </group>
      )}

      {regionId === 'aceh-jaya' && (
        // Pegunungan Ulu Masen
        <group position={[cx + 0.14, surfaceY, cz - 0.08]}>
          <mesh position={[0, 0.08, 0]} rotation={[0, Math.PI / 5, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.11, 0.16, 4]} />
            <meshStandardMaterial color="#05b084" roughness={0.72} flatShading />
          </mesh>
        </group>
      )}

      {regionId === 'nagan-raya' && (
        // Bukit Barisan Pantai Barat
        <group position={[cx + 0.15, surfaceY, cz - 0.1]}>
          <mesh position={[0, 0.085, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.115, 0.17, 4]} />
            <meshStandardMaterial color="#91127e" roughness={0.72} flatShading />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function Region({ data }: RegionProps) {
  const groupRef = useRef<THREE.Group>(null);
  const middleLayerRef = useRef<THREE.Group>(null);
  const topLayerRef = useRef<THREE.Group>(null);

  // Mulai sedikit di bawah laut untuk efek gelombang bangkit saat klik Masuk
  const yPosRef = useRef(-0.42);
  const yVelRef = useRef(0);
  const spreadRef = useRef(0);
  const enteredAtRef = useRef<number | null>(null);

  const regionInfo = REGION_BY_ID[data.id];
  const baseHex = regionInfo ? regionInfo.warna : '#2ec4b6';

  // Urutan waktu bangkit gelombang dari Sabang (barat laut) ke tenggara
  const waveDelay = useMemo(() => {
    const normalizedPos = (data.centroid[0] + data.centroid[1] + 8.5) / 16.0;
    return Math.max(0.05, Math.min(1.15, normalizedPos * 1.05));
  }, [data.centroid]);

  const {
    baseColor,
    hoverColor,
    dimmedColor,
    middleBaseColor,
    middleHoverColor,
    middleDimmedColor,
    bottomBaseColor,
    bottomHoverColor,
    bottomDimmedColor,
    baseMat,
    middleMat,
    topMat,
    baseOutlineGeo,
    middleOutlineGeo,
    topOutlineGeo,
    darkOutlineMat,
    paperEdgeMat
  } = useMemo(() => {
    const topC = new THREE.Color(baseHex);
    const topHover = topC.clone().offsetHSL(0, 0.04, 0.10);
    const topDim = topC.clone().multiplyScalar(0.55);

    const midC = topC.clone().multiplyScalar(0.84);
    const midHover = topHover.clone().multiplyScalar(0.86);
    const midDim = topDim.clone().multiplyScalar(0.84);

    const botC = topC.clone().multiplyScalar(0.68);
    const botHover = topHover.clone().multiplyScalar(0.72);
    const botDim = topDim.clone().multiplyScalar(0.68);

    const bMat = new THREE.MeshStandardMaterial({
      color: botC.clone(),
      roughness: 0.78,
      metalness: 0.04,
      flatShading: true
    });

    const mMat = new THREE.MeshStandardMaterial({
      color: midC.clone(),
      roughness: 0.72,
      metalness: 0.05,
      flatShading: true
    });

    const tMat = new THREE.MeshStandardMaterial({
      color: topC.clone(),
      roughness: 0.65,
      metalness: 0.06,
      flatShading: true
    });

    const bLineGeo = new THREE.BufferGeometry();
    bLineGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(data.baseOutlinePositions, 3)
    );

    const mLineGeo = new THREE.BufferGeometry();
    mLineGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(data.middleOutlinePositions, 3)
    );

    const tLineGeo = new THREE.BufferGeometry();
    tLineGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(data.topOutlinePositions, 3)
    );

    const dLineMat = new THREE.LineBasicMaterial({
      color: '#0b1220',
      transparent: true,
      opacity: 0.62
    });

    const pEdgeMat = new THREE.LineBasicMaterial({
      color: '#f3efe6',
      transparent: true,
      opacity: 0.26
    });

    return {
      baseColor: topC,
      hoverColor: topHover,
      dimmedColor: topDim,
      middleBaseColor: midC,
      middleHoverColor: midHover,
      middleDimmedColor: midDim,
      bottomBaseColor: botC,
      bottomHoverColor: botHover,
      bottomDimmedColor: botDim,
      baseMat: bMat,
      middleMat: mMat,
      topMat: tMat,
      baseOutlineGeo: bLineGeo,
      middleOutlineGeo: mLineGeo,
      topOutlineGeo: tLineGeo,
      darkOutlineMat: dLineMat,
      paperEdgeMat: pEdgeMat
    };
  }, [
    baseHex,
    data.baseOutlinePositions,
    data.middleOutlinePositions,
    data.topOutlinePositions
  ]);

  useEffect(() => {
    return () => {
      data.layerBaseGeometry.dispose();
      data.layerMiddleGeometry.dispose();
      data.layerTopGeometry.dispose();
      baseMat.dispose();
      middleMat.dispose();
      topMat.dispose();
      baseOutlineGeo.dispose();
      middleOutlineGeo.dispose();
      topOutlineGeo.dispose();
      darkOutlineMat.dispose();
      paperEdgeMat.dispose();
    };
  }, [
    data,
    baseMat,
    middleMat,
    topMat,
    baseOutlineGeo,
    middleOutlineGeo,
    topOutlineGeo,
    darkOutlineMat,
    paperEdgeMat
  ]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    const state = useAcehStore.getState();

    if (state.hasEntered && enteredAtRef.current === null) {
      enteredAtRef.current = clock.elapsedTime;
      yPosRef.current = -0.52;
    }

    const isHovered = state.hoveredRegionId === data.id;
    const isActive = state.activeRegionId === data.id;
    const hasSelection = state.activeRegionId !== null;

    let targetY = 0;
    let targetSpread = 0;

    if (!state.hasEntered) {
      targetY = 0;
    } else if (
      enteredAtRef.current !== null &&
      clock.elapsedTime - enteredAtRef.current < waveDelay
    ) {
      targetY = -0.52;
    } else if (isActive) {
      targetY = HOVER_EXTRUDE_OFFSET + 0.09;
      targetSpread = 0.06;
    } else if (isHovered) {
      targetY = HOVER_EXTRUDE_OFFSET;
      targetSpread = 0.035;
    } else if (hasSelection) {
      targetY = -0.06;
      targetSpread = 0;
    }

    const stiffness = 175;
    const damping = 15;
    const force = (targetY - yPosRef.current) * stiffness;
    yVelRef.current += force * dt;
    yVelRef.current *= Math.exp(-damping * dt);
    yPosRef.current += yVelRef.current * dt;

    spreadRef.current = THREE.MathUtils.lerp(
      spreadRef.current,
      targetSpread,
      Math.min(1, dt * 10)
    );

    groupRef.current.position.y = yPosRef.current;

    if (middleLayerRef.current) {
      middleLayerRef.current.position.y = LAYER_BASE_HEIGHT + spreadRef.current;
    }
    if (topLayerRef.current) {
      topLayerRef.current.position.y =
        LAYER_BASE_HEIGHT + LAYER_MIDDLE_HEIGHT + spreadRef.current * 2.1;
    }

    const lerpFactor = Math.min(1, dt * 11);
    if (isActive || isHovered) {
      topMat.color.lerp(hoverColor, lerpFactor);
      middleMat.color.lerp(middleHoverColor, lerpFactor);
      baseMat.color.lerp(bottomHoverColor, lerpFactor);
    } else if (hasSelection) {
      topMat.color.lerp(dimmedColor, lerpFactor);
      middleMat.color.lerp(middleDimmedColor, lerpFactor);
      baseMat.color.lerp(bottomDimmedColor, lerpFactor);
    } else {
      topMat.color.lerp(baseColor, lerpFactor);
      middleMat.color.lerp(middleBaseColor, lerpFactor);
      baseMat.color.lerp(bottomBaseColor, lerpFactor);
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const store = useAcehStore.getState();
    if (store.hoveredRegionId !== data.id) {
      store.setHoveredRegion(data.id);
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
    const store = useAcehStore.getState();
    if (store.hoveredRegionId === data.id) {
      store.setHoveredRegion(null);
      document.body.style.cursor = 'auto';
    }
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const store = useAcehStore.getState();
    store.setTourPlaying(false);
    store.selectRegion(data.id);
    store.triggerRipple(data.centroid[0], data.centroid[1], baseHex);
    audioEngine.playRegionClick(data.id);
  };

  return (
    <group ref={groupRef} name={`region-${data.id}`}>
      {/* Lapisan 1: Dasar Kertas (Base Papercut Layer) */}
      <group position={[0, 0, 0]}>
        <mesh
          geometry={data.layerBaseGeometry}
          material={baseMat}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
          onPointerOver={handlePointerOver}
          onPointerMove={handlePointerMove}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        />
        <lineSegments geometry={baseOutlineGeo} material={darkOutlineMat} />
      </group>

      {/* Lapisan 2: Tengah Kertas (Middle Papercut Layer) */}
      <group ref={middleLayerRef} position={[0, LAYER_BASE_HEIGHT, 0]}>
        <mesh
          geometry={data.layerMiddleGeometry}
          material={middleMat}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
          onPointerOver={handlePointerOver}
          onPointerMove={handlePointerMove}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        />
        <lineSegments geometry={middleOutlineGeo} material={paperEdgeMat} />
      </group>

      {/* Lapisan 3: Atas Kertas (Top Papercut Layer) + Hutan Kertas & Topografi Bukit Barisan */}
      <group
        ref={topLayerRef}
        position={[0, LAYER_BASE_HEIGHT + LAYER_MIDDLE_HEIGHT, 0]}
      >
        <mesh
          geometry={data.layerTopGeometry}
          material={topMat}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
          onPointerOver={handlePointerOver}
          onPointerMove={handlePointerMove}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        />
        <lineSegments geometry={topOutlineGeo} material={paperEdgeMat} />

        {/* Hutan Kertas & Topografi Pegunungan Bukit Barisan / Danau Laut Tawar */}
        <RegionTopography
          regionId={data.id}
          centroid={data.centroid}
          boundsRadius={data.boundsRadius}
        />
      </group>
    </group>
  );
}
