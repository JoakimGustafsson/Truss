# Background Friction Label System

## Overview

The `backgroundfriction` label is a label-driven approach to controlling node damping/friction without hardcoding values. It allows runtime tuning of velocity loss applied to any node each physics frame.

**Architecture Principle:** Behavior (damping control) is specified via labels, not embedded in object code.

---

## Label Definition

**Label Name:** `backgroundfriction`

**Location:** `Label.js` (lines 211-222)

**Default Properties:**
```javascript
{
    'backgroundfriction': 0.99  // Velocity retention factor per frame (0-1)
}
```

**Description:**
- Nodes with this label have tunable friction/damping applied to velocity each frame
- The `backgroundfriction` property represents the fraction of velocity retained
- 0.99 = 1% damping (loses 1% velocity per frame)
- 0.95 = 5% damping (loses 5% velocity per frame)
- 0.9 = 10% damping (loses 10% velocity per frame)
- 1.0 = no damping (free fall - unnatural physics)

---

## How It Works

### Physics Process (Per Frame)

```
Step 1: Calculate forces (springs, gravity, etc.)
Step 2: Calculate acceleration = totalForce / mass
Step 3: Update velocity:
        - Apply damping: velocity *= backgroundfriction
        - Add acceleration: velocity += acceleration × timeFactor
Step 4: Update position: position += velocity × timeFactor
```

### Key Code: Node.js updateVelocity()

```javascript
updateVelocity(forceAppliers, timeFactor, velocityPhase) {
    if (isNaN(this.mass)) return;
    
    // Calculate acceleration from all forces
    let acceleration = this.getAcceleration(forceAppliers, velocityPhase);
    
    // Determine damping factor from label or property
    let velocityLossFactor = this.velocityLoss;  // default
    if (this.labels && Array.isArray(this.labels)) {
        const bgfrictionLabel = this.labels.find(label => label.name === 'backgroundfriction');
        if (bgfrictionLabel && bgfrictionLabel.backgroundfriction !== undefined) {
            velocityLossFactor = bgfrictionLabel.backgroundfriction;
        }
    }
    
    // Apply damping and acceleration
    this.velocity = Vector.addVectors(
        Vector.multiplyVector(velocityLossFactor, this.velocity),
        Vector.multiplyVector(timeFactor, acceleration)
    );
}
```

### Label Priority

1. **If node has `backgroundfriction` label:** Use `label.backgroundfriction` value
2. **Otherwise:** Use `node.velocityLoss` property (fallback)

This allows:
- Nodes with the label to have dynamic, editable damping
- Nodes without the label to use legacy `velocityLoss` property
- Backward compatibility with existing nodes

---

## Banner Implementation

### Bottom Banner Nodes

**File:** `Javascript/View/ParameterEditor/BannerNode.js`

**Node Creation:**
```javascript
this.leftBottomNode = new Node(this.world, this.parentTrussNode, 
    'node banner moveable backgroundfriction',  // ← Has label
    {
        'localPosition': leftBottom_world,
        'name': 'leftBottomNode',
        'mass': 3,
        'color': 'transparent',
        'velocityLoss': 0.99,           // ← Fallback if no label
        'backgroundfriction': 0.99,     // ← Editable property
    }
);
```

**Why This Works:**
- Bottom nodes need to fall with gravity
- High damping (0.9) prevented acceleration
- Now reduced to 0.99 (1% damping) for natural falling
- Property is editable at runtime

### Top Banner Nodes

**Node Creation:**
```javascript
this.leftTopNode = new Node(this.world, this.parentTrussNode, 
    'node banner moveable nogravity',  // ← NO backgroundfriction label
    {
        'localPosition': leftTop_world,
        'name': 'leftTop',
        'mass': 1,
        'velocityLoss': 0.9,    // ← Uses this (no label)
    }
);
```

**Why This Works:**
- Top nodes are anchored by springs, not gravity
- 0.9 damping prevents spring oscillation
- Don't have `backgroundfriction` label
- Use legacy `velocityLoss` property

---

## Using the Background Friction Label

### For Existing Nodes

Apply the label when creating any node that needs tunable damping:

```javascript
const node = new Node(world, truss, 'node moveable backgroundfriction', {
    'name': 'myNode',
    'mass': 5,
    'backgroundfriction': 0.99,
});
```

### For New Labels/Behaviors

Follow this pattern:

1. **Define in Label.js:**
   ```javascript
   let myBehaviorLabel = this.addLabel('mybehavior', [nodeLabel], {
       'myProperty': someValue,
   });
   ```

2. **Apply in code:**
   ```javascript
   new Node(world, truss, 'node mybehavior', {
       'myProperty': someValue,
   });
   ```

3. **Use in physics:**
   ```javascript
   const myLabel = this.labels.find(l => l.name === 'mybehavior');
   if (myLabel && myLabel.myProperty !== undefined) {
       // Use myLabel.myProperty
   }
   ```

---

## Runtime Editing

When a node with the `backgroundfriction` label is selected in the UI:

1. The parameter editor displays all node properties
2. The `backgroundfriction` property appears as editable field
3. Change value 0.0-1.0 to adjust damping in real-time
4. Physics engine reads new value every frame

