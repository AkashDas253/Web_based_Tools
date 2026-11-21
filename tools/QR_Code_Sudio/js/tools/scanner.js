
let detectorPromise;

async function getDetector() {
  if (!("BarcodeDetector" in globalThis)) return null;

  if (!detectorPromise) {
    detectorPromise = (async () => {
      try {
        const supported = await BarcodeDetector.getSupportedFormats();

        const formats = supported.filter(format =>
          [
            "qr_code",
            "code_128",
            "code_39",
            "ean_13",
            "ean_8",
            "upc_a",
            "itf"
          ].includes(format)
        );

        return formats.length
          ? new BarcodeDetector({ formats })
          : null;
      } catch {
        return null;
      }
    })();
  }

  return detectorPromise;
}

function isSVGFile(file) {
  return (
    file.type?.toLowerCase().includes("svg") ||
    /\.svg$/i.test(file.name || "")
  );
}

async function loadWithImageElement(blob) {
  const url = URL.createObjectURL(blob);

  try {
    const image = new Image();

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(
        new Error("Unable to load the image.")
      );

      image.src = url;
    });

    return {
      source: image,
      cleanup() {}
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function prepareSource(source) {
  // SVG should use the browser's image renderer.
  if (source instanceof Blob && isSVGFile(source)) {
    return loadWithImageElement(source);
  }

  // Use ImageBitmap for ordinary image files where available.
  if (source instanceof Blob && typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(source);

      return {
        source: bitmap,
        cleanup: () => bitmap.close()
      };
    } catch {
      // Fall back to HTMLImageElement.
    }
  }

  // Fallback for browsers without ImageBitmap support.
  if (source instanceof Blob) {
    return loadWithImageElement(source);
  }

  return {
    source,
    cleanup() {}
  };
}

export async function decode(input) {
  const prepared = await prepareSource(input);

  try {
    const source = prepared.source;

    const width =
      source.videoWidth ||
      source.naturalWidth ||
      source.width;

    const height =
      source.videoHeight ||
      source.naturalHeight ||
      source.height;

    if (!width || !height) {
      throw new Error("Image has no readable dimensions.");
    }

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", {
      willReadFrequently: true
    });

    if (!context) {
      throw new Error("Unable to create image processing canvas.");
    }

    context.drawImage(source, 0, 0, width, height);

    // Try native browser barcode detection first.
    const detector = await getDetector();

    if (detector) {
      try {
        const results = await detector.detect(canvas);

        if (results.length) {
          return results.map(item => ({
            format: item.format,
            rawValue: item.rawValue
          }));
        }
      } catch {
        // Continue with the QR fallback.
      }
    }

    // JavaScript fallback supports QR codes.
    if (typeof jsQR !== "function") {
      throw new Error("No supported decoder is available.");
    }

    const imageData = context.getImageData(
      0,
      0,
      width,
      height
    );

    const result = jsQR(
      imageData.data,
      width,
      height,
      {
        inversionAttempts: "attemptBoth"
      }
    );

    return result
      ? [{
          format: "qr_code",
          rawValue: result.data
        }]
      : [];

  } finally {
    prepared.cleanup();
  }
}

export function getCapabilities() {
  return {
    nativeDetection: "BarcodeDetector" in globalThis,
    fallback: typeof jsQR === "function",
    fallbackFormats: ["QR Code"],
    imageFormats: [
      "PNG",
      "JPG",
      "JPEG",
      "WEBP",
      "GIF",
      "BMP",
      "SVG"
    ]
  };
}
