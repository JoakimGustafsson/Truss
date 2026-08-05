import { Node } from './Node.js';
import { View } from '../View/TrussView.js';
import { PropertyEditor } from '../View/ParameterEditor/PropertyEditor.js';
import { FPSdisplay, universe } from '../globals.js';
import { Position, Vector } from '../Primitives.js';
import { PanZoomHandler } from '../View/PanZoomHandler.js';
import { getClosestObject as getClosestDisplayObject, getDisplayPosition as getDisplayObjectPosition } from '../View/DisplayPicking.js';
import { BehaviourOverride } from '../Behaviours/Behaviour.js';

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
		
		// Track mouse position for display coordinate debugging
		this.mouseDisplayPos = new Position(0, 0);

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
		this.canvas.classList.add('canvas-base');
		this.element.classList.add('element-relative');
		this.element.appendChild(this.canvas);
	}

	/**
	 * @param  {View} view
	 */
	setView() {
		this.view.context = this.canvas.getContext('2d');
		
		// Get container dimensions and position from the element
		// The canvas will always match the container size exactly
		const containerRect = this.element.getBoundingClientRect();
		const width = Math.max(containerRect.width, 856) || 856;  // Minimum 856
		const height = Math.max(containerRect.height, 972) || 972;  // Minimum 972
		
		// Store container's viewport position for coordinate calculations
		this.view.elemRectleft = containerRect.left;
		this.view.elemRecttop = containerRect.top;
		
		// Update canvas internal dimensions (affects rendering)
		this.canvas.width = Math.floor(width);
		this.canvas.height = Math.floor(height);
		
		// Update canvas display dimensions (affects layout)
		this.canvas.style.width = width + 'px';
		this.canvas.style.height = height + 'px';
		
		// Update view screen size to match canvas
		this.view.screenSize.x = Math.floor(width);
		this.view.screenSize.y = Math.floor(height);
		
		// Add ResizeObserver to update canvas when container is resized
		if (!this.resizeObserver) {
			this.resizeObserver = new ResizeObserver(() => {
				this.updateCanvasSize();
			});
			this.resizeObserver.observe(this.element);
		}

		this.editWindow = new PropertyEditor(this, new Position(100, 100), 500, 500);
		this.panZoom = new PanZoomHandler(this);
	}

	/**
	 * Updates canvas size when container is resized
	 */
	updateCanvasSize() {
		const containerRect = this.element.getBoundingClientRect();
		const width = Math.max(containerRect.width, 856) || 856;
		const height = Math.max(containerRect.height, 972) || 972;
		
		// Store container's viewport position for coordinate calculations
		this.view.elemRectleft = containerRect.left;
		this.view.elemRecttop = containerRect.top;
		
		if (this.canvas.width !== Math.floor(width) || this.canvas.height !== Math.floor(height)) {
			this.canvas.width = Math.floor(width);
			this.canvas.height = Math.floor(height);
			this.canvas.style.width = width + 'px';
			this.canvas.style.height = height + 'px';
			
			// Update view screen size
			this.view.screenSize.x = Math.floor(width);
			this.view.screenSize.y = Math.floor(height);
		}
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
	 * Run PREUPDATEPOSITION overrides on all tensors before physics calculations.
	 * Used by behaviours like KeyToLengthBehaviour that modify tensor properties
	 * (e.g. equilibriumLength) each step at a rate × deltaTime.
	 * @param {number} deltaTime
	 */
	applyTensorPreUpdates(deltaTime) {
		for (let tensor of this.tensorLabel.getTensors()) {
			tensor.runOverrides(BehaviourOverride.PREUPDATEPOSITION, deltaTime);
		}
	}

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
			this.applyTensorPreUpdates(deltaTime);
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
	 * @param  {number} maxDisplayDistance
	 * @param  {Node} avoid
	 * @return {Object}
	 */
	getClosestObject(maxDisplayDistance = 3, avoid) {
		return getClosestDisplayObject(this, maxDisplayDistance, avoid);
	}

	/**
	 * Project an object's position onto the display plane in percentages.
	 * @param  {Object} object
	 * @return {Position}
	 */
	getDisplayPosition(object) {
		return getDisplayObjectPosition(this, object);
	}

	/**
	 * Update highlighting for all nodes based on current universe state
	 * Priority: selected (2) > hover (1) > followed (3) > none (0)
	 * Called every frame to keep highlighting synchronized with selection/hover/follow state
	 */
	updateNodeHighlighting() {
		if (!universe) return;

		for (let node of this.nodes) {
			let highlightLevel = 0;
			
			// Priority 1 (highest): Selected node
			if (universe.selectedObject === node) {
				highlightLevel = 2;
			}
			// Priority 2: Hovered node (only if not selected)
			else if (universe.hoveredNode === node) {
				highlightLevel = 1;
			}
			// Priority 3: Followed node (only if not selected or hovered)
			else if (universe.followedNode === node) {
				highlightLevel = 3;
			}
			
			node.setHighlight(highlightLevel);
		}

		for (let tensor of this.tensors) {
			let highlightLevel = 0;
			
			// Priority 1 (highest): Selected tensor
			if (universe.selectedObject === tensor) {
				highlightLevel = 2;
			}
			// Priority 2: Hovered tensor (only if not selected)
			else if (universe.hoveredNode === tensor) {
				highlightLevel = 1;
			}
			// Priority 3: Followed tensor (only if not selected or hovered)
			else if (universe.followedNode === tensor) {
				highlightLevel = 3;
			}
			
			tensor.setHighlight(highlightLevel);
		}
	}

	/**
	 * Update camera offset to center the followed object on screen.
	 * Called after physics completes but before rendering to keep offset synchronized.
	 * @param {Node|Tensor} followedObject - The object to follow
	 */
	updateCameraFollow(followedObject) {
		// followedObject can be either a Node or a Tensor
		let targetNode = followedObject;
		if (followedObject && followedObject.node1) {
			targetNode = followedObject.node1;
		}
		
		if (!targetNode || !targetNode.localPosition) {
			return;
		}

		const worldPos = targetNode.localPosition;
		const screenCenterX = this.view.element.clientWidth / 2;
		const screenCenterY = this.view.element.clientHeight / 2;
		
		// Calculate required offset to center object at screen center
		// screenX = (worldX - offset.x) / xScale
		// Solving for offset.x: offset.x = worldX - screenCenterX * xScale
		const targetOffsetX = worldPos.x - screenCenterX * this.view.xScale;
		const targetOffsetY = worldPos.y + screenCenterY * this.view.yScale;
		
		// Apply offset directly - no smoothing
		// Physics and offset calculation happen in the same frame before rendering
		this.view.offset.x = targetOffsetX;
		this.view.offset.y = targetOffsetY;
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
		// Physics will run 0, 1, 2, or more times depending on frame timing
		while (this.delta >= this.timestep) {
			this.calculate(timestamp - this.delta, this.timestep / 2);
			this.delta -= this.timestep;
		}
		
		// Update camera follow after physics but before rendering
		// This ensures offset and rendered world are synchronized in the same frame
		if (universe && universe.followedNode) {
			this.updateCameraFollow(universe.followedNode);
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
		
		// Render banner if it exists
		if (this.editWindow && this.editWindow.bannerNode) {
			this.editWindow.bannerNode.show(this, time, resolvedDebugLevel);
			// Update banner property values in real-time
			this.editWindow.bannerNode.sense(0, this);
		}
		
		// Draw finger position indicators for debugging
		if (this.panZoom && this.panZoom.fingerWorldPositions.length > 0) {
			// Draw world-space circles (small, colored)
			this.view.drawFingerIndicators(this.panZoom.fingerWorldPositions);
			
			// Draw screen-space circles (larger, at screen level to show tracking)
			const screenPositions = Array.from(this.panZoom.activePointers.values());
			this.view.drawFingerScreenIndicators(screenPositions);
		}
		
		if (resolvedDebugLevel >= 8) {
			const ctx = this.view.context;
			const screenWidth = this.view.screenSize.x;
			const screenHeight = this.view.screenSize.y;

			for (let node of this.nodes) {
				let nodeCoordLabel = node.labels && node.labels.find(l => l.name === 'plane');
				let nodeIsDisplay = nodeCoordLabel && nodeCoordLabel.planeProperty === 'display';

				if (nodeIsDisplay && node.localPosition) {
					const screenX = (node.localPosition.x / 100) * screenWidth;
					const screenY = screenHeight - (node.localPosition.y / 100) * screenHeight;

					ctx.fillStyle = 'white';
					ctx.strokeStyle = node.name === 'Selector' ? 'magenta' : 'yellow';
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.arc(screenX, screenY, 15, 0, Math.PI * 2);
					ctx.fill();
					ctx.stroke();

					ctx.fillStyle = 'black';
					ctx.font = '12px Arial';
					ctx.fillText(node.name, screenX + 20, screenY - 10);
				}
			}
		}
	}
}

export { TrussNode };
