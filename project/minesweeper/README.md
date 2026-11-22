# Minesweeper

A lightweight, browser-first Minesweeper game built with HTML, CSS and vanilla JavaScript modules.

## Features

- Beginner, Intermediate and Expert difficulty levels
- Custom board dimensions and mine count
- First-click safety (the first cell and its neighbors are safe)
- Reveal, flag, flood reveal and number chording
- Timer, remaining-mine counter and locally saved best times
- Light and dark themes
- Responsive layout and touch-friendly reveal/flag controls
- Keyboard navigation
- Offline caching through a service worker

## Run locally

Because this project uses JavaScript modules and a service worker, run it through a local web server rather than opening `index.html` directly.

For example, from this directory:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Controls

- Click/tap: Reveal a cell (or use the selected mode)
- Right-click: Toggle a flag
- Reveal / Flag buttons: Switch interaction mode, especially useful on touch screens
- Double-click a revealed number: Chord/reveal adjacent unflagged cells when the flag count matches
- Keyboard: Tab to a cell, use arrow keys to move, Enter/Space to activate, and `F` to flag

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript ES modules
- LocalStorage
- Service Worker and Web App Manifest

No backend, account, external API or runtime library is required. The interface uses system font stacks and does not request external assets.

## Project structure

```text
minesweeper/
├── index.html
├── manifest.webmanifest
├── sw.js
├── README.md
├── css/
│   ├── style.css
│   └── responsive.css
└── js/
    ├── app.js
    ├── board.js
    ├── game.js
    ├── storage.js
    └── ui.js
```
