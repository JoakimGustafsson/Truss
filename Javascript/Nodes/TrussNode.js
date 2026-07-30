import { Node } from './Node.js';
import { View } from '../View/TrussView.js';
import { PropertyEditor } from '../View/ParameterEditor/PropertyEditor.js';
import { FPSdisplay, universe } from '../globals.js';
import { Position, Vector } from '../Primitives.js';
import { PanZoomHandler } from '../View/PanZoomHandler.js';

/**
 * @class
 * @extends Node
 */
class TrussNode extends Node {
	/** Create a node that can contain a Truss within itself.
	 * @param  {World} world
	 * @param  {TrussNode} parentTrussNode
	 * @param  {TrussNode} initialLabels
	 * @param  {Object} valueObject
	 * @param  {Position} startPosition
	 * @param  {Position} viewSize
	 * @param  {number} timestep
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {Element} displayDivName
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 */
	constructor(world, parentTrussNode, initialLabels, valueObject,
		startPosition = new Vector(0, 0), viewSize = new Vector(0, 0), timestep = 0.016,
		mass = 1, name = 'trussNode', ...args) {
		super(world, parentTrussNode, initialLabels, valueObject, startPosition, mass, name, ...args);

		this.world=world;
		this.sensorNodes=[];
		this.element = document.createElement('div');
		this.view= new View(viewSize, this);
		this.canvas = document.createElement('canvas');

		/** When true, xScale is forced equal to yScale (uniform/square world display). */
		this.lockedRatio = true;

		this.delta = 0;
		this.lastFrameTimeMs = 0;
		this.timestep = 1/60;
		this._fps = 60,
		this.framesThisSecond = 0,
		this.lastFpsUpdate = 0;


		this.selector=this;
		if (!parentTrussNode) {
			this.parentTrussNode=this;
		}

		Object.defineProperty(this, 'fps', {
			get: function() {
				return this._fps;
			},
			set: function(value) {
				this._fps = parseInt(value);
			},
		}
		);

		Object.defineProperty(this, 'nodes', {
			get: function() {
				return this.nodeLabel.getNodes();
			},
			set: function(value) {
				this.nodeLabel.addReference(value);
			},
		}
		);

		Object.defineProperty(this, 'tensors', {
			get: function() {
				return this.tensorLabel.getTensors();
			},
			set: function(value) {
				this.tensorLabel.addReference(value);
			},
		}
		);

		Object.defineProperty(this, 'fpsTarget', {
			get: function() {
				return 1/this.timestep;
			},
			set: function(value) {
				this.timestep = 1/parseInt(value);
			},
		}
		);

		Object.defineProperty(this, 'worldSize', {
			get: function() {
				return this.view.worldViewSize;
			},
			set: function(value) {
				this.view.worldViewSize = value;
			},
		}
		);
		Object.defineProperty(this, 'screenSize', {
			get: function() {
				return this.view.screenSize;
			},
			set: function(value) {
				this.view.screenSize = value;
			},
		}
		);
		Object.defineProperty(this, 'worldOffset', {
			get: function() {
				return this.view.offset;
			},
			set: function(value) {
				this.view.offset = value;
			},
		}
		);

		// Backward-compat alias so old save files (and label system) can still set it
		Object.defineProperty(this, 'setWorldOffset', {
			get: function() {
				return this.view.offset;
			},
			set: function(value) {
				this.view.offset = value;
			},
		}
		);

		if (world) {
			this.handleCanvas();
			this.setView();
			this.setupLabels(world);
		}

		this.propertyDiv = this.element.querySelectorAll('#configview')[0];
		this.debugLevel = this.element.querySelectorAll('#debugLevel')[0];
	}

	/**
	 *
	 */
	handleCanvas() {
		this.canvas.name = this.name;
		this.canvas.style.position = 'absolute';
		this.canvas.style.top = '0px';
		this.canvas.style.left = '0px';
		this.canvas.style.display = 'block';
		this.element.style.position = 'relative';
		this.element.appendChild(this.canvas);
	}

	/**
	 * @param  {View} view
	 */
	setView() {
		this.view.context = this.canvas.getContext('2d');
		// Ensure canvas has valid dimensions before setting
		const width = this.view.screenSize.x || 1123;
		const height = this.view.screenSize.y || 974;
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.style.width = width + 'px';
		this.canvas.style.height = height + 'px';

		this.editWindow = new PropertyEditor(this, new Position(100, 100), 500, 500);
		this.panZoom = new PanZoomHandler(this);
	}

