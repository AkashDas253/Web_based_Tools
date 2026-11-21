
import { app } from "./app.js";

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const pageInfo = {
  dashboard: ["Dashboard", "Create and scan codes in your browser."],
  generator: ["Generator", "Create QR codes and barcodes."],
  scanner: ["Scanner", "Read and decode supported codes."],
  batch: ["Batch generator", "Generate multiple QR codes."],
  history: ["History", "Review your previous activity."],
  formats: ["Formats", "Explore supported code formats."],
  settings: ["Settings", "Manage local application preferences."]
};

let currentResult = null;
let cameraStream = null;
let scanning = false;
let scanBusy = false;
let lastCameraValue = "";
let scanTimer = null;

function navigate(view) {
  if (!pageInfo[view]) return;

  app.setView(view);

  $$(".view").forEach(section => {
    section.classList.toggle("active", section.id === `${view}-view`);
  });

  $$(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  $("#page-title").textContent = pageInfo[view][0];
  $("#page-description").textContent = pageInfo[view][1];
  $("#sidebar").classList.remove("open");

  if (view === "history") renderHistory();
  if (view === "formats") renderFormats();
  updateStats();
}

function updateStats() {
  const history = app.history.list();

  $("#stat-generated").textContent =
    history.filter(item => item.action === "generated").length;

  $("#stat-scanned").textContent =
    history.filter(item => item.action === "scanned").length;

  $("#stat-formats").textContent = app.getFormats().length;
}

function renderPayloadFields() {
  const type = $("#payload-type").value;
  const container = $("#payload-fields");

  const fields = {
    text: [],
    url: [{ id: "url", label: "Website URL", placeholder: "https://example.com" }],
    wifi: [
      { id: "ssid", label: "Network name", placeholder: "Wi-Fi name" },
      { id: "password", label: "Password", placeholder: "Network password", type: "password" },
      { id: "security", label: "Security", select: [["WPA", "WPA/WPA2"], ["WEP", "WEP"], ["nopass", "No password"]] }
    ],
    email: [
      { id: "email", label: "Email address", placeholder: "hello@example.com" },
      { id: "subject", label: "Subject", placeholder: "Subject" },
      { id: "body", label: "Message", placeholder: "Message", textarea: true }
    ],
    sms: [
      { id: "phone", label: "Phone number", placeholder: "+1234567890" },
      { id: "message", label: "Message", placeholder: "Message", textarea: true }
    ],
    vcard: [
      { id: "name", label: "Contact name", placeholder: "Full name" },
      { id: "phone", label: "Phone", placeholder: "Phone number" },
      { id: "email", label: "Email", placeholder: "Email address" },
      { id: "organization", label: "Organization", placeholder: "Company" }
    ]
  };

  container.replaceChildren();

  for (const field of fields[type] || []) {
    const wrapper = document.createElement("div");
    wrapper.className = "field";

    const label = document.createElement("label");
    label.textContent = field.label;
    label.htmlFor = `payload-${field.id}`;

    let input;

    if (field.select) {
      input = document.createElement("select");
      field.select.forEach(([value, text]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        input.append(option);
      });
    } else if (field.textarea) {
      input = document.createElement("textarea");
      input.rows = 2;
      input.placeholder = field.placeholder;
    } else {
      input = document.createElement("input");
      input.type = field.type || "text";
      input.placeholder = field.placeholder;
    }

    input.id = `payload-${field.id}`;
    wrapper.append(label, input);
    container.append(wrapper);
  }

  $("#raw-field").hidden = type !== "text";
}

function getPayloadValue() {
  const type = $("#payload-type").value;

  if (type === "text") return $("#code-data").value;

  const data = {};
  $$("#payload-fields input, #payload-fields select, #payload-fields textarea")
    .forEach(input => {
      data[input.id.replace("payload-", "")] = input.value;
    });

  return app.payload.build(type, data);
}

function getOptions() {
  const kind = $("#code-kind").value;

  if (kind === "barcode") {
    return {
      format: $("#barcode-format").value,
      foreground: $("#foreground").value,
      background: $("#background").value,
      displayValue: $("#show-text").value === "true"
    };
  }

  return {
    size: Number($("#qr-size").value),
    errorCorrection: $("#qr-error").value,
    foreground: $("#foreground").value,
    background: $("#background").value,
    margin: 4
  };
}

function renderResult(result, container = $("#preview")) {
  container.replaceChildren();

  const image = document.createElement("img");
  const blob = new Blob([result.svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  image.src = url;
  image.alt = `${result.format} preview`;
  image.onload = () => URL.revokeObjectURL(url);
  image.onerror = () => URL.revokeObjectURL(url);

  container.append(image);
}

function generate() {
  try {
    const kind = $("#code-kind").value;
    const data = kind === "barcode"
      ? $("#code-data").value
      : getPayloadValue();

    const result = app.generate(kind, data, getOptions());

    currentResult = result;
    renderResult(result);

    $("#download-png").disabled = false;
    $("#download-svg").disabled = false;
    $("#generator-status").textContent = "Code generated successfully.";

    updateStats();
  } catch (error) {
    $("#generator-status").textContent = error.message;
  }
}

async function downloadPNG(result, name) {
  await app.export.png(result.svg, name, result.size || 1024);
}

function renderHistory() {
  const container = $("#history-list");
  container.replaceChildren();

  const history = app.history.list();

  if (!history.length) {
    container.textContent = "No history yet.";
    return;
  }

  history.forEach(item => {
    const article = document.createElement("article");
    article.className = "result-item";

    const heading = document.createElement("strong");
    heading.textContent = `${item.action} · ${item.format}`;

    const value = document.createElement("pre");
    value.textContent = item.value;

    const date = document.createElement("small");
    date.textContent = new Date(item.date).toLocaleString();

    article.append(heading, value, date);
    container.append(article);
  });
}

function renderFormats() {
  const container = $("#format-list");
  container.replaceChildren();

  const groups = [
    {
      name: "QR Code",
      detail: "Standard QR Code with L, M, Q and H error correction."
    },
    {
      name: "Code 128",
      detail: "General-purpose alphanumeric linear barcode."
    },
    {
      name: "Code 39",
      detail: "Alphanumeric linear barcode."
    },
    {
      name: "EAN / UPC",
      detail: "EAN-13, EAN-8 and UPC-A."
    },
    {
      name: "ITF",
      detail: "Interleaved 2 of 5 and ITF-14."
    },
    {
      name: "Other 1D",
      detail: "MSI, Pharmacode and Codabar."
    },
    {
      name: "Scanner",
      detail: "Native browser formats when available; jsQR fallback for QR codes."
    }
  ];

  groups.forEach(group => {
    const card = document.createElement("article");
    card.className = "format-card";

    const heading = document.createElement("h3");
    heading.textContent = group.name;

    const description = document.createElement("p");
    description.textContent = group.detail;

    card.append(heading, description);
    container.append(card);
  });
}

function renderScanResults(results) {
  const container = $("#scan-results");
  container.replaceChildren();

  if (!results.length) {
    container.textContent = "No supported code detected.";
    return;
  }

  results.forEach(result => {
    const article = document.createElement("article");
    article.className = "result-item";

    const heading = document.createElement("strong");
    heading.textContent = result.format.toUpperCase();

    const value = document.createElement("pre");
    value.textContent = result.rawValue;

    const actions = document.createElement("div");
    actions.className = "result-actions";

    const copy = document.createElement("button");
    copy.textContent = "Copy";
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(result.rawValue);
        $("#scanner-status").textContent = "Copied to clipboard.";
      } catch {
        $("#scanner-status").textContent = "Clipboard access is unavailable.";
      }
    });

    actions.append(copy);

    if (/^https?:\/\//i.test(result.rawValue)) {
      const open = document.createElement("button");
      open.textContent = "Open link";
      open.addEventListener("click", () => {
        window.open(result.rawValue, "_blank", "noopener,noreferrer");
      });
      actions.append(open);
    }

    article.append(heading, value, actions);
    container.append(article);
  });

  updateStats();
}


