# Manual Zoom Testing Quick Start

## Step 1: Start the Development Server

```bash
npm run dev
```

This starts the Vite dev server on `http://localhost:5173`

## Step 2: Open the Automated Test Runner

Navigate to:
```
http://localhost:5173/test-zoom-runner.html
```

You'll see a purple test panel with controls to configure and run tests.

## Step 3: Configure Zoom Range (Optional)

The default range (10^-9 to 10^15) is already set. To customize:

- **Min Exponent**: Change the minimum scale (e.g., -6 for 10^-6 / micrometers)
- **Max Exponent**: Change the maximum scale (e.g., 6 for 10^6 / kilometers)
- **Step Size**: Adjust spacing (smaller = more tests, larger = faster)
- Click **Preview Zoom Levels** to see all levels that will be tested

## Step 4: Run Tests

Choose one of these buttons:

1. **Run Full Test Suite** - All 4 test types across all zoom levels
2. **Run Coordinate Tests Only** - Test screen↔world coordinate mapping
3. **Run Pan Tests Only** - Test pan offset stability during zoom
4. **Run Pointer Tests Only** - Test pointer mapping consistency

## Step 5: Review Results

### In the Browser Console (F12 → Console tab)

You'll see ASCII output like:

```
================================================================================
ZOOM INDEPENDENCE TEST SUITE
Testing 16 zoom levels from nano to lightyear scale
================================================================================

Test 1: Coordinate Transformation (screen → world → screen)
--------------------------------------------------------------------------------
✓ Zoom 10^-9.0 (factor: 1.00e-9): error=0.00e+00 (tolerance: 1.00e-06)
✓ Zoom 10^-7.5 (factor: 3.16e-8): error=0.00e+00 (tolerance: 1.00e-06)
✓ Zoom 10^-6.0 (factor: 1.00e-6): error=0.00e+00 (tolerance: 1.00e-06)
...
```

- **✓** = PASSED
- **✗** = FAILED (report this!)

### In the Browser UI (Below buttons)

- Green boxes = passed tests
- Red boxes = failed tests
- Click to expand and see detailed error data

## Step 6: Run Manual Testing in the App

Once automated tests pass:

1. Open the main Truss app: `http://localhost:5173/Truss.html`

2. Test zoom behavior:
   - Use **mouse wheel** to zoom in/out
   - Use **pinch gesture** (trackpad/touchscreen) to zoom
   - Verify **banner stays smooth** and doesn't distort
   - Check **pointer position tracking** (cursor should follow finger positions)

3. Test at extreme scales:
   - Zoom in very far (banner should be readable, physics smooth)
   - Zoom out very far (banner should be small dot, physics consistent)
   - Pan around at different zoom levels (offset shouldn't jump)

4. Test banner physics:
   - Create a truss with banner
   - Zoom to different scales
   - Verify banner tension forces behave consistently

## What to Look For

### ✓ Good Signs
- Tests show all green checkmarks
- No console errors about NaN or Infinity
- Banner renders smoothly at all zoom levels
- Pointer position matches actual finger/cursor
- Pan offset doesn't drift when zooming

### ✗ Red Flags
- Test boxes show red ✗ marks
- Console shows "Cannot read property of undefined" or "NaN"
- Banner distorts or jumps at certain zoom levels
- Pointer position is offset from actual position
- Pan position corrupts after zooming

## Troubleshooting

### Tests Won't Load
- Check browser console for import errors
- Ensure `npm run dev` is running
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### All Tests Fail with "Cannot read property"
- Check that TrussView, Vector, and ZoomIndependenceTest imported correctly
- Verify file paths in test-zoom-runner.html match actual file locations
- Check browser console for specific error

### Some Specific Zoom Levels Fail
- This might be expected at extreme scales (> 10^12 or < 10^-6)
- JavaScript floats have precision limits
- Check if error is still within acceptable tolerance
- Try reducing the zoom range (e.g., -6 to 12 instead of -9 to 15)

### Performance is Slow
- Reduce zoom level count (increase Step Size)
- Run "Coordinate Tests Only" first (fastest test)
- Close other browser tabs
- Try in a headless browser or Node.js environment

## Next Steps After Testing

Once manual testing confirms the banner works well at all scales:

1. **Performance Testing** - Run profiler at various zoom levels
2. **Edge Case Testing** - Test rapid zoom changes, extreme values
3. **Documentation** - Document any numerical precision limits found
4. **Integration** - Merge changes into main branch

## Questions or Issues?

Refer to:
- `Javascript/Tests/README.md` - Detailed test documentation
- `docs/DEVELOPMENT.md` - Development setup
- `docs/ARCHITECTURE.md` - System design
