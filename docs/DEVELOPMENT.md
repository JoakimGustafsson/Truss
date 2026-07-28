# Development guide

This guide explains how to run and work on Truss locally.

## 1. Prerequisites

- Node.js 18+ (or newer LTS)
- npm
- A shell that can run Node scripts

## 2. Install backend dependencies

From the repository root, install dependencies into `Node.js`:

```bash
npm install --prefix Node.js
```

## 3. Run the app

From the repository root:

1. From repository root:

```bash
node Node.js/app.js
```

2. Or from `Node.js`:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

## 4. Core runtime flow

1. `Truss.html` bootstraps scripts and starts `requestAnimationFrame`.
2. `Universe`/`World` classes in `Javascript/Universe.js` run per-frame updates.
3. Node/tensor logic in `Javascript/Nodes/` and `Javascript/Tensors.js` advances physics.
4. Parameter editor modules in `Javascript/ParameterEditor/` handle UI editing.

## 5. Save/load behavior

- Client calls in `Javascript/FileSave.js`:
  - `GET /dir/:folder`
  - `GET /load/:fileName`
  - `POST /save`
- Server handlers are in `Node.js/app.js`.
- Save files are stored under `Saves/`.

## 6. Important caveat before development

Check [CODEBASE-STATUS.md](CODEBASE-STATUS.md) for any current runtime/parser blockers before adding features.
