
/*jshint esversion:6 */
/* global control Tensor smallnodezoom debugEntity Behaviour BehaviourOverride*/
import { Position, Vector } from '../Primitives.js';
import { control, universe, displayMousePercentX, displayMousePercentY } from '../globals.js';
import { Behaviour, BehaviourOverride } from './Behaviour.js';


// ---------------------------------------------------------------------------
// Color utility functions for gradient stress visualization
// ---------------------------------------------------------------------------

/**
 * Parse a color string (hex, rgb, or named color) into [R, G, B] array (0-255).
 * @param {string} colorStr - Color as hex (#FF0000), rgb(255,0,0), or name (white, red, etc.)
 * @return {Array} [R, G, B] values (0-255), or null if unparseable
 */
function parseColor(colorStr) {
	if (!colorStr) return null;
	
	// Hex format: #RRGGBB or #RGB
	if (colorStr.startsWith('#')) {
		let hex = colorStr.slice(1);
		if (hex.length === 3) {
			// Expand #RGB to #RRGGBB
			hex = hex.split('').map(c => c + c).join('');
		}
		if (hex.length === 6) {
			const r = parseInt(hex.slice(0, 2), 16);
			const g = parseInt(hex.slice(2, 4), 16);
			const b = parseInt(hex.slice(4, 6), 16);
			return [r, g, b];
		}
	}
	
	// rgb(r, g, b) format
	const rgbMatch = colorStr.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
	if (rgbMatch) {
		return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
	}
	
	// Named colors
	const namedColors = {
		'white': [255, 255, 255],
		'red': [255, 0, 0],
		'green': [0, 128, 0],
		'blue': [0, 0, 255],
		'yellow': [255, 255, 0],
		'cyan': [0, 255, 255],
		'magenta': [255, 0, 255],
		'black': [0, 0, 0],
		'gray': [128, 128, 128],
		'grey': [128, 128, 128],
		'orange': [255, 165, 0],
		'purple': [128, 0, 128],
		'pink': [255, 192, 203],
		'brown': [165, 42, 42],
		'lime': [0, 255, 0],
		'navy': [0, 0, 128],
		'teal': [0, 128, 128],
		'olive': [128, 128, 0],
		'maroon': [128, 0, 0],
		'aqua': [0, 255, 255],
		'silver': [192, 192, 192],
		'lightblue': [173, 216, 230],
		'lightgray': [211, 211, 211],
		'lightgrey': [211, 211, 211],
	};
	
	const lower = colorStr.toLowerCase();
	if (namedColors[lower]) {
		return namedColors[lower];
	}
	
	return null;
}

/**
 * Convert [R, G, B] array (0-255) to rgb(r, g, b) string.
 * @param {Array} rgb - [R, G, B] values (0-255)
 * @return {string} rgb(r, g, b) format
 */
