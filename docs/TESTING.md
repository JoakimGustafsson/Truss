# Testing

This document consolidates build, smoke, and zoom/banner testing guidance.

## Build validation

From the repository root:

```bash
npm run build
```

This runs the Vite production build.

## Manual smoke test

Run either the frontend dev server:

```bash
npm run dev
```

or the backend server:

```bash
node Node.js\app.js
```

Then verify:

- The app loads.
- A truss/world renders.
- Pan/zoom and selection respond.
- The parameter editor opens for selected objects.
- Save/load paths work when using the backend server.

## Zoom test runner

Start Vite:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/Javascript/Tests/test-zoom-runner.html
```

Use the browser UI to run coordinate, pan, pointer, and banner tests. Check the browser console for detailed output.

## Zoom-independence tests

`Javascript\Tests\zoom-independence.test.js` covers:

- Screen-to-world and world-to-screen round-trip conversion.
- Pan consistency through zoom operations.
- Pointer mapping consistency.
- Banner force/position behavior under zoom.

The historical docs used logarithmic zoom ranges around `10^-14` to `10^14`, with shorter browser defaults in some runners. Extreme zoom failures may be caused by floating-point precision, scale/offset corruption, or force instability.

## Banner position criteria

Historical banner tests checked whether four banner nodes settled into predictable screen regions after about 3 seconds of simulated physics:

| Node | Expected X | Expected Y |
|---|---|---|
| Right top | Near right edge, roughly 98-100% with tolerance | Top band region |
| Left top | Around 70% with tolerance | Top band region |
| Right bottom | Same X region as right top | Lower banner region |
| Left bottom | Same X region as left top | Lower banner region |

Treat the old exact percentages as test harness guidance, not guaranteed current live UI behavior. The live banner implementation uses display-plane nodes with hidden field-tensor gravity from an Earth-scaled banner gravity well. See [Gravity and physics](GRAVITY-AND-PHYSICS.md).

## Interpreting failures

| Symptom | Likely area to inspect |
|---|---|
| Round-trip coordinate errors | `TrussView` conversion math, scale/offset values |
| Pan drift after zoom | `Javascript\View\PanZoomHandler.js` |
| Pointer maps inconsistently | Raw pointer conversion and stored display mouse percentages |
| Banner nodes settle too high/low | Field gravity strength, equilibrium lengths, damping |
| Failures only at extreme zoom | Floating-point precision or force scaling |
| Random/scattered banner nodes | Physics instability, missing mass, excessive force, low damping |

## Running custom test ranges

The test modules expose configurable zoom levels and timing in code. For faster local checks, reduce:

- Zoom level count
- Stabilization time
- Extreme exponent range

For deeper investigation, include the full extreme range and inspect per-level details in the console.

## Documentation-only changes

Markdown-only changes generally do not need a build unless links, scripts, or generated docs are affected.
