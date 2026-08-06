# Development guide

This guide explains how to run and work on Truss locally.

## Prerequisites

- Node.js 18+ or newer LTS
- npm
- A browser for the interactive runtime

## Install dependencies

Install frontend dependencies from the repository root:

```bash
npm install
```

Install backend dependencies:

```bash
npm install --prefix Node.js
```

## Run the frontend dev server

From the repository root:

```bash
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

The zoom test runner is available at:

```text
http://localhost:5173/Javascript/Tests/test-zoom-runner.html
```

## Run the backend server

From the repository root:

```bash
node Node.js\app.js
```

Or from `Node.js\`:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

## Build

From the repository root:

```bash
npm run build
```

## Core runtime flow

1. `Truss.html` bootstraps scripts and starts the animation loop.
2. `Universe` and `World` in `Javascript\Universe.js` coordinate per-frame updates.
3. `Node`, `Tensor`, and behavior modules advance physics.
4. `Javascript\View\` renders the active world and handles pan/zoom/input.
5. Parameter editor modules expose label-backed properties for live editing.

## Save/load behavior

Client helpers in `Javascript\FileSave.js` call backend routes in `Node.js\app.js`:

- `GET /dir/:folder`
- `GET /load/:fileName`
- `POST /save`
- `POST /upload`

Save files live under `Saves\`.

## Development constraints

- Rendering and physics are real-time sensitive. Ask before changes that may downgrade rendering performance.
- Prefer label-driven behavior over new hidden flags on nodes or tensors; see [Architecture](ARCHITECTURE.md) section on labels.
- Keep coordinate systems explicit; see [Architecture](ARCHITECTURE.md) section on coordinate systems.
- Check [Status](STATUS.md) before large feature work.

## Feature development examples

### Camera follow feature

The camera follow system keeps a selected object centered on screen by continuously updating view offsets.

#### Implementation overview

1. **Toggle button** in `Javascript/View/ParameterEditor/BannerInspector.js`
   - Location: Banner header (top right, next to object name)
   - Button toggles `universe.cameraFollowMode` state
   - Button text changes: "🎥 Follow" / "🎥 Following"

2. **Follow logic** in `Javascript/main.js`
   - Function: `updateCameraFollow(selectedObject, trussNode)`
   - Called every frame when enabled
   - Runs only when `universe.cameraFollowMode` is true, an object is selected, and it has a view

3. **Camera offset calculation**
   ```javascript
   // Get selected object's world position
   objectWorldPos = selectedObject.node.localPosition
   
   // Calculate center-screen offset
   screenCenterX = view.element.clientWidth / 2
   screenCenterY = view.element.clientHeight / 2
   
   // Smooth interpolation (15% damping = smooth camera movement)
   view.offset.x = view.offset.x * 0.15 + newOffsetX * 0.85
   view.offset.y = view.offset.y * 0.15 + newOffsetY * 0.85
   ```

#### Features

✅ Smooth camera movement via interpolated offset  
✅ Zoom independent - works at any zoom level  
✅ Selection aware - disables when switching objects  
✅ Visual feedback - button highlights when active  

#### Testing

```bash
npm run dev
# Navigate to Solar System demo
# Click on Earth or any planet
# Click 🎥 Follow button in banner
# Observe: Object stays centered as it orbits
```

### Solar System demo

The Solar System demo creates a scaled 3-body simulation (Sun-Earth-Moon) plus 7 other planets using realistic Newtonian gravity.

#### Quick start

```bash
npm run dev        # Start dev server
# Navigate to http://localhost:5173
# Select "Solar System Demo" from UI
# Click "Run Physics" to start simulation
```

#### Key concepts

**Kepler's 3rd Law ensures realistic orbits:**
```javascript
// For any orbit: T² = (4π² / GM) × r³
// Rearranged for distance: r = ∛(T² × GM / 4π²)
// Orbital velocity: v = √(GM / r)
```

**Scaling system:**
- Earth orbit = 15 meters in simulation (150 million km real)
- Earth period = 60 seconds in simulation (365.25 days real)
- Gravity constant: 6.67e-11 (universal)
- Sun mass: calculated to make Earth's orbit work
- All planet masses: scaled proportionally to real ratios

**Moon dynamics:**
The Moon experiences forces from both Earth and Sun:
```javascript
// Earth-Moon gravity (Moon orbits Earth)
new Tensor(earth, moon, 'field', { constant: -6.67e-11 })

// Sun-Moon gravity (Sun pulls Moon too!)
new Tensor(sun, moon, 'field', { constant: -6.67e-11 })
```

Moon velocity combines Earth's orbital velocity plus Moon's circular velocity around Earth.

#### Common modifications

**Change Earth orbital period:**
```javascript
earthOrbitPeriod = 120  // Make it slower (2 minutes instead of 60s)
// Everything else auto-scales proportionally
```

**Change orbital radius:**
```javascript
earthOrbitRadius = 10   // Make orbits smaller (10m instead of 15m)
```

**Add/remove planets:**
Edit the `planetData` array, the loop handles everything else automatically.

**Make Moon faster:**
```javascript
const moonOrbitalPeriod = (10 / 365.25) * earthOrbitPeriod  // 10 days instead of 27.3
// Distance auto-calculates from Kepler's Law
```

#### Validation & debugging

Check physics are correct:
```javascript
// In browser console:
// Earth should complete exactly 1 orbit in 60 seconds
// Moon should complete ~13.4 orbits in 60 seconds
// All gravity force vectors should point toward Sun
```

Run validation test:
```bash
npm test
# Look for "Moon orbits Earth approximately 12-13 times per Earth year"
```

#### File references

| File | Purpose |
|------|---------|
| `Javascript/Demos/SolarSystemDemo.js` | Demo implementation (~850 lines) |
| `Javascript/Tests/core-regressions.node.test.js` | Moon orbit frequency test |
| `Javascript/Gravity.js` | Defines gravity constant |
| `Javascript/Behaviours/TensorForces.js` | Applies field forces |

See `Javascript/Demos/SOLAR_SYSTEM_GUIDE.md` for comprehensive developer reference including all formulas, scaling details, and extension examples.
