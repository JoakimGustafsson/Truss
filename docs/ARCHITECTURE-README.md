# Truss Architecture Documentation - Label-Driven Design Foundation

## Overview

This documentation establishes the **Label-Driven Design Principle** for the Truss physics engine. This principle ensures that behavior is governed by labels on nodes and tensors rather than embedded in object code.

**The core commitment:** Before adding any behavior to Node or Tensor classes, always ask if a label could be used instead.

---

## Complete Documentation Map

### Core Principle Documentation

**1. ARCHITECTURE-LABEL-DRIVEN-DESIGN.md** (11.1 KB)
- **Purpose:** Complete architectural principle explanation
- **Read when:** Understanding why this approach exists
- **Contains:**
  - Problems with embedded behavior
  - Benefits of label-driven design
  - When to use labels vs properties
  - Implementation patterns
  - Audit of current violations
  - Label API patterns (correct vs wrong)
  - Conversion examples (before/after)
- **Audience:** Architects, senior developers

**2. BEHAVIOR-VS-PROPERTY-DECISION-TREE.md** (7.4 KB)
- **Purpose:** Quick decision reference for developers
- **Read when:** Deciding whether to add a label or property
- **Contains:**
  - Visual decision tree
  - Decision matrix by feature type
  - Common mistakes to avoid
  - Implementation checklist
  - Code review checklist
  - Correct examples
  - When properties are acceptable
  - Self-test questions
- **Audience:** All developers

**3. LABEL-DRIVEN-DESIGN-SUMMARY.md** (8.2 KB)
- **Purpose:** Quick reference for the principle
- **Read when:** Need quick reminder of how this works
- **Contains:**
  - Core principle summary
  - Why it matters (problem/solution)
  - Decision tree simplified
  - How to add new behavior
  - Real example (nogravity)
  - Benefits table
  - Label vs property examples
  - Pattern checklist
  - Documentation reference guide
- **Audience:** All developers (start here)

### Implementation-Specific Documentation

**4. NOGRAVITY-LABEL-SYSTEM.md** (8.2 KB)
- **Purpose:** Complete documentation of the nogravity label system
- **Read when:** Understanding gravity control in banner physics
- **Contains:**
  - Problem solved (isBannerUINode → nogravity)
  - Label system definitions
  - Banner node labeling strategy (with diagram)
  - Why top vs bottom nodes have different labels
  - Gravity field connection architecture
  - TensorForces.js implementation
  - Label query patterns (correct vs wrong)
  - Benefits of label-based system
  - Migration guide
  - Physics flow with new system
  - Future extensions
  - Debugging guide
- **Audience:** Physics developers, banner system maintainers
- **Location:** Root directory

### Label API Documentation

**5. LABEL-API-GUIDE.md** (10.3 KB)
- **Purpose:** Complete Label system API reference
- **Read when:** Using Label API in code
- **Contains:**
  - Label system overview
  - API methods (parse, findLabel, getNodes, etc.)
  - Label hierarchy and dependencies
  - All 18 pre-defined labels
  - Real-world examples from codebase
  - Query patterns
  - Hierarchy handling
  - Anti-patterns to avoid
- **Audience:** Developers writing physics code
- **Location:** Root directory

**6. LABEL-API-QUICK-REFERENCE.md** (4.8 KB)
- **Purpose:** Cheat sheet for Label API
- **Read when:** Need quick API syntax reminder
- **Contains:**
  - Syntax reference for common operations
  - Pre-defined labels quick reference
  - Error prevention table
  - Testing utilities
- **Audience:** Developers using Label API
- **Location:** Root directory

### Code Review & Quality Assurance

**7. CODE-REVIEW-CHECKLIST-LABELS.md** (10.8 KB)
- **Purpose:** Checklist for reviewing label-driven code
- **Read when:** Reviewing code changes to Node/Tensor
- **Contains:**
  - Pre-review questions
  - Design phase review checklist
  - Implementation review checklist
  - Documentation review checklist
  - Testing review checklist
  - Architecture review checklist
  - Final approval checklist
  - Common issues (6 types)
  - Approval comment templates
  - Quick reference matrix
- **Audience:** Code reviewers, maintainers
- **Location:** docs/ directory

### Physics Coordination Documentation

**8. COORDINATE-SYSTEMS.md** (5.9 KB)
- **Purpose:** Explain world vs display coordinate system
- **Read when:** Confused about coordinate directions
- **Contains:**
  - World coordinate system explanation
  - Display coordinate system explanation
  - Conversion between systems
  - Diagrams
  - Common mistakes
- **Audience:** Physics developers
- **Location:** Root directory

