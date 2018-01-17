/**
 * @class
 */
class Node {
	/**
	 * @param  {Position} startPosition
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 * @param  {number} torqueConstant
	 */
	constructor(startPosition, mass = 1, name = 'node', positionFunction, showFunction, velocityLoss = 0.99, torqueConstant = 0) {
		this.name = name;
		this.localPosition = startPosition;
		this.velocity = new Velocity(0, 0);
		this.mass = mass;
		this.massRadius = Math.sqrt(mass);
		this.angle = 0;
		this.turnrate = 0;
		this.torqueConstant = torqueConstant;
		this.velocityBasedTensors = [];
		this.positionBasedTensors = [];
		this.velocityLoss = velocityLoss;
		this.positionFunction = positionFunction;
		this.showFunction = positionFunction;
	}

	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		let representation={'classname': 'Node'};
		representation.name=this.name;
		representation.localPosition=this.localPosition.serialize();
		representation.velocity=this.velocity.serialize();
		representation.mass=this.mass;
		representation.massRadius=this.massRadius;
		representation.angle=this.angle;
		representation.turnrate=this.turnrate;
		representation.torqueConstant=this.torqueConstant;
		representation.velocityBasedTensors = serializeTensorList(this.velocityBasedTensors, nodeList, tensorList);
		representation.positionBasedTensors = serializeTensorList(this.positionBasedTensors, nodeList, tensorList);
		representation.velocityLoss=this.velocityLoss;
		if (this.positionFunction) {
			representation.positionFunction=this.positionFunction.toString();
		}
		if (this.showFunction) {
			representation.showFunction=this.showFunction.toString();
		}

		let storeBreakList=[];
		if (this.breakList) {
			for (let lineBreaker of this.breakList) {
				storeBreakList.push({
					'original': tensorList.indexOf(lineBreaker.originalParent),
					'immediatelyLeft': tensorList.indexOf(lineBreaker.startNewLink),
					'immediatelyRight': tensorList.indexOf(lineBreaker.endNewLink),
					'direction': lineBreaker.dir,
					'outerLayer': lineBreaker.outerLayer,
				});
			}
		}
		representation.breakList=storeBreakList;

