'use client';

import React from 'react';
import { REGION_BY_ID } from '@/lib/regions';
import { useAcehStore } from '@/lib/store';

export default function Tooltip() {
  const hoveredRegionId = useAcehStore((s) => s.hoveredRegionId);
  const hoverPointer = useAcehStore((s) => s.hoverPointer);

  if (!hoveredRegionId) return null;
  const region = REGION_BY_ID[hoveredRegionId];
  if (!region) return null;

  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-40 flex items-center gap-2 rounded-lg border border-l-4 bg-[#121a2b] px-3 py-1.5 text-xs font-medium text-[#f3efe6]"
      style={{
        left: `${hoverPointer.x + 14}px`,
        top: `${hoverPointer.y - 34}px`,
        borderColor: region.warna,
        borderLeftColor: region.warna
      }}
    >
      <span>{region.nama}</span>
      <span className="text-[10px] capitalize text-[#93a0ba]">
        ({region.jenis})
      </span>
    </div>
  );
}
