# Gravity and physics

This document consolidates the current gravity, field tensor, banner physics, and historical tuning notes.

## Current relevance

Gravity/physics is still active in the codebase:

- `Javascript\ExperimentalTrusses.js` creates an Earth-like `gravitywell` and `field` tensors.
- `Javascript\Behaviours\TensorForces.js` calculates field, spring, pullspring, pushspring, and absorber forces.
- `Javascript\Label.js` defines `gravitywell`, `field`, `nogravity`, `moveable`, `velocityloss`, `plane`, and `banner` labels.
- `Javascript\View\ParameterEditor\BannerNode.js` uses a display-plane banner physics model.
- `Javascript\Tests\zoom-independence.test.js` contains zoom/banner physics tests and helpers.

Some previous markdown files described planned or intermediate states that do **not** match current code. This document calls out the current state explicitly.

## Physics model overview

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

## Field tensors

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

## Gravity wells

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

## Coordinate/sign rules

World coordinates use mathematical orientation:

- Positive X = right
- Positive Y = up
- Negative Y = down

To pull world-space objects downward with attraction, place the gravity source below them at negative Y and use a negative field constant.

Display/UI coordinates and planes are separate; see [Input and coordinates](INPUT-AND-COORDINATES.md).

## `nogravity`

`nogravity` is a node label that excludes nodes from field calculations. `TensorForces.js` checks both nodes of a field tensor:

```javascript
const hasNoGravity1 = this.node1.labels && this.node1.labels.some(label => label.name === 'nogravity');
const hasNoGravity2 = this.node2.labels && this.node2.labels.some(label => label.name === 'nogravity');

if (hasNoGravity1 || hasNoGravity2) {
    return new Vector(0, 0);
}
```

Use this label when a node may be connected to field tensors but should not receive gravity-like force.

## Current banner physics

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

## Test banner physics

`Javascript\Tests\zoom-independence.test.js` contains older test-oriented banner gravity helpers:

- It finds or creates a `gravitywell`.
- It connects banner test nodes with `field` tensors.
- It uses scaled gravitational constants such as `GRAVITY_CONSTANT * 1e15`.
- It simulates banner settling across zoom levels.

Treat exact constants there as test harness values. The live banner now uses the Earth-mass/display-radius field model described above.

## Historical tuning notes

Previous tuning explored banner settling over 30 iterations. Useful lessons retained:

- Spring orientation matters; vertical springs can counteract desired gravity/drape.
- Equilibrium length strongly affects horizontal separation.
- Damping/velocity loss controls oscillation and convergence.
- Extreme zoom levels can reveal floating-point and force-scaling problems.
- A 3-second stabilization window at roughly 60 FPS was used for banner position tests.

The old tuning report's exact pass rates and constants were historical and should not be treated as current acceptance criteria without re-running tests.

## Debugging checklist

If world gravity does not behave as expected:

1. Check that a `gravitywell` node exists:

   ```javascript
   const wells = world.labels.findLabel('gravitywell').getNodes();
   ```

2. Check that field tensors exist:

   ```javascript
   const fields = world.labels.findLabel('field').getTensors();
   ```

3. Check the field constant sign. Gravity-like attraction should use a negative constant in the world model.
4. Check source/target positions. A downward gravity well should be at negative Y in world coordinates.
5. Check node masses. Missing, null, or `NaN` mass prevents field calculation.
6. Check for `nogravity` on either node.
7. Confirm the object is in the expected coordinate plane (`world`, `display`, or `admin`).

## Related docs

- [Architecture](ARCHITECTURE.md)
- [Labels](LABELS.md)
- [Input and coordinates](INPUT-AND-COORDINATES.md)
- [Testing](TESTING.md)
