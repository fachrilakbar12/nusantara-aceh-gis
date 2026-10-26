'use client';

import React from 'react';
import { audioEngine } from '@/lib/audio';
import { useAcehStore } from '@/lib/store';

export default function AudioControl({ accentColor }: { accentColor: string }) {
  const isMuted = useAcehStore((s) => s.isMuted);
  const volume = useAcehStore((s) => s.volume);
  const toggleMute = useAcehStore((s) => s.toggleMute);
  const setVolume = useAcehStore((s) => s.setVolume);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    toggleMute();
    audioEngine.setMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
    audioEngine.setMuted(val === 0);
  };

  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border border-[#25324d] bg-[#121a2b] px-3 py-1.5"
      style={{ ['--accent-color' as string]: accentColor }}
    >
      <button
        type="button"
        onClick={handleToggleMute}
        aria-label={isMuted ? 'Nyalakan suara (M)' : 'Bisukan suara (M)'}
        title={isMuted ? 'Nyalakan suara (M)' : 'Bisukan suara (M)'}
        className="flex h-6 w-6 items-center justify-center rounded-lg text-xs font-medium text-[#f3efe6] transition-colors duration-200 hover:bg-[#182238]"
      >
        {isMuted || volume === 0 ? (
          <svg className="h-4 w-4 text-[#93a0ba]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg
            className="h-4 w-4 transition-colors duration-300"
            style={{ color: accentColor }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </button>

      <input
        type="range"
        min={0}
        max={1}
        step={0.02}
        value={isMuted ? 0 : volume}
        onChange={handleVolumeChange}
        aria-label="Volume suara"
        className="solid-slider hidden w-16 sm:block"
      />
    </div>
  );
}