async function scanImage(file) {
  if (!file) {
    $("#scanner-status").textContent = "Select an image.";
    return;
  }

  const isImage =
    file.type.startsWith("image/") ||
    /\.svg$/i.test(file.name || "");

  if (!isImage) {
    $("#scanner-status").textContent =
      "Select a supported image file.";
    return;
  }

  $("#scanner-status").textContent = "Scanning image...";

  try {
    // Scanner handles SVG and raster image decoding.
    const results = await app.scan(file);

    renderScanResults(results);

    $("#scanner-status").textContent = results.length
      ? `Found ${results.length} code(s).`
      : "No supported code detected.";

  } catch (error) {
    $("#scanner-status").textContent = error.message;
  }
}


async function scanCameraFrame() {
  if (!scanning || scanBusy) return;

  scanBusy = true;

  try {
    const video = $("#camera-video");

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      const results = await app.scanner.decode(video);

      if (results.length) {
        const signature = results.map(item => item.rawValue).join("|");

        if (signature !== lastCameraValue) {
          lastCameraValue = signature;
          results.forEach(result => {
            app.history.add({
              action: "scanned",
              type: "scan",
              format: result.format,
              value: result.rawValue
            });
          });

          renderScanResults(results);
          $("#scanner-status").textContent = "Code detected.";
        }
      }
    }
  } catch {
    // Keep the camera running if one frame cannot be decoded.
  } finally {
    scanBusy = false;
  }
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    $("#scanner-status").textContent =
      "Camera requires HTTPS or localhost. You can upload an image instead.";
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });

    const video = $("#camera-video");
    video.srcObject = cameraStream;
    video.classList.add("active");
    await video.play();

    scanning = true;
    lastCameraValue = "";

    $("#camera-start").disabled = true;
    $("#camera-stop").disabled = false;
    $("#scanner-status").textContent = "Camera active. Point it at a code.";

    scanTimer = setInterval(scanCameraFrame, 220);
  } catch (error) {
    stopCamera();
    $("#scanner-status").textContent =
      error.name === "NotAllowedError"
        ? "Camera permission was denied."
        : "Unable to start the camera.";
  }
}