function rgbToString(rgb) {
	const [r, g, b] = rgb.map(v => Math.round(Math.max(0, Math.min(255, v))));
	return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Interpolate color based on force stress.
 * Phase 1 (0 to forceLimit): increase red from original to 255, keep G&B
 * Phase 2 (forceLimit to 2×forceLimit): keep red at 255, decrease G&B to 0
 * After 2×forceLimit: pure red
 * @param {Array} originalRgb - [R, G, B] original color
 * @param {number} currentForce - Current force magnitude
 * @param {number} forceLimit - Stress threshold
 * @return {Array} [R, G, B] interpolated color
 */
function interpolateStressColor(originalRgb, currentForce, forceLimit) {
	const [origR, origG, origB] = originalRgb;
	const stress = currentForce / forceLimit;
	
	if (stress <= 1.0) {
		// Phase 1: 0 to forceLimit — increase red from original to 255
		const redIncrease = (255 - origR) * stress;
		return [
			origR + redIncrease,
			origG,
			origB,
		];
	} else {
		// Phase 2: forceLimit to 2×forceLimit — keep red at 255, decrease G&B to 0
		const phase2Stress = Math.min((stress - 1.0), 1.0); // 0.0 to 1.0 within phase 2
		return [
			255,
			origG * (1 - phase2Stress),
			origB * (1 - phase2Stress),
		];
	}
}


// ---------------------------------------------------------------------------
// Shared keyboard state — one listener pair for the whole page, reference-counted
// so multiple attached behaviours don't multiply event listeners.
// Keys stored by both keyCode (numeric, for legacy) and e.key.toLowerCase() (string).
// ---------------------------------------------------------------------------

const _keyState = {};
let _listenerCount = 0;

const _onKeyDown = (e) => {
	if (e.keyCode || e.which) _keyState[e.keyCode || e.which] = true;
	if (e.key) _keyState[e.key.toLowerCase()] = true;
};
const _onKeyUp = (e) => {
	if (e.keyCode || e.which) _keyState[e.keyCode || e.which] = false;
	if (e.key) _keyState[e.key.toLowerCase()] = false;
};

function _acquireListeners() {
	if (typeof window === 'undefined') return;
	if (_listenerCount === 0) {
		window.addEventListener('keydown', _onKeyDown, true);
		window.addEventListener('keyup', _onKeyUp, true);
	}
	_listenerCount++;
}

function _releaseListeners() {
	if (typeof window === 'undefined') return;
	_listenerCount--;
	if (_listenerCount === 0) {
		window.removeEventListener('keydown', _onKeyDown, true);
		window.removeEventListener('keyup', _onKeyUp, true);
	}
}

/**
 * Check whether a key is currently held.
 * Accepts a numeric keyCode (e.g. 37) or a key name string (e.g. 'arrowleft').
 * @param {string|number} key
 * @return {boolean}
 */
function isKeyDown(key) {
	if (!key && key !== 0) return false;
	let numKey = Number(key);
	if (!isNaN(numKey) && String(numKey) === String(key).trim()) {
		return !!_keyState[numKey];
	}
	return !!_keyState[String(key).toLowerCase()];
}


// ---------------------------------------------------------------------------
// KeyInputBehaviour — base class that manages listener lifetime.
// Subclasses call super.attachTo / super.detachFrom and register their own overrides.
// ---------------------------------------------------------------------------

/**
 * Base behaviour for keyboard-driven inputs.
 * Manages the shared key-state listeners; subclasses add override hooks.
 * @class
 * @extends Behaviour
 */
class KeyInputBehaviour extends Behaviour {
	constructor() {
		super();
	}

	/** @param {StoreableObject} storeableObject */
	attachTo(storeableObject) {
		_acquireListeners();
	}

	/** @param {StoreableObject} storeableObject */
	detachFrom(storeableObject) {
		_releaseListeners();
	}
}


// ---------------------------------------------------------------------------
// KeyToTorqueBehaviour
// While key1/key2 is held, adds torque1/torque2 to this node's sumTorque.
// Runs via TORQUE override, after AngleNode has computed tensor-based torque.
// No deltaTime scaling — torque is a constant per-frame contribution like spring force.
// ---------------------------------------------------------------------------

/**
 * Adds a fixed torque to a node while a key is held.
 * Reads key1, key2, torque1, torque2 from the node.
 * Requires the node to also have the 'angle' label so sumTorque exists.
 * @class
 * @extends KeyInputBehaviour
 */
class KeyToTorqueBehaviour extends KeyInputBehaviour {
	constructor() {
		super();
	}

	/** @param {StoreableObject} storeableObject */
	attachTo(storeableObject) {
		super.attachTo(storeableObject);
		storeableObject.registerOverride(BehaviourOverride.TORQUE, KeyToTorqueBehaviour.prototype.applyKeyTorque);
	}

	/** @param {StoreableObject} storeableObject */
	detachFrom(storeableObject) {
		super.detachFrom(storeableObject);
		storeableObject.unregisterOverride(BehaviourOverride.TORQUE, KeyToTorqueBehaviour.prototype.applyKeyTorque);
	}

	/**
	 * Called with 'this' = the node.
	 * Adds torque1 or torque2 to sumTorque while the corresponding key is held.
	 * AngleNode's TORQUE override has already run (registered first), so sumTorque
	 * already contains the tensor-based contribution.
	 */
	applyKeyTorque() {
		if (isKeyDown(this.key1)) this.sumTorque += (this.torque1 || 0);
		if (isKeyDown(this.key2)) this.sumTorque += (this.torque2 || 0);
	}
}


// ---------------------------------------------------------------------------
// KeyToLengthBehaviour
// While key1/key2 is held, changes the tensor's equilibriumLength at a rate per second.
// Runs via PREUPDATEPOSITION override so the updated length feeds into that frame's
// spring-force calculation.
// ---------------------------------------------------------------------------

/**
 * Changes a tensor's equilibriumLength at a configurable rate while a key is held.
 * Reads key1, key2, lengthRate1, lengthRate2, minLength from the tensor.
 * Apply to a spring/pull/pushspring tensor that already has equilibriumLength.
 * @class
 * @extends KeyInputBehaviour
 */
class KeyToLengthBehaviour extends KeyInputBehaviour {
	constructor() {
		super();
	}

	/** @param {StoreableObject} storeableObject */
	attachTo(storeableObject) {
		super.attachTo(storeableObject);
		storeableObject.registerOverride(BehaviourOverride.PREUPDATEPOSITION, KeyToLengthBehaviour.prototype.applyKeyLength);
	}

	/** @param {StoreableObject} storeableObject */
	detachFrom(storeableObject) {
		super.detachFrom(storeableObject);
		storeableObject.unregisterOverride(BehaviourOverride.PREUPDATEPOSITION, KeyToLengthBehaviour.prototype.applyKeyLength);
	}

	/**
	 * Called with 'this' = the tensor, deltaTime in seconds.
	 * Adjusts equilibriumLength by rate × deltaTime, clamped to minLength if set.
	 * @param {number} deltaTime
	 */
	applyKeyLength(deltaTime) {
		if (this.equilibriumLength === undefined) return;
		let rate = 0;
		if (isKeyDown(this.key1)) rate += (this.lengthRate1 || 0);
		if (isKeyDown(this.key2)) rate += (this.lengthRate2 || 0);
		if (rate === 0) return;
		this.equilibriumLength += rate * deltaTime;
		if (this.minLength !== undefined) {
			this.equilibriumLength = Math.max(this.minLength, this.equilibriumLength);
		}
	}
}



/**
 * @class
 * @extends Behaviour
 */
class SelectorBehaviour extends Behaviour {
	/**
	 * This class detects when an object bounces of a tensor or leaves it at the end.
	 * @param {World} world
	 * @param {TrussNode} trussNode
	 * @param {string} initialLabels
	 * @param  {object} valueObject
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.lastPointedOn=undefined;
		storeableObject.wasPressed = false;
		storeableObject.cursorPosition = new Position(0, 0);

		storeableObject.registerOverride(BehaviourOverride.SENSE, SelectorBehaviour.prototype.sense);
		storeableObject.registerOverride(BehaviourOverride.UPDATEPOSITION, SelectorBehaviour.prototype.updatePosition);
		storeableObject.registerOverride(BehaviourOverride.SHOW, SelectorBehaviour.prototype.show);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.SENSE, SelectorBehaviour.prototype.sense);
		storeableObject.unregisterOverride(BehaviourOverride.UPDATEPOSITION, SelectorBehaviour.prototype.updatePosition);
		storeableObject.unregisterOverride(BehaviourOverride.SHOW, SelectorBehaviour.prototype.show);
	}


	/**
	 * If the position of the controlled object bounces or leaves on the right or
	 * left side, disconnect it and restore the tensor to its original.
	 * @param {number} deltaTime
	 * @param {Trussnode} trussNode
	 */
	sense(deltaTime, trussNode) {
		if (trussNode != universe.currentNode) {
			return;
		}
		
		// Throttle debug logging to once per second
		if (!this._lastDebugLog) this._lastDebugLog = 0;
		const now = Date.now();
		const shouldLog = (now - this._lastDebugLog) > 1000;
		if (shouldLog) this._lastDebugLog = now;
		
		// Cursor position in screen pixels
		let cursorScreenX = control.myX;
		let cursorScreenY = control.myY;
		this.cursorPosition = trussNode.view.worldPositionWithOffset(cursorScreenX, cursorScreenY);
		this.displayCursorPosition = new Position(displayMousePercentX, displayMousePercentY);
		
		// Check if selectedObject is in display plane
		let selectedIsDisplay = false;
		if (universe.selectedObject && universe.selectedObject.labels) {
			let coordLabel = universe.selectedObject.labels.find(l => l.name === 'plane');
			selectedIsDisplay = coordLabel && coordLabel.planeProperty === 'display';
		}
		
		if (shouldLog && control.mouseSet) {
			console.log(`sense: mouseSet=${control.mouseSet}, selectedObject=${universe.selectedObject?.name}, selectedIsDisplay=${selectedIsDisplay}`);
		}
		
		this.setPosition(this.cursorPosition);
		
		let closest = trussNode.getClosestObject(3, this);

		if (!control.mouseSet) {
			if (!closest) {
				if (this.lastPointedOn && this.lastPointedOn != universe.selectedObject) {
					this.lastPointedOn.setHighlight(0);
				}
				this.lastPointedOn = undefined;
			} else { // There is a closest object
				if (closest != universe.selectedObject && this.lastPointedOn != closest) {
					if (this.lastPointedOn && this.lastPointedOn != universe.selectedObject) {
						this.lastPointedOn.setHighlight(0);
					}
					closest.setHighlight(1);
					this.lastPointedOn = closest;
				}
			}
		} else if (!this.wasPressed && control.mouseSet) { // Mouse was just pressed
			if (universe.selectedObject != closest) {
				if (universe.selectedObject) {
					universe.selectedObject.setHighlight(0);
				}
				universe.select(closest,this.parentTrussNode.element);
			}
		} else if (control.mouseSet) { // Mouse is continually pressed
			if (universe.selectedObject && universe.selectedObject.isNode) {
				universe.selectedObject.resetVelocity();
				// For display nodes, update localPosition directly
				if (selectedIsDisplay) {
					universe.selectedObject.localPosition = new Position(
						this.displayCursorPosition.x,
						this.displayCursorPosition.y
					);
					if (shouldLog && universe.selectedObject.name !== 'nail') {
						const cs = universe.selectedObject.coordinateSystem;
						const screenPixels = cs ? cs.convertToScreenPixels(universe.selectedObject) : {x: 0, y: 0};
						console.log(`${universe.selectedObject.name}: localPosition=(${universe.selectedObject.localPosition.x.toFixed(1)}, ${universe.selectedObject.localPosition.y.toFixed(1)}) → screenPixels=(${screenPixels.x.toFixed(0)}, ${screenPixels.y.toFixed(0)})`);
					}
				} else {
					universe.selectedObject.copyPosition(this.cursorPosition);
				}
			}
		}

		this.wasPressed = control.mouseSet;
	}

	/**
	 * Update the position based on velocity, then let
	 * the this.positionFunction (if present) tell where it should actually be
	 */
	updatePosition() {
		this.setPosition(this.cursorPosition);
		this.velocity = new Vector(0, 0);
	}

	/**
	 * Draw the circle representing the node
	 * @param {Trussnode} truss
	 */
	show(truss) {
		let view = truss.view;
		this.highLight(view.context);
		if (view.inside(this.getPosition())) {
			const centerX = view.x(this.getPosition());
			const centerY = view.y(this.getPosition());
			const crosshairLength = 12;
			const circleRadius = 4;

			view.context.strokeStyle = 'Yellow';
			view.context.lineWidth = 2;
			view.context.beginPath();
			view.context.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
			view.context.moveTo(centerX, centerY - crosshairLength);
			view.context.lineTo(centerX, centerY + crosshairLength);
			view.context.moveTo(centerX - crosshairLength, centerY);
			view.context.lineTo(centerX + crosshairLength, centerY);
			view.context.stroke();
		}
	}
}


/** This behaviour draws a button next to the object and trigger a script
 * @class
 * @extends Behaviour
 */
class ButtonBehaviour extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		let button = document.createElement('button');
		button.id = 'propertiesButton';
		button.style.position='absolute';
		button.classList.add('worldButton');
		storeableObject.parentTrussNode.element.appendChild(button);
		button.addEventListener('click', (...args) => {
			let func = storeableObject.buttonScript_Evaluated;
			if (func) {
				func(...args);
			}
		}, false);
		
		storeableObject.buttonReference=button;

		storeableObject.registerOverride(
			BehaviourOverride.UPDATEPOSITION, 
			ButtonBehaviour.prototype.updateXPosition);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.UPDATEPOSITION, ButtonBehaviour.prototype.updateXPosition);
		
		if (storeableObject.buttonReference) {
			storeableObject.parentTrussNode.element.removeChild(storeableObject.buttonReference);
		}
	}

	/**
	 * If the angle between the tensors is more than 180 degrees, cut the node free.
	 * @return {number}
	 */
	updateXPosition() {
		this.buttonReference.innerHTML = this.name;
		this.parentTrussNode.view.putElementOnScreen(this.localPosition, this.buttonReference);
	}
}

