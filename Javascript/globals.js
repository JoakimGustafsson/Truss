export let universe = null;
export function setUniverse(u) { universe = u; }

export let myX = 3;
export let myY = 3;
export let mouseSet = false;
export function setMyX(v) { myX = v; }
export function setMyY(v) { myY = v; }
export function setMouseSet(v) { mouseSet = v; }

// Create control object for backwards compatibility
export const control = {
	get myX() { return myX; },
	get myY() { return myY; },
	get mouseSet() { return mouseSet; }
};

export let FPSdisplay = null;
export function setFPSdisplay(el) { FPSdisplay = el; }