	/**
	 * @param  {World} world
	 * @param  {Array} superTensorList
	 */
	setupLabels(world) {
		this.tensorLabel = world.labels.findLabel('tensor');
		this.nodeLabel = world.labels.findLabel('node');
		this.sensorLabel = world.labels.findLabel('sensor');
		this.angleLabel = world.labels.findLabel('angle');
		this.moveableLabel = world.labels.findLabel('moveable');
		this.pullSpringLabel = world.labels.findLabel('pullspring');
		this.pushSpringLabel = world.labels.findLabel('pushspring');
		this.fieldLabel = world.labels.findLabel('field');
		this.absorberLabel = world.labels.findLabel('absorber');
		this.springLabel = world.labels.findLabel('spring');
	}

	/**
	 * @param  {Array} superNodeList
	 * @param  {Array} superTensorList
	 * @return {Object}
	 */
	serialize(superNodeList=[], superTensorList=[]) {
		let representationObject = super.serialize(superNodeList, superTensorList);
		representationObject.classname = 'TrussNode';
		// Save the world/screen ratio so the view can be restored correctly on any screen size
		if (this.view.screenSize.x && this.view.screenSize.y) {
			representationObject.ratio = {
				x: this.view.screenSize.x / this.view.worldViewSize.x,
				y: this.view.screenSize.y / this.view.worldViewSize.y,
			};
		}
		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} superNodes
	 * @param  {Array} superTensors
	 */
	deserialize(restoreObject, superNodes, superTensors) {
		super.deserialize(restoreObject, superNodes, superTensors);

		if (restoreObject.worldSize) {
			this.view.setWorldViewSize(new Vector().deserialize(restoreObject.worldSize));
		} else if (restoreObject.ratio && this.view.screenSize.x && this.view.screenSize.y) {
			// Backward compatibility: older saves used ratio instead of worldSize.
			// Support both ratio conventions seen in legacy data.
			let ratioX = Number(restoreObject.ratio.x);
			let ratioY = Number(restoreObject.ratio.y);
			if (ratioX > 0 && ratioY > 0) {
				let worldX;
				let worldY;
				if (ratioX > 1 || ratioY > 1) {
					worldX = this.view.screenSize.x / ratioX;
					worldY = this.view.screenSize.y / ratioY;
				} else {
					worldX = this.view.screenSize.x * ratioX;
					worldY = this.view.screenSize.y * ratioY;
				}
				if (isFinite(worldX) && isFinite(worldY) && worldX > 0 && worldY > 0) {
					this.view.setWorldViewSize(new Vector(worldX, worldY));
				}
			}
		}
		// Support both current name and legacy save-file key
		const offsetData = restoreObject.worldOffset || restoreObject.setWorldOffset;
		if (offsetData) {
			const offsetVec = new Vector().deserialize(offsetData);
			// Flip Y offset for coordinate system migration (old saves have Y positive downward)
			offsetVec.y = -offsetVec.y;
			this.view.setOffset(offsetVec);
		}
		if (restoreObject.fpsTarget !== undefined && restoreObject.fpsTarget !== null) {
			this.fpsTarget = restoreObject.fpsTarget;
		}
		if (restoreObject.fps !== undefined && restoreObject.fps !== null) {
			this.fps = restoreObject.fps;
		}
		if (restoreObject.gridSize !== undefined && restoreObject.gridSize !== null) {
			this.gridSize = restoreObject.gridSize;
		}

		this.handleCanvas();
		this.setView();
		// Pass scale=true so resize() just reads the live DOM without adjusting worldViewSize
		this.resize(true);
		if (this.world) {
			this.setupLabels(this.world);
		}
	}

	/**
	 * @param  {ElementSelector} elementSelector
	 * @return {Element}
	 */
	getElement(elementSelector) {
		return this.element.querySelectorAll(elementSelector)[0];
	}

	/**
	 * @param  {ElementSelector} elementSelector
	 * @return {ElementList}
	 */
	getElements(elementSelector) {
		return this.element.querySelectorAll(elementSelector);
	}

	/**
	 *
	 */
	clean() {
		if (this.element) {
			this.element.innerHTML='';
		}
	}

