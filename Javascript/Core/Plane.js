/*jshint esversion:6 */
import { createWorldCoordinateSystem, createDisplayCoordinateSystem } from '../Nodes/CoordinateSystem.js';

/**
 * Plane represents a 2D space with a coordinate system and provides
 * methods for distance calculation and coordinate transformations.
 * A Plane wraps an existing CoordinateSystem and serves as the primary
 * interface for nodes to reference their coordinate space.
 */
class Plane {
	/**
	 * @param {string} name - Name of plane (e.g., 'world', 'display', 'admin')
	 * @param {CoordinateSystem} coordinateSystem - The coordinate system this plane uses
	 */
	constructor(name, coordinateSystem) {
		this.name = name;
		this.coordinateSystem = coordinateSystem;
	}
	
	/**
	 * Calculate distance between two positions in this plane
	 * Uses the plane's coordinate system distance function
	 * @param {Position} p1
	 * @param {Position} p2
	 * @return {number} distance in native coordinates
	 */
	distance(p1, p2) {
		return this.coordinateSystem.calculateDistance(p1, p2);
	}
	
	/**
	 * Calculate squared distance (more efficient when only comparing distances)
	 * @param {Position} p1
	 * @param {Position} p2
	 * @return {number} squared distance in native coordinates
	 */
	distanceSquared(p1, p2) {
		return this.coordinateSystem.calculateDistanceSquared(p1, p2);
	}
	
	/**
	 * Convert a node's position to screen pixels for rendering
	 * @param {Node} node
	 * @return {Vector} Position in screen pixels
	 */
	convertToScreenPixels(node) {
		return this.coordinateSystem.convertToScreenPixels(node);
	}
	
	/**
	 * Apply view transforms (zoom/pan) to screen position
	 * @param {Vector} screenPosition
	 * @param {TrussView} view
	 * @return {Vector} Transformed screen position
	 */
	applyViewTransform(screenPosition, view) {
		return this.coordinateSystem.applyViewTransform(screenPosition, view);
	}
	
	isWorld() { return this.coordinateSystem.isWorld(); }
	isDisplay() { return this.coordinateSystem.isDisplay(); }
}

/**
 * Create a plane with view-dependent coordinate system
 * Used for world plane that responds to zoom/pan
 * @param {TrussView} trussView
 * @return {Plane}
 */
function createWorldPlane(trussView) {
	return new Plane('world', createWorldCoordinateSystem(trussView));
}

/**
 * Create a plane with display (screen-fixed) coordinate system
 * Used for display plane that doesn't respond to zoom/pan
 * @param {TrussView} trussView
 * @return {Plane}
 */
function createDisplayPlane(trussView) {
	return new Plane('display', createDisplayCoordinateSystem(trussView));
}

export { Plane, createWorldPlane, createDisplayPlane };

