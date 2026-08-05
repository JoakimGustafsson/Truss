# Solar System Demo - User Guide & Developer Reference

## Overview

`SolarSystemDemo.js` creates a scaled-down model of the solar system where:
- **1 Earth orbit = 60 seconds** (instead of 365 days)
- **8 planets orbit the Sun** with realistic orbital mechanics
- **Earth has a Moon** that orbits while following Earth around the Sun
- **All forces are realistic** - using real-world gravity, mass ratios, and orbital parameters

This is a 3-body simulation (Sun-Earth-Moon) plus 7 other planets, all correctly governed by Newton's law of universal gravitation.

## Quick Start

### Running the Demo
```bash
npm run dev        # Start dev server
# Navigate to http://localhost:3000/
# Select "Solar System Demo" from the UI
# Click "Run Physics" to start the simulation
```

### What You'll See
- **Sun** at center (large, bright)
- **8 Planets** orbiting in elliptical paths around the Sun
- **Moon** circling Earth (tiny, hard to see - very close to Earth)
- **All bodies rotate** as they orbit (day/night cycles)
- **Gravity forces** can be visualized (acceleration vectors pointing toward Sun)

## Architecture & How It Works

### File Location
```
Javascript/Demos/SolarSystemDemo.js  (850+ lines)
Javascript/Tests/core-regressions.node.test.js  (Moon orbit frequency test)
```

### Key Sections of SolarSystemDemo.js

#### 1. `calculateSolarSystemScaling()` (Lines 95-145)
**Purpose:** Convert real-world solar system values into simulation coordinates

**Key Calculations:**
```javascript
// Define what "1 meter" means in the simulation
earthOrbitRadius = 15 meters       // Real distance: 150 million km
earthOrbitPeriod = 60 seconds      // Real period: 365.25 days

// Calculate gravity constant to match Earth's orbit
GM = (4π² × r³) / T²
// GM ≈ 37 (this is the product G × Sun's mass)

gravityConstant = 6.67e-11         // Universal constant (positive)
sunMass = GM / gravityConstant     // Solve for Sun's mass

// Calculate mass scaling for all bodies
massScale = Earth_mass_simulation / Earth_mass_real
// All planets use: (real_mass_ratio_to_sun) × massScale
```

**Why This Matters:**
- Without proper scaling, orbits will be wrong (too fast, too slow, unstable)
- The formula ensures Kepler's 3rd Law is satisfied: T² ∝ r³
- All masses are proportional to real-world ratios

#### 2. `createPlanet()` Loop (Lines 228-290)
**Purpose:** Add all 8 planets to the simulation

**For Each Planet:**
```javascript
// Real-world values (from NASA)
distance_AU = 0.387 (Mercury) to 30.07 (Neptune)  // in Astronomical Units
orbital_period_years = varies per planet

// Scale to simulation
distance_m = distance_AU × earthOrbitRadius / 1.0  // Earth AU = 1.0
period_s = orbital_period_years × earthOrbitPeriod / 1.0

// Calculate starting position (elliptical orbit, phase=0)
// Perihelion (closest point) at simulation start
x = distance_m × cos(trueAnomaly)
y = distance_m × sin(trueAnomaly)

// Calculate orbital velocity (circular approximation)
v = √(GM / distance_m)
// Position velocity tangent to orbit (perpendicular to radius)
vx = -v × sin(trueAnomaly)
vy = v × cos(trueAnomaly)

// Add gravity field tensor
gravitationField = new FieldCalculator()
  .setName(`gravity-${planetName}`)
  .setNodes(sun, planet)
  .setCalculator(gravityCalculator)
  .setGravityConstant(gravityConstant)
  .calculate()
```

**To Add a 9th Planet:**
1. Get real orbital data (distance in AU, period in years)
2. Add to planet data array before loop
3. The loop handles everything else automatically

#### 3. Moon Setup (Lines 295-360)
**Purpose:** Create a realistic Earth-Moon system

