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

		this.lastTime = 0;
		this.lastTicks = 0;

		this.delta=0;
		this.lastFrameTimeMs=0;
		this.timestep=timestep;
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
	 */
	calculatePositionBasedForces() {
		for (let i = 0; i < this.positionBasedTensors.length; i++) {
			this.positionBasedTensors[i].calculateForce();
		}
	};

	/**
	 * Calculate all forces caused by a Nodes velocity.
	 * For example, Absorbers (dampeners) generate a force based on two nodes relative velocity.
	 */
	calculateVelocityBasedForces() {
		for (let i = 0; i < this.velocityBasedTensors.length; i++) {
			this.velocityBasedTensors[i].calculateForce();
		}
	};
	/**
	 * Update all nodes velocities based on Position based forces
	 */
	calculatePositionBasedVelocities() {
		for (let node of this.nodes) {
			node.updatePositionBasedVelocity(this.timestep/100);
		}
	};

	/**
	 * Update all nodes velocities based on Velocity based forces
	 */
	calculateTorques() {
		for (let node of this.nodes) {
			node.calculateTorques();
		}
	};

	/**
	 * Update all nodes velocities based on Velocity based forces
	 */
	calculateFinalVelocityAndRotation() {
		for (let node of this.nodes) {
			node.updateFinalVelocity(this.timestep/100);
			node.updateFinalRotation(this.timestep/100);
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
	 */
	sense() {
		for (let sensorNode of this.sensorNodes) {
			sensorNode.sense();
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
		this.calculateTorques();
		this.calculatePositionBasedForces();
		this.calculatePositionBasedVelocities();
		this.calculateVelocityBasedForces();
		this.calculateFinalVelocityAndRotation();
		this.updatePositions(trussTime, deltaTime);
		this.sense();
	}

	/**
	 * Clear the screen
	 */
	clear() {
		this.view.context.clearRect(0, 0, WIDTH, HEIGHT);
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

		// Simulate the total elapsed time in fixed-size chunks
		while (this.delta >= this.timestep) {
			this.calculate(timestamp-this.delta, this.timestep);
			this.delta -= this.timestep;
		}
		// this.calculate(timestamp, this.delta);
		this.clear();
		this.show(timestamp, 5 );

		// Time debugging
		// this.timeDebugToConsole();
	}

	/**
	 * Support function for debug purposes that displays both game time and real time
	 */
	timeDebugToConsole() {
		let nowSeconds = (new Date()).getSeconds();
		if (this.lastTime != nowSeconds) {
			let gameTime = this.time - this.lastTicks;
			let realTime = nowSeconds - this.lastTime;
			if (realTime - gameTime > 0.02) {
				console.log('Game time: ' + gameTime + ' Real time: ' + realTime + ' Diff: ' + (realTime - gameTime));
			}
			;
			this.lastTicks = this.time;
			this.lastTime = nowSeconds;
		}
	}
}