	/**
	 * Call this before discarding to remove nodes and event listeners
	 */
	close() {
		this.editWindow.close();
	}

	/**
 */
	resize(scale) {
		// Don't resize if screenSize would become 0 (can happen during layout changes)
		const newWidth = this.element.clientWidth || this.element.offsetWidth;
		const newHeight = this.element.clientHeight || this.element.offsetHeight;
		
		if (newWidth === 0 || newHeight === 0) {
			// Skip resize with 0 dimensions
			return;
		}
		
		// Only update view resize, never change canvas dimensions during zoom/pan
		// Canvas dimensions should be set once during initialization
		this.view.resize(scale);
	}

	/**
	 * Recursively call tick() on the sub-Truss and then update this nodes position
	 * @param {number} time
	 * @param {number} delta
	 */
	updatePosition(time, delta) {
		// this.tick(time, delta);
		super.updatePosition(time, delta); // Call parent in order to update this nodes position
	};

	/** Displays the Truss's canvas at the correct position
	 * @param  {TrussNode} truss
	 * @param  {number} time
	 * @param  {number} graphicDebugLevel=0
	 */
	show(truss, time, graphicDebugLevel = 0) {
		this.highLight(this.view.context);
		// Canvas stays fixed at top-left (0px, 0px) - pan/zoom moves world content, not canvas
	};


	/* *********************************************************************************** */
	/* *********************************************************************************** */
	/* *********************************************************************************** */
	/* *********************************************************************************** */


	/**
	 */
	hideEdit() {
		this.editWindow.removeBanner(this);
	}

	/**
	 * Add a node to the truss and it will be updated at ticks and displayed
	 * @param  {Node} node
	 * @return {Node}
	 *
	addNode(node) {
		//this.nodes=node;
		return node;
	};

	/**
	 * Remove a node from the truss so it will not any longer be updated at ticks and displayed
	 * @param  {Node} node
	 *
	removeNode(node) {
		this.nodeLabel.clearOldReference(node);
		node.removeFromWorld();

		for (let tensor of node.connectedTensors) {
			this.removeTensor(tensor);
		}
	}; */

	/**
	 * @param  {Tensor} tensor
	 * @return {Tensor}
	 */
	xremoveTensor(tensor) {
		removeIfPresent(tensor, this.connectedTensors);
		tensor.removeFromWorld();
		return tensor;
	};

	/**
	 * Calculate all forces caused by a Nodes position.
	 * For example, Springs or Fields are position based force appliers.
	 * @param {number} deltaTime
	 */
	calculatePositionBasedForces(deltaTime) {
		for (let tensor of this.pullSpringLabel.getTensors()) {
			tensor.calculateForcePull(deltaTime);
		}
		for (let tensor of this.pushSpringLabel.getTensors()) {
			tensor.calculateForcePush(deltaTime);
		}
		for (let tensor of this.fieldLabel.getTensors()) {
			tensor.calculateForceField(deltaTime);
		}
		for (let tensor of this.springLabel.getTensors()) {
			tensor.calculateForceSpring(deltaTime);
		}
	};

	/**
	 * Calculate all forces caused by a Nodes velocity.
	 * For example, Absorbers (dampeners) generate a force based on two nodes relative velocity.
	 * @param {number} deltaTime
	 */
	calculateVelocityBasedForces(deltaTime) {
		for (let tensor of this.absorberLabel.getTensors()) {
			tensor.calculateForceAbsorber(deltaTime);
		}
	};

	/**
	 * Update all nodes velocities based on Position based forces
	 * @param {number} deltaTime
	 */
	calculatePositionBasedVelocities(deltaTime) {
		for (let node of this.moveableLabel.getNodes()) {
			node.updatePositionBasedVelocity(deltaTime);
		}
	};

	/**
	 * Update all nodes velocities based on Velocity based forces
	 * @param {number} deltaTime
	 */
	calculateTorques(deltaTime) {
		for (let node of this.angleLabel.getNodes()) {
			node.calculateTorques(deltaTime);
		}
	};

	/**
	 * Update all nodes rotations
	 * @param {number} deltaTime
	 */
	calculateRotation(deltaTime) {
		for (let node of this.moveableLabel.getNodes()) {
			node.updateFinalRotation(deltaTime);
		}
	};

