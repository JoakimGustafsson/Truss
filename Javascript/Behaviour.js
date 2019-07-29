/*jshint esversion:6 */
/* global control Tensor smallnodezoom debugEntity*/

let BehaviourOverride = {
	SHOW: 1,
	UPDATEPOSITION: 2,
	CALCULATE: 3,
	POSTCALCULATE: 4,
	TORQUE: 5,
	SENSE: 6,
	COLLIDE: 7,
	PREUPDATEPOSITION: 8,
	POSTUPDATEPOSITION: 9,
	ROTATE: 10,
};

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
	 */
	updatePosition() {
		let p = this.restPosition;
		for (let i = 0; i < this.keyVectors.length; i++) {
			if (this.keyState[this.keyVectors[i].key]) {
				p = Vector.addVectors(p, this.keyVectors[i].vector);
			}
		}
		this.setPosition(p);
	}
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
	}
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
	}

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
	 * @return {number}
	 */
	calculate() {
		let actualVector = this.getActual();
		let normalized = actualVector.normalizeVector(this.equilibriumLength);
		let diffVector = Vector.subtractVectors(actualVector, normalized);
		if (isNaN(diffVector.x)) {
			console.log('ERROR: Illegal Spring Force: '+this.name);
		}
		return Vector.multiplyVector(-this.constant, diffVector);
	}
}

/** This calculates force as if it was a linear spring that bends when short
 * @class
 * @extends Node
 */

/*eslint no-class-assign: 2*/
/*eslint-env es6*/
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
	 * @return {number}
	 */
	calculate() {
		let actualVector = this.getActual();
		if ((this.equilibriumLength > 0) && (Vector.length2(actualVector) < this.equilibriumLength * this.equilibriumLength)) {
			return;
		} else {
			let actualVector = this.getActual();
			let normalized = actualVector.normalizeVector(this.equilibriumLength);
			let diffVector = Vector.subtractVectors(actualVector, normalized);
			if (isNaN(diffVector.x)) {
				console.log('ERROR: Illegal Spring Force: '+this.name);
			}
			return Vector.multiplyVector(-this.constant, diffVector);
		}
	}
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
	 * @return {number}
	 */
	calculate() {
		let actualVector = this.getActual();
		if ((this.equilibriumLength > 0) && (Vector.length2(actualVector) > this.equilibriumLength * this.equilibriumLength)) {
			return;
		} else {
			let actualVector = this.getActual();
			let normalized = actualVector.normalizeVector(this.equilibriumLength);
			let diffVector = Vector.subtractVectors(actualVector, normalized);
			return Vector.multiplyVector(-this.constant, diffVector);
		}
	}

}

/** This calculates force as if it was a linear spring that only pushes
 * @class
 * @extends Node
 */
class ImpulseCalculator extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.CALCULATE, ImpulseCalculator.prototype.calculate);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.CALCULATE, ImpulseCalculator.prototype.calculate);
	}

	/**
	 * Calculate impulse force when the distance between two nodes is less than their size1/2+size2/2
	 * @return {number}
	 */
	calculate() {
		let snugDistance = this.node1.size+this.node2.size;
		let actualVector = this.getActual();
		let actualVectorLength = Vector.length(actualVector);
		if (snugDistance < actualVectorLength) {
			return;
		} else {
			let elasticModulus1 = this.node1.elasticModulus || 1;
			let elasticModulus2 = this.node2.elasticModulus || 1;
			let elasticModulus = 1/(1/elasticModulus1+1/elasticModulus2);
			if (snugDistance==0) {
				return;
			}
			let normalized = actualVector.normalizeVector(snugDistance);
			let diffVector = Vector.subtractVectors(actualVector, normalized);
			
			if (isNaN(diffVector.x)) {
				console.log('ERROR: Illegal Spring Force: '+this.name);
			}
			debugEntity.breakAt(this.node1, undefined, undefined, 10);

			return Vector.multiplyVector(-elasticModulus, diffVector);
		}
	}
} 


