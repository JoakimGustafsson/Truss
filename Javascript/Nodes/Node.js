/**
 * @class
<<<<<<< HEAD
 */
class Node {
	/**
	 * @param  {Truss} truss
	 * @param  {Position} startPosition
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 * @param  {number} torqueConstant
	 */
	constructor(truss, startPosition = new Position(0, 0), mass = 1, name = 'node',
		positionFunction, showFunction, velocityLoss = 0.99, torqueConstant = 0) {
		this.truss=truss;
		this.properties = new PropertyList();
		this.name = name;
		this.localPosition = startPosition;
		this.velocity = new Velocity(0, 0);
		this._mass = mass;
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
		this.isNode = true;

		Object.defineProperty(this, 'mass', {
			get: function() {
=======
 * @extends StoreableObject
 */
class Node extends StoreableObject {
	/**
	 * @param  {World} world
	 * @param  {Truss} parentTrussNode
	 * @param  {string} initialLabels
	 * @param  {object} valueObject
	 */
	constructor(world, parentTrussNode, initialLabels, valueObject) {
		super(world, initialLabels, valueObject);
		if (parentTrussNode) {
			this.parentTrussNode= parentTrussNode;
		}
		if (!this.localPosition) {
			this.localPosition = new Position(0, 0);
		}
		if (!this.velocity) {
			this.velocity = new Velocity(0, 0);
		}
		this.connectedTensors = [];
		/*
		this.angle = 0;
		this.turnrate = 0;

		this.torqueConstant = 0;
		this.velocityLoss = 0.99;
		this.positionFunction = undefined;
		this.showFunction = undefined;
		// this.color = 'lightgrey';
		this._pictureReference = '';
		this._size = 1;
		// this.visibleLabel = universe.currentWorld.labels.findLabel('visible');
		*/

		Object.defineProperty(this, 'pictureReference', {
			get: function() {
				return this._pictureReference;
			},
			set: function(value) {
				if (!value ||value == '' || value == 'NaN' || value == 0) {
					this._pictureReference = '';
				} else {
					this._pictureReference = value;
					this.createHTMLPicture(this._pictureReference);
				}
			},
		});

		Object.defineProperty(this, 'size', {
			get: function() {
				return this._size;
			},
			set: function(value) {
				if (!value ||value == '' || value == 'NaN' || value == 0) {
					this._size = 1;
				} else {
					this._size = value;
					this.pictureCornerLength=0;
					this.setupScale();
				}
			},
		});

		Object.defineProperty(this, 'visible', {
			get: function() {
				return this._visible;
			},
			set: function(value) {
				this._visible=value;
			},
		});

		Object.defineProperty(this, 'mass', {
			get: function() {
				if (this._mass==undefined) {
					return NaN;
				}
>>>>>>> newtestbranch
				return this._mass;
			},
			set: function(value) {
				if (value == 'NaN' || value == 0) {
					this._mass = NaN;
				} else {
					this._mass = value;
					this.massRadius = Math.sqrt(value);
				}
			},
		});

		Object.defineProperty(this, 'degree', {
			get: function() {
<<<<<<< HEAD
=======
				if (this.angle==undefined) {
					return 0;
				}
>>>>>>> newtestbranch
				return Math.round(this.angle * 180 / (Math.PI));
			},
			set: function(value) {
				this.angle = value * Math.PI / 180;
			},
		});

<<<<<<< HEAD
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
			'torqueConstant', 'torqueConstant', 'Torque constant', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'How stiff the node is with respect to attempts angle differences.'));
		this.addProperty(new Property(this,
			'velocityLoss', 'velocityLoss', 'Node friction', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'How much velocity bleeds of the node (0-1, where 1 is no bleed of).'));
	}

	/**
	 * @param {Tensor} tensor
	 * @return {Element}
	 */
	generateHTML(tensor) {
=======
		if (this.pictureReference) {
			this.createHTMLPicture(this.pictureReference);
		}

		this.initialRefresh();
	}

	/**
	 * @return {Element}
	 */
	generateHTML() {
>>>>>>> newtestbranch
		let leftButton=document.createElement('button');
		leftButton.classList.add('trussButton');
		leftButton.classList.add('nodeButton');
		leftButton.innerHTML = this.name;
		this.registerOnClick(leftButton, this);

		return leftButton;
	}

	/**
	*  @return {string}
	*/
	generateconnectionHTML() {
		let div = document.createElement('div');

<<<<<<< HEAD
		for (let tensor of [...this.velocityBasedTensors, ...this.positionBasedTensors]) {
=======
		for (let tensor of this.connectedTensors) {
>>>>>>> newtestbranch
			let tensorButton = tensor.generateconnectionHTML(this);
			div.appendChild(tensorButton);

			// let nodeButton = tensor.getOppositeNode(this).generateHTML(tensor);
			// subDiv.appendChild(nodeButton);
		}
		return div;
	}

	/**
	 * @param  {buttonObject} but
	 * @param  {Node} node1
	 */
	registerOnClick(but, node1) {
		but.addEventListener('click', function() {
<<<<<<< HEAD
			let previousSelectedObject = selectedObject;
			selectedObject = node1;
			let event = new CustomEvent('selectionEvent', {
				detail: {
					'selectedObject': selectedObject,
=======
			let previousSelectedObject = universe.selectedObject;
			universe.selectedObject = node1;
			let event = new CustomEvent('selectionEvent', {
				detail: {
					'selectedObject': universe.selectedObject,
>>>>>>> newtestbranch
					'previousSelectedObject': previousSelectedObject,
					'truss': undefined,
				},
				bubbles: true,
				cancelable: true,
			});
<<<<<<< HEAD
			document.dispatchEvent(event);
		});
	}

=======
			universe.currentNode.element.dispatchEvent(event);
		});
	}

	/**
	 * Dummy function. This is better handled in the updatePosition() function since
	 * the sensor directly inluence the position of the sensor node rather than the iO.
	 * @param {number} deltaTime
	 * @param {Truss} truss
	 */
	sense(deltaTime, truss) {}

	/**
	* Using a space separated list, list the labels that should be added
	* @param  {string} labels
	*/
	addLabel(labels) {
		this.labelString+=labels+' ';
		this.labels =
				this.world.labels.parse(this.labelString, this);
	}

>>>>>>> newtestbranch
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
<<<<<<< HEAD
	 * @return {Property}
	 */
	populateProperties(element) {
		return this.properties.populateProperties(element);
=======
	 * @param  {number} ignoreLabels
	 * @return {Property}
	 */
	populateProperties(element, ignoreLabels) {
		return this.properties.populateProperties(element, this, ignoreLabels);
>>>>>>> newtestbranch
	}


	/**
<<<<<<< HEAD
	 * @param  {Truss} truss
=======
>>>>>>> newtestbranch
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
<<<<<<< HEAD
	serialize(truss, nodeList, tensorList) {
		let representation = {
			'classname': 'Node',
		};
		representation.name = this.name;
=======
	serialize(nodeList, tensorList) {
		let representation = super.serialize(nodeList, tensorList);
		representation.classname='Node';

		/*
		representation.name = this.name;
		representation.parentTrussNode = nodeList.indexOf(this.parentTrussNode);
>>>>>>> newtestbranch
		representation.localPosition = this.localPosition.serialize();
		representation.velocity = this.velocity.serialize();
		representation.mass = this.mass;
		representation.massRadius = this.massRadius;
		representation.angle = this.angle;
<<<<<<< HEAD
		representation.turnrate = this.turnrate;
		representation.torqueConstant = this.torqueConstant;
		representation.velocityBasedTensors = serializeList(this.velocityBasedTensors, tensorList);
		representation.positionBasedTensors = serializeList(this.positionBasedTensors, tensorList);
=======
		// representation.color = this.color;
		representation.pictureReference = this.pictureReference;
		representation.size = this.size;
		representation.turnrate = this.turnrate;
		representation.torqueConstant = this.torqueConstant;
		representation.labelString=this.labelString;
		// representation.velocityBasedTensors = serializeList(this.velocityBasedTensors, tensorList);
		representation.positionBasedTensors = serializeList(this.connectedTensors, tensorList);
>>>>>>> newtestbranch
		representation.velocityLoss = this.velocityLoss;
		if (this.positionFunction) {
			representation.positionFunction = this.positionFunction.toString();
		}
		if (this.showFunction) {
			representation.showFunction = this.showFunction.toString();
		}

		let storeBreakList = [];
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
<<<<<<< HEAD
		representation.breakList = storeBreakList;
=======
		representation.breakList = storeBreakList; */
>>>>>>> newtestbranch

		return representation;
	}

<<<<<<< HEAD
	/**
	 * @param  {Truss} truss
	 * @param  {Object} restoreObject
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 */
	deserialize(truss, restoreObject, nodeList, tensorList) {
		this.name = restoreObject.name;
		this.truss = truss;
=======
	/*
	 * @param  {Object} restoreObject
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 *
	deserialize(restoreObject, nodeList, tensorList) {
		this.name = restoreObject.name;
		this.parentTrussNode = nodeList[restoreObject.parentTrussNode];

>>>>>>> newtestbranch
		this.localPosition = new Position().deserialize(restoreObject.localPosition);
		this.velocity = new Vector().deserialize(restoreObject.velocity);
		this.mass = restoreObject.mass;
		if (!this.mass) {
			this.mass = NaN;
		}
		this.massRadius = restoreObject.massRadius;
<<<<<<< HEAD
		this.angle = restoreObject.angle;
		this.turnrate = restoreObject.turnrate;
		this.torqueConstant = restoreObject.torqueConstant;
		this.velocityBasedTensors = deserializeList(restoreObject.velocityBasedTensors, tensorList);
		this.positionBasedTensors = deserializeList(restoreObject.positionBasedTensors, tensorList);
=======
		this.color=restoreObject.color;
		this.pictureReference = restoreObject.pictureReference;

		this.size = restoreObject.size;
		this.angle = restoreObject.angle;
		this.turnrate = restoreObject.turnrate;
		this.torqueConstant = restoreObject.torqueConstant;
		this.labelString = restoreObject.labelString;
		this.labels = universe.currentWorld.labels.parse(this.labelString, this);

		// this.velocityBasedTensors = deserializeList(restoreObject.velocityBasedTensors, tensorList);
		this.connectedTensors = deserializeList(restoreObject.positionBasedTensors, tensorList);
>>>>>>> newtestbranch
		this.velocityLoss = restoreObject.velocityLoss;
		try {
			if (restoreObject.positionFunction) {
				this.positionFunction = eval('(' + restoreObject.positionFunction + ')');
			}
			if (restoreObject.showFunction) {
				this.showFunction = eval('(' + restoreObject.showFunction + ')');
			}
		} catch (err) {
			alert(err);
			alert(this);
		}

		if (restoreObject.breakList) {
			this.breakList = [];
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
<<<<<<< HEAD
	}
=======
	} */
>>>>>>> newtestbranch

	/**
	 */
	resetVelocity() {
		this.velocity.x = 0;
		this.velocity.y = 0;
	}
	/** copy the values of a position to the node. This avoid having a strong relationship to the assigned position.
	 * @param  {Position} position
	 */
	copyPosition(position) {
		this.localPosition.x = position.x;
		this.localPosition.y = position.y;
<<<<<<< HEAD
=======
		if (this.parentTrussNode.gridSize && this.parentTrussNode.gridSize!='0') {
			let x=position.x + this.parentTrussNode.gridSize/2;
			let y=position.y + this.parentTrussNode.gridSize/2;
			this.localPosition.x= x - x%this.parentTrussNode.gridSize;
			this.localPosition.y= y - y%this.parentTrussNode.gridSize;
		}
>>>>>>> newtestbranch
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
<<<<<<< HEAD
			angle = tensor.getTensorAngle(this) - this.angle;
		}
		if (tensor.tensorType == TensorType.ABSORBER) {
			this.velocityBasedTensors.push(tensor);
		} else {
			this.positionBasedTensors.push(tensor);
		}
=======
			angle = NaN; // tensor.getTensorAngle(this) - this.angle;
		}
		// if (tensor.absorber) {
		//	this.velocityBasedTensors.push(tensor);
		// }
		this.connectedTensors.push(tensor);

>>>>>>> newtestbranch
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
			let a = l.findIndex((z) => z == o);
			if (a < 0) {
				return;
			}
			l.splice(a, 1);
		}
<<<<<<< HEAD

		if (tensor.tensorType == TensorType.ABSORBER) {
			supportRemove(tensor, this.velocityBasedTensors);
		} else {
			supportRemove(tensor, this.positionBasedTensors);
		}
	}

=======
		// supportRemove(tensor, this.velocityBasedTensors);
		supportRemove(tensor, this.connectedTensors);
	}

	/**
	 * replace by unreference
	 */
	xremoveFromWorld() {
		for (let label of this.labels) { // ensure no label points to this tensor
			label.clearOldReference(this);
		}
	};

	/** remove all references from labels to this object, thereby basically making it eligible for garbage collection
     *  All connected tensors should also be removed (or unreferenced, actually)
     */
	unreference() {
		super.unreference();
		for (let tensor of this.connectedTensors) {
			tensor.unreference(this);
		}
	}
>>>>>>> newtestbranch
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
<<<<<<< HEAD
		this.updateVelocity(this.positionBasedTensors, timeFactor);
=======
		this.updateVelocity(this.connectedTensors, timeFactor);
>>>>>>> newtestbranch
	}

