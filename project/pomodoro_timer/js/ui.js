const elements = {
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    startBtn: document.getElementById('start-btn'),
    sessionCount: document.getElementById('session-count'),
    ambientBtn: document.getElementById('ambient-btn'),
    settingsModal: document.getElementById('settings-modal'),
    workInput: document.getElementById('work-duration'),
    shortInput: document.getElementById('short-break-duration'),
    longInput: document.getElementById('long-break-duration'),
    modes: {
        work: document.getElementById('work-btn'),
        shortBreak: document.getElementById('short-break-btn'),
        longBreak: document.getElementById('long-break-btn')
    }
};

export function updateDisplay(timeLeft) {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    elements.minutes.textContent = String(m).padStart(2, '0');
    elements.seconds.textContent = String(s).padStart(2, '0');
    document.title = `${elements.minutes.textContent}:${elements.seconds.textContent} - Pomodoro Timer`;
}

export function updateButtonState(isRunning) {
    elements.startBtn.textContent = isRunning ? 'Pause' : 'Start';
    elements.startBtn.classList.toggle('pause', isRunning);
}

export function setActiveMode(mode) {
    Object.entries(elements.modes).forEach(([key, el]) => {
        el.classList.toggle('active', key === mode);
    });
}

export function updateSessionCount(count) {
    elements.sessionCount.textContent = count % 4 === 0 && count > 0 ? '4' : count % 4;
}

export function toggleSettingsModal(show) {
    elements.settingsModal.classList.toggle('hidden', !show);
}

export function updateAmbientButtonState(isPlaying) {
    elements.ambientBtn.textContent = `🎵 White Noise: ${isPlaying ? 'On' : 'Off'}`;
    elements.ambientBtn.classList.toggle('active', isPlaying);
}

export function populateSettingsInputs(times) {
    elements.workInput.value = times.work / 60;
    elements.shortInput.value = times.shortBreak / 60;
    elements.longInput.value = times.longBreak / 60;
}

export function getSettingsInputValues() {
    return {
        work: parseInt(elements.workInput.value, 10),
        shortBreak: parseInt(elements.shortInput.value, 10),
        longBreak: parseInt(elements.longInput.value, 10)
    };
}