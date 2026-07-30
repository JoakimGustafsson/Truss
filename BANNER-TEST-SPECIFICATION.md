# Banner Position Test Specification - Visual Guide

## Banner Layout at Standard Zoom

```
                Canvas (800×600px)
    ┌─────────────────────────────────┐
    │                                 │
0%  │                                 │
    │  ┌──────────────────┐           │
5%  │  │ ✕ (hanger nail)  │           │  Target: Right edge, 5-20% ±10%
    │  │ /      |      \  │           │  ✨ Hanger MUST hang (min 5%)
    │  ├────────┴────────┤           │
10% │  │ Left  │  Right   │           │  Both top nodes should be
    │  │       │          │           │  at same height here
    │  │       │          │           │
20% │  │       │          │           │
    │  ├───────┴──────────┤           │
    │  │                  │           │
40% │  │   (banner area)  │           │
    │  │                  │           │
    │  ├────────┬────────┤           │
80% │  │ Left   │ Right   │           │  Bottom nodes: 60-100% ±10%
    │  │ Bottom │ Bottom  │           │  (which is 0-40% up from bottom)
    │  └────────┴────────┘           │
    │                                 │
100%│                                 │
    └─────────────────────────────────┘
    0%                              100%
         (70% left of right edge)    (right edge)
         
Left Top X:      70% ± 10% → 60%-80%
Right Top X:    98% ± 10% → 88%-110%
Top Y:           5-20% (5% is HARD FLOOR, ±10% only on upper limit → 5% to 30%)

Left Bottom X:   70% ± 10% → 60%-80%
Right Bottom X: 98% ± 10% → 88%-110%
Bottom Y:       60-100% ± 10% → 50%-110%
```

## Position Criteria Checklist

### Upper Nodes (Y: 5% HARD FLOOR to 20% with ±10% upper tolerance = 5% to 30%) ✨ *Hanger MUST hang*

| Node | X Position | Y Position | Status |
|------|-----------|-----------|--------|
| **Left Top** | 70% ±10% (60-80%) | 5% to 30% | ✓ |
| **Right Top** | 98% ±10% (88-110%) | 5% to 30% | ✓ |

### Lower Nodes (Y: 60-100% ±10% = 50% to 110% from top)

| Node | X Position | Y Position | Status |
|------|-----------|-----------|--------|
| **Left Bottom** | 70% ±10% (60-80%) | 50% to 110% | ✓ |
| **Right Bottom** | 98% ±10% (88-110%) | 50% to 110% | ✓ |

## Test Execution Flow

```
For each zoom level (10^-14 to 10^14):
  ↓
  1. Create banner with 4 nodes + 5 tensors
  ↓
  2. Set zoom level in view
  ↓
  3. Run physics simulation for 3000ms
     - Frame time: 16ms (~60fps)
     - Total frames per level: ~188 frames
  ↓
  4. Collect final node positions
  ↓
  5. Convert to screen coordinates
  ↓
  6. Check 8 position criteria
     - Each node: X and Y position
     - Each position: pass if within tolerance
  ↓
  7. Report: (passed criteria / 8 total)
  ↓
  Next zoom level
```

## Output Interpretation

### PASS Case (all 8 criteria met)
```
[15/29] Testing 10^0... ✓ PASS (8/8)
```
→ At 1:1 zoom, all node positions within tolerances

### FAIL Case (some criteria fail)
```
[25/29] Testing 10^10... ✗ FAIL (6/8)
      Right Top X (right edge ±10%): 620 (expected 784-816)
      Right Bottom X (right edge ±10%): 620 (expected 784-816)
```
→ Right nodes too far left; left 2 pixels short of expected range

## Position Mapping Example

At 800×600px canvas with zoom 10^0 (1:1 scale):

| Node | Target % | Target px | Tolerance px | Acceptable Range |
|------|---------|-----------|--------------|------------------|
| Left Top X | 70% | 560 | ±80 | 480-640 |
| Right Top X | 98% | 784 | ±80 | 704-864 |
| Top Y | 10% (avg) | 60 | ±60 | 0-120 |
| Left Bottom X | 70% | 560 | ±80 | 480-640 |
| Right Bottom X | 98% | 784 | ±80 | 704-864 |
| Bottom Y | 80% (avg) | 480 | ±60 | 420-540 |

## Physics Simulation Details

### Banner Physics Model
- **Nail (anchor)**: Fixed position, zero mass
- **Top nodes**: Mass 1, 90% velocity damping per frame
- **Bottom nodes**: Mass 3, 90% velocity damping per frame
- **Tensors**: Spring constants create restoring forces

### Force Calculations
Each tensor applies force:
```
force = -constant × (distance - equilibriumLength) / distance
```

After 3 seconds:
- Spring tensions reach equilibrium (or close to it)
- Velocity approaches zero due to damping
- Position settles into stable configuration
- Result should be reproducible at any zoom level

## Success Indicators

✅ **All zoom levels pass**: Physics is zoom-independent
✅ **Consistent pass pattern**: No systematic offsets
✅ **Small deviations acceptable**: Natural variation in physics solver

❌ **All zoom levels fail**: Fundamental coordinate problem
❌ **Only extreme levels fail**: Floating-point precision at scale limits
❌ **Systematic offset**: Force calculation or scaling issue

## Customization Guide

### To adjust position targets:

```javascript
// In checkBannerPositions():
const criteria = {
  leftTopX: {
    min: screenWidth * 0.65,  // Was 0.70 - 0.10
    max: screenWidth * 0.75,  // Was 0.70 + 0.10
    // ... rest of criteria
  }
};
```

### To adjust tolerance:

```javascript
// Global tolerance adjustment:
const tolerance = screenWidth * 0.15;  // Was 0.10 (10%)
```

### To adjust stabilization time:

```javascript
test.stabilizationTime = 1000;  // 1 second instead of 3 seconds
```

### To test different zoom range:

```javascript
test.zoomLevels = [];
for (let exp = -10; exp <= 10; exp += 1) {
  test.zoomLevels.push(Math.pow(10, exp));
}
```

## Expected Results

Normal pass rate at all scales: **> 95%**

Small failures (< 5% zoom levels): Acceptable, likely due to:
- Floating-point precision at extreme scales
- Physics solver initialization at specific scales
- Random variation in numerical simulation

Pattern failures (consistent failures at specific scales): Investigate:
- Coordinate transformation at that scale
- Physics force calculation
- Zoom application order

## Integration Testing

After banner position tests pass, verify:

1. ✅ Manual zoom in/out smooth
2. ✅ Banner physics visible at all zoom levels
3. ✅ No visual distortion or flickering
4. ✅ Pointer position tracking accurate
5. ✅ Pan operations don't corrupt offset
6. ✅ Performance acceptable (no lag)
