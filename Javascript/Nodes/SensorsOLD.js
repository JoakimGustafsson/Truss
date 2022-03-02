/**
 *
 */

// let keyState = {};

/** Abstract sensor class
 * @class
 * @extends Node
 */
class SensorNode extends Node {
	/**
	 * @param {World} world
	 * @param {Truss} parentTrussNode
	 * @param {string} initialLabels
	 * @param  {object} valueObject
	 */
	constructor(world, parentTrussNode, initialLabels, valueObject) {
		super(world, parentTrussNode, initialLabels, valueObject);
		this.sensor = true;
	}
}


/* This sensor reads key presses and moves the node a given vector associated with each registered key.
 * Example
 *		sensorNode.registerKey(37, new Vector(-1, 0));
 *		sensorNode.registerKey(65, new Vector(-1, 0));
 *		sensorNode.registerKey(39, new Vector(1, 0));
 *		sensorNode.registerKey(68, new Vector(1, 0));
 *		sensorNode.registerKey(32, new Vector(0, 1));
 * @class
 * @extends Node
 *
class KeySensorNode extends SensorNode {
	/**
	 * @param  {TrussNode} trussNode
	 * @param  {Position} startPosition
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 *
	constructor(trussNode, startPosition, mass = 0.001, name = 'keysensornode', positionFunction, showFunction, velocityLoss = 1) {
		super(trussNode, startPosition, mass, name, positionFunction, showFunction, velocityLoss);
		this.restPosition = startPosition;
		this.keyVectors = [];

		window.addEventListener('keydown', function(e) {
			keyState[e.keyCode || e.which] = true;
		}, true);
		window.addEventListener('keyup', function(e) {
			keyState[e.keyCode || e.which] = false;
		}, true);
	}

	/**
	 * @param  {Truss} truss
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 *
	serialize(truss, nodeList, tensorList) {
		let representationObject = super.serialize(truss, nodeList, tensorList);
		representationObject.classname = 'KeySensorNode';
		representationObject.startPosition = this.restPosition.serialize();
		representationObject.keyList = JSON.stringify(this.keyVectors);

		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {KeySensorNode}
	 *
	deSerialize(restoreObject, nodeList, tensorList) {
		super.deSerialize(restoreObject, nodeList, tensorList);
		this.restPosition = new Position().deSerialize(restoreObject.startPosition);
		this.keyVectors = JSON.parse(restoreObject.keyList);
		return this;
	}

	/**
	 * Used to poll if a key has been pressed and moves to the corresponding vector
	 * Note that several keys can be pressed simultaneously
	 * @param  {number} time
	 *
	updatePosition(time) {
		let p = this.restPosition;
		for (let i = 0; i < this.keyVectors.length; i++) {
			if (keyState[this.keyVectors[i].key]) {
				p = Vector.addVectors(p, this.keyVectors[i].vector);
			}
		}
		this.setPosition(p);
	};


	/*
	 * Combines a key number with a vecor to move if that key is being pressed
	 * @param  {number} keyNr
	 * @param  {Vector} v
	 *
	registerKey(keyNr, v) {
		this.keyVectors.push({
			'key': keyNr,
			'vector': v,
		});
	};
} */

/** This sensor checks for other nodes close by and moves the node a given vector associated
 * with each registered node.
 * Example
 *		sensorNode.registerProximity(node1, distance, new Vector(1, 0));
 * @class
 * @extends Node
 */
class ProximitySensorNode extends SensorNode {
	/**
	 * @param  {TrussNode} trussNode
	 * @param  {Position} startPosition
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {Function} triggerFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 */
	constructor(trussNode, startPosition, mass = 0.001, name = 'proximitysensornode', triggerFunction, showFunction, velocityLoss = 1) {
		super(trussNode, startPosition, mass, name, undefined, showFunction, velocityLoss);
		this.startPosition = startPosition;
		this.triggerFunction = triggerFunction;
		this.proximityList = [];
	}

