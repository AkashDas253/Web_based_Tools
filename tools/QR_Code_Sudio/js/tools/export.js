
export function downloadSVG(svg, filename = "code.svg") {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  download(blob, filename);
}

export async function downloadPNG(svg, filename = "code.png", size = 1024) {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = new Image();
    image.src = url;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable.");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size, size);

    const ratio = Math.min(size / image.width, size / image.height);
    const width = image.width * ratio;
    const height = image.height * ratio;

    context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);

    const png = await new Promise((resolve, reject) => {
      canvas.toBlob(result => result ? resolve(result) : reject(new Error("PNG export failed.")), "image/png");
    });

    download(png, filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
