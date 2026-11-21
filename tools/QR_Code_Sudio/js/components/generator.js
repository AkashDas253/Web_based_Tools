
const styles = `
  .generator-form {
    display: grid;
    gap: 10px;
  }

  .generator-form label {
    font-size: 12px;
    font-weight: 650;
  }

  .generator-form input,
  .generator-form textarea,
  .generator-form select {
    width: 100%;
    min-width: 0;
    padding: 10px 11px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: white;
    color: #111827;
  }

  .generator-form input[type="checkbox"] {
    width: auto;
  }

  .generator-form button,
  .generator-download button {
    padding: 10px 17px;
    border: 0;
    border-radius: 8px;
    background: var(--primary);
    color: white;
    font-weight: 650;
    cursor: pointer;
  }

  .generator-form button:hover,
  .generator-download button:hover {
    background: var(--primary-dark);
  }

  .generator-section {
    display: grid;
    gap: 10px;
    padding: 14px;
    border: 1px solid var(--border);
    border-radius: 10px;
    margin-top: 8px;
  }

  .generator-section h3 {
    margin: 0 0 4px;
    font-size: 14px;
  }

  .generator-field {
    display: grid;
    gap: 6px;
  }

  .generator-inline {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .generator-hidden {
    display: none !important;
  }

  .generator-colors {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .generator-colors input[type="color"] {
    height: 42px;
    padding: 3px;
  }

  .generator-output {
    display: none;
    margin-top: 22px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
  }

  .generator-output.visible {
    display: block;
  }

  .generator-preview {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    margin: 15px 0;
    padding: 20px;
    background: #f8f9fc;
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: auto;
  }

  .generator-preview svg {
    display: block;
    max-width: 100%;
    max-height: 350px;
    height: auto;
  }

  .generator-info {
    color: var(--muted);
    font-size: 13px;
    line-height: 1.7;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .generator-download {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 16px;
  }

  .generator-download button:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  @media (max-width: 480px) {
    .generator-colors {
      grid-template-columns: 1fr;
    }
  }
`;

function addStyles() {
  if (document.getElementById("generator-styles")) return;

  const style = document.createElement("style");
  style.id = "generator-styles";
  style.textContent = styles;
  document.head.appendChild(style);
}

