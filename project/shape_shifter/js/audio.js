class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  playTone(freq, duration, type = "sine") {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn("Audio playback non-fatal error:", e);
    }
  }

  shift() { 
    this.playTone(440, 0.08, "triangle"); 
  }

  smash() { 
    this.playTone(120, 0.15, "sawtooth"); 
  }

  die() { 
    this.playTone(90, 0.25, "square"); 
  }

  win() {
    this.playTone(523.25, 0.1, "sine");
    setTimeout(() => this.playTone(659.25, 0.12, "sine"), 100);
    setTimeout(() => this.playTone(783.99, 0.18, "sine"), 200);
  }
}

export const sound = new SoundEngine();