# Behavior vs Property Decision Tree

## Quick Reference for Developers

**When adding a new property/behavior to Node or Tensor, use this decision tree:**

```
START: Adding new feature to Node/Tensor?
│
├─ Is this STATIC DATA? (mass, position, name, velocity)
│  └─ YES → Use PROPERTY on object ✅
│
├─ Is this CONFIGURATION? (constant values, coefficients)
│  └─ YES → Use PROPERTY on object ✅
│
├─ Is this BEHAVIOR-RELATED? (type, role, special handling)
│  │
│  ├─ Can it be ON/OFF? (yes/no, has/doesn't have)
│  │  └─ YES → Use LABEL ✅✅✅
│  │
│  ├─ Is it CONDITIONAL LOGIC? (if this, do that differently)
│  │  └─ YES → Use LABEL ✅✅✅
│  │
│  ├─ Is it TYPE IDENTIFICATION? (what kind of node is this?)
│  │  └─ YES → Use LABEL ✅✅✅
│  │
│  └─ Otherwise → Ask before adding ⚠️
│
└─ DONE: Check review checklist below
```

## Decision Matrix

| Feature Type | Property | Label | Why |
|---|---|---|---|
| Mass | ✅ | ❌ | Quantitative value, used in calculations |
| Position | ✅ | ❌ | Coordinate data, needs precision |
| Velocity | ✅ | ❌ | Quantitative vector, used in physics |
| Name | ✅ | ❌ | String identifier |
| Spring Constant | ✅ | ❌ | Numerical parameter |
| **Gravity Exclusion** | ❌ | ✅ | Boolean behavior (has gravity or doesn't) |
| **Node Type** | ❌ | ✅ | Identification (banner, trap, pivot) |
| **Physics Model** | ❌ | ✅ | Behavior (rigid, rope, spring) |
| **UI Element** | ❌ | ✅ | Role (interactive, draggable, clickable) |
| **Special Handling** | ❌ | ✅ | Conditional logic (skip X, do Y) |
| Color | ✅ | ❌ | Rendering data (could be ✅ label if it changes behavior) |
| Visible | ✅ | ✅ | Could be either (currently property, could be label) |
| Script/Program | ✅ | ❌ | Executable code, needs to be evaluated |

## Common Mistakes to Avoid

### ❌ MISTAKE 1: Adding Hidden Flags
```javascript
// DON'T DO THIS:
this.isBannerUINode = true;
this.isPhysical = true;
this.skipGravity = true;
```
**Problem:** Hidden, undiscoverable, scattered checks throughout code
**Solution:** Use labels instead

### ❌ MISTAKE 2: String Pattern Matching Instead of Label API
```javascript
// DON'T DO THIS:
if (node.label?.includes('gravity')) { }
if (node.name?.startsWith('banner_')) { }
if (node.type === 'SPECIAL_NODE_TYPE') { }
```
**Problem:** Fragile, inconsistent with Label system
**Solution:** Use `node.labels?.some(l => l.name === 'labelname')`

### ❌ MISTAKE 3: Conditional Behavior Without Labels
```javascript
// DON'T DO THIS:
if (node.mass === Infinity) { doSpecialThing(); }
if (node.positionFunction) { applyConstraint(); }
if (node.color === 'red') { doBehaviorY(); }
```
**Problem:** Mixes data checks with behavior; unclear intent
**Solution:** Add explicit label for the behavior

### ❌ MISTAKE 4: Checking Multiple Properties for One Behavior
```javascript
// DON'T DO THIS:
if (node.isUI && !node.isPhysical && node.isClickable) { }
```
**Problem:** Multiple related properties; hard to maintain
**Solution:** Single label that captures the combined behavior

## Implementation Checklist

**Before implementing any new behavior:**

- [ ] This is truly BEHAVIOR (not data storage)?
- [ ] Could this be expressed as a label?
- [ ] Is there existing label that covers this?
- [ ] Will this need to be queried ("find all nodes with X")?
- [ ] Is this discoverable in Label.js?
- [ ] Is there only ONE place checking this?
- [ ] Is the check using Label API correctly?
- [ ] Is it documented?

**If you answer YES to most questions → USE A LABEL**

## Code Review Checklist

**When reviewing someone else's code:**

```javascript
// REVIEW: Does this change add a check like this?
if (node.someProperty) { behavior(); }
if (obj.hasFlag) { behavior(); }
if (name.includes('pattern')) { behavior(); }

// If YES, ask:
- [ ] Could this be a label instead?
- [ ] Is there existing label for this?
- [ ] Why isn't this using the Label API?
- [ ] Where else does this same check happen?
- [ ] Is this in Label.js documentation?
```

## Examples: Correct Implementations

### Example 1: Gravity Exclusion (nogravity)

✅ **CORRECT:**
```javascript
// In Label.js:
let nogravityLabel = this.addLabel('nogravity', [nodeLabel], {});

// When creating nodes:
new Node(world, parent, 'node banner nogravity', {})

// In TensorForces.js:
const hasNoGravity = node.labels?.some(label => label.name === 'nogravity');
if (hasNoGravity) return Vector(0, 0);
```

### Example 2: Interactive UI Element

✅ **CORRECT:**
```javascript
// In Label.js:
let interactiveLabel = this.addLabel('interactive', [nodeLabel], {});
let draggableLabel = this.addLabel('draggable', [nodeLabel], {});

// When creating nodes:
new Node(world, parent, 'node interactive draggable', {})

// In input handler:
const isDraggable = node.labels?.some(l => l.name === 'draggable');
if (isDraggable) { enableDragging(node); }
```

### Example 3: Physics Type

✅ **CORRECT:**
```javascript
// In Label.js:
let rigidLabel = this.addLabel('rigid', [nodeLabel], {});
let ropeLabel = this.addLabel('rope', [nodeLabel], {});

// When creating nodes:
new Node(world, parent, 'node rigid', {})

// In physics system:
const physicsType = node.labels
    ?.find(l => ['rigid', 'rope', 'spring'].includes(l.name))
    ?.name || 'default';
applyPhysics(node, physicsType);
```

## When Properties are Acceptable

**Properties are OK for:**
- Numeric values (mass, constant, etc.)
- Vector/Position data
- String identifiers (name, type string for rendering)
- Configuration that doesn't change behavior
- Relationship references (parentNode, connectedTensors)

**Example:**
```javascript
// ✅ FINE - These are data storage, not behavior:
node.mass = 5;
node.localPosition = new Position(10, 20);
node.name = 'my_node';
node.velocityLoss = 0.95;

// ❌ WRONG - These are behavior, not data:
node.skipGravity = true;  // Should be nogravity label
node.isBannerUI = true;    // Should be banner label
node.physicsType = 'rope'; // Should be rope label
```

## Quick Test

**Ask yourself:**
1. "Would changing this property change HOW the node is processed?"
   - YES → Likely a BEHAVIOR, consider LABEL
   - NO → Probably DATA, OK as property

2. "Would it be useful to query 'find all nodes with this'?"
   - YES → Use LABEL (can do: `findLabel().getNodes()`)
   - NO → Probably fine as property

3. "Is this fundamentally about identity/type?"
   - YES → Use LABEL (this is what labels are for)
   - NO → Probably data property

## Need Help?

**If you're unsure:**
1. Check ARCHITECTURE-LABEL-DRIVEN-DESIGN.md
2. Look at existing labels in Label.js for patterns
3. Check LABEL-API-GUIDE.md for usage examples
4. Ask: "Does this determine behavior?"
   - If YES → strongly consider label
5. When in doubt, use labels (they're more discoverable/maintainable)

## Summary

| Ask | Answer | Action |
|---|---|---|
| Is this data/value? | Yes | Property ✅ |
| Is this behavior/type? | Yes | Label ✅✅ |
| Could it be on/off? | Yes | Label ✅✅ |
| Could it be queried? | Yes | Label ✅✅ |
| Is it one of several types? | Yes | Label (one for each type) ✅✅ |
| Is it a numeric value? | Yes | Property ✅ |
| Is it just storage? | Yes | Property ✅ |

**Default to LABELS for anything behavior-related.**
