# Architecture

Truss is a browser-based simulation/editor with a lightweight Node backend. The frontend owns rendering, editing, label parsing, and physics; the backend serves static files and provides save/load endpoints.

## High-level structure

| Area | Location | Purpose |
|---|---|---|
| Browser entry point | `Truss.html`, `Javascript\main.js` | Loads the app and starts the animation loop |
| Runtime orchestration | `Javascript\Universe.js` | Maintains active world/view state and the world stack |
| Simulation primitives | `Javascript\Primitives.js`, `Javascript\Nodes\`, `Javascript\Tensors.js` | Positions, vectors, nodes, tensors, and physics relationships |
| Behavior system | `Javascript\Label.js`, `Javascript\StoreableObject.js`, `Javascript\Behaviours\` | Label definitions, dynamic properties, and force/input behaviors |
| Rendering/input | `Javascript\View\`, `Javascript\Plane.js` | Canvas rendering, display/admin/world planes, pan/zoom, and pointer conversion |
| Parameter editor | `Javascript\View\ParameterEditor\`, `Javascript\ParameterEditor\` | UI for inspecting and editing selected nodes/tensors |
| Persistence client | `Javascript\FileSave.js` | Browser save/load helpers |
| Backend | `Node.js\app.js` | Express routes for static files, save/load, directory listing, and uploads |

## Runtime flow

1. `Truss.html` loads the browser modules and starts `mainLoop(...)`.
2. `mainLoop(...)` calls `Universe.tick(...)` every animation frame.
3. The active `World` updates nodes, tensors, governors, views, and UI state.
4. Force calculators in `Javascript\Behaviours\TensorForces.js` apply spring, absorber, and field behavior through tensors.
5. Rendering code in `Javascript\View\` converts world/display/admin coordinates into screen output.

## Core concepts

| Term | Meaning | Primary files |
|---|---|---|
| Universe | Top-level runtime orchestrator; tracks current world/view and navigation stack | `Javascript\Universe.js` |
| World | A self-contained simulation scene with one main truss node, optional governors, labels, nodes, and tensors | `Javascript\Universe.js` |
| World stack | LIFO navigation stack used to drill into sub-trusses and return to parent worlds | `Javascript\Universe.js` |
| Truss | A network of nodes connected by tensors, visualized and edited in the browser | `Javascript\Nodes\TrussNode.js`, `Javascript\Tensors.js` |
| Truss node | A node that hosts a child world/truss and can be edited like other nodes | `Javascript\Nodes\TrussNode.js` |
| Node | Point-like object with position, mass, velocity, labels, and connected tensors | `Javascript\Nodes\Node.js` |
| Tensor | Connector/relationship between two nodes; labels determine whether it behaves as a spring, field, absorber, etc. | `Javascript\Tensors.js` |
| Label | Named behavior/property definition with dependencies and default/enforced properties | `Javascript\Label.js` |
| StoreableObject | Base for objects that use labels and can serialize/restore dynamic properties | `Javascript\StoreableObject.js` |
| View | Canvas-backed rendering and interaction layer for a world | `Javascript\View\` |
| Parameter editor | Tabbed UI for editing selected node/tensor properties | `Javascript\View\ParameterEditor\` |

## Data model

- **Nodes** store position, mass, velocity, parent references, connected tensors, and labels.
- **Tensors** connect two nodes and calculate/apportion forces according to labels such as `spring`, `pullspring`, `field`, and `absorber`.
- **Labels** define default/enforced properties and provide queryable behavior categories.
- **Worlds** collect nodes, tensors, labels, and view/governor state.
- **Universe** manages which world is active and coordinates frame updates.

## Label-driven architecture

Behavior should be expressed through labels where possible. A node/tensor role such as `moveable`, `field`, `gravitywell`, `banner`, or `nogravity` should be discoverable in `Label.js` and queryable through the Label API instead of being hidden in ad-hoc flags. See [Labels](LABELS.md).

## Physics architecture

Physics is tensor-driven. Springs and absorbers provide local constraints and damping; field tensors provide long-range force behavior such as gravity. Current gravity behavior, sign conventions, and banner-specific details are documented in [Gravity and physics](GRAVITY-AND-PHYSICS.md).

## Coordinate/input architecture

The codebase uses multiple coordinate planes. World-space physics, screen-fixed display UI, and admin/system overlays must not be mixed without explicit conversion. See [Input and coordinates](INPUT-AND-COORDINATES.md).

## Backend routes

`Node.js\app.js` starts an Express server on port `3000`.

| Route | Purpose |
|---|---|
| `GET /` | Serves `Truss.html` |
| `GET /dir/:folder` | Lists files from project folders |
| `GET /load/:fileName` | Loads a save from `Saves\` |
| `POST /save` | Writes save content to `Saves\` |
| `POST /upload` | Uploads resources to `Resources\` |

## Common workflows

### Creating a node

1. Instantiate `Node` with a world, parent, label string, and initial properties.
2. Labels are parsed by the world label manager and attached to the node.
3. The node participates in rendering, selection, and physics according to its labels/properties.

### Connecting nodes with a tensor

1. Instantiate `Tensor` with two nodes, labels, and properties.
2. The tensor registers with the connected nodes.
3. During each tick, relevant force calculators apply label-specific behavior.

### Editing a truss

1. Select a node or tensor.
2. The parameter editor displays its label-backed properties.
3. Property changes are applied live and affect the next simulation/render tick.

### Drilling into a sub-truss

1. Select/open a truss node.
2. `Universe` pushes the child world onto the world stack.
3. The view switches to the child world.
4. Returning pops the stack and restores the parent world.
