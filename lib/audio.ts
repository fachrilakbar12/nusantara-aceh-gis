import { InstrumenKlik, REGION_BY_ID } from './regions';

const BUNGONG_JEUMPA_PATH = '/audio/bungong-jeumpa.mp3';
// Lewati keheningan awal 2.4 detik & akhir 3:33.2 agar melodi langsung terdengar dan loop mulus
const TRACK_START_OFFSET = 2.4;
const TRACK_LOOP_END = 213.2;

class NusantaraAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgFadeGain: GainNode | null = null;
  private bgAudio: HTMLAudioElement | null = null;
  private bgSource: MediaElementAudioSourceNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private isMuted = false;
  private volume = 0.78;
  private lastHoverAt = 0;
  private bgStarted = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
      this.masterGain.connect(this.ctx.destination);
      this.noiseBuffer = this.buildNoiseBuffer(this.ctx);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private buildNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * 0.45);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Memastikan musik latar /audio/bungong-jeumpa.mp3 berputar dengan fade-in 2 detik
   */
  private initAndPlayBgMusic(onMissingFile?: (msg: string) => void): void {
    try {
      const ctx = this.ensureContext();
      if (!ctx || !this.masterGain) return;

      if (!this.bgAudio) {
        const audio = new Audio(BUNGONG_JEUMPA_PATH);
        audio.loop = true;
        audio.preload = 'auto';

        audio.addEventListener('loadedmetadata', () => {
          try {
            if (audio.currentTime < TRACK_START_OFFSET) {
              audio.currentTime = TRACK_START_OFFSET;
            }
          } catch {
            // Abaikan bila metadata belum siap
          }
        });

        audio.addEventListener('timeupdate', () => {
          try {
            if (audio.currentTime >= TRACK_LOOP_END) {
              audio.currentTime = TRACK_START_OFFSET;
              if (audio.paused && !this.isMuted) {
                void audio.play().catch(() => {});
              }
            }
          } catch {
            // Abaikan
          }
        });

        const fadeGain = ctx.createGain();
        fadeGain.gain.setValueAtTime(0.0001, ctx.currentTime);

        try {
          const source = ctx.createMediaElementSource(audio);
          source.connect(fadeGain);
          this.bgSource = source;
        } catch {
          // Jika createMediaElementSource dibatasi browser
        }
        fadeGain.connect(this.masterGain);

        this.bgAudio = audio;
        this.bgFadeGain = fadeGain;
      }

      if (this.bgAudio.paused) {
        try {
          if (this.bgAudio.readyState >= 1 && this.bgAudio.currentTime < TRACK_START_OFFSET) {
            this.bgAudio.currentTime = TRACK_START_OFFSET;
          }
        } catch {
          // Abaikan bila metadata belum siap
        }

        this.bgAudio
          .play()
          .then(() => {
            this.bgStarted = true;
            if (this.bgFadeGain && this.ctx) {
              const now = this.ctx.currentTime;
              this.bgFadeGain.gain.cancelScheduledValues(now);
              this.bgFadeGain.gain.setValueAtTime(0.0001, now);
              this.bgFadeGain.gain.linearRampToValueAtTime(0.62, now + 2.0);
            }
          })
          .catch((err) => {
            console.warn('Audio play error / autoplay blocked:', err);
            if (onMissingFile) {
              onMissingFile('Klik ikon suara untuk memutar musik pengiring Bungong Jeumpa.');
            }
          });
      }
    } catch (err) {
      console.warn('AudioEngine error:', err);
    }
  }

  /**
   * Dipanggil saat pengguna menekan tombol "Masuk".
   * Memutar /audio/bungong-jeumpa.mp3 secara langsung dalam konteks klik pengguna dengan fade-in 2 detik.
   */
  public startExperience(onMissingFile: (msg: string) => void): void {
    this.initAndPlayBgMusic(onMissingFile);
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (!muted && !this.bgStarted) {
      this.initAndPlayBgMusic();
    }
    this.applyMasterGain();
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.volume > 0 && !this.bgStarted) {
      this.initAndPlayBgMusic();
    }
    this.applyMasterGain();
  }

  private applyMasterGain(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const target = this.isMuted ? 0 : this.volume;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(target, now, 0.04);
  }

  /**
   * Tick tipis saat hover wilayah
   */
  public playHoverTick(): void {
    if (this.isMuted) return;
    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (nowMs - this.lastHoverAt < 55) return;
    this.lastHoverAt = nowMs;

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(980, t);
    osc.frequency.exponentialRampToValueAtTime(1420, t + 0.028);

    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.032);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.035);
  }

  /**
   * Whoosh pendek saat kamera terbang menuju wilayah
   */
  public playCameraWhoosh(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || !this.noiseBuffer) return;

    const t = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2.4;
    filter.frequency.setValueAtTime(220, t);
    filter.frequency.exponentialRampToValueAtTime(760, t + 0.18);
    filter.frequency.exponentialRampToValueAtTime(190, t + 0.42);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.11, t + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
    noise.stop(t + 0.44);
  }

  /**
   * Bunyi klik wilayah sesuai kelompok budaya Aceh
   */
  public playRegionClick(regionId: string): void {
    if (!this.bgStarted && !this.isMuted) {
      this.initAndPlayBgMusic();
    }
    if (this.isMuted) return;
    const region = REGION_BY_ID[regionId];
    const instrumen: InstrumenKlik = region ? region.instrumenKlik : 'rapai';
    this.playInstrument(instrumen);
    this.playCameraWhoosh();
  }

  public playInstrument(instrumen: InstrumenKlik): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;

    switch (instrumen) {
      case 'rapai': {
        // Pesisir utara/timur: bunyi gendang rapai (burst noise pendek + sine turun nada)
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(185, t);
        osc.frequency.exponentialRampToValueAtTime(68, t + 0.22);

        oscGain.gain.setValueAtTime(0.36, t);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.26);

        if (this.noiseBuffer) {
          const noise = ctx.createBufferSource();
          noise.buffer = this.noiseBuffer;
          const bpf = ctx.createBiquadFilter();
          bpf.type = 'bandpass';
          bpf.frequency.setValueAtTime(1350, t);
          bpf.Q.value = 1.8;

          const nGain = ctx.createGain();
          nGain.gain.setValueAtTime(0.24, t);
          nGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);

          noise.connect(bpf);
          bpf.connect(nGain);
          nGain.connect(this.masterGain);
          noise.start(t);
          noise.stop(t + 0.08);
        }
        break;
      }

      case 'gayo-bambu': {
        // Gayo (Aceh Tengah, Bener Meriah, Gayo Lues): bunyi kayu/bambu bernada
        const freqs = [528, 792];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const start = t + idx * 0.045;
          osc.frequency.setValueAtTime(f, start);
          osc.frequency.exponentialRampToValueAtTime(f * 0.94, start + 0.16);

          gain.gain.setValueAtTime(0.26 / (idx + 1), start);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);

          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(start);
          osc.stop(start + 0.19);
        });
        break;
      }

      case 'gong-alas': {
        // Alas, Singkil, Subulussalam, Aceh Tenggara: bunyi gong kecil
        const partials = [
          { freq: 220, amp: 0.28, dur: 0.65 },
          { freq: 334, amp: 0.14, dur: 0.45 },
          { freq: 542, amp: 0.08, dur: 0.28 }
        ];
        partials.forEach((p) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(p.freq, t);

          gain.gain.setValueAtTime(p.amp, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + p.dur);

          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(t);
          osc.stop(t + p.dur + 0.02);
        });
        break;
      }

      case 'petik-barat': {
        // Pantai barat-selatan dan Simeulue: bunyi petik senar pendek
        const notes = [392, 493.88];
        notes.forEach((freq, idx) => {
          const start = t + idx * 0.055;
          const osc = ctx.createOscillator();
          const lpf = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, start);

          lpf.type = 'lowpass';
          lpf.frequency.setValueAtTime(2400, start);
          lpf.frequency.exponentialRampToValueAtTime(420, start + 0.24);

          gain.gain.setValueAtTime(0.2, start);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.26);

          osc.connect(lpf);
          lpf.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(start);
          osc.stop(start + 0.28);
        });
        break;
      }

      case 'rebana-tamiang': {
        // Tamiang: bunyi rebana ringan (nada membran tinggi + gemerincing halus)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(290, t);
        osc.frequency.exponentialRampToValueAtTime(145, t + 0.16);

        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.19);

        if (this.noiseBuffer) {
          const noise = ctx.createBufferSource();
          noise.buffer = this.noiseBuffer;
          const hpf = ctx.createBiquadFilter();
          hpf.type = 'highpass';
          hpf.frequency.setValueAtTime(3600, t);

          const nGain = ctx.createGain();
          nGain.gain.setValueAtTime(0.16, t);
          nGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);

          noise.connect(hpf);
          hpf.connect(nGain);
          nGain.connect(this.masterGain);
          noise.start(t);
          noise.stop(t + 0.12);
        }
        break;
      }
    }
  }
}

export const audioEngine = new NusantaraAudioEngine();
