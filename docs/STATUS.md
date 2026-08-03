# Status

This file tracks current known blockers and cleanup status for the repository.

## Known issues

### Zoom in/out corrupts offsets

- **Location:** `Javascript\View\PanZoomHandler.js`
- **Description:** Mouse wheel zoom previously used element-local coordinates as viewport coordinates when updating scale.
- **Status:** A regression test now verifies that zooming around an element-local point keeps the same world point under the cursor. `TrussView.updateScale()` now treats its zoom origin as element-local.
- **TODO:** Browser-smoke-test wheel zoom and separately review two-pointer pinch behavior for the same invariant.

### Touchpad scroll/pan behavior

- **Location:** `Javascript\View\PanZoomHandler.js`
- **Description:** Touchpad two-finger scroll/pan works, but diagonal or circular motions can lock to cardinal directions.
- **Impact:** Touchpad interaction is usable but not smooth.
- **Status:** Not currently blocking; future improvement recommended if touchpad usability becomes a priority.

## Cleanup status

Historical merge-conflict markers were removed in this branch, keeping the newer `Universe`/`World` runtime path as canonical.

To re-check:

```bash
rg "^(<<<<<<<|=======|>>>>>>>)"
```

Expected result: no matches.

Documentation has been consolidated into the smaller set linked from `README.md`; old planning, Q&A, status, summary, and one-off report files were absorbed or removed.

## Recommended next technical milestone

1. Run a browser smoke test with either the Vite dev server or the backend server.
2. Validate save/load and editor interaction paths.
3. Browser-smoke-test pan/zoom, selector alignment, and banner behavior after the new regression tests.
