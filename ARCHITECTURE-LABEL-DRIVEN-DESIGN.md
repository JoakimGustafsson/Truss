# Label-Driven Architecture Principle

## Overview

This document establishes the architectural principle that **behavior should be governed by labels on nodes and tensors rather than embedded in the object code itself**.

## Why Label-Driven Design?

### Problems with Embedded Behavior

**Current issues in the codebase:**
- `isBannerUINode` flag scattered across objects (ad-hoc, hidden)
- Behavior checks hidden inside object methods
- Hard to discover, maintain, or extend
- Can't query "all nodes with behavior X"
- Difficult to enable/disable behaviors without code changes
- Creates tight coupling between objects and behaviors

**Example of bad pattern:**
```javascript
// ❌ WRONG - Behavior embedded in object
class Node {
    constructor() {
        this.isBannerUINode = true;  // Hidden flag
    }
}

// Then scattered throughout code:
if (node.isBannerUINode) { /* special handling */ }
if (node.isBannerUINode) { /* different handling */ }
if (node.isBannerUINode) { /* yet more handling */ }
```

### Benefits of Label-Driven Design

**Using labels instead:**
- ✅ Centralized: All behavior labels defined in `Label.js`
- ✅ Discoverable: Can browse Label.js to find all behaviors
- ✅ Queryable: `world.labels.findLabel('behavior').getNodes()`
- ✅ Extensible: New behaviors are just new labels
- ✅ Non-intrusive: No hidden flags in objects
- ✅ Reusable: Same label patterns across entire system
- ✅ Debuggable: Easy to inspect what labels an object has
- ✅ Testable: Can test behavior by checking labels

**Example of good pattern:**
```javascript
// ✅ CORRECT - Behavior defined in labels
// In Label.js:
let nogravityLabel = this.addLabel('nogravity', [nodeLabel], {
    description: 'Nodes with this label are excluded from gravity fields',
});

// In behavior code (TensorForces.js):
const hasNoGravity = node.labels?.some(label => label.name === 'nogravity');
if (hasNoGravity) { /* single location, clear intent */ }
```

## The Label-Driven Principle

### Core Rule

**BEFORE adding any behavior property, method, or check to Node or Tensor:**

1. **Ask:** "Is this behavior-related?" (Not just data storage)
2. **Consider:** Could this be a label instead?
3. **Design:** How would the label API express this?
4. **Document:** Add the label to Label.js with clear semantics
5. **Implement:** Use Label API to query, not object properties

### When to Use Labels

✅ **USE LABELS FOR:**
- Physics behaviors (gravity exclusion, forces, calculations)
- Node types (UI elements, physics objects, anchors)
- Gameplay mechanics (effects, interactions, states)
- Rendering behaviors (visible, highlighted, animated)
- Input behaviors (interactive, draggable, selectable)
- Group/collection membership (banner nodes, trap nodes, etc.)
- Conditional processing (skip calculations, special handling)

❌ **DON'T USE LABELS FOR:**
- Storage values (mass, position, velocity, name)
- Configuration parameters (constants, coefficients)
- Relationship data (parent node, connected tensors)
- Transient state (current calculation values)

### Distinction: Labels vs Properties

