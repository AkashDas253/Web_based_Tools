import { gameState, CONTAINER_SIZE } from './config.js';
import { drawMaze } from './maze.js';
import { sound } from './audio.js';

const playerEl = document.getElementById("player");
const goalEl = document.getElementById("goal");
const shapeVal = document.getElementById("shape-val");

export function placeEntities() {
  if (!playerEl || !goalEl) return;

  const cellSize = CONTAINER_SIZE / gameState.settings.gridSize;

  playerEl.style.width = `${cellSize - 4}px`;
  playerEl.style.height = `${cellSize - 4}px`;
  goalEl.style.width = `${cellSize - 4}px`;
  goalEl.style.height = `${cellSize - 4}px`;

  gameState.playerPos = { x: 0, y: 0 };
  updatePlayerPosition();

  gameState.goalPos = { 
    x: gameState.settings.gridSize - 1, 
    y: gameState.settings.gridSize - 1 
  };
  goalEl.style.left = `${gameState.goalPos.x * cellSize + 2}px`;
  goalEl.style.top = `${gameState.goalPos.y * cellSize + 2}px`;
}

export function updatePlayerPosition() {
  if (!playerEl) return;
  const cellSize = CONTAINER_SIZE / gameState.settings.gridSize;
  playerEl.style.left = `${gameState.playerPos.x * cellSize + 2}px`;
  playerEl.style.top = `${gameState.playerPos.y * cellSize + 2}px`;
}

export function changeShape(newShape) {
  gameState.currentShape = newShape;
  if (playerEl) playerEl.className = `shape-${newShape}`;
  if (shapeVal) shapeVal.textContent = newShape.charAt(0).toUpperCase() + newShape.slice(1);
  
  if (sound && typeof sound.shift === "function") {
    sound.shift();
  }

  ["Square", "Circle", "Triangle"].forEach(s => {
    const btn = document.getElementById(`shape${s}`);
    if (btn) btn.classList.toggle("active-btn", newShape.toLowerCase() === s.toLowerCase());
  });
}

export function movePlayer(dx, dy, onWin) {
  if (gameState.isMoving || gameState.isPaused) return;

  const targetX = gameState.playerPos.x + dx;
  const targetY = gameState.playerPos.y + dy;
  const size = gameState.settings.gridSize;

  // Boundary checks
  if (targetX < 0 || targetX >= size || targetY < 0 || targetY >= size) return;

  const targetCell = gameState.mazeGrid[targetY][targetX];

  // Solid Wall check (Type 1)
  if (targetCell === 1) return;

  // Crumbly Wall check (Type 2)
  if (targetCell === 2) {
    if (gameState.currentShape === "square") {
      gameState.mazeGrid[targetY][targetX] = 0;
      if (sound && typeof sound.smash === "function") sound.smash();
      drawMaze();
    } else {
      return;
    }
  }

  // Circle Gate check (Type 4)
  if (targetCell === 4 && gameState.currentShape !== "circle") return;

  // Spike Hazard check (Type 3)
  if (targetCell === 3 && gameState.currentShape !== "triangle") {
    if (sound && typeof sound.die === "function") sound.die();
    placeEntities();
    return;
  }

  // Update coordinates
  gameState.playerPos.x = targetX;
  gameState.playerPos.y = targetY;
  updatePlayerPosition();

  // Throttle movements based on settings moveSpeed
  gameState.isMoving = true;
  setTimeout(() => { 
    gameState.isMoving = false; 
  }, gameState.settings.moveSpeed || 120);

  // Check Goal Condition
  if (gameState.playerPos.x === gameState.goalPos.x && gameState.playerPos.y === gameState.goalPos.y) {
    if (sound && typeof sound.win === "function") sound.win();
    if (onWin) onWin();
  }
}