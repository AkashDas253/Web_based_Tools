export const CONTAINER_SIZE = 500;

export const DEFAULT_SETTINGS = {
  gridSize: 15,
  difficulty: "normal",
  moveSpeed: 120,
  gameMode: "timeless",
  timeLimit: 35
};

export const gameState = {
  settings: { ...DEFAULT_SETTINGS },
  currentLevel: 1,
  highScore: 1,
  currentShape: "square",
  playerPos: { x: 0, y: 0 },
  goalPos: { x: 0, y: 0 },
  mazeGrid: [],
  isMoving: false,
  isPaused: false,
  timeLeft: 0,
  timerInterval: null
};