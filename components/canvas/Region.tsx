'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { audioEngine } from '@/lib/audio';
import { HOVER_EXTRUDE_OFFSET, ProcessedRegionGeometry } from '@/lib/geo';
import { REGION_BY_ID } from '@/lib/regions';
import { useAcehStore } from '@/lib/store';

interface RegionProps {
  data: ProcessedRegionGeometry;
}

export default function Region({ data }: RegionProps) {
  const groupRef = useRef<THREE.Group>(null);
  const yPosRef = useRef(0);
  const yVelRef = useRef(0);

  const regionInfo = REGION_BY_ID[data.id];
  const baseHex = regionInfo ? regionInfo.warna : '#2ec4b6';

  const { baseColor, hoverColor, dimmedColor, material, outlineGeo, outlineMat } =
    useMemo(() => {
      const base = new THREE.Color(baseHex);
      const hover = base.clone().offsetHSL(0, 0.04, 0.11);
      const dimmed = base.clone().multiplyScalar(0.56);

      const mat = new THREE.MeshStandardMaterial({
        color: base.clone(),
        roughness: 0.58,
        metalness: 0.08,
        flatShading: true
      });

      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute(
        'position',
        new THREE.BufferAttribute(data.topOutlinePositions, 3)
      );

      const lineMat = new THREE.LineBasicMaterial({
        color: '#0b1220',
        transparent: true,
        opacity: 0.55
      });

      return {
        baseColor: base,
        hoverColor: hover,
        dimmedColor: dimmed,
        material: mat,
        outlineGeo: lineGeo,
        outlineMat: lineMat
      };
    }, [baseHex, data.topOutlinePositions]);

  useEffect(() => {
    return () => {
      data.geometry.dispose();
      material.dispose();
      outlineGeo.dispose();
      outlineMat.dispose();
    };
  }, [data.geometry, material, outlineGeo, outlineMat]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    const state = useAcehStore.getState();

    const isHovered = state.hoveredRegionId === data.id;
    const isActive = state.activeRegionId === data.id;
    const hasSelection = state.activeRegionId !== null;

    let targetY = 0;
    if (isActive) {
      targetY = HOVER_EXTRUDE_OFFSET + 0.08;
    } else if (isHovered) {
      targetY = HOVER_EXTRUDE_OFFSET;
    } else if (hasSelection) {
      targetY = -0.06;
    }

    // Animasi pegas (spring physics: stiffness = 175, damping = 16)
    const stiffness = 175;
    const damping = 16;
    const force = (targetY - yPosRef.current) * stiffness;
    yVelRef.current += force * dt;
    yVelRef.current *= Math.exp(-damping * dt);
    yPosRef.current += yVelRef.current * dt;

    groupRef.current.position.y = yPosRef.current;

    const targetColor =
      isActive || isHovered
        ? hoverColor
        : hasSelection
          ? dimmedColor
          : baseColor;

    material.color.lerp(targetColor, Math.min(1, dt * 11));
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
    store.selectRegion(data.id);
    store.triggerRipple(data.centroid[0], data.centroid[1], baseHex);
    audioEngine.playRegionClick(data.id);
  };

  return (
    <group ref={groupRef} name={`region-${data.id}`}>
      <mesh
        geometry={data.geometry}
        material={material}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
        onPointerOver={handlePointerOver}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />
      <lineSegments geometry={outlineGeo} material={outlineMat} />
    </group>
  );
}

