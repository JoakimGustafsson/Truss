# When You Need to Add Behavior: Always Consult This

## The One Principle

**Before adding any behavior to Node or Tensor classes, always ask:**

> "Could this be a label instead?"

## Quick Decision

**Is this about BEHAVIOR/TYPE/ROLE?**
- ✅ YES → Use LABEL
- ❌ NO → Probably data/property

**Can it be ON/OFF?**
- ✅ YES → Use LABEL
- ❌ NO → Probably a value

**Would you want to query "find all X"?**
- ✅ YES → Use LABEL
- ❌ NO → Probably just a property

## How to Add a Label

### 1. Define in Label.js
```javascript
let myBehaviorLabel = this.addLabel('mybehavior', [nodeLabel], {
    description: 'What this behavior does',
});
```

### 2. Use in Node Creation
```javascript
new Node(world, parent, 'node mybehavior', { name: 'example' });
```

### 3. Query with Label API
```javascript
// Single node:
const hasBehavior = node.labels?.some(label => label.name === 'mybehavior');

// All nodes with behavior:
const nodes = world.labels.findLabel('mybehavior').getNodes();
```

### 4. Document in LABEL-API-GUIDE.md

## Real Example: nogravity

This is what we did for the banner gravity system:

### Problem
- Banner top nodes were completely excluded from gravity (good)
- But also excluded bottom nodes that need to fall (bad)
- Solution: selective exclusion with labels

### Implementation
```javascript
// In Label.js:
let nogravityLabel = this.addLabel('nogravity', [nodeLabel], {
    // Nodes with this label are excluded from gravity calculations
});

// In BannerNode.js:
this.topNode = new Node(world, parent, 'node banner nogravity', {...});
this.bottomNode = new Node(world, parent, 'node banner', {...});

// In TensorForces.js:
const hasNoGravity = node.labels?.some(label => label.name === 'nogravity');
if (hasNoGravity) { return Vector(0, 0); }
```

### Result
- ✅ Top nodes excluded (have nogravity label)
- ✅ Bottom nodes included (no nogravity label)
- ✅ Natural hanging effect

## Quick Reference

| Need | Solution | File |
|------|----------|------|
| Decide label vs property? | BEHAVIOR-VS-PROPERTY-DECISION-TREE.md | Reference |
| Learn complete principle? | ARCHITECTURE-LABEL-DRIVEN-DESIGN.md | Deep dive |
| Quick reminder? | LABEL-DRIVEN-DESIGN-SUMMARY.md | Quick ref |
| Add a label? | Follow steps above | Code |
| Use Label API? | LABEL-API-QUICK-REFERENCE.md | Syntax |
| Review someone's code? | CODE-REVIEW-CHECKLIST-LABELS.md | Checklist |
| Understand current system? | NOGRAVITY-LABEL-SYSTEM.md | Example |
| Need the map? | docs/ARCHITECTURE-README.md | Master |

## Anti-Patterns to Avoid

```javascript
// ❌ DON'T - Hidden flags
this.isBannerNode = true;
this.skipGravity = true;

// ❌ DON'T - String matching
if (node.label?.includes('gravity')) { }

// ❌ DON'T - Multiple flags for one behavior
if (node.isUI && !node.isPhysical && node.isClickable) { }

// ✅ DO - Use labels
new Node(world, parent, 'node nogravity clickable', {})
const hasNoGravity = node.labels?.some(l => l.name === 'nogravity');
```

## Before Starting

1. **Read** BEHAVIOR-VS-PROPERTY-DECISION-TREE.md (5 min)
2. **Check** if similar label already exists
3. **Look** at existing examples in Label.js
4. **Write** your code following the pattern
5. **Document** in LABEL-API-GUIDE.md
6. **Get reviewed** using CODE-REVIEW-CHECKLIST-LABELS.md

## Remember

- **Labels = WHAT the node IS** (identity, behavior class)
- **Properties = HOW MUCH or WHAT VALUE** (data storage)
- **Behaviors = query labels to DECIDE HOW** to process

This foundation ensures:
- ✅ Behaviors are discoverable (in Label.js)
- ✅ Behaviors are queryable (Label API)
- ✅ Behaviors are extensible (new labels)
- ✅ System is maintainable (clear patterns)

**When in doubt, use a label. It's more discoverable and maintainable.**
