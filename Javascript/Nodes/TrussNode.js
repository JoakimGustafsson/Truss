/* global TrussView PropertyEditor debugEntity */
/**
 * @class
 * @extends Node
 */
class TrussNode extends Node {
	/** Create a node that can contain a Truss within itself.
	 * @param  {World} world
	 * @param  {Truss} parentTrussNode
	 * @param  {Truss} initialLabels
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
	constructor(world, parentTrussNode, initialLabels, valueObject) {
		super(world, parentTrussNode, initialLabels, valueObject);

		this.world=world;
		this.element = document.createElement('div');
		this.view= new TrussView(this.worldSize, this);

		if (this.worldOffset) {
			this.view.offset = this.worldOffset;
		}

		this.canvas = document.createElement('canvas');


		this.delta = 0;
		this.lastFrameTimeMs = 0;
		this.timestep = 1/60;	// target framerate
		this._fps = 60,
		this.framesThisSecond = 0,
		this.lastFpsUpdate = 0;

		this.timeMultiplier=1;
		this.externalTime=0;	// Universal tick time, given by the system;
		this.internalTime=0;	// The age of this truss in ticks (halts when paused)

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
		this.canvas.style.top = this.localPosition.y + 'px';
		this.canvas.style.left = this.localPosition.x + 'px';
		this.canvas.style.position = 'relative';
		this.element.appendChild(this.canvas);
	}

	/**
	 * @param  {TrussView} view
	 */
	setView() {
		this.view.context = this.canvas.getContext('2d');
		this.canvas.width = this.view.screenSize.x;
		this.canvas.height = this.view.screenSize.y;
		this.canvas.style.width = '100%';
		this.canvas.style.height = '100%';

		this.editWindow = new PropertyEditor(this, new Position(100, 100), 500, 500);
	}

	/**
	 * @param  {World} world
	 * @param  {Array} superTensorList
	 */
	setupLabels(world) {
		this.tensorLabel = world.labels.findLabel('tensor');
		this.nodeLabel = world.labels.findLabel('node');
		this.sensorLabel = world.labels.findLabel('sensor');
		this.angleNodeLabel = world.labels.findLabel('anglenode');
		this.moveableLabel = world.labels.findLabel('moveable');
		this.absorberLabel = world.labels.findLabel('absorber');
		this.preUpdatePositionLabel = world.labels.findLabel('preupdateposition');
		this.postUpdatePositionLabel = world.labels.findLabel('postupdateposition');
		
	}

