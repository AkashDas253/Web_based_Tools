
# Shape Shifter

A responsive, modular vanilla JavaScript puzzle game where players navigate dynamic mazes by morphing into different geometric shapes—each with distinct abilities to overcome specialized obstacles and hazards.

---

## Key Features

* **Modular Architecture**: Clean separation of concerns built using native ES6 JavaScript modules (`import`/`export`).
* **Dynamic Shape Mechanics**: Shift between Square, Circle, and Triangle on the fly to solve maze puzzles.
* **Procedural Maze Generation**: Generates fresh maze layouts on every level using a randomized recursive backtracker algorithm.
* **Multiple Game Modes**:
  * **Time Attack**: Sprint against a customizable countdown timer (20s, 35s, 50s, or Custom).
  * **Timeless**: Infinite, relaxed gameplay with no time limits.
* **Synthesized Audio Engine**: Built-in sound effects generated programmatically via the native **Web Audio API** (no external audio assets required).
* **Cross-Platform Controls**: Full support for keyboard navigation (`WASD` / Arrow Keys / `1-3`), on-screen touch D-Pad, and mobile swipe gestures.
* **Data Persistence**: Automatic saving of high scores and user preferences in `localStorage`.

---

## Shape Abilities & Mechanics

Each shape possesses a unique interaction with specific cell types inside the maze:

| Shape | Key | Special Ability | Target Barrier / Hazard |
| :--- | :---: | :--- | :--- |
| **Square** | `1` | **Smash** | Destroys crumbly walls (Cell Type `2`) to carve new paths. |
| **Circle** | `2` | **Pass Gap** | Squeezes through narrow circle gates (Cell Type `4`). |
| **Triangle** | `3` | **Shield** | Passively immunizes the player against spike hazards (Cell Type `3`). |

> **Note**: Moving into solid walls (Cell Type `1`) is impossible regardless of shape, and stepping on spikes without equipping the Triangle shape will result in an immediate reset.

---

## Project Structure

```text
├── index.html          # Main application UI, settings panel, and modal overlays
├── style.css           # Grid styles, UI theme, animations, and shape designs
├── favicon.svg         # Modern vector favicon (also embedded as inline data URI)
└── js/
    ├── main.js         # Core game loop, event listeners, keyboard/gesture bindings
    ├── config.js       # Centralized state management and global configuration
    ├── maze.js         # Recursive backtracker generator & obstacle distributor
    ├── player.js       # Player movement, shape transformation, and collision rules
    ├── settings.js     # UI binding, settings synchronization, and LocalStorage handlers
    ├── timer.js        # Countdown timer controller with pause/resume support
    ├── audio.js        # Web Audio API sound generator engine
    └── swipe.js        # Touch gesture detector for mobile browsers

```

---

## Getting Started

Because the application uses native **ES6 Modules**, it must be served over an HTTP/HTTPS server (modules cannot be loaded directly from the `file://` protocol due to CORS policy).

### 1. Clone or Download the Repository

```bash
git clone [https://github.com/your-username/shape-shifter.git](https://github.com/your-username/shape-shifter.git)
cd shape-shifter

```

### 2. Run Locally

Using any lightweight HTTP server:

* **VS Code Live Server**: Right-click `index.html` and select **Open with Live Server**.
* **Python**:
```bash
python3 -m http.server 8080

```


Then open `http://localhost:8080` in your browser.
* **Node.js (`http-server`)**:
```bash
npx http-server . -p 8080

```



---

## Game Controls

| Action | Keyboard | Touch / Gesture |
| --- | --- | --- |
| **Move Up** | `W` or `↑` | Swipe Up / On-screen `↑` |
| **Move Down** | `S` or `↓` | Swipe Down / On-screen `↓` |
| **Move Left** | `A` or `←` | Swipe Left / On-screen `←` |
| **Move Right** | `D` or `→` | Swipe Right / On-screen `→` |
| **Select Square** | `1` | Tap `1: Square` Button |
| **Select Circle** | `2` | Tap `2: Circle` Button |
| **Select Triangle** | `3` | Tap `3: Triangle` Button |

---

## Game Settings & Tuning

The settings panel on the main menu allows full customization:

* **Maze Size**: Choose between `11x11` (Small), `15x15` (Medium), or `19x19` (Large).
* **Difficulty**: Adjust obstacle density (`Easy`, `Normal`, `Hard`) to modify the frequency of crumbly walls, gates, and spike traps.
* **Movement Speed**: Adjust movement throttle delay (`80ms`, `120ms`, `180ms`).

---

## Tech Stack

* **HTML5 / CSS3**: Flexbox, CSS Grid, Custom Properties, Absolute Positioning.
* **JavaScript**: ES6 Modules, Promises, Web Audio API, Touch Event Listeners.

---