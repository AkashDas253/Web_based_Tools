export class Exporter {
    static async exportToWAV(events, synthParams) {
        if (!events || events.length === 0) return;

        const sampleRate = 44100;
        const maxTimeMs = events[events.length - 1].time + (synthParams.release * 1000) + 1000;
        const totalFrames = Math.ceil((maxTimeMs / 1000) * sampleRate);

        const offlineCtx = new OfflineAudioContext(1, totalFrames, sampleRate);
        const masterGain = offlineCtx.createGain();
        masterGain.gain.value = synthParams.volume;
        masterGain.connect(offlineCtx.destination);

        const activeNodes = new Map();

        events.forEach(event => {
            const startTime = event.time / 1000;

            if (event.type === 'ON') {
                const osc = offlineCtx.createOscillator();
                const noteGain = offlineCtx.createGain();

                osc.type = synthParams.waveform;
                osc.frequency.setValueAtTime(event.freq, startTime);

                noteGain.gain.setValueAtTime(0, startTime);
                noteGain.gain.linearRampToValueAtTime(1, startTime + synthParams.attack);

                osc.connect(noteGain);
                noteGain.connect(masterGain);
                osc.start(startTime);

                activeNodes.set(event.noteId, { osc, noteGain });
            } else if (event.type === 'OFF' && activeNodes.has(event.noteId)) {
                const { osc, noteGain } = activeNodes.get(event.noteId);
                const stopTime = startTime;

                noteGain.gain.cancelScheduledValues(stopTime);
                noteGain.gain.setValueAtTime(noteGain.gain.value, stopTime);
                noteGain.gain.exponentialRampToValueAtTime(0.0001, stopTime + synthParams.release);

                osc.stop(stopTime + synthParams.release);
                activeNodes.delete(event.noteId);
            }
        });

        const renderedBuffer = await offlineCtx.startRendering();
        const wavBlob = Exporter.bufferToWavBlob(renderedBuffer);
        Exporter.downloadBlob(wavBlob, 'synth_recording.wav');
    }

    static bufferToWavBlob(buffer) {
        const numOfChan = buffer.numberOfChannels;
        const length = buffer.length * numOfChan * 2 + 44;
        const out = new DataView(new ArrayBuffer(length));
        let channels = [], sampleRate = buffer.sampleRate, offset = 0, pos = 0;

        function setUint16(data) { out.setUint16(pos, data, true); pos += 2; }
        function setUint32(data) { out.setUint32(pos, data, true); pos += 4; }

        setUint32(0x46464952); // "RIFF"
        setUint32(length - 8);
        setUint32(0x45564157); // "WAVE"
        setUint32(0x20746d66); // "fmt "
        setUint32(16);         // Subchunk1Size
        setUint16(1);          // PCM
        setUint16(numOfChan);
        setUint32(sampleRate);
        setUint32(sampleRate * 2 * numOfChan);
        setUint16(numOfChan * 2);
        setUint16(16);         // Bits per sample
        setUint32(0x61746164); // "data"
        setUint32(length - pos - 4);

        for (let i = 0; i < buffer.numberOfChannels; i++) {
            channels.push(buffer.getChannelData(i));
        }

        while (offset < buffer.length) {
            for (let i = 0; i < numOfChan; i++) {
                let sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
                out.setInt16(pos, sample, true);
                pos += 2;
            }
            offset++;
        }
        return new Blob([out.buffer], { type: 'audio/wav' });
    }

    static exportToMIDI(events) {
        if (!events || events.length === 0) return;

        const header = [
            0x4d, 0x54, 0x68, 0x64,
            0x00, 0x00, 0x00, 0x06,
            0x00, 0x00,
            0x00, 0x01,
            0x01, 0xe0
        ];

        let trackEvents = [];
        let lastTimeMs = 0;

        events.forEach(ev => {
            const deltaMs = ev.time - lastTimeMs;
            lastTimeMs = ev.time;
            const ticks = Math.round((deltaMs / 1000) * 480 * 2);

            const midiNote = Exporter.noteIdToMIDINumber(ev.noteId);
            const status = ev.type === 'ON' ? 0x90 : 0x80;
            const velocity = ev.type === 'ON' ? 0x64 : 0x00;

            trackEvents.push(...Exporter.writeVarInt(ticks));
            trackEvents.push(status, midiNote, velocity);
        });

        trackEvents.push(0x00, 0xff, 0x2f, 0x00);

        const trackLength = trackEvents.length;
        const trackHeader = [
            0x4d, 0x54, 0x72, 0x6b,
            (trackLength >> 24) & 0xff,
            (trackLength >> 16) & 0xff,
            (trackLength >> 8) & 0xff,
            trackLength & 0xff
        ];

        const midiFile = new Uint8Array([...header, ...trackHeader, ...trackEvents]);
        const blob = new Blob([midiFile], { type: 'audio/midi' });
        Exporter.downloadBlob(blob, 'synth_recording.mid');
    }

    static noteIdToMIDINumber(noteId) {
        const match = noteId.match(/^([A-G]#?)(\d+)$/);
        if (!match) return 60;
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const semitones = noteNames.indexOf(match[1]);
        const octave = parseInt(match[2], 10);
        return (octave + 1) * 12 + semitones;
    }

    static writeVarInt(value) {
        let buffer = value & 0x7f;
        while ((value >>= 7)) {
            buffer <<= 8;
            buffer |= (value & 0x7f) | 0x80;
        }
        const result = [];
        while (true) {
            result.push(buffer & 0xff);
            if (buffer & 0x80) buffer >>= 8;
            else break;
        }
        return result;
    }

    static downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}