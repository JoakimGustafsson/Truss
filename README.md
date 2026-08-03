# Truss

JavaScript physics engine and interactive editor for 2D truss-like node/tensor networks.

## What this project contains

- Browser runtime and editor UI in `Truss.html` and `Javascript\`
- Frontend Vite tooling in the repository root
- Node/Express backend in `Node.js\app.js` for save/load and file listing
- Scene/save data in `Saves\`
- Static assets in `Resources\` and styles in `Stylefiles\`

## Documentation

- [Development guide](docs\DEVELOPMENT.md) - setup, run commands, and workflow notes
- [Architecture](docs\ARCHITECTURE.md) - runtime structure, terminology, and core concepts
- [Labels](docs\LABELS.md) - label-driven design, Label API, and review guidance
- [Gravity and physics](docs\GRAVITY-AND-PHYSICS.md) - field tensors, gravity wells, banner physics, and tuning notes
- [Input and coordinates](docs\INPUT-AND-COORDINATES.md) - world/display/admin planes, coordinate conversion, and mouse input rules
- [Testing](docs\TESTING.md) - build, smoke, and zoom/banner test guidance
- [Status](docs\STATUS.md) - known blockers and cleanup status
