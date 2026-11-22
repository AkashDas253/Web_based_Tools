import { createBoard, placeMines, getNeighbors, revealCells, PRESETS } from "./board.js";

export class MinesweeperGame {
  constructor(onChange) {
    this.onChange = onChange;
    this.start("beginner");
  }

  start(level = "beginner", custom = null) {
    const preset = custom || PRESETS[level] || PRESETS.beginner;
    this.level = level;
    this.cols = preset.cols;
    this.rows = preset.rows;
    this.mineCount = preset.mines;
    this.label = preset.label || "Custom";
    this.cells = createBoard(this.cols, this.rows, this.mineCount);
    this.flags = 0;
    this.started = false;
    this.finished = false;
    this.result = "ready";
    this.elapsed = 0;
    this.startedAt = null;
    this.emit();
  }

  reveal(index) {
    const cell = this.cells[index];
    if (!cell || this.finished || cell.revealed || cell.flagged) return;
    if (!this.started) {
      placeMines(this.cells, this.cols, this.rows, this.mineCount, index);
      this.started = true;
      this.startedAt = Date.now();
      this.result = "playing";
    }
    if (cell.mine) {
      cell.revealed = true;
      cell.exploded = true;
      this.finish("lost");
      return;
    }
    revealCells(this.cells, index, this.cols, this.rows);
    this.checkWin();
    this.emit();
  }

  toggleFlag(index) {
    const cell = this.cells[index];
    if (!cell || this.finished || cell.revealed) return;
    if (!cell.flagged && this.flags >= this.mineCount) return;
    cell.flagged = !cell.flagged;
    this.flags += cell.flagged ? 1 : -1;
    this.emit();
  }

  chord(index) {
    const cell = this.cells[index];
    if (!cell?.revealed || cell.adjacent === 0 || this.finished) return;
    const neighbors = getNeighbors(index, this.cols, this.rows);
    const flagged = neighbors.filter(i => this.cells[i].flagged).length;
    if (flagged !== cell.adjacent) return;
    const target = neighbors.find(i => this.cells[i].mine && !this.cells[i].flagged);
    if (target !== undefined) {
      this.cells[target].revealed = true;
      this.cells[target].exploded = true;
      this.finish("lost");
      return;
    }
    neighbors.forEach(i => this.reveal(i));
    this.emit();
  }

  tick() {
    if (this.started && !this.finished) {
      this.elapsed = Math.floor((Date.now() - this.startedAt) / 1000);
      this.emit();
    }
  }

  checkWin() {
    const safeRemaining = this.cells.filter(cell => !cell.mine && !cell.revealed).length;
    if (safeRemaining === 0) this.finish("won");
  }

  finish(result) {
    this.finished = true;
    this.result = result;
    this.elapsed = this.startedAt ? Math.floor((Date.now() - this.startedAt) / 1000) : 0;
    this.emit();
  }

  emit() {
    this.onChange?.(this);
  }
}
