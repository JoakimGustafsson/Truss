# Gravity Label System - nogravity Label Architecture

## Overview
The Truss system now uses a label-based system to control which nodes are affected by gravity. This replaced the previous `isBannerUINode` flag with a proper Label API approach.

## The Problem We Solved

**Previous Approach:**
- Used `isBannerUINode` boolean flag on nodes
- Ad-hoc property, not part of label system
- Hard to discover, maintain, or extend
- Created synthetic gravity wells to avoid gravity affecting banner

**New Approach:**
- Uses `nogravity` label from Label.js
- Proper Label API: `world.labels.findLabel('nogravity')`
- Nodes can have multiple labels
- Gravity calculation explicitly checks label

## Label System

### New Labels

| Label | Type | Purpose | Inherits From |
|-------|------|---------|----------------|
| `nogravity` | Node | Nodes excluded from gravity fields | node |
| `banner` | Node | Banner UI system nodes | node |

### Creating Nodes with Labels

```javascript
// Top node - excluded from gravity (springs hold it up)
new Node(world, parent, 'node banner moveable nogravity', {
    name: 'leftTop',
    mass: 1,
    velocityLoss: 0.9,
});

// Bottom node - receives gravity (allowed to hang)
new Node(world, parent, 'node banner moveable', {
    name: 'leftBottom',
    mass: 3,
    velocityLoss: 0.9,
});
```

Note: Bottom nodes do NOT have `nogravity` label, so they receive gravity!

## Banner Node Architecture

### Node Labeling Strategy

```
Banner Structure:
├── Nail (fixed point at top)
│   Label: 'node banner nogravity' ← EXCLUDED FROM GRAVITY
│   Role: Anchor point, doesn't move
│
├── Left Top Node
│   Label: 'node banner moveable nogravity' ← EXCLUDED FROM GRAVITY
│   Role: Held by springs to nail
│
├── Right Top Node
│   Label: 'node banner moveable nogravity' ← EXCLUDED FROM GRAVITY
│   Role: Held by springs to nail
│
├── Left Bottom Node
│   Label: 'node banner moveable' ← RECEIVES GRAVITY
│   Role: Hangs down under gravity
│
└── Right Bottom Node
    Label: 'node banner moveable' ← RECEIVES GRAVITY
    Role: Hangs down under gravity
```

### Why This Design?

1. **Top nodes (nogravity):**
   - Springs pull them toward the nail
   - Without nogravity label, they'd fall down, defeating the banner structure
   - Gravity would fight the springs and cause oscillation

2. **Bottom nodes (no nogravity):**
   - Free to receive gravity field connections from Earth
   - Gravity pulls them downward
   - Creates the draping/hanging effect
   - Springs provide shape while gravity provides the drape

## Gravity Field Connections

With the new system, the physics setup is:

```
Earth (Gravity Well)
├── Field → Protagonist (in default scene)
├── Field → Node A (in default scene)
├── Field → Node B (in default scene)
└── Field → leftBottomNode (banner)
    Field → rightBottomNode (banner)

All bottom nodes fall toward Earth:
TOP nodes: Held by springs (nogravity prevents unnecessary gravity)
BOTTOM nodes: Fall under gravity (creates hanging effect)
```

## TensorForces.js Implementation

The FieldCalculator now checks for the `nogravity` label:

```javascript
// Skip field calculations for nodes marked with 'nogravity' label
const hasNoGravity1 = this.node1.labels && this.node1.labels.some(label => label.name === 'nogravity');
const hasNoGravity2 = this.node2.labels && this.node2.labels.some(label => label.name === 'nogravity');

if (hasNoGravity1 || hasNoGravity2) {
    return new Vector(0, 0);  // Skip gravity calculation
}
```

## Label Query Pattern

To find all nodes excluded from gravity:

```javascript
// Using Label API (CORRECT)
const noGravityLabel = world.labels.findLabel('nogravity');
const noGravityNodes = noGravityLabel.getNodes();

// To check if a node has nogravity label:
const hasNoGravity = node.labels && node.labels.some(label => label.name === 'nogravity');

// NOT using string matching (WRONG - don't do this!)
const hasNoGravity = node.label && node.label.includes('nogravity');  // ❌ DON'T
```

