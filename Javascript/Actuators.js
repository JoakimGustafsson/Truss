/**
 * Represents a ActuatorNode.
 * @constructor
 * @param {Node} obj - The title of the book.
 * @param {Position} startPosition - The author of the book.
 * @param {float} mass - The author of the book.
 * @param {function} positionFunction - The author of the book.
 * @param {function} showFunction - The author of the book.
 * @param {float} velocityLoss - The author of the book.
 */
class ActuatorNode extends Node {
	/**
	 * Create a ActuatorNode
 	 * @constructor
	 * @param  {Node} obj - text.
	 * @param  {Position} startPosition - text2.
	 * @param  {float} mass=0.001
	 * @param  {string} name='actuatornode'
	 * @param  {function} positionFunction
	 * @param  {function} showFunction
	 * @param  {float} velocityLoss=0.99
	 */
	constructor(obj, startPosition, mass = 0.001, name = 'actuatornode',
		positionFunction, showFunction, velocityLoss = 0.99) {
		super(startPosition, mass, name, positionFunction,
			showFunction, velocityLoss);
		this.iO = obj; // the influenced object
	}
}

/**
	 * Create a BinaryActuatorNode
 	 * @constructor
	 * @param  {Node} obj - text.
	 * @param  {Position} position1 - text2.
	 * @param  {Position} position2 - text2.
	 * @param  {float} mass=0.001
	 * @param  {string} name='actuatornode'
	 * @param  {function} positionFunction
	 * @param  {function} showFunction
	 * @param  {float} velocityLoss=0.99
	 */
class BinaryActuatorNode extends ActuatorNode {
	/**
	 * Create a BinaryActuatorNode
 	 * @constructor
	 * @param  {Node} obj - text.
	 * @param  {Position} position1 - text2.
	 * @param  {Position} position2 - text2.
	 * @param  {float} mass=0.001
	 * @param  {string} name='actuatornode'
	 * @param  {function} positionFunction
	 * @param  {function} showFunction
	 * @param  {float} velocityLoss=0.99
	 */
	constructor(obj, position1, position2, mass = 0.001, name = 'binarynode', positionFunction, showFunction, velocityLoss = 0.99) {
		super(obj, new Position(position1.x, position1.y), mass, name, positionFunction, showFunction, velocityLoss);
		this.position1 = position1;
		this.position2 = position2;
		this.vector = subtractVectors(position2, position1);
	}
	/**
	 * Text
	 * @return {float}
	 */
	getState() {
		if (boxClose(this.getPosition(), this.position1, 0.01)) {
			return 1;
		} else if (boxClose(this.getPosition(), this.position2, 0.01)) {
			return 2;
		} else {
			return 0;
		}
	};

	/**
	 * @param  {Array} forceAppliers
	 * @return {float}
	 */
	getAcceleration(forceAppliers) {
		// Call parent in order to update this nodes normal acceleration
		let tempAcceleration = Node.prototype.getAcceleration.call(this, forceAppliers);
		let acceleration = multiplyVector(dotProduct(this.vector, tempAcceleration), divideVector(this.vector, length2(this.vector)));
		return acceleration;
	};

	/**
	 * @param  {float} time
	 */
	updatePosition(time) {
		super.updatePosition(time);
		let fractionPosition = getT(this.position1, this.position2, this.getPosition());
		if (fractionPosition < 0) {
			this.setPosition(new Position(this.position1.x, this.position1.y));
			this.velocity = new Velocity(0, 0);
		} else if (fractionPosition > 1) {
			this.setPosition(new Position(this.position2.x, this.position2.y));
			this.velocity = new Velocity(0, 0);
		}
	};
}


/**
	 * Create a JumpNode
 	 * @constructor
	 * @param  {Node} obj - text.
	 * @param  {Position} position1 - text2.
	 * @param  {Position} position2 - text2.
	 * @param  {Field} gravityField - text2.
	 * @param  {float} mass=0.001
	 * @param  {string} name='actuatornode'
	 * @param  {function} positionFunction
	 * @param  {function} showFunction
	 * @param  {float} velocityLoss=0.99
	 */
