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
	 * Kombines a key number with a vecor to move if that key is being pressed
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
	constructor(position, mass = 0.01, name = 'collisionsensornode', positionFunction, showFunction, velocityLoss) {
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
		truss.addCollider(obj);
		this.localactuator = actuator;
		this.localtruss = truss;
		this.localobject = obj;
	};

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
