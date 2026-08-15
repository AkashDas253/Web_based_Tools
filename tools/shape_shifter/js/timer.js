import { gameState } from './config.js';
import { sound } from './audio.js';

const timeVal = document.getElementById("time-val");

export function stopTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }
  if (timeVal) {
    timeVal.classList.remove("low-time");
  }
}

export function startTimer(onTimeOut) {
  stopTimer();

  if (gameState.settings.gameMode === "timeless") {
    if (timeVal) timeVal.textContent = "∞";
    return;
  }

  gameState.timeLeft = parseInt(gameState.settings.timeLimit, 10) || 35;
  runTimerLoop(onTimeOut);
}

export function resumeTimer(onTimeOut) {
  stopTimer();

  if (gameState.settings.gameMode === "timeless") {
    if (timeVal) timeVal.textContent = "∞";
    return;
  }

  // Resume from existing gameState.timeLeft if set, otherwise fallback to configured timeLimit
  if (typeof gameState.timeLeft !== "number" || gameState.timeLeft <= 0) {
    gameState.timeLeft = parseInt(gameState.settings.timeLimit, 10) || 35;
  }

  runTimerLoop(onTimeOut);
}

function runTimerLoop(onTimeOut) {
  if (timeVal) timeVal.textContent = `${gameState.timeLeft}s`;

  gameState.timerInterval = setInterval(() => {
    gameState.timeLeft--;

    if (timeVal) {
      timeVal.textContent = `${gameState.timeLeft}s`;
    }

    if (gameState.timeLeft <= 5 && gameState.timeLeft > 0) {
      if (timeVal) timeVal.classList.add("low-time");
      if (sound && typeof sound.playTone === "function") {
        sound.playTone(700, 0.05, "sine");
      }
    } else if (timeVal) {
      timeVal.classList.remove("low-time");
    }

    if (gameState.timeLeft <= 0) {
      stopTimer();
      if (sound && typeof sound.die === "function") {
        sound.die();
      }
      if (onTimeOut) onTimeOut();
    }
  }, 1000);
}