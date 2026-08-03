
/*jshint esversion:6 */
/* global control Tensor smallnodezoom debugEntity Behaviour BehaviourOverride*/
import { Position, Vector } from '../Primitives.js';
import { control, universe, displayMousePercentX, displayMousePercentY } from '../globals.js';
import { Behaviour, BehaviourOverride } from './Behaviour.js';


/** This sensor reads key presses and moves the node a given vector associated with each registered key.
 * Example
 *		sensorNode.registerKey(37, new Vector(-1, 0));
 *		sensorNode.registerKey(65, new Vector(-1, 0));
 *		sensorNode.registerKey(39, new Vector(1, 0));
 *		sensorNode.registerKey(68, new Vector(1, 0));
 *		sensorNode.registerKey(32, new Vector(0, 1));
 * @class
 * @extends Node
 */
class KeySensor extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.keyState = [];
		storeableObject.keyDownFunction = (e) => {
			storeableObject.keyState[e.keyCode || e.which] = true;
		};
		storeableObject.keyUpFunction = (e) => {
			storeableObject.keyState[e.keyCode || e.which] = true;
		};

		window.addEventListener('keydown', storeableObject.keyDownFunction, true);
		window.addEventListener('keyup', storeableObject.keyUpFunction, true);

		storeableObject.registerOverride(BehaviourOverride.UPDATEPOSITION, KeySensor.prototype.updatePosition);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		window.removeEventListener('keydown', storeableObject.keyDownFunction, true);
		window.removeEventListener('keyup', storeableObject.keyUpFunction, true);

		storeableObject.unregisterOverride(BehaviourOverride.UPDATEPOSITION, KeySensor.prototype.updatePosition);

	}

	/**
	 * Used to poll if a key has been pressed and moves to the corresponding vector
	 * Note that several keys can be pressed simultaneously
	 *
	 * Remember that this function will be attached to a storeable object and thus 
	 * the 'this' keyword will reference the node or object rather than the behaviour
	 *
	 */
	updatePosition() {
		let p = this.restPosition;
		for (let i = 0; i < this.keyVectors.length; i++) {
			if (this.keyState[this.keyVectors[i].key]) {
				p = Vector.addVectors(p, this.keyVectors[i].vector);
			}
		}
		this.setPosition(p);
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
 * @class
 * @extends Behaviour
 */
class ForceSensorBehaviour extends Behaviour {
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
		storeableObject.registerOverride(BehaviourOverride.SENSE, ForceSensorBehaviour.prototype.sense);
		storeableObject.registerOverride(BehaviourOverride.SHOW, ForceSensorBehaviour.prototype.show);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.SENSE, ForceSensorBehaviour.prototype.sense);
		storeableObject.unregisterOverride(BehaviourOverride.SHOW, ForceSensorBehaviour.prototype.show);
	}


	/**
	 * If the force in the tensor is above the limit, then the tenso is broken
	 * @param {number} deltaTime
	 * @param {Trussnode} trussNode
	 */
	sense() {
		if (!this.force) {
			console.warn('No force assigned to break behaviour sensor:', this.name);
			return;
		}
		if (Vector.length(this.force)>this.forceLimit) {
			this.color='red';
		} else {
			this.color='white';
		}
	}

		
	/**
	 * Draw the circle representing the node
	 * @param {Trussnode} truss
	 */
	show(truss) {
	
	}
}

export { KeySensor, SelectorBehaviour, ButtonBehaviour, ForceSensorBehaviour };