/**
 * Changes tensor color based on force stress magnitude.
 * 
 * Phase 1 (0 to forceLimit):
 *   Red channel increases from original to 255; green and blue stay at original
 * Phase 2 (forceLimit to 2×forceLimit):
 *   Red stays at 255; green and blue decrease from original to 0
 * Beyond 2×forceLimit:
 *   Pure red (255, 0, 0)
 */
class ForceSensorBehaviour extends Behaviour {
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		// Capture and parse the original color, store it on the tensor
		storeableObject._forceSensorOriginalColor = parseColor(storeableObject.color);
		if (!storeableObject._forceSensorOriginalColor) {
			// Fallback: if color can't be parsed, default to white
			storeableObject._forceSensorOriginalColor = [255, 255, 255];
		}
		
		storeableObject.registerOverride(BehaviourOverride.SENSE, ForceSensorBehaviour.prototype.sense);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.SENSE, ForceSensorBehaviour.prototype.sense);
		storeableObject._forceSensorOriginalColor = null;
	}

	/**
	 * Called each sense cycle. Calculates stress-based color gradient.
	 * 'this' is the tensor object.
	 */
	sense() {
		if (!this.force) {
			// No force calculated yet; keep original color
			return;
		}
		if (!this.forceLimit || this.forceLimit <= 0) {
			// No limit set; can't calculate stress
			return;
		}

		const forceLength = Vector.length(this.force);
		const originalRgb = this._forceSensorOriginalColor || [255, 255, 255];
		
		// Interpolate color based on stress
		const newRgb = interpolateStressColor(originalRgb, forceLength, this.forceLimit);
		this.color = rgbToString(newRgb);
	}
}

export { KeyInputBehaviour, KeyToTorqueBehaviour, KeyToLengthBehaviour, SelectorBehaviour, ButtonBehaviour, ForceSensorBehaviour };