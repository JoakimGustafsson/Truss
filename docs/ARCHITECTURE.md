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

Behavior should be expressed through labels where possible. A node/tensor role such as `moveable`, `field`, `gravitywell`, `banner`, or `nogravity` should be discoverable in `Label.js` and queryable through the Label API instead of being hidden in ad-hoc flags.

### Core principle

Use a **label** when something identifies what an object is, how it should be processed, or whether a behavior applies. Use a **property** when something is a value or configuration parameter.

| Need | Use | Examples |
|---|---|---|
| Behavior/type/role | Label | `moveable`, `field`, `banner`, `nogravity`, `gravitywell` |
| On/off processing rule | Label | skip gravity, anchor-like role, display-plane role |
| Query "find all X" | Label | all `spring` tensors, all `gravitywell` nodes |
| Numeric/vector/string value | Property | `mass`, `localPosition`, `velocityLoss`, `angleVelocityLoss`, `constant`, `name` |
| Tunable coefficient | Property, often supplied by a label | `equilibriumLength`, `dampeningConstant`, `angleVelocityLoss`, `constant` |

Before adding behavior to `Node` or `Tensor`, ask: **could this be a label instead?**

### Label API

The Label API lives in `Javascript\Label.js`.

```javascript
const label = world.labels.findLabel('gravitywell');
const nodes = label.getNodes();
const tensors = world.labels.findLabel('spring').getTensors();
const references = world.labels.findLabel('banner').getReferences();
const count = label.used();
```

#### Common queries

```javascript
// Find gravity wells.
const gravityWells = world.labels.findLabel('gravitywell').getNodes();

// Find spring tensors.
const springs = world.labels.findLabel('spring').getTensors();

// Find moveable nodes.
const moveableNodes = world.labels.findLabel('moveable').getNodes();

// Check a specific object.
const hasNoGravity = node.labels?.some(label => label.name === 'nogravity');
```

#### Avoid string matching

```javascript
// Wrong: fragile and bypasses label objects.
const wells = world.nodes.filter(node => node.label?.includes('gravitywell'));

// Right: uses the label index.
const wells = world.labels.findLabel('gravitywell').getNodes();
```

### Label hierarchy and current labels

Current definitions are in `Javascript\Label.js`.

| Label | Applies to | Purpose |
|---|---|---|
| `node` | Node | Base node category |
| `tensor` | Tensor | Base tensor category |
| `positiontensor` | Tensor | Tensor with a force/position constant |
| `pullspring` | Tensor | Pull-only spring behavior |
| `pushspring` | Tensor | Push-only spring behavior |
| `spring` | Tensor | Spring behavior |
| `field` | Tensor | Field/gravity-style inverse-square force behavior |
| `absorber` | Tensor | Damping behavior |
| `dampenedspring` | Tensor | Spring plus absorber dependencies |
| `angletensor` | Tensor | Tensor endpoint angle targets and endpoint torque constants |
| `moveable` | Node | Node affected by velocity/force updates; exposes editable velocity |
| `angle` | Node | Node with editable angle, angular velocity (deg/s), and angular velocity damping |
| `gravitywell` | Node | Gravity source; defaults include Earth mass and negative-Y position |
| `truss` | Node | Main truss/container node |
| `sensor`, `selector`, `keysensor` | Node | Input/sensor roles |
| `picture` | Node | Image-backed node |
| `color` | Any | Color/visibility properties |
| `debugnode`, `debugtensor` | Any | Debug visualization data |
| `nogravity` | Node | Exclude node from field calculations |
| `anchor` | Node | Pinned/anchored intent with velocity loss default |
| `plane` | Any | Coordinate plane: `world`, `display`, or `admin` |
| `banner` | Any | Banner UI system object |
| `velocityloss` | Node | Tunable velocity retention/damping |
| `displaycoordinates` | Node | Screen-relative coordinate behavior |

### Labels and behaviours

Labels and behaviours are related but not identical:

| Concept | Responsibility | Current implementation |
|---|---|---|
| Label | Describes object identity/category and contributes editable properties | `Label.js`, `StoreableObject.refreshPropertiesAfterLabelChange()` |
| Label dependency | Adds required parent labels/properties | `Labels.recursiveDependencies(...)` |
| Behaviour | Implements runtime actions for lifecycle phases such as calculate, sense, show, update, or collide | Classes in `Javascript\Behaviours\` |
| Behaviour override | Hook point that lets a behavior replace/extend an object method | `BehaviourOverride` enum and `registerOverride(...)` users |

Today, many labels govern behavior indirectly through label queries. For example, `TrussNode.calculatePositionBasedForces()` asks the `field`, `spring`, and `pullspring` labels for tensors and calls the matching force calculator. This is label-driven, but it is not yet behavior-registry-driven.

The desired direction is:

```text
label string -> parsed labels -> properties + behavior attachments + validation
```

In that model, labels remain the user-facing and serialization-facing concept, while behaviours become implementation modules registered behind labels.

Current registry coverage includes physics and angle labels: `spring`, `pullspring`, `pushspring`, `field`, `absorber`, `angle`, and `angletensor`. When these labels are added or removed, their behavior overrides are attached or detached from the selected object.

### Review checklist for labels

When reviewing changes to node/tensor behavior:

- Does the change add a new flag such as `isX`, `hasX`, `skipX`, or a name/type pattern check?
- Could that behavior be represented as a label?
- Is the label defined in `Label.js` with appropriate dependencies?
- Does the code use Label API queries instead of string matching?
- Is the behavior check centralized where practical?
- Are data values kept as properties instead of labels?
- Are docs/tests updated for user-visible behavior?

## Physics architecture

Physics is tensor-driven. Springs and absorbers provide local constraints and damping; field tensors provide long-range force behavior such as gravity.

### Physics model overview

The simulation is node/tensor based:

- **Nodes** have positions, mass, velocity, labels, and connected tensors.
- **Tensors** connect two nodes and calculate forces according to labels.
- **Moveable nodes** update velocity and position each tick.
- **Force calculators** live primarily in `Javascript\Behaviours\TensorForces.js`.

Common tensor behaviors:

| Label/type | Behavior |
|---|---|
| `spring` | Restoring force around `equilibriumLength` |
| `pullspring` | Pull-only spring behavior |
| `pushspring` | Push-only spring behavior |
| `absorber` | Damping/relative-velocity absorption |
| `field` | Inverse-square field force, used for gravity-like behavior |

### Field tensors

Field tensors simulate long-range forces such as gravity:

```javascript
new Tensor(gravityWell, node, 'field', {
    name: 'gravity',
    constant: -6.67e-11,
    visible: 0,
});
```

The field calculator effectively uses:

```text
force = -(constant * mass1 * mass2 / distance^2) * direction
```

Because the calculation includes a leading negation:

- Negative constants produce attraction.
- Positive constants produce repulsion.

For gravity, use a negative constant when connecting ordinary world nodes to Earth-like gravity wells.

### Gravity wells

`gravitywell` is a node label defined in `Javascript\Label.js`. Its defaults include:

- `constantProperty: 6.67e-11`
- `massProperty: 5.97219e24`
- `nameProperty: 'Earth'`
- `positionProperty: new Position(0, -6371000)`
- `enforcedProperty: true`

`Javascript\ExperimentalTrusses.js` currently creates Earth explicitly:

```javascript
const EARTH_CENTER = new Position(0, -6371e3);
const EARTH_MASS = 5.97219e24;
const GRAVITY_CONSTANT = -6.67e-11;

trussNode.earth = new Node(trussNode.world, trussNode, 'gravitywell node', {
    name: 'Earth',
    localPosition: EARTH_CENTER,
    mass: EARTH_MASS,
});
```

It then creates explicit field tensors from Earth to the protagonist and two moveable nodes. There is no general runtime system that automatically connects every new node to every gravity well.

### `nogravity` label

`nogravity` is a node label that excludes nodes from field calculations. `TensorForces.js` checks both nodes of a field tensor:

```javascript
const hasNoGravity1 = this.node1.labels && this.node1.labels.some(label => label.name === 'nogravity');
const hasNoGravity2 = this.node2.labels && this.node2.labels.some(label => label.name === 'nogravity');

if (hasNoGravity1 || hasNoGravity2) {
    return new Vector(0, 0);
}
```

Use this label when a node may be connected to field tensors but should not receive gravity-like force.

### Current banner physics

The live banner implementation in `Javascript\View\ParameterEditor\BannerNode.js` uses display-plane physics, but its gravity is now modeled with true inverse-square `field` tensors.

Current behavior:

- Banner nodes are created in display coordinates with the `banner node moveable plane` label combination.
- The banner creates `this.bannerGravityWell` as a display-plane node below the two bottom banner nodes.
- `bannerGravityWell` uses Earth mass (`5.97219e24 kg`).
- The well is placed one Earth radius below the banner bottom in display-plane units.
- The two bottom banner nodes connect to `bannerGravityWell` using hidden `field banner` tensors named `bannerLeftGravity` and `bannerRightGravity`.
- Top/bottom banner shape is still maintained with spring/absorber tensors; gravity supplies the downward drape.

Current banner constants include:

```javascript
const EARTH_MASS_KG = 5.97219e24;
const EARTH_RADIUS_METERS = 6371e3;
const EARTH_GRAVITY_CONSTANT = 6.6743e-11;
const DISPLAY_METERS_PER_PERCENT = 0.004;
const DISPLAY_EARTH_RADIUS = EARTH_RADIUS_METERS / DISPLAY_METERS_PER_PERCENT;
const DISPLAY_GRAVITY_CONSTANT = -EARTH_GRAVITY_CONSTANT / Math.pow(DISPLAY_METERS_PER_PERCENT, 3);

