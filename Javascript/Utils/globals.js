import { createWorldPlane, createDisplayPlane, Plane } from '../Core/Plane.js';
import { Position } from '../Model/Primitives.js';

export let universe = null;
export function setUniverse(u) { universe = u; }

export let myX = 3;
export let myY = 3;
export let mouseSet = false;
export function setMyX(v) { myX = v; }
export function setMyY(v) { myY = v; }
export function setMouseSet(v) { mouseSet = v; }

// Display plane mouse position in percentages (0-100%)
// This is calculated early from screen coordinates and used throughout the system
export let displayMousePercentX = 50;
export let displayMousePercentY = 50;
export function setDisplayMousePercent(x, y) { 
	displayMousePercentX = x; 
	displayMousePercentY = y; 
}

// Create control object for backwards compatibility
export const control = {
	get myX() { return myX; },
	get myY() { return myY; },
	get mouseSet() { return mouseSet; }
};

export let FPSdisplay = null;
export function setFPSdisplay(el) { FPSdisplay = el; }

// Planes initialized later with a view
export let Planes = {
	world: null,
	display: null,
	admin: null
};

/**
 * Initialize planes with a TrussView
 * Called during view setup
 * @param {TrussView} trussView
 */
export function initializePlanes(trussView) {
	Planes.world = createWorldPlane(trussView);
	Planes.display = createDisplayPlane(trussView);
	
	// Admin plane shares the world coordinate system for now
	Planes.admin = createWorldPlane(trussView);
	Planes.admin.name = 'admin';
}

/**
 * Get a plane by name, default to world plane if not found or if name is null/undefined
 * @param {string|null|undefined} planeName
 * @return {Plane} The plane object
 */
export function getPlane(planeName) {
	if (!planeName || !Planes[planeName]) {
		return Planes['world'];
	}
	return Planes[planeName];
}


