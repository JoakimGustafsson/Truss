# Gravity Well Connection System - Analysis and Fix

## Current Problem

### Issue 1: Synthetic bannerGravityWell Creation
In `Javascript/View/ParameterEditor/BannerNode.js` (lines 99-103):
```javascript
this.bannerGravityWell = new Node(this.world, this.parentTrussNode, 'node banner nogravity', {
    'localPosition': ...,
    'name': 'bannerGravityWell',
    'nogravity': true,
});
```

**Problems:**
- ❌ Creates a synthetic/fake gravity well node
- ❌ Duplicates Earth (also at -6371000)
- ❌ Wastes resources
- ❌ Shouldn't be in banner node creation

### Issue 2: No Gravity Connections to Bottom Nodes
In `BannerNode.js` (lines 105-119):
- Creates `leftBottomNode` and `rightBottomNode`
- Neither node has gravity field connections
- They won't experience any gravitational force
- Won't hang downward as intended

---

## Current Architecture

### HOW IT WORKS IN ExperimentalTrusses.js

**Gravity connections are EXPLICIT, NOT AUTOMATIC:**

```javascript
// When scene is set up (one time):
new Tensor(trussNode.earth, trussNode.protagonist, 'field', {
    'name': 'gravity',
    'constant': GRAVITY_CONSTANT,
    'visible': 0,
});

// Additional explicit connections for Node A and B:
new Tensor(trussNode.earth, nodeA, 'field', {
    'name': 'gravity-nodeA',
    'constant': GRAVITY_CONSTANT,
    'visible': 0,
});
new Tensor(trussNode.earth, nodeB, 'field', {
    'name': 'gravity-nodeB',
    'constant': GRAVITY_CONSTANT,
    'visible': 0,
});
```

**Key points:**
1. ✅ Each node that needs gravity must have an explicit field tensor
2. ✅ Field tensor connects source (Earth) to target (node)
3. ✅ Constant defines gravity strength
4. ✅ NO automatic system exists
5. ✅ Every connection must be manually created

---

## The Architecture Question

### Is There an Automatic Connection System?

**Answer: NO, there is not.**

When you create a new node:
- Node is created in the world
- Node gets added to world.nodes
- **But NO automatic gravity connections are made**
- You must explicitly create field tensors

**Why?**
- Different nodes may need different gravity strengths
- Some nodes might not want gravity at all (nogravity label)
- Different gravity wells might apply to different regions
- System is flexible and explicit, not automatic

---

## What Should Happen for Banner

### Correct Behavior

```javascript
// In BannerNode.js create() method:

// 1. Create the four nodes
this.nail = new Node(...);
this.leftTopNode = new Node(..., 'node banner moveable nogravity', ...);
this.rightTopNode = new Node(..., 'node banner moveable nogravity', ...);
this.leftBottomNode = new Node(..., 'node banner moveable', ...);    // NO nogravity
this.rightBottomNode = new Node(..., 'node banner moveable', ...);   // NO nogravity

// 2. Create springs/tensors connecting them
this.leftBand = new Tensor(this.leftTopNode, this.nail, 'pullspring', ...);
this.rightBand = new Tensor(this.rightTopNode, this.nail, 'pullspring', ...);
this.leftSpring = new Tensor(this.leftTopNode, this.leftBottomNode, 'spring', ...);
this.rightSpring = new Tensor(this.rightTopNode, this.rightBottomNode, 'spring', ...);

// 3. ❌ REMOVE: Don't create synthetic bannerGravityWell
// this.bannerGravityWell = new Node(...);  // DELETE THIS

// 4. ✅ ADD: Create explicit gravity connections
// Find the Earth node (gravity well)
const earthNode = this.world.labels?.findLabel('gravitywell')?.getNodes()?.[0];
if (earthNode) {
    // Connect bottom nodes to Earth for gravity
    new Tensor(earthNode, this.leftBottomNode, 'field', {
        'name': 'gravity-leftBottom',
        'constant': GRAVITY_CONSTANT,
        'visible': 0,
    });
    
    new Tensor(earthNode, this.rightBottomNode, 'field', {
        'name': 'gravity-rightBottom',
        'constant': GRAVITY_CONSTANT,
        'visible': 0,
    });
} else {
    console.warn('⚠️ No gravity well found. Banner bottom nodes won\'t experience gravity.');
}
```

---

## Comparison: Manual vs Automatic

### Manual System (Current - CORRECT)
```
Node Creation:
  1. Create node with new Node(...)
  2. Add springs/constraints with new Tensor(..., 'spring', ...)
  
Gravity Setup:
  1. Find gravity well (Earth)
  2. Explicitly create field tensor: new Tensor(earth, node, 'field', ...)
  3. Each connection must be explicit
```

**Advantages:**
- ✅ Full control over which nodes experience gravity
- ✅ Different gravity strengths for different nodes
- ✅ Works with nogravity label exclusions
- ✅ Works with moving/multiple gravity wells
- ✅ Clear and explicit - no hidden magic

**Disadvantages:**
- ⚠️ Must remember to add gravity connections
- ⚠️ Easy to forget (like in BannerNode)

