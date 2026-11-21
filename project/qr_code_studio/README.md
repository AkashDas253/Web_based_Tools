# QR Code Studio

A lightweight, browser-based QR code and barcode toolkit built with HTML, CSS, and JavaScript.

## Pages & Features

### 1. Dashboard
- Overview of available tools
- Quick access to Generator, Scanner and Batch tools
- Generation and scan activity statistics

### 2. Generator
- Generate standard QR codes
- Generate 1D barcodes
- QR payload types:
  - Plain text
  - Website URL
  - Wi-Fi
  - Email
  - SMS
  - Contact (vCard)
- QR customization:
  - Output size
  - Error correction level
  - Margin
  - Foreground and background colors
- Barcode customization:
  - Barcode format
  - Height and bar width
  - Display value
  - Foreground and background colors
- Export generated codes as PNG or SVG

### 3. Scanner
- Scan QR codes and supported barcodes from images
- Live camera scanning
- Front and rear camera selection
- Pause, resume and stop camera
- Flashlight control where supported
- Display decoded content
- Copy scan results

### 4. Batch Generator
- Generate multiple QR codes and barcodes
- Process multiple entries together
- Select individual results
- Download selected codes
- Export results as a ZIP file

### 5. History
- View previously generated codes
- View previous scan results
- Keep activity history locally
- Clear history

### 6. Settings
- Manage application preferences
- Store settings locally in the browser

## Technologies

- HTML5
- CSS3
- JavaScript ES Modules
- Browser APIs
- QRCode Generator
- JsBarcode
- jsQR

## Architecture

The application uses a modular, browser-first architecture.

```text
QR Code Studio/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── ui.js
│   │
│   ├── components/
│   │   ├── dashboard.js
│   │   ├── generator.js
│   │   ├── scanner.js
│   │   ├── batch.js
│   │   ├── history.js
│   │   └── settings.js
│   │
│   └── tools/
│       ├── qr.js
│       ├── barcode.js
│       ├── scanner.js
│       ├── payload.js
│       ├── export.js
│       └── storage.js
│
└── vendor/
    ├── qr/
    ├── barcode/
    └── scanner/
```

### Module Responsibilities

| Module | Responsibility |
|---|---|
| `index.html` | Application entry point |
| `style.css` | Global styles and layout |
| `app.js` | Application state and service coordination |
| `ui.js` | Navigation and page rendering |
| `components/` | Individual application pages and UI |
| `tools/` | QR, barcode, scanning, payload, export and storage logic |
| `vendor/` | Locally stored third-party libraries |

### How the Architecture Works

```text
User Interaction
      │
      ▼
 UI Components
      │
      ▼
    app.js
      │
      ├── Generator Service
      ├── Scanner Service
      ├── Batch Service
      ├── Payload Service
      ├── Export Service
      ├── History Service
      └── Settings Service
              │
              ▼
         tools/*.js
              │
              ▼
       Browser APIs
       Local Libraries
       Local Storage
```

**Architecture principles:**
- UI components communicate through the `app` interface.
- Components do not directly import tool modules.
- Tool modules handle specialized operations independently.
- Application state and service coordination stay in `app.js`.
- Third-party libraries are stored locally in `vendor/`.
- Keep modules small, reusable and easy to maintain.

## Running

Start a local server from the project root:

```bash
python -m http.server 8000
```

Open:

```text
http://localhost:8000
```

Do not open `index.html` directly using `file://`.

## Dependencies

Third-party libraries are stored locally in `vendor/`.

The application does not require a CDN or backend at runtime.

## Scanner Compatibility

The scanner supports:

- Image-based QR code and barcode scanning
- Live camera scanning where supported
- `BarcodeDetector` for native browser QR and barcode detection
- `jsQR` as a JavaScript fallback for QR codes

Camera access requires HTTPS or localhost and user permission.

Image scanning does not require camera permission.

## Storage

History and settings are stored in browser `localStorage`.

Clearing browser site data will remove this information.

## Limitations

- The JavaScript fallback supports QR codes only.
- Additional barcode scanning depends on browser `BarcodeDetector` support.
- Flashlight availability depends on camera hardware and browser support.
- Camera access depends on browser permissions and security requirements.
- The initial QR generator supports standard QR codes.
- Batch generation is limited to 50 entries.
- Advanced QR and 2D barcode formats are future extensions.

## Future Extensions

- Additional QR customization options
- More barcode formats
- Additional 2D barcode support
- Improved batch processing
- Import and export of saved data
- More scanner fallback options