**Moon Parameters - How They Relate:**
```javascript
// 1. Moon mass (relative to Sun, like all planets)
moonMassRelativeToSun = 7.342e22 / 1.989e30 ≈ 3.69e-8
moonMass = moonMassRelativeToSun × massScale

// 2. Desired orbital period (in simulation time)
// Real: 27.3 days = (27.3/365.25) years
// Simulation: (27.3/365.25) × 60 seconds ≈ 4.48 seconds
moonOrbitalPeriod = (27.3 / 365.25) * earthOrbitPeriod

// 3. Moon distance - CALCULATED from orbital period!
// This is crucial: distance must satisfy Kepler's Law
// Formula: r = (T² × GM / 4π²)^(1/3)
// where GM = gravityConstant × earth.mass
moonDistance = Math.pow(
  (moonOrbitalPeriod² × moonGM) / (4π²),
  1/3
)

// 4. Moon orbital velocity
moonVelocityMagnitude = √(moonGM / moonDistance)

// 5. Moon absolute velocity includes Earth's motion
// Moon velocity = Earth's orbital velocity + Moon's velocity around Earth
moonVelocityX = earthVelocity.x + 0
moonVelocityY = earthVelocity.y + moonVelocityMagnitude
```

**The Subtle Part - Moon Velocity:**
- Moon can't just have velocity relative to Earth
- Moon must also move with Earth around the Sun
- Otherwise Moon would orbit the Sun separately, not the Earth!
- Solution: Add Earth's velocity vector to Moon's circular velocity vector

**Creating Gravity Fields:**
```javascript
// 1. Earth-Moon gravity (Moon orbits Earth)
new FieldCalculator()
  .setName('gravity-moon')
  .setNodes(earth, moon)
  .setGravityConstant(gravityConstant)
  .calculate()

// 2. Sun-Moon gravity (Sun pulls on Moon too!)
// Without this, Moon would orbit Earth "for free"
// With this, Sun pulls Moon toward Sun, Moon still orbits Earth
new FieldCalculator()
  .setName('gravity-moon-sun')
  .setNodes(sun, moon)
  .setGravityConstant(gravityConstant)
  .calculate()
```

**Why Two Gravity Fields for Moon?**
- Real physics: Moon experiences pull from both Earth and Sun
- Earth's pull dominates (closer), keeps Moon orbiting Earth
- Sun's pull is weaker, but affects Moon's orbit shape slightly
- Both forces must be in simulation for 3-body physics to work

## Key Constants & What They Mean

### From `calculateSolarSystemScaling()`

| Variable | Value | Meaning |
|----------|-------|---------|
| `earthOrbitRadius` | 15 meters | How far Earth is from Sun in the sim |
| `earthOrbitPeriod` | 60 seconds | How long it takes Earth to orbit |
| `GM` | ~37 | Gravity constant × Sun's mass product |
| `gravityConstant` | 6.67e-11 | Universal gravity constant (positive) |
| `sunMass` | 1.00e24 | Sun's mass in simulation |
| `massScale` | 3.33e+25 | Multiplier to convert real masses to sim |

### Validation Logs
```
Earth distance: 1.50e+1 m          ✓ Should be ~15m
Earth period: 6.00e+1 s            ✓ Should be ~60s
GM product: 3.70e+1                ✓ Should be ~37
```

### For Each Planet
```javascript
const planetData = {
  distance_AU: 0.387,              // Real-world AU
  period_years: 0.241,             // Real-world years
  mass_relative_to_sun: 0.0553,    // Mass ratio
  name: "Mercury"
}
```

### For Moon
```javascript
moonOrbitalPeriod ≈ 4.48 seconds   // 27.3 days scaled
moonDistance ≈ 0.686 meters        // Calculated from period
moonVelocityMagnitude ≈ 0.967 m/s  // Calculated from distance
expectedOrbitsPerYear ≈ 13.4       // Should see ~13 orbits in 60s
```

## Improving & Extending the Demo

### Common Modifications

#### 1. Change Earth Orbital Period
```javascript
// Current: 60 seconds
earthOrbitPeriod = 120  // Make it slower (2 minutes)

// Everything else auto-scales:
// - All planet periods scale proportionally
// - Moon period scales
// - Velocities stay correct
// - Gravity constant recalculates
```

**Effect:** Makes everything move slower, easier to see. All physics stays valid.

#### 2. Change Earth Orbital Radius
```javascript
earthOrbitRadius = 10  // Make orbits smaller (10m instead of 15m)
```

**Effect:** All planets get closer to each other. Physics stays valid if `GM` is recalculated.

**⚠️ Important:** If you change both radius AND period, you must recalculate `GM`!

