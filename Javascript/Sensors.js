/**
 *
 */


let keyState = {};

/**
 * @class
 * @extends Node
 */
class KeySensorNode extends Node {
	/**
	 * @param  {Position} startPosition
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 */
	constructor(startPosition, mass = 0.001, name = 'keysensornode', positionFunction, showFunction, velocityLoss = 1) {
		super(startPosition, mass, name, positionFunction, showFunction, velocityLoss);
		this.startPosition = startPosition;
		this.keyList = [];

		window.addEventListener('keydown', function(e) {
			keyState[e.keyCode || e.which] = true;
		}, true);
		window.addEventListener('keyup', function(e) {
			keyState[e.keyCode || e.which] = false;
		}, true);
	}

	/**
	 * Used to poll if a key has been pressed and moves to the corresponding vector
	 * Note that several keys can be pressed simultaneously
	 * @param  {number} time
	 */
	updatePosition(time) {
		let p = this.startPosition;
		for (let i = 0; i < this.keyList.length; i++) {
			if (keyState[this.keyList[i].key]) {
				p = addVectors(p, this.keyList[i].vector);
			}
		}
		this.setPosition(p);
	};

	/**
	 * Dummy function. This is better handled in the updatePosition() function since
	 * the sensor directly inluence the position of the sensor node rather than the iO.
	 */
	sense() {}

	/**
	 * Combines a key number with a vecor to move if that key is being pressed
	 * @param  {number} keyNr
	 * @param  {Vector} v
	 */
	registerKey(keyNr, v) {
		this.keyList.push({
			'key': keyNr,
			'vector': v,
		});
	};
}

/**
 * @class
 * @extends Node
 */
class CollisionSensorNode extends Node {
	/**
	 * This class detects collisions between an object and tensors.
	 * First use registerTrussObjectAndActuator() to connect and object
	 * to the actuator that should be triggered inside a truss.
	 * @param  {Position} position
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 */
	constructor(position, mass = 0.01, name = 'collisionSensorNode', positionFunction, showFunction, velocityLoss) {
		super(position, mass, name, positionFunction, showFunction, velocityLoss);
		this.actuator;
		let _this = this;
		document.addEventListener('collisionEvent',
			function(e) {
				_this.collisionFunction.call(_this, e);
			}, false);
	}

	/**
	 * @param  {Truss} truss
	 * @param  {Node} obj
	 * @param  {Actuator} actuator
	 */
	registerTrussObjectAndActuator(truss, obj, actuator) {
		truss.addSensor(this);
		this.localactuator = actuator;
		this.localtruss = truss;
		this.localobject = obj;
	};

	/**
	 * Has the iO node collided with any Spring.
	 * If so, that will casue a collisionEvent generated from the Tensors
	 * checkCollision() function.
	 */
	sense() {
		for (let tensor of this.localtruss.positionBasedTensors) {
			if (tensor.tensorType == TensorType.SPRING) {
				tensor.checkCollision(this.localobject); // the tensor will raiose an event that is caught by the collisionFunction()
			}
		}
	}

	/**
	 * @param  {Event} collisionEvent
	 */
	collisionFunction(collisionEvent) {
		let collider = collisionEvent.detail.collider;
		if (collider != this.localobject) {
			return;
		}
		let where = collisionEvent.detail.where;
		let from = collisionEvent.detail.from;
		let tensor = collisionEvent.detail.tensor;

		let direction = 'left';
		if (from > 0) {
			direction = 'right';
		}
		console.log(collider.name +
			' collided with tensor ' + tensor.getName() + ' at ' + where + ' along its length. It collided from the ' +
			direction
		);

		this.localactuator.attachToTensor(this.localtruss, tensor, where, from);
	};
}

/**
 * @class
 * @extends Node
 */
class BounceSensorNode extends Node {
	/**
	 * This class detects when an object bounces of a tensor or leaves it at the end.
	 * @param  {Position} position
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 */
	constructor(position, mass = 0.01, name = 'BounceSensorNode', positionFunction, showFunction, velocityLoss) {
		super(position, mass, name, positionFunction, showFunction, velocityLoss);
	}

	/**
	 * @param  {Truss} truss
	 * @param  {Node} obj
	 * @param  {Actuator} actuator
	 */
	registerTrussObjectAndActuator(truss, obj, actuator) {
		truss.addSensor(this);
		this.localactuator = actuator;
		this.localtruss = truss;
		this.localobject = obj;
	};

	/**
	 * If the position of the controlled object bounces or leaves on the right or
	 * left side, disconnect it and restore the tensor to its original.
	 */
	sense() {
		if (!this.localobject || !this.localobject.breakList) return;
		for (let lineBreaker of this.localobject.breakList) {
			let p1 = lineBreaker.immediatelyLeft.getOppositeNode(this.localobject).getPosition();
			let p2 = lineBreaker.immediatelyRight.getOppositeNode(this.localobject).getPosition();
			let p3 = this.localobject.getPosition();
			let perpendicularDistance = getS(p1, p2, p3);
			let above = (perpendicularDistance * lineBreaker.direction > 0.0);
			let inside = getTInside(p1, p2, p3);
			let inside2 = getTInside2(p1, p2, p3);
			let closeParallell = (Math.abs(perpendicularDistance) < 0.01); // 0.2);

			if (above && inside) {
				this.localactuator.bounceExit(lineBreaker);
			} else if (closeParallell && !inside) {
				this.localactuator.endExit(lineBreaker);
			}
		}
	}
}
