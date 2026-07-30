# Coordinate Systems Reference

## Critical: Two Coordinate Systems

The Truss engine uses **TWO DIFFERENT COORDINATE SYSTEMS** that must not be confused:

### 1. World Coordinates (Mathematical/Physics Space)
**This is what we discuss most often when talking about physics, positions, and gravity.**

```
    Y axis (UP)
    ↑
    |
    | (0, positive Y)
    |
    +----------→ X axis (RIGHT)
   (0,0)
    (origin at lower-left corner)
    |
    | (0, negative Y)
    ↓
```

- **Origin**: Lower-left corner of the world
- **X-axis**: Increases to the RIGHT (positive direction)
- **Y-axis**: Increases UPWARD (positive direction)
- **Down direction**: Negative Y values
- **Used for**: Physics calculations, spring forces, gravity, node positions
- **Reference**: `Node.localPosition`, `Tensor` equilibrium lengths, physics vectors

**Key Constants in World Coordinates:**
```javascript
EARTH_CENTER = new Position(0, 6371e3);  // POSITIVE Y = far UP (incorrect for gravity!)
// Should be:
GRAVITY_WELL = new Position(0, -50000); // NEGATIVE Y = far DOWN (correct for gravity!)
```

### 2. Display Coordinates (Screen Space)
**This is what's rendered on screen - standard browser graphics coordinates.**

```
  X axis (RIGHT) →
  |
  | (0, 0)
  | (origin at top-left corner)
  ↓
  Y axis (DOWN)
```

- **Origin**: Top-left corner of the screen
- **X-axis**: Increases to the RIGHT (positive direction)
- **Y-axis**: Increases DOWNWARD (positive direction)
- **Down direction**: Positive Y values
- **Used for**: Screen rendering, DOM positioning, mouse events
- **Reference**: Canvas drawing, `view.x()`, `view.y()` methods

## Coordinate Conversion

The `View` class in `TrussView.js` handles conversion between these systems:

```javascript
// Convert from display (screen) to world coordinates
worldPosition(screenX, screenY) {
  return new Position(
    screenX * this.xScale + this.offset.x,
    screenY * this.yScale + this.offset.y
  );
}

// Convert from world to display (screen) coordinates
x(worldPosition) { return (worldPosition.x - this.offset.x) / this.xScale; }
y(worldPosition) { return (worldPosition.y - this.offset.y) / this.yScale; }
```

Note: The conversion is **linear** - Y is not flipped! This means:
- The view has an offset that positions the world view within the canvas
- Zooming changes the scale (xScale, yScale) but not the axis direction
- A node at world Y=100 will have a smaller screen Y than a node at world Y=50 (because it's higher up)

## Common Mistakes

### ❌ Mistake 1: Forgetting Y-axis Direction
```javascript
// WRONG - Places gravity well at top (positive Y)
const gravityWell = new Position(x, y + 50000);

// CORRECT - Places gravity well at bottom (negative Y)
const gravityWell = new Position(x, y - 50000);
```

### ❌ Mistake 2: Confusing with Screen Coordinates
```javascript
// WRONG - Thinking positive Y is down
new Position(100, 200); // Assuming this is lower on screen

// CORRECT - Positive Y is actually UP
new Position(100, 200); // This is 200 units UP from origin
```

### ❌ Mistake 3: Not Converting Between Systems
```javascript
// WRONG - Using screen Y directly in physics
const bannerWorldPos = banner.localPosition;
const screenY = canvas.offsetHeight / 2;
bannerWorldPos.y = screenY;  // Mixing systems!

// CORRECT - Convert through view
const screenPos = { x: canvas.offsetWidth * 0.5, y: canvas.offsetHeight * 0.5 };
const worldPos = view.worldPosition(screenPos.x, screenPos.y);
```

## Practical Examples

### Example 1: Create a Gravity Well Below the Banner
```javascript
// Banner center in world coordinates
const bannerWorldPos = new Position(100, 50);

// Gravity well BELOW means NEGATIVE Y
const gravityWell = new Node(world, null, 'gravitywell', {
  localPosition: new Position(
    bannerWorldPos.x,           // Same X
    bannerWorldPos.y - 10000    // Large negative Y (down)
  ),
  mass: Number.POSITIVE_INFINITY,
  name: 'gravityWell'
});
```

### Example 2: Banner Nodes Dangle Downward
For nodes to dangle toward gravity well at negative Y:

```javascript
// Create field tensor pulling nodes downward
new Tensor(gravityWell, bannerNode, 'field', {
  constant: GRAVITY_CONSTANT * 1e15,
  // This creates attractive force toward gravity well
  // Node at world Y=50 will be pulled toward world Y=-50000
  // Result: Node appears to dangle downward
});
```

### Example 3: Earth Positioning (ExperimentalTrusses.js)
```javascript
// Current (INCORRECT for visual gravity):
EARTH_CENTER = new Position(0, 6371e3);  // Far UP - gravity pulls UP!

// Should be for proper downward gravity:
EARTH_CENTER = new Position(0, -6371e3); // Far DOWN - gravity pulls DOWN
```

## Summary Table

| Aspect | World Coordinates | Display Coordinates |
|--------|-------------------|-------------------|
| **Origin** | Lower-left | Top-left |
| **X increases** | Rightward | Rightward |
| **Y increases** | Upward | Downward |
| **Down direction** | Negative Y | Positive Y |
| **Used for** | Physics, gravity | Screen rendering |
| **Key methods** | Node.localPosition | view.x(), view.y() |
| **Example: Gravity well** | Position(0, -50000) | Position(0, [calc from view]) |

## When in Doubt

**Always think in world coordinates (mathematical).**
- When placing physics objects, use world coordinates
- When specifying positions in code, assume world coordinates
- Only convert to/from display coordinates at the boundary (View methods)
- Gravity pulls toward NEGATIVE Y
- "Down" means negative Y

## Related Files

- `Javascript/View/TrussView.js` - Coordinate conversion methods
- `Javascript/Nodes/Node.js` - Uses world coordinates for localPosition
- `Javascript/Tensors.js` - Spring/field forces use world coordinates
- `Javascript/Tests/zoom-independence.test.js` - Banner test uses world coordinates
