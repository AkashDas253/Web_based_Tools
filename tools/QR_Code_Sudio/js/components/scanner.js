
const styles = `
  .scanner-file {
    display: block;
    width: 100%;
    margin-top: 10px;
    padding: 12px;
    border: 1px dashed #c9cbd8;
    border-radius: 9px;
    background: #fafbfe;
  }

  .scanner-modes,
  .scanner-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .scanner-mode.active {
    background: var(--primary, #4f46e5);
    color: white;
  }

  .scanner-camera {
    position: relative;
    overflow: hidden;
    width: 100%;
    aspect-ratio: 4 / 3;
    background: #111827;
    border-radius: 12px;
    margin-bottom: 14px;
  }

  .scanner-camera video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .scanner-frame {
    position: absolute;
    inset: 20%;
    border: 2px solid #ffffff;
    border-radius: 14px;
    box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.25);
    pointer-events: none;
  }

  .scanner-camera-message {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 20px;
    color: white;
    text-align: center;
    pointer-events: none;
  }

  .scanner-camera-select {
    width: 100%;
    margin-bottom: 12px;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface, white);
    color: inherit;
  }

  .scanner-results {
    margin-top: 18px;
    overflow-wrap: anywhere;
  }

  .scanner-result {
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
  }

  .scanner-result strong {
    display: block;
    margin-bottom: 6px;
  }

  .scanner-result-value {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .scanner-result-actions {
    margin-top: 8px;
  }

  .scanner-hidden {
    display: none !important;
  }
`;

function addStyles() {
  if (document.getElementById("scanner-styles")) return;

  const style = document.createElement("style");
  style.id = "scanner-styles";
  style.textContent = styles;
  document.head.appendChild(style);
}

export const title = "Scanner";
export const description = "Scan QR codes and barcodes using your camera or an image.";

