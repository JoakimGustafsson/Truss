# Architecture guide

## High-level overview

Truss is a browser-based simulation/editor with a lightweight Node backend:

- **Frontend runtime**: `Truss.html` + `Javascript/`
- **Persistence API**: `Node.js/app.js`
- **Assets/data**: `Resources/`, `Stylefiles/`, `Saves/`

## Frontend architecture

### Entry point and render loop

- `Truss.html` wires script loading and starts `mainLoop(...)`.
- The loop calls `Universe.tick(...)` each animation frame.

### World model

- `Javascript/Universe.js`
  - `Stack`: world stack helper
  - `World`: one active truss world + optional governors
  - `Universe`: current world/view selection, orchestration, UI container switching

### Simulation primitives

- `Javascript/Primitives.js`: vector/math utility classes (`Vector`, `Position`, `Force`, etc.)
- `Javascript/Nodes/Node.js`: base node behavior and selection/event integration
- `Javascript/Nodes/TrussNode.js`: node that owns/hosts a truss view/canvas
- `Javascript/Tensors.js`: spring/field/absorber-like connectors and force logic

### Label-driven property system

- `Javascript/StoreableObject.js`: base class for label-based dynamic properties
- `Javascript/Label.js`: label definitions, dependencies, and default/enforced property assignment

### Editor UI

- `Javascript/ParameterEditor/ConfigurationArea.js`: dynamic tabbed editing UI creation
- Other files in `Javascript/ParameterEditor/`: property views and update handling

### Save/load client helpers

- `Javascript/FileSave.js` wraps:
  - `POST /save`
  - `GET /load/:fileName`
  - `GET /dir/:folder`

## Backend architecture

`Node.js/app.js` starts an Express server on port `3000` and serves static files from several project paths.

Routes:

- `GET /` -> serves `Truss.html`
- `GET /dir/:folder` -> lists files from project folders
- `GET /load/:fileName` -> returns save file payload from `Saves/`
- `POST /save` -> writes save content to `Saves/`
- `POST /upload` -> uploads resources to `Resources/`

## Data model summary

- **Node**: movable object with mass/position/velocity and labels.
- **Tensor**: connector between nodes; behavior depends on labels/properties.
- **World**: collection of labeled nodes/tensors with one active truss node.
- **Universe**: stack/navigation layer across worlds/views.

## Current limitations

This architecture description reflects intended structure.  
See [CODEBASE-STATUS.md](CODEBASE-STATUS.md) for current implementation blockers.
