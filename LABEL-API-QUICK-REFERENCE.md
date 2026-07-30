# Label API Quick Reference

## Core API Functions

### Finding Labeled Objects
```javascript
// Get all gravity wells (returns array of nodes)
const gravityWells = world.labels.findLabel('gravitywell').getNodes();

// Get all springs (returns array of tensors)
const springs = world.labels.findLabel('spring').getTensors();

// Get all moveable nodes
const moveableNodes = world.labels.findLabel('moveable').getNodes();

// Get both nodes and tensors with a label
const allSpringThings = world.labels.findLabel('spring').getReferences();
```

### Working with Labels
```javascript
// Find a label (creates if not found)
const label = world.labels.findLabel('gravitywell');

// Get nodes with this label
const nodes = label.getNodes();

// Get tensors with this label
const tensors = label.getTensors();

// Check if label has any references
if (label.used() > 0) {
    console.log(`Found ${label.used()} objects with this label`);
}

// Get all labels
const allLabels = world.labels.getLabels();
```

### Parsing Labels (Multiple)
```javascript
// Parse space or comma-separated labels
const labels = world.labels.parse('spring absorber field', myObject);
// Returns: [Label('spring'), Label('absorber'), Label('field'), ...dependencies]

// Add a single reference
world.labels.addReference('moveable', myNode);
```

## ❌ DON'T DO THIS (Pattern Matching)
```javascript
// Wrong - checking label string
const wells = world.nodes.filter(n => n.label.includes('gravitywell'));

// Wrong - string includes
const springs = world.tensors.filter(t => t.labels.some(l => l.includes('spring')));

// Wrong - case sensitivity issues
if (nodeLabel.toLowerCase().includes('gravity')) { ... }
```

## ✅ DO THIS (Label API)
```javascript
// Correct - use findLabel
const wells = world.labels.findLabel('gravitywell').getNodes();

// Correct - use getTensors
const springs = world.labels.findLabel('spring').getTensors();

// Correct - check label name property
const hasGravity = node.labels.some(label => label.name === 'gravitywell');
```

## Common Tasks

### Find Closest Gravity Well
```javascript
const gravityWells = world.labels.findLabel('gravitywell').getNodes();
if (gravityWells.length === 0) return null;

let closest = gravityWells[0];
let minDist = Number.MAX_VALUE;

gravityWells.forEach(well => {
    const dist = Math.sqrt(
        (well.localPosition.x - refPos.x) ** 2 + 
        (well.localPosition.y - refPos.y) ** 2
    );
    if (dist < minDist) {
        closest = well;
        minDist = dist;
    }
});

return closest;
```

### Count Objects by Label
```javascript
const springCount = world.labels.findLabel('spring').getTensors().length;
const nodeCount = world.labels.findLabel('node').getNodes().length;
const moveableCount = world.labels.findLabel('moveable').getNodes().length;
```

### Add Label to Object
```javascript
// Single label
world.labels.addReference('gravitywell', myNode);

// Multiple labels (with dependencies)
world.labels.parse('spring absorber field', myTensor);
```

## Pre-defined Labels Reference

**Nodes:**
- `node` - All nodes
- `moveable` - Affected by forces
- `angle` - Rotating nodes
- `sensor` - Sensor nodes
- `selector` - Cursor/selector
- `keysensor` - Keyboard-controlled
- `gravitywell` - Gravity sources
- `picture` - Image-based nodes
- `truss` - Container nodes

**Tensors:**
- `tensor` - All tensors
- `spring` - Spring constraints
- `field` - Gravity/force fields
- `absorber` - Damping tensors
- `pullspring` - Pull springs
- `pushspring` - Push springs
- `dampenedspring` - Damped springs

## Error Prevention

| Issue | Solution |
|-------|----------|
| Label not found | `findLabel()` auto-creates, check `.used()` |
| Empty array | Always check length before accessing [0] |
| Wrong type returned | Use `.getNodes()` for nodes, `.getTensors()` for tensors |
| Case sensitivity | Labels are lowercase, case-sensitive |
| Pattern matching | Use Label API, not string.includes() |

## Testing Label Queries

```javascript
// Verify label exists and has content
function testLabel(world, labelName) {
    const label = world.labels.findLabel(labelName);
    console.log(`Label '${labelName}':
        Nodes: ${label.getNodes().length}
        Tensors: ${label.getTensors().length}
        Total: ${label.used()}
    `);
}

// Find all labels with objects
function listAllUsedLabels(world) {
    return world.labels.getLabels()
        .filter(label => label.used() > 0)
        .map(label => ({
            name: label.name,
            nodes: label.getNodes().length,
            tensors: label.getTensors().length
        }));
}
```

---
**See LABEL-API-GUIDE.md for complete documentation.**
