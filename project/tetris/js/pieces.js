
import { SHAPES } from "./constants.js";

export function createBag() {
  const types = Object.keys(SHAPES);

  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [types[i], types[j]] = [types[j], types[i]];
  }

  return types;
}

export function createPiece(type, boardWidth = 10) {
  const matrix = SHAPES[type].map(row => [...row]);

  return {
    type,
    matrix,
    x: Math.floor(
      (boardWidth - matrix[0].length) / 2
    ),
    y: -1
  };
}
