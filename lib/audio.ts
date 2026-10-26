import { Howl, Howler } from 'howler';
import { CONFIG, EDUCATION_ERAS } from './data';

type SoundKey = keyof typeof CONFIG.audioPaths;

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private howls: Partial<Record<SoundKey, Howl>> = {};
  private howlLoaded: Partial<Record<SoundKey, boolean>> = {};
  private initialized = false;
  private muted = false;
  private volume = 0.72;
  private lastTickAt = 0;

  /**
   * Dipanggil setelah interaksi klik pertama di layar Loader ("KLIK UNTUK MULAI")
   */
  public init(initialVolume = 0.72, initialMuted = false): void {
    this.volume = initialVolume;
    this.muted = initialMuted;

    if (typeof window === 'undefined') return;

    if (this.initialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (AudioCtx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Fade-in master volume dengan mulus
      const targetGain = this.muted ? 0.0001 : Math.max(0.0001, this.volume);
      this.masterGain.gain.exponentialRampToValueAtTime(
        targetGain,
        this.ctx.currentTime + 0.9
      );

      this.createNoiseBuffer();
      this.startAmbientDrone();
      this.startStageHum();
    }

    Howler.volume(this.muted ? 0 : this.volume);
    Howler.mute(this.muted);
    this.setupHowlerFallbacks();

    this.initialized = true;
  }

  /**
   * Siapkan instance Howler untuk file di /public/audio/*.mp3 jika tersedia,
   * dan otomatis fallback ke Web Audio API synthesizer bila file belum ada / gagal dimuat.
   */
  private setupHowlerFallbacks(): void {
    const entries = Object.entries(CONFIG.audioPaths) as [SoundKey, string][];

    entries.forEach(([key, src]) => {
      try {
        const isAmbient = key === 'ambient';
        const howl = new Howl({
          src: [src],
          loop: isAmbient,
          volume: isAmbient ? 0.28 : 0.55,
          preload: true,
          onload: () => {
            // Hanya tandai aktif bila durasi > 0.08 detik (bukan file placeholder kosong)
            if (howl.duration() > 0.08) {
              this.howlLoaded[key] = true;
              if (isAmbient && !this.muted) {
                howl.fade(0, 0.28, 1200);
                howl.play();
              }
            }
          },
          onloaderror: () => {
            this.howlLoaded[key] = false;
          }
        });
        this.howls[key] = howl;
      } catch {
        this.howlLoaded[key] = false;
      }
    });
  }

  private createNoiseBuffer(): void {
    if (!this.ctx) return;
    const sr = this.ctx.sampleRate;
    const length = sr * 3;
    const buffer = this.ctx.createBuffer(1, length, sr);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      channel[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  /**
   * Ambient sci-fi drone: 2 oscillator (55Hz sawtooth & 110Hz sine) + lowpass filter + LFO
   */
  private startAmbientDrone(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const oscLow = this.ctx.createOscillator();
    const oscSub = this.ctx.createOscillator();
    oscLow.type = 'sawtooth';
    oscLow.frequency.setValueAtTime(55, now);
    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(110, now);

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(175, now);
    lowpass.Q.setValueAtTime(2.4, now);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.13, now);
    lfoGain.gain.setValueAtTime(68, now);
    lfo.connect(lfoGain);
    lfoGain.connect(lowpass.frequency);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.001, now);
    droneGain.gain.exponentialRampToValueAtTime(0.052, now + 1.6);

    oscLow.connect(lowpass);
    oscSub.connect(lowpass);
    lowpass.connect(droneGain);
    droneGain.connect(this.masterGain);

    oscLow.start(now);
    oscSub.start(now);
    lfo.start(now);
  }

  /**
   * Stage hum: white noise lembut yang difilter bandpass
   */
  private startStageHum(): void {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(132, now);
    bandpass.Q.setValueAtTime(4.2, now);

    const humGain = this.ctx.createGain();
    humGain.gain.setValueAtTime(0.022, now);

    noise.connect(bandpass);
    bandpass.connect(humGain);
    humGain.connect(this.masterGain);
    noise.start(now);
  }

  /**
   * UI Hover: blip pendek tinggi (sine 1200Hz, 40ms)
   */
  public playHover(): void {
    if (!this.initialized || this.muted) return;
    if (this.howlLoaded.hover && this.howls.hover) {
      this.howls.hover.play();
      return;
    }
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(1460, now + 0.04);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.042);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  /**
   * UI Klik: click-tick + chirp naik (square 400→900Hz, 90ms)
   */
  public playClick(): void {
    if (!this.initialized || this.muted) return;
    if (this.howlLoaded.click && this.howls.click) {
      this.howls.click.play();
      return;
    }
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.09);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2500, now);

    gain.gain.setValueAtTime(0.068, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.092);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.095);
  }

  /**
   * Tick halus saat scramble huruf
   */
  public playScrambleTick(): void {
    if (!this.initialized || this.muted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    if (now - this.lastTickAt < 0.032) return;
    this.lastTickAt = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1580 + Math.random() * 360, now);
    gain.gain.setValueAtTime(0.022, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.018);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.02);
  }

  /**
   * Glitch noise burst pendek 30–80ms
   */
  public playGlitch(): void {
    if (!this.initialized || this.muted) return;
    if (this.howlLoaded.glitch && this.howls.glitch) {
      this.howls.glitch.play();
      return;
    }
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;

    const now = this.ctx.currentTime;
    const duration = 0.032 + Math.random() * 0.048;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(950 + Math.random() * 2300, now);
    bp.Q.setValueAtTime(2.6, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.072, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    src.connect(bp);
    bp.connect(gain);
    gain.connect(this.masterGain);
    src.start(now, Math.random() * 1.8, duration);
  }

  /**
   * Transisi Ganti Outfit:
   * - Whoosh bandpass sweep (200→4000Hz selama 0.8s)
   * - Scan beep naik nada
   * - Impact bass (sine 80→40Hz) saat materialize
   * - Nada khas jenjang (SMP C-E-G, SMK D-F#-A, KULIAH E-G#-B-E)
   */
  public playOutfitMorph(eraIndex: number): void {
    if (!this.initialized || this.muted) return;
    if (this.howlLoaded.morph && this.howls.morph) {
      this.howls.morph.play();
    }
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;

    const now = this.ctx.currentTime;

    // 1. Whoosh noise bandpass sweep 200 -> 4000Hz
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.setValueAtTime(2.2, now);
    bp.frequency.setValueAtTime(200, now);
    bp.frequency.exponentialRampToValueAtTime(4000, now + 0.82);

    const whooshGain = this.ctx.createGain();
    whooshGain.gain.setValueAtTime(0.001, now);
    whooshGain.gain.linearRampToValueAtTime(0.17, now + 0.25);
    whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.86);

    noise.connect(bp);
    bp.connect(whooshGain);
    whooshGain.connect(this.masterGain);
    noise.start(now, 0, 0.88);

    // 2. Scan laser beep naik nada
    const scanOsc = this.ctx.createOscillator();
    const scanGain = this.ctx.createGain();
    scanOsc.type = 'sine';
    scanOsc.frequency.setValueAtTime(310, now);
    scanOsc.frequency.exponentialRampToValueAtTime(1520, now + 0.76);
    scanGain.gain.setValueAtTime(0.001, now);
    scanGain.gain.linearRampToValueAtTime(0.058, now + 0.14);
    scanGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.78);

    scanOsc.connect(scanGain);
    scanGain.connect(this.masterGain);
    scanOsc.start(now);
    scanOsc.stop(now + 0.8);

    // 3. Impact sub-bass (80 -> 40Hz) saat outfit materialize
    const impactAt = now + 0.36;
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(80, impactAt);
    bassOsc.frequency.exponentialRampToValueAtTime(40, impactAt + 0.46);
    bassGain.gain.setValueAtTime(0.24, impactAt);
    bassGain.gain.exponentialRampToValueAtTime(0.001, impactAt + 0.5);

    bassOsc.connect(bassGain);
    bassGain.connect(this.masterGain);
    bassOsc.start(impactAt);
    bassOsc.stop(impactAt + 0.52);

    // 4. Motif musikal khas tiap jenjang
    this.playEraMotif(eraIndex, now + 0.3);
  }

  private playEraMotif(eraIndex: number, startAt: number): void {
    if (!this.ctx || !this.masterGain) return;
    const era = EDUCATION_ERAS[eraIndex];
    if (!era) return;

    if (era.chordMode === 'arpeggio-smp') {
      // SMP: Arpeggio ceria C - E - G
      era.chordNotes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const t = startAt + idx * 0.095;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq * 2, t);
        gain.gain.setValueAtTime(0.085, t);
        gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.36);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.38);
      });
    } else if (era.chordMode === 'arpeggio-smk') {
      // SMK: Arpeggio mantap D - F# - A
      era.chordNotes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const t = startAt + idx * 0.105;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1650, t);
        gain.gain.setValueAtTime(0.078, t);
        gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.42);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.44);
      });
    } else {
      // KULIAH: Chord megah E - G# - B - E tinggi
      era.chordNotes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const t = startAt + idx * 0.028;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, t);
        osc2.frequency.setValueAtTime(freq * 1.004, t);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, t);
        filter.frequency.exponentialRampToValueAtTime(720, t + 0.92);
        gain.gain.setValueAtTime(0.058, t);
        gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.96);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.98);
        osc2.stop(t + 0.98);
      });
    }
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    Howler.mute(muted);
    if (this.ctx && this.masterGain) {
      const target = muted ? 0.0001 : Math.max(0.0001, this.volume);
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.06);
    }
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.muted ? 0 : this.volume);
    if (this.ctx && this.masterGain && !this.muted) {
      const target = Math.max(0.0001, this.volume);
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.06);
    }
  }
}

export const audioManager = new AudioManager();

