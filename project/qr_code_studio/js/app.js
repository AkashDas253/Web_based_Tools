
import * as qr from "./tools/qr.js";
import * as barcode from "./tools/barcode.js";
import * as scanner from "./tools/scanner.js";
import * as payload from "./tools/payload.js";
import * as exporter from "./tools/export.js";
import * as storage from "./tools/storage.js";

/* ----------------------------------
   Shared application state
---------------------------------- */

const state = {
  currentView: "dashboard",
  currentResult: null,
  generated: 0,
  scanned: 0,
  history: storage.getHistory()
};

/* ----------------------------------
   History service
---------------------------------- */

class HistoryService {
  constructor(state) {
    this.state = state;
  }

  list() {
    return [...this.state.history];
  }

  add(entry) {
    const saved = storage.addHistory(entry);
    this.state.history = storage.getHistory();

    return saved;
  }

  clear() {
    storage.clearHistory();
    this.state.history = [];
  }
}

/* ----------------------------------
   Generator service
---------------------------------- */

class GeneratorService {
  constructor(state, history) {
    this.state = state;
    this.history = history;
  }

  getOptions(type) {
    if (type === "barcode") {
      return barcode.getOptions();
    }

    return qr.getOptions();
  }

  getQROptions() {
    return qr.getOptions();
  }

  getBarcodeOptions() {
    return barcode.getOptions();
  }

  generate(type, data, options = {}) {
    const result = type === "barcode"
      ? barcode.generate(data, options)
      : qr.generate(data, options);

    this.state.currentResult = result;
    this.state.generated++;

    this.history.add({
      action: "generated",
      type: result.type,
      format: result.format,
      value: result.value
    });

    return result;
  }

  generateQR(data, options = {}) {
    return this.generate("qr", data, options);
  }

  generateBarcode(data, options = {}) {
    return this.generate("barcode", data, options);
  }

  getCurrentResult() {
    return this.state.currentResult;
  }

  clearCurrentResult() {
    this.state.currentResult = null;
  }
}

/* ----------------------------------
   Scanner service
---------------------------------- */

class ScannerService {
  constructor(state, history) {
    this.state = state;
    this.history = history;
  }

  getCapabilities() {
    return scanner.getCapabilities();
  }

  // Scan an uploaded image or other supported source.
  async scan(source) {
    const results = await scanner.decode(source);
    return this.recordResults(results);
  }

  // Start live camera scanning.
  async startCamera(video, options = {}) {
    return scanner.startCamera(video, {
      ...options,
      onResult: results => {
        this.recordResults(results);
        options.onResult?.(results);
      }
    });
  }

  // Stop camera and release its resources.
  async stopCamera() {
    return scanner.stopCamera();
  }

  // Pause live scanning.
  async pauseCamera() {
    return scanner.pauseCamera();
  }

  // Resume live scanning.
  async resumeCamera() {
    return scanner.resumeCamera();
  }

  // Switch between available cameras.
  async switchCamera(video, deviceId) {
    return scanner.switchCamera(video, deviceId);
  }

  // Enable or disable camera flashlight.
  async setTorch(enabled) {
    return scanner.setTorch(enabled);
  }

  // Record scan results in application state and history.
  recordResults(results = []) {
    if (!Array.isArray(results) || !results.length) {
      return [];
    }

    this.state.scanned += results.length;

    for (const result of results) {
      this.history.add({
        action: "scanned",
        type: "scan",
        format: result.format,
        value: result.rawValue
      });
    }

    return results;
  }
}

/* ----------------------------------
   Batch generation service
---------------------------------- */

class BatchService {
  constructor(generator) {
    this.generator = generator;
  }

  generate(items) {
    if (!Array.isArray(items)) {
      throw new TypeError("Batch items must be an array.");
    }

    return items.map(item => {
      return this.generator.generate(
        item.type || "qr",
        item.data,
        item.options || {}
      );
    });
  }
}

/* ----------------------------------
   Payload service
---------------------------------- */

class PayloadService {
  getTypes() {
    return payload.getTypes();
  }

  build(type, data) {
    return payload.build(type, data);
  }
}

/* ----------------------------------
   Export service
---------------------------------- */

class ExportService {
  png(...args) {
    return exporter.downloadPNG(...args);
  }

  svg(...args) {
    return exporter.downloadSVG(...args);
  }
  zip(...args) {
    return exporter.downloadZIP(...args);
  }
}

/* ----------------------------------
   Settings service
---------------------------------- */

class SettingsService {
  get() {
    return storage.getSettings();
  }

  save(settings) {
    return storage.saveSettings(settings);
  }

  clear() {
    return storage.clearSettings();
  }
}

/* ----------------------------------
   Formats service
---------------------------------- */

class FormatsService {
  list() {
    return [
      ...qr.getOptions().formats,
      ...barcode.getOptions().formats
    ];
  }

  getQROptions() {
    return qr.getOptions();
  }

  getBarcodeOptions() {
    return barcode.getOptions();
  }
}

/* ----------------------------------
   Application instance
---------------------------------- */

const history = new HistoryService(state);
const generator = new GeneratorService(state, history);

export const app = {
  state,

  generator,
  scanner: new ScannerService(state, history),
  batch: new BatchService(generator),
  history,
  payload: new PayloadService(),
  export: new ExportService(),
  settings: new SettingsService(),
  formats: new FormatsService(),

  setView(view) {
    state.currentView = view;
  }
};
