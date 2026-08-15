// Load custom times or fallback to default configuration
const savedTimes = JSON.parse(localStorage.getItem('pomodoro_times')) || {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
};

export const TIMES = {
    work: savedTimes.work,
    shortBreak: savedTimes.shortBreak,
    longBreak: savedTimes.longBreak
};

export const TimerState = {
    mode: localStorage.getItem('pomodoro_mode') || 'work',
    timeLeft: parseInt(localStorage.getItem('pomodoro_time'), 10) || TIMES[localStorage.getItem('pomodoro_mode') || 'work'],
    isRunning: false,
    intervalId: null,
    sessionsCompleted: parseInt(localStorage.getItem('pomodoro_sessions'), 10) || 0
};

export function saveStateToStorage() {
    localStorage.setItem('pomodoro_mode', TimerState.mode);
    localStorage.setItem('pomodoro_time', TimerState.timeLeft);
    localStorage.setItem('pomodoro_sessions', TimerState.sessionsCompleted);
    localStorage.setItem('pomodoro_times', JSON.stringify(TIMES));
}

export function tick(callback) {
    if (TimerState.timeLeft > 0) {
        TimerState.timeLeft--;
        saveStateToStorage();
        callback(TimerState.timeLeft);
        return true;
    }
    return false;
}

export function toggle() {
    TimerState.isRunning = !TimerState.isRunning;
    return TimerState.isRunning;
}

export function reset(mode = TimerState.mode) {
    TimerState.mode = mode;
    TimerState.timeLeft = TIMES[mode];
    TimerState.isRunning = false;
    clearInterval(TimerState.intervalId);
    saveStateToStorage();
    return TimerState.timeLeft;
}

export function updateCustomTimes(newWork, newShort, newLong) {
    TIMES.work = newWork * 60;
    TIMES.shortBreak = newShort * 60;
    TIMES.longBreak = newLong * 60;
    saveStateToStorage();
}

export function getNextAutomaticMode() {
    if (TimerState.mode === 'work') {
        TimerState.sessionsCompleted++;
        if (TimerState.sessionsCompleted % 4 === 0) {
            return 'longBreak';
        }
        return 'shortBreak';
    }
    return 'work';
}