**9. FIELD-TENSOR-REFERENCE.md** (4.4 KB)
- **Purpose:** Field tensor force calculation guide
- **Read when:** Implementing field-based forces
- **Contains:**
  - Field tensor architecture
  - Force calculation formula
  - Mass handling
  - Physics simulation steps
- **Audience:** Physics system maintainers
- **Location:** Root directory

### Related Physics Documentation

**10. GRAVITY-FIELD-ARCHITECTURE.md** (7.5 KB)
- **Purpose:** Architecture of gravity field system
- **Read when:** Understanding gravity connections
- **Contains:**
  - System overview
  - Connection architecture (Earth → nodes)
  - Field tensor setup
  - Integration with physics
- **Audience:** Physics developers
- **Location:** Root directory

**11. PHYSICS-TUNING-RESULTS.md** (5.4 KB)
- **Purpose:** Results of physics parameter tuning
- **Read when:** Checking tuned physics parameters
- **Contains:**
  - 10-iteration tuning results
  - Optimized parameters
  - Convergence analysis
- **Audience:** Physics developers
- **Location:** Root directory

---

## Quick Start: Adding Behavior to Node/Tensor

### Step 1: Decide (use BEHAVIOR-VS-PROPERTY-DECISION-TREE.md)

```
Is this behavior/type? YES → Use LABEL
Is this data/value?    YES → Use PROPERTY
```

### Step 2: Define (if label)

```javascript
// In Label.js:
let myLabel = this.addLabel('mylabel', [nodeLabel], {
    description: 'What this behavior does',
});
```

### Step 3: Implement

```javascript
// In behavior code:
const hasBehavior = node.labels?.some(label => label.name === 'mylabel');
if (hasBehavior) { /* apply behavior */ }
```

### Step 4: Document

- Add entry to LABEL-API-GUIDE.md
- Add code comment explaining intent
- Update this document if adding new file

### Step 5: Review (use CODE-REVIEW-CHECKLIST-LABELS.md)

---

## Architecture Principles

### The Core Principle

**Behavior should be governed by labels on nodes and tensors, not embedded in object code.**

### Why This Matters

| Aspect | Hidden Flag | Label-Based |
|--------|-------------|------------|
| **Discoverable** | ❌ Hidden in objects | ✅ In Label.js |
| **Queryable** | ❌ No API | ✅ findLabel() |
| **Centralized** | ❌ Scattered code | ✅ One location |
| **Extensible** | ❌ Hard to add | ✅ Easy to add |
| **Maintainable** | ❌ Fragile | ✅ Robust |
| **Self-documenting** | ❌ No | ✅ Yes |

### What Counts as "Behavior"?

✅ **USE LABELS:**
- Physics models (rigid, rope, spring)
- Force exclusions (nogravity, nospeed)
- Type identification (banner, anchor, pivot)
- Gameplay mechanics (interactive, draggable)
- Conditional processing (skip, special handling)

❌ **USE PROPERTIES:**
- Numeric values (mass, position, velocity)
- Configuration parameters (constants, coefficients)
- String identifiers (name, type rendering)
- Relationship data (parent node, tensors)

---

## Current Implementation Status

### ✅ Implemented: Nogravity Label System

**Problem solved:**
- Previous system used `isBannerUINode` flag
- All banner nodes excluded from gravity (too broad)
- Bottom nodes couldn't fall
- Created synthetic `bannerGravityWell` as workaround

**Solution implemented:**
- New `nogravity` label in Label.js
- Top nodes: `'node banner nogravity'` (springs hold)
- Bottom nodes: `'node banner'` (no nogravity, receives gravity)
- TensorForces.js checks label using Label API
- Works correctly with Earth gravity field

**Files involved:**
- Javascript/Label.js (label definitions)
- Javascript/View/ParameterEditor/BannerNode.js (node creation)
- Javascript/Behaviours/TensorForces.js (force calculations)
- Javascript/Tests/zoom-independence.test.js (test framework)

### ⏳ Future Candidates for Label Conversion

1. **Node visibility** - Currently `visible` property
2. **Tensor types** - Currently string-based
3. **Physics properties** - Damping, friction exclusions
4. **Rendering modes** - Different draw behaviors
5. **Interactive elements** - Input handling patterns

---

## Documentation File Locations

