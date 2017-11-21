/**
 * An ActuatorNode represents a node that is used to influence the behaviour of another node.
 * The position of this node applies a force or sets a velocity of the obj node.
 * @class
 * @augments Node
 */
class ActuatorNode extends Node {
	/**
	 * An ActuatorNode represents a node that is used to influence the behaviour of another node.
	 * The position of this node applies a force or sets a velocity of the obj node.
	 * @constructor
	 * @param {Node} obj - The node that this node should influence, often the protagonist node
	 * @param {Position} startPosition - The startposition of the node.
	 * @param {number} mass - The mass of the actuator node.
	 * @param  {string} name - The name of the node.
	 * @param {function} positionFunction - A javascript function that, if present, governs the position of this node.
	 * @param {function} showFunction - A function that, if present, governs how the actuator node is drawn on screen.
	 * @param {number} velocityLoss - A value between 0 and 1 that represent the amount of energy that is lost by moving the node.
	 */
	constructor(obj, startPosition, mass = 0.001, name = 'actuatornode',
		positionFunction, showFunction, velocityLoss = 0.99) {
		super(startPosition, mass, name, positionFunction,
			showFunction, velocityLoss);
		this.iO = obj; // the influenced object
	}
}


/**
 * A BinaryActuatorNode represents a node that is used to influence the behaviour of another node.
 * if this node is close to position1, the getState() will return 1. If it is close to position2, getState will return 2.
 * Otherwise getState() returns 0;
 * @class
 * @augments ActuatorNode
  */
class BinaryActuatorNode extends ActuatorNode {
/**
 * A BinaryActuatorNode represents a node that is used to influence the behaviour of another node.
 * if this node is close to position1, the getState() will return 1. If it is close to position2, getState will return 2.
 * Otherwise getState() returns 0;
 * @constructor
 * @param {Node} obj - The node that this node should influence, often the protagonist node
 * @param {Position} position1 - The startposition of the node. Sets the state to 1;
 * @param {Position} position2 - Sets the state to 2.
 * @param {number} mass - The mass of the actuator node.
 * @param {string} name - The name of the node.
 * @param {function} positionFunction - A javascript function that, if present, governs the position of this node.
 * @param {function} showFunction - A function that, if present, governs how the actuator node is drawn on screen.
 * @param {number} velocityLoss - A value between 0 and 1 that represent the amount of energy that is lost by moving the node.
 */
	constructor(obj, position1, position2, mass = 0.001, name = 'binarynode', positionFunction, showFunction, velocityLoss = 0.99) {
		super(obj, new Position(position1.x, position1.y), mass, name, positionFunction, showFunction, velocityLoss);
		this.position1 = position1;
		this.position2 = position2;
		this.vector = subtractVectors(position2, position1);
	}
	/**
	 * getState will return a 0, 1 or 2 depending if its position is close to position1 or position2
	 * @return {number} - 0, 1 or 2 depending on its position.
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
	 * Not sure why this is used. What separates this from the Node calculation
	 * TODO: check if necessary
	 * @param  {Array} forceAppliers
	 * @return {Vector}
	 */
	getAcceleration(forceAppliers) {
		// Call parent in order to update this nodes normal acceleration
		let tempAcceleration = Node.prototype.getAcceleration.call(this, forceAppliers);
		let acceleration = multiplyVector(dotProduct(this.vector, tempAcceleration), divideVector(this.vector, length2(this.vector)));
		return acceleration;
	};

	/**
	 * This calculates the position like a normal Node, but then ensures that it lies on the line
	 * between position1 and position2.
	 * @param  {number} time
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
 * @class
 * @augments ActuatorNode
 */
class JumpNode extends ActuatorNode {
	/**
	 * Create a JumpNode
	 * @constructor
	 * @param  {Node} obj - text.
	 * @param  {Position} position1 - text2.
	 * @param  {Position} position2 - text2.
	 * @param  {Field} gravityField - text2.
	 * @param  {number} mass=0.001
	 * @param  {string} name='actuatornode'
	 * @param  {function} positionFunction
	 * @param  {function} showFunction
	 * @param  {number} velocityLoss=0.99
	 */
	constructor(obj, position1, position2, gravityField, mass = 0.01, name = 'jumpnode', positionFunction, showFunction, velocityLoss) {
		super(obj, position1, position2, mass, name, positionFunction, showFunction, velocityLoss);
		this.gravityField = gravityField;
		this.originalGravityConstant = gravityField.constant;
	}