//ok, we need to let each calculator generate its own force, return it and then add them together
//in for example the calculateForce function
//rewrite the caller function to have another verson that adds together the results

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
	 * @return {number}
	 */
	calculate() {
		let actualVector = this.getActual();
		let normalized = actualVector.normalizeVector(1);
		let forceSize = this.constant * this.node1.mass * this.node2.mass / this.getLengthSquare();
		return Vector.multiplyVector(-forceSize, normalized);
	}

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

	 * @return {number}
	 */
	calculate() {
		let actualVector = this.getActual();
		let internalSpeed = Vector.subtractVectors(this.node1.velocity, this.node2.velocity);
		let parallellVelocity = Vector.multiplyVector(
			Vector.dotProduct(actualVector, internalSpeed),
			Vector.divideVector(actualVector, this.getLengthSquare()));
		return Vector.multiplyVector(this.dampeningConstant, parallellVelocity);
	}

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
		let getTorque = function (node, tensor) {
			let idealAngle = tensor.angle2;
			let torqueConstant = tensor.torqueConstant2;
			if (node == tensor.node1) {
				idealAngle = tensor.angle1;
				torqueConstant = tensor.torqueConstant1;
			}
			if (!torqueConstant || Number.isNaN(idealAngle)) {
				return 0;
			}
			let tensorAngle = tensor.getTensorAngle(node);
			let theNodeShouldHaveAngle = tensorAngle - idealAngle;

			node.angle = anglify(node.angle);

			let correctionAngle = anglify(theNodeShouldHaveAngle - node.angle);

			let torque = torqueConstant * correctionAngle;
			if (node == tensor.node1) {
				tensor.torque1 = -torque;
			} else {
				tensor.torque2 = torque;
			}
			return torque;
		};

		this.sumTorque = 0;

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
			this.turnrate += parseFloat(this.sumTorque / (this.mass * 1000));
		} else {
			this.turnrate = 0; // weightless cannot turn
		}
		this.turnrate *= parseFloat(this.turnLoss);
		if (isNaN(this.turnrate)) {
			this.turnrate = 0;
		}
		if (isNaN(this.angle)) {
			this.angle = 0;
		}
		this.angle += parseFloat(this.turnrate);
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
			let forceLength = torque/tensor.getLength();
			let force = perp.normalizeVector(forceLength);
			return force.opposite();
		}

		let perp = this.getActual().perpendicular();
		// Force that the torque in node 1 applies to node 2
		let torqueForce1 = supportCalc(this, this.node1, this.torque1, perp);
		// Force that the torque in node 2 applies to node 1
		let torqueForce2 = supportCalc(this, this.node2, this.torque2, perp);

		this.torqueForce1 = Vector.subtractVectors(torqueForce1, torqueForce2);
		this.torqueForce2 = Vector.subtractVectors(torqueForce2, torqueForce1);
	}

}


/**
 * @class
 * @extends Behaviour
 */
class SelectorBehaviour extends Behaviour {
	/**
	 * This class detects when an object bounces of a tensor or leaves it at the end.
	 * @param {World} world
	 * @param {TrussNode} trussNode
	 * @param {string} initialLabels
	 * @param  {object} valueObject
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.lastPointedOn=undefined;
		storeableObject.wasPressed = false;
		storeableObject.cursorPosition = new Position(0, 0);

		storeableObject.registerOverride(BehaviourOverride.SENSE, SelectorBehaviour.prototype.sense);
		storeableObject.registerOverride(BehaviourOverride.UPDATEPOSITION, SelectorBehaviour.prototype.updatePosition);
		storeableObject.registerOverride(BehaviourOverride.SHOW, SelectorBehaviour.prototype.show);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.SENSE, SelectorBehaviour.prototype.sense);
		storeableObject.unregisterOverride(BehaviourOverride.UPDATEPOSITION, SelectorBehaviour.prototype.updatePosition);
		storeableObject.unregisterOverride(BehaviourOverride.SHOW, SelectorBehaviour.prototype.show);
	}


	/**
	 * If the position of the controlled object bounces or leaves on the right or
	 * left side, disconnect it and restore the tensor to its original.
	 * @param {number} deltaTime
	 * @param {Trussnode} trussNode
	 */
	sense(deltaTime, trussNode) {
		if (trussNode != universe.currentNode) {
			return;
		}
		this.cursorPosition = trussNode.view.worldPositionWithOffset(control.myX, control.myY);
		let closest = trussNode.getClosestObject(this.cursorPosition, 20 * trussNode.view.getDistanceMultiplier(), this);

		if (!control.mouseSet) {
			if (!closest) {
				if (this.lastPointedOn && this.lastPointedOn != universe.selectedObject) {
					this.lastPointedOn.setHighlight(0);
				}
				this.lastPointedOn = undefined;
			} else { // There is a closest object
				if (closest != universe.selectedObject && this.lastPointedOn != closest) {
					if (this.lastPointedOn && this.lastPointedOn != universe.selectedObject) {
						this.lastPointedOn.setHighlight(0);
					}
					closest.setHighlight(1);
					this.lastPointedOn = closest;
				}
			}
		} else if (!this.wasPressed && control.mouseSet) { // Mouse was just pressed
			if (universe.selectedObject != closest) {
				if (universe.selectedObject) {
					universe.selectedObject.setHighlight(0);
				}
				universe.select(closest,this.parentTrussNode.element);
			}
		} else if (control.mouseSet) { // Mouse is continually pressed
			if (universe.selectedObject && universe.selectedObject.isNode) {
				universe.selectedObject.resetVelocity();
				universe.selectedObject.copyPosition(this.cursorPosition);
			}
		}

		this.wasPressed = control.mouseSet;
	}

