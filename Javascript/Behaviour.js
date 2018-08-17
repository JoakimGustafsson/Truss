
let BehaviourOverride = {
	SHOW: 1,
	UPDATEPOSITION: 2,
	CALCULATE: 3,
};

/**
 * @class
 */
class Behaviours {
	/**
	 *
	 */
	constructor() {
	}
}

/**
 * @class
 */
class Behaviour {
	/**
	 *
	 */
	constructor() {
		// Adding parameters here
	}
}

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
		this.keyState=[];
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		window.addEventListener('keydown', (e) =>{
			this.keyState[e.keyCode || e.which] = true;
		}, true);
		window.addEventListener('keyup', (e) => {
			this.keyState[e.keyCode || e.which] = false;
		}, true);

		storeableObject.registerOverride(BehaviourOverride.UPDATEPOSITION, this.prototype.updatePosition);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		// this.keyState=[];
		window.addEventListener('keydown', (e) =>{
			this.keyState[e.keyCode || e.which] = true;
		}, true);
		window.addEventListener('keyup', (e) => {
			this.keyState[e.keyCode || e.which] = false;
		}, true);

		storeableObject.unregisterOverride(BehaviourOverride.UPDATEPOSITION, this.prototype.updatePosition);

	}

	/**
	 * Used to poll if a key has been pressed and moves to the corresponding vector
	 * Note that several keys can be pressed simultaneously
	 * 
	 * Remember that this function will be attached to a storebale object and thus 
	 * the 'this' keyword will reference the node or object rather than the behaviour
	 * 
	/**
	 * Update the position based on velocity, then let
	 * the this.positionFunction (if present) tell where it should actually be
	 * @param  {number} trussTime
	 * @param  {number} timeFactor
	 */
	updatePosition(trussTime, timeFactor) {
		alert('here');
		let p = this.restPosition;
		for (let i = 0; i < this.keyVectors.length; i++) {
			if (this.keyState[this.keyVectors[i].key]) {
				p = Vector.addVectors(p, this.keyVectors[i].vector);
			}
		}
		this.setPosition(p);
	};
}