### Automatic System (Alternative - NOT implemented)
```
Would require:
  1. When node created: Check for nearby gravity wells
  2. Auto-create field tensors if:
     - Node is moveable
     - Node doesn't have nogravity label
     - Gravity well exists
  3. Easy to use but less flexible
```

---

## Implementation Fix Required

### Change 1: Remove bannerGravityWell (CRITICAL)

**File:** `Javascript/View/ParameterEditor/BannerNode.js`

**Remove lines 99-103:**
```javascript
// ❌ DELETE THIS:
this.bannerGravityWell = new Node(this.world, this.parentTrussNode, 'node banner nogravity', {
    'localPosition': truss.view && truss.view.worldPosition ? truss.view.worldPosition(screenWidth / 2, -6371000) : new Position(screenWidth / 2, -6371000),
    'name': 'bannerGravityWell',
    'nogravity': true,
});
```

### Change 2: Add Gravity Connections to Bottom Nodes (CRITICAL)

**File:** `Javascript/View/ParameterEditor/BannerNode.js`

**After line 154 (after spring creation), add:**
```javascript
// Connect bottom nodes to Earth's gravity well
// These nodes (without nogravity label) should experience gravity
const earthNode = this.world.labels?.findLabel('gravitywell')?.getNodes()?.[0];
if (earthNode) {
    // Get gravity constant (same as used in ExperimentalTrusses)
    const GRAVITY_CONSTANT = -6.67e-11;  // Negative for attraction
    
    this.gravityLeft = new Tensor(earthNode, this.leftBottomNode, 'field', {
        'name': 'gravity-leftBottom',
        'constant': GRAVITY_CONSTANT,
        'visible': 0,
    });
    
    this.gravityRight = new Tensor(earthNode, this.rightBottomNode, 'field', {
        'name': 'gravity-rightBottom',
        'constant': GRAVITY_CONSTANT,
        'visible': 0,
    });
    
    console.log(`✓ Connected bottom banner nodes to gravity well`);
} else {
    console.warn(`⚠️ No gravity well found. Banner won't hang properly.`);
}
```

---

## Why This Architecture?

### Manual Gravity Connections Are Better Because:

1. **Flexibility**
   - Different gravity strengths per node
   - Can disable gravity for specific nodes (nogravity label)
   - Supports moving/multiple gravity wells

2. **Predictability**
   - No hidden auto-connections
   - Explicit what's connected and why
   - Clear physics setup

3. **Label Integration**
   - Works with nogravity label exclusions
   - Can check labels in connection logic
   - Supports future label-based features

4. **Debugging**
   - Can easily see what's connected
   - Query: `world.labels.findLabel('field').getTensors()`
   - Know exactly what gravity applies where

---

## Testing the Fix

### What to verify after fix:

1. **No synthetic bannerGravityWell**
   ```javascript
   const wells = world.labels.findLabel('gravitywell').getNodes();
   // Should only find Earth, not bannerGravityWell
   console.log(wells.map(w => w.name));  // ['earth']
   ```

2. **Bottom nodes have gravity connections**
   ```javascript
   const gravity = world.labels.findLabel('field').getTensors();
   const bottomConnections = gravity.filter(t => 
       t.node1?.name === 'earth' && 
       (t.node2?.name === 'leftBottomNode' || t.node2?.name === 'rightBottomNode')
   );
   console.log(bottomConnections.length);  // Should be 2
   ```

3. **Bottom nodes fall downward**
   - Start app, click to create banner
   - Bottom nodes should move downward over time
   - Top nodes stay anchored (springs + nogravity)

4. **At different zoom levels**
   - Physics should scale correctly
   - Banner should hang consistently

---

## Future Consideration: Auto-Connect System?

If we wanted an automatic system, we could add it:

```javascript
// In World.js or physics system:
// When node added to world:
onNodeAdded(node) {
    // Skip if it has nogravity label
    if (node.labels?.some(l => l.name === 'nogravity')) return;
    
    // Skip if it's not moveable
    if (!node.labels?.some(l => l.name === 'moveable')) return;
    
    // Find nearest gravity well
    const gravityWells = this.labels.findLabel('gravitywell').getNodes();
    if (gravityWells.length > 0) {
        // Auto-create field tensor
        new Tensor(gravityWells[0], node, 'field', {...});
    }
}
```

**But this is NOT currently implemented, and the manual approach is actually better.**

---

## Summary

| Question | Answer |
|----------|--------|
| **Is there automatic gravity connection?** | ❌ NO |
| **Must connections be explicit?** | ✅ YES |
| **Is bannerGravityWell needed?** | ❌ NO - DELETE |
| **Are bottom nodes connected?** | ❌ NO - MUST ADD |
| **How to connect?** | Create Tensor(earth, node, 'field', ...) |
| **Where to add connections?** | BannerNode.js create() method |
| **Can connections be automatic?** | ✅ Could be, but not currently implemented |

### Required Fixes:
1. ✅ Remove `bannerGravityWell` node creation
2. ✅ Add explicit gravity field tensors from Earth to bottom nodes
3. ✅ Verify in running app that bottom nodes fall correctly
