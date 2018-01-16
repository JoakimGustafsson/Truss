const NodeColor = ['red', 'black', 'blue'];

/**
 * @class
 */
class Truss {
	/** The truss is the main object that keeps track of all internal nodes
	 * and tensors.
	 * When calling the tick() function, time in the truss progresses
	 * and the nodes are moved according to the forces acting on them.
	 *
	 * Trusses can be recursive via the TrussNode, node type.
	 *
	 * @param  {View} view
	 * @param  {number} timestep
	 */
	constructor(view, timestep = 1/60) {
		this.time = 0;
		this.view = view;
		this.sensorNodes = [];
		this.nodes = [];
		this.tensors = [];
		this.positionBasedTensors = [];
		this.velocityBasedTensors = [];

		this.delta=0;
		this.lastFrameTimeMs=0;
		this.timestep=timestep;
		this.fps = 60,
		this.framesThisSecond = 0,
		this.lastFpsUpdate = 0;
	}

	/**
	 * @return {Array}
	 */
	makeTensorList() {
		return this.positionBasedTensors.concat(this.velocityBasedTensors);
	}

	/**
	 * @return {Array}
	 */
	makeNodeList() {
		return this.nodes;
	}

	/**
	 * Add a node to the truss and it will be updated at ticks and displayed
	 * @param  {Node} node
	 * @return {Node}
	 */
	addNode(node) {
		this.nodes.push(node);
		return node;
	};
	/**
	 * Make a tensor unable to cause collisions
	 * @param  {Tensor} tensor
	 */
	ghostifyTensor(tensor) {
		tensor.ghostify();
	};
	/**
	 * Make a tensor able to cause collisions
	 * @param  {Tensor} tensor
	 */
	deghostifyTensor(tensor) {
		tensor.deghostify();
	};

	/**
	 * Add a Tensor to the truss and it will be updated at ticks and displayed
	 * @param  {Tensor} tensor
	 * @return {Tensor}
	 */
	addTensor(tensor) {
		this.tensors.push(tensor);
		if (tensor.tensorType == TensorType.ABSORBER) {
			this.velocityBasedTensors.push(tensor);
		} else {
			this.positionBasedTensors.push(tensor);
		}
		tensor.addToTruss();
		return tensor;
	};
	/**
	 * @param  {Tensor} tensor
	 * @return {Tensor}
	 */
	removeTensor(tensor) {
		removeIfPresent(tensor, this.tensors);
		if (tensor.tensorType == TensorType.ABSORBER) {
			removeIfPresent(tensor, this.velocityBasedTensors);
		} else {
			removeIfPresent(tensor, this.positionBasedTensors);
		}
		tensor.removeFromTruss();
		return tensor;
	};
	/**
	 * Calculate all forces caused by a Nodes position.
	 * For example, Springs or Fields are position based force appliers.
	 * @param {number} deltaTime
	 */
	calculatePositionBasedForces(deltaTime) {
		for (let i = 0; i < this.positionBasedTensors.length; i++) {
			this.positionBasedTensors[i].calculateForce();
		}
	};

	/**
	 * Calculate all forces caused by a Nodes velocity.
	 * For example, Absorbers (dampeners) generate a force based on two nodes relative velocity.
	 * @param {number} deltaTime
	 */
	calculateVelocityBasedForces(deltaTime) {
		for (let i = 0; i < this.velocityBasedTensors.length; i++) {
			this.velocityBasedTensors[i].calculateForce(deltaTime);
		}
	};
	/**
	 * Update all nodes velocities based on Position based forces
	 * @param {number} deltaTime
	 */
	calculatePositionBasedVelocities(deltaTime) {
		for (let node of this.nodes) {
			node.updatePositionBasedVelocity(deltaTime);
		}
	};

	/**
	 * Update all nodes velocities based on Velocity based forces
	 * @param {number} deltaTime
	 */
	calculateTorques(deltaTime) {
		for (let node of this.nodes) {
			node.calculateTorques(deltaTime);
		}
	};

	/**
	 * Update all nodes velocities based on Velocity based forces
	 * @param {number} deltaTime
	 */
	calculateFinalVelocityAndRotation(deltaTime) {
		for (let node of this.nodes) {
			node.updateFinalVelocity(deltaTime);
			node.updateFinalRotation(deltaTime);
		}
	};

	/**
	 * Loop through all nodes and move them according to their velocity
	 * @param {number} trussTime
	 * @param {number} deltaTime
	 */
	updatePositions(trussTime, deltaTime) {
		for (let node of this.nodes) {
			node.updatePosition(trussTime, deltaTime);
		}
	};

	/**
	 * Add a node to the list of nodes that should be checked if the collide with a tensor
	 * @param  {Node} sensorNode
	 */
	addSensor(sensorNode) {
		this.sensorNodes.push(sensorNode);
	};

	/**
	 * Remove a node to the list of nodes that should be checked if the collide with a tensor
	 * @param  {Node} sensorNode
	 */
	removeSensor(sensorNode) {
		removeIfPresent(sensorNode, this.sensorNodes);
	};

	/**
	 * Go through all sensors added by addSensor() and trigger the sense() function
	 * @param {number} deltaTime
	 */
	sense(deltaTime) {
		for (let sensorNode of this.sensorNodes) {
			sensorNode.sense(deltaTime);
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
		this.calculateTorques(deltaTime);
		this.calculatePositionBasedForces(deltaTime);
		this.calculatePositionBasedVelocities(deltaTime);
		this.calculateVelocityBasedForces(deltaTime);
		this.calculateFinalVelocityAndRotation(deltaTime);
		this.updatePositions(trussTime, deltaTime);
		this.sense(deltaTime);
	}

	/**
	 * Clear the screen
	 */
	clear() {
		this.view.context.clearRect(0, 0, this.view.screenSize.x, this.view.screenSize.y);
	};

	/**
	 * The Show function ask all tensors and nodes to draw themselves
	 * @param  {number} time
	 * @param  {number} graphicDebugLevel
	 */
	show(time, graphicDebugLevel) {
		// this.view.context.drawimage(); xxx

		for (let i = 0; i < this.tensors.length; i++) {
			this.tensors[i].show(this.view, graphicDebugLevel);
		}

		if (graphicDebugLevel > 3) {
			for (let i = 0; i < this.nodes.length; i++) {
				this.nodes[i].show(this.view, time, graphicDebugLevel);
			}
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

		if (this.delta>0.2) {
			this.delta=0;
		}
		// Simulate the total elapsed time in fixed-size chunks
		while (this.delta >= this.timestep) {
			this.calculate(timestamp-this.delta, this.timestep/2);
			this.delta -= this.timestep;
		}
		// this.calculate(timestamp, this.delta);
		this.clear();
		this.show(timestamp, 5 );

		if (timestamp > this.lastFpsUpdate + 1) { // update every second
			this.fps = 0.25 * this.framesThisSecond + (1 - 0.25) * this.fps; // compute the new FPS

			this.lastFpsUpdate = timestamp;
			this.framesThisSecond = 0;
			if (FPSdisplay) {
				FPSdisplay.innerHTML='FPS: '+Math.round(this.fps);
			}
		}
		this.framesThisSecond++;
	}
}