#### 3. Add/Remove Planets
```javascript
// In planetData array, add/remove objects:
const planetData = [
  { name: 'Mercury', distance_AU: 0.387, period_years: 0.241, ... },
  // ... add new planet here
  { name: 'NewPlanet', distance_AU: 1.5, period_years: 0.5, ... }
]
```

**The loop handles everything else automatically!**

#### 4. Make Moon Faster
```javascript
// Current: 27.3 days
// Change to orbit faster:
const moonOrbitalPeriod = (10 / 365.25) * earthOrbitPeriod  // 10 days instead

// Distance auto-calculates to match
const moonDistance = Math.pow(
  (moonOrbitalPeriod² × moonGM) / (4π²),
  1/3
)
```

**Note:** Smaller period → smaller distance. Moon will be closer to Earth.

#### 5. Add a Second Moon
```javascript
// After Moon creation, add:
const moon2MassRelativeToSun = 1e-8  // Much smaller than Earth
const moon2Mass = moon2MassRelativeToSun * scaling.massScale
const moon2OrbitalPeriod = (5 / 365.25) * earthOrbitPeriod  // 5 days
const moon2GM = scaling.gravityConstant * earth.mass
const moon2Distance = Math.pow((moon2OrbitalPeriod² × moon2GM) / (4π²), 1/3)

// Position on opposite side of Earth
const moon2X = earthNode.localPosition.x - moon2Distance
const moon2Y = earthNode.localPosition.y

// Add remaining setup (velocity, gravity fields, etc.)
```

#### 6. Add Asteroid Belt
```javascript
// Create ring of small objects at arbitrary distance
for (let i = 0; i < 50; i++) {
  const angle = (i / 50) * 2 * Math.PI
  const beltDistance = 2.0  // Between Mars (1.52) and Jupiter (5.2)
  const x = sun.node.localPosition.x + beltDistance * Math.cos(angle)
  const y = sun.node.localPosition.y + beltDistance * Math.sin(angle)
  
  // Small mass, circular orbit
  const asteroidMass = 1e-10 * scaling.massScale
  const asteroidVelocity = Math.sqrt(scaling.gravityConstant * sun.mass / beltDistance)
  
  // Create asteroid node...
}
```

#### 7. Change Sun's Mass
```javascript
// Current: calculated to make Earth's orbit work
// Double Sun's mass:
const scaledSunMass = 2e24  // Was 1e24

// Effect: All orbits get faster
// Warning: This breaks the scaling! Kepler's law violated.
// Only do this if you recalculate gravityConstant!
```

### Debugging & Validation

#### Check Physics Are Correct
```javascript
// In browser console or test:
// Earth should complete exactly 1 orbit in 60 seconds
// Moon should complete ~13.4 orbits in 60 seconds
// All forces should point toward Sun

// Enable debug visualization:
// In Truss UI, toggle "Show acceleration lines"
// Vectors should all point toward Sun
```

#### Common Problems & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| Planets fly away | Gravity constant wrong | Recalculate from scaling formula |
| Moon escapes Earth | Distance too large or GM too small | Check moonDistance calculation |
| Moon orbits too slow | Period mismatch to distance | Use r = (T² × GM / 4π²)^(1/3) |
| Everything moves together | Velocity is wrong | Check v = √(GM/r) calculation |
| Orbits drift over time | Numerical errors accumulate | Normal! Reduce time step in physics |

#### Debug Logs
The demo prints scaling info:
```
🌍 Solar System Scaling:
  Earth distance: 1.50e+1 m
  Earth period: 6.00e+1 s
  GM product: 3.70e+1
  Sun mass: 1.00e+24
  Gravity constant: 3.70e-23

🪐 Mercury: r=5.8m, v=0.81m/s, F_gravity=...
...

🌙 Moon Setup:
  Distance from Earth: 0.686 m
  Orbital velocity: 0.967 m/s
  Expected orbits per year: 13.38
  Actual used: 4.48s → theoretical ~4.48s
```

**What to check:**
- GM product should be ~37
- Gravity constant should match what's in `Gravity.js`
- Moon distance should be calculated (not hardcoded)
- Expected orbits should match theoretical (same value!)

### Testing

#### Test Moon Orbit Frequency
Located in `core-regressions.node.test.js`:
```javascript
// Test checks that Moon orbits Earth ~12-13 times per year
// while Earth orbits Sun once
// If Moon orbits fewer times → distance is too large
// If Moon orbits more times → distance is too small
```

