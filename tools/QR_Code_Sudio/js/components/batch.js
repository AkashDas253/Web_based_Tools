
const styles = `
  .batch-form {
    display: grid;
    gap: 12px;
  }

  .batch-form label {
    font-size: 12px;
    font-weight: 650;
  }

  .batch-form textarea,
  .batch-form select {
    width: 100%;
    min-width: 0;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 9px;
    background: white;
  }

  .batch-form textarea {
    line-height: 1.6;
  }

  .batch-form button,
  .batch-download button {
    padding: 9px 14px;
    border: 0;
    border-radius: 8px;
    background: var(--primary);
    color: white;
    font-weight: 650;
    cursor: pointer;
  }

  .batch-form button:hover,
  .batch-download button:hover {
    background: var(--primary-dark);
  }

  .batch-output {
    display: none;
    margin-top: 22px;
  }

  .batch-output.visible {
    display: block;
  }

  .batch-summary {
    margin-bottom: 16px;
    color: var(--muted);
    font-size: 13px;
  }

  .batch-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
    padding: 14px;
    background: #f8f9fc;
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .batch-select-all {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: auto;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
  }

  .batch-select-all input,
  .batch-card-select input {
    width: 16px;
    height: 16px;
    accent-color: var(--primary);
    cursor: pointer;
  }

  .batch-toolbar select {
    width: auto;
    min-width: 75px;
  }

  .batch-download {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .batch-download button:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .batch-selection-count {
    width: 100%;
    color: var(--muted);
    font-size: 12px;
  }

  .batch-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 14px;
  }

  .batch-card {
    min-width: 0;
    padding: 13px;
    background: white;
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .batch-card.selected {
    border-color: var(--primary);
    background: #f9f8ff;
  }

  .batch-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 12px;
  }

  .batch-card-header h4 {
    margin: 0;
    font-size: 13px;
  }

  .batch-card-select {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }

  .batch-preview {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 150px;
    padding: 12px;
    background: #f8f9fc;
    border-radius: 8px;
    overflow: hidden;
  }

  .batch-preview svg {
    display: block;
    max-width: 100%;
    max-height: 150px;
    height: auto;
  }

  .batch-value {
    margin: 10px 0;
    color: var(--muted);
    font-size: 11px;
    overflow-wrap: anywhere;
  }

  .batch-card-download {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--border);
    border-radius: 7px;
    background: white;
    color: var(--primary);
    font-size: 12px;
    font-weight: 650;
    cursor: pointer;
  }

  .batch-card-download:hover {
    background: #f2f0ff;
  }

  .batch-card-download:disabled {
    opacity: .5;
    cursor: wait;
  }
`;

function addStyles() {
  if (document.getElementById("batch-styles")) return;

  const style = document.createElement("style");
  style.id = "batch-styles";
  style.textContent = styles;
  document.head.appendChild(style);
}

function renderSVG(svgString, container) {
  const parsed = new DOMParser().parseFromString(
    svgString,
    "image/svg+xml"
  );

  if (
    parsed.documentElement.localName !== "svg" ||
    parsed.querySelector("parsererror")
  ) {
    throw new Error("A generated SVG is invalid.");
  }

  container.appendChild(
    document.importNode(parsed.documentElement, true)
  );
}

function createFilename(result, index, extension) {
  const type = result.type || "code";

  return `${type}-${String(index + 1).padStart(3, "0")}.${extension}`;
}

export const title = "Batch";
export const description = "Generate and download multiple QR codes and barcodes.";

