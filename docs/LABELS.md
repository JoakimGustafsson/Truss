# Labels

Truss uses labels as the main mechanism for behavior and property discovery. Labels are defined in `Javascript\Label.js`, parsed onto nodes/tensors by `StoreableObject`, and queried through the Label API.

## Core principle

Behavior should be governed by labels, not hidden flags.

Use a **label** when something identifies what an object is, how it should be processed, or whether a behavior applies. Use a **property** when something is a value or configuration parameter.

| Need | Use | Examples |
|---|---|---|
| Behavior/type/role | Label | `moveable`, `field`, `banner`, `nogravity`, `gravitywell` |
| On/off processing rule | Label | skip gravity, anchor-like role, display-plane role |
| Query "find all X" | Label | all `spring` tensors, all `gravitywell` nodes |
| Numeric/vector/string value | Property | `mass`, `localPosition`, `velocityLoss`, `angleVelocityLoss`, `constant`, `name` |
| Tunable coefficient | Property, often supplied by a label | `equilibriumLength`, `dampeningConstant`, `angleVelocityLoss`, `constant` |

Before adding behavior to `Node` or `Tensor`, ask: **could this be a label instead?**

## Core API

The Label API lives in `Javascript\Label.js`.

```javascript
const label = world.labels.findLabel('gravitywell');
const nodes = label.getNodes();
const tensors = world.labels.findLabel('spring').getTensors();
const references = world.labels.findLabel('banner').getReferences();
const count = label.used();
```

### Common queries

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

### Avoid string matching

```javascript
// Wrong: fragile and bypasses label objects.
const wells = world.nodes.filter(node => node.label?.includes('gravitywell'));

// Right: uses the label index.
const wells = world.labels.findLabel('gravitywell').getNodes();
```

## Label hierarchy and current labels

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
| `moveable` | Node | Node affected by velocity/force updates |
| `angle` | Node | Node with editable angle and angular velocity damping |
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

## Decision tree

```text
Adding new feature to Node/Tensor?
|
+-- Is it static data?                  -> property
+-- Is it configuration/tuning value?   -> property
+-- Is it behavior/type/role?           -> label
+-- Is it conditional processing?       -> label
+-- Would "find all X" be useful?       -> label
```

Examples:

```javascript
// Data/configuration: properties.
node.mass = 5;
node.localPosition = new Position(10, 20);
tensor.constant = 350;
tensor.equilibriumLength = 40;

// Behavior/role: labels.
new Node(world, parent, 'node moveable banner plane', { name: 'leftTop' });
new Tensor(nodeA, nodeB, 'spring absorber banner', { constant: 350 });
```

## Labels and behaviours

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

Current registry coverage includes physics and angle labels: `spring`, `pullspring`, `pushspring`, `field`, `absorber`, `angle`, and `angletensor`. When these labels are added or removed, their behavior overrides are attached or detached from the selected object. Some older runtime loops still call direct tensor/node helper methods while those paths are migrated to registry-driven execution.

## Adding a label

1. Define the label in `Javascript\Label.js`.
2. Give it the correct parent/dependency labels.
3. Add defaults/enforced properties only when they are truly part of the label contract.
4. Apply it through constructor label strings or `world.labels.addReference(...)`.
5. Query it with `world.labels.findLabel(...)` or `object.labels?.some(...)`.
6. Update this document when it changes developer-facing behavior.

Example:

```javascript
// In Label.js
this.addLabel('mybehavior', [nodeLabel], {
    'someProperty': 1,
});

// In node creation
new Node(world, parent, 'node mybehavior', { name: 'example' });

// In behavior code
const hasBehavior = node.labels?.some(label => label.name === 'mybehavior');
```

## Review checklist

When reviewing changes to node/tensor behavior:

- Does the change add a new flag such as `isX`, `hasX`, `skipX`, or a name/type pattern check?
- Could that behavior be represented as a label?
- Is the label defined in `Label.js` with appropriate dependencies?
- Does the code use Label API queries instead of string matching?
- Is the behavior check centralized where practical?
- Are data values kept as properties instead of labels?
- Are docs/tests updated for user-visible behavior?

## Anti-patterns

```javascript
// Hidden behavior flags.
node.isBannerUINode = true;
node.skipGravity = true;

// Name or label-string pattern matching.
if (node.name.startsWith('banner_')) { ... }
if (node.label?.includes('gravity')) { ... }

// Data values used as behavior markers.
if (node.mass === Infinity) { doSpecialThing(); }
```

Prefer:

```javascript
new Node(world, parent, 'node banner nogravity', {});
const hasNoGravity = node.labels?.some(label => label.name === 'nogravity');
```

## Important current examples

### `nogravity`

`TensorForces.js` skips field calculations if either connected node has the `nogravity` label:

```javascript
const hasNoGravity1 = this.node1.labels && this.node1.labels.some(label => label.name === 'nogravity');
const hasNoGravity2 = this.node2.labels && this.node2.labels.some(label => label.name === 'nogravity');

if (hasNoGravity1 || hasNoGravity2) {
    return new Vector(0, 0);
}
```

### `plane` and `banner`

Banner UI objects use labels such as `banner`, `plane`, and node/tensor behavior labels to separate UI objects from world simulation concepts. See [Input and coordinates](INPUT-AND-COORDINATES.md) and [Gravity and physics](GRAVITY-AND-PHYSICS.md).

### `velocityloss`

`velocityloss` is the current label for tunable velocity retention/damping. Older notes about `backgroundfriction` were consolidated away because the live code uses `velocityloss`/`velocityLoss`.

### `angletensor`

`angletensor` is the tensor-side label for angle constraints. Adding it to a tensor exposes editable `degree1`, `degree2`, `torqueConstant1`, and `torqueConstant2` properties. Runtime angle torque checks this label, so the label is the user-facing behavior switch while the properties remain the tunable values.

The stiffness belongs to the tensor endpoint. An `angle` node receives torque from connected `angletensor` tensors, then its mass controls how quickly that torque changes angular velocity. The node-side damping is `angleVelocityLoss`, where `1` retains all angular velocity and lower values bleed angular velocity off more quickly.
