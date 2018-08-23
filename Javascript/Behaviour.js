
let BehaviourOverride = {
	SHOW: 1,
	UPDATEPOSITION: 2,
	CALCULATE: 3,
	POSTCALCULATE: 4,
	TORQUE: 5,
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
	 * @param  {number} trussTime
	 * @param  {number} timeFactor
	 */
	updatePosition(trussTime, timeFactor) {
		let p = this.restPosition;
		for (let i = 0; i < this.keyVectors.length; i++) {
			if (this.keyState[this.keyVectors[i].key]) {
				p = Vector.addVectors(p, this.keyVectors[i].vector);
			}
		}
		this.setPosition(p);
	};
}


/** This behaviour sets the position according to a javascript snippet
 * @class
 * @extends Node
 */
class ScriptPosition extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.UPDATEPOSITION, ScriptPosition.prototype.updatePosition);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.UPDATEPOSITION, ScriptPosition.prototype.updatePosition);
	}

	/**
	 * Runs the script to calculate the position 
	 * @param  {Object} args
	 */
	updatePosition(...args) {
		let oldPosition = new Position(this.getPosition().x, this.getPosition().y);
		let func = this.positionScript_Evaluated;
		if (func) {
			this.setPosition(func(...args));
			this.velocity = Vector.subtractVectors(this.getPosition(), oldPosition);
			return 1; // blocks all other position updates on this node.
		}
	};
}


/** This behaviour sets the position according to a javascript snippet
 * @class
 * @extends Node
 */
class ScriptShow extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.SHOW, ScriptShow.prototype.show);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.SHOW, ScriptShow.prototype.show);
	}

	/**
	 * Run the script to draw the object
	 * @param  {Object} args
	 * @return {number}
	 */
	show(...args) {
		let func = this.showScript_Evaluated;
		if (func) {
			func(...args);
			return 1; // blocks all other position updates on this node.
		}
	};

}


/** This calculates force as if it was a linear spring
 * @class
 * @extends Node
 */
class SpringCalculator extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.CALCULATE, SpringCalculator.prototype.calculate);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.CALCULATE, SpringCalculator.prototype.calculate);
	}

	/**
	 * Calculate spring force
	 * @param  {Object} args
	 * @return {number}
	 */
	calculate(...args) {
		let actualVector = this.getActual();
		let normalized = actualVector.normalizeVector(this.equilibriumLength);
		let diffVector = Vector.subtractVectors(actualVector, normalized);
		this.force = Vector.multiplyVector(-this.constant, diffVector);
	};
}


/** This calculates force as if it was a linear spring that bends when short
 * @class
 * @extends Node
 */
class PullCalculator extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.CALCULATE, PullCalculator.prototype.calculate);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.CALCULATE, PullCalculator.prototype.calculate);
	}

	/**
	 * Calculate pull force
	 * @param  {Object} args
	 * @return {number}
	 */
	calculate(...args) {
		let actualVector = this.getActual();
		if ((this.equilibriumLength > 0) && (Vector.length2(actualVector) < this.equilibriumLength * this.equilibriumLength)) {
			this.force = new Force(0, 0);
		} else {
			let actualVector = this.getActual();
			let normalized = actualVector.normalizeVector(this.equilibriumLength);
			let diffVector = Vector.subtractVectors(actualVector, normalized);
			this.force = Vector.multiplyVector(-this.constant, diffVector);
		}
	};
}

/** This calculates force as if it was a linear spring that only pushes
 * @class
 * @extends Node
 */
class PushCalculator extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.CALCULATE, PushCalculator.prototype.calculate);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.CALCULATE, PushCalculator.prototype.calculate);
	}

	/**
	 * Calculate push force
	 * @param  {Object} args
	 * @return {number}
	 */
	calculate(...args) {
		let actualVector = this.getActual();
		if ((this.equilibriumLength > 0) && (Vector.length2(actualVector) < this.equilibriumLength * this.equilibriumLength)) {
			this.force = new Force(0, 0);
		} else {
			let actualVector = this.getActual();
			let normalized = actualVector.normalizeVector(this.equilibriumLength);
			let diffVector = Vector.subtractVectors(actualVector, normalized);
			this.force = Vector.multiplyVector(-this.constant, diffVector);
		}
	};

}


/** This calculates force as if it was a field
 * @class
 * @extends Node
 */
class FieldCalculator extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.CALCULATE, FieldCalculator.prototype.calculate);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.CALCULATE, FieldCalculator.prototype.calculate);
	}

	/**
	 * Calculate field strength
	 * @param  {Object} args
	 * @return {number}
	 */
	calculate(...args) {
		let actualVector = this.getActual();
		let normalized = actualVector.normalizeVector(1);
		let forceSize = this.constant * this.node1.mass * this.node2.mass / this.getLengthSquare();
		this.force = Vector.multiplyVector(-forceSize, normalized);
	};

}


