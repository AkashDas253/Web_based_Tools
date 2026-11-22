import { MinesweeperGame } from "./game.js";
import { getBestTime, saveBestTime, getTheme, saveTheme } from "./storage.js";
import { formatCounter, formatTime, renderBoard } from "./ui.js";

const $ = selector => document.querySelector(selector);
const boardElement = $("#board");
const difficulty = $("#difficulty");
const customFields = $("#custom-fields");
const statusCard = $(".status-card");
let mode = "reveal";
let currentGame;
let lastSavedWin = false;

function setMode(nextMode) {
  mode = nextMode;
  $("#reveal-mode").classList.toggle("active", mode === "reveal");
  $("#flag-mode").classList.toggle("active", mode === "flag");
  $("#mobile-reveal").classList.toggle("active", mode === "reveal");
  $("#mobile-flag").classList.toggle("active", mode === "flag");
  $("#reveal-mode").setAttribute("aria-pressed", String(mode === "reveal"));
  $("#flag-mode").setAttribute("aria-pressed", String(mode === "flag"));
  render();
}

function getCustomSettings() {
  const cols = Number($("#custom-cols").value);
  const rows = Number($("#custom-rows").value);
  const mines = Number($("#custom-mines").value);
  const valid = Number.isInteger(cols) && Number.isInteger(rows) && Number.isInteger(mines)
    && cols >= 5 && cols <= 40 && rows >= 5 && rows <= 30
    && mines >= 1 && mines < cols * rows - 9;
  $("#custom-hint").textContent = valid
    ? `Maximum ${cols * rows - 9} mines for first-click safety.`
    : "Enter valid dimensions and leave room for a safe first click.";
  return valid ? { cols, rows, mines, label: "Custom" } : null;
}

function startGame() {
  const level = difficulty.value;
  let custom = null;
  if (level === "custom") {
    custom = getCustomSettings();
    if (!custom) return;
  }
  currentGame.start(level, custom);
  lastSavedWin = false;
  $("#board-title").textContent = currentGame.label;
  setMode("reveal");
}

function render() {
  if (!currentGame) return;
  $("#mine-count").textContent = formatCounter(currentGame.mineCount - currentGame.flags);
  $("#timer").textContent = formatTime(currentGame.elapsed);
  $("#board-title").textContent = currentGame.label;
  const state = currentGame.result;
  statusCard.dataset.state = state;
  const messages = {
    ready: ["Ready when you are", "Choose a square to begin."],
    playing: ["You're doing great", "Keep an eye on the numbers."],
    won: ["Field cleared!", "You found every safe square."],
    lost: ["Boom. Game over.", "A mine was hiding there. Try again."]
  };
  $("#game-status").textContent = messages[state][0];
  $("#status-detail").textContent = messages[state][1];
  $("#status-indicator").style.background = state === "lost" ? "var(--danger)" : "var(--accent)";
  const best = getBestTime(currentGame.level);
  $("#best-time").textContent = best === null ? "—" : `${best}s`;
  renderBoard(currentGame, boardElement, {
    activate: (index, selectedMode) => {
      if (currentGame.cells[index]?.revealed) currentGame.chord(index);
      else if (selectedMode === "flag") currentGame.toggleFlag(index);
      else currentGame.reveal(index);
    },
    flag: index => currentGame.toggleFlag(index),
    chord: index => currentGame.chord(index)
  }, mode);

  if (state === "won" && !lastSavedWin) {
    lastSavedWin = true;
    if (currentGame.level !== "custom") saveBestTime(currentGame.level, currentGame.elapsed);
    const updatedBest = getBestTime(currentGame.level);
    $("#best-time").textContent = updatedBest === null ? "—" : `${updatedBest}s`;
  }
}

function initTheme() {
  const theme = getTheme();
  document.documentElement.dataset.theme = theme;
  $("#theme-toggle").textContent = theme === "dark" ? "☾" : "☀";
}

$("#new-game").addEventListener("click", startGame);
difficulty.addEventListener("change", () => {
  customFields.hidden = difficulty.value !== "custom";
  if (difficulty.value === "custom") getCustomSettings();
  else startGame();
});
["custom-cols", "custom-rows", "custom-mines"].forEach(id => $(`#${id}`).addEventListener("input", getCustomSettings));
$("#reveal-mode").addEventListener("click", () => setMode("reveal"));
$("#flag-mode").addEventListener("click", () => setMode("flag"));
$("#mobile-reveal").addEventListener("click", () => setMode("reveal"));
$("#mobile-flag").addEventListener("click", () => setMode("flag"));
$("#theme-toggle").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  $("#theme-toggle").textContent = next === "dark" ? "☾" : "☀";
  saveTheme(next);
});
$("#help-toggle").addEventListener("click", () => $("#help-dialog").showModal());

document.addEventListener("keydown", event => {
  if (event.key.toLowerCase() === "f" && !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    const index = Number(document.activeElement?.dataset?.index);
    if (Number.isInteger(index) && boardElement.contains(document.activeElement)) {
      event.preventDefault();
      currentGame.toggleFlag(index);
    }
  }
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key) && boardElement.contains(document.activeElement)) {
    const index = Number(document.activeElement.dataset.index);
    if (!Number.isInteger(index)) return;
    const row = Math.floor(index / currentGame.cols);
    const col = index % currentGame.cols;
    const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const [dr, dc] = moves[event.key];
    const nextRow = row + dr, nextCol = col + dc;
    if (nextRow >= 0 && nextRow < currentGame.rows && nextCol >= 0 && nextCol < currentGame.cols) {
      event.preventDefault();
      boardElement.querySelector(`[data-index="${nextRow * currentGame.cols + nextCol}"]`)?.focus();
    }
  }
});

currentGame = new MinesweeperGame(render);
initTheme();
setInterval(() => currentGame.tick(), 1000);
