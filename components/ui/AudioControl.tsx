'use client';

import React, { useEffect } from 'react';
import { audioManager } from '@/lib/audio';
import { useJourneyStore } from '@/lib/store';

export default function AudioControl() {
  const isMuted = useJourneyStore((s) => s.isMuted);
  const volume = useJourneyStore((s) => s.volume);
  const toggleMute = useJourneyStore((s) => s.toggleMute);
  const setVolume = useJourneyStore((s) => s.setVolume);

  useEffect(() => {
    audioManager.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    audioManager.setVolume(volume);
  }, [volume]);

  const pct = Math.round(volume * 100);

  return (
    <div
      aria-label="Kontrol suara"
      className="absolute right-3.5 top-16 z-20 flex items-center gap-2.5 md:bottom-5 md:left-6 md:right-auto md:top-auto"
    >
      <button
        type="button"
        aria-label={isMuted ? 'Aktifkan suara (Unmute)' : 'Matikan suara (Mute)'}
        aria-pressed={isMuted}
        onMouseEnter={() => audioManager.playHover()}
        onClick={() => {
          toggleMute();
          if (isMuted) {
            setTimeout(() => audioManager.playClick(), 30);
          }
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#12181c]/70 text-white/85 backdrop-blur-md transition-all duration-200 hover:border-neon hover:text-neon hover:shadow-neon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 9h4l5-4v14l-5-4H4z" />
          {isMuted ? (
            <path d="M16 9l5 6M21 9l-5 6" />
          ) : (
            <>
              <path d="M16 8.5a5 5 0 0 1 0 7" />
              <path d="M18.5 6a8.5 8.5 0 0 1 0 12" />
            </>
          )}
        </svg>
      </button>

      {/* Equalizer Bar Animasi */}
      <div
        aria-hidden="true"
        className={`flex h-4 items-end gap-[2.5px] ${isMuted ? 'opacity-35' : ''}`}
      >
        {[0, 1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={`w-[3px] origin-bottom rounded-full bg-neon shadow-[0_0_6px_#a8ff60] ${
              isMuted ? 'h-1' : `eq-bar eq-bar-${bar + 1}`
            }`}
          />
        ))}
      </div>

      {/* Slider Volume Master */}
      <input
        type="range"
        min={0}
        max={100}
        value={isMuted ? 0 : pct}
        aria-label="Volume master"
        onChange={(e) => {
          const nextVal = Number(e.target.value) / 100;
          setVolume(nextVal);
        }}
        style={
          {
            '--vol-pct': `${isMuted ? 0 : pct}%`
          } as React.CSSProperties
        }
        className="volume-slider hidden w-20 cursor-pointer md:block"
      />
    </div>
  );
}

