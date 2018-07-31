
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
	constructor(world, parentTrussNode, initialLabels, valueObject,
		startPosition = new Vector(0, 0), viewSize = new Vector(0, 0), timestep = 0.016,
		mass = 1, name = 'trussNode', ...args) {
		super(world, parentTrussNode, initialLabels, valueObject, startPosition, mass, name, ...args);

		this.world=world;
		this.sensorNodes=[];
		this.element = document.createElement('div');
		this.view= new View(viewSize, this);
		this.canvas = document.createElement('canvas');


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
		Object.defineProperty(this, 'setWorldOffset', {
			get: function() {
				return this.view.offset;
			},
			set: function(value) {
				this.view.offset = value;
			},
		}
		);

		this.addProperty(new Property(undefined,
			'screenSize', 'screenSize', 'Screen size', ParameteType.POSITION, ParameterCategory.CONTENT,
			'The size of the displayed screen in pixels.'));

		this.addProperty(new Property(undefined,
			'worldSize', 'worldSize', 'World display size', ParameteType.POSITION, ParameterCategory.CONTENT,
			'The size of the displayed worldview in that worlds measurement.'));

		this.addProperty(new Property(undefined,
			'setWorldOffset', 'setWorldOffset', 'View position', ParameteType.POSITION, ParameterCategory.CONTENT,
			'The world coordinates of the upper left corner.'));

		this.addProperty(new Property(undefined, 'fpsTarget', 'fpsTarget', 'Updates per second', ParameteType.NUMBER,
			ParameterCategory.CONTENT, 'Graphical update frequency aim.'));

		this.addProperty(new Property(undefined, 'fps', 'fps', 'Frames per Second', ParameteType.NUMBER,
			ParameterCategory.CONTENT, 'Graphical update frequency aim.'));

		if (world) {
			this.handleCanvas();
			// this.truss = new TrussClass(this, this.view, timestep, world);
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
	 * @param  {View} view
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
		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} superNodes
	 * @param  {Array} superTensors
	 */
	deserialize(restoreObject, superNodes, superTensors) {
		super.deserialize(restoreObject, superNodes, superTensors);
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

	/**
	 * Pauses the position updates
	 */
	togglePause() {
		this.togglePause();
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
	 * @param  {Truss} truss
	 * @param  {number} time
	 * @param  {number} graphicDebugLevel=0
	 */
	show(truss, time, graphicDebugLevel = 0) {
		this.highLight(this.view.context);
		this.canvas.style.left = this.view.x(this.localPosition) + 'px';
		this.canvas.style.top = this.view.y(this.localPosition) + 'px';
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
		this.showTruss(timestamp, 5);

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
		for (let tensor of this.tensors) {
			tensor.show(this, graphicDebugLevel);
		}

		for (let node of this.nodes) {
			node.show(this, time, graphicDebugLevel);
		}
	}
}
