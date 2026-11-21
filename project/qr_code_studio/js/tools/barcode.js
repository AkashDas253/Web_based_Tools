
const formats = [
  "CODE128", "CODE39", "EAN13", "EAN8",
  "UPC", "ITF", "ITF14", "MSI", "pharmacode", "codabar"
];

export function getOptions() {
  return {
    formats,
    defaults: {
      lineColor: "#111827",
      background: "#ffffff",
      displayValue: true,
      height: 90,
      width: 2
    }
  };
}

export function generate(data, options = {}) {
  if (typeof JsBarcode !== "function") {
    throw new Error("JsBarcode is unavailable. Check vendor/barcode/.");
  }

  const value = String(data ?? "").trim();
  if (!value) throw new Error("Enter barcode content.");

  const format = formats.includes(options.format) ? options.format : "CODE128";
  const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  JsBarcode(svgElement, value, {
    format,
    lineColor: options.foreground || "#111827",
    background: options.background || "#ffffff",
    displayValue: options.displayValue !== false,
    height: Math.max(30, Number(options.height) || 90),
    width: Math.max(1, Math.min(5, Number(options.width) || 2)),
    margin: 10,
    fontSize: 16
  });

  return {
    type: "barcode",
    format,
    value,
    svg: new XMLSerializer().serializeToString(svgElement),
    mime: "image/svg+xml"
  };
}
