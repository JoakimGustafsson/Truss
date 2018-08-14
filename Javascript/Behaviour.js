

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
	}

	/**
	 *
	 */
	oncreate() {
		this.keyState=[];
		window.addEventListener('keydown', (e) =>{
			this.keyState[e.keyCode || e.which] = true;
		}, true);
		window.addEventListener('keyup', (e) => {
			this.keyState[e.keyCode || e.which] = false;
		}, true);

	}

	/**
	 * Used to poll if a key has been pressed and moves to the corresponding vector
	 * Note that several keys can be pressed simultaneously
	 * @param  {number} time
	 */
	updatePosition(time) {
		let p = this.restPosition;
		for (let i = 0; i < this.keyVectors.length; i++) {
			if (this.keyState[this.keyVectors[i].key]) {
				p = Vector.addVectors(p, this.keyVectors[i].vector);
			}
		}
		this.setPosition(p);
	};
}


