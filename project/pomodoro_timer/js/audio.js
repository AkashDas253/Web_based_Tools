let audioCtx = null;
let noiseNode = null;
let noiseGain = null;
let isNoisePlaying = false;

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

export function playAlarm() {
    initAudioContext();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 1.2);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1.2);
}

export function toggleWhiteNoise() {
    initAudioContext();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (isNoisePlaying) {
        if (noiseNode) {
            noiseNode.stop();
            noiseNode.disconnect();
            noiseNode = null;
        }
        isNoisePlaying = false;
        return false;
    } else {
        // Create pink/white noise buffer
        const bufferSize = audioCtx.sampleRate * 2;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;

        // Lowpass filter to make noise softer/ambient
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.05, audioCtx.currentTime);

        noiseNode.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);

        noiseNode.start();
        isNoisePlaying = true;
        return true;
    }
}