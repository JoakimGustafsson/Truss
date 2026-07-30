# Y-Axis Flip: Screen Coordinates to Mathematical Coordinates

## Goal
Flip the Y-axis so that **negative Y = down** (mathematical standard) instead of **positive Y = down** (screen standard).

Current: Y increases downward (screen coords)
Target: Y increases upward (mathematical coords)

## Impact Analysis

### Files Affected
- [ ] **Primitives.js** - Vector math (add, subtract, normalize, etc.)
- [ ] **Node.js** - Node positions, velocity, forces
- [ ] **Tensors.js** - Tensor positions, equilibriumLength logic
- [ ] **TensorForces.js** - All force calculators (Spring, Pull, Push, Field, Absorber)
- [ ] **TrussView.js** - Canvas rendering (flip Y when drawing)
- [ ] **PanZoomHandler.js** - Mouse/touch input (flip Y coordinates)
- [ ] **BannerNode.js** - Banner positioning and springs
- [ ] **FileSave.js** - Load/save positions (might need versioning)
- [ ] All files that create nodes/positions with hardcoded Y values

### Data Affected
- [ ] All saved .json files (positions will be inverted)
- [ ] Physics simulation (gravitational direction will flip)
- [ ] Canvas rendering (top/bottom swapped visually)

## Implementation Strategy

### Phase 1: Core Vector & Node Math (Non-Breaking)
1. **Identify the flip point**: Choose where to invert Y
   - Option A: Invert in View.worldPosition() (conversion layer)
   - Option B: Flip in Node/Tensor storage
   - Option C: Flip in TrussView.y() renderer
   
   **Recommendation**: Do it in View layer (TrussView.x/y and worldPosition) so physics stays mathematical internally

2. [ ] Modify View.y() to return negative of current calculation
3. [ ] Modify View.worldPosition() to flip Y
4. [ ] Modify View.worldPositionWithOffset() to flip Y
5. [ ] Modify PanZoomHandler mouse/touch input to flip Y coordinates
6. [ ] Test node selection and dragging still works

### Phase 2: Physics Checks
1. [ ] Verify gravity pulls DOWN (negative Y direction)
2. [ ] Test spring force calculations
3. [ ] Verify node velocity calculations
4. [ ] Check absorber damping still works

### Phase 3: Canvas Rendering
1. [ ] Verify circles/lines render at correct positions
2. [ ] Check that node positioning via warpMatrix still works
3. [ ] Test banner positioning

### Phase 4: Input Handling
1. [ ] Mouse clicks map to correct nodes
2. [ ] Touch input selects correct nodes
3. [ ] Node dragging works in correct direction

### Phase 5: Save File Migration
1. [ ] Decide: Version save files or auto-flip on load?
2. [ ] Add migration logic if auto-flip needed
3. [ ] Test loading old saves with Y-flipped

### Phase 6: Hardcoded Positions
Search codebase for hardcoded Y values:
1. [ ] BannerNode.js - banner corners
2. [ ] Any initial node positions
3. [ ] Gravity well position
4. [ ] UI element positioning

## Detailed Changes

### TrussView.js
```javascript
// Current (screen coords, Y down)
y(p) {
    return (p.y - this.offset.y) / this.yScale;
}

// New (math coords, Y up)
y(p) {
    // Need to flip: either negate here or adjust offset
    return -(p.y - this.offset.y) / this.yScale;
    // Or: (this.offset.y - p.y) / this.yScale;
}

// Same for worldPosition
worldPosition(x, y) {
    return new Position(
        x * this.xScale + this.offset.x,
        -y * this.yScale + this.offset.y  // flip Y
    );
}
```

### PanZoomHandler.js
```javascript
// When converting client coords to world
_clientToLocal(clientX, clientY) {
    const rect = this.sensorElement.getBoundingClientRect();
    return { 
        x: clientX - rect.left, 
        y: -(clientY - rect.top)  // flip Y
    };
}
```

### Gravity Well Position
```javascript
// Current (Y=-6371000 below)
'localPosition': ...(screenWidth / 2, -6371000)

// New (Y=-6371000 is now DOWN mathematically)
// This should work correctly without change!
// Because down is now negative Y
```

## Testing Checklist
- [ ] Node positions display correctly
- [ ] Node dragging works in all directions
- [ ] Gravity pulls nodes DOWN
- [ ] Spring forces work correctly
- [ ] Banner hangs properly
- [ ] Zoom doesn't distort positions
- [ ] Pan works in all directions
- [ ] Touch input selects correct nodes
- [ ] Save/load doesn't corrupt data

## Rollback Plan
If things break badly:
1. Git has all changes committed
2. Can revert with `git revert <commit>`
3. Or create a new branch for Y-axis experiments

## Notes
- This is a **coordinate system flip**, not a rendering flip
- Physics should become more intuitive (down = -Y, up = +Y)
- After this, banner zoom-independence will be easier to reason about
- Banner plan can resume once Y-flip is stable
