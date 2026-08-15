import { AudioEngine } from './audioEngine.js';
import { KeyboardUI } from './keyboardUI.js';
import { Sequencer } from './sequencer.js';
import { StorageManager } from './storage.js';
import { Exporter } from './exporter.js';

// DOM Elements
const keyboardContainer = document.getElementById('keyboard');
const octaveLabel = document.getElementById('octave-label');
const keyCountSelect = document.getElementById('key-count');
const layoutModeSelect = document.getElementById('layout-mode');
const instructionsEl = document.getElementById('instructions');
const btnRecord = document.getElementById('btn-record');
const btnPlay = document.getElementById('btn-play');
const btnClear = document.getElementById('btn-clear');
const btnSave = document.getElementById('btn-save');
const btnExportWav = document.getElementById('btn-export-wav');
const btnExportMidi = document.getElementById('btn-export-midi');
const btnLoadFile = document.getElementById('btn-load-file');
const fileInput = document.getElementById('file-input');
const statusLabel = document.getElementById('rec-status');

// Modules
const audio = new AudioEngine();
const keyboard = new KeyboardUI(keyboardContainer, octaveLabel);
const sequencer = new Sequencer();

function triggerNoteOn(noteId, freq) {
    audio.noteOn(noteId, freq);
    keyboard.updateKeyHighlight(noteId, true);
    sequencer.recordEvent('ON', noteId, freq);
}

function triggerNoteOff(noteId) {
    audio.noteOff(noteId);
    keyboard.updateKeyHighlight(noteId, false);
    sequencer.recordEvent('OFF', noteId);
}

function updateUIState() {
    const hasEvents = sequencer.recordedEvents.length > 0;
    btnPlay.disabled = sequencer.isRecording || !hasEvents;
    btnClear.disabled = sequencer.isRecording || !hasEvents;
    btnSave.disabled = sequencer.isRecording || !hasEvents;
    btnExportWav.disabled = sequencer.isRecording || !hasEvents;
    btnExportMidi.disabled = sequencer.isRecording || !hasEvents;
}

function updateInstructions() {
    if (!instructionsEl) return;
    
    const layout = keyboard.layoutMode;
    const count = keyboard.keyCount;

    if (layout === 'split') {
        if (count === 37) {
            instructionsEl.innerHTML = `<strong>37-Key Split:</strong> Oct 1 (Z–M / S–J) | Left Hand (Q–U / 2–7) | Right Hand (I–; / 8–=) | High C (')`;
        } else if (count === 25) {
            instructionsEl.innerHTML = `<strong>25-Key Split:</strong> Left Hand (Q–U / 2–7) | Right Hand (I–; / 8–=) | High C (')`;
        } else {
            instructionsEl.innerHTML = `<strong>13-Key Split:</strong> Left Hand (Q–U / 2–7) | High C (')`;
        }
    } else {
        if (count === 37) {
            instructionsEl.innerHTML = `<strong>37-Key DAW Block:</strong> Oct 1 (Z–M / S–J) | Oct 2 (Q–U / 2–7) | Oct 3 (I–; / 8–=) | High C (')`;
        } else if (count === 25) {
            instructionsEl.innerHTML = `<strong>25-Key DAW Block:</strong> Oct 1 (Z–M / S–J) | Oct 2 (Q–U / 2–7) | High C (')`;
        } else {
            instructionsEl.innerHTML = `<strong>13-Key DAW Block:</strong> Oct 1 (Z–M / S–J) | High C (')`;
        }
    }
}

// Initial UI Render & Instructions Setup
keyboard.render(triggerNoteOn, triggerNoteOff);
updateInstructions();

// Load persisted sequence from LocalStorage if available
const savedData = StorageManager.loadFromLocalStorage();
if (savedData) {
    sequencer.loadSequenceData(savedData);
    statusLabel.innerText = `Status: Loaded ${sequencer.recordedEvents.length} saved events`;
    updateUIState();
}

