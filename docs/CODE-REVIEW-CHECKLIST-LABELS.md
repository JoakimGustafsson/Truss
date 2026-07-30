# Code Review Checklist: Label-Driven Design

**Use this checklist when reviewing code changes to Node or Tensor classes.**

## Pre-Review Questions

- [ ] Is this PR adding new behavior to Node or Tensor?
- [ ] Is this PR modifying behavior in existing nodes/tensors?
- [ ] Does this involve checking object properties for behavior?

**If NO to all → Use standard code review guidelines**  
**If YES to any → Continue with this checklist**

---

## Design Phase Review

### Behavior vs Property Decision

- [ ] The change introduces a new property/method/flag?
  - NO → Skip to implementation review
  - YES → Does it determine behavior?
    - NO → ✅ Data property is OK
    - YES → Should be a LABEL

### If This Should Be a Label

- [ ] Does the change define a new label in `Label.js`?
  - YES → ✅ Continue to implementation review
  - NO → ❌ **Request:** Move to label-based approach

- [ ] Is the label name descriptive and lowercase?
  - Examples: `nogravity`, `interactive`, `anchor`, `banner`
  - ✅ Good: Clear, specific, lowercase
  - ❌ Bad: `flag`, `special`, `UINode`, `hasX`

- [ ] Is the label documented in `Label.js`?
  - ✅ YES: Comment explaining behavior
  - ❌ NO: **Request:** Add documentation comment

### If This is a New Flag/Property Addition

- [ ] Has the author considered using a label instead?
  - YES → Already considered, has documented reason
  - NO → **Ask:** Why must this be a property?
    - If answer is unclear → **Request:** Use label instead
    - If valid → Continue review

- [ ] Is there documentation explaining why this cannot be a label?
  - YES → ✅ Valid architectural exception
  - NO → ❌ **Request:** Add documentation

---

## Implementation Review

### Label API Usage

- [ ] Does the code use Label API correctly?
  ```javascript
  // ✅ CORRECT
  node.labels?.some(label => label.name === 'nogravity')
  
  // ❌ WRONG
  node.label?.includes('nogravity')
  node.hasGravity === false
  ```
  - Correct pattern used? YES ✅ NO ❌

- [ ] Does the code query labels properly?
  ```javascript
  // ✅ CORRECT
  const nodes = world.labels.findLabel('nogravity').getNodes();
  
  // ❌ WRONG
  const nodes = world.nodes.filter(n => n.nogravity);
  ```
  - Using Label API? YES ✅ NO ❌

- [ ] Is null/undefined handling present?
  ```javascript
  // ✅ CORRECT - handles missing labels
  node.labels?.some(label => label.name === 'nogravity')
  
  // ❌ WRONG - crashes if node.labels is null
  node.labels.some(label => label.name === 'nogravity')
  ```
  - Safe access with `?.`? YES ✅ NO ❌

### Code Patterns

- [ ] Is the behavior check in ONE place (preferably)?
  - YES ✅ Good design
  - NO ❌ **Request:** Consolidate checks

- [ ] Is the behavior check clear and well-commented?
  ```javascript
  // ✅ GOOD - Clear intent
  const hasNoGravity = node.labels?.some(label => label.name === 'nogravity');
  if (hasNoGravity) {
      // Skip gravity calculation for nodes marked with nogravity label
      return Vector(0, 0);
  }
  
  // ❌ BAD - Unclear
  if (node.labels?.some(label => label.name === 'nogravity')) return Vector(0, 0);
  ```
  - Clear and commented? YES ✅ NO ❌

- [ ] Are there any anti-patterns used?
  ```javascript
  // ❌ ANTI-PATTERNS TO REJECT:
  if (node.isBannerUINode) { }           // Direct property
  if (node.label.includes('gravity')) { }  // String matching
  if (node.name.startsWith('banner_')) { } // Name pattern matching
  if (node.type === 'SPECIAL') { }       // Type matching
  ```
  - No anti-patterns found? YES ✅ NO ❌

### Label Definition

- [ ] Is the label defined in `Label.js`?
  - YES ✅ 
  - NO ❌ **Request:** Define in Label.js

- [ ] Does the label have a clear description comment?
  ```javascript
  let nogravityLabel = this.addLabel('nogravity', [nodeLabel], {
      // Clear description of what this label means and does
  });
  ```
  - YES ✅ NO ❌ **Request:** Add documentation

- [ ] Is the label name consistent with existing labels?
  - Lowercase, descriptive, no underscores
  - YES ✅ NO ❌ **Request:** Rename

- [ ] Does the label have proper inheritance?
  ```javascript
  // ✅ CORRECT - inherits from nodeLabel
  this.addLabel('nogravity', [nodeLabel], { })
  
  // ❌ WRONG - no dependency specified
  this.addLabel('nogravity', [], { })
  ```
  - Proper parent label specified? YES ✅ NO ❌

### Label Usage in Node Creation

- [ ] Is the label applied when creating nodes?
  ```javascript
  // ✅ CORRECT
  new Node(world, parent, 'node banner nogravity', { })
  
  // ❌ WRONG - label not in creation string
  const node = new Node(world, parent, 'node banner', { })
  node.isBannerUINode = true;  // Setting property instead
  ```
  - Label in constructor string? YES ✅ NO ❌

- [ ] Is the label combination consistent?
  - All top nodes should have: `'node banner nogravity'`
  - All bottom nodes should have: `'node banner'` (NO nogravity)
  - YES ✅ NO ❌ **Request:** Make consistent

---

## Documentation Review

- [ ] Is the label documented in `LABEL-API-GUIDE.md`?
  - YES ✅ Excellent
  - NO ❌ **Request:** Add documentation