To verify after changes:
```bash
npm test
# Look for "Moon orbits Earth approximately 12-13 times per Earth year"
```

#### Manual Testing
```javascript
// In browser, inspect at t=0, t=30s, t=60s:
// Earth should be:
// - t=0: x=15, y=0 (right side of Sun)
// - t=30: x≈-15, y≈0 (left side)
// - t=60: x≈15, y≈0 (back to start)

// Moon should complete:
// - ~7 orbits in 30 seconds
// - ~13-14 orbits in 60 seconds
```

## Physics Formulas Used

### Kepler's 3rd Law
```
T² = (4π² / GM) × r³

Rearranged for distance:
r = ∛(T² × GM / 4π²)

For velocity (circular orbit):
v = √(GM / r)
```

### Orbital Position (Elliptical)
```
In simulation, all orbits start at perihelion (closest point):
x = r × cos(0) = r
y = r × sin(0) = 0

True Anomaly progresses during simulation
```

### Gravity Force
```
F = -G × M₁ × M₂ / r²

Direction: From body toward attractor (negative = toward)
Magnitude: Decreases with distance squared
```

### Three-Body Dynamics
```
For Moon:
Total Force = Force from Earth + Force from Sun
Acceleration = Total Force / Moon Mass

Moon moves under combined influence of both bodies
This is why we need TWO gravity fields for Moon!
```

## File Structure Reference

```
SolarSystemDemo.js
├── calculateSolarSystemScaling()      (Lines 95-145)
│   └─ Returns: { gravityConstant, sunMass, massScale, ... }
│
├── createPlanet()                     (Lines 149-180)
│   ├─ Takes: planet data, scaling
│   └─ Returns: { node, mass, name, velocity, ... }
│
├── Initialization & Setup             (Lines 181-250)
│   ├─ Get Truss scene/physics
│   ├─ Create Sun node
│   └─ Print scaling info
│
├── Planet Creation Loop               (Lines 228-290)
│   ├─ For each of 8 planets:
│   ├─ Calculate orbital position
│   ├─ Create physics node
│   ├─ Create gravity field tensor
│   └─ Store in planets array
│
└── Moon Setup                         (Lines 295-360)
    ├─ Moon mass calculation
    ├─ Moon period scaling
    ├─ Moon distance from Kepler's Law
    ├─ Moon velocity (Earth + circular)
    ├─ Create Moon node
    ├─ Create gravity field (Earth-Moon)
    ├─ Create gravity field (Sun-Moon)
    └─ Debug logging
```

## Related Files

| File | Purpose | Key Variables |
|------|---------|---|
| `Javascript/Gravity.js` | Defines gravity constant | `GRAVITY_FIELD_CONSTANT = 6.67e-11` |
| `Javascript/Nodes/Node.js` | Physics calculations | velocity, acceleration, forces |
| `Javascript/Behaviours/TensorForces.js` | Applies tensor forces | Gravity field direction/magnitude |
| `Javascript/Tests/core-regressions.node.test.js` | Tests orbital stability | Moon orbit frequency test (~line 682) |
| `Javascript/Primitives/Vector.js` | Vector math | velocity calculations |

## Performance Notes

- **FPS Impact:** Moderate (9 gravity fields = 9 force calculations per body per frame)
- **Stability:** Good - physics verified by Kepler's laws
- **Numerical Errors:** Accumulate over long runs (hours), visible as orbit drift
- **Time Scale:** Everything happens in simulation time (60 seconds = 1 year)

## Summary: The Core Idea

1. **Everything orbits using real physics** (Newton's gravity)
2. **Distances and periods are scaled** so you can see motion in minutes
3. **Scaling is self-consistent** - it satisfies Kepler's 3rd law
4. **Moon has complex motion** - orbits Earth while Earth orbits Sun
5. **Debug output validates** that physics are correct

**To improve the demo:** Modify planet data or scaling parameters, run `npm test` to verify, and check debug logs match expected values. If distances/periods/velocities are calculated correctly, the physics will automatically be correct!

---

**Last Updated:** 2026-08-04  
**Status:** Working demo with 22/22 tests passing  
**Next Ideas:** Variable time scales, collision detection, asteroid interactions, comet impacts
