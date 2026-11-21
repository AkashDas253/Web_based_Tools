const styles = `
  .app-header {
    min-height: 78px; padding: 13px 32px; display: flex;
    align-items: center; gap: 14px; position: sticky; top: 0; z-index: 5;
    background: #ffffffed; border-bottom: 1px solid var(--border);
    backdrop-filter: blur(10px);
  }
  .header-text { min-width: 0; }
  .header-text h1 { margin: 0 0 2px; font-size: 19px; }
  .header-text p { margin: 0; color: var(--muted); font-size: 12px; }
  .menu-toggle {
    display: none; flex: 0 0 auto; padding: 8px 11px;
    border: 1px solid var(--border); border-radius: 8px; background: white;
  }
  @media (max-width: 760px) {
    .app-header { padding: 12px 16px; }
    .menu-toggle { display: block; }
  }
`;

function addStyles() {
  if (document.getElementById("header-styles")) return;
  const style = document.createElement("style");
  style.id = "header-styles";
  style.textContent = styles;
  document.head.appendChild(style);
}

let headerElement;

export function mount(container, context) {
  addStyles();
  container.innerHTML = `
    <header class="app-header">
      <button type="button" class="menu-toggle" id="menu-toggle"
        aria-label="Toggle navigation" aria-expanded="false">☰</button>
      <div class="header-text">
        <h1 id="page-title">Dashboard</h1>
        <p id="page-description">Your QR and barcode workspace.</p>
      </div>
    </header>
  `;

  headerElement = container.querySelector(".app-header");
  headerElement.querySelector("#menu-toggle").addEventListener("click", () => {
    context.state.sidebarOpen = !context.state.sidebarOpen;
    document.querySelector("#app-sidebar")?.classList.toggle("open", context.state.sidebarOpen);
    setMenuExpanded(context.state.sidebarOpen);
  });
}

export function setPage(title, description = "") {
  if (!headerElement) return;
  headerElement.querySelector("#page-title").textContent = title;
  headerElement.querySelector("#page-description").textContent = description;
}

export function setMenuExpanded(expanded) {
  headerElement?.querySelector("#menu-toggle")
    ?.setAttribute("aria-expanded", String(Boolean(expanded)));
}
