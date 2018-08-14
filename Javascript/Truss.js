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
<<<<<<< HEAD
	 * @param  {TrussNode} parentNode
	 * @param  {View} view
	 * @param  {number} timestep
	 * @param  {string} displayDivName
	 */
	constructor(parentNode, view, timestep = 1/60, displayDivName) {
		this.time = 0;
		this.view = view;
		this.parentNode=parentNode;
		this.displayDivName = displayDivName;
		this.element=document.getElementById(displayDivName);
		this.sensorNodes = [];
		this.nodes = [];

		this.tensors = [];
		this.positionBasedTensors = [];
		this.velocityBasedTensors = [];

		this.delta=0;
		this.lastFrameTimeMs=0;
		this.timestep=timestep;
=======
	 * @param  {TrussNode} parentTrussNode
	 * @param  {View} view
	 * @param  {number} timestep
	 * @param  {World} world
	 */
	constructor(parentTrussNode, view, timestep = 1 / 60, world) {
		this.time = 0;
		this.world=world;
		this.view = view;
		this.parentTrussNode = parentTrussNode;
		this.entryPoint = new Position(0, 0);
		// this.element=element;
		Object.defineProperty(this, 'element', {
			get: function() {
				return this.parentTrussNode.element;
			},
		});
		this.sensorNodes = [];
		this.nodes = [];

		this.tensors = parentTrussNode.world.labels.findLabel('tensor');
		this.connectedTensors = [];
		// this.velocityBasedTensors = [];

		this.delta = 0;
		this.lastFrameTimeMs = 0;
		this.timestep = timestep;
>>>>>>> newtestbranch
		this.fps = 60,
		this.framesThisSecond = 0,
		this.lastFpsUpdate = 0;
		this.debugLevel = 5;
<<<<<<< HEAD
	}

	/**
 	*/
=======

		this.angleLabel=world.labels.findLabel('angle');
		this.moveableLabel=world.labels.findLabel('moveable');
		this.pullSpringLabel=world.labels.findLabel('pullspring');
		this.pushSpringLabel=world.labels.findLabel('pushspring');
		this.fieldLabel=world.labels.findLabel('field');
		this.absorberLabel=world.labels.findLabel('absorber');
		this.springLabel=world.labels.findLabel('spring');
	}

	/**
	 */
