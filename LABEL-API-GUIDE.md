# Label Management and Search API Guide

## Overview
The Truss system uses a sophisticated label-based categorization system for nodes and tensors. Instead of pattern-matching label strings, use the formal Label API for proper queries and filtering.

## Core API Reference

### Labels (Manager Class)
Located in: `Javascript/Label.js`

The `Labels` class manages all label definitions and provides query methods.

#### `findLabel(labelName: string): Label`
- **Purpose:** Find or create a label by name
- **Parameters:** 
  - `labelName` - The label name to search for (e.g., 'gravitywell', 'node', 'tensor')
- **Returns:** Label object (creates new label if not found)
- **Usage:**
  ```javascript
  const gravityWellLabel = world.labels.findLabel('gravitywell');
  ```
- **Key Insight:** This returns a Label *object*, not just a string. The Label object contains all nodes/tensors with that label.

#### `getLabels(): Label[]`
- **Purpose:** Get all defined labels in the system
- **Returns:** Array of all Label objects
- **Usage:**
  ```javascript
  const allLabels = world.labels.getLabels();
  ```

#### `parse(labelString: string, reference: object): Label[]`
- **Purpose:** Parse a space-separated or comma-separated label string and return all matching labels with dependencies
- **Parameters:**
  - `labelString` - A string like "spring absorber" or "moveable,node"
  - `reference` - The object (node/tensor) to assign these labels to
- **Returns:** Array of Label objects
- **Usage:**
  ```javascript
  const labels = world.labels.parse('spring absorber field', myNode);
  ```
- **Key Feature:** Automatically resolves label dependencies (hierarchical relationships)

#### `addReference(labelName: string, reference: object): Label`
- **Purpose:** Add a node or tensor to a label
- **Parameters:**
  - `labelName` - The label name (e.g., 'moveable', 'field')
  - `reference` - The object to add
- **Returns:** The Label object
- **Usage:**
  ```javascript
  world.labels.addReference('gravitywell', myEarth);
  ```

#### `recursiveDependencies(startList: Label[], reference: object, resultList: Label[]): Label[]`
- **Purpose:** Get all labels including dependencies (advanced)
- **Use Case:** When a label depends on other labels, this retrieves the full hierarchy

### Label Class
Represents a single label and contains all nodes/tensors with that label.

#### `getNodes(): Node[]`
- **Purpose:** Get all nodes with this label
- **Returns:** Array of Node objects
- **Usage:**
  ```javascript
  const gravityWells = world.labels.findLabel('gravitywell').getNodes();
  ```

#### `getTensors(): Tensor[]`
- **Purpose:** Get all tensors with this label
- **Returns:** Array of Tensor objects
- **Usage:**
  ```javascript
  const springs = world.labels.findLabel('spring').getTensors();
  ```

#### `getReferences(): object[]`
- **Purpose:** Get all objects (nodes + tensors) with this label
- **Returns:** Combined array of nodes and tensors
- **Usage:**
  ```javascript
  const allSpringThings = world.labels.findLabel('spring').getReferences();
  ```

#### `used(): number`
- **Purpose:** Get count of nodes + tensors with this label
- **Returns:** Number of references
- **Usage:**
  ```javascript
  if (gravityWellLabel.used() > 0) { ... }
  ```

## Common Label Hierarchy

```
node
├── moveable
│   └── angle
├── sensor
│   ├── selector
│   └── keysensor
├── picture
└── truss

tensor
├── positiontensor
│   ├── pullspring
│   ├── pushspring
│   ├── spring
│   │   └── dampenedspring
│   └── field
└── absorber

gravitywell (special label)
├── Inherits: node
├── Default properties: constant (6.67e-11), mass (5.97219e24)
└── Name: 'Earth'
```

## Best Practices

### ❌ WRONG - Text Pattern Matching
```javascript
// DON'T DO THIS
const gravityWells = world.nodes.filter(node => 
    node.label && node.label.includes('gravitywell')
);

const springs = world.tensors.filter(tensor =>
    tensor.labels && tensor.labels.some(l => l.includes('spring'))
);
```

### ✅ CORRECT - Using Label API
```javascript
// DO THIS INSTEAD
const gravityWells = world.labels.findLabel('gravitywell').getNodes();

const springs = world.labels.findLabel('spring').getTensors();

// For nodes that might have multiple labels
const moveableNodes = world.labels.findLabel('moveable').getNodes();

// Check if a specific node has a label
const nodeLabels = node.labels; // array of Label objects
const hasMoveable = nodeLabels.some(label => label.name === 'moveable');
```

### Finding Specific Labeled Objects

