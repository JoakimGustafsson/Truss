# Zoom Independence Test Suite

## Overview

This test suite verifies that Truss banner physics and coordinate transformations work correctly across extreme zoom levels, from nano (10^-9) to lightyear (10^15) scales.

## Files

- **`Javascript/Tests/zoom-independence.test.js`** - Core test framework and test methods
- **`test-zoom-runner.html`** - Interactive browser-based test runner with UI
- **`README.md`** - This file

## Running Tests

### Method 1: Browser Test Runner (Recommended for manual testing)

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the test runner in your browser:
   ```
   http://localhost:5173/test-zoom-runner.html
   ```

3. Configure test parameters:
   - **Min Exponent**: Minimum zoom level (default: -9 = 10^-9)
   - **Max Exponent**: Maximum zoom level (default: 15 = 10^15)
   - **Step Size**: Spacing between zoom levels (default: 1.5)

4. Click buttons to run tests:
   - **Run Full Test Suite** - All four test types
   - **Run Coordinate Tests Only** - Coordinate transformation accuracy
   - **Run Pan Tests Only** - Pan offset stability
   - **Run Pointer Tests Only** - Pointer mapping consistency

5. Review results in the browser console and UI

### Method 2: Command Line / Node.js

```javascript
// In a Node.js context, after importing the module:
import ZoomIndependenceTest from './Javascript/Tests/zoom-independence.test.js';
import { TrussView } from './Javascript/View/TrussView.js';
import { Vector } from './Javascript/Primitives.js';

// Create test instance
const test = new ZoomIndependenceTest();

// Create mock view
const mockNode = {
  canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
  element: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
  lockedRatio: false,
};
const view = new TrussView(new Vector(100, 100), mockNode);

// Run tests
const results = test.runFullSuite(view);
```

## Test Categories

### 1. Coordinate Transformation Tests

**Purpose**: Verify that screen-to-world and world-to-screen coordinate conversions are accurate across all zoom levels.

**What it tests**:
- Convert screen position (50, 50) to world coordinates
- Convert back to screen coordinates
- Verify round-trip accuracy (error < tolerance)

**Success Criteria**: Error < 1e-6 at all zoom levels

### 2. Pan Consistency Tests

**Purpose**: Verify that panning an offset, then zooming, doesn't corrupt the pan position.

**What it tests**:
- Pan by (10, 20) world units
- Apply zoom transformation at center
- Check if pan offset drifted after zoom
- Verify offset stability

**Success Criteria**: Drift < max acceptable (typically < 1e-6)

### 3. Pointer Mapping Tests

**Purpose**: Verify that the same screen position always maps to the same world position (consistency).

**What it tests**:
- Convert screen position (0, 0), (100, 100), etc. to world coordinates
- Call conversion twice
- Verify both conversions produce identical results

**Success Criteria**: All test points map consistently (difference < 1e-10)

### 4. Banner Force Scaling Tests

**Purpose**: Verify that banner forces remain valid numbers (finite, non-NaN) across zoom levels.

**What it tests**:
- Calculate banner tensor forces at each zoom level
- Check that force magnitudes are finite
- Check that forces are non-negative

**Success Criteria**: All forces are valid (isFinite = true, !isNaN, >= 0)

## Zoom Range

The test suite covers 16 zoom levels using logarithmic spacing:

| Exponent | Scale Factor | Description |
|----------|--------------|-------------|
| -9       | 10^-9        | Nano scale (attometer) |
| -7.5     | 10^-7.5      | Femto range |
| -6       | 10^-6        | Micro scale (micrometer) |
| -4.5     | 10^-4.5      | Sub-milli range |
| -3       | 10^-3        | Milli scale (millimeter) |
| -1.5     | 10^-1.5      | Sub-unit range |
| 0        | 1            | **Standard scale (1:1)** |
| 1.5      | 10^1.5       | ~30x zoom |
| 3        | 10^3         | Kilo scale (kilometer) |
| 4.5      | 10^4.5       | Mega range |
| 6        | 10^6         | Mega scale (megameter) |
| 7.5      | 10^7.5       | Giga range |
| 9        | 10^9         | Giga scale (light-second) |
| 10.5     | 10^10.5      | Tera range |
| 12       | 10^12        | Tera scale (AU) |
| 13.5     | 10^13.5      | Peta range |
| 15       | 10^15        | Lightyear scale |

## Interpreting Results

### Console Output

The test suite outputs results to the browser console in this format:

```
================================================================================
ZOOM INDEPENDENCE TEST SUITE
Testing 16 zoom levels from nano to lightyear scale
================================================================================

Test 1: Coordinate Transformation (screen → world → screen)
--------------------------------------------------------------------------------
✓ Zoom 10^-9.0 (factor: 1.00e-9): error=0.00e+00 (tolerance: 1.00e-06)
✓ Zoom 10^-7.5 (factor: 3.16e-8): error=0.00e+00 (tolerance: 1.00e-06)
...
```

- **✓** = Test passed
- **✗** = Test failed
- **error** = Maximum error between original and round-trip value
- **tolerance** = Maximum acceptable error

### Browser UI Results

The test runner displays results with color-coded sections:
- **Green border (left)** = Test passed
- **Red border (left)** = Test failed
- Expandable details showing full test data

## Troubleshooting

### Tests Failing at Extreme Scales

**Issue**: Tests fail at very high or very low zoom levels (> 10^12 or < 10^-6)

**Possible Causes**:
1. Floating-point precision limits (JavaScript numbers are 64-bit floats)
2. View scale calculations becoming very small/large
3. Numerical instability in coordinate conversions

**Resolution**:
- Adjust tolerance dynamically based on zoom level
- Use relative error instead of absolute error at extreme scales
- Consider using BigInt or arbitrary precision libraries for extreme cases

### Pointer Mapping Inconsistencies

**Issue**: Same screen position maps to different world positions

**Possible Causes**:
1. `worldPosition()` or `x()`/`y()` methods are stateful
2. View offset/scale changing during test
3. Caching issue in view calculations

**Resolution**:
- Verify `recalculate()` is called after each zoom/pan
- Check that offsets and scales are persisted correctly
- Review coordinate transformation math

### Performance Issues

**Issue**: Tests complete very slowly or timeout

**Possible Causes**:
1. Large number of zoom levels being tested
2. Complex banner force calculations
3. DOM operations in browser

**Resolution**:
- Reduce zoom level count (increase step size)
- Test in headless mode or Node.js instead of browser
- Profile with DevTools to identify bottlenecks

## Future Improvements

- [ ] Add direct banner node and tensor testing
- [ ] Test with actual Physics Engine calculations
- [ ] Add regression test suite for CI/CD
- [ ] Generate performance graphs
- [ ] Add visualization of coordinate mappings
- [ ] Support custom zoom level lists
- [ ] Export test results to CSV/JSON for analysis
