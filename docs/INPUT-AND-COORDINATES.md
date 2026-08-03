# Input and coordinates

Truss uses multiple coordinate spaces. Keep them explicit: physics code should operate in world/display/admin coordinates intentionally, and raw browser pointer coordinates should be converted at the boundary.

## Coordinate spaces

| Space | Origin/direction | Used for | Primary references |
|---|---|---|---|
| World | Positive X right, positive Y up | Physics, ordinary nodes/tensors, gravity wells | `Node.localPosition`, `TrussView` conversions |
| Display | Screen-relative percentages; X left-to-right, Y bottom-to-top in helper APIs | Screen-fixed UI such as banners/selectors | `displayCoordinateSystem`, `plane: 'display'` |
| Browser/screen | Top-left origin; positive Y down | Raw mouse/touch/canvas events | `myX`, `myY`, DOM rects |
| Admin | System/backend overlay plane | Non-world system UI | `Plane.js`, `globals.js` |

## World coordinates

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

## Display coordinates

Display coordinates are used for UI that should remain screen-relative. Banner UI nodes currently use display-plane positions such as percentages of the view and `plane: 'display'`.

Do not connect display-coordinate UI objects to world-coordinate physics objects unless the conversion and intended behavior are explicit.

## View conversion

`Javascript\View\TrussView.js` owns conversion between world and screen coordinates through methods such as:

```javascript
worldPosition(screenX, screenY)
x(worldPosition)
y(worldPosition)
```

Use view methods instead of hand-rolled conversion whenever possible.

## Mouse input rule

Display-coordinate mouse percentages are calculated once in `Javascript\main.js` during `mainArea.onmousemove` and stored in globals:

```javascript
displayMousePercentX
displayMousePercentY
```

World-coordinate input still uses raw `myX`/`myY` at the conversion boundary, typically through view methods such as `worldPositionWithOffset(...)`.

Do not duplicate display-coordinate mouse conversion in individual components. For display-plane selection/debug behavior, use the stored display percentages from `Javascript\globals.js`.

## Current display mouse flow

1. `main.js` receives `mousemove`.
2. It stores viewport-relative coordinates in `myX` and `myY`.
3. It computes canvas-relative display percentages from the current view element bounds.
4. It stores those percentages through `setDisplayMousePercent(...)`.
5. Consumers such as `Sensors.js` and `TrussNode.js` use `displayMousePercentX` and `displayMousePercentY`.

## Common mistakes

### Mixing screen Y with world Y

Browser screen Y grows downward; world Y grows upward. Convert before using screen positions in physics.

### Placing world gravity above objects

For downward world gravity, the gravity source should be below the objects:

```javascript
new Position(x, y - 50000);
```

### Pattern-specific pointer math

Avoid duplicating pointer-to-display conversion in individual components. Use `displayMousePercentX` and `displayMousePercentY` for display-plane pointer work.

### Cross-plane physics

Display-plane banner objects and world-plane physics objects use different coordinate semantics. Cross-plane tensors should be treated as architectural decisions, not convenience shortcuts.

## Debugging coordinate issues

1. Identify the source coordinate space: browser screen, display, world, or admin.
2. Identify the target coordinate space.
3. Find the conversion boundary.
4. Check Y-axis direction.
5. Check zoom/pan scale and offsets.
6. Check object `plane`/coordinate-system labels and properties.

Known pan/zoom issues are tracked in [Status](STATUS.md).