	/**
	 * Update the rotation speed based on velocity based tensors
	 * @param {number} timeFactor
	 */
	updateFinalVelocity(timeFactor) {
<<<<<<< HEAD
		this.updateVelocity(this.velocityBasedTensors, timeFactor);
=======
		this.updateVelocity(this.connectedTensors, timeFactor, 1);
>>>>>>> newtestbranch
	}

	/**
	 * Update the rotation speed based on velocity based tensors
	 * @param {number} timeFactor
	 */
	updateFinalRotation(timeFactor) {
<<<<<<< HEAD
		this.updateRotation(this.positionBasedTensors, timeFactor);
=======
		this.updateRotation(this.connectedTensors, timeFactor);
>>>>>>> newtestbranch
	}

	/**
	 * is it possible to turn this node
	 * @return {number} timeFactor
	 */
	turnable() {
		return (this.torqueConstant && this.torqueConstant != 0);
	}

	/** Loop through all springs connected to this node and sum them p
	 * @return {number}
	 */
	calculateTorques() {
		this.sumTorque = 0;
		if (!this.turnable()) {
			return;
		}
<<<<<<< HEAD
		for (let tensor of this.positionBasedTensors) {
=======
		for (let tensor of this.connectedTensors) {
>>>>>>> newtestbranch
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
			this.turnrate += this.sumTorque / (this.mass * 1000);
		} else {
			this.turnrate = 0; // weightless cannot turn
		}
<<<<<<< HEAD
		this.turnrate = this.turnrate * 0.8;
=======
		// this.turnrate = this.turnrate * 0.8;
>>>>>>> newtestbranch
		this.angle += this.turnrate;
	}

	/**
	 * Calculate the final velocity
	 * @param {Array} forceAppliers
	 * @param {number} timeFactor
<<<<<<< HEAD
	 */
	updateVelocity(forceAppliers, timeFactor) {
		if (isNaN(this.mass)) return;
		let acceleration;
		if (forceAppliers.length > 0) {
			acceleration = this.getAcceleration(forceAppliers);
=======
	 * @param {number} velocityPhase
	 */
	updateVelocity(forceAppliers, timeFactor, velocityPhase) {
		if (isNaN(this.mass)) return;
		let acceleration;
		if (forceAppliers.length > 0) {
			acceleration = this.getAcceleration(forceAppliers, velocityPhase);
>>>>>>> newtestbranch
			this.acceleration=acceleration; // For debug display purpose
		} else {
			acceleration = new Vector(0, 0);
		}
		this.velocity = Vector.addVectors(Vector.multiplyVector(this.velocityLoss, this.velocity),
			Vector.multiplyVector(timeFactor, acceleration));
	}

	/**
	 * Sum all forces generated by the forceAppliers and divide by the mass to get the acceleration
	 * @param {Array} forceAppliers
<<<<<<< HEAD
	 * @return {Vector}
	 */
	getAcceleration(forceAppliers) {
		return Vector.divideVector(this.sumAllForces(forceAppliers), this.mass);
=======
	 * @param {number} velocityPhase
	 * @return {Vector}
	 */
	getAcceleration(forceAppliers, velocityPhase) {
		return Vector.divideVector(this.sumAllForces(forceAppliers, velocityPhase), this.mass);
>>>>>>> newtestbranch
	}

	/**
	 * Go through the list of all forceAppliers and sum them up
	 * @param  {Array} forceAppliers
<<<<<<< HEAD
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
=======
	 * @param {number} velocityPhase
	 * @return {Force}
	 */
	sumAllForces(forceAppliers, velocityPhase=0) {
		let result = new Force(0, 0);
		let applier;
		let tempForce;
		for (let applier of forceAppliers) {
			if (!velocityPhase || applier.velocityBasedTensors) {
				try {
					tempForce = applier.getForce(this);
					result.add(tempForce);
				} catch (err) {
					console.log(err);
				}
			}
>>>>>>> newtestbranch
		}
		return result;
	}

	/**
	 * @param  {number} type Where 0 is unselect, 1 means its pointed on and 2 is selected
	 */
	setHighlight(type) {
		this.highlighted = type;
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
<<<<<<< HEAD

		if (graphicDebugLevel >= 3) {
=======
		if (!this.visible || this.visible=='0') {
			return;
		}
		if (!this.color) {
			this.color='lightgrey';
		}
		cxt.strokeStyle = this.color;

		if (graphicDebugLevel >= 3) {
			if (this.pictureReference) {
				this.pictureShow(truss, time);
			}
>>>>>>> newtestbranch
			if (view.inside(this.getPosition())) {
				this.highLight(cxt);
				cxt.beginPath();
				if (this.mass) {
					view.drawCircle(this.getPosition(), 0.03 * this.massRadius);
				} else {
					view.drawLine(Vector.subtractVectors(this.getPosition(), new Position(0.1, 0.1)),
						Vector.addVectors(this.getPosition(), new Position(0.1, 0.1)));
					view.drawLine(Vector.addVectors(this.getPosition(), new Position(0.1, -0.1)),
						Vector.addVectors(this.getPosition(), new Position(-0.1, 0.1)));
				}
				cxt.stroke();
			}

			if (graphicDebugLevel >= 6) {
				cxt.beginPath();
				view.drawLine(this.getPosition(), Vector.addVectors(this.getPosition(),
					new Vector(0.2 * Math.cos(this.getAngle()), 0.2 * Math.sin(this.getAngle()))));
				cxt.stroke();

				cxt.strokeStyle = 'lightblue';
				cxt.beginPath();
				view.drawLine(this.getPosition(), Vector.addVectors(this.getPosition(), Vector.divideVector(this.velocity, 0.8)));
				cxt.stroke();

				if (graphicDebugLevel >= 7) {
					cxt.strokeStyle = 'red';
					cxt.beginPath();
					if (this.acceleration) {
<<<<<<< HEAD
						view.drawLine(this.getPosition(), Vector.addVectors(this.getPosition(), Vector.divideVector(this.acceleration, 4)));
=======
						view.drawLine(this.getPosition(),
							Vector.addVectors(this.getPosition(), Vector.divideVector(this.acceleration, 4)));
>>>>>>> newtestbranch
					}
					cxt.stroke();
				}
			}

			if (graphicDebugLevel >= 10) {
				cxt.beginPath();
<<<<<<< HEAD
				cxt.fillStyle = 'lightgreen';
				cxt.font = '10px Arial';
				cxt.textAlign = 'left';
				let textPos = this.getPosition();
				view.drawText(textPos, '('+Math.trunc(this.getPosition().x*100)/100+', '+
					Math.trunc(this.getPosition().x*100)/100+')');
=======
				cxt.fillStyle = this.color;
				cxt.font = '10px Arial';
				cxt.textAlign = 'left';
				let textPos = this.getPosition();
				view.drawText(textPos, '(' + Math.trunc(this.getPosition().x * 100) / 100 + ', ' +
						Math.trunc(this.getPosition().y * 100) / 100 + ')');
>>>>>>> newtestbranch
			}
		}
		if (graphicDebugLevel >= 1) {
			if (this.showFunction) {
				this.showFunction(this, time);
			}
		}
	}

<<<<<<< HEAD
=======

>>>>>>> newtestbranch
	/**
	 * @param  {Context} ctx
	 */
	highLight(ctx) {
		if (!this.highlighted) {
<<<<<<< HEAD
			ctx.strokeStyle = 'lightgrey';
=======
			ctx.strokeStyle = this.color;
>>>>>>> newtestbranch
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
<<<<<<< HEAD
=======

	/**
		 * @param  {string} pictureReference
		 */
	createHTMLPicture(pictureReference) {
		this.element = document.createElement('img');
		let tempElement = this.element;
		let tempParentElement= this.parentTrussNode.element;
		this.element.style.position = 'absolute';
		this.element.style.zIndex = '-1000';
		this.element.onerror = function() {
			tempParentElement.removeChild(tempElement);
		};
		this.element.src = 'Resources/' + pictureReference;
		// this.element.style.width = '100%';
		// this.element.style.height = '100%';
		this.element.style.left = 0;
		this.element.style.top = 0;
		tempParentElement.appendChild(this.element);

		this.setupScale();
		this.visible=true;
	}

	/**
	* @param {number} on
	*/
	setVisible(on) {
		if (on && !this.visible) {
			this.element.display='block';
			this.visible=true;
		} else if (!on && this.visible) {
			this.element.display='none';
			this.visible=false;
		}
	}

	/**
	 */
	setupScale() {
		if (this.pictureCornerLength) { // Is this really right and why does it cause performance hits
			return;
		}
		this.pictureHeight=this.element.offsetHeight;
		this.pictureWidth=this.element.offsetWidth;

		let multiplier = this.size / this.pictureWidth;
		let tempVectorToCorner = new Vector(multiplier * this.pictureHeight / 2, multiplier * this.pictureWidth / 2);
		this.pictureCornerAngle = tempVectorToCorner.getAngle();

		this.pictureCornerLength = Vector.length(tempVectorToCorner);
	}

	/**
	 * Draws a picture on a given Canvas. T
	 * @param  {truss} truss
	 * @param  {number} time
	 */
	pictureShow(truss, time) {
		this.setupScale();
		let a1 = new Vector(Math.cos(this.pictureCornerAngle+this.angle)*this.pictureCornerLength,
			Math.sin(this.pictureCornerAngle+this.angle)*this.pictureCornerLength);
		let b1 = new Vector(Math.cos(Math.PI-this.pictureCornerAngle+this.angle)*this.pictureCornerLength,
			Math.sin(Math.PI-this.pictureCornerAngle+this.angle)*this.pictureCornerLength);
		let c1 = new Vector(Math.cos(this.pictureCornerAngle-Math.PI+this.angle)*this.pictureCornerLength,
			Math.sin(this.pictureCornerAngle-Math.PI+this.angle)*this.pictureCornerLength);
		let d1 = new Vector(Math.cos(- this.pictureCornerAngle+this.angle)*this.pictureCornerLength,
			Math.sin(- this.pictureCornerAngle+this.angle)*this.pictureCornerLength);

		let a = Vector.addVectors(a1, this.localPosition);
		let b = Vector.addVectors(b1, this.localPosition);
		let c = Vector.addVectors(c1, this.localPosition);
		let d = Vector.addVectors(d1, this.localPosition);

		warpMatrix(truss, this, d, c, a, b, this. pictureWidth, this.pictureHeight);
	}
>>>>>>> newtestbranch
}

