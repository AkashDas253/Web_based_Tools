
const levels = {
  L: "L",
  M: "M",
  Q: "Q",
  H: "H"
};

export function getOptions() {
  return {
    formats: ["Standard QR"],
    errorCorrection: Object.keys(levels),
    sizes: [256, 384, 512, 768]
  };
}

export function generate(data, options = {}) {
  if (typeof qrcode !== "function") {
    throw new Error("QR library is unavailable. Check vendor/qr/qrcode.js.");
  }

  const value = String(data ?? "").trim();
  if (!value) throw new Error("Enter content to generate a QR code.");

  const level = levels[options.errorCorrection] || "M";
  const size = Math.max(128, Math.min(2048, Number(options.size) || 384));
  const margin = Math.max(0, Math.min(20, Number(options.margin ?? 4)));
  const foreground = options.foreground || "#111827";
  const background = options.background || "#ffffff";

  const code = qrcode(0, level);
  code.addData(value);
  code.make();

  let svg = code.createSvgTag(Math.max(1, Math.floor(size / (code.getModuleCount() + margin * 2))), margin);

  svg = svg.replace(/fill="#fff(?:fff)?"/gi, `fill="${background}"`);
  svg = svg.replace(/fill="#000(?:000)?"/gi, `fill="${foreground}"`);
  svg = svg.replace(/width="[^"]+"/, `width="${size}"`);
  svg = svg.replace(/height="[^"]+"/, `height="${size}"`);

  return {
    type: "qr",
    format: "QR Code",
    value,
    svg,
    size,
    mime: "image/svg+xml"
  };
}
