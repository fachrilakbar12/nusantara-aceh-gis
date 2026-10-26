'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { audioEngine } from '@/lib/audio';
import { getRegionCentroid } from '@/lib/geo';
import { REGION_BY_ID } from '@/lib/regions';
import { useAcehStore } from '@/lib/store';
import Intro from '@/components/ui/Intro';
import Header from '@/components/ui/Header';
import RegionPanel from '@/components/ui/RegionPanel';
import RegionList from '@/components/ui/RegionList';
import Legend from '@/components/ui/Legend';
import Tooltip from '@/components/ui/Tooltip';
import Toast from '@/components/ui/Toast';

const Scene = dynamic(() => import('@/components/canvas/Scene'), {
  ssr: false
});

export default function HomePage() {
  const hasEntered = useAcehStore((s) => s.hasEntered);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!hasEntered) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      const store = useAcehStore.getState();

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextId = store.nextRegion();
        const region = REGION_BY_ID[nextId];
        const centroid = getRegionCentroid(nextId);
        if (centroid && region) {
          store.triggerRipple(centroid[0], centroid[1], region.warna);
        }
        audioEngine.playRegionClick(nextId);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevId = store.prevRegion();
        const region = REGION_BY_ID[prevId];
        const centroid = getRegionCentroid(prevId);
        if (centroid && region) {
          store.triggerRipple(centroid[0], centroid[1], region.warna);
        }
        audioEngine.playRegionClick(prevId);
      } else if (e.key === 'Escape') {
        if (store.isCreditsOpen) {
          store.setCreditsOpen(false);
        } else if (store.isDrawerOpen) {
          store.setDrawerOpen(false);
        } else if (store.activeRegionId !== null) {
          store.selectRegion(null);
          audioEngine.playCameraWhoosh();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        const nextMuted = !store.isMuted;
        store.toggleMute();
        audioEngine.setMuted(nextMuted);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hasEntered]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0b1220] select-none">
      {/* Adegan 3D Peta Timbul Aceh */}
      <Scene />

      {/* Efek Miniatur (Tilt-Shift) pada bagian atas & bawah layar (tanpa gradasi) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-10 flex flex-col"
      >
        <div className="h-[3.5vh] w-full backdrop-blur-[5px]" />
        <div className="h-[3vh] w-full backdrop-blur-[2.5px]" />
        <div className="h-[2.5vh] w-full backdrop-blur-[1px]" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-10 flex flex-col"
      >
        <div className="h-[2.5vh] w-full backdrop-blur-[1px]" />
        <div className="h-[3vh] w-full backdrop-blur-[2.5px]" />
        <div className="h-[3.5vh] w-full backdrop-blur-[5px]" />
      </div>

      {/* Header Navigasi Atas */}
      <Header />

      {/* Panel Informasi Budaya Wilayah Terpilih */}
      <RegionPanel />

      {/* Drawer Pencarian 23 Wilayah di Kanan */}
      <RegionList />

      {/* Tooltip Kursor saat Hover Wilayah */}
      <Tooltip />

      {/* Toast Pemberitahuan Audio */}
      <Toast />

      {/* Footer Mini-Legend & Modal Sumber/Tradisi Lintas Aceh */}
      <Legend />

      {/* Layar Masuk Awal */}
      <Intro />
    </main>
  );
}
