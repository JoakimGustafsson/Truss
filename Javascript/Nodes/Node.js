import { StoreableObject } from '../StoreableObject.js';
import { Position, Velocity, Vector, Force, serializeList, deserializeList, removeIfPresent } from '../Primitives.js';
import { universe } from '../globals.js';
import { warpMatrix } from '../View/Pictures.js';
import { calculateNodeTorques, updateNodeRotation } from '../Behaviours/Angles.js';
import { evaluateScriptFunction } from '../Behaviours/Scripts.js';

/**
 * @class
 * @extends StoreableObject
 */
class Node extends StoreableObject {
	/**
	 * @param  {World} world
	 * @param  {TrussNode} parentTrussNode
	 * @param  {string} initialLabels
	 * @param  {object} valueObject
	 */
	constructor(world, parentTrussNode, initialLabels, valueObject) {
		super(world, initialLabels, valueObject);
		this.isNode = true;
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
	 * @param {TrussNode} truss
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

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Node}
	 */
	deserialize(restoreObject, nodeList, tensorList) {
		this.name = restoreObject.name;
		let parentIndex = restoreObject.parentTrussNode;
		if (parentIndex == undefined || parentIndex == null || parentIndex < 0) {
			this.parentTrussNode = this;
		} else if (nodeList[parentIndex]) {
			this.parentTrussNode = nodeList[parentIndex];
		} else {
			this.parentTrussNode = this;
		}

		this.localPosition = new Position().deserialize(restoreObject.localPosition);
		
		// Version migration: flip Y coordinates for old save files (Y-axis flip from screen to mathematical coords)
		// This migration runs automatically on first load of old saves
		if (restoreObject.localPosition && this.localPosition.y !== undefined && this.localPosition.y !== null) {
			// Old saves have Y positive downward; new system has Y positive upward
			// We flip by negating and adjusting relative to world size
			// Simple approach: negate Y to flip from screen to math coords
			this.localPosition.y = -this.localPosition.y;
		}
		
		if (!restoreObject.localPosition) {
			console.warn(`⚠️ Node deserialization: Node "${this.name}" has missing localPosition in save data`);
		} else if (isNaN(this.localPosition.x) || isNaN(this.localPosition.y)) {
			console.warn(`⚠️ Node deserialization: Node "${this.name}" has NaN position (${this.localPosition.x}, ${this.localPosition.y}). Resetting to (0, 0)`);
			this.localPosition.x = 0;
			this.localPosition.y = 0;
		} else {
			console.log(`✓ Node deserialized: "${this.name}" at (${this.localPosition.x.toFixed(2)}, ${this.localPosition.y.toFixed(2)}) [Y-axis flipped]`);
		}
		this.velocity = new Vector().deserialize(restoreObject.velocity);
		// Flip velocity Y for coordinate system migration
		if (restoreObject.velocity && this.velocity.y !== undefined && this.velocity.y !== null) {
			this.velocity.y = -this.velocity.y;
		}
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
				this.positionFunction = evaluateScriptFunction(restoreObject.positionFunction);
			}
			if (restoreObject.showFunction) {
				this.showFunction = evaluateScriptFunction(restoreObject.showFunction);
			}
		} catch (err) {
			console.error(`Failed to load script for node ${this.name}:`, err);
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
		return this;
	}

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
		if (isNaN(this.localPosition.x) || isNaN(this.localPosition.y)) {
			console.warn(`⚠️ Node.getPosition() called with NaN position on node "${this.name}". Resetting to (0, 0)`);
			this.localPosition.x = 0;
			this.localPosition.y = 0;
		}
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
		let velocityDelta = Vector.multiplyVector(timeFactor, this.velocity);
		if (isNaN(velocityDelta.x) || isNaN(velocityDelta.y)) {
			console.warn(`⚠️ Node.updatePosition() detected NaN velocity on node "${this.name}": velocity=(${this.velocity.x}, ${this.velocity.y}), delta=(${velocityDelta.x}, ${velocityDelta.y})`);
		} else {
			this.localPosition.add(velocityDelta);
		}
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
		return calculateNodeTorques(this);
	}

	/**
	 * Calculate the final rotation speed
	 * @param {Array} forceAppliers
	 * @param {number} timeFactor
	 */
	updateRotation(forceAppliers, timeFactor) {
		updateNodeRotation(this);
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
		
		// Use node's velocityLoss if it exists (set by label properties system)
		// Default to 1.0 (no velocity loss) if not set
		let velocityLossFactor = this.velocityLoss !== undefined ? this.velocityLoss : 1.0;
		
		this.velocity = Vector.addVectors(Vector.multiplyVector(velocityLossFactor, this.velocity),
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
					console.error(`Force calculation error for ${this.name} (applier: ${applier.name}):`, err);
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
	 * @param {TrussNode} truss
	 * @param {number} time
	 * @param {number} graphicDebugLevel
	 */
	/**
	 * Get position transformed for the appropriate coordinate system
	 * @param {View} view - The view/camera object
	 * @returns {Position} - Position in screen/render space
	 */
	getRenderPosition(view) {
		// Check if this node is in display coordinates
		let isDisplayCoordinates = false;
		if (this.labels && Array.isArray(this.labels)) {
			isDisplayCoordinates = this.labels.some(label => label.name === 'displaycoordinates');
		}

		let pos = this.getPosition();
		
		if (isDisplayCoordinates) {
			// Display coordinates: position is already in screen space, use directly
			return pos;
		} else {
			// World coordinates: position needs view transform to screen space
			// Use warpMatrix transform if available, otherwise use view methods
			return pos;  // Caller (view.drawCircle, etc) will apply view transforms
		}
	}

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

		// Check if this node is in display coordinates (not affected by zoom/pan)
		let isDisplayCoordinates = false;
		if (this.labels && Array.isArray(this.labels)) {
			isDisplayCoordinates = this.labels.some(label => label.name === 'displaycoordinates');
		}

		if (graphicDebugLevel >= 3) {
			if (this.pictureReference) {
				this.pictureShow(truss, time);
			}
			
			let pos = this.getPosition();
			
			// For display coords, always render; for world coords, check if in view
			if (isDisplayCoordinates || view.inside(pos)) {
				this.highLight(cxt);
				cxt.beginPath();
				
				if (isDisplayCoordinates) {
					// Display coordinates: render directly in screen space
					if (this.mass && !Number.isNaN(this.mass)) {
						cxt.arc(pos.x, pos.y, Math.max(3, 0.03 * this.massRadius), 0, 2 * Math.PI);
					} else {
						cxt.moveTo(pos.x - 2, pos.y - 2);
						cxt.lineTo(pos.x + 2, pos.y + 2);
						cxt.moveTo(pos.x + 2, pos.y - 2);
						cxt.lineTo(pos.x - 2, pos.y + 2);
					}
				} else {
					// World coordinates: use view transforms
					if (this.mass) {
						view.drawCircle(pos, 0.03 * this.massRadius);
					} else {
						view.drawLine(Vector.subtractVectors(pos, new Position(0.1, 0.1)),
							Vector.addVectors(pos, new Position(0.1, 0.1)));
						view.drawLine(Vector.addVectors(pos, new Position(0.1, -0.1)),
							Vector.addVectors(pos, new Position(-0.1, 0.1)));
					}
				}
				cxt.stroke();
			}

			if (graphicDebugLevel >= 6) {
				let pos = this.getPosition();
				cxt.beginPath();
				
				if (isDisplayCoordinates) {
					cxt.moveTo(pos.x, pos.y);
					cxt.lineTo(pos.x + 20 * Math.cos(this.getAngle()), 
						pos.y + 20 * Math.sin(this.getAngle()));
				} else {
					view.drawLine(pos, Vector.addVectors(pos,
						new Vector(0.2 * Math.cos(this.getAngle()), 0.2 * Math.sin(this.getAngle()))));
				}
				cxt.stroke();

				cxt.strokeStyle = 'lightblue';
				cxt.beginPath();
				
				if (isDisplayCoordinates) {
					cxt.moveTo(pos.x, pos.y);
					cxt.lineTo(pos.x + this.velocity.x * 0.5, pos.y + this.velocity.y * 0.5);
				} else {
					view.drawLine(pos, Vector.addVectors(pos, Vector.divideVector(this.velocity, 0.8)));
				}
				cxt.stroke();

				if (graphicDebugLevel >= 7) {
					cxt.strokeStyle = 'red';
					cxt.beginPath();
					if (this.acceleration) {
						if (isDisplayCoordinates) {
							cxt.moveTo(pos.x, pos.y);
							cxt.lineTo(pos.x + this.acceleration.x * 0.1,
								pos.y + this.acceleration.y * 0.1);
						} else {
							view.drawLine(pos,
								Vector.addVectors(pos, Vector.divideVector(this.acceleration, 4)));
						}
					}
					cxt.stroke();
				}
			}

			if (graphicDebugLevel >= 10) {
				let pos = this.getPosition();
				cxt.beginPath();
				cxt.fillStyle = this.color;
				cxt.font = '10px Arial';
				cxt.textAlign = 'left';
				
				if (isDisplayCoordinates) {
					cxt.fillText('(' + Math.trunc(pos.x) + ', ' + Math.trunc(pos.y) + ')', pos.x + 5, pos.y);
				} else {
					view.drawText(pos, '(' + Math.trunc(pos.x * 100) / 100 + ', ' +
						Math.trunc(pos.y * 100) / 100 + ')');
				}
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
	 * @param  {TrussNode} truss
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

export { Node };
