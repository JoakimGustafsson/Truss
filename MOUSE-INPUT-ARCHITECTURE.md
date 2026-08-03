# Mouse Input Architecture

## Centralized Mouse Position Detection Pattern

All mouse position access in display coordinate space **MUST** go through a single centralized function. This ensures consistent coordinate calculations across the entire application.

### The Rule

**No code shall access `myX` or `myY` directly for display position calculations.**

All display coordinate calculations must use the centralized function:
```javascript
trussNode.getMouseDisplayPosition() → Position
```

### Why This Matters

Mouse coordinates exist in different reference frames:
- **Screen coordinates** (`myX`, `myY`): Relative to the viewport/screen origin
- **Canvas coordinates**: Relative to the canvas element's position on the screen
- **Display coordinates**: Percentages (0-100%) within the canvas, with Y inverted (0%=bottom, 100%=top)

A single function ensures:
1. **Consistent offset handling**: Canvas might be positioned anywhere on screen
2. **Single source of truth**: All display position calculations use identical logic
3. **Easy debugging**: All mouse tracking goes through one function
4. **Maintenance**: Changes to coordinate conversion only need to happen in one place

### Implementation: `TrussNode.getMouseDisplayPosition()`

Located in: `Javascript/Nodes/TrussNode.js`

```javascript
/**
 * Central function for all mouse position detection in display coordinates.
 * All mouse position access must go through this function.
 * @return {Position} Mouse position in display percentages (0-100% for both X and Y)
 */
getMouseDisplayPosition() {
    // Get canvas position relative to screen
    const canvasContainer = document.getElementById('TrussBackground') || this.element;
    const containerRect = canvasContainer.getBoundingClientRect();
    
    // Convert screen coordinates to canvas-relative coordinates
    const canvasX = myX - containerRect.left;
    const canvasY = myY - containerRect.top;
    
    // Convert canvas pixels to display percentages
    const screenWidth = this.view.screenSize.x;
    const screenHeight = this.view.screenSize.y;
    const displayPercX = (canvasX / screenWidth) * 100;
    const displayPercY = (1 - (canvasY / screenHeight)) * 100;
    
    return new Position(displayPercX, displayPercY);
}
```

### Usage Examples

**In Sensors.js (Selector):**
```javascript
// Get mouse position for display plane node tracking
const mouseDisplayPerc = trussNode.getMouseDisplayPosition();
this.localPosition = new Position(mouseDisplayPerc.x, mouseDisplayPerc.y);
```

**In TrussNode.js (Debug visualization):**
```javascript
// Draw lime circle at mouse position
const mouseDisplayPerc = this.getMouseDisplayPosition();
const mouseScreenX = (mouseDisplayPerc.x / 100) * screenWidth;
const mouseScreenY = screenHeight - (mouseDisplayPerc.y / 100) * screenHeight;
// ... draw circle at mouseScreenX, mouseScreenY
```

### Return Value

`getMouseDisplayPosition()` returns a `Position` object with:
- `x`: Display percentage (0-100%, left to right)
- `y`: Display percentage (0-100%, bottom to top - Y is inverted)

### World vs Display Coordinates

- **For world coordinate calculations**: Use `trussNode.view.worldPositionWithOffset(myX, myY)`
- **For display coordinate calculations**: Use `trussNode.getMouseDisplayPosition()`

### Exceptions

If you need direct access to raw mouse coordinates in screen space (`myX`, `myY`), this is allowed ONLY for:
1. World coordinate transformations (use `worldPositionWithOffset()`)
2. Canvas event calculations where you handle offset yourself

**Ask for explicit approval** before accessing `myX`/`myY` directly for any new display coordinate calculations.

### Debug Visualization

The centralized function powers two debug visualizations:
1. **Lime circle with coordinates** (green outline): Always drawn at `getMouseDisplayPosition()`
2. **Selector node** (magenta outline): Positioned by `getMouseDisplayPosition()`

Both should perfectly overlap, confirming coordinate consistency.
