
export function downloadSVG(svg, filename = "code.svg") {
  const blob = new Blob([svg], {
    type: "image/svg+xml;charset=utf-8"
  });

  download(blob, filename);
}

export async function downloadPNG(svg, filename = "code.png", size = 1024) {
  const blob = await svgToPNG(svg, size);
  download(blob, filename);
}

export async function downloadZIP(
  items,
  filename = "codes.zip",
  format = "svg",
  size = 1024
) {
  if (!Array.isArray(items) || !items.length) {
    throw new Error("No generated codes to export.");
  }

  if (!["svg", "png"].includes(format)) {
    throw new Error("Unsupported ZIP image format.");
  }

  const files = [];

  for (let index = 0; index < items.length; index++) {
    const item = items[index];

    if (typeof item.svg !== "string") {
      throw new Error(`Invalid SVG for code ${index + 1}.`);
    }

    const extension = format;
    const name = `${item.type || "code"}-${String(index + 1).padStart(3, "0")}.${extension}`;

    const blob = format === "png"
      ? await svgToPNG(item.svg, size)
      : new Blob([item.svg], {
          type: "image/svg+xml;charset=utf-8"
        });

    files.push({
      name,
      data: new Uint8Array(await blob.arrayBuffer())
    });
  }

  const zipBlob = createZIP(files);

  download(zipBlob, filename);
}

async function svgToPNG(svg, size = 1024) {
  const blob = new Blob([svg], {
    type: "image/svg+xml;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);

  try {
    const image = new Image();
    image.src = url;

    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is unavailable.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size, size);

    const ratio = Math.min(
      size / image.width,
      size / image.height
    );

    const width = image.width * ratio;
    const height = image.height * ratio;

    context.drawImage(
      image,
      (size - width) / 2,
      (size - height) / 2,
      width,
      height
    );

    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        result => {
          if (result) resolve(result);
          else reject(new Error("PNG export failed."));
        },
        "image/png"
      );
    });

  } finally {
    URL.revokeObjectURL(url);
  }
}

/* ZIP creation using the standard ZIP store format */

const encoder = new TextEncoder();

const crcTable = (() => {
  const table = new Uint32Array(256);

  for (let n = 0; n < 256; n++) {
    let c = n;

    for (let k = 0; k < 8; k++) {
      c = (c & 1)
        ? 0xEDB88320 ^ (c >>> 1)
        : c >>> 1;
    }

    table[n] = c >>> 0;
  }

  return table;
})();

function crc32(bytes) {
  let crc = 0xFFFFFFFF;

  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  }

  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createZIP(files) {
  const localParts = [];
  const centralParts = [];

  let offset = 0;

  const now = new Date();

  const dosTime =
    (now.getHours() << 11) |
    (now.getMinutes() << 5) |
    Math.floor(now.getSeconds() / 2);

  const dosDate =
    ((now.getFullYear() - 1980) << 9) |
    ((now.getMonth() + 1) << 5) |
    now.getDate();

  function makeHeader(length) {
    return new Uint8Array(length);
  }

  function write16(view, position, value) {
    view.setUint16(position, value, true);
  }

  function write32(view, position, value) {
    view.setUint32(position, value, true);
  }

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const data = file.data;
    const checksum = crc32(data);

    const localHeader = makeHeader(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);

    write32(localView, 0, 0x04034B50);
    write16(localView, 4, 20);
    write16(localView, 6, 0x0800);
    write16(localView, 8, 0);
    write16(localView, 10, dosTime);
    write16(localView, 12, dosDate);
    write32(localView, 14, checksum);
    write32(localView, 18, data.length);
    write32(localView, 22, data.length);
    write16(localView, 26, nameBytes.length);
    write16(localView, 28, 0);

    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, data);

    const centralHeader = makeHeader(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);

    write32(centralView, 0, 0x02014B50);
    write16(centralView, 4, 20);
    write16(centralView, 6, 20);
    write16(centralView, 8, 0x0800);
    write16(centralView, 10, 0);
    write16(centralView, 12, dosTime);
    write16(centralView, 14, dosDate);
    write32(centralView, 16, checksum);
    write32(centralView, 20, data.length);
    write32(centralView, 24, data.length);
    write16(centralView, 28, nameBytes.length);
    write16(centralView, 30, 0);
    write16(centralView, 32, 0);
    write16(centralView, 34, 0);
    write16(centralView, 36, 0);
    write32(centralView, 38, 0);
    write32(centralView, 42, offset);

    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);

    offset += localHeader.length + data.length;
  }

  const centralSize = centralParts.reduce(
    (total, part) => total + part.length,
    0
  );

  const end = makeHeader(22);
  const endView = new DataView(end.buffer);

  write32(endView, 0, 0x06054B50);
  write16(endView, 4, 0);
  write16(endView, 6, 0);
  write16(endView, 8, files.length);
  write16(endView, 10, files.length);
  write32(endView, 12, centralSize);
  write32(endView, 16, offset);
  write16(endView, 20, 0);

  return new Blob(
    [...localParts, ...centralParts, end],
    { type: "application/zip" }
  );
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
