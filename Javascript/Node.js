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
	constructor(startPosition = new Position(0, 0), mass = 1, name = 'node',
		positionFunction, showFunction, velocityLoss = 0.99, torqueConstant = 0) {
		this.properties = new PropertyList();
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
		this.showFunction = showFunction;


		this.addProperty(new Property(this,
			'name', 'name', 'Name', ParameteType.STRING, ParameterCategory.CONTENT,
			'The name of the node.'));

		this.addProperty(new Property(this,
			'mass', 'mass', 'Mass', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The mass of the node in Kilograms.'));
		this.addProperty(new Property(this,
			'angle', 'angle', 'Angle', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The angle of the node.'));
		this.addProperty(new Property(this,
			'velocityLoss', 'velocityLoss', 'Node friction', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'How much velocity bleeds of the node (0-1, where 1 is no bleed of).'));
	}

	/** Handling properties
	 * @param  {Property} property
	 * @return {Property}
	 */
	addProperty(property) {
		return this.properties.addProperty(property);
	}

	/** Handling properties
	 * @return {Property}
	 */
	getProperties() {
		return this.properties;
	}

	/** Handling properties
	 * @param  {element} element
	 * @return {Property}
	 */
	populateProperties(element) {
		return this.properties.populateProperties(element);
	}

	/** Handling properties
	 * @param  {element} element
	 * @return {Property}
	 */
	clearProperties(element) {
		return this.properties.clearProperties(element);
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
		representation.velocityBasedTensors = serializeList(this.velocityBasedTensors, tensorList);
		representation.positionBasedTensors = serializeList(this.positionBasedTensors, tensorList);
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
					'original': tensorList.indexOf(lineBreaker.original),
					'immediatelyLeft': tensorList.indexOf(lineBreaker.immediatelyLeft),
					'immediatelyRight': tensorList.indexOf(lineBreaker.immediatelyRight),
					'direction': lineBreaker.direction,
					'outerLayer': lineBreaker.outerLayer,
				});
			}
		}
		representation.breakList=storeBreakList;

		return representation;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 */
	deserialize(restoreObject, nodeList, tensorList) {
		this.name = restoreObject.name;
		this.localPosition = new Position().deserialize(restoreObject.localPosition);
		this.velocity = new Vector().deserialize(restoreObject.velocity);
		this.mass = restoreObject.mass;
		this.massRadius = restoreObject.massRadius;
		this.angle = restoreObject.angle;
		this.turnrate = restoreObject.turnrate;
		this.torqueConstant = restoreObject.torqueConstant;
		this.velocityBasedTensors = deserializeList(restoreObject.velocityBasedTensors, tensorList);
		this.positionBasedTensors = deserializeList(restoreObject.positionBasedTensors, tensorList);
		this.velocityLoss = restoreObject.velocityLoss;
		if (restoreObject.positionFunction) {
			this.positionFunction = eval('('+restoreObject.positionFunction+')');
		}
		if (restoreObject.showFunction) {
			this.showFunction = eval('('+restoreObject.showFunction+')');
		}

		if (restoreObject.breakList) {
			this.breakList=[];
			for (let lineBreaker of restoreObject.breakList) {
				this.breakList.push({
					'original': tensorList[lineBreaker.original],
					'immediatelyLeft': tensorList[lineBreaker.immediatelyLeft],
					'immediatelyRight': tensorList[lineBreaker.immediatelyRight],
					'direction': lineBreaker.direction,
					'outerLayer': lineBreaker.outerLayer,
				});
			}
		}
		// Set easy properties
		// Make list of nodes
		// make list of tensors (using the nodes)
		// fill in the nodes tensor references
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
		this.localPosition.add(Vector.multiplyVector(timeFactor, this.velocity));
		if (this.positionFunction) {
			this.setPosition(this.positionFunction(this, trussTime));
			this.velocity = Vector.subtractVectors(this.getPosition(), oldPosition);
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
		this.turnrate=this.turnrate*0.8;
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
		this.velocity = Vector.addVectors(Vector.multiplyVector(this.velocityLoss, this.velocity),
			Vector.multiplyVector(timeFactor, acceleration));
	}

	/**
	 * Sum all forces generated by the forceAppliers and divide by the mass to get the acceleration
	 * @param {Array} forceAppliers
	 * @return {Vector}
	 */
	getAcceleration(forceAppliers) {
		//		this.acceleration=this.sumAllForces(forceAppliers).divide(this.mass)
		return Vector.divideVector(this.sumAllForces(forceAppliers), this.mass);
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
	 * @param  {number} type Where 0 is unselect, 1 means its pointed on and 2 is selected
	 */
	setHighlight(type) {
		this.highlighted=type;
	}


	/**
	 * Draw the circle representing the node
	 * @param {Canvas} canvas
	 * @param {number} time
	 * @param {number} graphicDebugLevel
	 */
	show(canvas, time, graphicDebugLevel = 0) {
		let cxt = canvas.context;
		if (canvas.inside(this.getPosition())) {
			this.highLight(cxt);
			cxt.beginPath();
			canvas.drawCircle(this.getPosition(), 0.03 * this.massRadius);
			cxt.stroke();

			cxt.beginPath();
			canvas.drawLine(this.getPosition(), Vector.addVectors(this.getPosition(),
				new Vector(0.2*Math.cos(this.getAngle()), 0.2*Math.sin(this.getAngle()))));
			cxt.stroke();

			if (graphicDebugLevel > 5) {
				cxt.strokeStyle = 'lightblue';
				cxt.beginPath();
				canvas.drawLine(this.getPosition(), Vector.addVectors(this.getPosition(), Vector.divideVector(this.velocity, 0.1)));
				cxt.stroke();

				cxt.strokeStyle = 'red';
				cxt.beginPath();
				if (this.acceleration) {
					canvas.drawLine(this.getPosition(), Vector.addVectors(this.getPosition(), Vector.divideVector(this.acceleration, 0.5)));
				}
				cxt.stroke();
			}

			if (this.showFunction) this.showFunction(this, time);
		}
	}

	/**
	 * @param  {Context} ctx
	 */
	highLight(ctx) {
		if (!this.highlighted) {
			ctx.strokeStyle = 'lightgrey';
			ctx.shadowBlur = 0;
			ctx.lineWidth = 2;
			ctx.shadowColor = 'black';
		} else if (this.highlighted == 1) {
			ctx.strokeStyle = 'orange';
			ctx.shadowBlur = 40;
			ctx.lineWidth = 4;
			ctx.shadowColor = 'orange';
		} else {
			ctx.strokeStyle = 'yellow';
			ctx.shadowBlur = 60;
			ctx.lineWidth = 6;
			ctx.shadowColor = 'yellow';
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


		this.canvas = document.createElement('canvas');
		this.handleCanvas();

		if (view) {
			this.truss = new trussClass(view, timestep);
			this.setView();
		}
	}

	/**
	 *
	 */
	handleCanvas() {
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
	 */
	setView() {
		this.truss.view.context = this.canvas.getContext('2d');
		this.canvas.width = this.truss.view.screenSize.x;
		this.canvas.height = this.truss.view.screenSize.y;
		this.canvas.style.width = this.truss.view.screenSize.x + 'px';
		this.canvas.style.height = this.truss.view.screenSize.y + 'px';
	}

	/**
	 * @param  {Array} superNodeList
	 * @param  {Array} superTensorList
	 * @return {Object}
	 */
	serialize(superNodeList, superTensorList) {
		let representationObject = super.serialize(superNodeList, superTensorList);
		representationObject.truss = this.truss.serialize();

		// save the canvas properties
		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} superNodes
	 * @param  {Array} superTensors
	 */
	deserialize(restoreObject, superNodes, superTensors) {
		super.deserialize(restoreObject);
		this.truss = new Truss().deserialize(restoreObject.truss);
		this.handleCanvas();
		this.setView();
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
		this.highLight(canvas.context);
		this.canvas.style.left = v.x(this.localPosition) + 'px';
		this.canvas.style.top = v.y(this.localPosition) + 'px';
	};

	/** used ONLY by main loop on the Top level TrussNode
	 * @param  {number} time
	 */
	tick(time) {
		this.truss.tick(time);
	};
}

/**
 * @class
 * @extends Node
 */
class HTMLNode extends Node {
	/**
	 * @param  {HTMLElement} element
	 * @param  {Truss} truss
	 * @param  {Position} startPosition
	 * @param  {Position} leftTopPosition
	 * @param  {Position} rightTopPosition
	 * @param  {Position} leftBottomPosition
	 * @param  {Position} rightBottomPosition
	 */
	constructor(element, truss, startPosition, leftTopPosition, rightTopPosition, leftBottomPosition, rightBottomPosition) {
		super(startPosition);
		this.element=element;
		this.truss=truss;

		this.nail = truss.addNode(new Node(startPosition, NaN, 'nail'));
		this.leftTopNode = truss.addNode(new Node(leftTopPosition, 1, 'leftTop'));
		this.rightTopNode = truss.addNode(new Node(rightTopPosition, 1, 'rightTop'));
		this.leftBottomNode = truss.addGravityNode(new Node(leftBottomPosition, 1, 'leftBottom'));
		this.rightBottomNode = truss.addGravityNode(new Node(rightBottomPosition, 1, 'rightBottom'));

		this.a = truss.addTensor(new Spring(this.leftTopNode, this.nail, 20));
		this.b = truss.addTensor(new Spring(this.nail, this.rightTopNode, 20));
		this.c = truss.addTensor(new Spring(this.leftTopNode, this.rightTopNode, 30));

		this.leftSpring = truss.addTensor(new Spring(this.leftTopNode, this.leftBottomNode, 10));
		this.rightSpring = truss.addTensor(new Spring(this.rightTopNode, this.rightBottomNode, 10));

		warpMatrix(truss, element,
			this.leftTopNode.getPosition(),
			this.rightTopNode.getPosition(),
			this.rightBottomNode.getPosition(),
			this.rightBottomNode.getPosition());
	}


	/**
	 * @param  {Array} superNodeList
	 * @param  {Array} superTensorList
	 * @return {Object}
	 */
	serialize(superNodeList, superTensorList) {
		let representationObject = super.serialize(superNodeList, superTensorList);
		representationObject.truss = this.truss.serialize();

		// save the canvas properties
		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} superNodes
	 * @param  {Array} superTensors
	 */
	deserialize(restoreObject, superNodes, superTensors) {
		super.deserialize(restoreObject);
		this.truss = new Truss().deserialize(restoreObject.truss);
		this.handleCanvas();
		this.setView();
	}

	/** Displays the Truss's canvas at the correct position
	 * @param  {Canvas} canvas
	 * @param  {number} time
	 * @param  {number} graphicDebugLevel=0
	 */
	show(canvas, time, graphicDebugLevel = 0) {
		this.highLight(canvas.context);
		warpMatrix(this.truss, this.element,
			this.leftTopNode.getPosition(),
			this.rightTopNode.getPosition(),
			this.leftBottomNode.getPosition(),
			this.rightBottomNode.getPosition());
	};
}