		return representation;
	}

	/**
	 * @param  {Object} restoreObject
	 */
	deserialize(restoreObject) {
		this.name = restoreObject.name;
		this.localPosition = new Position().deserialize(restoreObject.localPosition);
		this.velocity = new Vector().deserialize(restoreObject.velocity);
		this.mass = restoreObject.mass;
		this.massRadius = restoreObject.massRadius;
		this.angle = restoreObject.angle;
		this.turnrate = restoreObject.turnrate;
		this.torqueConstant = restoreObject.torqueConstant;
		this.velocityBasedTensors = [];
		this.positionBasedTensors = [];
		this.velocityLoss = restoreObject.velocityLoss;
		if (restoreObject.positionFunction) {
			this.positionFunction = eval(restoreObject.positionFunction);
		}
		if (restoreObject.showFunction) {
			this.showFunction = eval(restoreObject.showFunction);
		}
		// call handleCanvas
		// Get view
		// call setView

		// Set easy properties
		// Make list of nodes
		// make list of tensors (using the nodes)
		// fill in the nodes tensor references
	}

	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 */
	deserializeFixLinks(nodeList, tensorList) {
		//
	}

	/**
	 * @param  {Position} position
	 */
	setPosition(position) {
		this.localPosition = position;
	};

	/**
	 * @return {Position}
	 */
	getPosition() {
		return this.localPosition;
	};

	/** return the angle this node has with respect to its initial direction.
	 * @return {number}
	 */
	getAngle() {
		return this.angle;
	};

	/** Returns the torque constant
	 * @return {number}
	 */
	getTorqueConstant() {
		return this.torqueConstant;
	};

	/**
	 * Ensures that this node understands that it will recieve force from thsi tensor
	 * @param  {Tensor} tensor
	 * @param  {number} angle
	 * @return {Tensor}
	 */
	addTensor(tensor, angle) {
		if (!angle && this.torqueConstant) {
			angle = tensor.getTensorAngle(this) - this.angle;
		}
		if (tensor.tensorType == TensorType.ABSORBER) {
			this.velocityBasedTensors.push(tensor);
		} else {
			this.positionBasedTensors.push(tensor);
		}
		return tensor;
	};

	/**
	 * This node will no longer recieve force from this tensor
	 * @param {Tensor} tensor
	 */
	removeTensor(tensor) {
		/**
		 * @param {object} o
		 * @param {list} l
		 */
		function supportRemove(o, l) {
			let a = l.findIndex((z) => z==o);
			if (a<0) {
				return;
			}
			l.splice(a, 1);
		}

		if (tensor.tensorType == TensorType.ABSORBER) {
			supportRemove(tensor, this.velocityBasedTensors);
		} else {
			supportRemove(tensor, this.positionBasedTensors);
		}
	}

	/**
	 * Update the position based on velocity, then let
	 * the this.positionFunction (if present) tell where it should actually be
	 * @param  {number} trussTime
	 * @param  {number} timeFactor
	 */
	updatePosition(trussTime, timeFactor) {
		let oldPosition = new Position(this.getPosition().x, this.getPosition().y);
		this.localPosition.add(multiplyVector(timeFactor, this.velocity));
		if (this.positionFunction) {
			this.setPosition(this.positionFunction(this, trussTime));
			this.velocity = subtractVectors(this.getPosition(), oldPosition);
		}
	}

	/** Update the velocity based on position based tensors
	 * @param  {number} timeFactor
	 */
	updatePositionBasedVelocity(timeFactor) {
		this.updateVelocity(this.positionBasedTensors, timeFactor);
	}

	/**
	 * Update the rotation speed based on velocity based tensors
	 * @param {number} timeFactor
	 */
	updateFinalVelocity(timeFactor) {
		this.updateVelocity(this.velocityBasedTensors, timeFactor);
	}

	/**
	 * Update the rotation speed based on velocity based tensors
	 * @param {number} timeFactor
	 */
	updateFinalRotation(timeFactor) {
		this.updateRotation(this.positionBasedTensors, timeFactor);
	}

	/**
	 * is it possible to turn this node
	 * @return {number} timeFactor
	 */
	turnable() {
		return (this.torqueConstant && this.torqueConstant!=0);
	}

	/** Loop through all springs connected to this node and sum them p
	 * @return {number}
	 */
	calculateTorques() {
		this.sumTorque = 0;
		if (!this.turnable()) {
			return;
		}
		for (let tensor of this.positionBasedTensors) {
			if (tensor.tensorType == TensorType.SPRING) {
				this.sumTorque += tensor.getTorque(this);
			}
		}
		return this.sumTorque;
	}

	/**
		 * Calculate the final rotation speed
		 * @param {Array} forceAppliers
		 * @param {number} timeFactor
		 */
	updateRotation(forceAppliers, timeFactor) {
		if (this.mass) {
			this.turnrate+=this.sumTorque/(this.mass*1000);
		} else {
			this.turnrate=0; // weightless cannot turn
		}
		this.turnrate=this.turnrate*0.99;
		this.angle+=this.turnrate;
	}

	/**
	 * Calculate the final velocity
	 * @param {Array} forceAppliers
	 * @param {number} timeFactor
	 */
	updateVelocity(forceAppliers, timeFactor) {
		if (isNaN(this.mass)) return;
		let acceleration;
		if (forceAppliers.length > 0) {
			acceleration = this.getAcceleration(forceAppliers);
		} else {
			acceleration = new Vector(0, 0);
		}
		this.velocity = addVectors(multiplyVector(this.velocityLoss, this.velocity),
			multiplyVector(timeFactor, acceleration));
	}

	/**
	 * Sum all forces generated by the forceAppliers and divide by the mass to get the acceleration
	 * @param {Array} forceAppliers
	 * @return {Vector}
	 */
	getAcceleration(forceAppliers) {
		//		this.acceleration=this.sumAllForces(forceAppliers).divide(this.mass)
		return divideVector(this.sumAllForces(forceAppliers), this.mass);
	}

	/**
	 * Go through the list of all forceAppliers and sum them up
	 * @param  {Array} forceAppliers
	 * @return {Force}
	 */
	sumAllForces(forceAppliers) {
		let result = new Force(0, 0);
		let applier;
		let tempForce;
		for (let i = 0; i < forceAppliers.length; i++) {
			applier = forceAppliers[i];
			tempForce = applier.getForce(this);
			result.add(tempForce);
		}
		return result;
	}

	/**
	 * Draw the circle representing the node
	 * @param {Canvas} canvas
	 * @param {number} time
	 * @param {number} graphicDebugLevel
	 */
	show(canvas, time, graphicDebugLevel = 0) {
		if (canvas.inside(this.getPosition())) {
			canvas.context.strokeStyle = 'lightgrey';
			canvas.context.beginPath();
			canvas.drawCircle(this.getPosition(), 0.03 * this.massRadius);
			canvas.context.stroke();

			canvas.context.beginPath();
			canvas.drawLine(this.getPosition(), addVectors(this.getPosition(),
				new Vector(0.2*Math.cos(this.getAngle()), 0.2*Math.sin(this.getAngle()))));
			canvas.context.stroke();

			if (graphicDebugLevel > 5) {
				canvas.context.strokeStyle = 'lightblue';
				canvas.context.beginPath();
				canvas.drawLine(this.getPosition(), addVectors(this.getPosition(), divideVector(this.velocity, 0.1)));
				canvas.context.stroke();

				canvas.context.strokeStyle = 'red';
				canvas.context.beginPath();
				if (this.acceleration) {
					canvas.drawLine(this.getPosition(), addVectors(this.getPosition(), divideVector(this.acceleration, 0.5)));
				}
				canvas.context.stroke();
			}

			if (this.showFunction) this.showFunction(this, time);
		}
	}
}