	/**
	 * Update all nodes velocities based on Velocity based forces
	 * @param {number} deltaTime
	 */
	calculateDampenedVelocity(deltaTime) {
		for (let node of this.absorberLabel.getNodes()) {
			node.updateFinalVelocity(deltaTime);
		}
	};

	/**
	 * Loop through all nodes and move them according to their velocity
	 * @param {number} trussTime
	 * @param {number} deltaTime
	 */
	updatePositions(trussTime, deltaTime) {
		for (let node of this.moveableLabel.getNodes()) {
			node.updatePosition(trussTime, deltaTime);
		}
	};

	/**
	 * Add a node to the list of nodes that should be checked if the collide with a tensor
	 * @param  {Node} sensorNode
	 *
	addSensor(sensorNode) {
		this.sensorNodes.push(sensorNode);
	};

	/**
	 * Remove a node to the list of nodes that should be checked if the collide with a tensor
	 * @param  {Node} sensorNode
	 *
	removeSensor(sensorNode) {
		removeIfPresent(sensorNode, this.sensorNodes);
	}; */

	/**
	 * Go through all sensors added by addSensor() and trigger the sense() function
	 * @param {number} deltaTime
	 */
	sense(deltaTime) {
		for (let sensorNode of this.sensorLabel.getNodes()) {
			sensorNode.sense(deltaTime, this);
		}
	}

	/**
	 * The main function for calculating all forces, applying them to modify the velocities
	 * and consequently updating the node positions. Finally we check for collisions
	 *
	 * The reson for separating Position based and Velocity based forces and velocities
	 * is in order to avoid oscillation as much as possible
	 * @param {number} trussTime
	 * @param {number} deltaTime
	 */
	calculate(trussTime, deltaTime) {
		if (!this.paused) {
			this.calculateTorques(deltaTime);
			this.calculatePositionBasedForces(deltaTime);
			this.calculatePositionBasedVelocities(deltaTime);
			this.calculateVelocityBasedForces(deltaTime);
			this.calculateDampenedVelocity(deltaTime);
			this.calculateRotation(deltaTime);

			this.updatePositions(trussTime, deltaTime);
		}
		this.sense(deltaTime);
	}

	/**
	 * Clear the screen
	 */
	clear() {
		this.view.context.clearRect(0, 0, this.view.screenSize.x, this.view.screenSize.y);
	};

	/**
	 * @param  {Position} position - Position in SCREEN coordinates (pixels)
	 * @param  {number} maxDistance
	 * @param  {Node} avoid
	 * @param  {View} view - Optional View to convert screen to world coordinates
	 * @return {Object}
	 */
	getClosestObject(position, maxDistance, avoid, view) {
		let lowestDistance = 1000000000;
		let closest;
		
		for (let node of this.nodes) {
			// Check if node is in display coordinate system
			let nodeCoordLabel = node.labels && node.labels.find(l => l.name === 'coordinatesystem');
			let nodeIsDisplay = nodeCoordLabel && nodeCoordLabel.coordinatesystemProperty === 'display';
			
			let nodePos;
			if (nodeIsDisplay) {
				// For display nodes, input position is already in screen pixels
				// Convert node's display position percentages to screen pixels
				let screenX = (node.displayPositionX / 100) * this.view.screenSize.x;
				let screenY = this.view.screenSize.y - (node.displayPositionY / 100) * this.view.screenSize.y;
				nodePos = new Position(screenX, screenY);
			} else {
				// For world nodes, convert input screen position to world coordinates first
				let worldPos = view ? view.worldPositionWithOffset(position.x, position.y) : position;
				nodePos = this.view.screenPosition(node.getPosition());
				// Now we need to compare in world space, so use node's actual world position
				if (Position.distance(worldPos, node.getPosition()) < lowestDistance && node != avoid) {
					lowestDistance = Position.distance(worldPos, node.getPosition());
					closest = node;
				}
				continue; // Skip the distance calculation below for world nodes
			}
			
			if (Position.distance(position, nodePos) < lowestDistance && node != avoid) {
				lowestDistance = Position.distance(position, nodePos);
				closest = node;
			}
		}
		
		for (let tensor of this.tensors) {
			// Similar check for tensors - if both nodes are display coordinates
			let node1CoordLabel = tensor.node1 && tensor.node1.labels && tensor.node1.labels.find(l => l.name === 'coordinatesystem');
			let node2CoordLabel = tensor.node2 && tensor.node2.labels && tensor.node2.labels.find(l => l.name === 'coordinatesystem');
			let node1IsDisplay = node1CoordLabel && node1CoordLabel.coordinatesystemProperty === 'display';
			let node2IsDisplay = node2CoordLabel && node2CoordLabel.coordinatesystemProperty === 'display';
			
			let tensorPos;
			if (node1IsDisplay && node2IsDisplay) {
				// Both ends in display space - compute midpoint in screen pixels
				let screenX1 = (tensor.node1.displayPositionX / 100) * this.view.screenSize.x;
				let screenY1 = this.view.screenSize.y - (tensor.node1.displayPositionY / 100) * this.view.screenSize.y;
				let screenX2 = (tensor.node2.displayPositionX / 100) * this.view.screenSize.x;
				let screenY2 = this.view.screenSize.y - (tensor.node2.displayPositionY / 100) * this.view.screenSize.y;
				tensorPos = new Position((screenX1 + screenX2) / 2, (screenY1 + screenY2) / 2);
				
				if (Position.distance(position, tensorPos) < lowestDistance && tensor != avoid) {
					lowestDistance = Position.distance(position, tensorPos);
					closest = tensor;
				}
			} else {
				// World coordinate tensor - convert screen position to world first
				let worldPos = view ? view.worldPositionWithOffset(position.x, position.y) : position;
				if (Position.distance(worldPos, tensor.getPosition()) < lowestDistance && tensor != avoid) {
					lowestDistance = Position.distance(worldPos, tensor.getPosition());
					closest = tensor;
				}
			}
		}
		
		if (lowestDistance > maxDistance) {
			return;
		}
		return closest;
	}

