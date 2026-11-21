
let detectorPromise;
let cameraSession = null;

const supportedFormats = [
  "qr_code",
  "code_128",
  "code_39",
  "ean_13",
  "ean_8",
  "upc_a",
  "itf"
];

async function getDetector() {
  if (!("BarcodeDetector" in globalThis)) return null;

  if (!detectorPromise) {
    detectorPromise = (async () => {
      try {
        const supported = await BarcodeDetector.getSupportedFormats();

        const formats = supportedFormats.filter(format =>
          supported.includes(format)
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
  if (source instanceof Blob && isSVGFile(source)) {
    return loadWithImageElement(source);
  }

  if (
    source instanceof Blob &&
    typeof createImageBitmap === "function"
  ) {
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

  if (source instanceof Blob) {
    return loadWithImageElement(source);
  }

  return {
    source,
    cleanup() {}
  };
}

async function detectSource(source) {
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
      // Continue with QR fallback.
    }
  }

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
}

export async function decode(input) {
  const prepared = await prepareSource(input);

  try {
    return await detectSource(prepared.source);
  } finally {
    prepared.cleanup();
  }
}

/* ----------------------------------
   Camera scanning
---------------------------------- */

function stopDetectionLoop(session) {
  if (session.animationFrame) {
    cancelAnimationFrame(session.animationFrame);
    session.animationFrame = null;
  }
}

export async function startCamera(video, options = {}) {
  if (!video) {
    throw new Error("A video element is required.");
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(
      "Camera access requires HTTPS or localhost and browser support."
    );
  }

  await stopCamera();

  const constraints = {
    audio: false,
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      ...(options.deviceId
        ? { deviceId: { exact: options.deviceId } }
        : { facingMode: options.facingMode || "environment" })
    }
  };

  const stream = await navigator.mediaDevices.getUserMedia(
    constraints
  );

  const session = {
    video,
    stream,
    onResult: options.onResult,
    paused: false,
    stopped: false,
    animationFrame: null,
    detecting: false,
    lastValue: "",
    lastDetectedAt: 0,
    lastErrorAt: 0,
    canvas: document.createElement("canvas")
  };

  cameraSession = session;
  video.srcObject = stream;

  try {
    await video.play();
  } catch (error) {
    await stopCamera();
    throw error;
  }

  const context = session.canvas.getContext("2d", {
    willReadFrequently: true
  });

  if (!context) {
    await stopCamera();
    throw new Error("Unable to initialize camera scanner.");
  }

  session.context = context;

  startDetectionLoop(session);

  return stream;
}

function startDetectionLoop(session) {
  let lastScanTime = 0;

  async function scanFrame(timestamp) {
    if (
      session.stopped ||
      session.paused ||
      cameraSession !== session
    ) {
      return;
    }

    session.animationFrame = requestAnimationFrame(scanFrame);

    // Limit detection frequency.
    if (
      timestamp - lastScanTime < 150 ||
      session.detecting
    ) {
      return;
    }

    const video = session.video;

    if (
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      return;
    }

    lastScanTime = timestamp;
    session.detecting = true;

    try {
      const results = await detectVideoFrame(session);

      if (
        results.length &&
        !session.stopped &&
        !session.paused &&
        cameraSession === session
      ) {
        const result = results[0];
        const now = Date.now();

        // Avoid repeatedly reporting the same code.
        if (
          result.rawValue !== session.lastValue ||
          now - session.lastDetectedAt > 1500
        ) {
          session.lastValue = result.rawValue;
          session.lastDetectedAt = now;

          session.onResult?.(results);
        }
      }
    } catch (error) {
      // Avoid flooding the console with repeated frame errors.
      if (Date.now() - session.lastErrorAt > 3000) {
        console.warn("Camera detection error:", error);
        session.lastErrorAt = Date.now();
      }
    } finally {
      session.detecting = false;
    }
  }

  session.animationFrame = requestAnimationFrame(scanFrame);
}

async function detectVideoFrame(session) {
  const video = session.video;
  const canvas = session.canvas;

  const width = video.videoWidth;
  const height = video.videoHeight;

  canvas.width = width;
  canvas.height = height;

  session.context.drawImage(video, 0, 0, width, height);

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
      // Use QR fallback.
    }
  }

  if (typeof jsQR !== "function") {
    return [];
  }

  const imageData = session.context.getImageData(
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
}

export async function pauseCamera() {
  const session = cameraSession;

  if (!session || session.stopped) return;

  session.paused = true;
  stopDetectionLoop(session);
}

export async function resumeCamera() {
  const session = cameraSession;

  if (!session || session.stopped) {
    throw new Error("Camera is not running.");
  }

  if (!session.paused) return;

  session.paused = false;
  await session.video.play();

  startDetectionLoop(session);
}

export async function stopCamera() {
  const session = cameraSession;

  if (!session) return;

  session.stopped = true;
  stopDetectionLoop(session);

  session.stream.getTracks().forEach(track => {
    track.stop();
  });

  session.video.srcObject = null;

  cameraSession = null;
}

export async function switchCamera(video, deviceId) {
  if (!deviceId) {
    throw new Error("Select a camera first.");
  }

  if (!cameraSession) {
    throw new Error("Camera is not running.");
  }

  return startCamera(video, { deviceId });
}

export async function setTorch(enabled) {
  const session = cameraSession;

  if (!session) {
    throw new Error("Camera is not running.");
  }

  const track = session.stream.getVideoTracks()[0];

  if (!track) {
    throw new Error("No active camera track.");
  }

  const capabilities = track.getCapabilities?.();

  if (!capabilities?.torch) {
    throw new Error("Flashlight is not supported by this camera.");
  }

  await track.applyConstraints({
    advanced: [{ torch: Boolean(enabled) }]
  });
}

/* ----------------------------------
   Capabilities
---------------------------------- */

export function getCapabilities() {
  return {
    nativeDetection: "BarcodeDetector" in globalThis,
    fallback: typeof jsQR === "function",
    fallbackFormats: ["QR Code"],
    camera: Boolean(navigator.mediaDevices?.getUserMedia),
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
