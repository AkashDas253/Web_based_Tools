
import { COLS, ROWS } from "./constants.js";

export function createBoard() {
  return Array.from(
    { length: ROWS },
    () => Array(COLS).fill(null)
  );
}

export function collides(
  board,
  piece,
  offsetX = piece.x,
  offsetY = piece.y
) {
  return piece.matrix.some((row, y) =>
    row.some((cell, x) => {
      if (!cell) return false;

      const boardX = offsetX + x;
      const boardY = offsetY + y;

      return (
        boardX < 0 ||
        boardX >= COLS ||
        boardY >= ROWS ||
        (boardY >= 0 && board[boardY][boardX] !== null)
      );
    })
  );
}

export function mergePiece(board, piece) {
  piece.matrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      const boardY = piece.y + y;

      if (cell && boardY >= 0) {
        board[boardY][piece.x + x] = piece.type;
      }
    });
  });
}

export function clearLines(board) {
  let cleared = 0;

  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(Boolean)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(null));
      cleared++;
      y++;
    }
  }

  return cleared;
}

export function rotateMatrix(matrix, direction = 1) {
  if (direction > 0) {
    return matrix[0].map((_, x) =>
      matrix.map(row => row[x]).reverse()
    );
  }

  return matrix[0].map((_, x) =>
    matrix.map(row => row[matrix[0].length - 1 - x])
  ).reverse();
}
