import { gameState, DEFAULT_SETTINGS } from './config.js';

const homeScreen = document.getElementById("home-screen");
const gameScreen = document.getElementById("game-screen");

const gameModeSelect = document.getElementById("game-mode");
const timeLimitInput = document.getElementById("time-limit");
const customTimeInput = document.getElementById("custom-time-input");
const timeLimitGroup = document.getElementById("time-limit-group");
const timeBlocks = document.querySelectorAll(".time-block");

const gridSizeSelect = document.getElementById("grid-size");
const difficultySelect = document.getElementById("difficulty");
const moveSpeedSelect = document.getElementById("move-speed");
const highScoreVal = document.getElementById("high-score-val");
const hudBestVal = document.getElementById("hud-best-val");

function updateModeVisibility() {
  if (timeLimitGroup) {
    timeLimitGroup.style.display = gameModeSelect.value === "timed" ? "flex" : "none";
  }
}

function updateTimeBlockUI(timeVal) {
  if (!timeBlocks || timeBlocks.length === 0) return;

  let matched = false;
  timeBlocks.forEach((block) => {
    const blockTime = block.getAttribute("data-time");
    if (blockTime === String(timeVal)) {
      block.classList.add("selected");
      matched = true;
    } else {
      block.classList.remove("selected");
    }
  });

  // If no preset matches, highlight the custom block
  if (!matched) {
    const customBlock = document.querySelector(".time-block.custom-block");
    if (customBlock) {
      customBlock.classList.add("selected");
      if (customTimeInput) customTimeInput.value = timeVal;
    }
  }
  if (timeLimitInput) timeLimitInput.value = timeVal;
}

if (gameModeSelect) {
  gameModeSelect.addEventListener("change", updateModeVisibility);
}

export function loadSavedSettings() {
  const savedSettings = localStorage.getItem("shapeshifter_settings");
  if (savedSettings) {
    try {
      gameState.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
      if (gameModeSelect) gameModeSelect.value = gameState.settings.gameMode;
      if (gridSizeSelect) gridSizeSelect.value = gameState.settings.gridSize;
      if (difficultySelect) difficultySelect.value = gameState.settings.difficulty;
      if (moveSpeedSelect) moveSpeedSelect.value = gameState.settings.moveSpeed;
      
      updateTimeBlockUI(gameState.settings.timeLimit);
    } catch (e) {
      console.error("Could not load settings", e);
    }
  } else {
    updateTimeBlockUI(DEFAULT_SETTINGS.timeLimit);
  }

  const savedScore = localStorage.getItem("shapeshifter_highscore");
  if (savedScore) {
    gameState.highScore = parseInt(savedScore, 10) || 1;
  }
  updateHighScoreDisplay();
  updateModeVisibility();
}

export function updateHighScoreDisplay() {
  if (highScoreVal) highScoreVal.textContent = gameState.highScore;
  if (hudBestVal) hudBestVal.textContent = gameState.highScore;
}

export function checkAndUpdateHighScore(level) {
  if (level > gameState.highScore) {
    gameState.highScore = level;
    localStorage.setItem("shapeshifter_highscore", gameState.highScore);
    updateHighScoreDisplay();
  }
}

export function saveSettingsFromUI() {
  gameState.settings.gameMode = gameModeSelect.value;
  
  const parsedTime = parseInt(timeLimitInput.value, 10);
  gameState.settings.timeLimit = isNaN(parsedTime) ? 35 : parsedTime;
  
  gameState.settings.gridSize = parseInt(gridSizeSelect.value, 10);
  gameState.settings.difficulty = difficultySelect.value;
  gameState.settings.moveSpeed = parseInt(moveSpeedSelect.value, 10);
  
  localStorage.setItem("shapeshifter_settings", JSON.stringify(gameState.settings));
}

export function resetSettingsToDefault() {
  if (gameModeSelect) gameModeSelect.value = DEFAULT_SETTINGS.gameMode;
  if (gridSizeSelect) gridSizeSelect.value = DEFAULT_SETTINGS.gridSize;
  if (difficultySelect) difficultySelect.value = DEFAULT_SETTINGS.difficulty;
  if (moveSpeedSelect) moveSpeedSelect.value = DEFAULT_SETTINGS.moveSpeed;
  
  updateTimeBlockUI(DEFAULT_SETTINGS.timeLimit);
  updateModeVisibility();
  saveSettingsFromUI();
}

export function showScreen(screenName) {
  if (homeScreen) homeScreen.classList.toggle("active", screenName === "home");
  if (gameScreen) gameScreen.classList.toggle("active", screenName === "game");
}