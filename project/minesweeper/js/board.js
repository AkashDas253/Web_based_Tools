export const PRESETS = {
  beginner: { cols: 9, rows: 9, mines: 10, label: "Beginner" },
  intermediate: { cols: 16, rows: 16, mines: 40, label: "Intermediate" },
  expert: { cols: 30, rows: 16, mines: 99, label: "Expert" }
};

export function createBoard(cols, rows, mineCount) {
  return Array.from({ length: rows * cols }, (_, index) => ({
    index, row: Math.floor(index / cols), col: index % cols,
    mine: false, adjacent: 0, revealed: false, flagged: false, exploded: false
  }));
}

export function placeMines(cells, cols, rows, mineCount, safeIndex) {
  const safe = new Set([safeIndex, ...getNeighbors(safeIndex, cols, rows)]);
  const candidates = cells.filter(cell => !safe.has(cell.index));
  shuffle(candidates);
  candidates.slice(0, mineCount).forEach(cell => { cell.mine = true; });
  cells.forEach(cell => {
    if (!cell.mine) cell.adjacent = getNeighbors(cell.index, cols, rows)
      .filter(index => cells[index].mine).length;
  });
}

export function getNeighbors(index, cols, rows) {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const neighbors = [];
  for (let y = -1; y <= 1; y++) {
    for (let x = -1; x <= 1; x++) {
      if (x === 0 && y === 0) continue;
      const nextRow = row + y;
      const nextCol = col + x;
      if (nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols) {
        neighbors.push(nextRow * cols + nextCol);
      }
    }
  }
  return neighbors;
}

export function revealCells(cells, startIndex, cols, rows) {
  const queue = [startIndex];
  const visited = new Set();
  while (queue.length) {
    const index = queue.shift();
    if (visited.has(index)) continue;
    visited.add(index);
    const cell = cells[index];
    if (!cell || cell.revealed || cell.flagged || cell.mine) continue;
    cell.revealed = true;
    if (cell.adjacent === 0) {
      getNeighbors(index, cols, rows).forEach(next => {
        if (!visited.has(next)) queue.push(next);
      });
    }
  }
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
}