/**
 * @class
 * @extends Node
 */
class TrussNode extends Node {
	/** Create a node that can contain a Truss within itself.
	 * @param  {Position} startPosition
	 * @param  {View} view
	 * @param  {number} timestep
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {Object} trussClass
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 */
	constructor(startPosition = new Vector(0, 0), view, timestep = 0.016,
		mass = 1, name = 'trussNode', trussClass='Truss', positionFunction, showFunction, velocityLoss = 1) {
		super(startPosition, mass, name, positionFunction, showFunction, velocityLoss);

		this.handleCanvas();

		if (view) {
			this.truss = new trussClass(view, timestep);
			this.setView(view);
		}
	}

	/**
	 *
	 */
	handleCanvas() {
		this.canvas = document.createElement('canvas');
		this.canvas.name = this.name;
		this.canvas.style.top = this.localPosition.y + 'px';
		this.canvas.style.left = this.localPosition.x + 'px';
		this.canvas.style.position = 'absolute';
		this.canvas.style.border = '1px solid red';
		let bg = document.getElementById('TrussBackground');
		bg.appendChild(this.canvas);
	}

	/**
	 * @param  {View} view
	 * @param  {Number} timestep
	 */
	setView(view) {
		this.view = view;
		this.view.context = this.canvas.getContext('2d');
		this.canvas.width = view.screenSize.x;
		this.canvas.height = view.screenSize.y;
		this.canvas.style.width = view.screenSize.x + 'px';
		this.canvas.style.height = view.screenSize.y + 'px';
	}

	/**
	 * @param  {Array} superNodeList
	 * @param  {Array} superTensorList
	 * @return {Object}
	 */
	serialize(superNodeList, superTensorList) {
		let localTensorList=this.makeTensorList();
		let localNodeList=this.makeNodeList();

		let representationObject = super.serialize(localTensorList);
		representationObject.classname='TrussNode';
		let nodeList=[];
		for (let node of localNodeList) {
			nodeList.push(node.serialize(localNodeList, localTensorList));
		}
		representationObject.nodes=nodeList;

		let tensorList=[];
		for (let tensor of localTensorList) {
			tensorList.push(tensor.serialize(localNodeList, localTensorList));
		}
		representationObject.tensors=tensorList;

		representationObject.view = this.view.serialize();
		representationObject.truss = this.truss.serialize();

		// save the canvas properties
		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 */
	deserialize(restoreObject) {
		super.deserialize(restoreObject);
		this.handleCanvas();
		this.view = (new View()).deserialize(restoreObject.view);
		this.setView(this.view);
		let nodeList=[];
		for (let nodeRestoreObject of restoreObject.nodes) {
			let node = objectFactory(nodeRestoreObject);
			nodeList.push(node);
		}

		// Set easy properties
		// Make list of nodes
		// make list of tensors (using the nodes)
		// fill in the nodes tensor references
	}

	/**
	 * Recursively call tick() on the sub-Truss and then update this nodes position
	 * @param {number} time
	 * @param {number} delta
	 */
	updatePosition(time, delta) {
		this.truss.tick(time, delta);
		super.updatePosition(time, delta); // Call parent in order to update this nodes position
	};

	/** Displays the Truss's canvas at the correct position
	 * @param  {View} v
	 * @param  {number} time
	 * @param  {number} graphicDebugLevel=0
	 */
	show(v, time, graphicDebugLevel = 0) {
		this.canvas.style.left = v.x(this.localPosition) + 'px';
		this.canvas.style.top = v.y(this.localPosition) + 'px';
	};

	/** used ONLY by main loop on the Top level TrussNode
	 * @param  {number} time
	 */
	tick(time) {
		this.truss.tick(time);
	};

	/**
	 * @return {Array}
	 */
	makeTensorList() {
		return this.truss.makeTensorList();
	}

	/**
	 * @return {Array}
	 */
	makeNodeList() {
		return this.truss.makeNodeList();
	}
}
