# Label-Driven Design: Quick Reference for Truss Architecture

## The Core Principle

**Behavior should be governed by labels on nodes and tensors, not embedded in their object code.**

This is a fundamental architectural decision for the Truss physics engine. Before adding any behavior to Node or Tensor classes, **always ask first and consider if a label could be used instead**.

## Why This Matters

### The Problem We Solved
```javascript
// ❌ OLD WAY - Hidden, scattered, undiscoverable
class Node {
    constructor() {
        this.isBannerUINode = true;  // What does this do? Where is it checked?
    }
}

// Then scattered throughout codebase:
if (node.isBannerUINode) { skipGravity(); }
if (this.node1?.isBannerUINode) { return Vector(0,0); }
if (node.isBannerUINode) { doSpecialThing(); }
```

### The Solution We Implemented
```javascript
// ✅ NEW WAY - Central, discoverable, queryable
// In Label.js - ONE place to define it:
let nogravityLabel = this.addLabel('nogravity', [nodeLabel], {
    description: 'Nodes excluded from gravity fields'
});

// In behavior code - CONSISTENT pattern:
const hasNoGravity = node.labels?.some(label => label.name === 'nogravity');
if (hasNoGravity) { return Vector(0, 0); }

// Can query all nodes with this behavior:
const noGravityNodes = world.labels.findLabel('nogravity').getNodes();
```

## Decision Tree: Property vs Label

When you need to add something to Node or Tensor:

```
Is it BEHAVIOR/TYPE?      YES → Use LABEL ✅✅
   ├─ On/off state?       YES → Use LABEL ✅
   ├─ Type identification? YES → Use LABEL ✅
   ├─ Conditional logic?   YES → Use LABEL ✅

Is it DATA/VALUE?         YES → Use PROPERTY ✅
   ├─ Numeric value?      YES → Use PROPERTY
   ├─ Vector data?        YES → Use PROPERTY
   ├─ Identifier string?   YES → Use PROPERTY
```

## How to Add New Behavior

**Step 1: Define Label in Label.js**
```javascript
let myBehaviorLabel = this.addLabel('mybehavior', [nodeLabel], {
    description: 'Description of what this behavior does',
});
```

**Step 2: Use in Node/Tensor Creation**
```javascript
const node = new Node(world, parent, 'node mybehavior', {
    name: 'example',
});
```

**Step 3: Query Using Label API**
```javascript
// Single node check:
const hasBehavior = node.labels?.some(label => label.name === 'mybehavior');

// Find all nodes with this behavior:
const allWithBehavior = world.labels.findLabel('mybehavior').getNodes();

// Use in behavior logic:
if (hasBehavior) { /* apply special handling */ }
```

**Step 4: Document in LABEL-API-GUIDE.md**

## Real Example: nogravity Label

### Before (Broken)
```javascript
// Scattered code:
const isBannerNode = node.isBannerUINode;  // Hidden property
if (isBannerNode) { /* skip gravity */ }
if (this.node1?.isBannerUINode) { /* skip */ }

// Problem: ALL banner nodes excluded (bottom nodes can't fall!)
```

### After (Fixed)
```javascript
// In Label.js:
let nogravityLabel = this.addLabel('nogravity', [nodeLabel], {});
let bannerLabel = this.addLabel('banner', [nodeLabel], {});

// In BannerNode.js:
this.nail = new Node(world, parent, 'node banner nogravity', {...});
this.leftBottomNode = new Node(world, parent, 'node banner moveable', {...});

// In TensorForces.js (one place!):
const hasNoGravity = node.labels?.some(label => label.name === 'nogravity');
if (hasNoGravity) { return Vector(0, 0); }

// Result:
// - Top nodes have nogravity → springs hold them
// - Bottom nodes don't have nogravity → gravity pulls them
// - Natural hanging banner!
```

## Key Benefits

| Aspect | Hidden Flag | Label-Based |
|--------|-------------|------------|
| **Discoverable** | ❌ Hidden | ✅ In Label.js |
| **Queryable** | ❌ No API | ✅ findLabel() |
| **Centralized** | ❌ Scattered | ✅ One file |
| **Extensible** | ❌ Hard | ✅ Easy |
| **Maintainable** | ❌ Fragile | ✅ Robust |
| **Self-documenting** | ❌ No | ✅ Yes |

