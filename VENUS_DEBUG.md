# Venus Force Debugging Guide

When you run the solar system demo, detailed force information for Venus will be logged to the browser console.

## What to Look For

### Force Breakdown
Each frame, you'll see a `🪐 Venus Force Debug` group showing:

1. **Individual Forces**
   - `Force from gravity-venus: (Fx, Fy) N` - The gravitational force from the Sun
   - Any other forces acting on Venus (should only be gravity)

2. **Total Force**
   - Sum of all forces: `Total Force: (Fx, Fy) N`
   - This should point toward the Sun

3. **Acceleration**
   - `Acceleration: (ax, ay) m/s²`
   - Calculated as: `a = F / m`
   - Should point toward the Sun

4. **Velocity Information**
   - `Current Velocity: (vx, vy) m/s` - Current orbital velocity
   - `Distance to Sun: X m`

5. **Alignment Check**
   - `Force direction alignment to Sun: X%`
   - `1.0 = directly toward Sun`
   - `-1.0 = directly away from Sun`
   - `0.0 = perpendicular to Sun`

### Velocity Change
After the force is applied:

- `Velocity change (timeFactor=X): (Δvx, Δvy) m/s`
- `Velocity change alignment to Sun: X%`
- This shows how the velocity is being modified

## How to Use

1. Open the browser developer console (F12)
2. Run the solar system demo
3. Look at the `🪐 Venus Force Debug` group entries
4. Check the alignment percentages:
   - Should be close to `100%` (pointing toward Sun)
   - If it's `-100%`, forces point away from Sun (wrong!)
   - If it's `0%`, forces are perpendicular to Sun (shouldn't happen)

## What to Check

✅ **Good Signs:**
- `Force direction alignment to Sun: 95%+` (close to 100%)
- Acceleration direction matches force direction
- Only one force: `gravity-venus`

❌ **Bad Signs:**
- Multiple forces appearing that aren't gravity
- Alignment percentage near 0% or negative
- Acceleration not pointing toward Sun
- Velocity change not pointing toward Sun

## Example Output

```
🪐 Venus Force Debug (phase=0)
  Force from gravity-venus: (1.23e+19, -4.56e+18) N
  Total Force: (1.23e+19, -4.56e+18) N
  Mass: 2.45e+20
  Acceleration: (5.02e-2, -1.86e-2) m/s²
  Current Velocity: (1.234, 0.567) m/s
  Direction to Sun: (0.956, -0.292)
  Distance to Sun: 10.83 m
  Force direction alignment to Sun: 99.8%
  
  Velocity change (timeFactor=0.0167): (0.0084, -0.0031) m/s
  New Velocity: (1.2424, 0.5639) m/s
  Velocity change alignment to Sun: 99.8%
```

If alignment is NOT close to 100%, there's an issue with:
- The gravity field constant or sign
- How forces are being calculated
- Additional unknown forces on Venus
