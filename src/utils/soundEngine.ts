// Web Audio API Sound Engine for Pip's Midnight Nursery
// Supports celesta chimes, UI clicks, wooden blocks, baby rattle, and music-box winding

class NurserySoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = window.localStorage.getItem('pip_nursery_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    }
  }

  private getContext(): AudioContext | null {
    if (this.isMuted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('pip_nursery_muted', String(muted));
    }
  }

  // Soft celesta / music-box note for Lullaby Lab
  public playMusicBoxNote(freq: number, duration = 1.1, warmth = 0.5) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gain = ctx.createGain();
    const overtoneGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Subtle bell harmonic at 2x or 3x frequency
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800 + (1 - warmth) * 2400, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    overtoneGain.gain.setValueAtTime(0.001, now);
    overtoneGain.gain.linearRampToValueAtTime(0.035 * (1 - warmth * 0.5), now + 0.01);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0005, now + duration * 0.45);

    osc.connect(filter);
    overtone.connect(overtoneGain);
    overtoneGain.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + duration);
    overtone.stop(now + duration);
  }

  // Satisfying tactile UI click chime (+3 pts Side Quest)
  public playClickChime(pitchMultiplier = 1) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 587.33 * pitchMultiplier; // D5
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, now + 0.065);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.095);
  }

  // Winding key mechanical ratchet click
  public playWindKeyTick(step = 0) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320 + (step % 5) * 45, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Playful baby rattle / shaker sound
  public playRattleShake() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Create short filtered white noise burst + tiny bell chime
    const bufferSize = ctx.sampleRate * 0.09;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.Q.setValueAtTime(2.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    // Accompany with a gentle high bell ping
    this.playMusicBoxNote(1046.5, 0.35, 0.6); // C6
  }

  // Pip's giggle chime (3 quick rising notes)
  public playPipGiggle() {
    const ctx = this.getContext();
    if (!ctx) return;
    const notes = [659.25, 783.99, 987.77, 1174.66]; // E5, G5, B5, D6
    notes.forEach((n, idx) => {
      setTimeout(() => {
        this.playMusicBoxNote(n, 0.35, 0.4);
      }, idx * 75);
    });
  }

  // Hidden Easter Egg starlight fanfare
  public playEasterEggMelody() {
    const ctx = this.getContext();
    if (!ctx) return;
    const melody = [
      { freq: 523.25, delay: 0 },    // C5
      { freq: 659.25, delay: 110 },  // E5
      { freq: 783.99, delay: 220 },  // G5
      { freq: 987.77, delay: 330 },  // B5
      { freq: 1046.5, delay: 460 },  // C6
      { freq: 1318.5, delay: 620 },  // E6
    ];
    melody.forEach((item) => {
      setTimeout(() => {
        this.playMusicBoxNote(item.freq, 0.9, 0.3);
      }, item.delay);
    });
  }
}

export const soundEngine = new NurserySoundEngine();
