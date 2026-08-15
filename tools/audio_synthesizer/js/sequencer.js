export class Sequencer {
    constructor() {
        this.isRecording = false;
        this.isPlaying = false;
        this.recordStartTime = 0;
        this.recordedEvents = [];
        this.playbackTimeouts = [];
    }

    startRecording() {
        this.isRecording = true;
        this.recordedEvents = [];
        this.recordStartTime = Date.now();
    }

    stopRecording() {
        this.isRecording = false;
        return this.recordedEvents.length;
    }

    recordEvent(type, noteId, freq = null) {
        if (!this.isRecording) return;
        const time = Date.now() - this.recordStartTime;
        const event = { type, noteId, time };
        if (freq) event.freq = freq;
        this.recordedEvents.push(event);
    }

    play(onNoteStart, onNoteEnd, onComplete) {
        if (this.recordedEvents.length === 0) return;
        this.isPlaying = true;

        this.recordedEvents.forEach(event => {
            const timer = setTimeout(() => {
                if (event.type === 'ON') {
                    onNoteStart(event.noteId, event.freq);
                } else if (event.type === 'OFF') {
                    onNoteEnd(event.noteId);
                }
            }, event.time);
            this.playbackTimeouts.push(timer);
        });

        const lastEventTime = this.recordedEvents[this.recordedEvents.length - 1].time + 1000;
        const endTimer = setTimeout(() => {
            this.stopPlayback();
            if (onComplete) onComplete();
        }, lastEventTime);

        this.playbackTimeouts.push(endTimer);
    }

    stopPlayback() {
        this.playbackTimeouts.forEach(clearTimeout);
        this.playbackTimeouts = [];
        this.isPlaying = false;
    }

    clear() {
        this.stopPlayback();
        this.recordedEvents = [];
    }

    getSequenceData() {
        return {
            timestamp: new Date().toISOString(),
            events: this.recordedEvents
        };
    }

    loadSequenceData(data) {
        if (Array.isArray(data)) {
            this.recordedEvents = data;
        } else if (data && Array.isArray(data.events)) {
            this.recordedEvents = data.events;
        }
    }
}