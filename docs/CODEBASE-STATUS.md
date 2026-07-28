# Codebase status and blockers

## Summary

Merge conflict markers have been removed in this branch, keeping the newer `Universe`/`World`-based runtime side for conflicted files.

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
