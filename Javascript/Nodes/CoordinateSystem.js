import { Vector } from '../Primitives.js';

/**
 * CoordinateSystem - Fundamental abstraction for coordinate spaces
 * 
 * Every node and tensor exists in a coordinate system:
 * - WORLD: node.localPosition stored in world units, affected by zoom/pan transforms for rendering
 * - DISPLAY: node.localPosition stored in percentages (0-100), not affected by zoom/pan transforms
 * 
 * This class encapsulates all coordinate-space-specific behavior:
 * - Converting positions to screen pixels for rendering
 * - Calculating distances within the coordinate space
 * - Applying or skipping view transforms
 * 
 * ZOOM & PAN FACTORS:
 * - zoomFactor (0-1): How much this coordinate system is affected by view zoom
 *   * 0 = never zooms (display coordinates)
 *   * 1 = fully zooms (world coordinates)
 *   * 0.5 = half-zoom effect (useful for UI elements that should zoom slower than world)
 * 
 * - panFactor (0-1): How much this coordinate system is affected by view pan
 *   * 0 = never pans (display coordinates, fixed on screen)
 *   * 1 = fully pans (world coordinates)
 *   * 0.5 = half-pan effect (useful for parallax or semi-fixed elements)
 * 
 * This design allows creating intermediate coordinate systems that respond partially to zoom/pan,
 * useful for creating visual effects like parallax scrolling or semi-fixed UI elements.
 */

class CoordinateSystem {
	/**
	 * @param {string} name - "world" or "display"
	 * @param {Function} convertToScreenPixels - Function(node) => Vector in screen pixels
	 * @param {Function} calculateDistance - Function(pos1, pos2) => number in this coordinate space
	 * @param {Function} calculateDistanceSquared - Function(pos1, pos2) => squared distance (for efficiency)
	 * @param {Function} applyViewTransform - Function(screenPos) => transformed screen position
	 * @param {number} zoomFactor - 0=no zoom, 1=full zoom, 0.5=half zoom (for intermediate systems)
	 * @param {number} panFactor - 0=no pan, 1=full pan, 0.5=half pan (for intermediate systems)
	 */
	constructor(name, convertToScreenPixels, calculateDistance, calculateDistanceSquared, applyViewTransform, zoomFactor = 1, panFactor = 1) {
		this.name = name;
		this._convertToScreenPixels = convertToScreenPixels;
		this._calculateDistance = calculateDistance;
		this._calculateDistanceSquared = calculateDistanceSquared;
		this._applyViewTransform = applyViewTransform;
		this.zoomFactor = zoomFactor;  // How much this system is affected by zoom (0-1)
		this.panFactor = panFactor;    // How much this system is affected by pan (0-1)
	}

	/**
	 * Convert a node's position to screen pixels for rendering
	 * @param {Node} node - Node with localPosition in this coordinate system
	 * @returns {Vector} Position in screen pixels
	 */
	convertToScreenPixels(node) {
		return this._convertToScreenPixels(node);
	}

	/**
	 * Calculate distance between two positions in this coordinate space
	 * @param {Vector|Object} pos1 - First position (or node)
	 * @param {Vector|Object} pos2 - Second position (or node)
	 * @returns {number} Distance in this coordinate space's units
	 */
	calculateDistance(pos1, pos2) {
		return this._calculateDistance(pos1, pos2);
	}

	/**
	 * Calculate squared distance between two positions in this coordinate space
	 * More efficient than calculateDistance for Cartesian systems when only comparison is needed
	 * @param {Vector|Object} pos1 - First position (or node)
	 * @param {Vector|Object} pos2 - Second position (or node)
	 * @returns {number} Squared distance in this coordinate space's units²
	 */
	calculateDistanceSquared(pos1, pos2) {
		return this._calculateDistanceSquared(pos1, pos2);
	}

	/**
	 * Apply view transforms (zoom/pan) to screen pixels
	 * World coordinate system applies transforms; display does not
	 * @param {Vector} screenPosition - Position in screen pixels
	 * @param {TrussView} view - The view for transform data
	 * @returns {Vector} Transformed screen position
	 */
	applyViewTransform(screenPosition, view) {
		return this._applyViewTransform(screenPosition, view);
	}

	isWorld() { return this.name === 'world'; }
	isDisplay() { return this.name === 'display'; }
}

/**
 * Factory: Create the WORLD coordinate system
 * - node.localPosition stored in world units
 * - Distances measured in world units
 * - View transforms (zoom/pan) are applied for rendering
 * - zoomFactor=1: FULLY affected by zoom
 * - panFactor=1: FULLY affected by pan
 */
