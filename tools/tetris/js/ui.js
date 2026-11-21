
import { createPiece } from "./pieces.js";
import { drawGame, drawNext } from "./renderer.js";

export class GameUI {
  constructor(game) {
    this.game = game;

    this.canvas = document.querySelector("#game");
    this.ctx = this.canvas.getContext("2d");

    this.nextCanvas = document.querySelector("#next");
    this.nextCtx = this.nextCanvas.getContext("2d");

    this.overlay = document.querySelector("#overlay");
    this.overlayTitle = document.querySelector("#overlay-title");
    this.overlayMessage = document.querySelector("#overlay-message");

    this.startButton = document.querySelector("#start-button");
    this.pauseButton = document.querySelector("#pause-button");

    this.score = document.querySelector("#score");
    this.best = document.querySelector("#best");
    this.level = document.querySelector("#level");
    this.lines = document.querySelector("#lines");

    this.bestScore = Number(
      localStorage.getItem("tetris-best") || 0
    );

    this.best.textContent = this.bestScore;

    this.startButton.addEventListener("click", () => {
      this.game.start();
    });

    this.pauseButton.addEventListener("click", () => {
      this.game.togglePause();
    });

    document.querySelector("#restart-button")
      .addEventListener("click", () => {
        this.game.reset();
        this.game.start();
      });

    this.render();
  }

  showOverlay(title, message, buttonText = "Start game") {
    this.overlayTitle.textContent = title;
    this.overlayMessage.textContent = message;
    this.startButton.textContent = buttonText;
    this.overlay.classList.remove("hidden");
  }

  hideOverlay() {
    this.overlay.classList.add("hidden");
  }

  render() {
    const game = this.game;

    drawGame(this.ctx, game.board, game.piece);
    drawNext(this.nextCtx, createPiece(game.nextType));

    this.score.textContent = game.score.toLocaleString();
    this.level.textContent = game.level;
    this.lines.textContent = game.lines;

    if (game.score > this.bestScore) {
      this.bestScore = game.score;

      localStorage.setItem(
        "tetris-best",
        String(this.bestScore)
      );

      this.best.textContent = this.bestScore.toLocaleString();
    }

    this.pauseButton.disabled =
      !game.running && !game.paused;

    this.pauseButton.textContent =
      game.paused ? "Resume" : "Pause";

    if (game.running && !game.paused) {
      this.hideOverlay();
    }

    if (game.paused) {
      this.showOverlay(
        "Paused",
        "Take a breather.",
        "Resume"
      );
    }
  }
}