class JumpNode extends ActuatorNode {
	/**
	 * Create a JumpNode
 	 * @constructor
	 * @param  {Node} obj - text.
	 * @param  {Position} position1 - text2.
	 * @param  {Position} position2 - text2.
	 * @param  {Field} gravityField - text2.
	 * @param  {float} mass=0.001
	 * @param  {string} name='actuatornode'
	 * @param  {function} positionFunction
	 * @param  {function} showFunction
	 * @param  {float} velocityLoss=0.99
	 */
	constructor(obj, position1, position2, gravityField, mass = 0.01, name = 'jumpnode', positionFunction, showFunction, velocityLoss) {
		super(obj, position1, position2, mass, name, positionFunction, showFunction, velocityLoss);
		this.gravityField = gravityField;
		this.originalGravityConstant = gravityField.constant;
	}


	/**
	 * @param  {float} time
	 */
	updatePosition(time) {
		// super.updatePosition(time); //Call parent in order to update this.iO nodes position

		if (this.getState() == 1) {
			this.gravityField.constant = this.originalGravityConstant;
		} else if (this.getState() == 2) {
			this.gravityField.constant = this.originalGravityConstant * 4;
		}
	}
}

/**
	 * @param  {Node} obj
	 * @param  {Position} position1
	 * @param  {Position} position2
	 * @param  {Tensor} rightMovementTensor
	 * @param  {Tensor} leftMovementTensor
	 * @param  {float} mass=0.01
	 * @param  {string} name='springrunnernode'
	 * @param  {function} positionFunction
	 * @param  {function} showFunction
	 * @param  {float} velocityLoss=0.99
	 */
class SpringDanglerNode extends BinaryActuatorNode {
	/**
	 * @param  {Node} obj
	 * @param  {Position} position1
	 * @param  {Position} position2
	 * @param  {Tensor} rightMovementTensor
	 * @param  {Tensor} leftMovementTensor
	 * @param  {float} mass=0.01
	 * @param  {string} name='springrunnernode'
	 * @param  {function} positionFunction
	 * @param  {function} showFunction
	 * @param  {float} velocityLoss=0.99
	 */
	constructor(obj, position1, position2,
		rightMovementTensor, leftMovementTensor,
		mass = 0.01, name = 'springrunnernode', positionFunction,
		showFunction, velocityLoss = 0.99) {
		super(obj, position1, position2, mass, name, positionFunction, showFunction, velocityLoss);
		this.currentTensors = [];
		this.truss;
		this.speed = 6.67e-11;
		this.rightMovementTensor = rightMovementTensor;
		this.leftMovementTensor = leftMovementTensor;
	}
	/**
	 * @param  {object} result
	 */
	attachToTruss(result) {
		this.truss.addTensor(result.rightTensor);
		this.truss.addTensor(result.leftTensor);
		this.truss.ghostifyTensor(result.originalTensor);
	}

	/**
	 * @param  {object} result
	 */
	detachFromTruss(result) {
		this.truss.removeTensor(result.rightTensor);
		this.truss.removeTensor(result.leftTensor);
		this.truss.deghostifyTensor(result.originalTensor);
	}

