# Development guide

This guide explains how to run and work on Truss locally.

## Prerequisites

- Node.js 18+ or newer LTS
- npm
- A browser for the interactive runtime

## Install dependencies

Install frontend dependencies from the repository root:

```bash
npm install
```

Install backend dependencies:

```bash
npm install --prefix Node.js
```

## Run the frontend dev server

From the repository root:

```bash
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

The zoom test runner is available at:

```text
http://localhost:5173/Javascript/Tests/test-zoom-runner.html
```

## Run the backend server

From the repository root:

```bash
node Node.js\app.js
```

Or from `Node.js\`:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

## Build

From the repository root:

```bash
npm run build
```

## Core runtime flow

1. `Truss.html` bootstraps scripts and starts the animation loop.
2. `Universe` and `World` in `Javascript\Universe.js` coordinate per-frame updates.
3. `Node`, `Tensor`, and behavior modules advance physics.
4. `Javascript\View\` renders the active world and handles pan/zoom/input.
5. Parameter editor modules expose label-backed properties for live editing.

## Save/load behavior

Client helpers in `Javascript\FileSave.js` call backend routes in `Node.js\app.js`:

- `GET /dir/:folder`
- `GET /load/:fileName`
- `POST /save`
- `POST /upload`

Save files live under `Saves\`.

## Development constraints

- Rendering and physics are real-time sensitive. Ask before changes that may downgrade rendering performance.
- Prefer label-driven behavior over new hidden flags on nodes or tensors; see [Labels](LABELS.md).
- Keep coordinate systems explicit; see [Input and coordinates](INPUT-AND-COORDINATES.md).
- Check [Status](STATUS.md) before large feature work.