	/**
	 * @param  {Truss} truss
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(truss, nodeList, tensorList) {
		let representationObject = super.serialize(truss, nodeList, tensorList);
		representationObject.classname = 'ProximitySensorNode';
		representationObject.startPosition = this.startPosition.serialize();
		representationObject.triggerFunction = this.triggerFunction;

		let proxies = [];
		for (let item of this.proximityList) {
			proxies.push({
				'node': nodeList.indexOf(item.node),
				'distance': item.distance,
				'vector': item.vector.serialize(),
			});
		}
		representationObject.proximityList = proxies;

		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {ProximitySensorNode}
	 */
	deSerialize(restoreObject, nodeList, tensorList) {
		super.deSerialize(restoreObject, nodeList, tensorList);
		this.startPosition = new Position().deSerialize(restoreObject.startPosition);
		this.triggerFunction = restoreObject.triggerFunction;

		let proxies = [];
		for (let item of restoreObject.proximityList) {
			proxies.push({
				'node': nodeList[item.node],
				'distance': item.distance,
				'vector': new Vector().deSerialize(item.vector),
			});
		}
		this.proximityList = proxies;
		return this;
	}

	/**
	 * Used to poll if a key has been pressed and moves to the corresponding vector
	 * Note that several keys can be pressed simultaneously
	 * @param  {number} trussTime
	 */
	updatePosition(trussTime) {
		let p = this.startPosition;
		for (let proximityitem of this.proximityList) {
			/* eslint-disable-next-line */
			if (positionDistance(proximityitem.node.getPosition(), this.startPosition) <= proximityitem.distance) {
				p = Vector.addVectors(p, proximityitem.vector);
				if (this.triggerFunction) {
					this.triggerFunction(this, trussTime);
				}
			}
		}
		this.setPosition(p);
	}

	/**
	 * Dummy function. This is better handled in the updatePosition() function since
	 * the sensor directly inluence the position of the sensor node rather than the iO.
	 */
	sense() {}

	/**
	 * Combines a node with a vecor to move if that node is close
	 * @param  {Node} node
	 * @param  {number} distance
	 * @param  {Vector} vector
	 */
	registerProximity(node, distance, vector) {
		this.proximityList.push({
			'node': node,
			'distance': distance,
			'vector': vector,
		});
	}
}

/**
 * @class
 * @extends Node
 */
class CollisionSensorNode extends SensorNode {
	/**
	 * This class detects collisions between an object and tensors.
	 * First use registerTrussObjectAndActuator() to connect and object
	 * to the actuator that should be triggered inside a truss.
	 * @param  {TrussNode} trussNode
	 * @param  {Position} position
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {Node} obj
	 * @param  {Actuator} actuator
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 */
	constructor(trussNode, position, mass = 0.01, name = 'collisionSensorNode', obj,
		actuator, positionFunction, showFunction, velocityLoss) {
		super(trussNode, position, mass, name, positionFunction, showFunction, velocityLoss);
		this.localActuator = actuator;
		this.localObject = obj;
		let _this = this;
		document.addEventListener('collisionEvent',
			function(e) {
				_this.collisionFunction.call(_this, e);
			}, false);
	}

	/**
	 * @param  {Truss} truss
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(truss, nodeList, tensorList) {
		let representationObject = super.serialize(truss, nodeList, tensorList);
		representationObject.classname = 'CollisionSensorNode';
		representationObject.localActuator = nodeList.indexOf(this.localActuator);
		representationObject.localObject = nodeList.indexOf(this.localObject);

		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {CollisionSensorNode}
	 */
	deSerialize(restoreObject, nodeList, tensorList) {
		super.deSerialize(restoreObject, nodeList, tensorList);
		this.localActuator = nodeList[restoreObject.localActuator];
		this.localObject = nodeList[restoreObject.localObject];
		return this;
	}
	/**
	 * Has the iO node collided with any Spring.
	 * If so, that will casue a collisionEvent generated from the Tensors
	 * checkCollision() function.
	 * @param {number} deltaTime
	 * @param {Truss} truss
	 */
	sense(deltaTime, truss) {
		for (let tensor of truss.connectedTensors) {
			if (!tensor.isGhost()) {
				tensor.checkCollision(this.localObject, truss);
				// the tensor will raise an event that is caught by the collisionFunction()
			}
		}
	}

