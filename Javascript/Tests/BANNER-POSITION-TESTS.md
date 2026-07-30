# Banner Position Zoom Independence Tests

## Overview

This test suite verifies that the Truss banner physics system works correctly across extreme zoom levels, from nano (10^-14) to lightyear (10^14) scales. 

**Key Feature**: After a 3-second physics stabilization period at each zoom level, the banner nodes should settle into predictable screen positions, regardless of zoom level.

## Success Criteria

After 3 seconds of physics simulation, banner nodes must be positioned within the following ranges (with ±10% tolerance):

### Upper Nodes (Top of Banner)

| Node | X Position | Y Position |
|------|-----------|-----------|
| **Right Top** | 98-100% of width (±10%) | 0-20% from top (±10%) |
| **Left Top** | 70% of width (±10%) | 0-20% from top (±10%) |

### Lower Nodes (Bottom of Banner)

| Node | X Position | Y Position |
|------|-----------|-----------|
| **Right Bottom** | 98-100% of width (±10%) | 60-100% from top (±10%) |
| **Left Bottom** | 70% of width (±10%) | 60-100% from top (±10%) |

### Tolerance Interpretation

"0-20% ±10%" means the acceptable range is **-10% to 30%** (additive tolerance on both ends).

Example for upper right Y position:
- Target range: 0-20% of screen height
- With ±10% tolerance: -10% to 30% of screen height
- In pixels (600px tall): -60px to 180px (allows some off-screen in both directions)

## Test Parameters

- **Zoom Levels Tested**: 29 levels from 10^-14 to 10^14
  - Logarithmic scale with step of 1
  - Covers ~56 orders of magnitude
  
- **Stabilization Time**: 3000ms (3 seconds) per zoom level
  - Total test time: ~87 seconds for full suite
  - Physics engine runs at 16ms frame time (~60fps simulation)

- **Canvas Size**: 800×600px (default, configurable)

- **Success Criteria Per Level**: 8 position checks (X and Y for 4 nodes)
  - All 8 must pass for the zoom level to pass
  - Reports which specific checks failed for debugging

## How the Test Works

### 1. Banner Creation

For each zoom level:
- Creates 5 nodes: nail (anchor), 4 banner corner nodes
- Creates 5 tensors (springs/absorbers) connecting the nodes
- Positions nodes based on screen coordinates
- Converts screen positions to world positions using current zoom

### 2. Physics Simulation

- Runs physics engine for 3 seconds at 16ms frame time
- Applies spring forces between connected nodes
- Updates velocities and positions with damping
- Lets banner settle under its own physics

### 3. Position Validation

After stabilization:
- Converts node world positions back to screen coordinates
- Checks if each node's X and Y position fall within allowed ranges
- Reports percentage values for easy interpretation
- Identifies which criteria passed/failed

### 4. Results Aggregation

Outputs:
- Pass/fail for each zoom level
- Detailed position data for failed tests
- Summary statistics (pass rate, timing)
- Recommendations for debugging

## Running the Tests

### Browser Method

```bash
npm run dev
# Open: http://localhost:5173/test-zoom-runner.html
```

Then use buttons to run banner position tests.

### Node.js Method

```javascript
import { BannerPositionTest } from './Javascript/Tests/zoom-independence.test.js';
import { TrussView } from './Javascript/View/TrussView.js';
import { Vector } from './Javascript/Primitives.js';

const test = new BannerPositionTest();
const mockNode = {
  canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
  element: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
  lockedRatio: false,
};
const view = new TrussView(new Vector(100, 100), mockNode);

await test.runFullSuite(view);
```

## Understanding the Output

### Console Output Example

```
================================================================================
BANNER POSITION ZOOM INDEPENDENCE TEST SUITE
Testing 29 zoom levels from 10^-14 to 10^14
Stabilization time: 3000ms per level
================================================================================

[1/29] Testing 10^-14... ✓ PASS (8/8)
[2/29] Testing 10^-13... ✓ PASS (8/8)
[3/29] Testing 10^-12... ✓ PASS (8/8)
...
[29/29] Testing 10^14... ✗ FAIL (6/8)
      Right Top X (right edge ±10%): 620 (expected 784-816)
      Right Bottom X (right edge ±10%): 620 (expected 784-816)

================================================================================
TEST SUMMARY
================================================================================
Passed: 27/29 zoom levels
Pass Rate: 93.1%
Total Time: 87.2s
Avg Time/Level: 3.01s
✗ SOME TESTS FAILED
```

