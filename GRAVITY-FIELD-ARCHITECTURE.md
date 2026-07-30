# Gravity Field Connection Architecture

## Overview
The Truss physics system uses **field tensors** to model gravitational attraction between objects. This document explains how gravity flows from Earth to the banner nodes in the default scene.

## Gravity Well Concept
- **Earth** is the gravity well (node with label 'gravitywell')
- Located at: `(0, -6371e3)` - far below all other nodes
- Mass: `5.97219e24` kg (realistic Earth mass)
- Gravity constant: `-6.67e-11` (negative for attractive force)

## Field Tensor Connections

### Default Scene (ExperimentalTrusses.js)
The banner system is pulled by gravity from Earth through field tensors:

```
Earth (Gravity Well)
├── Field Tensor → Protagonist (mass: 70)
├── Field Tensor → Node A (mass: 20) [ADDED]
└── Field Tensor → Node B (mass: 20) [ADDED]

All use constant: GRAVITY_CONSTANT (-6.67e-11)
All marked as invisible (visible: 0)
```

### Architecture Diagram
```
        Node A ═══════ Node B
           ║           ║
         (20)        (20)    Top nodes
           ║           ║
           ║           ║
           └─ Protagonist ─┘
                 (70)      Center node
                  │
                 [gravity field connections]
                  ↓
                  ↓
           Earth (Gravity Well)
          at (0, -6371e3)
          Mass: 5.97219e24
```

## Field Tensor Properties

| Property | Value | Purpose |
|----------|-------|---------|
| `node1` | Earth | Gravity source |
| `node2` | Moveable node | Gravity target |
| `type` | 'field' | Field tensor classification |
| `constant` | -6.67e-11 | Gravitational constant |
| `visible` | 0 | Hidden from display |
| `name` | 'gravity', 'gravity-nodeA', 'gravity-nodeB' | Identification |

## Force Direction (Physics)
```
Force Calculation (from TensorForces.js):
force = -(constant * m1 * m2 / r²) * direction_vector

With our values:
- constant = -6.67e-11 (NEGATIVE)
- Negation: -(-6.67e-11) = +6.67e-11
- Result: POSITIVE force = ATTRACTION (objects pull together)

Direction: Always toward Earth (at negative Y)
Effect: Nodes fall downward toward Earth
```

## Coordinate System Reference
```
World Coordinates (Mathematical Convention):
  Y
  ↑
  │ Positive Y = UP
  │
  └────────→ X
     Positive X = RIGHT

Negative Y = DOWN (where Earth is located)

Display Coordinates (Screen):
  Top of Screen
     ↓
     → Positive Y = DOWN (toward bottom of screen)
     → Negative Y = UP (toward top of screen)
```

## Default Scene Node Positions

| Node | Position | Mass | Function |
|------|----------|------|----------|
| Earth | (0, -6371e3) | ∞ | Gravity well (immovable) |
| Protagonist | (4, 3) | 70 | Center node |
| Node A | (3, 5) | 20 | Left node |
| Node B | (6, 5) | 20 | Right node |
| Anchor Left | (2, 8) | NaN | Fixed point |
| Anchor Right | (7, 8) | NaN | Fixed point |

All banner nodes start at **positive Y** (above Earth) and fall toward negative Y (toward Earth).

## Spring Constraints Complementing Gravity

While gravity pulls downward, springs provide:
- Tension to keep banner taut
- Equilibrium length to control drape
- Dampening to prevent oscillation

### Spring Network
```
Anchor Left ─────────[damped spring]───────── Node A
   (fixed)           (constant: 180)          (mass: 20)
                     (dampening: 1.2)              │
                                                  [spring]
                                            (constant: 600)
                                                   │
Anchor Right ────────[damped spring]───────── Node B
   (fixed)          (constant: 180)          (mass: 20)
                    (dampening: 1.2)
```

## Physics Simulation Flow

1. **Gravity Phase:** Each node experiences pull from Earth via field tensor
   - Force ∝ (mass_node × mass_earth) / distance²
   - Direction: Toward Earth (downward)

2. **Spring Phase:** Springs between nodes apply forces
   - Tension pulls nodes together
   - Springs maintain banner structure

3. **Integration Phase:** Positions and velocities updated
   - Euler integration: position += velocity × time
   - Velocity damping: velocity *= velocityLoss

4. **Result:** Nodes find equilibrium position
   - Gravity pulls down
   - Springs hold them in place
   - Creates natural hanging banner effect

## Why Three Gravity Connections?

The three gravity field tensors distribute gravitational force:

| Connection | Node | Role | Effect |
|------------|------|------|--------|
| Earth → Protagonist | Center | Stabilizer | Keeps banner centered |
| Earth → Node A | Left | Draper | Pulls left edge down |
| Earth → Node B | Right | Draper | Pulls right edge down |

With only Protagonist connected, the banner would swing as a rigid unit. With all three connected, the banner drapes naturally.

## Performance Characteristics

**Field Tensor Calculation:** O(1) per connection
- No iteration needed
- Simple distance calculation
- Direct force application

**Total Gravity Calculations per Frame:**
- 3 field tensors × 1 calculation each = 3 operations
- Negligible CPU cost
- Efficient for real-time simulation

## Test Implementation

In the zoom-independence test, the `createTestBanner()` method creates similar connections:
```javascript
const gravityWell = world.labels.findLabel('gravitywell').getNodes()[0];

new Tensor(gravityWell, leftBottomNode, 'field', {
    constant: GRAVITY_SCALE_LARGE,
    name: 'leftBottomGravity',
});

new Tensor(gravityWell, rightBottomNode, 'field', {
    constant: GRAVITY_SCALE_LARGE,
    name: 'rightBottomGravity',
});

new Tensor(gravityWell, leftTopNode, 'field', {
    constant: GRAVITY_SCALE_SMALL,
    name: 'leftTopGravity',
});

new Tensor(gravityWell, rightTopNode, 'field', {
    constant: GRAVITY_SCALE_SMALL,
    name: 'rightTopGravity',
});
```

Note: Test uses different constants than default scene to optimize for different zoom levels.

## Visibility and Display

All gravity field tensors are marked as `visible: 0` because:
- Gravity fields are invisible forces in physics
- Visual clutter would confuse the display
- Springs already show the physical structure
- Field connections are implicit in the behavior

## Debugging Gravity Issues

If nodes don't fall as expected:

1. **Check field tensor exists:**
   ```javascript
   const field = earth.connectedTensors.find(t => t.labels.some(l => l.name === 'field'));
   console.log('Has gravity field:', field ? true : false);
   ```

2. **Check gravity constant sign:**
   - Must be NEGATIVE (-6.67e-11)
   - Positive value causes repulsion (objects fly apart)

3. **Check Earth position:**
   - Must be at NEGATIVE Y (e.g., -6371e3)
   - Positive Y pulls upward (wrong direction)

4. **Check node masses:**
   - Must be finite and > 0 for moveable nodes
   - NaN mass = immovable (won't respond to gravity)

5. **Verify Label API usage:**
   - Use `world.labels.findLabel('gravitywell').getNodes()`
   - Not pattern matching: `node.label.includes('gravitywell')`

## Summary

✅ Earth creates gravitational pull on three nodes (Protagonist, Node A, Node B)  
✅ Field tensors implement Newtonian gravity (F = G × m1 × m2 / r²)  
✅ Negative gravity constant produces attractive force  
✅ Nodes at positive Y fall toward Earth at negative Y  
✅ Springs provide structure and equilibrium  
✅ Result: Natural hanging banner physics  
