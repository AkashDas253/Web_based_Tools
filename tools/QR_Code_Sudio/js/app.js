
import * as qr from "./tools/qr.js";
import * as barcode from "./tools/barcode.js";
import * as scanner from "./tools/scanner.js";
import * as payload from "./tools/payload.js";
import * as exporter from "./tools/export.js";
import * as storage from "./tools/storage.js";

export const app = {
  state: {
    currentView: "dashboard",
    currentResult: null,
    generated: 0,
    scanned: 0,
    history: storage.getHistory()
  },

  qr: {
    getOptions: qr.getOptions,
    generate: qr.generate
  },

  barcode: {
    getOptions: barcode.getOptions,
    generate: barcode.generate
  },

  scanner: {
    decode: scanner.decode,
    getCapabilities: scanner.getCapabilities
  },

  payload: {
    getTypes: payload.getTypes,
    build: payload.build
  },

  export: {
    png: exporter.downloadPNG,
    svg: exporter.downloadSVG
  },

  history: {
    list() {
      return [...app.state.history];
    },

    add(entry) {
      const saved = storage.addHistory(entry);
      app.state.history = storage.getHistory();
      return saved;
    },

    clear() {
      storage.clearHistory();
      app.state.history = [];
    }
  },

  settings: {
    get: storage.getSettings,
    save: storage.saveSettings,
    clear: storage.clearSettings
  },

  setView(view) {
    app.state.currentView = view;
  },

  generate(type, data, options) {
    const result = type === "barcode"
      ? barcode.generate(data, options)
      : qr.generate(data, options);

    app.state.currentResult = result;
    app.state.generated++;

    app.history.add({
      action: "generated",
      type: result.type,
      format: result.format,
      value: result.value
    });

    return result;
  },

  async scan(source) {
    const results = await scanner.decode(source);

    if (results.length) {
      app.state.scanned += results.length;

      for (const result of results) {
        app.history.add({
          action: "scanned",
          type: "scan",
          format: result.format,
          value: result.rawValue
        });
      }
    }

    return results;
  },

  getFormats() {
    return [
      ...qr.getOptions().formats,
      ...barcode.getOptions().formats
    ];
  }
};