const gravityWellY = bottomPercentY - DISPLAY_EARTH_RADIUS;

this.bannerGravityWell = new Node(this.world, this.parentTrussNode, 'banner node moveable plane', {
    localPosition: new Position(centerPercentX, gravityWellY),
    name: 'bannerGravityWell',
    mass: EARTH_MASS_KG,
    velocityLoss: 1.0,
    plane: 'display',
});

this.leftBottomField = new Tensor(this.bannerGravityWell, this.leftBottomNode, 'field banner', {
    name: 'bannerLeftGravity',
    constant: DISPLAY_GRAVITY_CONSTANT,
    visible: 0,
});
```

`DISPLAY_GRAVITY_CONSTANT` rescales the real gravitational constant into display-percent units. This keeps the model Earth-like by mass and radius while producing acceleration in the banner's display coordinate space.

## Coordinate systems and input

Truss uses multiple coordinate spaces. Keep them explicit: physics code should operate in world/display/admin coordinates intentionally, and raw browser pointer coordinates should be converted at the boundary.

### Coordinate spaces

| Space | Origin/direction | Used for | Primary references |
|---|---|---|---|
| World | Positive X right, positive Y up | Physics, ordinary nodes/tensors, gravity wells | `Node.localPosition`, `TrussView` conversions |
| Display | Screen-relative percentages; X left-to-right, Y bottom-to-top in helper APIs | Screen-fixed UI such as banners/selectors | `displayCoordinateSystem`, `plane: 'display'` |
| Browser/screen | Top-left origin; positive Y down | Raw mouse/touch/canvas events | `myX`, `myY`, DOM rects |
| Admin | System/backend overlay plane | Non-world system UI | `Plane.js`, `globals.js` |

### World coordinates

World coordinates use mathematical orientation:

```text
Y up
^
|
+----> X right
|
v negative Y is down
```

Use world coordinates for:

- Normal node positions
- Tensor lengths and force vectors
- Springs and field tensors
- Earth/gravity well placement in the world model

Gravity wells that should pull objects visually downward in world space belong at negative Y.

### Display coordinates

Display coordinates are used for UI that should remain screen-relative. Banner UI nodes currently use display-plane positions such as percentages of the view and `plane: 'display'`.

Do not connect display-coordinate UI objects to world-coordinate physics objects unless the conversion and intended behavior are explicit.

### View conversion

`Javascript\View\TrussView.js` owns conversion between world and screen coordinates through methods such as:

```javascript
worldPosition(screenX, screenY)
x(worldPosition)
y(worldPosition)
```

Use view methods instead of hand-rolled conversion whenever possible.

### Mouse input rule

Display-coordinate mouse percentages are calculated once in `Javascript\main.js` during `mainArea.onmousemove` and stored in globals:

```javascript
displayMousePercentX
displayMousePercentY
```

World-coordinate input still uses raw `myX`/`myY` at the conversion boundary, typically through view methods such as `worldPositionWithOffset(...)`.

Do not duplicate display-coordinate mouse conversion in individual components. For display-plane selection/debug behavior, use the stored display percentages from `Javascript\globals.js`.

### Current display mouse flow

1. `main.js` receives `mousemove`.
2. It stores viewport-relative coordinates in `myX` and `myY`.
3. It computes canvas-relative display percentages from the current view element bounds.
4. It stores those percentages through `setDisplayMousePercent(...)`.
5. Consumers such as `Sensors.js` and `TrussNode.js` use `displayMousePercentX` and `displayMousePercentY`.

### Common coordinate mistakes

#### Mixing screen Y with world Y

Browser screen Y grows downward; world Y grows upward. Convert before using screen positions in physics.

#### Placing world gravity above objects

For downward world gravity, the gravity source should be below the objects:

```javascript
new Position(x, y - 50000);
```

#### Pattern-specific pointer math

Avoid duplicating pointer-to-display conversion in individual components. Use `displayMousePercentX` and `displayMousePercentY` for display-plane pointer work.

#### Cross-plane physics

Display-plane banner objects and world-plane physics objects use different coordinate semantics. Cross-plane tensors should be treated as architectural decisions, not convenience shortcuts.

### Debugging coordinate issues

1. Identify the source coordinate space: browser screen, display, world, or admin.
2. Identify the target coordinate space.
3. Find the conversion boundary.
4. Check Y-axis direction.
5. Check zoom/pan scale and offsets.
6. Check object `plane`/coordinate-system labels and properties.

Known pan/zoom issues are tracked in [Status](STATUS.md).

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
