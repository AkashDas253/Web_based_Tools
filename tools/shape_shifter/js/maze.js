import { gameState, CONTAINER_SIZE } from './config.js';

const mazeEl = document.getElementById("maze");

export function generateMaze() {
  const size = gameState.settings.gridSize;
  gameState.mazeGrid = Array.from({ length: size }, () => Array(size).fill(1));

  function carve(x, y) {
    const dirs = [
      [0, -2],
      [0, 2],
      [-2, 0],
      [2, 0]
    ].sort(() => Math.random() - 0.5);
    
    gameState.mazeGrid[y][x] = 0;

    for (let [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size && gameState.mazeGrid[ny][nx] === 1) {
        gameState.mazeGrid[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    }
  }

  carve(0, 0);

  // Difficulty probability tuning
  let crumblyProb = 0.05, hazardProb = 0.03, gateProb = 0.03;
  if (gameState.settings.difficulty === "easy") {
    crumblyProb = 0.08; 
    hazardProb = 0.01; 
    gateProb = 0.02;
  } else if (gameState.settings.difficulty === "hard") {
    crumblyProb = 0.04; 
    hazardProb = 0.08; 
    gateProb = 0.06;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isStart = (r === 0 && c === 0);
      const isGoal = (r === size - 1 && c === size - 1);

      if (isStart || isGoal) continue;

      if (gameState.mazeGrid[r][c] === 1 && Math.random() < crumblyProb) {
        gameState.mazeGrid[r][c] = 2; // Crumbly Wall (Square)
      } else if (gameState.mazeGrid[r][c] === 0 && Math.random() < hazardProb) {
        gameState.mazeGrid[r][c] = 3; // Spike Hazard (Triangle)
      } else if (gameState.mazeGrid[r][c] === 1 && Math.random() < gateProb) {
        gameState.mazeGrid[r][c] = 4; // Circle Gate (Circle)
      }
    }
  }

  // Ensure start and goal are always clear
  gameState.mazeGrid[0][0] = 0;
  gameState.mazeGrid[size - 1][size - 1] = 0;
}

export function drawMaze() {
  if (!mazeEl) return;
  
  mazeEl.innerHTML = "";
  const size = gameState.settings.gridSize;
  const cellSize = CONTAINER_SIZE / size;
  const fragment = document.createDocumentFragment();

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const type = gameState.mazeGrid[r][c];
      if (type !== 0) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;
        cell.style.left = `${c * cellSize}px`;
        cell.style.top = `${r * cellSize}px`;

        if (type === 1) cell.classList.add("wall-solid");
        if (type === 2) cell.classList.add("wall-crumbly");
        if (type === 3) cell.classList.add("hazard-spike");
        if (type === 4) cell.classList.add("circle-gate");

        fragment.appendChild(cell);
      }
    }
  }

  mazeEl.appendChild(fragment);
}