function createWorldCoordinateSystem(trussView) {
	return new CoordinateSystem(
		'world',
		
		// convertToScreenPixels: node's localPosition → screen pixels with view transform
		function(node) {
			const screenPos = trussView.screenPosition(node.localPosition);
			return screenPos;
		},
		
		// calculateDistance: Euclidean distance in world units
		function(pos1, pos2) {
			let p1 = pos1;
			let p2 = pos2;
			
			// Handle node objects
			if (pos1 && typeof pos1 === 'object' && pos1.localPosition !== undefined) {
				p1 = pos1.localPosition;
			}
			if (pos2 && typeof pos2 === 'object' && pos2.localPosition !== undefined) {
				p2 = pos2.localPosition;
			}
			
			if (!p1 || !p2) return Infinity;
			
			const p1_val = p1.v ? p1.v : p1; // Handle AlertVector
			const p2_val = p2.v ? p2.v : p2;
			
			return Math.sqrt(
				Math.pow(p1_val.x - p2_val.x, 2) + 
				Math.pow(p1_val.y - p2_val.y, 2)
			);
		},
		
		// calculateDistanceSquared: Squared Euclidean distance in world units² (for efficiency)
		function(pos1, pos2) {
			let p1 = pos1;
			let p2 = pos2;
			
			// Handle node objects
			if (pos1 && typeof pos1 === 'object' && pos1.localPosition !== undefined) {
				p1 = pos1.localPosition;
			}
			if (pos2 && typeof pos2 === 'object' && pos2.localPosition !== undefined) {
				p2 = pos2.localPosition;
			}
			
			if (!p1 || !p2) return Infinity;
			
			const p1_val = p1.v ? p1.v : p1;
			const p2_val = p2.v ? p2.v : p2;
			
			return Math.pow(p1_val.x - p2_val.x, 2) + 
				   Math.pow(p1_val.y - p2_val.y, 2);
		},
		
		// applyViewTransform: Already applied in screenPosition, so identity here
		function(screenPosition, view) {
			return screenPosition;
		},
		
		1,  // zoomFactor: 1 = fully affected by zoom
		1   // panFactor: 1 = fully affected by pan
	);
}

/**
 * Factory: Create the DISPLAY coordinate system
 * - node.localPosition stored in percentages (0-100% of screen)
 * - Distances measured in percentage units
 * - View transforms (zoom/pan) are NOT applied
 * - zoomFactor=0: NOT affected by zoom
 * - panFactor=0: NOT affected by pan
 */
function createDisplayCoordinateSystem(trussView) {
	return new CoordinateSystem(
		'display',
		
		// convertToScreenPixels: localPosition percentages → screen pixels
		function(node) {
			if (!node.localPosition) {
				console.warn('Display node missing localPosition:', node.name);
				return new Vector(0, 0);
			}
			
			const screenWidth = trussView.screenSize.x;
			const screenHeight = trussView.screenSize.y;
			
			return new Vector(
				(node.localPosition.x / 100) * screenWidth,
				screenHeight - (node.localPosition.y / 100) * screenHeight  // Y is inverted: 0=bottom, 100=top
			);
		},
		
		// calculateDistance: Euclidean distance in percentage units
		function(pos1, pos2) {
			let p1 = pos1;
			let p2 = pos2;
			
			// Handle node objects
			if (pos1 && typeof pos1 === 'object' && pos1.localPosition !== undefined) {
				p1 = pos1.localPosition;
			}
			if (pos2 && typeof pos2 === 'object' && pos2.localPosition !== undefined) {
				p2 = pos2.localPosition;
			}
			
			if (!p1 || !p2) return Infinity;
			
			const p1_val = p1.v ? p1.v : p1;
			const p2_val = p2.v ? p2.v : p2;
			
			return Math.sqrt(
				Math.pow(p1_val.x - p2_val.x, 2) + 
				Math.pow(p1_val.y - p2_val.y, 2)
			);
		},
		
		// calculateDistanceSquared: Squared Euclidean distance in percentage units² (for efficiency)
		function(pos1, pos2) {
			let p1 = pos1;
			let p2 = pos2;
			
			// Handle node objects
			if (pos1 && typeof pos1 === 'object' && pos1.localPosition !== undefined) {
				p1 = pos1.localPosition;
			}
			if (pos2 && typeof pos2 === 'object' && pos2.localPosition !== undefined) {
				p2 = pos2.localPosition;
			}
			
			if (!p1 || !p2) return Infinity;
			
			const p1_val = p1.v ? p1.v : p1;
			const p2_val = p2.v ? p2.v : p2;
			
			return Math.pow(p1_val.x - p2_val.x, 2) + 
				   Math.pow(p1_val.y - p2_val.y, 2);
		},
		
		// applyViewTransform: No transform for display coordinates (already in screen space)
		function(screenPosition, view) {
			return screenPosition;
		},
		
		0,  // zoomFactor: 0 = NOT affected by zoom
		0   // panFactor: 0 = NOT affected by pan
	);
}

export { CoordinateSystem, createWorldCoordinateSystem, createDisplayCoordinateSystem };
