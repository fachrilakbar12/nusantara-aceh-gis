'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import {
  buildRegionExtrudeGeometry,
  GeoJSONFeatureCollection,
  normalizeRegionId,
  ProcessedRegionGeometry,
  registerRegionCentroid
} from '@/lib/geo';
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
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.26, 0.34, 32]} />
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
      <ClickRippleRing />
    </group>
  );
}