// Audio Controls
document.getElementById('waveform').addEventListener('change', (e) => audio.setWaveform(e.target.value));
document.getElementById('attack').addEventListener('input', (e) => {
    audio.setAttack(e.target.value);
    document.getElementById('attack-val').innerText = e.target.value;
});
document.getElementById('release').addEventListener('input', (e) => {
    audio.setRelease(e.target.value);
    document.getElementById('release-val').innerText = e.target.value;
});
document.getElementById('volume').addEventListener('input', (e) => audio.setVolume(e.target.value));

// Keyboard Size Control
if (keyCountSelect) {
    keyCountSelect.addEventListener('change', (e) => {
        keyboard.setKeyCount(e.target.value, triggerNoteOn, triggerNoteOff);
        updateInstructions();
    });
}

// Key Layout Mode Control
if (layoutModeSelect) {
    layoutModeSelect.addEventListener('change', (e) => {
        keyboard.setLayoutMode(e.target.value, triggerNoteOn, triggerNoteOff);
        updateInstructions();
    });
}

// Octave Steppers
document.getElementById('octave-down').addEventListener('click', () => {
    keyboard.changeOctave(-1, triggerNoteOn, triggerNoteOff);
});
document.getElementById('octave-up').addEventListener('click', () => {
    keyboard.changeOctave(1, triggerNoteOn, triggerNoteOff);
});

// Sequencer Controls
btnRecord.addEventListener('click', () => {
    if (sequencer.isPlaying) return;

    if (!sequencer.isRecording) {
        sequencer.startRecording();
        btnRecord.classList.add('recording');
        btnRecord.innerText = '⏹️ Stop';
        statusLabel.innerText = 'Status: Recording...';
        updateUIState();
    } else {
        const count = sequencer.stopRecording();
        btnRecord.classList.remove('recording');
        btnRecord.innerText = '🔴 Record';
        statusLabel.innerText = `Status: Recorded ${count} events`;
        updateUIState();
    }
});

btnPlay.addEventListener('click', () => {
    if (sequencer.isRecording || sequencer.recordedEvents.length === 0) return;

    statusLabel.innerText = 'Status: Playing...';
    btnRecord.disabled = true;
    updateUIState();

    sequencer.play(
        (noteId, freq) => {
            audio.noteOn(noteId, freq);
            keyboard.updateKeyHighlight(noteId, true);
        },
        (noteId) => {
            audio.noteOff(noteId);
            keyboard.updateKeyHighlight(noteId, false);
        },
        () => {
            statusLabel.innerText = 'Status: Idle';
            btnRecord.disabled = false;
            updateUIState();
        }
    );
});

btnClear.addEventListener('click', () => {
    sequencer.clear();
    statusLabel.innerText = 'Status: Cleared';
    updateUIState();
});

// Storage and Export Event Listeners
btnSave.addEventListener('click', () => {
    const data = sequencer.getSequenceData();
    StorageManager.saveToLocalStorage(data);
    StorageManager.exportToJSONFile(data);
    statusLabel.innerText = 'Status: Saved & JSON Exported';
});

btnExportWav.addEventListener('click', async () => {
    statusLabel.innerText = 'Status: Rendering WAV...';
    await Exporter.exportToWAV(sequencer.recordedEvents, {
        waveform: audio.waveform,
        attack: audio.attack,
        release: audio.release,
        volume: audio.volume
    });
    statusLabel.innerText = 'Status: WAV Exported';
});

btnExportMidi.addEventListener('click', () => {
    Exporter.exportToMIDI(sequencer.recordedEvents);
    statusLabel.innerText = 'Status: MIDI Exported';
});

btnLoadFile.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const parsed = await StorageManager.parseJSONFile(file);
        sequencer.loadSequenceData(parsed);
        statusLabel.innerText = `Status: Loaded ${sequencer.recordedEvents.length} events`;
        updateUIState();
    } catch (err) {
        alert(err.message);
    }
    fileInput.value = '';
});

// Keyboard Hotkey Handlers
window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    const noteData = keyboard.keyToNoteMap[key];
    if (noteData) triggerNoteOn(noteData.noteId, noteData.freq);
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    const noteData = keyboard.keyToNoteMap[key];
    if (noteData) triggerNoteOff(noteData.noteId);
});