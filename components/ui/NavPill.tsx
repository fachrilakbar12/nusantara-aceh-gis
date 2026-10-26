'use client';

import React from 'react';
import { audioManager } from '@/lib/audio';
import { NavTab, useJourneyStore } from '@/lib/store';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ReactNode;
}

const ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Ringkasan Utama',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
      </svg>
    )
  },
  {
    id: 'camera',
    label: 'Ganti Sudut Kamera 3D',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M3 8h4l2-3h6l2 3h4v11H3z" />
        <circle cx="12" cy="13" r="3.4" />
      </svg>
    )
  },
  {
    id: 'doc',
    label: 'Detail Akademik & Deskripsi',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v4h4M9 12h6M9 16h6" />
      </svg>
    )
  },
  {
    id: 'trophy',
    label: 'Pencapaian & Peran Organisasi',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
        <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6" />
      </svg>
    )
  },
  {
    id: 'info',
    label: 'Panduan Kontrol & Timeline',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7.5v.5" />
      </svg>
    )
  }
];

export default function NavPill() {
  const activeNavTab = useJourneyStore((s) => s.activeNavTab);
  const cameraPreset = useJourneyStore((s) => s.cameraPreset);
  const setActiveNavTab = useJourneyStore((s) => s.setActiveNavTab);
  const cycleCameraPreset = useJourneyStore((s) => s.cycleCameraPreset);

  return (
    <nav
      aria-label="Navigasi panel informasi"
      className="z-20 flex items-center gap-1 rounded-2xl border border-white/15 bg-[#12181c]/65 p-1.5 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
    >
      {ITEMS.map((item) => {
        const isActive =
          item.id === 'camera'
            ? cameraPreset !== 'default'
            : activeNavTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            aria-label={item.label}
            title={item.label}
            onMouseEnter={() => audioManager.playHover()}
            onClick={() => {
              audioManager.playClick();
              if (item.id === 'camera') {
                cycleCameraPreset();
              } else {
                setActiveNavTab(item.id);
              }
            }}
            className={`relative flex h-8 w-9 items-center justify-center rounded-xl transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon md:h-9 md:w-10 ${
              isActive
                ? 'bg-neon/15 text-neon shadow-[0_0_16px_rgba(168,255,96,0.42),inset_0_0_0_1px_rgba(168,255,96,0.45)]'
                : 'text-white/65 hover:bg-white/10 hover:text-white'
            }`}
          >
            {item.icon}
          </button>
        );
      })}
    </nav>
  );
}