	/**
	 * Update the position based on velocity, then let
	 * the this.positionFunction (if present) tell where it should actually be
	 */
	updatePosition() {
		this.setPosition(this.cursorPosition);
		this.velocity = new Vector(0, 0);
	}

	/**
	 * Draw the circle representing the node
	 * @param {Trussnode} truss
	 */
	show(truss) {
		let view = truss.view;
		this.highLight(view.context);
		if (view.inside(this.getPosition())) {
			view.context.strokeStyle = 'Yellow';
			view.context.lineWidth = 1;
			view.context.beginPath();
			view.drawCircle(this.getPosition(), 0.1);
			view.drawLine(Vector.subtractVectors(this.getPosition(), new Position(0, 1)),
				Vector.addVectors(this.getPosition(), new Position(0, 1)));
			view.drawLine(Vector.subtractVectors(this.getPosition(), new Position(1, 0)),
				Vector.addVectors(this.getPosition(), new Position(1, 0)));
			view.context.stroke();
		}
	}
}



/**
 * @class
 * @extends Behaviour
 */
class CollisionSensor extends Behaviour {
	/**
	 */
	constructor() {
		super();
		/*let _this = this;
		document.addEventListener('collisionEvent',
			function(e) {
				_this.collisionFunction.call(_this, e);
			}, false); */
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.SENSE, CollisionSensor.prototype.sense);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.SENSE, CollisionSensor.prototype.sense);
	}

	/**
	 * Has the node collided with any Tensor.
	 * If so, that will casue a collisionEvent generated from the Tensors
	 * checkCollision() function.
	 * @param {number} deltaTime
	 * @param {Truss} truss
	 */
	sense(deltaTime, truss) {
		let label = this.collisionLabel_Label;
		let detail;
		for (let tensor of label.getTensors()) {
			if (!tensor.isGhost()) {
				detail = tensor.checkCollision(this, truss);
				if (detail) {
					tensor.collide(detail);
				}
			}
		}
	}

	
}

/** This assumes a CollisionSensor behaviour already has been added to the node and that
 * this CollisionSensor calls the collide() function. This behaviour is attached to tensors
 * @class
 * @extends Behaviour
 */
class BounceTensorManagent extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) { 
		storeableObject.registerOverride(BehaviourOverride.POSTUPDATEPOSITION, BounceTensorManagent.prototype.handleBrokenTensors);
		storeableObject.registerOverride(BehaviourOverride.PREUPDATEPOSITION, BounceTensorManagent.prototype.preUpdate);

	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.POSTUPDATEPOSITION, BounceTensorManagent.prototype.handleBrokenTensors);
		storeableObject.unregisterOverride(BehaviourOverride.PREUPDATEPOSITION, BounceTensorManagent.prototype.preUpdate);
	}

	preUpdate(){
		//let startNode=this.node1;
		//let endNode=this.node2;
		//alert(startNode.name+endNode.name);

		/* if */
	}
		
	/**
	 * If the angle between the tensors is more than 180 degrees, cut the node free.
	 * @return {number}
	 */
	handleBrokenTensors() {
		function loosen(originalTensor, thisTensor) {
			let node = thisTensor.node2;
			let from =  thisTensor.brokendata.from;

			let startangle = thisTensor.getTensorAngle(node);
			let endangle = thisTensor.brokendata.nextTensor.getTensorAngle(node);
			if (isNaN(startangle) || isNaN(endangle)) {
				return;
			}
			let angle=anglify(startangle-endangle); 
			// from is plus if comming from right
			let dir=angle*from;
			
			//debugEntity.breakAt(node, 'name', 'newball_2', 450);

			if (dir<0.000000000) {
				if (originalTensor.brokendata.startTensor == thisTensor &&
					thisTensor.brokendata.nextTensor.node2 == originalTensor.node2) // Last break
				{
					originalTensor.deGhostify();
					originalTensor.removeLabel(originalTensor.bounceTensorManagementLabel);
					originalTensor.broken=false;
					thisTensor.destroy();
					thisTensor.brokendata.nextTensor.destroy();
				} else {
					let nextTensor=thisTensor.brokendata.nextTensor;
					thisTensor.brokendata = nextTensor.brokendata;
					thisTensor.node2=nextTensor.node2;
					thisTensor.joinCollision(nextTensor);
					nextTensor.destroy();
					thisTensor.setSide(node, from);
				}
				
			}
		}

		let originalTensor = this;
		if (!originalTensor.brokendata) {
			return;
		}

		let startTensor = originalTensor.brokendata.startTensor;

		for (let i = startTensor ; i && i.brokendata && i.brokendata.nextTensor!=undefined ; i=i.brokendata.nextTensor) {
			loosen(originalTensor, i);
		}

		recalcStretch(originalTensor);
		
	}
}

