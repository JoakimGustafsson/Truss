# Banner Zoom-Independent Physics Plan

## Goal
Make banner behave consistently across all zoom levels (extreme zoom in/out), while maintaining visibility as ~1/3 of canvas width and allowing proper physics simulation.

## Current State
- Banner corners at: leftTop (18.22, 0), rightTop (30.82, 0), leftBottom (18.22, 10.8), rightBottom (30.82, 10.8)
- Width: ~12.6 world units, Height: 10.8 world units
- Springs: constant=20000, dampening=40
- Node masses: leftTop/rightTop=1, leftBottom/rightBottom=3, nail=NaN
- Gravity well: positioned at Y=-6,371,000 (Earth's radius) but NOT connected
- Logging: 10-second position dumps with zoom level added

## Issues to Fix

### 1. Gravity Direction
- [ ] Verify gravity well pulls DOWN (not up)
- [ ] Current setup: gravity well is below (Y=-6,371,000), but no active field tensors
- [ ] Need to re-enable gravity with proper Earth physics constants

### 2. Zoom-Dependent Scaling
When user zooms in/out, worldViewSize changes but banner constants don't:
- **Problem**: Spring constants (20000) assume a specific world scale
  - If zoom out 10x, nodes get 10x farther apart but springs aren't 10x weaker → over-stiff
  - If zoom in 10x, nodes get 10x closer but springs aren't 10x stronger → under-stiff
- **Solution**: Make spring constants scale with zoom level
  - constant = baseConstant / (worldViewSize / baseWorldViewSize)
  - Or: constant = baseConstant * (referenceScale / currentScale)

### 3. Hanger Visibility
- **Current**: leftBand/rightBand springs (constant=5000, length=6) are very stiff
- **Goal**: Make hanging cables/tensors visible (they should sag slightly)
- **Solution**: Reduce leftBand/rightBand constants and increase damping
  - Allow some swing/deformation to show the cables
  - Or add visual representation of the hanger structure

### 4. Earth Gravity
- **Current**: bannerGravityWell has no mass, no active field
- **Goal**: Implement realistic Earth gravity on banner nodes
- **Solution**:
  - Give bannerGravityWell a mass equal to Earth's mass (or relative scale)
  - Create field tensors from each banner node to gravity well
  - Gravity constant = G * M_earth * m_node / distance²
  - This will naturally decrease with distance, realistic

### 5. Banner Width Maintenance
- **Goal**: Banner stays ~1/3 canvas width at all zoom levels
- **Current mechanism**: topBand spring holds leftTop to rightTop
- **Issue**: topBand length (18 units) is fixed, doesn't scale with zoom
- **Solution**: 
  - Track canvas width in screen pixels
  - Calculate target world width = canvas_width_px * worldViewSize.x / screen_size.x / 3
  - Adjust topBand equilibriumLength dynamically
  - Or: Let springs self-stabilize and just trust physics

## Implementation Plan

### Phase 1: Add Zoom-Aware Constants ✓ (Logging ready)
1. [x] Add zoom level to 10-second logs
2. [ ] Test at multiple zoom levels and observe deviations
3. [ ] Identify at what zoom ratio things break
4. [ ] Create zoom scaling function

### Phase 2: Fix Gravity Direction
1. [ ] Verify bannerGravityWell pulls DOWN
2. [ ] Check if we need to flip constant sign or reposition well
3. [ ] Add logging to show gravity force vectors

### Phase 3: Implement Zoom-Adaptive Springs
1. [ ] Create `getZoomScale()` method on banner
2. [ ] Apply scaling to spring constants:
   - baseConstant / zoomScale = effective constant
3. [ ] Update every frame or on zoom change
4. [ ] Test at various zoom levels

### Phase 4: Enable Earth Gravity
1. [ ] Give bannerGravityWell realistic mass
2. [ ] Re-create field tensors (remove skip in FieldCalculator for UI nodes?)
3. [ ] Or: Create special gravity handler for banner nodes only
4. [ ] Tune gravity constant to be realistic but not overwhelming

### Phase 5: Hanger Cable Visibility
1. [ ] Reduce leftBand/rightBand stiffness
2. [ ] Add visual debugging (draw cable curves)
3. [ ] Or: Make nail node moveable and allow swing

### Phase 6: Banner Width Adaptation (if needed)
1. [ ] Monitor if banner width drifts at extreme zoom
2. [ ] If yes: Adjust topBand equilibriumLength dynamically
3. [ ] Or accept minor width changes and let physics settle

## Logging Format
```
📐 Banner at zoom=50.0 (every 10s):
  leftTop:     (18.22, -0.05)
  rightTop:    (30.82, -0.05)
  leftBottom:  (18.22, 10.75)
  rightBottom: (30.82, 10.75)
  Width: 12.60, Height: 10.80
```

## Key Constants to Track
- **baseWorldViewSize**: Initial world size (use first zoom level as reference)
- **baseSpringConstant**: 20000 (current)
- **baseDampeningConstant**: 40 (current)
- **earthGravityConstant**: G * M_earth (to be determined)
- **nailPosition**: Should be fixed or have weak oscillation
- **topBandLength**: 18 units (may need dynamic adjustment)

## Success Criteria
✓ Banner visible at all zoom levels (extreme zoom in/out)
✓ Banner maintains ~1/3 canvas width
✓ Hanger cables visible and responsive to physics
✓ Gravity pulls downward consistently
✓ No stiffness artifacts from zoom scaling
✓ Smooth transitions between zoom levels
