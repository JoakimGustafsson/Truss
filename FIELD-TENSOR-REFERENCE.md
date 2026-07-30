# Field Tensor Reference

## Overview
Field tensors in Truss simulate force fields like gravity, magnetism, or repulsion. They calculate forces between two nodes based on their masses and distance.

## The Critical Sign Rule

### Constant Sign Determines Force Direction

**POSITIVE constant = REPULSION (pushes apart)**
```
Nodes repel each other
Force points AWAY from target node
Objects are pushed apart
Example: magnetic repulsion, collision avoidance
```

**NEGATIVE constant = ATTRACTION (pulls together)**
```
Nodes attract each other
Force points TOWARD target node
Objects are pulled together
Example: gravity, magnetic attraction
```

### Why the Sign Matters
Field tensors use this calculation:
```
force = -(constant × m1 × m2 / r²) × direction_toward_target

Where:
- constant = field strength (positive or negative)
- m1, m2 = masses of the two nodes
- r = distance between nodes
- direction = unit vector from source to target
- The first negative sign = part of the calculation
```

The **first minus sign is always applied**, so:
- If constant is **+6.67e-11** → force = -(+6.67e-11) × ... = **negative** = **REPULSION**
- If constant is **-6.67e-11** → force = -(-6.67e-11) × ... = **positive** = **ATTRACTION**

## Gravity Implementation

### Correct Setup
```javascript
const GRAVITY_CONSTANT = -6.67e-11;  // NEGATIVE constant for attraction

new Tensor(gravityWell, node, 'field', {
    'name': 'gravity',
    'constant': GRAVITY_CONSTANT,  // Use negative!
    'visible': 0,
});
```

### Why Negative Gravity Constant?
1. Gravity pulls objects DOWN toward Earth
2. A NEGATIVE constant produces ATTRACTIVE force
3. Newton's law: F = -G × m1 × m2 / r²
4. The system applies another negation, making the final force attractive

### Common Mistake
```javascript
// WRONG - objects will fall UP!
const GRAVITY_CONSTANT = 6.67e-11;  // Positive = repulsion

// CORRECT - objects fall DOWN
const GRAVITY_CONSTANT = -6.67e-11;  // Negative = attraction
```

## Coordinate System Integration

### World Coordinates (where physics happens)
- Positive Y = UP
- Negative Y = DOWN
- Gravity well at NEGATIVE Y (e.g., -6371e3)
- Objects start at POSITIVE Y (above Earth)
- Negative gravity constant pulls them DOWN toward negative Y

### Force Direction Math
For a node falling toward Earth:
```
Node position:     (0, +100)  [above Earth]
Earth position:    (0, -6371e3)  [far below]
Direction vector:  (0, -6371e3 - 100) = (0, -6371e3.1)
Normalized:        (0, -1.0)  [points DOWN]
Gravity constant:  -6.67e-11  [negative]
Force:             -(−6.67e-11) × ... × (0, -1) = UPWARD ATTRACTION toward Earth
                   Which pulls node DOWN (in negative Y direction)
```

## Testing Your Field
If objects are moving the wrong direction:

1. **Check constant sign**
   ```javascript
   // You probably need this
   'constant': -6.67e-11  // Negative
   
   // Not this
   'constant': 6.67e-11   // Positive
   ```

2. **Check target node position**
   ```javascript
   // If target is at positive Y, node will move toward it
   // If target is at negative Y, node will move toward it
   // (Direction is always toward the other node)
   ```

3. **Check field tensor direction**
   ```javascript
   // Field(source, target) pulls target toward source
   new Tensor(earthNode, characterNode, 'field', {...})
   // characterNode will be pulled toward earthNode
   ```

## Field vs Spring vs Other Tensors

| Tensor Type | Formula | Constant Sign | Use Case |
|------------|---------|----------------|----------|
| **Field** | F = -G·m1·m2/r² | - (negative) for attraction | Gravity, magnetism |
| **Spring** | F = -k·(x - x₀) | + (positive) always | Elastic forces, damping |
| **Pull Spring** | F = -k·(x - x₀) | + (positive) always | One-way pull |
| **Absorber** | F = -k·(x - x₀) - c·v | + (positive) always | Damped springs |

## Performance Notes

- Field tensors are more expensive than springs (O(1/r²) vs linear)
- Use for long-range forces (gravity, magnetism)
- Springs better for local constraints
- Multiple gravity wells: node feels attraction from all of them

## Documentation References

- **COORDINATE-SYSTEMS.md** - World vs display coordinates
- **GRAVITY-WELL-IMPLEMENTATION.md** - Gravity well setup and discovery
- **ExperimentalTrusses.js** - Example implementation with comments
