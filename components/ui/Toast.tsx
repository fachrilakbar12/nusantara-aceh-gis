'use client';

import React, { useEffect } from 'react';
import { useAcehStore } from '@/lib/store';

export default function Toast() {
  const toastMessage = useAcehStore((s) => s.toastMessage);
  const dismissToast = useAcehStore((s) => s.dismissToast);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 6500);
    return () => clearTimeout(timer);
  }, [toastMessage, dismissToast]);

  if (!toastMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-16 right-4 z-40 flex max-w-sm items-center gap-3 rounded-xl border border-l-4 border-[#25324d] border-l-[#ffb347] bg-[#121a2b] px-4 py-3 text-xs text-[#f3efe6] md:bottom-14 md:right-6"
    >
      <span className="leading-snug">{toastMessage}</span>
      <button
        type="button"
        onClick={dismissToast}
        aria-label="Tutup pemberitahuan"
        className="ml-1 rounded px-1.5 py-0.5 text-[#93a0ba] hover:bg-[#182238] hover:text-[#f3efe6]"
      >
        ✕
      </button>
    </div>
  );
}