	/**
	 * @param  {flnumberoat} time
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
 * A SpringDanglerNode is a special type of BinaryActuatorNode that represents a node that is used to
 * influence the behaviour of another node.
 * if this node is close to position1, the getState() will return 1. If it is close to position2, getState will return 2.
 * Otherwise getState() returns 0;
 * @class
 * @augments BinaryActuatorNode
 */
class SpringDanglerNode extends BinaryActuatorNode {
	/**
 * @constructor
 * @param {Node} obj - The node that this node should influence, often the protagonist node
 * @param {Position} position1 - The startposition of the node. Sets the state to 1;
 * @param {Position} position2 - Sets the state to 2.
	 * @param  {Tensor} rightMovementTensor
	 * @param  {Tensor} leftMovementTensor
 * @param {number} mass - The mass of the actuator node.
 * @param {string} name - The name of the node.
 * @param {function} positionFunction - A javascript function that, if present, governs the position of this node.
 * @param {function} showFunction - A function that, if present, governs how the actuator node is drawn on screen.
 * @param {number} velocityLoss -A value between 0 and 1 that represent the amount of energy that is lost by moving the node.
 */
	constructor(obj, position1, position2,
		rightMovementTensor, leftMovementTensor,
		mass = 0.01, name = 'springrunnernode', positionFunction,
		showFunction, velocityLoss = 0.99) {
		super(obj, position1, position2, mass, name, positionFunction, showFunction, velocityLoss);
		this.currentTensors = [];
		this.truss;
		this.moveFieldConstant = 6.67e-11;
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
	 * @param  {Truss} truss
	 * @param  {Tensor} tensor
	 * @param  {number} distanceFraction=0.5
	 * @param  {number} dir=-1
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
	 * @param  {number} time
	 */
	updatePosition(time) {
		super.updatePosition(time); // Call parent in order to update this.iO nodes position
		//* **************************************************************
		this.handleLeftOrRight();

		let cleanupList = [];

		for (let i = 0; i < this.currentTensors.length; i++) {
			let TensorMap = this.currentTensors[i];
			TensorMap.rightTensor.equilibriumLength =
				(TensorMap.originalTensor.equilibriumLength +
					TensorMap.rightTensor.getLength() -
					TensorMap.leftTensor.getLength()) / 2;
			// calculate left equilibriumLength
			TensorMap.leftTensor.equilibriumLength =
				TensorMap.originalTensor.equilibriumLength -
				TensorMap.rightTensor.equilibriumLength;
			//			Rewrite this for handling more than one ball...
			//			it should not be originaltensor but left right tensor.
			// compare left and right angle and with respect to direction.
			this.leavingConnectedTensor(TensorMap, cleanupList);
		}
		for (let j = 0; j < cleanupList.length; j++) {
			removeIfPresent(cleanupList[j], this.currentTensors);
		}
	}
	/**
	 * If the position of the controlled object bounces or leaves on the right or
	 * left side, disconnect it and restore the tensor to its original.
	 * @param  {object} TensorMap this argument contains thel left, right and original tensor
	 * @param  {Array} cleanupList a list of things to remove after all is done
	 */
	leavingConnectedTensor(TensorMap, cleanupList) {
		let p1 = TensorMap.originalTensor.node1.getPosition();
		let p2 = TensorMap.originalTensor.node2.getPosition();
		let p3 = this.iO.getPosition();
		let perpendicularDistance = getS(p1, p2, p3);
		let above = (perpendicularDistance * TensorMap.direction > 0);
		let inside = getTInside(p1, p2, p3);
		let closeParallell = (Math.abs(perpendicularDistance) < 0.2);

		if (above && inside) {
			this.removeFromTensor(TensorMap, cleanupList, 'Bounce disconnected from ' + TensorMap.originalTensor.getName());
		} else if (closeParallell && !inside) {
			this.removeFromTensor(TensorMap, cleanupList, 'Endpoint disconnected from ' + TensorMap.originalTensor.getName());
			// add 0.5 m above the exit node to represent that you can actually lift your knees when exiting a spring
			this.iO.getPosition().add(normalizeVector(0.2, // 2 dm
				multiplyVector(TensorMap.direction, // wrt to the collision direction
					perpendicular(TensorMap.originalTensor.getActual()))));
		}
	}
	/**
	 * @param  {object} TensorMap this argument contains thel left, right and original tensor
	 * @param  {Array} cleanupList a list of things to remove after all is done
	 * @param  {string} logMessage A mesage to display in the log for debug purposes
	 */
	removeFromTensor(TensorMap, cleanupList, logMessage) {
		console.log(logMessage);
		this.disconnect(TensorMap);
		cleanupList.push(TensorMap);
		TensorMap.originalTensor.resetCollision(this.iO);
	}

	/**
	 * Applies a force to the right or to the left depending on the keypress state
	 */
	handleLeftOrRight() {
		this.rightMovementTensor.constant = 0;
		this.leftMovementTensor.constant = 0;
		if (this.getState() == 1) {
			this.rightMovementTensor.constant = this.moveFieldConstant;
		} else if (this.getState() == 2) {
			this.leftMovementTensor.constant = this.moveFieldConstant;
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
	 * @param  {number} direction
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
