import { create } from 'zustand';
import { EDUCATION_ERAS } from './data';

export type NavTab = 'home' | 'camera' | 'doc' | 'trophy' | 'info';
export type CameraPreset = 'default' | 'low' | 'closeup';

interface JourneyState {
  activeEraIndex: number;
  previousEraIndex: number;
  transitionId: number;
  isTransitioning: boolean;
  isLoaded: boolean;
  isStarted: boolean;
  isMuted: boolean;
  volume: number;
  activeNavTab: NavTab;
  cameraPreset: CameraPreset;
  isMenuOpen: boolean;
  glitchBurstId: number;
  lastInteractionAt: number;
  usingFallbackAvatar: boolean;

  setEraIndex: (index: number) => void;
  nextEra: () => void;
  prevEra: () => void;
  setTransitioning: (val: boolean) => void;
  setLoaded: (val: boolean) => void;
  setStarted: (val: boolean) => void;
  toggleMute: () => void;
  setMuted: (val: boolean) => void;
  setVolume: (val: number) => void;
  setActiveNavTab: (tab: NavTab) => void;
  cycleCameraPreset: () => void;
  setMenuOpen: (open: boolean) => void;
  triggerGlitchBurst: () => void;
  touchInteraction: () => void;
  setUsingFallbackAvatar: (val: boolean) => void;
}

const PRESET_ORDER: CameraPreset[] = ['default', 'low', 'closeup'];

export const useJourneyStore = create<JourneyState>((set, get) => ({
  activeEraIndex: 0,
  previousEraIndex: 0,
  transitionId: 0,
  isTransitioning: false,
  isLoaded: false,
  isStarted: false,
  isMuted: false,
  volume: 0.72,
  activeNavTab: 'home',
  cameraPreset: 'default',
  isMenuOpen: false,
  glitchBurstId: 0,
  lastInteractionAt: Date.now(),
  usingFallbackAvatar: false,

  setEraIndex: (index: number) => {
    const clamped = ((index % EDUCATION_ERAS.length) + EDUCATION_ERAS.length) % EDUCATION_ERAS.length;
    const current = get().activeEraIndex;
    if (clamped === current) return;
    set((state) => ({
      previousEraIndex: state.activeEraIndex,
      activeEraIndex: clamped,
      transitionId: state.transitionId + 1,
      isTransitioning: true,
      lastInteractionAt: Date.now()
    }));
  },

  nextEra: () => {
    const next = (get().activeEraIndex + 1) % EDUCATION_ERAS.length;
    get().setEraIndex(next);
  },

  prevEra: () => {
    const prev = (get().activeEraIndex - 1 + EDUCATION_ERAS.length) % EDUCATION_ERAS.length;
    get().setEraIndex(prev);
  },

  setTransitioning: (val: boolean) => set({ isTransitioning: val }),
  setLoaded: (val: boolean) => set({ isLoaded: val }),
  setStarted: (val: boolean) => set({ isStarted: val, lastInteractionAt: Date.now() }),

  toggleMute: () =>
    set((state) => ({
      isMuted: !state.isMuted,
      lastInteractionAt: Date.now()
    })),

  setMuted: (val: boolean) => set({ isMuted: val }),

  setVolume: (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    set({
      volume: clamped,
      isMuted: clamped === 0,
      lastInteractionAt: Date.now()
    });
  },

  setActiveNavTab: (tab: NavTab) =>
    set({
      activeNavTab: tab,
      lastInteractionAt: Date.now()
    }),

  cycleCameraPreset: () =>
    set((state) => {
      const idx = PRESET_ORDER.indexOf(state.cameraPreset);
      const next = PRESET_ORDER[(idx + 1) % PRESET_ORDER.length];
      return {
        cameraPreset: next,
        lastInteractionAt: Date.now()
      };
    }),

  setMenuOpen: (open: boolean) =>
    set({
      isMenuOpen: open,
      lastInteractionAt: Date.now()
    }),

  triggerGlitchBurst: () =>
    set((state) => ({
      glitchBurstId: state.glitchBurstId + 1
    })),

  touchInteraction: () => set({ lastInteractionAt: Date.now() }),
  setUsingFallbackAvatar: (val: boolean) => set({ usingFallbackAvatar: val })
}));

