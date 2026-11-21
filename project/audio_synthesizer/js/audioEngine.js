export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.activeNotes = new Map();
        this.waveform = 'sawtooth';
        this.attack = 0.05;
        this.release = 0.3;
        this.volume = 0.5;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setWaveform(type) {
        this.waveform = type;
    }

    setAttack(val) {
        this.attack = parseFloat(val);
    }

    setRelease(val) {
        this.release = parseFloat(val);
    }

    setVolume(val) {
        this.volume = parseFloat(val);
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
    }

    noteOn(noteId, frequency) {
        this.init();
        if (this.activeNotes.has(noteId)) return;

        const osc = this.ctx.createOscillator();
        osc.type = this.waveform;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        const noteGain = this.ctx.createGain();
        noteGain.gain.setValueAtTime(0, this.ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + this.attack);

        osc.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start();
        this.activeNotes.set(noteId, { osc, noteGain });
    }

    noteOff(noteId) {
        if (!this.activeNotes.has(noteId)) return;

        const { osc, noteGain } = this.activeNotes.get(noteId);
        const now = this.ctx.currentTime;

        noteGain.gain.cancelScheduledValues(now);
        noteGain.gain.setValueAtTime(noteGain.gain.value, now);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + this.release);

        osc.stop(now + this.release);
        setTimeout(() => {
            osc.disconnect();
            noteGain.disconnect();
        }, this.release * 1000);

        this.activeNotes.delete(noteId);
    }
}