## Label vs Property Examples

### ✅ USE LABELS FOR THESE:

```javascript
// Behavior types:
'node rigid'          // Physics model
'node gravity'        // Forces applied
'node nogravity'      // Forces excluded
'node interactive'    // Input handling
'node draggable'      // Interaction capability

// Role/Identity:
'node banner'         // Part of banner system
'node pivot'          // Pivot point
'node anchor'         // Fixed point

// Conditional processing:
'tensor field'        // Field force calculation
'tensor spring'       // Spring force calculation
```

### ✅ USE PROPERTIES FOR THESE:

```javascript
// Data values:
node.mass = 5;                      // Numeric value
node.localPosition = new Position();  // Vector data
node.name = 'MyNode';               // Identifier
node.velocity = new Velocity();     // Physics data
node.constant = 0.5;                // Parameter value
```

## Pattern Checklist

When reviewing code:

- [ ] Does this add a new check/flag to Node or Tensor?
- [ ] Could it be a label instead?
- [ ] Is it discoverable in Label.js?
- [ ] Is it using Label API correctly?
- [ ] Is there only ONE place checking it?
- [ ] Is it documented in LABEL-API-GUIDE.md?

## Documentation Files

1. **ARCHITECTURE-LABEL-DRIVEN-DESIGN.md** (11.1 KB)
   - Complete architectural principle
   - When to use labels vs properties
   - Implementation patterns
   - Review checklist
   - Conversion examples

2. **BEHAVIOR-VS-PROPERTY-DECISION-TREE.md** (7.4 KB)
   - Quick decision reference
   - Decision matrix
   - Common mistakes
   - Code review guide
   - Self-test questions

3. **LABEL-API-GUIDE.md** (10.3 KB)
   - Complete Label system reference
   - All 18 pre-defined labels
   - API methods and examples
   - Label hierarchy
   - Best practices

## How It's Working Now

### Current Labels in Use

**Gravity Control:**
- `nogravity` - Nodes excluded from gravity fields

**Organization:**
- `banner` - Banner UI system nodes

### Pattern in TensorForces.js

```javascript
// Check if either node has nogravity label
const hasNoGravity1 = node1.labels?.some(label => label.name === 'nogravity');
const hasNoGravity2 = node2.labels?.some(label => label.name === 'nogravity');

if (hasNoGravity1 || hasNoGravity2) {
    return Vector(0, 0);  // Skip gravity calculation
}
```

This replaces the old scattered `if (node.isBannerUINode)` checks.

## Next Steps for Development

Whenever you need to add behavior to Node or Tensor:

1. **Read:** BEHAVIOR-VS-PROPERTY-DECISION-TREE.md
2. **Decide:** Is this behavior or data?
3. **If behavior:** Check if label already exists in Label.js
4. **If new:** Add label to Label.js with documentation
5. **Implement:** Use Label API for querying
6. **Document:** Add entry to LABEL-API-GUIDE.md

## Questions Before Adding Behavior

Ask yourself these questions:

1. "Is this something that changes HOW the node is processed?"
   - YES → Consider label
   
2. "Would it be useful to query 'find all nodes with this'?"
   - YES → Use label
   
3. "Is this fundamentally about identity/type?"
   - YES → Use label
   
4. "Could this be on/off?"
   - YES → Use label
   
5. "When in doubt?"
   - Use label (more discoverable, maintainable)

## Still Have Questions?

1. Check BEHAVIOR-VS-PROPERTY-DECISION-TREE.md (quick reference)
2. Read ARCHITECTURE-LABEL-DRIVEN-DESIGN.md (full explanation)
3. Look at LABEL-API-GUIDE.md for existing examples
4. Search Label.js for similar labels
5. Ask: Does the system already have a label for this?

## Summary

**The principle is simple:**
- Labels = WHAT the node IS (identity, type, behavior classification)
- Properties = HOW MUCH or WHAT VALUE (data storage)
- Behaviors = query labels to DECIDE HOW to process

**By making behavior label-driven:**
- ✅ Behaviors are discoverable in one place (Label.js)
- ✅ Behaviors are queryable (findLabel API)
- ✅ New behaviors don't require code changes (just new labels)
- ✅ System is more maintainable and extensible
- ✅ Reduces hidden flags and scattered logic

This architectural principle will be maintained as the system grows.