function stopCamera() {
  scanning = false;
  clearInterval(scanTimer);
  scanTimer = null;

  cameraStream?.getTracks().forEach(track => track.stop());
  cameraStream = null;

  const video = $("#camera-video");
  video.pause();
  video.srcObject = null;
  video.classList.remove("active");

  $("#camera-start").disabled = false;
  $("#camera-stop").disabled = true;
}

function generateBatch() {
  const values = $("#batch-data").value.split(/\r?\n/).map(value => value.trim()).filter(Boolean);
  const container = $("#batch-results");

  container.replaceChildren();

  if (!values.length) {
    $("#batch-status").textContent = "Enter at least one item.";
    return;
  }

  if (values.length > 50) {
    $("#batch-status").textContent = "The initial batch limit is 50 items.";
    return;
  }

  let completed = 0;

  values.forEach((value, index) => {
    try {
      const result = app.qr.generate(value, {
        size: 256,
        errorCorrection: "M",
        margin: 4
      });

      const card = document.createElement("article");
      card.className = "batch-item";

      const image = document.createElement("img");
      image.alt = `QR code ${index + 1}`;
      image.src = URL.createObjectURL(
        new Blob([result.svg], { type: "image/svg+xml" })
      );
      image.onload = () => URL.revokeObjectURL(image.src);

      const label = document.createElement("p");
      label.textContent = value;

      const download = document.createElement("button");
      download.className = "button secondary";
      download.textContent = "Download SVG";
      download.addEventListener("click", () => {
        app.export.svg(result.svg, `qr-${index + 1}.svg`);
      });

      card.append(image, label, download);
      container.append(card);

      app.history.add({
        action: "generated",
        type: "qr",
        format: "QR Code",
        value
      });

      completed++;
    } catch {
      // Continue generating the remaining entries.
    }
  });

  $("#batch-status").textContent = `${completed} of ${values.length} codes generated.`;
  updateStats();
}

function init() {
  $$("[data-view]").forEach(button => {
    button.addEventListener("click", () => navigate(button.dataset.view));
  });

  $("#menu-toggle").addEventListener("click", () => {
    $("#sidebar").classList.toggle("open");
  });

  $("#code-kind").addEventListener("change", () => {
    const barcode = $("#code-kind").value === "barcode";

    $("#payload-field").hidden = barcode;
    $("#payload-fields").hidden = barcode;
    $("#raw-field").hidden = !barcode && $("#payload-type").value !== "text";
    $("#barcode-format-field").hidden = !barcode;
    $("#barcode-options").hidden = !barcode;
    $("#qr-options").hidden = barcode;
  });

  $("#payload-type").addEventListener("change", renderPayloadFields);
  $("#generate-button").addEventListener("click", generate);

  $("#download-svg").addEventListener("click", () => {
    if (currentResult) app.export.svg(currentResult.svg, "code.svg");
  });

  $("#download-png").addEventListener("click", async () => {
    if (!currentResult) return;

    try {
      await downloadPNG(currentResult, "code.png");
      $("#generator-status").textContent = "PNG exported.";
    } catch (error) {
      $("#generator-status").textContent = error.message;
    }
  });

  $("#scan-file").addEventListener("change", event => {
    scanImage(event.target.files?.[0]);
    event.target.value = "";
  });

  $("#camera-start").addEventListener("click", startCamera);
  $("#camera-stop").addEventListener("click", stopCamera);
  $("#batch-generate").addEventListener("click", generateBatch);

  $("#clear-history").addEventListener("click", () => {
    if (!confirm("Clear all saved history?")) return;
    app.history.clear();
    renderHistory();
    updateStats();
  });

  $("#clear-settings").addEventListener("click", () => {
    if (!confirm("Reset local application settings?")) return;
    app.settings.clear();
    $("#generator-status").textContent = "Local settings reset.";
  });

  window.addEventListener("pagehide", stopCamera);

  renderPayloadFields();
  renderFormats();
  updateStats();
  navigate("dashboard");
}

init();