>>>>>>> newtestbranch
	hideEdit() {
		this.editWindow.removeBanner(this);
	}


	/**
	 * @param  {Array} superNodeList
	 * @param  {Array} superTensorList
	 * @return {Object}
	 */
	serialize(superNodeList, superTensorList) {
<<<<<<< HEAD
		let representationObject={
=======
		let representationObject = {
>>>>>>> newtestbranch
			'classname': 'Truss',
			'timestep': this.timestep,
			'fps': this.fps,
			'framesThisSecond': this.framesThisSecond,
			'lastFpsUpdate': this.lastFpsUpdate,
		};

<<<<<<< HEAD
		let nodeList=[];
		for (let node of this.nodes) {
			let nodeSerilization = node.serialize(this, this.nodes, this.tensors);
			if (nodeSerilization) {
				nodeList.push(nodeSerilization);
			}
		}
		representationObject.nodes=nodeList;


		let tensorList=[];
		for (let tensor of this.tensors) {
			tensorList.push(tensor.serialize(this.nodes, this.tensors));
		}
		representationObject.tensors=tensorList;

		representationObject.sensorNodes=serializeList(this.sensorNodes, this.nodes);
		representationObject.positionBasedTensors=serializeList(this.positionBasedTensors, this.tensors);
		representationObject.velocityBasedTensors=serializeList(this.velocityBasedTensors, this.tensors);

		representationObject.view = this.view.serialize();
		representationObject.displayDivName = this.displayDivName;
		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} superNodeList
	 * @param  {Array} superTensorList
	 * @return {Truss}
	 */
	deserialize(restoreObject, superNodeList, superTensorList) {
		this.displayDivName = restoreObject.displayDivName;
		this.element=document.getElementById(this.displayDivName);

		// Create empty nodes and tensors
		let nodeList=[];
		for (let nodeRestoreObject of restoreObject.nodes) {
			let node = objectFactory(this, nodeRestoreObject);
			nodeList.push(node);
		}

		let tensorList=[];
		for (let tensorRestoreObject of restoreObject.tensors) {
			let tensor = objectFactory(this, tensorRestoreObject);
			tensorList.push(tensor);
		}

		// deserialize them
		let index=0;
		for (let node of nodeList) {
			node.deserialize(this, restoreObject.nodes[index], nodeList, tensorList);
			index++;
		}
		index=0;
		for (let tensor of tensorList) {
			tensor.deserialize(restoreObject.tensors[index], nodeList, tensorList);
			index++;
		}
		this.nodes=nodeList;
		this.tensors=tensorList;

		this.sensorNodes= deserializeList(restoreObject.sensorNodes, this.nodes);
		this.positionBasedTensors= deserializeList(restoreObject.positionBasedTensors, this.tensors);
		this.velocityBasedTensors= deserializeList(restoreObject.velocityBasedTensors, this.tensors);
		this.lastFrameTimeMs= 0;
		this.timestep= restoreObject.timestep;
		this.fps= restoreObject.fps;
		this.framesThisSecond= restoreObject.framesThisSecond;
		this.lastFpsUpdate= restoreObject.lastFpsUpdate;

		this.view = new View().deserialize(restoreObject.view);

		return this;
	}

	/**
	 * @return {Array}
	 */
	makeTensorList() {
		return this.tensors;
=======
		representationObject.nodes = serializeList(this.nodes, superNodeList);
		representationObject.tensors = serializeList(this.tensors.getTensors(), superTensorList);

		representationObject.sensorNodes = serializeList(this.sensorNodes, superNodeList);
		representationObject.positionBasedTensors = serializeList(this.connectedTensors, superTensorList);
		// representationObject.velocityBasedTensors = serializeList(this.velocityBasedTensors, superTensorList);

		representationObject.view = this.view.serialize();
		representationObject.entryPoint = this.entryPoint.serialize(this.sensorNodes, superNodeList);
		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} superNodeList
	 * @param  {Array} superTensorList
	 * @param  {TrussNode} parentTrussNode
	 * @return {Truss}
	 */
	deserialize(restoreObject, superNodeList, superTensorList, parentTrussNode) {
		/*
		this.displayDivName = restoreObject.displayDivName;
		this.element=document.getElementById(this.displayDivName);
		if (!this.element) {
			this.element=document.createElement('div');
			this.element.id=this.displayDivName;
		}
		index=0;
		for (let tensor of tensorList) {
			tensor.deserialize(restoreObject.tensors[index], nodeList, tensorList);
			index++;
		}*/

		this.nodes = deserializeList(restoreObject.nodes, superNodeList);
		this.tensors = deserializeList(restoreObject.tensors, superTensorList);

		this.parentTrussNode = parentTrussNode;

		this.sensorNodes = deserializeList(restoreObject.sensorNodes, superNodeList);
		this.connectedTensors = deserializeList(restoreObject.positionBasedTensors, superTensorList);
		// this.velocityBasedTensors = deserializeList(restoreObject.velocityBasedTensors, superTensorList);
		this.lastFrameTimeMs = 0;
		this.timestep = restoreObject.timestep;
		this.fps = restoreObject.fps;
		this.framesThisSecond = restoreObject.framesThisSecond;
		this.lastFpsUpdate = restoreObject.lastFpsUpdate;
		this.entryPoint = new Position().deserialize(restoreObject.entryPoint);

		let tempView = new View(restoreObject.view.worldViewSize, parentTrussNode);
		this.view = tempView.deserialize(restoreObject.view);

		return this;
>>>>>>> newtestbranch
	}

	/**
	 * @return {Array}
	 */
<<<<<<< HEAD
	makeNodeList() {
		return this.nodes;
	}

	/**
=======
	makeTensorList() {
		return this.tensors.getTensors();
	}

	/**
	 * @return {Array}
	 */
	makeNodeList() {
		return this.nodes;
	}

	/**
>>>>>>> newtestbranch
	 * Add a node to the truss and it will be updated at ticks and displayed
	 * @param  {Node} node
	 * @return {Node}
	 */
	addNode(node) {
		this.nodes.push(node);
		if (node.sensor) {
			this.addSensor(node);
		}
		return node;
	};

	/**
<<<<<<< HEAD
	 * Remove a node to the truss so it will not anylonger be updated at ticks and displayed
=======
	 * Remove a node from the truss so it will not any longer be updated at ticks and displayed
>>>>>>> newtestbranch
	 * @param  {Node} node
	 */
	removeNode(node) {
		removeIfPresent(node, this.nodes);
<<<<<<< HEAD
		if (node.sensor) {
			this.removeSensor(node);
		}
		for (let tensor of [...node.velocityBasedTensors, ...node.positionBasedTensors]) {
=======
		node.removeFromWorld();
		if (node.sensor) {
			this.removeSensor(node);
		}
		for (let tensor of node.connectedTensors) {
>>>>>>> newtestbranch
			this.removeTensor(tensor);
		}
	};

	/**
	 * Add a Tensor to the truss and it will be updated at ticks and displayed
	 * @param  {Tensor} tensor
	 * @return {Tensor}
<<<<<<< HEAD
	 */
	addTensor(tensor) {
		this.tensors.push(tensor);
=======
	 *
	addTensor(tensor) {
		/* this.tensors.push(tensor);
>>>>>>> newtestbranch
		if (tensor.tensorType == TensorType.ABSORBER) {
			this.velocityBasedTensors.push(tensor);
		} else {
			this.positionBasedTensors.push(tensor);
		}
		tensor.addToTruss();
		return tensor;
<<<<<<< HEAD
	};
=======
}; */

>>>>>>> newtestbranch
	/**
	 * @param  {Tensor} tensor
	 * @return {Tensor}
	 */
	removeTensor(tensor) {
<<<<<<< HEAD
		removeIfPresent(tensor, this.tensors);
=======
		/* removeIfPresent(tensor, this.tensors);
>>>>>>> newtestbranch
		if (tensor.tensorType == TensorType.ABSORBER) {
			removeIfPresent(tensor, this.velocityBasedTensors);
		} else {
			removeIfPresent(tensor, this.positionBasedTensors);
<<<<<<< HEAD
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
=======
		} */

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
>>>>>>> newtestbranch
		}
	};

	/**
<<<<<<< HEAD
	 * Update all nodes velocities based on Velocity based forces
	 * @param {number} deltaTime
	 */
	calculateFinalVelocityAndRotation(deltaTime) {
		for (let node of this.nodes) {
			node.updateFinalVelocity(deltaTime);
			node.updateFinalRotation(deltaTime);
=======
	 * Update all nodes velocities based on Position based forces
	 * @param {number} deltaTime
	 */
	calculatePositionBasedVelocities(deltaTime) {
		for (let node of this.moveableLabel.getNodes()) {
			node.updatePositionBasedVelocity(deltaTime);
>>>>>>> newtestbranch
		}
	};

	/**
<<<<<<< HEAD
	 * Loop through all nodes and move them according to their velocity
	 * @param {number} trussTime
	 * @param {number} deltaTime
	 */
	updatePositions(trussTime, deltaTime) {
		for (let node of this.nodes) {
			node.updatePosition(trussTime, deltaTime);
=======
	 * Update all nodes velocities based on Velocity based forces
	 * @param {number} deltaTime
	 */
	calculateTorques(deltaTime) {
		for (let node of this.angleLabel.getNodes()) {
			node.calculateTorques(deltaTime);
>>>>>>> newtestbranch
		}
	};

	/**
<<<<<<< HEAD
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
=======
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
>>>>>>> newtestbranch
	 * Go through all sensors added by addSensor() and trigger the sense() function
	 * @param {number} deltaTime
	 */
	sense(deltaTime) {
		for (let sensorNode of this.sensorNodes) {
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
<<<<<<< HEAD
			this.calculateFinalVelocityAndRotation(deltaTime);
=======
			this.calculateDampenedVelocity(deltaTime);
			this.calculateRotation(deltaTime);
>>>>>>> newtestbranch

			this.updatePositions(trussTime, deltaTime);
		}
		this.sense(deltaTime);
	}

	/**
<<<<<<< HEAD
	 * Clear the screen
	 */
	clear() {
		this.view.context.clearRect(0, 0, this.view.screenSize.x, this.view.screenSize.y);
	};

	/**
=======
	 * Call this before discarding to remove nodes and event listeners
	 */
	close() {}

	/**
	 * Clear the screen
	 */
	clear() {
		this.view.context.clearRect(0, 0, this.view.screenSize.x, this.view.screenSize.y);
	};

	/**
>>>>>>> newtestbranch
	 * @param  {Position} position
	 * @param  {number} maxDistance
	 * @param  {Node} avoid
	 * @return {Object}
	 */
	getClosestObject(position, maxDistance, avoid) {
<<<<<<< HEAD
		let lowestDistance=1000000000;
		let closest;
		for (let node of this.nodes) {
			if (Position.distance(position, node.getPosition())<lowestDistance && node!=avoid) {
				lowestDistance=Position.distance(position, node.getPosition());
				closest=node;
			}
		}
		for (let tensor of this.tensors) {
			if (Position.distance(position, tensor.getPosition())<lowestDistance && tensor!=avoid) {
				lowestDistance=Position.distance(position, tensor.getPosition());
				closest=tensor;
			}
		}
		if (lowestDistance>maxDistance) {
=======
		let lowestDistance = 1000000000;
		let closest;
		for (let node of this.nodes) {
			if (Position.distance(position, node.getPosition()) < lowestDistance && node != avoid) {
				lowestDistance = Position.distance(position, node.getPosition());
				closest = node;
			}
		}
		for (let tensor of this.tensors.getTensors()) {
			if (Position.distance(position, tensor.getPosition()) < lowestDistance && tensor != avoid) {
				lowestDistance = Position.distance(position, tensor.getPosition());
				closest = tensor;
			}
		}
		if (lowestDistance > maxDistance) {
>>>>>>> newtestbranch
			return;
		}
		return closest;
	}

	/**
	 * The Show function ask all tensors and nodes to draw themselves
	 * @param  {number} time
	 * @param  {number} graphicDebugLevel
	 */
	show(time, graphicDebugLevel) {
		// this.view.context.drawimage(); xxx

<<<<<<< HEAD
		for (let i = 0; i < this.tensors.length; i++) {
			this.tensors[i].show(this, graphicDebugLevel);
=======
		for (let tensor of this.tensors.getTensors()) {
			tensor.show(this, graphicDebugLevel);
>>>>>>> newtestbranch
		}

		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i].show(this, time, graphicDebugLevel);
		}
	}

	/**
	 */
	togglePause() {
		if (!this.paused) {
<<<<<<< HEAD
			this.delta=-1;
			this.paused=true;
		} else {
			this.paused=false;
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
		this.show(timestamp, this.debugLevel );

		if (timestamp > this.lastFpsUpdate + 1) { // update every second
			this.fps = 0.25 * this.framesThisSecond + (1 - 0.25) * this.fps; // compute the new FPS

			this.lastFpsUpdate = timestamp;
			this.framesThisSecond = 0;
			if (FPSdisplay) {
				FPSdisplay.innerHTML='FPS: '+Math.round(this.fps);
			}
		}
=======
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
		this.show(timestamp, this.debugLevel);

		/* 	if (timestamp > this.lastFpsUpdate + 1) { // update every second
			this.fps = 0.25 * this.framesThisSecond + (1 - 0.25) * this.fps; // compute the new FPS

			this.lastFpsUpdate = timestamp;
			this.framesThisSecond = 0;
			if (FPSdisplay) {
				FPSdisplay.innerHTML= Math.round(this.fps);
			}
		} */
>>>>>>> newtestbranch
		this.framesThisSecond++;
	}
}
