import { TimerState, tick, toggle, reset, TIMES, updateCustomTimes, getNextAutomaticMode, saveStateToStorage } from './timer.js';
import { updateDisplay, updateButtonState, setActiveMode, updateSessionCount, toggleSettingsModal, updateAmbientButtonState, populateSettingsInputs, getSettingsInputValues } from './ui.js';
import { playAlarm, toggleWhiteNoise } from './audio.js';

const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const settingsToggleBtn = document.getElementById('settings-toggle-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const ambientBtn = document.getElementById('ambient-btn');

// Initial UI synchronization from restored storage state
updateDisplay(TimerState.timeLeft);
setActiveMode(TimerState.mode);
updateSessionCount(TimerState.sessionsCompleted);
populateSettingsInputs(TIMES);

startBtn.addEventListener('click', () => {
    const isRunning = toggle();
    updateButtonState(isRunning);
    
    if (isRunning) {
        TimerState.intervalId = setInterval(() => {
            const continued = tick(updateDisplay);
            if (!continued) {
                clearInterval(TimerState.intervalId);
                playAlarm();
                
                const nextMode = getNextAutomaticMode();
                updateSessionCount(TimerState.sessionsCompleted);
                
                setTimeout(() => {
                    const time = reset(nextMode);
                    updateDisplay(time);
                    setActiveMode(nextMode);
                    updateButtonState(false);
                }, 1200);
            }
        }, 1000);
    } else {
        clearInterval(TimerState.intervalId);
    }
});

resetBtn.addEventListener('click', () => {
    const time = reset();
    updateDisplay(time);
    updateButtonState(false);
});

Object.keys(TIMES).forEach(mode => {
    const btnId = `${mode.replace(/([A-Z])/g, "-$1").toLowerCase()}-btn`;
    document.getElementById(btnId).addEventListener('click', () => {
        const time = reset(mode);
        updateDisplay(time);
        updateButtonState(false);
        setActiveMode(mode);
    });
});

settingsToggleBtn.addEventListener('click', () => {
    populateSettingsInputs(TIMES);
    toggleSettingsModal(true);
});

closeSettingsBtn.addEventListener('click', () => {
    toggleSettingsModal(false);
});

saveSettingsBtn.addEventListener('click', () => {
    const { work, shortBreak, longBreak } = getSettingsInputValues();
    if (work > 0 && shortBreak > 0 && longBreak > 0) {
        updateCustomTimes(work, shortBreak, longBreak);
        toggleSettingsModal(false);
        const time = reset(TimerState.mode);
        updateDisplay(time);
        updateButtonState(false);
    } else {
        alert('Please enter valid durations greater than 0.');
    }
});

ambientBtn.addEventListener('click', () => {
    const isPlaying = toggleWhiteNoise();
    updateAmbientButtonState(isPlaying);
});