```
C:\Code\Truss\
├── ARCHITECTURE-LABEL-DRIVEN-DESIGN.md          # Core principle (11.1 KB)
├── BEHAVIOR-VS-PROPERTY-DECISION-TREE.md        # Developer decision tool (7.4 KB)
├── NOGRAVITY-LABEL-SYSTEM.md                    # Implementation example (8.2 KB)
├── LABEL-API-GUIDE.md                          # API reference (10.3 KB)
├── LABEL-API-QUICK-REFERENCE.md                # API cheat sheet (4.8 KB)
├── COORDINATE-SYSTEMS.md                        # Coord system guide (5.9 KB)
├── FIELD-TENSOR-REFERENCE.md                   # Physics reference (4.4 KB)
├── GRAVITY-FIELD-ARCHITECTURE.md               # Gravity system (7.5 KB)
├── PHYSICS-TUNING-RESULTS.md                   # Tuning data (5.4 KB)
└── docs/
    ├── CODE-REVIEW-CHECKLIST-LABELS.md         # Review guide (10.8 KB)
    ├── LABEL-DRIVEN-DESIGN-SUMMARY.md          # Quick reference (8.2 KB)
    └── ARCHITECTURE-README.md                  # This file
```

---

## For Different Audiences

### 👨‍💻 New Developers

**Start here:**
1. Read: LABEL-DRIVEN-DESIGN-SUMMARY.md (8 min)
2. Reference: BEHAVIOR-VS-PROPERTY-DECISION-TREE.md (when adding behavior)
3. Check: LABEL-API-QUICK-REFERENCE.md (when using Label API)

**Then learn:**
4. ARCHITECTURE-LABEL-DRIVEN-DESIGN.md (full understanding)
5. LABEL-API-GUIDE.md (complete API reference)

### 🏗️ Architects

**Read:**
1. ARCHITECTURE-LABEL-DRIVEN-DESIGN.md (complete principle)
2. NOGRAVITY-LABEL-SYSTEM.md (implementation example)
3. CODE-REVIEW-CHECKLIST-LABELS.md (quality gates)

### 👀 Code Reviewers

**Use:**
1. CODE-REVIEW-CHECKLIST-LABELS.md (approval checklist)
2. BEHAVIOR-VS-PROPERTY-DECISION-TREE.md (design questions)
3. ARCHITECTURE-LABEL-DRIVEN-DESIGN.md (reference)

### ⚙️ Physics System Developers

**Learn:**
1. NOGRAVITY-LABEL-SYSTEM.md (current system)
2. LABEL-API-GUIDE.md (API reference)
3. GRAVITY-FIELD-ARCHITECTURE.md (force connections)
4. COORDINATE-SYSTEMS.md (coordinate math)

---

## Key Takeaways

1. **Labels express WHAT** (identity, type, behavior classification)
2. **Properties store HOW MUCH** (data, values, configuration)
3. **Behaviors query labels** to DECIDE HOW to process
4. **One definition location** - Label.js is the source of truth
5. **Always ask before adding object behavior** - Could it be a label?
6. **Use Label API consistently** - findLabel().getNodes(), never string matching
7. **Document all new labels** - Both in Label.js and LABEL-API-GUIDE.md

---

## When to Add to This Documentation

- New label created in Label.js → Update LABEL-API-GUIDE.md
- New behavior pattern discovered → Add to BEHAVIOR-VS-PROPERTY-DECISION-TREE.md
- Architecture violation found → Add to ARCHITECTURE-LABEL-DRIVEN-DESIGN.md
- New file created for physics → Link here and add summary

---

## Support & Questions

**Unsure if something should be a label?**
→ Read BEHAVIOR-VS-PROPERTY-DECISION-TREE.md (5 min)

**Want to know why this approach?**
→ Read ARCHITECTURE-LABEL-DRIVEN-DESIGN.md (15 min)

**Need to use Label API?**
→ Check LABEL-API-QUICK-REFERENCE.md (2 min lookup)

**Complete API reference?**
→ See LABEL-API-GUIDE.md (30 min deep dive)

**Reviewing code that adds behavior?**
→ Use CODE-REVIEW-CHECKLIST-LABELS.md

**Confused about physics coordinates?**
→ Read COORDINATE-SYSTEMS.md

---

## Version History

- **v1.0** - Initial label-driven design documentation
  - Core principle established (ARCHITECTURE-LABEL-DRIVEN-DESIGN.md)
  - Developer guide created (BEHAVIOR-VS-PROPERTY-DECISION-TREE.md)
  - Implementation example (NOGRAVITY-LABEL-SYSTEM.md)
  - Review checklist (CODE-REVIEW-CHECKLIST-LABELS.md)
  - Quick references created

---

## Summary

**The Label-Driven Design Principle ensures:**
- ✅ Behaviors are discoverable in Label.js
- ✅ Behaviors are queryable through Label API
- ✅ New behaviors don't require code changes (just new labels)
- ✅ System is more maintainable and extensible
- ✅ Hidden flags and scattered logic are reduced

**This foundation supports:**
- Zoom-independent physics (10^-14 to 10^14)
- Extensible gravity well system
- Multiple physics model support
- Future interactive elements
- Cleaner codebase organization

This documentation is maintained as the system grows and new behaviors are added.