### Interpreting Failed Nodes

When a test fails, you'll see something like:

```
Left Bottom X (70% ±10%): 450 (expected 560-640)
```

This means:
- **Node**: Left Bottom node's X position
- **Actual**: 450 pixels
- **Expected**: 560-640 pixels (70% of 800px width, ±10%)
- **Gap**: 110 pixels to the right of acceptable range
- **Possible cause**: Node settled too far to the right

### Screen Position Percentages

Failed tests show percentages for quick debugging:

```
Right Top X (right edge ±10%): 800 (100.0% expected 88.0%-110.0%)
```

Positions shown as percentages make it easy to spot patterns:
- **Y position too high**: Physics pulling node upward too much
- **X position too far left**: Horizontal forces unbalanced
- **All positions off**: Zoom level creating instability

## Debugging Failed Tests

### If a specific zoom level fails:

1. **Check the zoom exponent**: Does it fail at very extreme scales (< -10 or > 10)?
   - Numerical precision issues are expected at extreme scales
   - Consider that JavaScript floats have ~15 digits of precision

2. **Check position patterns**: Do failures cluster around specific nodes?
   - Upper nodes: Banner likely too stretched or compressed
   - Bottom nodes: Gravity well forces may need adjustment
   - All nodes: Fundamental zoom/physics interaction issue

3. **Check magnitude of error**: Is the node off by pixels or screen widths?
   - Small error (< 5%): Tolerance might be too tight
   - Large error (> 20%): Actual physics or coordinate issue

### Common Causes

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| All nodes X positions too high | View scale/offset corrupted | Verify `updateScale()` logic |
| Bottom nodes Y too low | Gravity well too strong | Adjust gravity well constant |
| Bottom nodes Y too high | Gravity well too weak | Increase gravity well constant |
| All nodes scattered randomly | Physics instability | Increase damping or check node masses |
| Failures only at 10^±14 | Floating-point precision | Consider reducing tolerance at extremes |

## Customizing Success Criteria

The criteria can be easily modified by editing the `criteria` object in `checkBannerPositions()`:

```javascript
const criteria = {
  rightTopX: {
    min: screenWidth * 0.95,  // Change right edge inset
    max: screenWidth * 1.05,
    // ...
  },
  // ... other positions
};
```

Or adjust tolerance:

```javascript
const tolerance = screenWidth * 0.15;  // Change from 0.1 (10%) to 0.15 (15%)
```

## Performance Notes

- Full test suite takes ~87 seconds (3 seconds per 29 zoom levels)
- Each frame runs physics simulation at 16ms interval (~60fps)
- Memory usage: One banner set created and discarded per zoom level
- CPU impact: Moderate; suitable for background testing

### Optimization Options

To run faster:
- Reduce `stabilizationTime` (e.g., 1000ms instead of 3000ms)
- Use fewer zoom levels (e.g., step of 2 instead of 1)
- Skip very extreme levels (e.g., -10 to 10 instead of -14 to 14)

## Test Result Data

Full results include:
- `passed`: Boolean pass/fail for level
- `zoomExponent`: Log₁₀ of zoom factor
- `screenPositions`: Actual X,Y for each node
- `checks`: Details of each position criterion
- `summary`: Passed/total count

Results can be exported for analysis or graphing.

## Advanced: Running Custom Zoom Ranges

```javascript
const test = new BannerPositionTest();
test.zoomLevels = [0.001, 0.01, 0.1, 1, 10, 100, 1000];  // Custom levels
await test.runFullSuite(view);
```

Or change timing:

```javascript
test.stabilizationTime = 1000;  // 1 second instead of 3
test.frameTimeMs = 32;  // ~30fps simulation instead of 60fps
```

## Integration with CI/CD

For automated testing in pipelines:

```javascript
// check-zoom-independence.js
const test = new BannerPositionTest();
const view = createMockView();
const results = await test.runFullSuite(view);

if (results.summary.totalLevels !== results.summary.passedLevels) {
  console.error('Banner position tests failed');
  process.exit(1);
}
console.log('All tests passed!');
process.exit(0);
```

Then in `package.json`:

```json
{
  "scripts": {
    "test:zoom": "node check-zoom-independence.js"
  }
}
```
