
import { COLS } from "./constants.js";
import {
  createBoard,
  collides,
  mergePiece,
  clearLines,
  rotateMatrix
} from "./board.js";
import { createBag, createPiece } from "./pieces.js";

const LINE_POINTS = [0, 100, 300, 500, 800];

export class TetrisGame {
  constructor(onUpdate = () => {}, onGameOver = () => {}) {
    this.onUpdate = onUpdate;
    this.onGameOver = onGameOver;
    this.reset();
  }

  reset() {
    this.board = createBoard();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.bag = [];
    this.nextType = this.takeType();
    this.gameOver = false;
    this.running = false;
    this.paused = false;
    this.dropCounter = 0;
    this.lastTime = 0;
    this.piece = this.spawnPiece();
    this.onUpdate();
  }

  takeType() {
    if (!this.bag.length) {
      this.bag = createBag();
    }

    return this.bag.pop();
  }

  spawnPiece() {
    const type = this.nextType;
    this.nextType = this.takeType();

    const piece = createPiece(type, COLS);

    if (collides(this.board, piece)) {
      this.gameOver = true;
      this.running = false;
      this.onGameOver();
    }

    return piece;
  }

  start() {
    if (this.gameOver) {
      this.reset();
    }

    this.running = true;
    this.paused = false;
    this.lastTime = 0;
    this.onUpdate();
  }

  togglePause() {
    if (!this.running || this.gameOver) return;

    this.paused = !this.paused;
    this.lastTime = 0;
    this.onUpdate();
  }

  move(dx) {
    if (!this.running || this.paused) return;

    if (!collides(this.board, this.piece, this.piece.x + dx)) {
      this.piece.x += dx;
    }

    this.onUpdate();
  }

  rotate(direction = 1) {
    if (!this.running || this.paused) return;

    const original = this.piece.matrix;
    this.piece.matrix = rotateMatrix(original, direction);

    const kicks = [0, -1, 1, -2, 2];
    const validKick = kicks.find(offset =>
      !collides(
        this.board,
        this.piece,
        this.piece.x + offset
      )
    );

    if (validKick === undefined) {
      this.piece.matrix = original;
    } else {
      this.piece.x += validKick;
    }

    this.onUpdate();
  }

  stepDown(points = 0) {
    if (!collides(
      this.board,
      this.piece,
      this.piece.x,
      this.piece.y + 1
    )) {
      this.piece.y++;
      this.score += points;
      return true;
    }

    this.lockPiece();
    return false;
  }

  softDrop() {
    if (!this.running || this.paused) return;

    this.stepDown(1);
    this.onUpdate();
  }

  hardDrop() {
    if (!this.running || this.paused) return;

    let distance = 0;

    while (!collides(
      this.board,
      this.piece,
      this.piece.x,
      this.piece.y + 1
    )) {
      this.piece.y++;
      distance++;
    }

    this.score += distance * 2;
    this.lockPiece();
    this.onUpdate();
  }

  lockPiece() {
    mergePiece(this.board, this.piece);

    const cleared = clearLines(this.board);

    if (cleared > 0) {
      this.lines += cleared;
      this.score += LINE_POINTS[cleared] * this.level;
      this.level = Math.floor(this.lines / 10) + 1;
    }

    this.piece = this.spawnPiece();
    this.onUpdate();
  }

  update(time = 0) {
    if (!this.running || this.paused || this.gameOver) return;

    const delta = this.lastTime
      ? Math.min(time - this.lastTime, 100)
      : 0;

    this.lastTime = time;
    this.dropCounter += delta;

    const interval = Math.max(
      90,
      850 - (this.level - 1) * 65
    );

    if (this.dropCounter >= interval) {
      this.stepDown();
      this.dropCounter = 0;
      this.onUpdate();
    }
  }
}
