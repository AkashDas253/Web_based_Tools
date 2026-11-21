# Tetris

A lightweight, browser-based Tetris game built with native HTML, CSS and JavaScript modules.

## Features

- Classic seven-piece gameplay
- Score, level, line count and saved best score
- Next-piece preview
- Line clearing, soft drop and hard drop
- Pause, restart and game-over states
- Keyboard and touch controls
- Responsive layout

## Run

Open `index.html` in a modern browser. If your browser blocks JavaScript modules on `file://`, run a local static server from this folder:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Controls

| Action | Keyboard |
|---|---|
| Move | Left / Right arrows |
| Soft drop | Down arrow |
| Rotate | Up arrow or X |
| Rotate counter-clockwise | Z |
| Hard drop | Space |
| Pause / resume | P |

The game has no runtime dependencies or external service requirements. The interface uses system fonts and makes no external requests.