	/**
	 */
	togglePause() {
		if (!this.paused) {
			this.delta = -1;
			this.paused = true;
		} else {
			this.paused = false;
		}
	}

	/**
	 * The truss main tick function. this function is called to generate
	 * a timestep in which the modelled world moves slightly forward.
	 *
	 * This also contains a debuging part that displays time in the console window.
	 * @param {number} timestamp
	 */
	tick(timestamp) {
		// Track the accumulated time that hasn't been simulated yet
		this.delta += timestamp - this.lastFrameTimeMs; // note += here
		this.lastFrameTimeMs = timestamp;

		// console.log(this.delta);

		if (this.delta > 0.2) {
			this.delta = 0;
		}

		// Simulate the total elapsed time in fixed-size chunks
		while (this.delta >= this.timestep) {
			this.calculate(timestamp - this.delta, this.timestep / 2);
			this.delta -= this.timestep;
		}

		this.clear();
		this.showTruss(timestamp);

		/* 	if (timestamp > this.lastFpsUpdate + 1) { // update every second
			this.fps = 0.25 * this.framesThisSecond + (1 - 0.25) * this.fps; // compute the new FPS

			this.lastFpsUpdate = timestamp;
			this.framesThisSecond = 0;
			if (FPSdisplay) {
				FPSdisplay.innerHTML= Math.round(this.fps);
			}
		} */
		this.framesThisSecond++;
	}

	/**
	 * The Show function ask all tensors and nodes to draw themselves
	 * @param  {number} time
	 * @param  {number} graphicDebugLevel
	 */
	showTruss(time, graphicDebugLevel) {
		let resolvedDebugLevel = Number(graphicDebugLevel);
		if (isNaN(resolvedDebugLevel)) {
			resolvedDebugLevel = Number(universe.currentWorld && universe.currentWorld.debugLevel);
		}
		if (isNaN(resolvedDebugLevel)) {
			resolvedDebugLevel = 5;
		}

		for (let tensor of this.tensors) {
			tensor.show(this, resolvedDebugLevel);
		}

		for (let node of this.nodes) {
			node.show(this, time, resolvedDebugLevel);
		}
		
		// Draw finger position indicators for debugging
		if (this.panZoom && this.panZoom.fingerWorldPositions.length > 0) {
			// Draw world-space circles (small, colored)
			this.view.drawFingerIndicators(this.panZoom.fingerWorldPositions);
			
			// Draw screen-space circles (larger, at screen level to show tracking)
			const screenPositions = Array.from(this.panZoom.activePointers.values());
			this.view.drawFingerScreenIndicators(screenPositions);
		}
	}
}

export { TrussNode };
