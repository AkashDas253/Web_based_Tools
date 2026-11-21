const styles = `
  .formats-heading { margin: 0 0 18px; font-size: 19px; }
  .formats-list {
    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px; padding: 0; list-style: none;
  }
  .formats-list li {
    min-width: 0; padding: 15px; border: 1px solid var(--border);
    border-radius: 9px; background: #fafbfe; font-size: 13px; overflow-wrap: anywhere;
  }
  @media (max-width: 500px) { .formats-list { grid-template-columns: 1fr; } }
`;

function addStyles() {
  if (document.getElementById("formats-styles")) return;
  const style = document.createElement("style");
  style.id = "formats-styles";
  style.textContent = styles;
  document.head.appendChild(style);
}

export const title = "Formats";
export const description = "View supported QR code and barcode formats.";

export function mount(container, { app }) {
  addStyles();
  const formats = app.formats.list();
  container.innerHTML = `
    <section class="tool-panel">
      <h2 class="formats-heading">Supported formats</h2>
      <ul class="formats-list" id="formats-list"></ul>
    </section>
  `;
  const list = container.querySelector("#formats-list");
  if (!formats.length) {
    list.innerHTML = `<li>No formats available.</li>`;
    return;
  }
  formats.forEach(format => {
    const item = document.createElement("li");
    item.textContent = String(format);
    list.appendChild(item);
  });
}