	/**
	 * @param  {object} result
	 */
	attachToTruss(result) {
		this.truss.addTensor(result.rightTensor);
		this.truss.addTensor(result.leftTensor);
		this.truss.ghostifyTensor(result.originalTensor);
	}
	/**
	 * @param  {Truss} truss
	 * @param  {Tensor} tensor
	 * @param  {float} distanceFraction=0.5
	 * @param  {float} dir=-1
	 */
	attachToTensor(truss, tensor, distanceFraction = 0.5, dir = -1) {
		this.truss = truss;
		let result = {};
		let rightNode = tensor.getRightNode();
		let leftNode = tensor.getOppositeNode(rightNode);
		if (tensor.node2 == leftNode) {
			distanceFraction = 1 - distanceFraction;
		}
		result.rightTensor = new PullSpring(this.iO, rightNode, tensor.constant, tensor.equilibriumLength * (1 - distanceFraction));
		result.leftTensor = new PullSpring(leftNode, this.iO, tensor.constant, tensor.equilibriumLength * (distanceFraction));
		result.originalTensor = tensor;
		result.direction = dir;
		this.currentTensors.push(result);
		this.attachToTruss(result);
	}

	/**
	 * @param  {float} time
	 */
	updatePosition(time) {
		super.updatePosition(time); // Call parent in order to update this.iO nodes position
		let cleanupList = [];
		//* **************************************************************
		this.rightMovementTensor.constant = 0;
		this.leftMovementTensor.constant = 0;
		for (let i = 0; i < this.currentTensors.length; i++) {
			if (this.getState() == 1) {
				this.rightMovementTensor.constant = this.speed;
			} else if (this.getState() == 2) {
				this.leftMovementTensor.constant = this.speed;
			}
			let TensorMap = this.currentTensors[i];
			TensorMap.rightTensor.equilibriumLength =
				(TensorMap.originalTensor.equilibriumLength +
					TensorMap.rightTensor.getLength() -
					TensorMap.leftTensor.getLength()) / 2;
			// calculate left equilibriumLength
			TensorMap.leftTensor.equilibriumLength =
				TensorMap.originalTensor.equilibriumLength -
				TensorMap.rightTensor.equilibriumLength;
			let p1 = TensorMap.originalTensor.node1.getPosition();
			let p2 = TensorMap.originalTensor.node2.getPosition();
			let p3 = this.iO.getPosition();
			//			Rewrite this for handling more than one ball...
			//			it should not be originaltensor but left right tensor.
			// compare left and right angle and with respect to direction.
			let perpendicularDistance = getS(p1, p2, p3);
			let above = (perpendicularDistance * TensorMap.direction > 0);
			let inside = getTInside(p1, p2, p3);
			let closeParallell = (Math.abs(perpendicularDistance) < 0.2);
			if (above && inside) {
				console.log('Bounce disconnected from ' + TensorMap.originalTensor.getName());
				this.disconnect(TensorMap);
				cleanupList.push(TensorMap);
				TensorMap.originalTensor.resetCollision(this.iO);
			} else if (closeParallell && !inside) {
				console.log('Endpoint disconnected from ' + TensorMap.originalTensor.getName());
				this.disconnect(TensorMap);
				cleanupList.push(TensorMap);
				TensorMap.originalTensor.resetCollision(this.iO);
				// add 0.5 m above the exit node to represent that you can actually lift your knees when exiting a spring
				this.iO.getPosition().add(normalizeVector(0.2, // 2 dm
					multiplyVector(TensorMap.direction, // wrt to the collision direction
						perpendicular(TensorMap.originalTensor.getActual()) // above
					)));
			}
		}
		for (let j = 0; j < cleanupList.length; j++) {
			removeIfPresent(cleanupList[j], this.currentTensors);
		}
	}
	/**
	 * @param  {Array} TensorMap
	 */
	disconnect(TensorMap) {
		this.detachFromTruss(TensorMap);
	}

	/**
	 * @param  {Node} zeroNode
	 * @param  {float} direction
	 */
	exit(zeroNode, direction) {
		let newTensor = zeroNode.findTopSpring(direction, [this.iO.currentTensor, this.iO.mySpring]);
		this.iO.disconnect();
		if (!newTensor) {
			return;
		}
		// Attach to new tensor
		if (direction > 0) {
			this.iO.attachToTensor(newTensor, 0.02);
		} else {
			this.iO.attachToTensor(newTensor, 0.98);
		}
	}
}
