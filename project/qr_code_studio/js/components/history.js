const styles = `
  .history-heading {
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 12px; margin-bottom: 18px;
  }
  .history-heading h2 { margin: 0; font-size: 19px; }
  .history-clear {
    padding: 8px 12px; border: 0; border-radius: 7px;
    background: #fff0f0; color: var(--danger); font-size: 12px;
  }
  .history-item { padding: 14px 0; border-bottom: 1px solid var(--border); overflow-wrap: anywhere; }
  .history-item strong { font-size: 13px; }
  .history-item p { margin: 6px 0 0; color: var(--muted); font-size: 12px; white-space: pre-wrap; }
`;

function addStyles() {
  if (document.getElementById("history-styles")) return;
  const style = document.createElement("style");
  style.id = "history-styles";
  style.textContent = styles;
  document.head.appendChild(style);
}

export const title = "History";
export const description = "View and manage generated and scanned codes.";

export function mount(container, { app, notify }) {
  addStyles();

  function render() {
    const entries = app.history.list();
    container.innerHTML = `
      <section class="tool-panel">
        <div class="history-heading">
          <h2>Activity history</h2>
          <button type="button" class="history-clear" id="clear-history">Clear history</button>
        </div>
        <div id="history-list"></div>
      </section>
    `;

    const list = container.querySelector("#history-list");
    if (!entries.length) {
      list.innerHTML = `<p class="empty-state">No history available.</p>`;
    } else {
      entries.forEach(entry => {
        const item = document.createElement("article");
        item.className = "history-item";
        const heading = document.createElement("strong");
        heading.textContent = `${entry.action || "Activity"} — ${entry.format || entry.type || "Code"}`;
        const value = document.createElement("p");
        value.textContent = entry.value || "";
        item.append(heading, value);
        list.appendChild(item);
      });
    }

    container.querySelector("#clear-history").addEventListener("click", () => {
      app.history.clear();
      render();
      notify("History cleared.", "success");
    });
  }

  render();
}
