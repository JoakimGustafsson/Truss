import { StoreableObject } from '../StoreableObject.js';
import { Position, Velocity, Vector, Force, serializeList, deserializeList, removeIfPresent } from '../Primitives.js';
import { universe, getPlane } from '../globals.js';
import { warpMatrix } from '../View/Pictures.js';
import { updateNodeRotation } from '../Behaviours/Angles.js';
import { evaluateScriptFunction } from '../Behaviours/Scripts.js';
import { createWorldCoordinateSystem, createDisplayCoordinateSystem } from './CoordinateSystem.js';
import { BehaviourOverride } from '../Behaviours/Behaviour.js';

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
		const initialAngularVelocity = this.angularVelocity;
		const initialTurnrate = this.turnrate;
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

		Object.defineProperty(this, 'turnrate', {
			get: function() {
				if (this._turnrate == undefined || Number.isNaN(this._turnrate)) {
					return 0;
				}
				return this._turnrate;
			},
			set: function(value) {
				this._turnrate = value;
			},
		});

		Object.defineProperty(this, 'angularVelocity', {
			get: function() {
				return this.turnrate * 180 / Math.PI / this.getAngularVelocityFrameDuration();
			},
			set: function(value) {
				this.turnrate = value * Math.PI / 180 * this.getAngularVelocityFrameDuration();
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

		if (initialAngularVelocity !== undefined && initialAngularVelocity !== null) {
			this.angularVelocity = initialAngularVelocity;
		} else if (initialTurnrate !== undefined && initialTurnrate !== null) {
			this.turnrate = initialTurnrate;
		}

		// Coordinate system property - determines rendering and physics behavior
		// - If explicitly set via coordinateSystem property in valueObject, returns that reference
		// - If not set, defaults to the world coordinate system from the view
		// - localPosition is agnostic of coordinate system - the coordinate system interprets it
		Object.defineProperty(this, 'coordinateSystem', {
			get: function() {
				// If explicitly set, return the direct reference
				if (this._coordinateSystem) {
					return this._coordinateSystem;
				}
				
				// Default to world coordinate system
				if (this.parentTrussNode && this.parentTrussNode.view && this.parentTrussNode.view.worldCoordinateSystem) {
					return this.parentTrussNode.view.worldCoordinateSystem;
				}
				
				// Fallback - log warning as this indicates a problem
				console.warn(`⚠️  Node ${this.name || 'unnamed'} could not get coordinate system - parentTrussNode or view not available`);
				return null;
			},
			set: function(value) {
				this._coordinateSystem = value;
			}
		});

		// Plane property - which plane this node belongs to (world, display, admin, etc)
		// - If node has a 'plane' label, reads its planeProperty to find the plane
		// - Otherwise defaults to world plane
		Object.defineProperty(this, 'plane', {
			get: function() {
				if (this._plane) {
					return this._plane;
				}
				
				// Check for plane label
				if (this.labels) {
					const planeLabel = this.labels.find(l => l.name === 'plane');
					if (planeLabel && planeLabel.planeProperty) {
						const plane = getPlane(planeLabel.planeProperty);
						this._plane = plane;
						return plane;
					}
				}
				
				// Default to world plane
				return getPlane('world');
			},
			set: function(value) {
				this._plane = value;
			}
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
	sense(deltaTime, truss) {
		this.runOverrides(BehaviourOverride.SENSE, deltaTime, truss);
	}

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

		representation.parentTrussNode = nodeList.indexOf(this.parentTrussNode);
		representation.localPosition = this.localPosition.serialize();
		representation.velocity = this.velocity.serialize();
		representation.mass = this.mass;
		representation.massRadius = this.massRadius;
		representation.angle = this.angle;
		representation.pictureReference = this.pictureReference;
		representation.size = this.size;
		representation.turnrate = this.turnrate;
		representation.torqueConstant = this.torqueConstant;
		representation.labelString=this.labelString;
		representation.connectedTensors = serializeList(this.connectedTensors, tensorList);
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
		representation.breakList = storeBreakList;

		return representation;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Node}
	 */
	deserialize(restoreObject, nodeList, tensorList) {
		super.deserialize(restoreObject, nodeList, tensorList);
		let parentIndex = restoreObject.parentTrussNode;
		if (parentIndex == undefined || parentIndex == null || parentIndex < 0) {
			this.parentTrussNode = this;
		} else if (nodeList[parentIndex]) {
			this.parentTrussNode = nodeList[parentIndex];
		} else {
			this.parentTrussNode = this;
		}

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
		if (restoreObject.angularVelocity !== undefined && restoreObject.angularVelocity !== null) {
			this.angularVelocity = restoreObject.angularVelocity;
		} else {
			this.turnrate = restoreObject.turnrate;
		}
		this.torqueConstant = restoreObject.torqueConstant;
		this.labelString = restoreObject.labelString;

		// Read connectedTensors (new format) or positionBasedTensors (old format) for backward compatibility
		const tensorIndices = restoreObject.connectedTensors || restoreObject.positionBasedTensors;
		this.connectedTensors = deserializeList(tensorIndices, tensorList);
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
	 * For display nodes, converts screen pixels to percentages based on coordinate system.
	 * @param  {Position} position - Position in appropriate coordinate space for this node
	 */
	copyPosition(position) {
		// For display nodes, position is in screen pixels and needs conversion to percentages
		if (this.coordinateSystem && this.coordinateSystem.isDisplay()) {
			const screenWidth = this.parentTrussNode.view.screenSize.x;
			const screenHeight = this.parentTrussNode.view.screenSize.y;
			this.localPosition.x = (position.x / screenWidth) * 100;
			this.localPosition.y = 100 - (position.y / screenHeight) * 100;  // Y is inverted
		} else {
			// For world nodes, just copy the position directly
			this.localPosition.x = position.x;
			this.localPosition.y = position.y;
		}
		
		// Apply grid snapping if enabled
		if (this.parentTrussNode.gridSize && this.parentTrussNode.gridSize != '0') {
			let x = this.localPosition.x + this.parentTrussNode.gridSize / 2;
			let y = this.localPosition.y + this.parentTrussNode.gridSize / 2;
			this.localPosition.x = x - x % this.parentTrussNode.gridSize;
			this.localPosition.y = y - y % this.parentTrussNode.gridSize;
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

	/**
	 * Angular velocity is edited in degrees per second, but stored internally per frame.
	 * @return {number}
	 */
	getAngularVelocityFrameDuration() {
		if (this.parentTrussNode && typeof this.parentTrussNode.timestep == 'number' && this.parentTrussNode.timestep > 0) {
			return this.parentTrussNode.timestep;
		}
		return 1 / 60;
	}

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
		return this.hasLabel('angle');
	}

	/** Compute torques from all registered TORQUE overrides (e.g. angle tensors, key input).
	 * AngleNode's override runs first (resets sumTorque, adds tensor contributions);
	 * any additional overrides (KeyToTorqueBehaviour etc.) add on top.
	 * @return {Array}
	 */
	calculateTorques() {
		return this.runOverrides(BehaviourOverride.TORQUE);
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
		
		// Check if node should have physics: either has velocityLoss, or has 'moveable' label
		let hasMoveable = this.labels && this.labels.some(label => label.name === 'moveable');
		if (this.velocityLoss === undefined && !hasMoveable) return;
		
		let acceleration;
		if (forceAppliers.length > 0) {
			acceleration = this.getAcceleration(forceAppliers, velocityPhase);
			this.acceleration=acceleration; // For debug display purpose
		} else {
			acceleration = new Vector(0, 0);
		}
		
		// Use velocityLoss if defined, otherwise default to 0.95 for moveable nodes
		let velocityLoss = this.velocityLoss !== undefined ? this.velocityLoss : 0.95;
		
		const dampedVelocity = Vector.multiplyVector(velocityLoss, this.velocity);
		const accelerationContribution = Vector.multiplyVector(timeFactor, acceleration);
		
		this.velocity = Vector.addVectors(dampedVelocity, accelerationContribution, 
			`updateVelocity node="${this.name}"`);
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
					console.error(`Failed to get force from tensor "${applier.name}" (node: "${this.name}"): ${err.message}`);
					console.error(`  Tensor node1: "${applier.node1?.name}", node2: "${applier.node2?.name}"`);
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

		// Render node using its coordinate system (world or display)
		let cs = this.coordinateSystem;
			if (cs) {
				const screenPos = cs.convertToScreenPixels(this);
			
				this.highLight(cxt);
			cxt.beginPath();
			if (this.mass && !isNaN(this.mass)) {
				cxt.arc(screenPos.x, screenPos.y, 4, 0, 2 * Math.PI);
			} else {
				// Draw crosshairs for nodes without mass
				cxt.moveTo(screenPos.x - 10, screenPos.y - 10);
				cxt.lineTo(screenPos.x + 10, screenPos.y + 10);
				cxt.moveTo(screenPos.x + 10, screenPos.y - 10);
				cxt.lineTo(screenPos.x - 10, screenPos.y + 10);
			}
			cxt.stroke();
			
			// For display nodes, skip world-coordinate debug rendering
			if (cs.isDisplay()) {
				return;
			}
		}

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
				// Draw angle indicator (only if angle is valid)
				const angle = this.getAngle();
				if (!isNaN(angle)) {
					cxt.beginPath();
					view.drawLine(this.getPosition(), Vector.addVectors(this.getPosition(),
						new Vector(0.2 * Math.cos(angle), 0.2 * Math.sin(angle)),
						`show() angle line node="${this.name}"`));
					cxt.stroke();
				}

				// Draw velocity indicator (only if velocity is valid)
				if (this.velocity && !isNaN(this.velocity.x) && !isNaN(this.velocity.y)) {
					cxt.strokeStyle = 'lightblue';
					cxt.beginPath();
					view.drawLine(this.getPosition(), Vector.addVectors(this.getPosition(), 
						Vector.divideVector(this.velocity, 0.8),
						`show() velocity line node="${this.name}"`));
					cxt.stroke();
				}

				// Draw acceleration indicator (only if acceleration is valid)
				if (graphicDebugLevel >= 7) {
					cxt.strokeStyle = 'red';
					cxt.beginPath();
					if (this.acceleration && !isNaN(this.acceleration.x) && !isNaN(this.acceleration.y)) {
						view.drawLine(this.getPosition(),
							Vector.addVectors(this.getPosition(), Vector.divideVector(this.acceleration, 4),
								`show() acceleration line node="${this.name}"`));
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
			// Hover: Orange glow
			ctx.strokeStyle = 'orange';
			ctx.shadowBlur = 40;
			ctx.lineWidth = 4;
			ctx.shadowColor = 'orange';
		} else if (this.highlighted == 2) {
			// Selected: Yellow glow (highest priority)
			ctx.strokeStyle = 'yellow';
			ctx.shadowBlur = 60;
			ctx.lineWidth = 6;
			ctx.shadowColor = 'yellow';
		} else if (this.highlighted == 3) {
			// Followed: Blue glow
			ctx.strokeStyle = '#00BFFF';
			ctx.shadowBlur = 50;
			ctx.lineWidth = 5;
			ctx.shadowColor = '#00BFFF';
		}
	}

	/**
		 * @param  {string} pictureReference
		 */
	createHTMLPicture(pictureReference) {
		this.element = document.createElement('img');
		let tempElement = this.element;
		let tempParentElement= this.parentTrussNode.element;
		this.element.classList.add('element-base');
		this.element.onerror = function() {
			tempParentElement.removeChild(tempElement);
		};
		this.element.src = 'Resources/' + pictureReference;
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