export function mount(container, { app, notify }) {
  addStyles();

  container.innerHTML = `
    <section class="tool-panel">

      <form class="batch-form" id="batch-form">

        <label for="batch-type">Code type</label>

        <select id="batch-type">
          <option value="qr">QR Code</option>
          <option value="barcode">Barcode</option>
        </select>

        <label for="batch-input">Enter one item per line</label>

        <textarea
          id="batch-input"
          rows="8"
          placeholder="https://example.com&#10;Hello world&#10;Another item"
          required
        ></textarea>

        <button type="submit">Generate batch</button>

      </form>

      <section class="batch-output" id="batch-output">

        <div class="batch-summary" id="batch-summary"></div>

        <div class="batch-toolbar">

          <label class="batch-select-all">
            <input type="checkbox" id="batch-select-all">
            Select all
          </label>

          <div class="batch-download">

            <select id="batch-format" aria-label="Download format">
              <option value="svg">SVG</option>
              <option value="png">PNG</option>
            </select>

            <button type="button" id="batch-download-selected">
              Download selected ZIP
            </button>

          </div>

          <div class="batch-selection-count" id="batch-selection-count">
            0 selected
          </div>

        </div>

        <div class="batch-grid" id="batch-grid"></div>

      </section>

    </section>
  `;

  const form = container.querySelector("#batch-form");
  const input = container.querySelector("#batch-input");
  const typeSelect = container.querySelector("#batch-type");

  const output = container.querySelector("#batch-output");
  const summary = container.querySelector("#batch-summary");
  const grid = container.querySelector("#batch-grid");

  const selectAll = container.querySelector("#batch-select-all");
  const formatSelect = container.querySelector("#batch-format");
  const downloadSelected = container.querySelector("#batch-download-selected");
  const selectionCount = container.querySelector("#batch-selection-count");

  let currentResults = [];
  let selectedIndexes = new Set();

  function updateSelectionUI() {
    const total = currentResults.length;
    const selected = selectedIndexes.size;

    selectionCount.textContent = `${selected} of ${total} selected`;

    selectAll.checked = total > 0 && selected === total;
    selectAll.indeterminate = selected > 0 && selected < total;

    downloadSelected.disabled = selected === 0;
    downloadSelected.textContent = selected > 0
      ? `Download ${selected} selected ZIP`
      : "Download selected ZIP";

    grid.querySelectorAll(".batch-card").forEach((card, index) => {
      const checked = selectedIndexes.has(index);

      card.classList.toggle("selected", checked);

      const checkbox = card.querySelector(".batch-card-select input");
      if (checkbox) checkbox.checked = checked;
    });
  }

  function renderResults() {
    grid.replaceChildren();

    currentResults.forEach((result, index) => {
      const card = document.createElement("article");
      card.className = "batch-card";

      const header = document.createElement("div");
      header.className = "batch-card-header";

      const heading = document.createElement("h4");
      heading.textContent = `Code ${index + 1}`;

      const selectLabel = document.createElement("label");
      selectLabel.className = "batch-card-select";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.setAttribute("aria-label", `Select code ${index + 1}`);

      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          selectedIndexes.add(index);
        } else {
          selectedIndexes.delete(index);
        }

        updateSelectionUI();
      });

      selectLabel.append(checkbox, "Select");
      header.append(heading, selectLabel);

      const preview = document.createElement("div");
      preview.className = "batch-preview";

      renderSVG(result.svg, preview);

      const value = document.createElement("div");
      value.className = "batch-value";
      value.textContent = result.value;

      const downloadButton = document.createElement("button");
      downloadButton.type = "button";
      downloadButton.className = "batch-card-download";
      downloadButton.textContent = "Download image";

      downloadButton.addEventListener("click", async () => {
        const format = formatSelect.value;
        const filename = createFilename(result, index, format);

        downloadButton.disabled = true;
        downloadButton.textContent = "Preparing...";

        try {
          if (format === "svg") {
            app.export.svg(result.svg, filename);
          } else {
            await app.export.png(result.svg, filename, 1024);
          }

          notify(`Code ${index + 1} downloaded.`, "success");

        } catch (error) {
          console.error("Individual download error:", error);
          notify(error.message || "Download failed.", "error");

        } finally {
          downloadButton.disabled = false;
          downloadButton.textContent = "Download image";
        }
      });

      card.append(header, preview, value, downloadButton);
      grid.appendChild(card);
    });

    updateSelectionUI();
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    const values = input.value
      .split(/\r?\n/)
      .map(value => value.trim())
      .filter(Boolean);

    if (!values.length) {
      notify("Enter at least one item.", "error");
      return;
    }

    try {
      const type = typeSelect.value;

      const items = values.map(data => ({
        type,
        data
      }));

      const results = app.batch.generate(items);

      if (!results.length) {
        throw new Error("No codes were generated.");
      }

      if (results.some(result => typeof result.svg !== "string")) {
        throw new Error("A generated code did not return valid SVG data.");
      }

      currentResults = results;
      selectedIndexes = new Set(results.map((_, index) => index));

      renderResults();

      summary.textContent =
        `Successfully generated ${results.length} ${type === "qr" ? "QR codes" : "barcodes"}.`;

      output.classList.add("visible");

      notify(`${results.length} codes generated.`, "success");

    } catch (error) {
      console.error("Batch generation error:", error);
      notify(error.message || "Batch generation failed.", "error");
    }
  });

  selectAll.addEventListener("change", () => {
    selectedIndexes = selectAll.checked
      ? new Set(currentResults.map((_, index) => index))
      : new Set();

    updateSelectionUI();
  });

  downloadSelected.addEventListener("click", async () => {
    const selectedResults = [...selectedIndexes]
      .sort((a, b) => a - b)
      .map(index => currentResults[index]);

    if (!selectedResults.length) {
      notify("Select at least one code.", "error");
      return;
    }

    const format = formatSelect.value;

    downloadSelected.disabled = true;
    downloadSelected.textContent = "Preparing ZIP...";

    try {
      await app.export.zip(
        selectedResults,
        `selected-codes-${format}.zip`,
        format,
        1024
      );

      notify(`${selectedResults.length} codes added to ZIP.`, "success");

    } catch (error) {
      console.error("ZIP export error:", error);
      notify(error.message || "ZIP export failed.", "error");

    } finally {
      updateSelectionUI();
    }
  });
}
