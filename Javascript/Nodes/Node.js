/**
 * @class
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
				if (this.angle==undefined) {
					return 0;
				}
				return Math.round(this.angle * 180 / (Math.PI));
			},
			set: function(value) {
				this.angle = value * Math.PI / 180;
			},
		});

		if (this.pictureReference) {
			this.createHTMLPicture(this.pictureReference);
		}

		this.initialRefresh();
	}

	/**
	 * @return {Element}
	 */
	generateHTML() {
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

		for (let tensor of this.connectedTensors) {
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
			let previousSelectedObject = universe.selectedObject;
			universe.selectedObject = node1;
			let event = new CustomEvent('selectionEvent', {
				detail: {
					'selectedObject': universe.selectedObject,
					'previousSelectedObject': previousSelectedObject,
					'truss': undefined,
				},
				bubbles: true,
				cancelable: true,
			});
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
	 * @param  {number} ignoreLabels
	 * @return {Property}
	 */
	populateProperties(element, ignoreLabels) {
		return this.properties.populateProperties(element, this, ignoreLabels);
	}


	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		let representation = super.serialize(nodeList, tensorList);
		representation.classname='Node';

		/*
		representation.name = this.name;
		representation.parentTrussNode = nodeList.indexOf(this.parentTrussNode);
		representation.localPosition = this.localPosition.serialize();
		representation.velocity = this.velocity.serialize();
		representation.mass = this.mass;
		representation.massRadius = this.massRadius;
		representation.angle = this.angle;
		// representation.color = this.color;
		representation.pictureReference = this.pictureReference;
		representation.size = this.size;
		representation.turnrate = this.turnrate;
		representation.torqueConstant = this.torqueConstant;
		representation.labelString=this.labelString;
		// representation.velocityBasedTensors = serializeList(this.velocityBasedTensors, tensorList);
		representation.positionBasedTensors = serializeList(this.connectedTensors, tensorList);
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
		representation.breakList = storeBreakList; */

		return representation;
	}

	/*
	 * @param  {Object} restoreObject
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 *
	deserialize(restoreObject, nodeList, tensorList) {
		this.name = restoreObject.name;
		this.parentTrussNode = nodeList[restoreObject.parentTrussNode];

		this.localPosition = new Position().deserialize(restoreObject.localPosition);
		this.velocity = new Vector().deserialize(restoreObject.velocity);
		this.mass = restoreObject.mass;
		if (!this.mass) {
			this.mass = NaN;
		}
		this.massRadius = restoreObject.massRadius;
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
	} */

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
		if (this.parentTrussNode.gridSize && this.parentTrussNode.gridSize!='0') {
			let x=position.x + this.parentTrussNode.gridSize/2;
			let y=position.y + this.parentTrussNode.gridSize/2;
			this.localPosition.x= x - x%this.parentTrussNode.gridSize;
			this.localPosition.y= y - y%this.parentTrussNode.gridSize;
		}
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
			angle = NaN; // tensor.getTensorAngle(this) - this.angle;
		}
		// if (tensor.absorber) {
		//	this.velocityBasedTensors.push(tensor);
		// }
		this.connectedTensors.push(tensor);

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
		this.updateVelocity(this.connectedTensors, timeFactor);
	}

	/**
	 * Update the rotation speed based on velocity based tensors
	 * @param {number} timeFactor
	 */
	updateFinalVelocity(timeFactor) {
		this.updateVelocity(this.connectedTensors, timeFactor, 1);
	}

	/**
	 * Update the rotation speed based on velocity based tensors
	 * @param {number} timeFactor
	 */
	updateFinalRotation(timeFactor) {
		this.updateRotation(this.connectedTensors, timeFactor);
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
		for (let tensor of this.connectedTensors) {
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
		// this.turnrate = this.turnrate * 0.8;
		this.angle += this.turnrate;
	}

	/**
	 * Calculate the final velocity
	 * @param {Array} forceAppliers
	 * @param {number} timeFactor
	 * @param {number} velocityPhase
	 */
	updateVelocity(forceAppliers, timeFactor, velocityPhase) {
		if (isNaN(this.mass)) return;
		let acceleration;
		if (forceAppliers.length > 0) {
			acceleration = this.getAcceleration(forceAppliers, velocityPhase);
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
	 * @param {number} velocityPhase
	 * @return {Vector}
	 */
	getAcceleration(forceAppliers, velocityPhase) {
		return Vector.divideVector(this.sumAllForces(forceAppliers, velocityPhase), this.mass);
	}

	/**
	 * Go through the list of all forceAppliers and sum them up
	 * @param  {Array} forceAppliers
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
						view.drawLine(this.getPosition(),
							Vector.addVectors(this.getPosition(), Vector.divideVector(this.acceleration, 4)));
					}
					cxt.stroke();
				}
			}

			if (graphicDebugLevel >= 10) {
				cxt.beginPath();
				cxt.fillStyle = this.color;
				cxt.font = '10px Arial';
				cxt.textAlign = 'left';
				let textPos = this.getPosition();
				view.drawText(textPos, '(' + Math.trunc(this.getPosition().x * 100) / 100 + ', ' +
						Math.trunc(this.getPosition().y * 100) / 100 + ')');
			}
		}
		if (graphicDebugLevel >= 1) {
			if (this.showFunction) {
				this.showFunction(this, time);
			}
		}
	}

	/**
	 * @param  {Context} ctx
	 */
	highLight(ctx) {
		if (!this.highlighted) {
			ctx.strokeStyle = this.color;
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
}

