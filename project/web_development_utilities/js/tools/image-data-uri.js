export const MAX_BYTES = 2 * 1024 * 1024;

export function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(2)} MB`;
}

export function report(originalBytes, uri) {
  const ratio = originalBytes ? Math.round((uri.length / originalBytes) * 100) : 0;
  return `Original: ${formatBytes(originalBytes)}\nData URI: ${formatBytes(uri.length)} (${uri.length} characters)\nSize ratio: ${ratio}%`;
}

export const cssUrl = (uri) => `background-image: url("${uri}");`;
export const imgTag = (uri) => `<img src="${uri}" alt="">`;

export function readAsDataUri(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("The selected file is not an image."));
    if (file.size > MAX_BYTES) return reject(new Error(`The file exceeds the ${formatBytes(MAX_BYTES)} limit.`));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The file could not be read."));
    reader.readAsDataURL(file);
  });
}

export async function reencode(uri, type, quality) {
  const img = new Image();
  img.src = uri;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  const out = canvas.toDataURL(type, quality);
  if (!out.startsWith("data:" + type)) throw new Error(`This browser cannot encode ${type}.`);
  return out;
}
