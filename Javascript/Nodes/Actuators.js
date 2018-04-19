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
	 * @param {Truss} truss - The truss that contains the node
	 * @param {Node} obj - The node that this node should influence, often the protagonist node
	 * @param {Position} startPosition - The startposition of the node.
	 * @param {number} mass - The mass of the actuator node.
	 * @param  {string} name - The name of the node.
	 * @param {function} positionFunction - A javascript function that, if present, governs the position of this node.
	 * @param {function} showFunction - A function that, if present, governs how the actuator node is drawn on screen.
	 * @param {number} velocityLoss - A value between 0 and 1 that represent the amount of energy that is lost by moving the node.
	 */
	constructor(truss, obj, startPosition, mass = 0.001, name = 'actuatornode', positionFunction, showFunction, velocityLoss = 0.99) {
		super(truss, startPosition, mass, name, positionFunction,
			showFunction, velocityLoss);
		this.iO = obj; // the influenced object
	}

	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		let representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname='ActuatorNode';
		representationObject.iO = nodeList.indexOf(this.iO);
		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {ActuatorNode}
	 */
	deserialize(restoreObject, nodeList, tensorList) {
		super.deserialize(restoreObject, nodeList, tensorList);
		this.iO = nodeList[restoreObject.iO];
		return this;
	}

	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 */
	deserializeFixLinks(nodeList, tensorList) {
		this.iO = nodeList[representationObject.iO];
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
	 * @param {Truss} truss - The truss that contains the node
	 * @param {Node} obj - The node that this node should influence, often the protagonist node
	 * @param {Position} position1 - The startposition of the node. Sets the state to 1;
	 * @param {Position} position2 - Sets the state to 2.
	 * @param {number} mass - The mass of the actuator node.
	 * @param {string} name - The name of the node.
	 * @param {function} positionFunction - A javascript function that, if present, governs the position of this node.
	 * @param {function} showFunction - A function that, if present, governs how the actuator node is drawn on screen.
	 * @param {number} velocityLoss - A value between 0 and 1 that represent the amount of energy that is lost by moving the node.
	 */
	constructor(truss, obj, position1, position2, mass = 0.001, name = 'binarynode', positionFunction, showFunction, velocityLoss = 0.99) {
		let startPos;
		if (position1) {
			startPos=new Position(position1.x, position1.y);
		} else {
			startPos= new Position(0, 0);
		}
		super(truss, obj, startPos, mass, name, positionFunction, showFunction, velocityLoss);
		this.position1 = position1;
		if (position2) {
			this.position2 = position2;
			this.vector = Vector.subtractVectors(this.position2, this.position1);
		}
	}

OK, this is a collection node with length 2

	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		let representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname='BinaryActuatorNode';
		representationObject.position1 = this.position1.serialize();
		representationObject.position2 = this.position2.serialize();
		return representationObject;
	}


	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {ActuatorNode}
	 */
	deserialize(restoreObject, nodeList, tensorList) {
		super.deserialize(restoreObject, nodeList, tensorList);
		this.position1 = new Position().deserialize(restoreObject.position1);
		this.position2 = new Position().deserialize(restoreObject.position2);
		this.vector = subtractVectors(this.position2, this.position1);
		return this;
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
		let tempAcceleration = super.getAcceleration(forceAppliers);
		let acceleration = Vector.multiplyVector(Vector.dotProduct(this.vector, tempAcceleration),
			Vector.divideVector(this.vector, Vector.length2(this.vector)));
		return acceleration;
	};

	/**
	 * This calculates the position like a normal Node, but then ensures that it lies on the line
	 * between position1 and position2.
	 * @param  {number} time
	 * @param {number} deltaTime
	 */
	updatePosition(time, deltaTime) {
		super.updatePosition(time, deltaTime);
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
class JumpNode extends BinaryActuatorNode {
	/**
	 * Create a JumpNode. If this nodes position is close to position 2, then
	 * the gravityField will be 4 times stronger
	 * @constructor
	 * @param {Truss} truss - The truss that contains the node
	 * @param  {Node} obj - The protagonist node that is influenced by this actuator
	 * @param  {Position} position1 Start position
	 * @param  {Position} position2 If this nodes position is close to position 2, then the gravityField will be 4 times stronger
	 * @param  {Field} gravityField The gravityfield that should be quadrupled
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {function} positionFunction
	 * @param  {function} showFunction
	 * @param  {number} velocityLoss
	 */
	constructor(truss, obj, position1, position2, gravityField, mass = 0.01, name = 'jumpnode',
		positionFunction, showFunction, velocityLoss) {
		super(truss, obj, position1, position2, mass, name, positionFunction, showFunction, velocityLoss);
		if (gravityField) {
			this.gravityField = gravityField;
			this.originalGravityConstant = gravityField.constant;
		}
	}

	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		let representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname='JumpNode';
		representationObject.gravityField = tensorList.indexOf(this.gravityField);
		representationObject.originalGravityConstant = this.originalGravityConstant;
		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {JumpNode}
	 */
	deserialize(restoreObject, nodeList, tensorList) {
		super.deserialize(restoreObject, nodeList, tensorList);
		this.originalGravityConstant = restoreObject.originalGravityConstant;
		this.gravityField = tensorList[restoreObject.gravityField];
		return this;
	}

	/**
	 * @param  {number} time
	 * @param {number} deltaTime
	 */
	updatePosition(time, deltaTime) {
		super.updatePosition(time, deltaTime); // Call parent in order to update this.iO nodes position

		if (this.getState() == 2) {
			this.gravityField.constant = this.originalGravityConstant * 4;
		} else {
			this.gravityField.constant = this.originalGravityConstant;
		}
	}
}


/**
 * A LeftRightNode is a special type of BinaryActuatorNode that represents a node that is used to
 * influence the behaviour of another node.
 *
 *
 * @class
 * @augments BinaryActuatorNode
 */
class LeftRightNode extends BinaryActuatorNode {
	/**
	 * @constructor
	 * @param {Truss} truss - The truss that contains the node
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
	constructor(truss, obj, position1, position2,
		rightMovementTensor, leftMovementTensor,
		mass = 0.01, name = 'leftrightnode', positionFunction,
		showFunction, velocityLoss = 0.99) {
		super(truss, obj, position1, position2, mass, name, positionFunction, showFunction, velocityLoss);
		// this.lineBreakers = [];
		// this.truss;
		this.moveFieldConstant = 6.67e-11;
		this.rightMovementTensor = rightMovementTensor;
		this.leftMovementTensor = leftMovementTensor;
	}

	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		let representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname='LeftRightNode';
		representationObject.moveFieldConstant = this.moveFieldConstant;
		representationObject.rightMovementTensor = tensorList.indexOf(this.rightMovementTensor);
		representationObject.leftMovementTensor = tensorList.indexOf(this.leftMovementTensor);
		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {LeftRightNode}
	 */
	deserialize(restoreObject, nodeList, tensorList) {
		super.deserialize(restoreObject, nodeList, tensorList);
		this.moveFieldConstant = restoreObject.moveFieldConstant;
		this.rightMovementTensor = tensorList[restoreObject.rightMovementTensor];
		this.leftMovementTensor = tensorList[restoreObject.leftMovementTensor];
		return this;
	}

	/**
	 * @param  {number} time
	 * @param {number} deltaTime
	 */
	updatePosition(time, deltaTime) {
		super.updatePosition(time, deltaTime); // Call parent in order to update this.iO nodes position
		this.handleLeftOrRight();
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
}


/**
 * A LineBreakerNode is a special type of ActuatorNode that
 * bounces on or dangles on Spring tensors
 * @class
 * @augments ActuatorNode
 */
class LineBreakerNode extends ActuatorNode {
	/**
	 * @constructor
	 * @param {Node} obj - The node that this node should influence, often the protagonist node
	 * @param {number} mass - The mass of the actuator node.
	 * @param {string} name - The name of the node.
	 * @param {function} positionFunction - A javascript function that, if present, governs the position of this node.
	 * @param {function} showFunction - A function that, if present, governs how the actuator node is drawn on screen.
	 * @param {number} velocityLoss -A value between 0 and 1 that represent the amount of energy that is lost by moving the node.
	 */
	constructor(obj, mass = 0.01, name = 'linebreakernode', positionFunction, showFunction, velocityLoss = 0.99) {
		super(obj, new Position(1, 1), mass, name, positionFunction, showFunction, velocityLoss);
	}


	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		let representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname='LineBreakerNode';

		return representationObject;
	}

	/** REMOVE THIS?
	 * @param  {object} linkBreakerRepresentation
	 */
	detachFromTruss(linkBreakerRepresentation) {
		this.truss.removeTensor(linkBreakerRepresentation.rightTensor);
		this.truss.removeTensor(linkBreakerRepresentation.leftTensor);
		this.truss.deghostifyTensor(linkBreakerRepresentation.brokenLink);
	}

	/**
	 * @param  {number} time
	 * @param {number} deltaTime
	 */
	sense() {
		// console.log('enter sense'+this.iO.breakList.length);
		if (this.iO && this.iO.breakList) {
			for (let brokenLink of this.iO.breakList) {
				this.recalcEquilibriumLengths(brokenLink.original);
			}
		}
		// console.log('leave sense:'+this.iO.breakList.length);
	}

	/**
	 * Calculate the sum of the length of all subtensors.
	 * Then calculate the multiplicator that would be needed in order to make the
	 * length equal to the equilibriumlengt of the original tensor.
	 * Then loop through all subtensors and set the new equilibriumlength to
	 * their current length times the multiplier.
	 * @param  {tensor} brokenLink
	 */
	recalcEquilibriumLengths(brokenLink) {
		let newLength=0;
		let segments=0;

		/** support function that loops over chains
		 * @param  {Tensor} brokenLink The parent Tensor
		 * @param  {Function} callback The callback to apply to all subtensors
		 */
		function loopOverChain(brokenLink, callback) {
			let currentTensor = brokenLink.breakStartTensor;
			callback(currentTensor);
			while (currentTensor != brokenLink.breakEndTensor) {
				currentTensor = currentTensor.next;
				// if (!currentTensor) return;
				callback(currentTensor);
			}
		}


		if (brokenLink.breakStartTensor && brokenLink.breakEndTensor) {
			loopOverChain(brokenLink,
				function(currentTensor) {
					newLength += currentTensor.getLength();
					segments++;
				});

			let multiplicator = brokenLink.equilibriumLength / newLength;
			let segmentstretch = (newLength-brokenLink.equilibriumLength)/segments;

			// console.log('enter loopOverChain');

			loopOverChain(brokenLink, function(currentTensor) {
				// currentTensor.equilibriumLength = currentTensor.getLength() * multiplicator;
				currentTensor.equilibriumLength = currentTensor.getLength() - segmentstretch;
				currentTensor.calculateForce();
			});
			// console.log('leave loopOverChain');
		}
	}

	/** This function takes a tensor in a truss and creates a linkBreakerRepresentation that both contain the original
	 * broken link as well as the left and right original replacement. Remember that these links in turn can be broken
	 * by other nodes, so we need to keep track of the immediatelyLeft and immediatelyRight to know the part of the link that is
	 * currently closest to the node. The linkBreakerRepresentation is added to a list in the influenced object (the iO)
	 * since a given node may break several Tensors and each has to be handled separately.
	 * @param  {Truss} truss
	 * @param  {Tensor} tensor
	 * @param  {number} distanceFraction
	 * @param  {number} dir
	 */
	attachToTensor(truss, tensor, distanceFraction = 0.5, dir = -1) {
		let startNode = tensor.node1;
		let endNode = tensor.node2;

		if (!this.iO.breakList) {
			this.iO.breakList= [];
		}

		if (!tensor.originalParent) {
			tensor.originalParent = tensor;
		}

		let startNewLink = this.createChildTensor(
			truss,
			startNode, this.iO,
			tensor.constant,
			tensor.equilibriumLength * distanceFraction,
			tensor.originalParent);


		let endNewLink = this.createChildTensor(
			truss,
			this.iO, endNode,
			tensor.constant,
			tensor.equilibriumLength * (1 - distanceFraction),
			tensor.originalParent);

		this.setupNextAndPrevious(tensor, startNewLink, endNewLink);

		if (tensor.originalParent == tensor) { // The first time a Tensor is broken
			this.handleFirstBreak(tensor, startNewLink, endNewLink);
		} else { // Several breaks at the same time
			if (tensor.originalParent.node1 == startNewLink.node1) {
				tensor.originalParent.breakStartTensor = startNewLink;
			}
			if (tensor.originalParent.node2 == endNewLink.node2) {
				tensor.originalParent.breakEndTensor = endNewLink;
			}
			truss.removeTensor(tensor);
		}

		let breaker = this.getBreak(startNode, tensor.originalParent);
		if (breaker && breaker.immediatelyRight) {
			breaker.immediatelyRight=startNewLink;
		}

		breaker = this.getBreak(endNode, tensor.originalParent);
		if (breaker && breaker.immediatelyLeft) {
			breaker.immediatelyLeft=endNewLink;
		}

		let outerLayer = this.iO.breakList.length == 0;

		console.log('Attach to tensor: '+tensor.getName());


		this.iO.breakList.push(
			{
				'original': tensor.originalParent,
				'immediatelyLeft': startNewLink,
				'immediatelyRight': endNewLink,
				'direction': dir,
				'outerLayer': outerLayer,
			});
	}

	/** Handle the first time a tensor is broken by a node
	 * @param  {Tensor} tensor
	 * @param  {Tensor} startNewLink
	 * @param  {Tensor} endNewLink
	 */
	handleFirstBreak(tensor, startNewLink, endNewLink) {
		tensor.ghostify();
		let t = this;
		// tensor.callback = function(c) {
		//	t.recalcEquilibriumLengths(c);
		// };
		tensor.breakStartTensor = startNewLink;
		tensor.breakEndTensor = endNewLink;
	}

	/** This is a support function that sets up the next and previous links on the surrounding tensors
	 * @param  {Tensor} originalTensor
	 * @param  {Tensor} startNewLink
	 * @param  {Tensor} endNewLink
	 */
	setupNextAndPrevious(originalTensor, startNewLink, endNewLink) {
		if (originalTensor.previous) {
			originalTensor.previous.next = startNewLink;
			startNewLink.previous = originalTensor.previous;
		}
		startNewLink.next = endNewLink;
		endNewLink.previous = startNewLink;
		if (originalTensor.next) {
			endNewLink.next = originalTensor.next;
			originalTensor.next.previous = endNewLink;
		}
	}

	/**
	 * @param  {Node} startNode
	 * @param  {Tensor} originalParent
	 * @return {breaker}
	 */
	getBreak(startNode, originalParent) {
		if (startNode.breakList) {
			for (let breaker of startNode.breakList) {
				if (breaker.original==originalParent) {
					return breaker;
				}
			}
		}
	}

	/** This function takes care of patching a broken link when the breaking node leaves it
	 * at either end
	 * @param  {Truss} truss
	 * @param  {Object} lineBreaker
	 * @param  {Node} connectionNode
	 * @param  {Tensor} newTensor
	 * @param  {Position} positionAlongNextTensor
	 */
	endExit(truss, lineBreaker, connectionNode, newTensor, positionAlongNextTensor) {
		this.removeFromTensor(truss, lineBreaker, 'Endpoint disconnected from ' + lineBreaker.original.getName());
		if (newTensor && lineBreaker.outerLayer) {
			let distanceFraction=0.99;
			let dir = 0;
			if (connectionNode==newTensor.node1) {
				distanceFraction = 0.01;
			}
			if (lineBreaker.original.node1==newTensor.node2 || lineBreaker.original.node2==newTensor.node1) {
				dir = lineBreaker.direction;
			} else {
				dir = -lineBreaker.direction;
			}

			this.iO.setPosition(positionAlongNextTensor);

			this.attachToTensor(truss, newTensor, distanceFraction, dir);
		}
		this.clearAllInternalLinebreaks(truss, connectionNode);
		this.clearCollisionmappingForThisNode(connectionNode);
	}

	/**
	 * @param  {Node} connectionNode
	 */
	clearCollisionmappingForThisNode(connectionNode) {
		for (let tensor of connectionNode.positionBasedTensors) {
			if (tensor.tensorType == TensorType.SPRING && !tensor.isGhost()) {
				tensor.collideDistanceMapping[this.iO.name] = 0;
			}
		}
	}

	/** When the outermost linebreaker has passed an endpoint, make sure that no old (internal) linebreakers to that same node remain
	 * @param  {Truss} truss
	 * @param  {Node} node
	 */
	clearAllInternalLinebreaks(truss, node) {
		for (let i = this.iO.breakList.length-1; i>=0; i--) {
			let lineBreak = this.iO.breakList[i];
			console.log('checking:'+lineBreak.original.getName());
			if (lineBreak.immediatelyLeft.node1==node || lineBreak.immediatelyRight.node2==node) {
				this.removeFromTensor(truss, lineBreak, 'Inner disconnected from ' + lineBreak.original.getName());
			}
		}
	}

	/** This function takes care of patching a broken link when the breaking node leaves it
	 * at either end
	 * @param  {Truss} truss
	 * @param  {Object} lineBreaker
	 */
	bounceExit(truss, lineBreaker) {
		this.removeFromTensor(truss, lineBreaker, 'Bounce disconnected from ' + lineBreaker.original.getName());
	}

	/** This function takes care of patching a broken link when the breaking node leaves it
	 * @param  {Truss} truss
	 * @param  {object} lineBreaker
	 * @param  {string} logMessage A mesage to display in the log for debug purposes
	 */
	removeFromTensor(truss, lineBreaker, logMessage) {
		let startLink = lineBreaker.immediatelyLeft;
		let endLink = lineBreaker.immediatelyRight;
		let startNode = startLink.node1;
		let endNode = endLink.node2;
		let parent = startLink.originalParent;

		if (parent.breakStartTensor == startLink && parent.breakEndTensor == endLink) {
			// Just one break that goes away
			parent.deGhostify();
			parent.resetCollision(this.iO);
			parent.callback=undefined;
		} else {
			let newLink = this.createChildTensor(
				truss,
				startNode, endNode,
				parent.constant,
				startLink.equilibriumLength + endLink.equilibriumLength,
				parent);

			if (parent.breakStartTensor == startLink) {
				parent.breakStartTensor = newLink;
			} else if (parent.breakEndTensor == endLink) {
				parent.breakEndTensor = newLink;
			}

			if (startLink.previous) {
				startLink.previous.next=newLink;
			}
			if (endLink.next) {
				endLink.next.previous=newLink;
			}
			newLink.previous=startLink.previous;
			newLink.next=endLink.next;

			let breaker = this.getBreak(startNode, parent);
			if (breaker && breaker.immediatelyRight) {
				breaker.immediatelyRight=newLink;
			}

			breaker = this.getBreak(endNode, parent);
			if (breaker && breaker.immediatelyLeft) {
				breaker.immediatelyLeft=newLink;
			}
		}
		truss.removeTensor(startLink);
		truss.removeTensor(endLink);

		if (this.iO && this.iO.breakList) {
			removeIfPresent(lineBreaker, this.iO.breakList);
		}
		console.log(logMessage);
	}

	/**
	 * Creates a new child PullSpring and adds it to the truss
	 * @param  {Truss} truss
	 * @param  {Node} leftNode
	 * @param  {Node} rightNode
	 * @param  {number} constant
	 * @param  {number} equilibriumLength
	 * @param  {tensor} parent
	 * @return {PullSpring} The new Pullspring connecting the two nodes
	 */
	createChildTensor(truss, leftNode, rightNode, constant, equilibriumLength, parent) {
		let pullSpring = new PullSpring(leftNode, rightNode, constant, equilibriumLength);
		pullSpring.originalParent = parent;
		return truss.addTensor(pullSpring);
	}
}
