export function formatCounter(value) {
  return String(Math.max(0, value)).padStart(3, "0").slice(-3);
}

export function formatTime(seconds) {
  return formatCounter(Math.min(seconds, 999));
}

export function renderBoard(game, boardElement, handlers, mode) {
  boardElement.replaceChildren();
  boardElement.style.setProperty("--cols", game.cols);
  boardElement.dataset.size = game.cols > 16 ? "large" : "small";
  boardElement.setAttribute("aria-rowcount", game.rows);
  boardElement.setAttribute("aria-colcount", game.cols);

  const fragment = document.createDocumentFragment();
  game.cells.forEach(cell => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cell";
    button.dataset.index = cell.index;
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", describeCell(cell));
    button.disabled = game.finished;
    if (cell.revealed) {
      button.classList.add("revealed");
      if (cell.mine) {
        button.textContent = "✹";
        button.classList.add(cell.exploded ? "mine-hit" : "mine-shown");
      } else if (cell.adjacent > 0) {
        button.textContent = cell.adjacent;
        button.dataset.number = cell.adjacent;
      }
    } else if (cell.flagged) {
      button.textContent = "⚑";
      button.classList.add("flagged");
    } else if (game.finished && cell.mine) {
      button.textContent = "✹";
      button.classList.add("mine-shown");
    } else if (game.finished && cell.flagged && !cell.mine) {
      button.textContent = "×";
      button.classList.add("wrong-flag");
    }
    button.addEventListener("click", event => handlers.activate(cell.index, mode, event));
    button.addEventListener("contextmenu", event => {
      event.preventDefault();
      handlers.flag(cell.index);
    });
    button.addEventListener("dblclick", () => handlers.chord(cell.index));
    fragment.append(button);
  });
  boardElement.append(fragment);
}

function describeCell(cell) {
  if (cell.flagged) return `Row ${cell.row + 1}, column ${cell.col + 1}, flagged`;
  if (!cell.revealed) return `Row ${cell.row + 1}, column ${cell.col + 1}, covered`;
  if (cell.mine) return `Row ${cell.row + 1}, column ${cell.col + 1}, mine`;
  return `Row ${cell.row + 1}, column ${cell.col + 1}, ${cell.adjacent ? `${cell.adjacent} neighboring mines` : "empty"}`;
}