function recalcStretch(originalTensor) {
	
	let startTensor = originalTensor.brokendata.startTensor;

	let counter=1;
	for (let i = startTensor ; i && i.brokendata ; i=i.brokendata.nextTensor) {
		i.name=originalTensor.name+' '+(counter++);
	}

	let totalStretchedLength = 0;
	let numberOfTensors=0;
	for (let i = startTensor ; i!=undefined ; i=i.brokendata.nextTensor) {
		totalStretchedLength+=i.getLength();
		numberOfTensors++;
	} 

	//let originalStretch = originalTensor.getLength()-originalTensor.equilibriumLength;

	let elongationPerTensor = (totalStretchedLength-originalTensor.equilibriumLength)/numberOfTensors;

	
	for (let i = startTensor ; i!=undefined ; i=i.brokendata.nextTensor) {
		i.equilibriumLength = i.getLength() - elongationPerTensor;
	} 
}


/** This assumes a CollisionSensor behaviour already has been added to the node and that
 * this CollisionSensor calls the collide() function. This behaviour is attached to tensors
 * @class
 * @extends Behaviour
 */
class CollisionBounce extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) { 
		storeableObject.registerOverride(BehaviourOverride.COLLIDE, CollisionBounce.prototype.collide);

	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.COLLIDE, CollisionBounce.prototype.collide);
	}

	/**
	 * @param {Object} details
	 */
	collide(detail) {
		let where = detail.where;
		let tensor = detail.tensor;
		let collider = detail.collider;

		let shortage = tensor.getLength()-tensor.equilibriumLength;

		//let impulseSpringLabel = universe.currentWorld.labels.findLabel('impulsespring');

		// Tensor 1
		let startTensor = tensor;
		let endTensor = tensor.clone();
		
		let original;
		if (!tensor.broken) { // The first break of a tensor
			tensor.broken=true;
			endTensor.broken=true;
			startTensor = tensor.clone();

			let bounceTensorManagementLabel = this.bounceTensorManagementLabel || this.world.labels.findLabel('bouncetensormanagement');
			if (!this.hasLabel(bounceTensorManagementLabel)) {
				tensor.addLabel(bounceTensorManagementLabel);
				tensor.bounceTensorManagementLabel=bounceTensorManagementLabel;
			}

			startTensor.broken=true;
			tensor.ghostify();
			tensor.brokendata = {
				'startTensor':startTensor,
				'parentTensor': tensor
			};
			original = tensor;
		} else { 
			original = tensor.brokendata.parentTensor;
			endTensor.broken=true;
		}

		endTensor.brokendata = tensor.brokendata;
		
		startTensor.brokendata = {
			'parentTensor':original,
			'nextTensor':endTensor,
			'from':detail.from
		};

		//startTensor.name='[start-'+startTensor.name+']';
		startTensor.node2=collider;
		if (tensor.equilibriumLength!=undefined) {
			startTensor.equilibriumLength=tensor.equilibriumLength*where;
		}
		startTensor.addLabelString(' angletensor');
		startTensor.angle2=anglify(tensor.getTensorAngle(collider)+Math.PI-collider.angle);
		startTensor.torqueConstant2=0;
	

		// Tensor 2
		//endTensor.name='[end-'+endTensor.name+']';
		endTensor.node1=collider;
		if (tensor.equilibriumLength!=undefined) {
			endTensor.equilibriumLength=tensor.equilibriumLength*(1-where);
		}
		endTensor.addLabelString(' angletensor');
		endTensor.angle1=anglify(tensor.getTensorAngle(collider)-collider.angle);
		endTensor.torqueConstant1=0;

		// ok this should take all childtensor into console.

		recalcStretch(original);
		/*if (tensor.equilibriumLength!=undefined) {
			startTensor.equilibriumLength=startTensor.getLength()-shortage/2;
		}
		if (tensor.equilibriumLength!=undefined) {
			endTensor.equilibriumLength=endTensor.getLength()- shortage/2;
		}*/

	}
}

