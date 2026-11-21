const styles = `
  .dashboard-stats {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 13px; margin-bottom: 27px;
  }
  .dashboard-stat {
    padding: 19px; background: white; border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  .dashboard-stat h3 { margin: 0; color: var(--muted); font-size: 12px; font-weight: 500; }
  .dashboard-stat p { margin: 7px 0 0; font-size: 27px; font-weight: 750; }
  .dashboard-section h2 { margin: 25px 0 14px; font-size: 17px; }
  .quick-actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; }
  .quick-actions button {
    padding: 19px; border: 1px solid var(--border); border-radius: var(--radius);
    background: white; color: var(--primary); text-align: left; font-weight: 650;
  }
  .quick-actions button:hover { border-color: #c7c3ff; background: #faf9ff; }
  @media (max-width: 600px) {
    .dashboard-stats { gap: 8px; }
    .dashboard-stat { padding: 12px; }
    .dashboard-stat p { font-size: 21px; }
    .quick-actions { grid-template-columns: 1fr; }
  }
`;

function addStyles() {
  if (document.getElementById("dashboard-styles")) return;
  const style = document.createElement("style");
  style.id = "dashboard-styles";
  style.textContent = styles;
  document.head.appendChild(style);
}

export const title = "Dashboard";
export const description = "Your QR and barcode workspace.";

export function mount(container, { app, navigate }) {
  addStyles();
  const history = app.history.list();
  container.innerHTML = `
    <div class="dashboard-stats">
      <article class="dashboard-stat"><h3>Generated</h3><p>${Number(app.state.generated) || 0}</p></article>
      <article class="dashboard-stat"><h3>Scanned</h3><p>${Number(app.state.scanned) || 0}</p></article>
      <article class="dashboard-stat"><h3>History items</h3><p>${history.length}</p></article>
    </div>
    <section class="dashboard-section">
      <h2>Quick actions</h2>
      <div class="quick-actions">
        <button type="button" data-page="generator">Generate a code</button>
        <button type="button" data-page="scanner">Scan a code</button>
        <button type="button" data-page="batch">Batch generation</button>
      </div>
    </section>
  `;
  container.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => navigate(button.dataset.page));
  });
}
