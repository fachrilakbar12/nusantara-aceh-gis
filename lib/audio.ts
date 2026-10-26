import { InstrumenKlik, REGION_BY_ID } from './regions';

const BUNGONG_JEUMPA_PATH = '/audio/bungong-jeumpa.mp3';

class NusantaraAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgFadeGain: GainNode | null = null;
  private bgAudio: HTMLAudioElement | null = null;
  private bgSource: MediaElementAudioSourceNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private isMuted = false;
  private volume = 0.75;
  private lastHoverAt = 0;

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
   * Dipanggil saat pengguna menekan tombol "Masuk".
   * Memeriksa keberadaan /audio/bungong-jeumpa.mp3; jika tersedia, putar loop dengan fade-in 2 detik.
   * Jika tidak tersedia, panggil callback onMissingFile untuk menampilkan toast tanpa error.
   */
  public async startExperience(onMissingFile: (msg: string) => void): Promise<void> {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const res = await fetch(BUNGONG_JEUMPA_PATH, { method: 'HEAD' });
      const contentType = res.headers.get('content-type') || '';
      const contentLength = Number(res.headers.get('content-length') || '0');
      const exists = res.ok && !contentType.includes('text/html') && contentLength > 256;

      if (!exists) {
        onMissingFile('Taruh file instrumental di /public/audio/bungong-jeumpa.mp3');
        return;
      }

      if (!this.bgAudio) {
        const audio = new Audio(BUNGONG_JEUMPA_PATH);
        audio.loop = true;
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous';

        const fadeGain = ctx.createGain();
        fadeGain.gain.setValueAtTime(0.0001, ctx.currentTime);

        const source = ctx.createMediaElementSource(audio);
        source.connect(fadeGain);
        fadeGain.connect(this.masterGain);

        this.bgAudio = audio;
        this.bgSource = source;
        this.bgFadeGain = fadeGain;
      }

      await this.bgAudio.play();
      if (this.bgFadeGain) {
        const now = ctx.currentTime;
        this.bgFadeGain.gain.cancelScheduledValues(now);
        this.bgFadeGain.gain.setValueAtTime(0.0001, now);
        this.bgFadeGain.gain.linearRampToValueAtTime(0.45, now + 2.0);
      }
    } catch {
      onMissingFile('Taruh file instrumental di /public/audio/bungong-jeumpa.mp3');
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.applyMasterGain();
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
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

    gain.gain.setValueAtTime(0.08, t);
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
