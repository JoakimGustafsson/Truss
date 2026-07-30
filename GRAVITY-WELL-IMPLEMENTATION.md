# Gravity Well Implementation for Banner Physics

## Overview

The banner physics system now uses **real gravitational physics** with movable gravity wells. The banner automatically finds or creates a gravity well and connects all nodes via field tensors that pull them toward it.

**IMPORTANT:** This document uses **world coordinates** (mathematical system). See [COORDINATE-SYSTEMS.md](COORDINATE-SYSTEMS.md) for detailed explanation of world vs. display coordinates.

## Key Features

### 1. Automatic Gravity Well Discovery
The banner searches for existing gravity well nodes in the world:
- Looks for nodes with the `'gravitywell'` label
- If **multiple gravity wells** exist, uses the **closest one**
- If **no gravity well exists**, creates one automatically
- Gravity well nodes have **infinite mass** (immovable)

### 2. Real Gravitational Physics
Uses Newton's law of universal gravitation:
```
F = G × m₁ × m₂ / r²
```

Where:
- **G** = Gravitational constant: 6.67e-11 m³/(kg·s²)
- **m₁** = Mass of gravity well (infinite, acts as fixed source)
- **m₂** = Mass of banner node (1 for top nodes, 3 for bottom nodes)
- **r** = Distance between gravity well and node

### 3. Scaled Physics
Constants are scaled for reasonable forces in world units:
- **Bottom nodes**: `GRAVITY_CONSTANT × 1e15` (strong pull toward gravity well)
- **Top nodes**: `GRAVITY_CONSTANT × 1e14` (weaker pull, mostly held by springs)

### 4. Field Tensor Connections
All banner nodes are connected to the gravity well via **field tensors**:

```javascript
new Tensor(gravityWell, bannerNode, 'field', {
  constant: GRAVITY_CONSTANT * 1e15,
  name: 'gravityFieldTensor'
});
```

This provides directional attraction toward the gravity well.

## Critical: Gravity Well Positioning

**The gravity well MUST be at NEGATIVE Y in world coordinates to pull downward.**

```javascript
// WRONG - Positive Y pulls upward!
gravityWell = new Position(x, y + 50000);

// CORRECT - Negative Y pulls downward!
gravityWell = new Position(x, y - 50000);
```

Why? In world coordinates:
- Positive Y = UP
- Negative Y = DOWN

So gravity well at negative Y creates downward attractive force.

## Implementation Details

### Finding or Creating a Gravity Well

```javascript
_findOrCreateGravityWell(world, referencePosition) {
  // 1. Find all existing gravity wells
  const gravityWells = world.nodes.filter(node => {
    return node.connectedTensors && node.connectedTensors.some(tensor => 
      tensor.labels && tensor.labels.includes('gravitywell')
    );
  });

  // 2. If multiple exist, return the closest one
  if (gravityWells.length > 0) {
    // Find minimum distance gravity well
    // ... distance calculation ...
    return closestWell;
  }

  // 3. If none exist, create one far DOWN (negative Y)
  const gravityWellNode = new Node(
    world,
    null,
    'gravitywell',
    {
      localPosition: new Position(
        referencePosition.x,
        referencePosition.y - 50000  // NEGATIVE Y = DOWN in world coordinates
      ),
      mass: Number.POSITIVE_INFINITY,  // Immovable
      name: 'gravityWell'
    }
  );
  
  world.nodes.push(gravityWellNode);
  return gravityWellNode;
}
```

### Connecting Banner Nodes

In `createTestBanner()`:

```javascript
// Find or create gravity well at banner center (in world coordinates)
const gravityWell = this._findOrCreateGravityWell(
  mockWorld, 
  centerPos
);

// Connect bottom nodes (heavy, pull strongly)
new Tensor(gravityWell, leftBottomNode, 'field', {
  constant: GRAVITY_CONSTANT * 1e15,
});

new Tensor(gravityWell, rightBottomNode, 'field', {
  constant: GRAVITY_CONSTANT * 1e15,
});

// Connect top nodes (light, pull weakly)
new Tensor(gravityWell, leftTopNode, 'field', {
  constant: GRAVITY_CONSTANT * 1e14,
});

new Tensor(gravityWell, rightTopNode, 'field', {
  constant: GRAVITY_CONSTANT * 1e14,
});
```

## Behavior Across Zoom Levels

The physics automatically scale correctly across zoom levels because:

1. **View zoom** adjusts the world view size
2. **Position coordinates** are in world units
3. **Spring and gravity forces** operate in world space
4. **Physics integration** uses consistent time steps

The banner settles to the same physical position regardless of zoom.

## Usage Scenarios

### Scenario 1: Static Gravity Well
```javascript
// Banner creates its own gravity well at negative Y
const banner = createTestBanner(view, zoom);
// Banner hangs downward toward auto-created gravity well
```

### Scenario 2: Existing Gravity Well
```javascript
// If world has a 'gravitywell' node at negative Y
const gravityWell = world.nodes.find(n => 
  n.connectedTensors.some(t => t.labels.includes('gravitywell'))
);

const banner = createTestBanner(view, zoom);
// Banner gravitates toward existing well
```

### Scenario 3: Moving Gravity Well
```javascript
// Move gravity well in world coordinates
gravityWell.setPosition(new Position(x, newNegativeY));

// Banner automatically reorients toward new position
// Physics handles motion naturally
```

### Scenario 4: Multiple Gravity Wells
```javascript
// If multiple gravity wells exist at negative Y
const banner = createTestBanner(view, zoom);
// Banner gravitates toward the CLOSEST one
```

## Physics Constants Tuning

The scale factors can be adjusted:

```javascript
// Stronger gravity (faster settling)
const BOTTOM_GRAVITY_SCALE = 1e16;
const TOP_GRAVITY_SCALE = 1e15;

// Weaker gravity (slower settling)
const BOTTOM_GRAVITY_SCALE = 1e14;
const TOP_GRAVITY_SCALE = 1e13;
```

## Common Issues and Solutions

### Issue: Banner Not Dangling Downward
**Cause:** Gravity well at positive Y (pulling upward!)  
**Fix:** Ensure gravity well Y coordinate is **negative**
```javascript
// Use y - 50000, not y + 50000
```

### Issue: Nodes Barely Moving
**Cause:** Field tensor constants too weak  
**Fix:** Increase scale factors (try 1e16 or higher)

### Issue: Physics Different at Different Zooms
**Cause:** Mixing world and screen coordinates  
**Fix:** Use `node.localPosition` (world) not screen calculations

## Validation Checklist

- [ ] Gravity well positioned at NEGATIVE Y
- [ ] Banner nodes dangle downward (not upward!)
- [ ] Test at zoom 1.0
- [ ] Test at 5+ zoom levels (10^-14 to 10^14)
- [ ] Test moving gravity well
- [ ] Test multiple gravity wells
- [ ] Benchmark performance

## References

- [Coordinate Systems Documentation](COORDINATE-SYSTEMS.md) - Critical reference
- Newton's Law of Universal Gravitation
- Field Physics in Game Engines

## Key Takeaway

**Remember: Gravity well at NEGATIVE Y (down) in world coordinates!**
