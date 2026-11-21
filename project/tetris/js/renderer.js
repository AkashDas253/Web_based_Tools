
import { CELL, COLS, ROWS, COLORS } from "./constants.js";

function drawCell(ctx, x, y, color, size = CELL) {
  ctx.fillStyle = color;
  ctx.fillRect(
    x * size + 1,
    y * size + 1,
    size - 2,
    size - 2
  );

  ctx.fillStyle = "rgba(255,255,255,.16)";
  ctx.fillRect(
    x * size + 2,
    y * size + 2,
    size - 3,
    2
  );

  ctx.fillStyle = "rgba(0,0,0,.13)";
  ctx.fillRect(
    x * size + 2,
    y * size + size - 4,
    size - 3,
    2
  );
}

export function drawGame(ctx, board, piece) {
  ctx.clearRect(
    0,
    0,
    ctx.canvas.width,
    ctx.canvas.height
  );

  ctx.fillStyle = "#0b0e16";
  ctx.fillRect(
    0,
    0,
    ctx.canvas.width,
    ctx.canvas.height
  );

  ctx.strokeStyle = "rgba(145,160,190,.08)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL + 0.5, 0);
    ctx.lineTo(x * CELL + 0.5, ROWS * CELL);
    ctx.stroke();
  }

  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL + 0.5);
    ctx.lineTo(COLS * CELL, y * CELL + 0.5);
    ctx.stroke();
  }

  board.forEach((row, y) => {
    row.forEach((type, x) => {
      if (type) {
        drawCell(ctx, x, y, COLORS[type]);
      }
    });
  });

  if (piece) {
    piece.matrix.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell && piece.y + y >= 0) {
          drawCell(
            ctx,
            piece.x + x,
            piece.y + y,
            COLORS[piece.type]
          );
        }
      });
    });
  }
}

export function drawNext(ctx, piece) {
  ctx.clearRect(
    0,
    0,
    ctx.canvas.width,
    ctx.canvas.height
  );

  ctx.fillStyle = "#111622";
  ctx.fillRect(
    0,
    0,
    ctx.canvas.width,
    ctx.canvas.height
  );

  if (!piece) return;

  const size = 25;
  const width = piece.matrix[0].length * size;
  const height = piece.matrix.length * size;

  const offsetX = (ctx.canvas.width - width) / 2;
  const offsetY = (ctx.canvas.height - height) / 2;

  piece.matrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (!cell) return;

      ctx.fillStyle = COLORS[piece.type];

      ctx.fillRect(
        offsetX + x * size + 1,
        offsetY + y * size + 1,
        size - 2,
        size - 2
      );

      ctx.fillStyle = "rgba(255,255,255,.18)";

      ctx.fillRect(
        offsetX + x * size + 2,
        offsetY + y * size + 2,
        size - 3,
        2
      );
    });
  });
}