**Labels** (use for BEHAVIOR):
- Boolean (has/doesn't have)
- Qualitative (what KIND of thing is this?)
- Behavior-determining
- Example: `nogravity`, `banner`, `interactive`

**Properties** (use for DATA):
- Can have ranges
- Quantitative (how much/many?)
- Value-storing
- Example: `mass`, `position`, `velocity`, `constant`

## Implementation Pattern

### Adding New Behavior

**Step 1: Define the Label**
```javascript
// In Label.js constructor:
let myBehaviorLabel = this.addLabel('mybehavior', [nodeLabel], {
    description: 'Nodes with this label behave in specific way X',
});
```

**Step 2: Use Label API to Query**
```javascript
// In behavior code (e.g., TensorForces.js, Behaviour.js):
const hasBehavior = node.labels?.some(label => label.name === 'mybehavior');
if (hasBehavior) {
    // Apply the behavior
}

// Or query all nodes with this behavior:
const behaviorNodes = world.labels.findLabel('mybehavior').getNodes();
behaviorNodes.forEach(node => { /* apply behavior */ });
```

**Step 3: Assign Label When Creating**
```javascript
// When constructing nodes:
const myNode = new Node(world, parent, 'node mybehavior', {
    name: 'example',
});
```

**Step 4: Document in Label Guide**
```markdown
# In LABEL-API-GUIDE.md or similar:

## mybehavior Label
- **Applies to:** Nodes
- **Purpose:** Describe what the behavior does
- **Excludes:** Any conflicting behaviors
- **Used by:** List which systems check this label
- **Examples:** Show node creation with label
```

## Audit: Current Label Violations

### Identified Anti-Patterns

| Location | Problem | Solution |
|----------|---------|----------|
| Node.js | `isBannerUINode` flag (now removed) | ✅ Replaced with `nogravity` label |
| Node.js | `visible` property | Consider: `visible` label? |
| Node.js | `pictureReference` getters/setters | Data, not behavior - OK |
| Tensor.js | (needs audit) | |
| Various | Direct property checks instead of Label API | Always use `findLabel()` and `getNodes()` |

### Pattern to Find Violations

Search codebase for:
- Direct property checks: `node.is*` or `node.*Flag`
- Conditional behavior: `if (node.something) { doX() }`
- Special-case handling: Comments like "skip this node if..."

These are candidates for label replacement.

## Label API Patterns

### Correct Patterns

```javascript
// ✅ Single node check
const hasLabel = node.labels?.some(label => label.name === 'labelname');

// ✅ Find all nodes with label
const labeledNodes = world.labels.findLabel('labelname').getNodes();

// ✅ Check multiple labels (any)
const hasAnyLabel = ['label1', 'label2'].some(name =>
    node.labels?.some(label => label.name === name)
);

// ✅ Check multiple labels (all)
const hasAllLabels = ['label1', 'label2'].every(name =>
    node.labels?.some(label => label.name === name)
);
```

### Incorrect Patterns (AVOID)

```javascript
// ❌ String pattern matching
const isSpecial = node.label?.includes('special');

// ❌ Hardcoded property check
const isSpecial = node.isSpecial === true;

// ❌ Multiple property conditions
if (node.flag1 && node.flag2 && !node.flag3) { /* hard to discover */ }

// ❌ Not using Label API
const results = [];
for (let node of world.nodes) {
    if (node.customProperty) results.push(node);
}
```

## Documentation Requirements

### When Adding a New Label

Every new label must have documentation:

1. **In Label.js:** Description comment
2. **In Label guide:** Full entry with:
   - Purpose
   - Which object types (node/tensor)
   - What behaviors it enables/disables
   - Any inheritance/dependencies
   - Examples of usage

3. **In behavior code:** Comments explaining the check

Example:
```javascript
// In Label.js:
let myLabel = this.addLabel('myname', [parentLabel], {
    // Nodes with this label have behavior X
    // They will be treated specially in SystemY
    // Cannot be combined with labels: [incompatible]
});

// In behavior code (with comment):
// Skip calculation for nodes marked 'myname' (special UI elements)
const hasSpecialLabel = node.labels?.some(label => label.name === 'myname');
if (hasSpecialLabel) {
    return skipValue;  // Clear why this is skipped
}
```

## Review Checklist

When reviewing code changes, ask:

- [ ] Does this add a new behavior or type check?
- [ ] Is it checking an object property vs Label API?
- [ ] Could this be a label instead of a flag/property?
- [ ] If label: Is it defined in Label.js?
- [ ] If label: Is it documented?
- [ ] Is the label being queried using proper Label API?
- [ ] Is the label name descriptive and lowercase?
- [ ] Would removing this code break anything discovered via search?

## Future Work

### Candidates for Label Conversion

1. **Node visibility** - Currently `visible` property, could be `visible` label
2. **Tensor types** - Could use labels instead of type strings
3. **Physics properties** - Damping, friction could be label-based exclusions
4. **Rendering modes** - Different draw behaviors could be labels
5. **Interactive elements** - Input-handling could be driven by labels

### Label System Enhancements

1. **Label inheritance** - Already partially supported, document more
2. **Label metadata** - Store behavior parameters on labels
3. **Label composition** - Combine multiple labels for complex behaviors
4. **Label conditions** - Conditional label application

## Examples: Converting Code to Labels

### Example 1: Banner UI Node Exclusion

**Before (embedded behavior):**
```javascript
// In Node constructor
this.isBannerUINode = true;

// In TensorForces.js (multiple places)
if (node.isBannerUINode) { return; }
if (this.node1?.isBannerUINode || this.node2?.isBannerUINode) { return; }
```

**After (label-driven):**
```javascript
// In Label.js
let nogravityLabel = this.addLabel('nogravity', [nodeLabel], {
    // Gravity fields do not apply to nodes with this label
});

// In node creation
const topNode = new Node(world, parent, 'node banner nogravity', {});

// In TensorForces.js (single location, clear intent)
const hasNoGravity = node.labels?.some(label => label.name === 'nogravity');
if (hasNoGravity) { return Vector(0,0); }
```

### Example 2: Physics Type Determination

**Before (property checking):**
```javascript
if (node.physicsType === 'rigid') { /* handle rigid */ }
else if (node.physicsType === 'rope') { /* handle rope */ }
else if (node.physicsType === 'spring') { /* handle spring */ }
```

**After (label-driven):**
```javascript
// In Label.js
this.addLabel('rigid', [nodeLabel], { /* rigid body physics */ });
this.addLabel('rope', [nodeLabel], { /* rope physics */ });
this.addLabel('spring', [nodeLabel], { /* spring physics */ });

// In physics code
if (node.labels?.some(l => l.name === 'rigid')) { /* handle rigid */ }
else if (node.labels?.some(l => l.name === 'rope')) { /* handle rope */ }
else if (node.labels?.some(l => l.name === 'spring')) { /* handle spring */ }

// Or use helper function in Label API or Node class:
const physicsType = node.labels?.find(l => ['rigid','rope','spring'].includes(l.name))?.name;
if (physicsType === 'rigid') { /* ... */ }
```

## Summary

**The Label-Driven Principle:**
- Labels express WHAT a node/tensor IS (identity, type)
- Behaviors query labels to DECIDE HOW to process
- Central definition in Label.js
- Discoverable and maintainable
- Queryable using Label API
- Non-intrusive (no hidden object properties)

**When you're about to add behavior to Node/Tensor:**
1. Stop
2. Ask: "Could this be a label?"
3. If yes: Define label, use Label API
4. If no: Document why it must be embedded
5. Always consult this document

This creates a more coherent, maintainable architecture where behavior is centrally defined and clearly queryable.