function debugBounce(tensor) {
	
	let originalTensor= tensor.brokendata.parentTensor;
	if (originalTensor==tensor) {
		console.log('This is the original tensor');
	}

	console.group();
	console.log('ORIGINAL: Name: ' + originalTensor.name);
	console.log('ORIGINAL: EquilibriumLength: '+ originalTensor.equilibriumLength);
	console.log('ORIGINAL: Length: '+ originalTensor.getLength());
	console.log('ORIGINAL: startTensor: '+ originalTensor.brokendata.startTensor.name);
	console.groupEnd();

	let i =0;
	let currentTensor=originalTensor.brokendata.startTensor;
	let sumLength = 0;
	let sumEq = 0;

	while (currentTensor) {

		console.group();
		console.log(i+' Name: '+ currentTensor.name);
		console.log(i+' EquilibriumLength: '+ currentTensor.equilibriumLength);
		console.log(i+' Length: '+ currentTensor.getLength());
		console.log(i+' Tension: '+ (currentTensor.equilibriumLength-currentTensor.getLength()));
		console.log(i+' StartNode: '+ currentTensor.node1.name);
		console.log(i+' EndNode: '+ currentTensor.node2.name);
		console.log(i+' Parent: '+ currentTensor.brokendata.parentTensor.name);
		console.log(i+' Broken from: '+ (currentTensor.brokendata.from<0? 'left':'right'));
		console.groupEnd();

		i++;
		sumEq+=currentTensor.equilibriumLength;
		sumLength+=currentTensor.getLength();
		currentTensor=currentTensor.brokendata.nextTensor;
	}
	console.log('SUM EquilibriumLength: '+ sumEq);
	console.log('SUM Length: '+ sumLength);
}


/** This behaviour draws a button next to the object and trigger a script
 * @class
 * @extends Behaviour
 */
class ButtonBehaviour extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		let button = document.createElement('button');
		button.id = 'propertiesButton';
		button.style.position='absolute';
		button.classList.add('worldButton');
		button.addEventListener('click', (...args) => {
			let func = storeableObject.buttonScript_Evaluated;
			if (func) {
				func(...args);
			}
		}, false);
		storeableObject.parentTrussNode.element.appendChild(button);
		storeableObject.buttonReference=button;

		storeableObject.registerOverride(
			BehaviourOverride.UPDATEPOSITION, 
			ButtonBehaviour.prototype.updateXPosition);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.UPDATEPOSITION, ButtonBehaviour.prototype.updateXPosition);
		
		if (storeableObject.buttonReference) {
			storeableObject.parentTrussNode.element.removeChild(storeableObject.buttonReference);
		}
	}

	/**
	 * If the angle between the tensors is more than 180 degrees, cut the node free.
	 * @return {number}
	 */
	updateXPosition() {
		this.buttonReference.innerHTML = this.name;
		this.parentTrussNode.view.putElementOnScreen(this.localPosition, this.buttonReference);
	}
}


/** This sensor updates the debug window
 * @class
 * @extends Behaviour
 */
class DebugWindowSensor extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		//storeableObject.debugEntity=debugEntity;
		storeableObject.registerOverride(BehaviourOverride.SENSE, DebugWindowSensor.prototype.sense);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.SENSE, DebugWindowSensor.prototype.sense);

	}

	/**
	 * If the position of the controlled object bounces or leaves on the right or
	 * left side, disconnect it and restore the tensor to its original.
	 * @param {number} time
	 * @param {number} deltaTime
	 * @param {Trussnode} trussNode
	 */
	sense() {

		debugEntity.debugWindow.timeField.refresh();

		//debugEntity.debugWindow.shadeLevel.value=universe.currentNode.view.clearLevel;
		
		debugEntity.debugWindow.debugCounter.refresh();
		debugEntity.debugWindow.shade.refresh();
		debugEntity.debugWindow.ticks.refresh();

	}
}

/** This sensor updates the debug window
 * @class
 * @extends Behaviour
 */
class CenterDisplay extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.UPDATEPOSITION, CenterDisplay.prototype.updatePosition);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.UPDATEPOSITION, CenterDisplay.prototype.updatePosition);
	}

	/**
	 * set the offset of the view so it is centered on this node
	 *
	 */
	updatePosition() {
		universe.currentNode.worldOffset = 
			Vector.subtractVectors(
				this.localPosition,
				Vector.divideVector(universe.currentNode.worldSize,2)
			);	
	}
}