function createFilename(result, extension) {
  const type = result.type || "code";

  const format = (result.format || "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return `${type}${format ? "-" + format : ""}.${extension}`;
}

function renderPreview(result, preview) {
  preview.replaceChildren();

  if (!result || typeof result.svg !== "string") {
    throw new Error("The generator did not return a valid SVG.");
  }

  const parsed = new DOMParser().parseFromString(
    result.svg,
    "image/svg+xml"
  );

  const svg = parsed.documentElement;

  if (
    svg.localName !== "svg" ||
    parsed.querySelector("parsererror")
  ) {
    throw new Error("The generated SVG is invalid.");
  }

  preview.appendChild(document.importNode(svg, true));
}

export const title = "Generator";
export const description = "Create customized QR codes and barcodes.";

export function mount(container, { app, notify }) {
  addStyles();

  const payloadTypes = app.payload.getTypes();
  const qrOptions = app.generator.getQROptions();
  const barcodeOptions = app.generator.getBarcodeOptions();

  container.innerHTML = `
    <section class="tool-panel">

      <form class="generator-form" id="generator-form">

        <div class="generator-field">
          <label for="generator-type">Code type</label>
          <select id="generator-type">
            <option value="qr">QR Code</option>
            <option value="barcode">Barcode</option>
          </select>
        </div>

        <div id="generator-qr-fields">

          <div class="generator-field">
            <label for="generator-payload">Content type</label>
            <select id="generator-payload">
              ${payloadTypes.map(type =>
                `<option value="${type.id}">${type.label}</option>`
              ).join("")}
            </select>
          </div>

          <div class="generator-section" id="generator-payload-fields">

            <div class="generator-payload-group" data-payload="text">
              <div class="generator-field">
                <label for="payload-text">Text</label>
                <textarea id="payload-text" rows="4"
                  placeholder="Enter your text..."></textarea>
              </div>
            </div>

            <div class="generator-payload-group generator-hidden" data-payload="url">
              <div class="generator-field">
                <label for="payload-url">Website URL</label>
                <input id="payload-url" type="url"
                  placeholder="https://example.com">
              </div>
            </div>

            <div class="generator-payload-group generator-hidden" data-payload="wifi">

              <div class="generator-field">
                <label for="payload-ssid">Network name (SSID)</label>
                <input id="payload-ssid" placeholder="Wi-Fi network name">
              </div>

              <div class="generator-field">
                <label for="payload-security">Security</label>
                <select id="payload-security">
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">No password</option>
                </select>
              </div>

              <div class="generator-field" id="wifi-password-field">
                <label for="payload-password">Password</label>
                <input id="payload-password" type="password"
                  placeholder="Wi-Fi password">
              </div>

              <label class="generator-inline">
                <input type="checkbox" id="payload-hidden">
                Hidden network
              </label>

            </div>

            <div class="generator-payload-group generator-hidden" data-payload="email">

              <div class="generator-field">
                <label for="payload-email">Email address</label>
                <input id="payload-email" type="email"
                  placeholder="name@example.com">
              </div>

              <div class="generator-field">
                <label for="payload-subject">Subject</label>
                <input id="payload-subject" placeholder="Email subject">
              </div>

              <div class="generator-field">
                <label for="payload-body">Message</label>
                <textarea id="payload-body" rows="3"
                  placeholder="Email message"></textarea>
              </div>

            </div>

            <div class="generator-payload-group generator-hidden" data-payload="sms">

              <div class="generator-field">
                <label for="payload-phone">Phone number</label>
                <input id="payload-phone" type="tel"
                  placeholder="+1234567890">
              </div>

              <div class="generator-field">
                <label for="payload-message">Message</label>
                <textarea id="payload-message" rows="3"
                  placeholder="SMS message"></textarea>
              </div>

            </div>

            <div class="generator-payload-group generator-hidden" data-payload="vcard">

              <div class="generator-field">
                <label for="payload-name">Full name</label>
                <input id="payload-name" placeholder="John Doe">
              </div>

              <div class="generator-field">
                <label for="payload-vcard-phone">Phone</label>
                <input id="payload-vcard-phone" type="tel"
                  placeholder="+1234567890">
              </div>

              <div class="generator-field">
                <label for="payload-vcard-email">Email</label>
                <input id="payload-vcard-email" type="email"
                  placeholder="name@example.com">
              </div>

              <div class="generator-field">
                <label for="payload-organization">Organization</label>
                <input id="payload-organization"
                  placeholder="Company name">
              </div>

            </div>

          </div>

          <div class="generator-section">
            <h3>QR customization</h3>

            <div class="generator-field">
              <label for="qr-size">Output size</label>
              <select id="qr-size">
                ${qrOptions.sizes.map(size =>
                  `<option value="${size}" ${size === 384 ? "selected" : ""}>${size} × ${size}</option>`
                ).join("")}
              </select>
            </div>

            <div class="generator-field">
              <label for="qr-error">Error correction</label>
              <select id="qr-error">
                ${qrOptions.errorCorrection.map(level =>
                  `<option value="${level}" ${level === "M" ? "selected" : ""}>${level}</option>`
                ).join("")}
              </select>
            </div>

            <div class="generator-field">
              <label for="qr-margin">Margin (modules)</label>
              <input id="qr-margin" type="number"
                min="0" max="20" value="4">
            </div>

            <div class="generator-colors">
              <div class="generator-field">
                <label for="qr-foreground">Foreground</label>
                <input id="qr-foreground" type="color" value="#111827">
              </div>

              <div class="generator-field">
                <label for="qr-background">Background</label>
                <input id="qr-background" type="color" value="#ffffff">
              </div>
            </div>
          </div>

        </div>

        <div id="generator-barcode-fields" class="generator-hidden">

          <div class="generator-field">
            <label for="barcode-content">Barcode content</label>
            <textarea id="barcode-content" rows="3"
              placeholder="Enter barcode content..."></textarea>
          </div>

          <div class="generator-section">
            <h3>Barcode options</h3>

            <div class="generator-field">
              <label for="barcode-format">Format</label>
              <select id="barcode-format">
                ${barcodeOptions.formats.map(format =>
                  `<option value="${format}" ${format === "CODE128" ? "selected" : ""}>${format}</option>`
                ).join("")}
              </select>
            </div>

            <div class="generator-field">
              <label for="barcode-height">Height</label>
              <input id="barcode-height" type="number"
                min="30" max="300" value="${barcodeOptions.defaults.height}">
            </div>

            <div class="generator-field">
              <label for="barcode-width">Bar width</label>
              <input id="barcode-width" type="number"
                min="1" max="5" value="${barcodeOptions.defaults.width}">
            </div>

            <label class="generator-inline">
              <input type="checkbox" id="barcode-display" checked>
              Display barcode value
            </label>

            <div class="generator-colors">
              <div class="generator-field">
                <label for="barcode-foreground">Foreground</label>
                <input id="barcode-foreground" type="color"
                  value="#111827">
              </div>

              <div class="generator-field">
                <label for="barcode-background">Background</label>
                <input id="barcode-background" type="color"
                  value="#ffffff">
              </div>
            </div>
          </div>

        </div>

        <button type="submit">Generate</button>

      </form>

      <section class="generator-output" id="generator-output">

        <h3>Generated Result</h3>

        <div class="generator-preview" id="generator-preview"></div>

        <div class="generator-info" id="generator-info"></div>

        <div class="generator-download">

          <button type="button" id="download-svg">
            Download SVG
          </button>

          <button type="button" id="download-png">
            Download PNG
          </button>

        </div>

      </section>

    </section>
  `;

  const $ = selector => container.querySelector(selector);

  const form = $("#generator-form");
  const typeSelect = $("#generator-type");
  const payloadSelect = $("#generator-payload");
  const payloadFields = $("#generator-payload-fields");

  const qrFields = $("#generator-qr-fields");
  const barcodeFields = $("#generator-barcode-fields");

  const output = $("#generator-output");
  const preview = $("#generator-preview");
  const info = $("#generator-info");

  const svgButton = $("#download-svg");
  const pngButton = $("#download-png");

  let currentResult = null;

  function updatePayloadFields() {
    const selected = payloadSelect.value;

    payloadFields.querySelectorAll("[data-payload]").forEach(group => {
      group.classList.toggle(
        "generator-hidden",
        group.dataset.payload !== selected
      );
    });

    updateWifiFields();
  }

  function updateWifiFields() {
    const passwordField = $("#wifi-password-field");
    const security = $("#payload-security").value;

    passwordField.classList.toggle(
      "generator-hidden",
      security === "nopass"
    );
  }

  function updateCodeType() {
    const isQR = typeSelect.value === "qr";

    qrFields.classList.toggle("generator-hidden", !isQR);
    barcodeFields.classList.toggle("generator-hidden", isQR);
  }

  function getPayloadData(type) {
    const values = {
      text: {
        text: $("#payload-text").value
      },

      url: {
        url: $("#payload-url").value
      },

      wifi: {
        ssid: $("#payload-ssid").value,
        security: $("#payload-security").value,
        password: $("#payload-password").value,
        hidden: $("#payload-hidden").checked
      },

      email: {
        email: $("#payload-email").value,
        subject: $("#payload-subject").value,
        body: $("#payload-body").value
      },

      sms: {
        phone: $("#payload-phone").value,
        message: $("#payload-message").value
      },

      vcard: {
        name: $("#payload-name").value,
        phone: $("#payload-vcard-phone").value,
        email: $("#payload-vcard-email").value,
        organization: $("#payload-organization").value
      }
    };

    return values[type];
  }

  function getQROptions() {
    return {
      size: Number($("#qr-size").value),
      errorCorrection: $("#qr-error").value,
      margin: Number($("#qr-margin").value),
      foreground: $("#qr-foreground").value,
      background: $("#qr-background").value
    };
  }

  function getBarcodeOptions() {
    return {
      format: $("#barcode-format").value,
      height: Number($("#barcode-height").value),
      width: Number($("#barcode-width").value),
      displayValue: $("#barcode-display").checked,
      foreground: $("#barcode-foreground").value,
      background: $("#barcode-background").value
    };
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    try {
      let result;

      if (typeSelect.value === "qr") {
        const payloadType = payloadSelect.value;
        const payloadData = getPayloadData(payloadType);

        const content = app.payload.build(
          payloadType,
          payloadData
        );

        if (!content) {
          throw new Error("Enter some content to generate a QR code.");
        }

        result = app.generator.generate(
          "qr",
          content,
          getQROptions()
        );

      } else {
        const content = $("#barcode-content").value.trim();

        if (!content) {
          throw new Error("Enter barcode content.");
        }

        result = app.generator.generate(
          "barcode",
          content,
          getBarcodeOptions()
        );
      }

      renderPreview(result, preview);

      currentResult = result;

      info.textContent =
        `Type: ${result.type}\n` +
        `Format: ${result.format}\n` +
        `Content: ${result.value}`;

      output.classList.add("visible");

      notify("Code generated successfully.", "success");

    } catch (error) {
      console.error("Generation error:", error);
      notify(error.message || "Generation failed.", "error");
    }
  });

  typeSelect.addEventListener("change", updateCodeType);
  payloadSelect.addEventListener("change", updatePayloadFields);
  $("#payload-security").addEventListener("change", updateWifiFields);

  svgButton.addEventListener("click", () => {
    if (!currentResult) return;

    try {
      app.export.svg(
        currentResult.svg,
        createFilename(currentResult, "svg")
      );

      notify("SVG downloaded successfully.", "success");

    } catch (error) {
      console.error("SVG export error:", error);
      notify(error.message || "SVG download failed.", "error");
    }
  });

  pngButton.addEventListener("click", async () => {
    if (!currentResult) return;

    pngButton.disabled = true;
    pngButton.textContent = "Preparing PNG...";

    try {
      await app.export.png(
        currentResult.svg,
        createFilename(currentResult, "png"),
        1024
      );

      notify("PNG downloaded successfully.", "success");

    } catch (error) {
      console.error("PNG export error:", error);
      notify(error.message || "PNG download failed.", "error");

    } finally {
      pngButton.disabled = false;
      pngButton.textContent = "Download PNG";
    }
  });

  updateCodeType();
  updatePayloadFields();
}