- [ ] Does the documentation include:
  - [ ] Purpose/description
  - [ ] Which object types (node/tensor)
  - [ ] What behaviors it enables
  - [ ] Examples of usage
  - [ ] Any conflicts with other labels

- [ ] Is the behavior explained in code comments?
  ```javascript
  // ✅ GOOD - Clear why we're checking
  const hasNoGravity = node.labels?.some(label => label.name === 'nogravity');
  if (hasNoGravity) {
      // Skip gravity calculation for nodes marked with nogravity label
      // (Top banner nodes are held by springs, not gravity)
      return Vector(0, 0);
  }
  ```
  - Comments explain intent? YES ✅ NO ❌

---

## Testing Review

- [ ] Is there a test that verifies the label is applied correctly?
  ```javascript
  // Test should verify:
  // 1. Node has the label when created
  // 2. Behavior changes based on label presence
  // 3. Query returns node with label
  ```
  - Tests present? YES ✅ NO ⚠️ (request if critical)

- [ ] Do tests use Label API (not direct property checks)?
  - YES ✅ NO ❌ **Request:** Update tests

---

## Architecture Review

### Consistency Check

- [ ] Does this follow the same pattern as existing labels?
  - Example: `nogravity` label follows same pattern as `field`, `spring`
  - YES ✅ NO ❌ **Request:** Match existing patterns

- [ ] Are there any other places that should use this label?
  - Searched codebase for similar checks?
  - YES ✅ Already found and updated
  - NO → **Request:** Search for similar patterns

### Future Extensibility

- [ ] Could this label be used elsewhere?
  - YES → Is it generic enough to apply broadly?
  - NO → Is it specific enough to be clear?
  - Consider making reusable if appropriate

- [ ] Are related labels already defined?
  ```javascript
  // Good related set:
  this.addLabel('nogravity', ...);    // Exclude from gravity
  this.addLabel('moveable', ...);     // Subject to forces
  this.addLabel('interactive', ...);  // Responds to input
  ```
  - Label fits into existing system? YES ✅ NO ❌

---

## Final Approval Checklist

**ALL of the following must be true to approve:**

- [ ] Changes follow label-driven design principle
- [ ] Label defined in Label.js with documentation
- [ ] Label uses proper Label API for queries
- [ ] No direct property checks for behavior
- [ ] No string pattern matching instead of Label API
- [ ] Code is commented explaining behavior
- [ ] Label documented in LABEL-API-GUIDE.md
- [ ] Tests use Label API, not property checks
- [ ] Consistent with existing label patterns
- [ ] No anti-patterns present

**Missing items?** → Request changes before approval

---

## Common Issues to Watch For

### Issue 1: Forgotten Label Definition
```javascript
// ❌ WRONG - Label not defined in Label.js
const hasBehavior = node.labels?.some(l => l.name === 'mybehavior');
```
**Fix:** Add to Label.js first

### Issue 2: String Pattern Matching
```javascript
// ❌ WRONG - Using string matching
if (node.label?.includes('special')) { }
```
**Fix:** Use `node.labels?.some(l => l.name === 'special')`

### Issue 3: Direct Property Check
```javascript
// ❌ WRONG - Setting property instead of using label
this.isBannerUI = true;
```
**Fix:** Use `'node banner'` in constructor

### Issue 4: Inconsistent Label Usage
```javascript
// ❌ WRONG - Some nodes have label, some have property
node1 = new Node(..., 'node banner nogravity', {});
node2 = new Node(..., 'node banner', { isBannerUI: true });
```
**Fix:** All should use same label approach

### Issue 5: Missing Null Checks
```javascript
// ❌ WRONG - Crashes if labels undefined
node.labels.some(l => l.name === 'x')
```
**Fix:** Use `node.labels?.some(...)`

### Issue 6: Undocumented Label
```javascript
// ❌ WRONG - Label exists but not documented
this.addLabel('myspecial', [nodeLabel], {});
// No comment!
```
**Fix:** Add description comment in Label.js

---

## Template: Approval Comment

**For APPROVE:**
```markdown
✅ Approved - Label-driven design implemented correctly

- Label properly defined in Label.js
- Uses Label API for all queries
- Documented in LABEL-API-GUIDE.md
- No hidden properties or flags
- Consistent with existing patterns
- Ready to merge
```

**For REQUEST CHANGES:**
```markdown
⚠️ Requested Changes - Label-driven design issues

1. [ ] Move property to label definition (Label.js)
2. [ ] Replace string matching with Label API
3. [ ] Add null-safe access (?.`)
4. [ ] Document in LABEL-API-GUIDE.md
5. [ ] Update tests to use Label API

Please address and re-request review.
```

---

## Quick Reference

| Check | Question | Pass | Fail |
|-------|----------|------|------|
| **Design** | Could this be a label? | Label defined | Add label |
| **Implementation** | Using Label API? | Proper syntax | Fix queries |
| **Safety** | Null-safe checks? | Has `?.` | Add `?.` |
| **Anti-patterns** | Any forbidden patterns? | No matches | Remove |
| **Documentation** | Documented? | In LABEL-API-GUIDE.md | Add docs |
| **Testing** | Tests use Label API? | Yes | Update tests |
| **Consistency** | Matches existing? | Yes | Refactor |
| **Approval** | Ready to merge? | All ✅ | Needs work |

---

## Need Help?

- **Unsure if this should be a label?** → Read BEHAVIOR-VS-PROPERTY-DECISION-TREE.md
- **How to implement labels?** → See ARCHITECTURE-LABEL-DRIVEN-DESIGN.md
- **Label API examples?** → Check LABEL-API-GUIDE.md
- **Current labels?** → Look at Label.js
- **Still unclear?** → Ask for architectural review