```javascript
// Find all gravity wells (nodes with 'gravitywell' label)
function findGravityWells(world) {
    return world.labels.findLabel('gravitywell').getNodes();
}

// Find closest gravity well to a reference position
function findClosestGravityWell(world, referencePosition) {
    const gravityWells = world.labels.findLabel('gravitywell').getNodes();
    
    if (gravityWells.length === 0) {
        return null;
    }
    
    let closestWell = gravityWells[0];
    let minDistance = Number.MAX_VALUE;
    
    gravityWells.forEach(well => {
        const wellPos = well.getPosition ? well.getPosition() : well.localPosition;
        const dx = wellPos.x - referencePosition.x;
        const dy = wellPos.y - referencePosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestWell = well;
        }
    });
    
    return closestWell;
}

// Find all moveable nodes
function getMoveableNodes(world) {
    return world.labels.findLabel('moveable').getNodes();
}

// Find all absorber tensors
function getAbsorberTensors(world) {
    return world.labels.findLabel('absorber').getTensors();
}

// Check if a label exists and has references
function hasLabel(object, labelName) {
    if (!object.labels || !Array.isArray(object.labels)) {
        return false;
    }
    return object.labels.some(label => label.name === labelName);
}
```

## Pre-defined Labels

| Label Name | Type | Purpose | Parent Labels |
|-----------|------|---------|----------------|
| `node` | Node | Base node category | — |
| `tensor` | Tensor | Base tensor category | — |
| `moveable` | Node | Nodes affected by forces | node |
| `spring` | Tensor | Spring tensors | positiontensor |
| `field` | Tensor | Field/gravity tensors | positiontensor |
| `absorber` | Tensor | Damping tensors | tensor |
| `pullspring` | Tensor | Pull springs | positiontensor |
| `pushspring` | Tensor | Push springs | positiontensor |
| `dampenedspring` | Tensor | Damped springs | spring, absorber |
| `angle` | Node | Nodes with rotation | node |
| `sensor` | Node | Sensor nodes | node |
| `selector` | Node | User selector tool | sensor |
| `keysensor` | Node | Keyboard-controlled nodes | sensor |
| `gravitywell` | Node | Gravity sources (Earth) | node |
| `picture` | Node | Nodes with images | node |
| `truss` | Node | Main truss containers | node |
| `color` | Any | Objects with color | — |
| `debugnode` | Node | Debug visualization | — |
| `debugtensor` | Tensor | Debug visualization | — |

## Real-World Examples from Codebase

### Example 1: Finding Gravity Well for Connection (Physics)
```javascript
// From: Javascript/Control/GeneralControl.js
let gravityWellLabel = universe.currentWorld.labels.findLabel('gravitywell');
let gravityWells = gravityWellLabel.getNodes();

if (gravityWells.length > 0) {
    // Find closest gravity well
    let closestWell = gravityWells[0];
    let minDist = Number.MAX_VALUE;
    
    gravityWells.forEach(well => {
        const dist = calculateDistance(myPosition, well.localPosition);
        if (dist < minDist) {
            closestWell = well;
            minDist = dist;
        }
    });
    
    connectBannerToGravity(closestWell);
} else {
    createNewGravityWell();
}
```

### Example 2: Parsing Multiple Labels
```javascript
// From: Javascript/Label.js - parse() method
const labelString = 'spring absorber field';
const labels = world.labels.parse(labelString, myTensor);
// Returns array: [Label('spring'), Label('absorber'), Label('field')]
// Plus all their dependencies
```

### Example 3: Collecting All Nodes of a Type
```javascript
// From: Javascript/Universe.js
let nodes = this.labels.findLabel('node').getNodes();
let tensors = this.labels.findLabel('tensor').getTensors();

// All moveable objects
let moveableObjects = this.labels.findLabel('moveable').getNodes();
```

## Important Note: Label Structure

When an object (node or tensor) is created with labels:
```javascript
const myNode = new Node(world, parent, 'moveable spring field', {...});
```

The system automatically:
1. Parses the label string into individual labels
2. Resolves dependencies (e.g., 'moveable' depends on 'node')
3. Adds the object to each label's reference list
4. Stores Label objects in `object.labels` array

To query: Use `findLabel(name).getNodes()` or `getTensors()`, **NOT** string pattern matching.

## Migration Guide: From Pattern Matching to Label API

### OLD (Pattern Matching)
```javascript
// Finding gravity wells - WRONG
const wells = world.nodes.filter(n => 
    n.label && n.label.includes('gravitywell')
);

// Finding springs - WRONG
const springs = world.tensors.filter(t => 
    t.labels && t.labels.some(l => l.includes('spring'))
);
```

### NEW (Label API)
```javascript
// Finding gravity wells - CORRECT
const wells = world.labels.findLabel('gravitywell').getNodes();

// Finding springs - CORRECT  
const springs = world.labels.findLabel('spring').getTensors();

// For banner physics specifically
const gravityWell = world.labels.findLabel('gravitywell').getNodes()[0];
if (gravityWell) {
    connectBannerToGravityWell(gravityWell);
}
```

## Summary
- **Always use `Labels.findLabel()` to get a Label object**
- **Use `.getNodes()` or `.getTensors()` to get objects with that label**
- **Never pattern-match label strings**
- **Labels are hierarchical - dependencies are automatic**
- **Use `.used()` to check if a label has any references**