	/**
	 * @param  {Event} collisionEvent
	 */
	collisionFunction(collisionEvent) {
		let collider = collisionEvent.detail.collider;
		if (collider != this.localObject) {
			return;
		}
		let where = collisionEvent.detail.where;
		let from = collisionEvent.detail.from;
		let tensor = collisionEvent.detail.tensor;
		let truss = collisionEvent.detail.truss;

		let direction = 'left';
		if (from > 0) {
			direction = 'right';
		}
		console.log(collider.name +
			' collided from the ' + direction + ' with tensor ' +
			tensor.getName() + ' at ' + Math.round(where * 100) + '% along its length.');
		this.localActuator.attachToTensor(truss, tensor, where, from);
	}
}

/**
 * @class
 * @extends SensorNode
 */
class BounceSensorNode extends SensorNode {
	/**
	 * This class detects when an object bounces of a tensor or leaves it at the end.
	 * @param  {TrussNode} trussNode
	 * @param  {Position} position
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {Node} obj
	 * @param  {Actuator} actuator
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 */
	constructor(trussNode, position, mass = 0.01, name = 'BounceSensorNode', obj, actuator, positionFunction, showFunction, velocityLoss) {
		super(trussNode, position, mass, name, positionFunction, showFunction, velocityLoss);
		this.localActuator = actuator;
		this.localObject = obj;
	}

	/**
	 * @param  {Truss} truss
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(truss, nodeList, tensorList) {
		let representationObject = super.serialize(truss, nodeList, tensorList);
		representationObject.classname = 'BounceSensorNode';
		representationObject.localActuator = nodeList.indexOf(this.localActuator);
		representationObject.localObject = nodeList.indexOf(this.localObject);
		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {CollisionSensorNode}
	 */
	deSerialize(restoreObject, nodeList, tensorList) {
		super.deSerialize(restoreObject, nodeList, tensorList);
		this.localActuator = nodeList[restoreObject.localActuator];
		this.localObject = nodeList[restoreObject.localObject];
		return this;
	}

	/**
	 * If the position of the controlled object bounces or leaves on the right or
	 * left side, disconnect it and restore the tensor to its original.
	 * @param {number} deltaTime
	 * @param {Truss} truss
	 */
	sense(deltaTime, truss) {
		if (!this.localObject || !this.localObject.breakList) return;
		for (let lineBreaker of this.localObject.breakList) {
			let n1 = lineBreaker.immediatelyLeft.getOppositeNode(this.localObject);
			let p1 = n1.getPosition();
			let n2 = lineBreaker.immediatelyRight.getOppositeNode(this.localObject);
			let p2 = n2.getPosition();
			let p3 = this.localObject.getPosition();
			let perpendicularDistance = getS(p1, p2, p3);
			let above = (perpendicularDistance * lineBreaker.direction > 0.0);
			/* eslint-disable-next-line */
			let inside = getTInside(p1, p2, p3);
			// let inside2 = getTInside2(p1, p2, p3);
			// let closeParallell = (Math.abs(perpendicularDistance) < 0.01); // 0.2);

			if (above && inside) {
				this.localActuator.bounceExit(truss, lineBreaker);
			} else {
				let nextTensor = 0;
				let positionAlongNextTensor = 0;
				if (this.passCloseBy(lineBreaker.immediatelyLeft.node2, lineBreaker.immediatelyLeft.node1, deltaTime)) {
					console.log('exit at start of tensor ' + lineBreaker.original.getName());
					nextTensor = this.getAngleClosestRight(n2, n1, -1);
					if (nextTensor) {
						positionAlongNextTensor = this.positionVelocityAlongNextTensor(nextTensor, n1, this.localObject, deltaTime);
					}
					this.localActuator.endExit(truss, lineBreaker, n1, nextTensor, positionAlongNextTensor);
				} else if (this.passCloseBy(lineBreaker.immediatelyRight.node1, lineBreaker.immediatelyRight.node2, deltaTime)) {
					console.log('exit at end  of tensor ' + lineBreaker.original.getName());
					nextTensor = this.getAngleClosestRight(n1, n2, 1);
					if (nextTensor) {
						positionAlongNextTensor = this.positionVelocityAlongNextTensor(nextTensor, n2, this.localObject, deltaTime);
					}
					this.localActuator.endExit(truss, lineBreaker, n2, nextTensor, positionAlongNextTensor);
				}
			}
		}
	}
	/** Generate a new position along the tensor, represent egos change one tick, ie the velocity of ego.
	 * @param  {Tensor} tensor
	 * @param  {Node} connectionNode
	 * @param  {Node} ego
	 * @param  {number} deltaTime
	 * @return {Vector}
	 */
	positionVelocityAlongNextTensor(tensor, connectionNode, ego, deltaTime) {
		let p1 = connectionNode.getPosition();
		let p2 = tensor.getOppositeNode(connectionNode).getPosition();
		let originalVector = new Vector(p2.x - p1.x, p2.y - p1.y);
		let speed = length(ego.velocity) * deltaTime;
		/* eslint-disable-next-line */
		let newShortDisplacementVector = normalizeVector(speed, originalVector);
		return Vector.addVectors(p1, newShortDisplacementVector);
	}

