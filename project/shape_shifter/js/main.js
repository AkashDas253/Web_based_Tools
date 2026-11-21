import { gameState } from './config.js';
import { generateMaze, drawMaze } from './maze.js';
import { placeEntities, changeShape, movePlayer } from './player.js';
import { loadSavedSettings, saveSettingsFromUI, resetSettingsToDefault, showScreen, checkAndUpdateHighScore } from './settings.js';
import { startTimer, stopTimer, resumeTimer } from './timer.js';
import { initSwipeControls } from './swipe.js';

// DOM Elements
const levelVal = document.getElementById("level-val");
const modalOverlay = document.getElementById("modal-overlay");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalPrimaryBtn = document.getElementById("modal-primary-btn");
const modalHomeBtn = document.getElementById("modal-home-btn");

const startBtn = document.getElementById("start-btn");
const continueBtn = document.getElementById("continue-btn");
const pauseBtn = document.getElementById("pause-btn");
const homeBtn = document.getElementById("home-btn");

const timeLimitInput = document.getElementById("time-limit");
const customTimeInput = document.getElementById("custom-time-input");
const timeBlocks = document.querySelectorAll(".time-block");

let modalActionHandler = null;

// --- MODAL CONTROLLER ---
function showModal(title, message, primaryLabel, onPrimary) {
  stopTimer();
  gameState.isPaused = true; // Lock player input during modals
  if (modalTitle) modalTitle.textContent = title;
  if (modalMessage) modalMessage.textContent = message;
  if (modalPrimaryBtn) modalPrimaryBtn.textContent = primaryLabel;
  modalActionHandler = onPrimary;
  if (modalOverlay) modalOverlay.classList.remove("hidden");
}

function hideModal() {
  if (modalOverlay) modalOverlay.classList.add("hidden");
}

modalPrimaryBtn?.addEventListener("click", () => {
  hideModal();
  if (modalActionHandler) modalActionHandler();
});

modalHomeBtn?.addEventListener("click", () => {
  hideModal();
  pauseGame();
  showScreen("home");
});

// --- PAUSE & CONTINUE LOGIC ---
function pauseGame() {
  stopTimer();
  gameState.isPaused = true;
  if (continueBtn) continueBtn.style.display = "inline-block";
}

function resumeGame() {
  hideModal();
  gameState.isPaused = false;
  showScreen("game");
  if (typeof resumeTimer === "function") {
    resumeTimer(handleTimeOut);
  } else {
    startTimer(handleTimeOut);
  }
}

// --- GAME FLOW CONTROLLERS ---
function handleTimeOut() {
  if (continueBtn) continueBtn.style.display = "none";

  showModal(
    "Time's Up!",
    `You ran out of time on Level ${gameState.currentLevel}. Try again!`,
    "Retry Level",
    () => startNewGame()
  );
}

function startNewGame() {
  gameState.isPaused = false;
  generateMaze();
  placeEntities();
  changeShape("square");
  drawMaze();
  startTimer(handleTimeOut);
}

function handleLevelComplete() {
  stopTimer();
  checkAndUpdateHighScore(gameState.currentLevel);

  showModal(
    "Level Complete!",
    `Great job! You cleared Level ${gameState.currentLevel}. Prepare for the next layout.`,
    "Next Level",
    () => {
      gameState.currentLevel++;
      if (levelVal) levelVal.textContent = gameState.currentLevel;
      startNewGame();
    }
  );
}

const triggerMove = (dx, dy) => {
  if (gameState.isPaused) return;
  movePlayer(dx, dy, handleLevelComplete);
};

// --- VERTICAL TIME BLOCK BINDINGS ---
timeBlocks.forEach((block) => {
  block.addEventListener("click", () => {
    timeBlocks.forEach((b) => b.classList.remove("selected"));
    block.classList.add("selected");

    const selectedTime = block.getAttribute("data-time");
    if (timeLimitInput) {
      if (selectedTime === "custom") {
        timeLimitInput.value = customTimeInput?.value || 60;
      } else {
        timeLimitInput.value = selectedTime;
      }
    }
  });
});

if (customTimeInput) {
  customTimeInput.addEventListener("input", () => {
    const customBlock = document.querySelector(".time-block.custom-block");
    if (customBlock && customBlock.classList.contains("selected") && timeLimitInput) {
      timeLimitInput.value = customTimeInput.value || 60;
    }
  });
}

// --- INITIAL SETUP & EVENT BINDINGS ---
loadSavedSettings();

startBtn?.addEventListener("click", () => {
  saveSettingsFromUI();
  gameState.currentLevel = 1;
  gameState.isPaused = false;
  if (continueBtn) continueBtn.style.display = "none";
  
  if (levelVal) levelVal.textContent = gameState.currentLevel;
  showScreen("game");
  startNewGame();
});

continueBtn?.addEventListener("click", resumeGame);

pauseBtn?.addEventListener("click", () => {
  pauseGame();
  showModal("Game Paused", "Take a breather or review controls.", "Resume", resumeGame);
});

homeBtn?.addEventListener("click", () => {
  pauseGame();
  showScreen("home");
});

document.getElementById("reset-settings-btn")?.addEventListener("click", resetSettingsToDefault);

// On-screen D-Pad Movement Controls
document.getElementById("up")?.addEventListener("click", () => triggerMove(0, -1));
document.getElementById("down")?.addEventListener("click", () => triggerMove(0, 1));
document.getElementById("left")?.addEventListener("click", () => triggerMove(-1, 0));
document.getElementById("right")?.addEventListener("click", () => triggerMove(1, 0));

// Shape Selectors
document.getElementById("shapeSquare")?.addEventListener("click", () => changeShape("square"));
document.getElementById("shapeCircle")?.addEventListener("click", () => changeShape("circle"));
document.getElementById("shapeTriangle")?.addEventListener("click", () => changeShape("triangle"));

// Swipe Gestures
initSwipeControls(triggerMove);

// Keyboard Controls
window.addEventListener("keydown", (e) => {
  // Prevent key actions while typing in form inputs or when paused
  const activeTag = document.activeElement?.tagName;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(activeTag) || gameState.isPaused) {
    return;
  }

  const navKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"];
  if (navKeys.includes(e.key)) {
    e.preventDefault(); // Prevent page scrolling
  }

  const key = e.key.toLowerCase();

  if (key === "arrowup" || key === "w") triggerMove(0, -1);
  if (key === "arrowdown" || key === "s") triggerMove(0, 1);
  if (key === "arrowleft" || key === "a") triggerMove(-1, 0);
  if (key === "arrowright" || key === "d") triggerMove(1, 0);

  if (key === "1") changeShape("square");
  if (key === "2") changeShape("circle");
  if (key === "3") changeShape("triangle");
});