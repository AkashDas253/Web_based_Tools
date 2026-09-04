# Password Security Utility

A feature-rich, browser-based **Password Generator & Security Auditor**. Generate cryptographic passwords, multi-word passphrases, evaluate entropy, and audit breach status via zero-knowledge API checks.

## Features

* **Multi-Mode Generation:** Create randomized complex passwords, Diceware-style passphrases, or bulk export multiple credentials at once.
* **Real-Time Security Audit:** Instant entropy calculation, offline crack-time estimations, and structural rule feedback.
* **Zero-Knowledge Breach Check:** Audits passwords against the HaveIBeenPwned REST API using $k$-Anonymity SHA-1 hashing without exposing your credentials.
* **Session History:** Keeps track of recently generated credentials during your active session.
* **Smart Options:** Toggle individual character sets and exclude visually ambiguous characters (`0`, `O`, `1`, `l`, `I`).

## Getting Started

### Prerequisites

Make sure you have a local web server environment available (such as VS Code's **Live Server** extension, **Node.js**, or **Python**).

### Execution

Because this application uses **native ES Modules**, launching `index.html` directly via file double-click (`file://` protocol) will trigger browser CORS security blocks.

Serve the project folder using any of the following methods:

* **Option A (VS Code Live Server):** Right-click `index.html` inside VS Code and select **"Open with Live Server"**.
* **Option B (Node.js):** Open terminal in this folder and run `npx live-server .`
* **Option C (Python):** Open terminal in this folder and run `python -m http.server 8000`, then navigate to `http://localhost:8000`.

## Built With

* **Vanilla JavaScript (ES Modules)** - Clean, modular code structure without external framework dependencies.
* **Web Crypto API** - `window.crypto` for cryptographically secure pseudo-random generation and `SubtleCrypto` SHA-1 hashing.
* **HaveIBeenPwned API** - $k$-Anonymity range lookup for breach auditing.
* **CSS3** - Responsive layout with custom dark-mode design variables.

## Usage

1. **Generate Credentials:** Choose a mode (**Generator**, **Passphrase**, or **Bulk**), set your desired length or word count, and toggle constraints.
2. **Audit Existing Passwords:** Type or paste any password directly into the output box to receive instant entropy metrics and breach status checks.
3. **Copy & Regenerate:** Click **Copy** to save the active password to your clipboard or **↻** to generate a new password.

## Project Structure

```text
├── index.html
└── src/
    ├── style.css
    ├── main.js
    ├── utils/
    │   ├── crypto.js
    │   └── wordlist.js
    └── modules/
        ├── generator.js
        ├── strengthChecker.js
        ├── hibpChecker.js
        └── ui.js

```
