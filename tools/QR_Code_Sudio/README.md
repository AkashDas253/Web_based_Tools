
# QR Code Studio

A lightweight browser-based QR code and barcode toolkit.

## Features

- Standard QR code generation
- 1D barcode generation
- Text, URL, Wi-Fi, email, SMS and vCard payloads
- QR customization and barcode options
- PNG and SVG export
- QR image scanning
- Camera scanning where supported
- Batch QR generation
- Local generation and scan history
- Responsive interface

## Technologies

- HTML
- CSS
- JavaScript ES Modules
- Browser APIs
- QRCode Generator
- JsBarcode
- jsQR

## Running

Start a local server from the project root:

    python -m http.server 8000

Open:

    http://localhost:8000

Do not open index.html directly using file://.

## Dependencies

Third-party libraries are stored locally in vendor/.

The application does not require a CDN or backend at runtime.

## Scanner compatibility

The scanner uses BarcodeDetector when available and jsQR
as a QR-only JavaScript fallback.

Native camera access requires HTTPS or localhost.

Image scanning does not require camera permission.

## Storage

History and settings are stored in browser localStorage.

Clearing browser site data will remove this information.

## Limitations

- The fallback scanner supports QR codes only.
- Additional barcode scanning depends on browser BarcodeDetector support.
- The initial QR generator supports standard QR codes.
- Batch generation is limited to 50 entries.
- Advanced QR and 2D barcode formats are future extensions.
