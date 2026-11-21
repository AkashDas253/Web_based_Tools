const styles = `
  .sidebar {
    position: fixed; inset: 0 auto 0 0; z-index: 20;
    width: var(--sidebar-width); padding: 23px 15px;
    display: flex; flex-direction: column;
    background: var(--surface); border-right: 1px solid var(--border);
    transition: transform .22s ease;
  }
  .sidebar-brand { padding: 5px 10px 28px; }
  .sidebar-brand h2 { margin: 0; color: var(--primary); font-size: 19px; }
  .sidebar-nav { display: flex; flex-direction: column; gap: 3px; }
  .nav-item {
    width: 100%; padding: 11px 13px; border: 0; border-radius: 9px;
    background: transparent; color: #747b90; text-align: left; font-size: 13px;
  }
  .nav-item:hover, .nav-item.active { color: var(--primary); background: #f0efff; }
  .nav-item.active { font-weight: 650; }
  @media (max-width: 760px) {
    .sidebar { transform: translateX(-100%); box-shadow: 12px 0 35px #0001; }
    .sidebar.open { transform: translateX(0); }
  }
`;

function addStyles() {
  if (document.getElementById("sidebar-styles")) return;
  const style = document.createElement("style");
  style.id = "sidebar-styles";
  style.textContent = styles;
  document.head.appendChild(style);
}

let sidebarElement;

export function mount(container, context) {
  addStyles();
  container.innerHTML = `
    <aside class="sidebar" id="app-sidebar">
      <div class="sidebar-brand"><h2>QR Studio</h2></div>
      <nav class="sidebar-nav" aria-label="Main navigation">
        <button class="nav-item" data-page="dashboard">Dashboard</button>
        <button class="nav-item" data-page="generator">Generator</button>
        <button class="nav-item" data-page="scanner">Scanner</button>
        <button class="nav-item" data-page="batch">Batch</button>
        <button class="nav-item" data-page="history">History</button>
        <button class="nav-item" data-page="formats">Formats</button>
        <button class="nav-item" data-page="settings">Settings</button>
      </nav>
    </aside>
  `;

  sidebarElement = container.querySelector("#app-sidebar");
  sidebarElement.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => context.navigate(button.dataset.page));
  });
}

export function setActive(pageName) {
  sidebarElement?.querySelectorAll("[data-page]").forEach(button => {
    const active = button.dataset.page === pageName;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}

export function setOpen(open) {
  sidebarElement?.classList.toggle("open", Boolean(open));
}
