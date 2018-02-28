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
		if (mass) {
			this.massRadius = Math.sqrt(mass);
		} else {
			this.massRadius = 5;
		}
		this.angle = 0;
		this.turnrate = 0;
		this.torqueConstant = torqueConstant;
		this.velocityBasedTensors = [];
		this.positionBasedTensors = [];
		this.velocityLoss = velocityLoss;
		this.positionFunction = positionFunction;
		this.showFunction = showFunction;
		this.isNode=true;

		Object.defineProperty(this, 'degree', {
			get: function() {
				return Math.round(this.angle*180/(Math.PI))
				;
			},
			set: function(value) {
				this.angle = value*Math.PI/180
				;
			},
		});

		this.addProperty(new Property(this,
			'name', 'name', 'Name', ParameteType.STRING, ParameterCategory.CONTENT,
			'The name of the node.'));

		this.addProperty(new Property(this,
			'mass', 'mass', 'Mass', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The mass of the node in Kilograms.'));

		this.addProperty(new Property(this,
			'localPosition', 'localPosition', 'Position', ParameteType.POSITION, ParameterCategory.CONTENT,
			'The position counted from the upper left corner.'));
		this.addProperty(new Property(this,
			'degree', 'degree', 'Angle', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The angle of the node.'));
		this.addProperty(new Property(this,
			'velocityLoss', 'velocityLoss', 'Node friction', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'How much velocity bleeds of the node (0-1, where 1 is no bleed of).'));
	}

	/**
	 * @return {string}
	 */
	generateconnectionHTML() {
		let div = document.createElement('div'); // Create the element in memory

		for (let tensor of [...this.velocityBasedTensors, ...this.positionBasedTensors]) {
			let subDiv = document.createElement('div'); 
			div.appendChild(subDiv);
			let button1 = document.createElement('button'); // Create the element in memory
			button1.innerHTML=tensor.getName();
			button1.classList.add('simpleButton'); // Configure the CSS
			subDiv.appendChild(button1);

			let otherNode=tensor.getOppositeNode(this);
			let button2 = document.createElement('button'); // Create the element in memory
			button2.innerHTML=otherNode.name;
			button2.classList.add('simpleButton'); // Configure the CSS
			subDiv.appendChild(button2);

			this.registerOnClick(button1, tensor);
			this.registerOnClick(button2, otherNode);
		}
		return div;
	}

	/**
	 * @param  {buttonObject} but
	 * @param  {Node} node1
	 */
	registerOnClick(but, node1) {
		but.addEventListener('click', function() {
			let previousSelectedObject = selectedObject;
			selectedObject = node1;
			let event = new CustomEvent('selectionEvent', {
				detail: {
					'selectedObject': selectedObject,
					'previousSelectedObject': previousSelectedObject,
					'truss': undefined,
				},
				bubbles: true,
				cancelable: true,
			});
			document.dispatchEvent(event);
		});
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
		if (!this.mass) {
			this.mass=NaN;
		}
		this.massRadius = restoreObject.massRadius;
		this.angle = restoreObject.angle;
		this.turnrate = restoreObject.turnrate;
		this.torqueConstant = restoreObject.torqueConstant;
		this.velocityBasedTensors = deserializeList(restoreObject.velocityBasedTensors, tensorList);
		this.positionBasedTensors = deserializeList(restoreObject.positionBasedTensors, tensorList);
		this.velocityLoss = restoreObject.velocityLoss;
		try {
			if (restoreObject.positionFunction) {
				this.positionFunction = eval('('+restoreObject.positionFunction+')');
			}
			if (restoreObject.showFunction) {
				this.showFunction = eval('('+restoreObject.showFunction+')');
			}
		} catch (err) {
			alert(err);
			alert(this);
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
	 */
	resetVelocity() {
		this.velocity.x=0;
		this.velocity.y=0;
	}
	/** copy the values of a position to the node. This avoid having a strong relationship to the assigned position.
	 * @param  {Position} position
	 */
	copyPosition(position) {
		this.localPosition.x = position.x;
		this.localPosition.y = position.y;
	};

	/** Assign a position object to the node. Also consider use of copyPosition() instead.
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
	 * @param {Truss} truss
	 * @param {number} time
	 * @param {number} graphicDebugLevel
	 */
	show(truss, time, graphicDebugLevel = 0) {
		let view = truss.view;
		let cxt = view.context;
		if (view.inside(this.getPosition())) {
			this.highLight(cxt);
			cxt.beginPath();
			view.drawCircle(this.getPosition(), 0.03 * this.massRadius);
			cxt.stroke();


			if (graphicDebugLevel > 5) {
				cxt.beginPath();
				view.drawLine(this.getPosition(), Vector.addVectors(this.getPosition(),
					new Vector(0.2*Math.cos(this.getAngle()), 0.2*Math.sin(this.getAngle()))));
				cxt.stroke();

				cxt.strokeStyle = 'lightblue';
				cxt.beginPath();
				view.drawLine(this.getPosition(), Vector.addVectors(this.getPosition(), Vector.divideVector(this.velocity, 0.1)));
				cxt.stroke();

				cxt.strokeStyle = 'red';
				cxt.beginPath();
				if (this.acceleration) {
					view.drawLine(this.getPosition(), Vector.addVectors(this.getPosition(), Vector.divideVector(this.acceleration, 0.5)));
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
	 * @param  {Object} TrussClass
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 */
	constructor(startPosition = new Vector(0, 0), view, timestep = 0.016,
		mass = 1, name = 'trussNode', TrussClass='Truss', positionFunction, showFunction, velocityLoss = 1) {
		super(startPosition, mass, name, positionFunction, showFunction, velocityLoss);


		this.canvas = document.createElement('canvas');
		this.handleCanvas();

		if (view) {
			this.truss = new TrussClass(view, timestep);
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
		representationObject.classname= 'TrussNode';
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
		this.truss = objectFactory(restoreObject.truss, superNodes, superTensors).deserialize(restoreObject.truss);
		this.handleCanvas();
		this.setView();
	}

	/**
	 * Pauses the position updates
	 */
	togglePause() {
		this.truss.togglePause();
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
	 * @param  {Truss} truss
	 * @param  {number} time
	 * @param  {number} graphicDebugLevel=0
	 */
	show(truss, time, graphicDebugLevel = 0) {
		this.highLight(canvas.context);
		this.canvas.style.left = truss.view.x(this.localPosition) + 'px';
		this.canvas.style.top = truss.view.y(this.localPosition) + 'px';
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
	/** This class displays a HTML element as a dynamic square between the four input nodes.
	 * @param  {HTMLElement} element
	 */
	constructor(element) {
		super();
		this.element=element;

		Object.defineProperty(this, 'idString', {
			get: function() {
				if (this.element) {
					return this.element.id;
				}
			},
			set: function(value) {
				let oldElement =this.element;
				if (oldElement) {
					restoreMatrix(oldElement);
				}
				let newElement = document.getElementById(value);
				if (newElement) {
					this.element = newElement;
				} else {
					this.element= undefined;
				}
			},
		});

		this.addProperty(new Property(this,
			'idString', 'idString', 'Element id', ParameteType.STRING, ParameterCategory.CONTENT,
			'The HTML elements id.'));
	}

	/**
	 * @param  {Truss} truss
	 * @param  {Position} topScreenPos
	 */
	create(truss, topScreenPos) {
		this.element.style.display='block';
		this.truss=truss;
		let screenWidth=this.element.offsetWidth;
		let screenHeight=this.element.offsetHeight;

		this.nail = truss.addNode(new Node(
			truss.view.worldPosition(topScreenPos.x+screenWidth/2, topScreenPos.y/2), NaN, 'nayl', 0, 0, 0.99));
		this.leftTopNode = truss.addNode(new Node(
			truss.view.worldPosition(topScreenPos.x, topScreenPos.y), 1, 'leftTop', 0, 0, 0.99));
		this.rightTopNode = truss.addNode(new Node(
			truss.view.worldPosition(topScreenPos.x+screenWidth, topScreenPos.y), 1, 'rightTop', 0, 0, 0.99));
		let {node, gravity} = truss.addGravityNodeAndTensor(new Node(
			truss.view.worldPosition(topScreenPos.x, topScreenPos.y+screenHeight), 1, 'leftBottom', 0, 0, 0.99));
		this.leftBottomNode=node;
		this.leftBottomField=gravity;
		let {'node': x, 'gravity': y} = truss.addGravityNodeAndTensor(new Node(
			truss.view.worldPosition(topScreenPos.x+screenWidth, topScreenPos.y+screenHeight), 1, 'rightBottom', 0, 0, 0.99));
		this.rightBottomNode=x;
		this.rightBottomField=y;
		this.leftBand = truss.addTensor(new Spring(this.leftTopNode, this.nail, 20));
		this.rightBand = truss.addTensor(new Spring(this.nail, this.rightTopNode, 20));
		this.topBand = truss.addTensor(new Spring(this.leftTopNode, this.rightTopNode, 30));
		this.leftSpring = truss.addTensor(new Spring(this.leftTopNode, this.leftBottomNode, 10));
		this.rightSpring = truss.addTensor(new Spring(this.rightTopNode, this.rightBottomNode, 10));
	}

	/**
	 * @param  {Truss} truss
	 */
	hide() {
		this.element.style.display='none';
		this.truss.removeTensor(this.leftBand);
		this.truss.removeTensor(this.rightBand);
		this.truss.removeTensor(this.topBand);
		this.truss.removeTensor(this.leftSpring);
		this.truss.removeTensor(this.rightSpring);
		this.truss.removeTensor(this.leftBottomField);
		this.truss.removeTensor(this.rightBottomField);

		this.truss.removeNode(this.nail);
		this.truss.removeNode(this.leftTopNode);
		this.truss.removeNode(this.rightTopNode);
		this.truss.removeNode(this.leftBottomNode);
		this.truss.removeNode(this.rightBottomNode);
	}


	/**
	 * @param  {Array} superNodeList
	 * @param  {Array} superTensorList
	 */
	serialize(superNodeList, superTensorList) {
		return;
		// let representationObject = super.serialize(superNodeList, superTensorList);
		// representationObject.classname = 'HTMLNode';
		// return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} superNodes
	 * @param  {Array} superTensors
	 */
	deserialize(restoreObject, superNodes, superTensors) {
		return;
	}

	/** Displays the Truss's canvas at the correct position
	 * @param  {Truss} truss
	 * @param  {number} time
	 * @param  {number} graphicDebugLevel=0
	 */
	show(truss, time, graphicDebugLevel = 0) {
		super.show(truss, time, graphicDebugLevel);
		this.highLight(truss.view.context);
		if (this.element) {
			warpMatrix(truss, this.element,
				this.leftTopNode.getPosition(),
				this.rightTopNode.getPosition(),
				this.leftBottomNode.getPosition(),
				this.rightBottomNode.getPosition());
		}
	};
}
