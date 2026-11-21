const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Base QWERTY Ergonomic Keyboard Sets
const ROW_BOTTOM    = { white: ['z', 'x', 'c', 'v', 'b', 'n', 'm'], black: ['s', 'd', 'g', 'h', 'j'] };
const ROW_MID_LEFT  = { white: ['q', 'w', 'e', 'r', 't', 'y', 'u'], black: ['2', '3', '5', '6', '7'] };
const ROW_MID_RIGHT = { white: ['i', 'o', 'p', '[', ']', '\\', ';'], black: ['8', '9', '0', '-', '='] };
const HIGH_C_KEY    = { white: ['\''], black: [] };

export class KeyboardUI {
    constructor(containerEl, octaveLabelEl) {
        this.container = containerEl;
        this.octaveLabel = octaveLabelEl;
        this.baseOctave = 4;
        this.keyCount = 25;
        this.layoutMode = 'block'; // 'block' or 'split'
        this.keyToNoteMap = {};
    }

    calculateFrequency(semitoneFromC4) {
        return 440 * Math.pow(2, (semitoneFromC4 - 9) / 12);
    }

    /**
     * Dynamically generates active layout tiers based on layout mode and key count
     */
    getLayoutTiers() {
        if (this.layoutMode === 'split') {
            if (this.keyCount === 13) {
                return [ROW_MID_LEFT, HIGH_C_KEY];
            } else if (this.keyCount === 25) {
                // 25 Keys Split: Left Hand (Q-U) | Right Hand (I-;) | High C (')
                return [ROW_MID_LEFT, ROW_MID_RIGHT, HIGH_C_KEY];
            } else {
                // 37 Keys Split: Oct 1 (Z-M) | Left Hand (Q-U) | Right Hand (I-;) | High C (')
                return [ROW_BOTTOM, ROW_MID_LEFT, ROW_MID_RIGHT, HIGH_C_KEY];
            }
        } else {
            // DAW Block Mode (Stacked Rows Bottom -> Middle -> Top)
            if (this.keyCount === 13) {
                return [ROW_BOTTOM, HIGH_C_KEY];
            } else if (this.keyCount === 25) {
                return [ROW_BOTTOM, ROW_MID_LEFT, HIGH_C_KEY];
            } else {
                return [ROW_BOTTOM, ROW_MID_LEFT, ROW_MID_RIGHT, HIGH_C_KEY];
            }
        }
    }

    getKeyBinding(semitoneIndex, type, whiteInOctave, blackInOctave) {
        const tiers = this.getLayoutTiers();
        const tierIndex = Math.floor(semitoneIndex / 12);

        if (tierIndex >= tiers.length) return '';

        const tier = tiers[tierIndex];

        return type === 'white' 
            ? (tier.white[whiteInOctave] || '') 
            : (tier.black[blackInOctave] || '');
    }

    generateKeys(startOctave, count) {
        const keys = [];
        let whiteInOctave = 0;
        let blackInOctave = 0;

        for (let i = 0; i < count; i++) {
            const noteIndexInOctave = i % 12;

            if (noteIndexInOctave === 0) {
                whiteInOctave = 0;
                blackInOctave = 0;
            }

            const noteName = NOTE_NAMES[noteIndexInOctave];
            const octaveOffset = Math.floor(i / 12);
            const currentOctave = startOctave + octaveOffset;
            const isBlack = noteName.includes('#');
            const type = isBlack ? 'black' : 'white';

            const keyBind = this.getKeyBinding(
                i, 
                type, 
                whiteInOctave, 
                blackInOctave
            );

            if (isBlack) {
                blackInOctave++;
            } else {
                whiteInOctave++;
            }

            const semitoneFromC4 = (startOctave - 4) * 12 + i;

            keys.push({
                noteId: `${noteName}${currentOctave}`,
                displayName: `${noteName}${currentOctave}`,
                freq: this.calculateFrequency(semitoneFromC4),
                type: type,
                keyBind: keyBind
            });
        }

        return keys;
    }

    render(onNoteStart, onNoteEnd) {
        this.container.innerHTML = '';
        this.keyToNoteMap = {};
        const currentNotes = this.generateKeys(this.baseOctave, this.keyCount);

        currentNotes.forEach(noteData => {
            if (noteData.keyBind) {
                this.keyToNoteMap[noteData.keyBind.toLowerCase()] = noteData;
            }

            const keyEl = document.createElement('div');
            keyEl.classList.add('key', noteData.type);
            keyEl.dataset.note = noteData.noteId;

            const labelEl = document.createElement('span');
            labelEl.classList.add('key-label');
            const bindText = noteData.keyBind ? noteData.keyBind.toUpperCase() : '&nbsp;';
            labelEl.innerHTML = `${bindText}<br><small style="opacity:0.6">${noteData.displayName}</small>`;
            keyEl.appendChild(labelEl);

            this.container.appendChild(keyEl);

            keyEl.addEventListener('mousedown', (e) => {
                e.preventDefault();
                onNoteStart(noteData.noteId, noteData.freq);
            });
            keyEl.addEventListener('mouseup', () => onNoteEnd(noteData.noteId));
            keyEl.addEventListener('mouseleave', () => onNoteEnd(noteData.noteId));
        });

        const maxOctave = this.baseOctave + Math.floor((this.keyCount - 1) / 12);
        this.octaveLabel.innerText = `C${this.baseOctave} – C${maxOctave}`;
    }

    setLayoutMode(mode, onNoteStart, onNoteEnd) {
        this.layoutMode = mode;
        this.render(onNoteStart, onNoteEnd);
    }

    setKeyCount(count, onNoteStart, onNoteEnd) {
        this.keyCount = parseInt(count, 10);
        this.render(onNoteStart, onNoteEnd);
    }

    changeOctave(delta, onNoteStart, onNoteEnd) {
        const newOctave = this.baseOctave + delta;
        if (newOctave >= 2 && newOctave <= 5) {
            this.baseOctave = newOctave;
            this.render(onNoteStart, onNoteEnd);
        }
    }

    updateKeyHighlight(noteId, isActive) {
        const keyEl = this.container.querySelector(`[data-note="${noteId}"]`);
        if (keyEl) {
            keyEl.classList.toggle('active', isActive);
        }
    }
}