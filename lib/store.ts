import { create } from 'zustand';
import { REGIONS_ACEH } from './regions';

export type LightingMode = 'malam' | 'senja' | 'siang';

export interface RippleEvent {
  id: number;
  x: number;
  z: number;
  color: string;
}

interface AcehStoreState {
  hasEntered: boolean;
  activeRegionId: string | null;
  hoveredRegionId: string | null;
  hoverPointer: { x: number; y: number };
  isMuted: boolean;
  volume: number;
  isDrawerOpen: boolean;
  isCreditsOpen: boolean;
  searchQuery: string;
  toastMessage: string | null;
  rippleEvent: RippleEvent | null;
  lightingMode: LightingMode;
  isTourPlaying: boolean;
  isCloudTransitioning: boolean;

  setEntered: (entered: boolean) => void;
  setCloudTransitioning: (val: boolean) => void;
  selectRegion: (regionId: string | null) => void;
  nextRegion: () => string;
  prevRegion: () => string;
  setHoveredRegion: (regionId: string | null) => void;
  setHoverPointer: (x: number, y: number) => void;
  toggleMute: () => void;
  setVolume: (vol: number) => void;
  setDrawerOpen: (open: boolean) => void;
  setCreditsOpen: (open: boolean) => void;
  setSearchQuery: (q: string) => void;
  showToast: (msg: string) => void;
  dismissToast: () => void;
  triggerRipple: (x: number, z: number, color: string) => void;
  setLightingMode: (mode: LightingMode) => void;
  setTourPlaying: (playing: boolean) => void;
}

export const useAcehStore = create<AcehStoreState>((set, get) => ({
  hasEntered: false,
  activeRegionId: null,
  hoveredRegionId: null,
  hoverPointer: { x: 0, y: 0 },
  isMuted: false,
  volume: 0.78,
  isDrawerOpen: false,
  isCreditsOpen: false,
  searchQuery: '',
  toastMessage: null,
  rippleEvent: null,
  lightingMode: 'malam',
  isTourPlaying: false,
  isCloudTransitioning: false,

  setEntered: (entered) => set({ hasEntered: entered }),
  setCloudTransitioning: (val) => set({ isCloudTransitioning: val }),

  selectRegion: (regionId) => set({ activeRegionId: regionId }),

  nextRegion: () => {
    const current = get().activeRegionId;
    const idx = REGIONS_ACEH.findIndex((r) => r.id === current);
    const nextIdx = idx < 0 ? 0 : (idx + 1) % REGIONS_ACEH.length;
    const nextId = REGIONS_ACEH[nextIdx].id;
    set({ activeRegionId: nextId });
    return nextId;
  },

  prevRegion: () => {
    const current = get().activeRegionId;
    const idx = REGIONS_ACEH.findIndex((r) => r.id === current);
    const prevIdx =
      idx <= 0 ? REGIONS_ACEH.length - 1 : (idx - 1 + REGIONS_ACEH.length) % REGIONS_ACEH.length;
    const prevId = REGIONS_ACEH[prevIdx].id;
    set({ activeRegionId: prevId });
    return prevId;
  },

  setHoveredRegion: (regionId) => set({ hoveredRegionId: regionId }),

  setHoverPointer: (x, y) => set({ hoverPointer: { x, y } }),

  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

  setVolume: (vol) => {
    const clamped = Math.max(0, Math.min(1, vol));
    set({ volume: clamped, isMuted: clamped === 0 });
  },

  setDrawerOpen: (open) => set({ isDrawerOpen: open }),

  setCreditsOpen: (open) => set({ isCreditsOpen: open }),

  setSearchQuery: (q) => set({ searchQuery: q }),

  showToast: (msg) => set({ toastMessage: msg }),

  dismissToast: () => set({ toastMessage: null }),

  triggerRipple: (x, z, color) =>
    set({
      rippleEvent: {
        id: Date.now(),
        x,
        z,
        color
      }
    }),

  setLightingMode: (mode) => set({ lightingMode: mode }),

  setTourPlaying: (playing) => set({ isTourPlaying: playing })
}));