export function mount(container, { app, notify }) {
  addStyles();

  container.innerHTML = `
    <section class="tool-panel">

      <div class="scanner-modes">
        <button type="button" class="scanner-mode active" data-mode="camera">
          Camera
        </button>
        <button type="button" class="scanner-mode" data-mode="upload">
          Upload image
        </button>
      </div>

      <div id="scanner-camera-panel">

        <div class="scanner-camera">
          <video
            id="scanner-video"
            autoplay
            muted
            playsinline
          ></video>

          <div class="scanner-frame"></div>

          <div class="scanner-camera-message" id="scanner-camera-message">
            Start your camera to scan a code.
          </div>
        </div>

        <select
          id="scanner-camera-select"
          class="scanner-camera-select"
          aria-label="Select camera"
        >
          <option value="">Default camera</option>
        </select>

        <div class="scanner-controls">
          <button type="button" id="scanner-start">Start camera</button>
          <button type="button" id="scanner-pause" disabled>Pause</button>
          <button type="button" id="scanner-stop" disabled>Stop</button>
          <button type="button" id="scanner-switch" disabled>Switch camera</button>
          <button type="button" id="scanner-torch" disabled>Flashlight</button>
        </div>

      </div>

      <div id="scanner-upload-panel" class="scanner-hidden">
        <div class="field">
          <label for="scanner-file">Choose an image</label>
          <input
            class="scanner-file"
            type="file"
            id="scanner-file"
            accept="image/*"
          >
        </div>
      </div>

      <div
        id="scanner-results"
        class="scanner-results"
        aria-live="polite"
        aria-atomic="false"
      >
        <p class="empty-state">Scan a code or upload an image.</p>
      </div>

    </section>
  `;

  const $ = selector => container.querySelector(selector);

  const video = $("#scanner-video");
  const cameraPanel = $("#scanner-camera-panel");
  const uploadPanel = $("#scanner-upload-panel");
  const cameraMessage = $("#scanner-camera-message");
  const cameraSelect = $("#scanner-camera-select");
  const fileInput = $("#scanner-file");
  const resultsPanel = $("#scanner-results");

  const startButton = $("#scanner-start");
  const pauseButton = $("#scanner-pause");
  const stopButton = $("#scanner-stop");
  const switchButton = $("#scanner-switch");
  const torchButton = $("#scanner-torch");

  let cameraActive = false;
  let cameraPaused = false;
  let torchEnabled = false;
  let currentMode = "camera";
  let cameras = [];

  function showMessage(message) {
    cameraMessage.textContent = message;
    cameraMessage.classList.remove("scanner-hidden");
  }

  function hideMessage() {
    cameraMessage.classList.add("scanner-hidden");
  }

  function updateControls() {
    startButton.disabled = cameraActive;
    pauseButton.disabled = !cameraActive;
    stopButton.disabled = !cameraActive;
    switchButton.disabled = !cameraActive || cameras.length < 2;
    torchButton.disabled = !cameraActive || cameraPaused;
    pauseButton.textContent = cameraPaused ? "Resume" : "Pause";
  }

  function showResults(results) {
    if (!results.length) return;

    resultsPanel.replaceChildren();

    results.forEach(result => {
      const item = document.createElement("div");
      item.className = "scanner-result";

      const heading = document.createElement("strong");
      heading.textContent = result.format || "Detected code";

      const value = document.createElement("div");
      value.className = "scanner-result-value";
      value.textContent = result.rawValue || "";

      const actions = document.createElement("div");
      actions.className = "scanner-result-actions";

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.textContent = "Copy";

      copyButton.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(result.rawValue || "");
          notify("Copied to clipboard.", "success");
        } catch {
          notify("Unable to copy content.", "error");
        }
      });

      actions.appendChild(copyButton);
      item.append(heading, value, actions);
      resultsPanel.appendChild(item);
    });
  }

  function showNoResults() {
    resultsPanel.textContent = "No supported code was found.";
  }

  async function loadCameras() {
    if (!navigator.mediaDevices?.enumerateDevices) return;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      cameras = devices.filter(device => device.kind === "videoinput");

      const selected = cameraSelect.value;

      cameraSelect.replaceChildren();

      cameras.forEach((camera, index) => {
        const option = document.createElement("option");
        option.value = camera.deviceId;
        option.textContent = camera.label || `Camera ${index + 1}`;
        cameraSelect.appendChild(option);
      });

      if (selected && cameras.some(camera => camera.deviceId === selected)) {
        cameraSelect.value = selected;
      }

      updateControls();
    } catch (error) {
      console.warn("Unable to enumerate cameras:", error);
    }
  }

  async function startCamera(deviceId) {
    if (!navigator.mediaDevices?.getUserMedia) {
      showMessage("Camera access is not supported by this browser.");
      notify("Camera API is unavailable. Use image upload instead.", "error");
      return;
    }

    try {
      showMessage("Starting camera…");

      const options = deviceId
        ? { deviceId }
        : { facingMode: "environment" };

      await app.scanner.startCamera(video, {
        ...options,
        onResult: results => {
          if (!results?.length) return;

          showResults(results);
          notify("Code detected.", "success");
        }
      });

      cameraActive = true;
      cameraPaused = false;
      torchEnabled = false;

      hideMessage();
      await loadCameras();

      updateControls();
      notify("Camera started.", "success");
    } catch (error) {
      console.error(error);

      cameraActive = false;
      updateControls();

      showMessage(
        error.name === "NotAllowedError"
          ? "Camera permission was denied."
          : "Unable to start camera. Check camera availability and permissions."
      );

      notify(error.message || "Unable to start camera.", "error");
    }
  }

  async function stopCamera() {
    if (!cameraActive) return;

    try {
      await app.scanner.stopCamera();
    } catch (error) {
      console.error(error);
    }

    cameraActive = false;
    cameraPaused = false;
    torchEnabled = false;

    video.srcObject = null;

    showMessage("Camera stopped.");
    updateControls();
  }

  async function togglePause() {
    if (!cameraActive) return;

    try {
      if (cameraPaused) {
        await app.scanner.resumeCamera();
        cameraPaused = false;
        hideMessage();
      } else {
        await app.scanner.pauseCamera();
        cameraPaused = true;
        showMessage("Scanning paused.");
      }

      updateControls();
    } catch (error) {
      notify(error.message || "Unable to change scanning state.", "error");
    }
  }

  async function switchCamera() {
    if (!cameraActive || cameras.length < 2) return;

    const currentIndex = cameras.findIndex(
      camera => camera.deviceId === cameraSelect.value
    );

    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];

    try {
      await app.scanner.switchCamera(video, nextCamera.deviceId);

      cameraSelect.value = nextCamera.deviceId;
      cameraPaused = false;
      torchEnabled = false;

      updateControls();
      notify("Camera switched.", "success");
    } catch (error) {
      notify(error.message || "Unable to switch camera.", "error");
    }
  }

  async function toggleTorch() {
    try {
      torchEnabled = !torchEnabled;
      await app.scanner.setTorch(torchEnabled);

      torchButton.textContent = torchEnabled
        ? "Turn flashlight off"
        : "Flashlight";
    } catch (error) {
      torchEnabled = false;
      torchButton.textContent = "Flashlight";

      notify(error.message || "Flashlight is not supported.", "error");
    }
  }

  async function handleUpload() {
    const file = fileInput.files?.[0];
    if (!file) return;

    resultsPanel.textContent = "Scanning image…";

    try {
      const results = await app.scanner.scan(file);

      if (!results.length) {
        showNoResults();
        return;
      }

      showResults(results);
      notify("Scanning completed.", "success");
    } catch (error) {
      console.error(error);

      resultsPanel.textContent = "Unable to scan this image.";
      notify(error.message || "Scanning failed.", "error");
    }
  }

  function setMode(mode) {
    currentMode = mode;

    container.querySelectorAll("[data-mode]").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.mode === mode
      );
    });

    cameraPanel.classList.toggle("scanner-hidden", mode !== "camera");
    uploadPanel.classList.toggle("scanner-hidden", mode !== "upload");

    if (mode !== "camera") {
      stopCamera();
    }
  }

  container.querySelectorAll("[data-mode]").forEach(button => {
    button.addEventListener("click", () => {
      setMode(button.dataset.mode);
    });
  });

  startButton.addEventListener("click", () => {
    startCamera(cameraSelect.value || undefined);
  });

  pauseButton.addEventListener("click", togglePause);
  stopButton.addEventListener("click", stopCamera);
  switchButton.addEventListener("click", switchCamera);
  torchButton.addEventListener("click", toggleTorch);

  cameraSelect.addEventListener("change", () => {
    if (cameraActive && cameraSelect.value) {
      startCamera(cameraSelect.value);
    }
  });

  fileInput.addEventListener("change", handleUpload);

  loadCameras();

  // Release camera resources when the component is removed.
  return () => {
    stopCamera();
  };
}