	/**
	 * @param  {Node} startNode
	 * @param  {Node} endNode
	 * @param {number} deltaTime
	 * @return {number}
	 */
	passCloseBy(startNode, endNode, deltaTime) {
		let realVelocity = Vector.subtractVectors(startNode.velocity, endNode.velocity);

		/* eslint-disable-next-line */
		let relativeVelocity = multiplyVector(deltaTime, realVelocity);
		let p1 = startNode.getPosition();
		let p2 = endNode.getPosition();
		let p3 = Vector.addVectors(p1, relativeVelocity);
		let t = getT(p1, p2, p3);
		if (t > 0.5) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * @param  {Node} farNode
	 * @param  {Node} closeNode
	 * @param  {number} dir Direction
	 * @return {Tensor}
	 */
	getAngleClosestRight(farNode, closeNode, dir) {
		let closestAngle = -Math.PI;
		let closestTensor = undefined;
		/* eslint-disable-next-line */
		let originalAngle = anglify(getXAngle(
			farNode.getPosition().x - closeNode.getPosition().x,
			farNode.getPosition().y - closeNode.getPosition().y));

		for (let tensor of closeNode.positionBasedTensors) {
			/* eslint-disable-next-line */
			if (tensor.tensorType == TensorType.SPRING && !tensor.isGhost()) {
				let tempAngle = tensor.getTensorAngle(closeNode);
				/* eslint-disable-next-line */
				let tempdiff = angleSubstract(originalAngle, tempAngle);
				if ((0 > tempdiff * dir) && (tempdiff * dir > closestAngle)) {
					closestAngle = tempdiff;
					closestTensor = tensor;
				}
			}
		}
		return closestTensor;
	}
}


/**
 * @class
 * @extends SensorNode
 */
class PositionNode extends SensorNode {
	/**
	 * This class represents a node that reflect the position of another node, that node is likely from another truss.
	 * @param {TrussNode} trussNode - The trussNode that "owns" this node
	 * @param {TrussNode} trackedNode - The node that should be mirrored.
	 */
	constructor(trussNode, trackedNode) {
		super(trussNode, undefined, undefined, 'PositionNode');
		this.trackedNode = trackedNode;
	}

	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		let representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname = 'PositionNode';
		representationObject.trackedNode=nodeList.indexOf(this.trackedNode);
		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} superNodes
	 * @param  {Array} superTensors
	 */
	deSerialize(restoreObject, superNodes, superTensors) {
		super.deSerialize(restoreObject, superNodes, superTensors);
		this.trackedNode=superNodes[restoreObject.trackedNode];
		return;
	}

	/**
	 * Simply mirrors the position of the tracked node.
	 */
	sense() {
		let t = new Position(this.trackedNode.getPosition().x, this.trackedNode.getPosition().y);
		this.setPosition(t);
	}

	/**
	 * Draw the circle representing the node
	 * @param {Truss} truss
	 */
	show(truss) {
		let view=truss.view;
		this.highLight(view.context);
		if (view.inside(this.getPosition())) {
			view.context.strokeStyle = 'Yellow';
			view.context.lineWidth = 1;
			view.context.beginPath();
			view.drawCircle(this.getPosition(), 0.1);
			view.drawLine(Vector.subtractVectors(this.getPosition(), new Position(0, 0.5)),
				Vector.addVectors(this.getPosition(), new Position(0, 0.5)));
			view.drawLine(Vector.subtractVectors(this.getPosition(), new Position(0.5, 0)),
				Vector.addVectors(this.getPosition(), new Position(0.5, 0)));
			view.context.stroke();
		}
	}
}
