'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import {
  BASE_EXTRUDE_HEIGHT,
  buildRegionExtrudeGeometry,
  GeoJSONFeatureCollection,
  getRegionCentroid,
  HOVER_EXTRUDE_OFFSET,
  normalizeRegionId,
  ProcessedRegionGeometry,
  registerRegionCentroid
} from '@/lib/geo';
import { REGION_BY_ID } from '@/lib/regions';
import { useAcehStore } from '@/lib/store';
import Region from './Region';
import Landmarks, { LandmarkAnchor } from './Landmarks';

function ClickRippleRing() {
  const rippleEvent = useAcehStore((s) => s.rippleEvent);
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useEffect(() => {
    if (!rippleEvent || !meshRef.current || !matRef.current) return;

    const mesh = meshRef.current;
    const mat = matRef.current;

    mesh.visible = true;
    mesh.position.set(rippleEvent.x, 0.035, rippleEvent.z);
    mesh.scale.set(0.2, 0.2, 0.2);
    mat.color.set(rippleEvent.color);
    mat.opacity = 0.92;

    const tl = gsap.timeline({
      onComplete: () => {
        mesh.visible = false;
      }
    });

    tl.to(
      mesh.scale,
      {
        x: 3.2,
        y: 3.2,
        z: 3.2,
        duration: 1.05,
        ease: 'power2.out'
      },
      0
    ).to(
      mat,
      {
        opacity: 0,
        duration: 1.05,
        ease: 'power2.out'
      },
      0
    );

    return () => {
      tl.kill();
    };
  }, [rippleEvent]);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, Math.PI / 4]} visible={false}>
      <ringGeometry args={[0.26, 0.34, 4]} />
      <meshBasicMaterial
        ref={matRef}
        color="#2ec4b6"
        transparent
        opacity={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * Mahkota Penanda 3D & Berkas Sorot Cahaya di Atas Wilayah Aktif
 */
function ActiveRegionBeacon({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const crownRef = useRef<THREE.Mesh>(null);
  const frameRef = useRef<THREE.Mesh>(null);
  const colorMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const state = useAcehStore.getState();
    const targetId = state.activeRegionId || state.hoveredRegionId;

    if (!targetId) {
      groupRef.current.visible = false;
      return;
    }

    const centroid = getRegionCentroid(targetId);
    const region = REGION_BY_ID[targetId];
    if (!centroid || !region) {
      groupRef.current.visible = false;
      return;
    }

    groupRef.current.visible = true;
    const t = clock.elapsedTime;
    const baseHeight =
      BASE_EXTRUDE_HEIGHT +
      (state.activeRegionId ? HOVER_EXTRUDE_OFFSET + 0.58 : HOVER_EXTRUDE_OFFSET + 0.42);
    const bob = reducedMotion ? 0 : Math.sin(t * 3.0) * 0.035;

    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      centroid[0],
      Math.min(1, delta * 14)
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      baseHeight + bob,
      Math.min(1, delta * 12)
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      centroid[1],
      Math.min(1, delta * 14)
    );

    if (colorMatRef.current) {
      colorMatRef.current.color.set(region.warna);
    }

    if (!reducedMotion) {
      if (crownRef.current) {
        crownRef.current.rotation.y = t * 1.8;
      }
      if (frameRef.current) {
        frameRef.current.rotation.z = -t * 1.2;
      }
    }
  });

  return (
    <group ref={groupRef} visible={false} name="active-region-beacon">
      {/* Piramida Terbalik Penunjuk Wilayah */}
      <mesh ref={crownRef} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.068, 0.12, 4]} />
        <meshStandardMaterial
          ref={colorMatRef}
          color="#f9c74f"
          roughness={0.4}
          flatShading
        />
      </mesh>

      {/* Bingkai Belah Ketupat Emas Melayang */}
      <mesh ref={frameRef} position={[0, -0.14, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
        <ringGeometry args={[0.17, 0.21, 4]} />
        <meshBasicMaterial color="#f9c74f" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function AcehMap({ reducedMotion }: { reducedMotion: boolean }) {
  const [regionsData, setRegionsData] = useState<ProcessedRegionGeometry[]>([]);
  const [anchors, setAnchors] = useState<LandmarkAnchor[]>([]);

  useEffect(() => {
    let active = true;

    fetch('/data/aceh-kabkota.geojson')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Gagal memuat GeoJSON (${res.status})`);
        }
        return res.json() as Promise<GeoJSONFeatureCollection>;
      })
      .then((geojson) => {
        if (!active || !geojson?.features) return;

        const processed: ProcessedRegionGeometry[] = [];
        const landmarkList: LandmarkAnchor[] = [];

        for (const feature of geojson.features) {
          const id = normalizeRegionId(feature.properties || {});
          if (!id) continue;
          const item = buildRegionExtrudeGeometry(feature, id);
          registerRegionCentroid(id, item.centroid);
          processed.push(item);
          landmarkList.push({ id, centroid: item.centroid });
        }

        setRegionsData(processed);
        setAnchors(landmarkList);
      })
      .catch((err) => {
        console.error('[AcehMap] Gagal memuat /data/aceh-kabkota.geojson:', err);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <group name="aceh-map-root">
      {regionsData.map((region) => (
        <Region key={region.id} data={region} />
      ))}
      <Landmarks anchors={anchors} reducedMotion={reducedMotion} />
      <ActiveRegionBeacon reducedMotion={reducedMotion} />
      <ClickRippleRing />
    </group>
  );
}