/** This calculates displacement prevention force based on relative velocity.
 * Acts as a dampener that absorbs quick changes in tensor length
 * @class
 * @extends Node
 */
class AbsorbCalculator extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.POSTCALCULATE, AbsorbCalculator.prototype.calculate);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.POSTCALCULATE, AbsorbCalculator.prototype.calculate);
	}

	/**
	 * Calculate the displacement force based on relative velocitychange a tensor executes
	 * @param  {Object} args
	 * @return {number}
	 */
	calculate(...args) {
		let actualVector = this.getActual();
		let internalSpeed = Vector.subtractVectors(this.node1.velocity, this.node2.velocity);
		let parallellVelocity = Vector.multiplyVector(
			Vector.dotProduct(actualVector, internalSpeed),
			Vector.divideVector(actualVector, this.getLengthSquare()));
		this.force = Vector.multiplyVector(this.dampeningConstant, parallellVelocity);
	};

}

/** This calculates torque and determines rotation of a node.
 * @class
 * @extends Behaviour
 */
class AngleNode extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.TORQUE, AngleNode.prototype.calculateTorques);
		storeableObject.registerOverride(BehaviourOverride.ROTATE, AngleNode.prototype.updateRotation);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.TORQUE, AngleNode.prototype.calculateTorques);
		storeableObject.unregisterOverride(BehaviourOverride.ROTATE, AngleNode.prototype.updateRotation);
	}	

	/** Loop through all springs connected to this node and sum them p
	 * @return {number}
	 */
	calculateTorques() {
		let getTorque = function(node, tensor) {
			let idealAngle= tensor.angle2;
			if (node == tensor.node1) {
				idealAngle=tensor.angle1;
			}
			if (isNaN(idealAngle)) {
				return 0;
			}
			let tensorAngle = tensor.getTensorAngle(node);
			let theNodeShouldHaveAngle = tensorAngle - idealAngle;
			
			node.angle = anglify(node.angle);

			let correctionAngle = anglify(theNodeShouldHaveAngle - node.angle);
	
			let torque = node.getTorqueConstant() * correctionAngle;
			if (node == tensor.node1) {
				tensor.torque1 = -torque;
			} else {
				tensor.torque2 = torque;
			}
			return torque;
		};

		this.sumTorque = 0;
		if (!this.torqueConstant && this.torqueConstant != 0) {
			return;
		}
		for (let tensor of this.connectedTensors) {
			if (tensor.angleTensor) {
				this.sumTorque += getTorque(this, tensor);
			}
		}
		return this.sumTorque;
	}



	/**
	 * Calculate the final rotation speed
	 * @param {number} timeFactor
	 */
	updateRotation() {
		if (this.mass) {
			this.turnrate += this.sumTorque / (this.mass * 1000);
		} else {
			this.turnrate = 0; // weightless cannot turn
		}
		this.turnrate*= parseFloat(this.turnLoss);
		if (this.turnrate.isNaN) {
			this.turnrate=0;
		}
		this.angle += this.turnrate;
	}

}


/** This calculates torque and determines rotation of a node.
 * @class
 * @extends Behaviour
 */
class AngleTensor extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}


	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.CALCULATE, AngleTensor.prototype.calculateTorqueForce);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.CALCULATE, AngleTensor.prototype.calculateTorqueForce);
	}


	/**
	* Returns the force from this tensor resulting from the torque in the opposite node.
	* @param  {Node} node
	* @return {number}
	*/
	calculateTorqueForce() {
		function supportCalc(tensor, node, torque, perp) {
			// if (!node.torqueConstant || node.torqueConstant <= 0) {
			// 	return new Force(0, 0);
			// }
			if (!torque) {
				return new Force(0, 0);
			}
			let forceLenth = torque * tensor.getLength();
			let force = perp.normalizeVector(forceLenth);
			return force.opposite();
		}

		let perp = this.getActual().perpendicular();
		// Force that the torque in node 1 applies to node 2
		let torqueForce1 = supportCalc(this, this.node1, this.torque1, perp)
		// Force that the torque in node 2 applies to node 1
		let torqueForce2 = supportCalc(this, this.node2, this.torque2, perp)

		this.torqueForce1 = Vector.subtractVectors(torqueForce1, torqueForce2);
		this.torqueForce2 = Vector.subtractVectors(torqueForce2, torqueForce1);

		// Force that the torque in node 1 applies to node 2
		// this.torqueForce1 = supportCalc(this, this.node1, this.torque1, perp)
		// Force that the torque in node 2 applies to node 1
		// this.torqueForce2 = supportCalc(this, this.node2, this.torque2, perp)
	};

}



