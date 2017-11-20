class ActuatorNode extends Node {
	constructor(obj, startPosition, mass = 0.001, name = "actuatornode", positionFunction, showFunction, velocityLoss = 0.99) {
		super(startPosition, mass, name, positionFunction, showFunction, velocityLoss);
		this.iO = obj; // the influenced object
	}
}

class BinaryActuatorNode extends ActuatorNode {
	constructor(obj, position1, position2, mass = 0.001, name = "binarynode", positionFunction, showFunction, velocityLoss = 0.99) {
		super(obj, new Position(position1.x, position1.y), mass, name, positionFunction, showFunction, velocityLoss);
		this.position1 = position1;
		this.position2 = position2;
		this.vector = subtractVectors(position2, position1);
	}
	getState() {
		if (boxClose(this.getPosition(), this.position1, 0.01))
			return 1;
		else if (boxClose(this.getPosition(), this.position2, 0.01))
			return 2;
		else
			return 0;
	};
	getAcceleration(forceAppliers) {
		var tempAcceleration = Node.prototype.getAcceleration.call(this, forceAppliers); //Call parent in order to update this nodes normal acceleration
		var acceleration = multiplyVector(dotProduct(this.vector, tempAcceleration), divideVector(this.vector, length2(this.vector)));
		return acceleration;
	};

	updatePosition(time) {
		super.updatePosition(time);
		var fractionPosition = getT(this.position1, this.position2, this.getPosition());
		if (fractionPosition < 0) {
			this.setPosition(new Position(this.position1.x, this.position1.y));
			this.velocity = new Velocity(0, 0);
		} else if (fractionPosition > 1) {
			this.setPosition(new Position(this.position2.x, this.position2.y));
			this.velocity = new Velocity(0, 0);
		}
	};

}



class JumpNode extends ActuatorNode {
	constructor(obj, position1, position2, gravityField, mass = 0.01, name = "jumpnode", positionFunction, showFunction, velocityLoss) {
		super(obj, position1, position2, mass, name, positionFunction, showFunction, velocityLoss);
		this.gravityField = gravityField;
		this.originalGravityConstant = gravityField.constant;
	}


	updatePosition(time) {
		//super.updatePosition(time); //Call parent in order to update this.iO nodes position

		if (this.getState() == 1) {
			this.gravityField.constant = this.originalGravityConstant;
		} else if (this.getState() == 2) {
			this.gravityField.constant = this.originalGravityConstant * 4;
		}
	}
}

class SpringDanglerNode extends BinaryActuatorNode {
	constructor(obj, position1, position2, rightMovementTensor, leftMovementTensor, mass = 0.01, name = "springrunnernode", positionFunction, showFunction, velocityLoss = 0.99) {
		super(obj, position1, position2, mass, name, positionFunction, showFunction, velocityLoss);
		this.currentTensors = [];
		this.truss;
		this.speed = 6.67e-11;
		this.rightMovementTensor = rightMovementTensor;
		this.leftMovementTensor = leftMovementTensor;
	}

	attachToTruss(result) {
		this.truss.addTensor(result.rightTensor);
		this.truss.addTensor(result.leftTensor);
		this.truss.ghostifyTensor(result.originalTensor);
	}
	detachFromTruss(result) {
		this.truss.removeTensor(result.rightTensor);
		this.truss.removeTensor(result.leftTensor);
		this.truss.deghostifyTensor(result.originalTensor);
	}
	attachToTruss(result) {
		this.truss.addTensor(result.rightTensor);
		this.truss.addTensor(result.leftTensor);
		this.truss.ghostifyTensor(result.originalTensor);
	}
	attachToTensor(truss, tensor, distanceFraction = 0.5, dir = -1) {
		this.truss = truss;
		var result = {};
		var rightNode = tensor.getRightNode();
		var leftNode = tensor.getOppositeNode(rightNode);
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

	updatePosition(time) {
		super.updatePosition(time); //Call parent in order to update this.iO nodes position
		var shorten;
		var lengthen;
		var direction;
		var cleanupList = [];
		//***************************************************************
		this.rightMovementTensor.constant = 0;
		this.leftMovementTensor.constant = 0;
		for (var i = 0; i < this.currentTensors.length; i++) {
			if (this.getState() == 1) {
				this.rightMovementTensor.constant = this.speed;
			} else if (this.getState() == 2) {
				this.leftMovementTensor.constant = this.speed;
			}
			var TensorMap = this.currentTensors[i];
			TensorMap.rightTensor.equilibriumLength =
				(TensorMap.originalTensor.equilibriumLength +
					TensorMap.rightTensor.getLength() -
					TensorMap.leftTensor.getLength()) / 2;
			// calculate left equilibriumLength	
			TensorMap.leftTensor.equilibriumLength =
				TensorMap.originalTensor.equilibriumLength -
				TensorMap.rightTensor.equilibriumLength;
			var p1 = TensorMap.originalTensor.node1.getPosition();
			var p2 = TensorMap.originalTensor.node2.getPosition();
			var p3 = this.iO.getPosition();
			//			Rewrite this for handling more than one ball...
			//			it should not be originaltensor but left right tensor.
			//compare left and right angle and with respect to direction.
			var perpendicularDistance = getS(p1, p2, p3);
			var above = (perpendicularDistance * TensorMap.direction > 0);
			var inside = getTInside(p1, p2, p3);
			var closeParallell = (Math.abs(perpendicularDistance) < 0.2);
			if (above && inside) {
				console.log("Bounce disconnected from " + TensorMap.originalTensor.getName());
				this.disconnect(TensorMap);
				cleanupList.push(TensorMap);
				TensorMap.originalTensor.resetCollision(this.iO);
			} else if (closeParallell && !inside) {
				console.log("Endpoint disconnected from " + TensorMap.originalTensor.getName());
				this.disconnect(TensorMap);
				cleanupList.push(TensorMap);
				TensorMap.originalTensor.resetCollision(this.iO);
				// add 0.5 m above the exit node to represent that you can actually lift your knees when exiting a spring
				this.iO.getPosition().add(normalizeVector(0.2, //2 dm 
					multiplyVector(TensorMap.direction, //wrt to the collision direction
						perpendicular(TensorMap.originalTensor.getActual()) //above
					)));
			}
		}
		for (var j = 0; j < cleanupList.length; j++) {
			removeIfPresent(cleanupList[j], this.currentTensors);
		}
	}

	disconnect(TensorMap) {
		this.detachFromTruss(TensorMap);
	}

	exit(zeroNode, direction) {
		var newTensor = zeroNode.findTopSpring(direction, [this.iO.currentTensor, this.iO.mySpring]);
		this.iO.disconnect();
		if (!newTensor)
			return;
		// Attach to new tensor
		if (direction > 0)
			this.iO.attachToTensor(newTensor, 0.02);
		else
			this.iO.attachToTensor(newTensor, 0.98);
	}

}
