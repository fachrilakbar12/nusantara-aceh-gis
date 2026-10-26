'use client';

import React from 'react';
import { audioManager } from '@/lib/audio';
import { useJourneyStore } from '@/lib/store';

export default function Logo() {
  const setEraIndex = useJourneyStore((s) => s.setEraIndex);
  const setActiveNavTab = useJourneyStore((s) => s.setActiveNavTab);

  return (
    <button
      type="button"
      aria-label="Kembali ke awal perjalanan pendidikan"
      onMouseEnter={() => audioManager.playHover()}
      onClick={() => {
        audioManager.playClick();
        setActiveNavTab('home');
        setEraIndex(0);
      }}
      className="group relative z-20 flex h-11 w-11 items-center justify-center rounded-full bg-neon text-[#071109] shadow-neon transition-all duration-300 hover:scale-105 hover:shadow-neon-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neon md:h-12 md:w-12"
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-neon opacity-0 group-hover:animate-ping group-hover:opacity-40" />
      <svg
        viewBox="0 0 40 40"
        className="h-6 w-6 transition-transform duration-300 group-hover:rotate-[-6deg]"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 32V15a6 6 0 0 1 6-6h9" />
        <path d="M13 21h9" />
        <circle cx="28" cy="15" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    </button>
  );
}

