const styles = `
  .settings-heading { margin: 0 0 17px; font-size: 19px; }
  .settings-data {
    display: block; width: 100%; min-width: 0; margin-top: 8px; padding: 12px;
    border: 1px solid var(--border); border-radius: 8px; background: #fafbfe;
    font-family: ui-monospace, monospace; font-size: 12px; line-height: 1.6;
  }
  .settings-actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 14px; }
`;

function addStyles() {
  if (document.getElementById("settings-styles")) return;
  const style = document.createElement("style");
  style.id = "settings-styles";
  style.textContent = styles;
  document.head.appendChild(style);
}

export const title = "Settings";
export const description = "Manage application settings.";

export function mount(container, { app, notify }) {
  addStyles();
  const settings = app.settings.get();
  container.innerHTML = `
    <section class="tool-panel">
      <h2 class="settings-heading">Application settings</h2>
      <div class="field">
        <label for="settings-data">Settings JSON</label>
        <textarea class="settings-data" id="settings-data" rows="10" spellcheck="false"></textarea>
      </div>
      <div class="settings-actions">
        <button type="button" class="button button-primary" id="save-settings">Save settings</button>
        <button type="button" class="button button-danger" id="reset-settings">Reset settings</button>
      </div>
    </section>
  `;

  const textarea = container.querySelector("#settings-data");
  textarea.value = JSON.stringify(settings ?? {}, null, 2);

  container.querySelector("#save-settings").addEventListener("click", () => {
    try {
      app.settings.save(JSON.parse(textarea.value));
      notify("Settings saved.", "success");
    } catch (error) {
      console.error(error);
      notify("Invalid JSON. Settings were not saved.", "error");
    }
  });

  container.querySelector("#reset-settings").addEventListener("click", () => {
    try {
      app.settings.clear();
      textarea.value = JSON.stringify(app.settings.get() ?? {}, null, 2);
      notify("Settings reset.", "success");
    } catch (error) {
      console.error(error);
      notify(error.message || "Unable to reset settings.", "error");
    }
  });
}
