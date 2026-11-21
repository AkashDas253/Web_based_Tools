
import { TetrisGame } from "./game.js";
import { GameUI } from "./ui.js";

const game = new TetrisGame(() => {}, () => {});
const ui = new GameUI(game);

game.onUpdate = () => ui.render();

game.onGameOver = () => {
  ui.showOverlay(
    "Game over",
    "Final score: " + game.score.toLocaleString(),
    "Play again"
  );
};

function handleAction(action) {
  switch (action) {
    case "left":
      game.move(-1);
      break;
    case "right":
      game.move(1);
      break;
    case "down":
      game.softDrop();
      break;
    case "rotate":
      game.rotate(1);
      break;
    case "drop":
      game.hardDrop();
      break;
  }
}

document.addEventListener("keydown", event => {
  const keys = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowDown: "down",
    ArrowUp: "rotate",
    x: "rotate",
    X: "rotate",
    z: "rotateBack",
    Z: "rotateBack",
    " ": "drop",
    p: "pause",
    P: "pause",
    Enter: "start"
  };

  const action = keys[event.key];
  if (!action) return;

  event.preventDefault();

  if (action === "rotateBack") game.rotate(-1);
  else if (action === "pause") game.togglePause();
  else if (action === "start" && !game.running) game.start();
  else handleAction(action);
});

document.querySelectorAll("[data-action]").forEach(button => {
  const action = button.dataset.action;
  let repeatTimer = null;

  button.addEventListener("pointerdown", event => {
    event.preventDefault();
    handleAction(action);

    if (action === "down") {
      repeatTimer = setInterval(() => game.softDrop(), 90);
    }
  });

  function stopRepeat() {
    if (repeatTimer !== null) {
      clearInterval(repeatTimer);
      repeatTimer = null;
    }
  }

  button.addEventListener("pointerup", stopRepeat);
  button.addEventListener("pointerleave", stopRepeat);
  button.addEventListener("pointercancel", stopRepeat);
});

let previous = 0;

function loop(time) {
  game.update(time);
  previous = time;
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