## Benefits of Label-Based System

1. **Discoverable:** Labels are defined in Label.js, easy to find and document
2. **Extensible:** Easy to add more gravity-related labels in future
3. **Maintainable:** No hidden flags scattered in code
4. **Queryable:** Can find all nogravity nodes with Label API
5. **Consistent:** Uses same pattern as other physics properties (moveable, field, spring, etc.)

## Migration from isBannerUINode

### Old Code
```javascript
// Creating nodes with isBannerUINode flag
new Node(world, parent, 'node banner', {
    name: 'topNode',
    isBannerUINode: true,  // Hidden flag, not discoverable
});

// Checking in TensorForces.js
if (this.node1?.isBannerUINode || this.node2?.isBannerUINode) {
    return new Vector(0, 0);
}
```

### New Code
```javascript
// Creating nodes with nogravity label
new Node(world, parent, 'node banner moveable nogravity', {
    name: 'topNode',
});

// Checking in TensorForces.js
const hasNoGravity1 = node1.labels?.some(label => label.name === 'nogravity');
const hasNoGravity2 = node2.labels?.some(label => label.name === 'nogravity');
if (hasNoGravity1 || hasNoGravity2) {
    return new Vector(0, 0);
}
```

## Physics Flow with New System

1. **Scene Creation** (ExperimentalTrusses.js or BannerNode.js)
   - Create Earth node with 'gravitywell' label
   - Create banner nodes with appropriate labels
   - Top nodes: 'nogravity' label
   - Bottom nodes: NO 'nogravity' label

2. **Gravity Field Setup**
   - Create field tensors from Earth to moveable nodes
   - Field tensors can connect to ANY moveable node
   - FieldCalculator checks if target has 'nogravity' label

3. **Physics Simulation (each frame)**
   - For each field tensor:
     - Check: Does either node have 'nogravity' label?
     - If yes: Return zero force (skip calculation)
     - If no: Calculate field force normally
   - Apply forces to nodes without 'nogravity' label
   - Result: Bottom nodes fall, top nodes stay anchored

## Future Extensions

The label system makes it easy to add variations:

```javascript
// Example: Create a "free fall" banner variant
const freeformBannerNode = new Node(world, parent, 'node banner moveable', {
    name: 'freeBottomNode',
    // No 'nogravity' label - fully affected by gravity
    // Could fall faster or in different pattern
});

// Example: Special "hover" nodes that resist gravity
const hoverNode = new Node(world, parent, 'node banner hover', {
    name: 'levitatingNode',
    // 'hover' label could have special handling:
    // - Reduced gravity constant
    // - Different force calculation
    // - Opposing upward force
});
```

## Debugging Gravity Issues

### Check if node has nogravity label
```javascript
const hasNoGravity = node.labels?.some(l => l.name === 'nogravity');
console.log(`Node "${node.name}" has nogravity:`, hasNoGravity);
```

### Check all nodes with nogravity label
```javascript
const noGravityLabel = world.labels.findLabel('nogravity');
console.log('Nodes without gravity:', noGravityLabel.getNodes().map(n => n.name));
```

### Verify gravity field connection
```javascript
const node = world.labels.findLabel('moveable').getNodes()[0];
const gravityFields = node.connectedTensors.filter(t => 
    t.labels && t.labels.some(l => l.name === 'field')
);
console.log(`Node "${node.name}" gravity fields:`, gravityFields.length);
```

### Expected output for banner
```
✓ Top nodes (leftTop, rightTop): no gravity fields (nogravity label)
✓ Bottom nodes (leftBottomNode, rightBottomNode): have gravity fields
✓ TensorForces calculates gravity for bottom nodes only
✓ Bottom nodes fall toward Earth
```

## Summary

The `nogravity` label system:
- ✅ Replaces isBannerUINode flag with proper Label API
- ✅ Enables selective gravity control at node level
- ✅ Allows bottom banner nodes to fall toward Earth
- ✅ Keeps top nodes anchored by springs (not gravity)
- ✅ Follows architectural patterns
- ✅ Discoverable and extensible for future use
