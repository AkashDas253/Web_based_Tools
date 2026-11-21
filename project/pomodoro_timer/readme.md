# Pomodoro Timer

A feature-rich, modular Pomodoro Timer built with vanilla HTML, CSS, and modern JavaScript (ES6 Modules). Designed with an emphasis on clean architecture, state persistence, and native browser capabilities without external frameworks or dependencies.

---

## Features

* **Customizable Intervals**: Easily configure work, short break, and long break durations through an interactive settings modal.
* **Persistent State**: Automatically saves active timers, selected modes, completed session counts, and custom durations via `localStorage`.
* **Automated Cycle Management**: Tracks completed focus sessions and automatically transitions between work and break intervals (including long breaks after every 4 completed sessions).
* **Web Audio API Integration**: Built-in procedural alarm chimes and ambient white noise generator with zero external audio assets.
* **Responsive UI**: Clean single-page application layout with dynamic mode switching and real-time document title synchronization.

---

## File Structure

```text
/pomodoro-app
├── index.html
├── style.css
└── js/
    ├── main.js        // Entry point and event orchestration
    ├── timer.js       // Core timer state machine and local storage sync
    ├── audio.js       // Web Audio API sound synthesizers (alarm & ambient noise)
    └── ui.js          // DOM manipulation and settings modal handling

```

---

## Getting Started

1. Clone or download the repository files into a local directory.
2. Serve the directory using a local development server (such as Live Server in VS Code, or Python's HTTP server):
```bash
python3 -m http.server 8000

```


3. Open `http://localhost:8000` in your browser.

---