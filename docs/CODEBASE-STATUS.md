# Codebase status and blockers

## Summary

Merge conflict markers have been removed in this branch, keeping the newer `Universe`/`World`-based runtime side for conflicted files.

## Known issues

### Zoom in/out corrupts offsets
- **Location:** `Javascript/View/PanZoomHandler.js`
- **Description:** When zooming in or out using pinch gestures or mouse wheel, pointer position offsets become corrupted. The pan position drifts unexpectedly after zoom operations.
- **Impact:** Pan/zoom behavior is visually incorrect after scaling; pointer coordinates don't map correctly to canvas position.
- **TODO:** Review `PanZoomHandler.pointermove_handler()` zoom calculation logic, particularly lines 140–157 and the `updateScale()` method call.

## Conflict cleanup status

The following files were conflict-resolved:

- `Truss.html`
- `Javascript/FileSave.js`
- `Javascript/Primitives.js`
- `Javascript/Tensors.js`
- `Javascript/Truss.js`
- `Javascript/View.js`
- `Javascript/Pictures.js`
- `Javascript/Nodes/Node.js`
- `Javascript/Nodes/TrussNode.js`
- `Javascript/Nodes/CollectionNode.js`
- `Javascript/Nodes/Actuators.js`
- `Javascript/Nodes/PictureNode.js`
- `Javascript/Nodes/Sensors.js`
- `Javascript/ParameterEditor/Property.js`
- `Javascript/ParameterEditor/BannerNode.js`

Verification command:

```bash
rg "^(<<<<<<<|=======|>>>>>>>)"
```

Expected result: no matches.

## Secondary setup blocker

`Node.js/app.js` requires `express` and `formidable`, but the repo has no committed `package.json` yet.  
Install manually for now (see [DEVELOPMENT.md](DEVELOPMENT.md)).

## Recommended next technical milestone

1. Run a browser smoke test via `node Node.js/app.js` and validate save/load and editor interaction paths.
2. Keep the `Universe`/`World` runtime path as the canonical implementation and remove dead legacy fragments over time.