**Effect of Changing Value:**
- **Increase to 1.0:** Less damping → faster falling
- **Decrease to 0.5:** More damping → slower falling
- **Set to 0.0:** Maximum damping → barely moves

---

## Comparison: Before vs After

### Before (Hardcoded)

**BannerNode.js:**
```javascript
this.leftBottomNode = new Node(..., {
    'velocityLoss': 0.9,  // ← Hardcoded, not editable
});
```

**Problems:**
- Value is hardcoded in source code
- Change requires recompile
- No runtime tuning possible
- Can't adjust per-instance
- Top and bottom nodes forced to same damping

### After (Label-Driven)

**BannerNode.js:**
```javascript
this.leftBottomNode = new Node(..., 'node banner moveable backgroundfriction', {
    'backgroundfriction': 0.99,  // ← Editable property
});
```

**Benefits:**
- ✅ Value is editable at runtime
- ✅ Different nodes can have different damping
- ✅ Behavior specified via labels (architectural principle)
- ✅ Easy to experiment with physics parameters
- ✅ No recompile needed
- ✅ Each instance can be tuned independently

---

## Testing

### Verify Label Exists

```javascript
const bgfrictionLabel = world.labels.findLabel('backgroundfriction');
console.log(bgfrictionLabel);  // Should not be null
console.log(bgfrictionLabel.backgroundfriction);  // Should be 0.99
```

### Check Node Has Label

```javascript
const node = world.nodes.find(n => n.name === 'leftBottomNode');
const hasLabel = node.labels.some(l => l.name === 'backgroundfriction');
console.log(hasLabel);  // Should be true
```

### Monitor Velocity

```javascript
// Add to Node.updateVelocity():
if (this.name === 'leftBottomNode') {
    console.log(`Velocity: (${this.velocity.x.toFixed(2)}, ${this.velocity.y.toFixed(2)})`);
}
```

### Check Physics Result

1. Create banner by clicking
2. Select bottom node in parameter editor
3. Change `backgroundfriction` from 0.99 to different values
4. Observe falling speed changes:
   - 0.99: Fast natural fall
   - 0.95: Moderate fall
   - 0.90: Slow fall (original heavy damping)

---

## Common Issues

### Property Not Showing in Editor

**Problem:** `backgroundfriction` property doesn't appear in parameter editor

**Causes:**
1. Node doesn't have `backgroundfriction` label
2. Node wasn't created with the property defined
3. Parameter editor not refreshing

**Solution:**
```javascript
// Ensure node creation includes:
new Node(world, truss, 'node banner moveable backgroundfriction', {
    'backgroundfriction': 0.99,  // Must be included
});
```

### Value Not Affecting Physics

**Problem:** Changing `backgroundfriction` doesn't change falling speed

**Causes:**
1. Node doesn't have the label (uses `velocityLoss` instead)
2. Physics update not reading the property
3. Very small mass compared to gravity force

**Solution:**
```javascript
// Check in console:
const node = world.nodes.find(n => n.name === 'leftBottomNode');
console.log('Has backgroundfriction label?', 
    node.labels.some(l => l.name === 'backgroundfriction'));
console.log('Label value:', 
    node.labels.find(l => l.name === 'backgroundfriction')?.backgroundfriction);
```

---

## Integration with Other Labels

### With `nogravity` Label

```javascript
// Mutually exclusive: a node should have one or the other

// Top banner nodes: no gravity, use normal damping
new Node(world, truss, 'node banner moveable nogravity', {
    'velocityLoss': 0.9,  // ← Uses this
});

// Bottom banner nodes: has gravity, use backgroundfriction
new Node(world, truss, 'node banner moveable backgroundfriction', {
    'backgroundfriction': 0.99,  // ← Uses this for less damping
});
```

### With Other Physics Labels

```javascript
// A node can have multiple labels
new Node(world, truss, 'node banner moveable backgroundfriction spring-attached', {
    'backgroundfriction': 0.99,  // Controls damping
    'equilibriumLength': 10.8,    // Spring parameter
});
```

---

## Future Extensions

### Possible Enhancements

1. **Direction-specific damping:** Separate X and Y damping
   ```javascript
   'backgroundfrictionX': 0.99,
   'backgroundfrictionY': 0.90,  // More damping on Y axis
   ```

2. **Speed-dependent damping:** Higher damping at high speeds
   ```javascript
   'backgroundfrictionLow': 0.99,   // At low speed
   'backgroundfrictionHigh': 0.80,  // At high speed
   ```

3. **Time-ramping:** Gradually change damping over time
   ```javascript
   'backgroundfrictionStart': 0.9,
   'backgroundfrictionEnd': 0.99,
   'backgroundfrictionDuration': 5000,  // ms
   ```

---

## See Also

- **ARCHITECTURE-LABEL-DRIVEN-DESIGN.md** - Complete principle documentation
- **Label.js** - All label definitions
- **Node.js** - Physics update methods
- **BannerNode.js** - Banner node implementation
- **TensorForces.js** - Force calculation behaviors
