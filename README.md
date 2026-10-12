# Neonvault Group — Arcade Demo Website

A fictional corporate website for **Neonvault Group**, a company that restores, licenses and reimagines classic arcade games. Built as a portfolio project with plain HTML, CSS and JavaScript — no frameworks, no build step, no image assets.

Every game "screenshot" on the page is an **animated pixel-art scene drawn in code** on a `<canvas>`, as an original tribute to the arcade classics.

---

## Features

- **Animated hero** — a random arcade scene plays behind the headline and swaps every 7 seconds with a CRT glitch effect. The "Now playing" pill shows the current game, and the shuffle button picks a new one.
- **9 hand-coded pixel scenes** — maze chase, girders & barrels, alien invasion, vector rocks, brick breaker, road & river, swooping squadron, garden bug and table tennis.
- **Games rail** — horizontal, scroll-snapping card carousel, shuffled on every visit, with arrow buttons, keyboard arrows, mouse drag-to-scroll and a progress bar.
- **"Random from the vault" mosaic** — a 7-tile grid where one tile flips to a different game every few seconds.
- **Count-up stats** — numbers animate when scrolled into view.
- **Scroll reveals** — split-line headline reveals and fade-up blocks via `IntersectionObserver`.
- **Sticky header** — gains a blurred background after scrolling and hides on scroll down.
- **Navigation** — hover/click dropdowns on desktop, full-screen accordion menu on mobile, collapsible search bar.
- **Extras** — infinite "Together" marquee, pixel-art avatar drawn from a character map, newsletter form with a success message.
- **Fully responsive** — breakpoints at 1024px, 860px and 640px.

## Tech stack

| Part | Details |
|------|---------|
| Markup | Semantic HTML5 |
| Styles | Vanilla CSS (custom properties, grid, flexbox, `clamp()`) |
| Scripts | Vanilla JavaScript (ES6+, no dependencies) |
| Graphics | Canvas 2D API, 192×128 scenes scaled with `image-rendering: pixelated` |
| Fonts | Google Fonts — Space Grotesk, Inter, Press Start 2P |

## Project structure

```
.
├── index.html   # Page markup and sections
├── style.css    # All styling, animations and responsive rules
├── scenes.js    # Pixel-art scene engine (window.ArcadeScenes)
└── script.js    # Page interactions: header, menus, rail, mosaic, counters
```

`scenes.js` must load before `script.js`, since the page script uses the `window.ArcadeScenes` API.

## Getting started

No installation or build is required.

1. Clone the repository:
   ```bash
   git clone https://github.com/DemonCoder354/<repository-name>.git
   ```
2. Open `index.html` in a browser.

Optionally, serve it locally (for example with the VS Code **Live Server** extension, or):
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

## Scene engine API

`scenes.js` exposes a small API on `window.ArcadeScenes`:

| Member | Description |
|--------|-------------|
| `keys` | Array of available scene keys |
| `mount(canvas, key)` | Starts rendering a scene on a canvas |
| `swap(canvas, key)` | Replaces the scene on an already mounted canvas |
| `unmount(canvas)` | Stops rendering and cleans up |
| `W`, `H` | Scene resolution (192 × 128) |

A single `requestAnimationFrame` loop drives all canvases, and only canvases visible on screen are redrawn.

### Adding a new game

1. In `scenes.js`, write a function that returns `{ draw(ctx, t) { ... } }` (where `t` is time in seconds) and add it to the `SCENES` object.
2. In `script.js`, add an entry to the `GAMES` array with the same `key`:
   ```js
   { key: "myscene", title: "My Game", year: 1982, maker: "Studio", genre: "Action", blurb: "Short description." }
   ```

The new game will automatically appear in the hero, the rail and the mosaic.

## Accessibility

- Skip-to-content link
- `aria-expanded` / `aria-label` on menu, dropdown and icon buttons
- Visible `:focus-visible` outlines
- Keyboard support: arrow keys scroll the games rail, `Esc` closes menus
- Respects `prefers-reduced-motion` (animations and the scene loop are disabled)

## Browser support

Works in current versions of Chrome, Edge, Firefox and Safari.

## Disclaimer

Neonvault Group is a **fictional company** created for a portfolio demo. All pixel art is original and drawn in code. Game titles and company names (Pac-Man, Donkey Kong, Space Invaders, etc.) are trademarks of their respective owners and are used only as references for the tributes. This project is not affiliated with or endorsed by any of them.

## Author

**David** — [github.com/DemonCoder354](https://github.com/DemonCoder354)