	/**
	 * @param  {Array} superNodeList
	 * @param  {Array} superTensorList
	 * @return {Object}
	 */
	serialize(superNodeList=[], superTensorList=[]) {
		let representationObject = super.serialize(superNodeList, superTensorList);
		representationObject.classname = 'TrussNode';
		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} superNodes
	 * @param  {Array} superTensors
	 */
	deSerialize(restoreObject, superNodes, superTensors) {
		super.deSerialize(restoreObject, superNodes, superTensors);
		this.handleCanvas();
		this.setView();
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
	resize() {
		this.view.resize();
		this.canvas.width = this.view.screenSize.x;
		this.canvas.height = this.view.screenSize.y;
	}

	/*
	 * Pauses the position updates
	togglePause() {
		this.togglePause();
	} */

	/**
	 * Recursively call tick() on the sub-Truss and then update this nodes position
	 * @param {number} time
	 * @param {number} delta
	 */
	updatePosition(time, delta) {
		super.updatePosition(time, delta); // Call parent in order to update this nodes position
	}

	/**
	 */
	hideEdit() {
		this.editWindow.removeBanner(this);
	}

	/**
	 * Calculate all forces caused by a Nodes position.
	 * For example, Springs or Fields are position based force appliers.
	 * @param {number} deltaTime
	 */
	calculatePositionBasedForces(deltaTime) {
		for (let tensor of this.tensorLabel.getTensors()) {
			tensor.calculateForce(deltaTime);
		}
	}

	/**
	 * Calculate all forces caused by a Nodes velocity.
	 * For example, Absorbers (dampeners) generate a force based on two nodes relative velocity.
	 * @param {number} deltaTime
	 */
	calculateVelocityBasedForces(deltaTime) {
		for (let tensor of this.absorberLabel.getTensors()) {
			tensor.calculateForce2(deltaTime);
		}
	}

	/**
	 * Update all nodes velocities based on Position based forces
	 * @param {number} deltaTime
	 */
	calculatePositionBasedVelocities(deltaTime) {
		for (let node of this.moveableLabel.getNodes()) {
			node.updatePositionBasedVelocity(deltaTime);
		}
	}

	/**
	 * Update all nodes velocities based on Velocity based forces
	 * @param {number} deltaTime
	 */
	calculateTorques(deltaTime) {
		for (let node of this.angleNodeLabel.getNodes()) {
			node.calculateTorques(deltaTime);
		}
	}

	/**
	 * Update all nodes rotations
	 * @param {number} deltaTime
	 */
	calculateRotation(deltaTime) {
		for (let node of this.angleNodeLabel.getNodes()) {
			node.rotate(deltaTime);
		}
	}

	/**
	 * Update all nodes velocities based on Velocity based forces
	 * @param {number} deltaTime
	 */
	calculateDampenedVelocity(deltaTime) {
		for (let node of this.moveableLabel.getNodes()) {
			node.updateFinalVelocity(deltaTime);
		}
	}

	/**
	 * go through this list and sort out things before updating positions
	 * @param {number} trussTime
	 * @param {Truss} truss
	 */
	preUpdatePositions(trussTime, truss) {
		for (let item of this.preUpdatePositionLabel.getReferences()) {
			item.preUpdatePosition(trussTime, truss);
		}
	}
	/**
	 * go through this list and sort out things after updating positions
	 * @param {number} trussTime
	 * @param {Truss} truss
	 */
	postUpdatePositions(trussTime, truss) {
		for (let item of this.postUpdatePositionLabel.getReferences()) {
			item.postUpdatePosition(trussTime, truss);
		}
	}
	/**
	 * Loop through all nodes and move them according to their velocity
	 * @param {number} trussTime
	 * @param {number} deltaTime
	 */
	updatePositions(trussTime, deltaTime) {
		for (let node of this.moveableLabel.getNodes()) {
			node.updatePosition(trussTime, deltaTime);
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
	calculate() {
		this.calculateTorques(this.timestep);
		this.calculatePositionBasedForces(this.timestep);
		this.calculatePositionBasedVelocities(this.timestep);
		//this.calculateVelocityBasedForces(this.timestep);
		//this.calculateDampenedVelocity(this.timestep);
		//this.calculateRotation(this.timestep);
	}
	/**
	 * update the position and velocities of the nodes based on the forces
	 * @param {number} trussTime
	 * @param {number} preventmovement
	 */
	update(trussTime, preventmovement) {
		this.preUpdatePositions(trussTime, this);
		if (!preventmovement) {
			this.updatePositions(trussTime, this.timestep);
		}
		this.postUpdatePositions(trussTime, this);
		
	}

	/**
	 * Go through all sensors added by addSensor() and trigger the sense() function
	 * @param {number} trussTime
	 */
	sense(trussTime) {
		for (let sensorNode of this.sensorLabel.getNodes()) {
			sensorNode.sense(trussTime, this);
		}
	}
	/**
	 * Clear the screen
	 * @param {number} fullClear The transparency (0-1.0)
	 */
	clear() {
		this.view.clear();
	}

	/** This toggle if the forces (and inertia) generates movement
	 */
	togglePause() {
		if (!this.paused) {
			this.delta = -1;
			this.paused = true;
		} else {
			this.paused = false;
		}
	}

	/** Are the forces (and inertia) generating movement
	 */
	isPaused() {
		return this.paused;
	}

	/**
	 * The truss main tick function. this function is called to generate
	 * a timestep in which the modelled world moves slightly forward.
	 *
	 * This also contains a debuging part that displays time in the console window.
	 * @param {number} externalTimestamp
	 */
	tick(externalTimestamp) {
		//debugEntity.breakWhen(26.0, 'collision');

		this.externalTime = externalTimestamp;
		let timestamp = externalTimestamp*this.timeMultiplier;

		// Track the accumulated time that hasn't been simulated yet
		this.delta += timestamp - this.lastFrameTimeMs; // note += here
		this.lastFrameTimeMs = timestamp;

		// the max amount of time we can compensate for
		if (this.delta > 0.2) {
			this.delta = this.timestep;
		}

		// Simulate the total elapsed time in fixed-size chunks
		while (this.delta >= this.timestep) {
			if (!this.paused) {
				this.calculate(timestamp);
			}

		
			if (!this.paused) {
				this.update(timestamp, this.preventUpdate);
				this.internalTime+=	this.timestep;
			}
			this.sense(timestamp);
			this.delta -= this.timestep;
			this.showTruss(timestamp);
		}

		//this.clear();
		//this.showTruss(timestamp);

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
	 */
	showTruss(time) {
		this.clear();
		for (let tensor of this.tensors) {
			tensor.show(this, universe.currentWorld.debugLevel);
		}

		for (let node of this.nodes) {
			node.show(this, time, universe.currentWorld.debugLevel);
		}
	}
	
	/**
	 * @param  {Position} position
	 * @param  {number} maxDistance
	 * @param  {Node} avoid
	 * @return {Object}
	 */
	getClosestObject(position, maxDistance, avoid) {
		let lowestDistance = 1000000000;
		let closest;
		for (let node of this.nodes) {
			if (Position.distance(position, node.getPosition()) < lowestDistance && node != avoid) {
				lowestDistance = Position.distance(position, node.getPosition());
				closest = node;
			}
		}
		for (let tensor of this.tensors) {
			if (Position.distance(position, tensor.getPosition()) < lowestDistance && tensor != avoid) {
				lowestDistance = Position.distance(position, tensor.getPosition());
				closest = tensor;
			}
		}
		if (lowestDistance > maxDistance) {
			return;
		}
		return closest;
	}

}
