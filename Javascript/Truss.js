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
	 * @param  {number} updateFrequency
	 */
	constructor(view, updateFrequency = 0.01) {
		this.time = 0;
		this.view = view;
		this.sensorNodes = [];
		this.nodes = [];
		this.tensors = [];
		this.updateFrequency = updateFrequency;
		this.positionBasedTensors = [];
		this.velocityBasedTensors = [];
		this.lastTime = 0;
		this.lastTicks = 0;
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
		if (tensor.type == TensorType.ABSORBER) {
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
		if (tensor.type == TensorType.ABSORBER) {
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
		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i].updatePositionBasedVelocity(this.updateFrequency / 100);
		}
	};

	/**
	 * Update all nodes velocities based on Velocity based forces
	 */
	calculateFinalVelocities() {
		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i].updateFinalVelocity(this.updateFrequency / 100);
		}
	};

	/**
	 * Loop through all nodes and move them according to their velocity
	 */
	updatePositions() {
		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i].updatePosition(this.time);
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
	 */
	calculate() {
		this.calculatePositionBasedForces();
		this.calculatePositionBasedVelocities();
		this.calculateVelocityBasedForces();
		this.calculateFinalVelocities();
		this.updatePositions();
		this.sense();
		this.time += this.updateFrequency;
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
		for (let i = 0; i < this.tensors.length; i++) {
			this.tensors[i].show(this.view, graphicDebugLevel);
		}

		if (graphicDebugLevel > 3) {
			for (let i = 0; i < this.nodes.length; i++) {
				this.nodes[i].show(this.view, this.time, graphicDebugLevel);
			}
		}
	}

	/**
	 * The truss main tick function. this function is called to generate
	 * a timestep in which the modelled world moves slightly forward.
	 *
	 * This also contains a debuging part that displays time in the console window.
	 */
	tick() {
		this.calculate();
		this.clear();
		this.show(this.time, 5 );

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
