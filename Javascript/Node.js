/**
 * @class
 */
class Node {
	/**
	 * @param  {Position} startPosition
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 */
	constructor(startPosition, mass = 1, name = 'node', positionFunction, showFunction, velocityLoss = 1) {
		this.localPosition = startPosition;
		this.velocity = new Velocity(0, 0);
		this.mass = mass;
		this.massRadius = Math.sqrt(mass);
		this.angle = 0;
		this.velocityBasedTensors = [];
		this.positionBasedTensors = [];
		this.name = name;
		this.velocityLoss = velocityLoss;
		this.positionFunction = positionFunction;
		this.showFunction = positionFunction;
	}

	/**
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


	/**
	 * Ensures that this node understands that it will recieve force from thsi tensor
	 * @param  {Tensor} t
	 * @return {Tensor}
	 */
	addTensor(t) {
		if (t.type == TensorType.ABSORBER) {
			this.velocityBasedTensors.push(t);
		} else {
			this.positionBasedTensors.push(t);
		}
		return t;
	};

	/**
	 * This node will no longer recieve force from this tensor
	 * @param {Tensor} t
	 */
	removeTensor(t) {
		if (t.type == TensorType.ABSORBER) {
			removeIfPresent(t, this.velocityBasedTensors);
		} else {
			removeIfPresent(t, this.positionBasedTensors);
		}
	};
	/**
	 * @param  {} direction the
	 * @param  {Array} ignoreList List of Tensors to avoid

	findTopSpring(direction, ignoreList) {
		function ignoreThis(t) {
			return (ignoreList.indexOf(t) + 1);
		}
		let steepestTensorSoFar = 0;
		let steepestRatioSoFar = NaN;
		for (let i = 0; i < this.positionBasedTensors.length; i++) {
			let tensor = this.positionBasedTensors[i];
			let temp = !ignoreThis(tensor);
			if (temp) { // avoid finding for example the spring you are on or your own spring
				if (tensor.type == TensorType.SPRING) {
					if (tensor.getXLength() == 0) {
						if (tensor.getTopNode != this) {
							return tensor;
						} // we have found a vertical spring;
					} else {
						let rightNode = tensor.getRightNode();
						let leftNode = tensor.getOppositeNode(rightNode);
						let thisRatio = (rightNode.getPosition().y - leftNode.getPosition().y) /
							(rightNode.getPosition().x - leftNode.getPosition().x);
						if (rightNode == this && // Moving left
							direction < 0 &&
							(isNaN(steepestRatioSoFar) || (thisRatio > steepestRatioSoFar))) {
							steepestTensorSoFar = tensor;
							steepestRatioSoFar = thisRatio;
						} else if (rightNode != this && // Moving right
							direction > 0 &&
							(isNaN(steepestRatioSoFar) || (thisRatio < steepestRatioSoFar))) {
							steepestTensorSoFar = tensor;
							steepestRatioSoFar = thisRatio;
						}
					}
				}
			}
		}
		return steepestTensorSoFar;
	};
 */
	/**
	 * Update the position based on velocity, then let
	 * the this.positionFunction (if present) tell where it should actually be
	 * @param  {number} time
	 */
	updatePosition(time) {
		let oldPosition = new Position(this.getPosition().x, this.getPosition().y);
		this.localPosition.add(this.velocity);
		if (this.positionFunction) {
			this.setPosition(this.positionFunction(this, time));
			this.velocity = subtractVectors(this.getPosition(), oldPosition);
		}
	};
	/*
	collided = function(tensor,collision){
		console.log("Node "+this.name +" collided with tensor ("+tensor.getName()+")");
	}
	*/

	/**
	 * @param  {number} timeFactor
	 */
	updatePositionBasedVelocity(timeFactor) {
		this.updateVelocity(this.positionBasedTensors, timeFactor);
	};

	/**
	 *
	 * @param {number} timeFactor
	 */
	updateFinalVelocity(timeFactor) {
		this.updateVelocity(this.velocityBasedTensors, timeFactor);
	};

	/**
	 *
	 * @param {Array} forceAppliers
	 * @param {number} timeFactor
	 */
	updateVelocity(forceAppliers, timeFactor) {
		if (isNaN(this.mass)) return;
		let acceleration;
		if (forceAppliers.length > 0) {
			acceleration = this.getAcceleration(forceAppliers);
		} else {
			acceleration = new Vector(0, 0);
		}
		this.velocity = addVectors(multiplyVector(this.velocityLoss, this.velocity),
			multiplyVector(timeFactor, acceleration));
	};

	/**
	 *
	 * @param {Array} forceAppliers
	 * @return {Vector}
	 */
	getAcceleration(forceAppliers) {
		//		this.acceleration=this.sumAllForces(forceAppliers).divide(this.mass)
		return divideVector(this.sumAllForces(forceAppliers), this.mass);
	};

	/**
	 * @param  {Array} forceAppliers
	 * @return {Force}
	 */
	sumAllForces(forceAppliers) {
		let result = new Force(0, 0);
		let applier;
		let tempForce;
		for (let i = 0; i < forceAppliers.length; i++) {
			applier = forceAppliers[i];
			tempForce = applier.getForce(this);
			result.add(tempForce);
		}
		return result;
	};

	/**
	 *
	 * @param {Canvas} canvas
	 * @param {number} time
	 * @param {number} graphicDebugLevel
	 */
	show(canvas, time, graphicDebugLevel = 0) {
		if (canvas.inside(this.getPosition())) {
			canvas.context.strokeStyle = 'lightgrey';
			canvas.context.beginPath();
			canvas.drawCircle(this.getPosition(), 0.03 * this.massRadius);
			canvas.context.stroke();

			if (graphicDebugLevel > 5) {
				canvas.context.strokeStyle = 'lightblue';
				canvas.context.beginPath();
				canvas.drawLine(this.getPosition(), addVectors(this.getPosition(), divideVector(this.velocity, 0.1)));
				canvas.context.stroke();

				canvas.context.strokeStyle = 'red';
				canvas.context.beginPath();
				canvas.drawLine(this.getPosition(), addVectors(this.getPosition(), divideVector(this.acceleration, 50)));
				canvas.context.stroke();
			}

			if (this.showFunction) this.showFunction(this, time);
		}
	};
}

/**
 * @class
 * @extends Node
 */
class TrussNode extends Node {
	/**
	 * @param  {Position} startPosition
	 * @param  {View} view
	 * @param  {number} updateFrequency
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 */
	constructor(startPosition, view, updateFrequency = 0.01,
		mass = 1, name = 'TrussNode', positionFunction, showFunction, velocityLoss = 1) {
		super(startPosition, mass, name, positionFunction, showFunction, velocityLoss);

		this.view = view;
		this.canvas = document.createElement('canvas');
		this.canvas.name = name;
		this.canvas.style.top = startPosition.y + 'px';
		this.canvas.style.left = startPosition.x + 'px';
		this.canvas.width = this.view.screenSize.x;
		this.canvas.height = this.view.screenSize.y;
		this.canvas.style.width = this.view.screenSize.x + 'px';
		this.canvas.style.height = this.view.screenSize.y + 'px';
		this.canvas.style.position = 'absolute';
		this.canvas.style.border = '1px solid red';

		let bg = document.getElementById('TrussBackground');
		bg.appendChild(this.canvas);

		this.view.context = this.canvas.getContext('2d');

		this.truss = new Truss(this.view, updateFrequency);
	}

	/**
	 * @param  {number} time
	 */
	updatePosition(time) {
		this.truss.tick(time);
		updatePosition.call(this, time); // Call parent in order to update this nodes position
	};
	/**
	 * @param  {View} v
	 * @param  {number} time
	 * @param  {number} graphicDebugLevel=0
	 */
	show(v, time, graphicDebugLevel = 0) {
		this.canvas.style.left = v.x(this.localPosition) + 'px';
		this.canvas.style.top = v.y(this.localPosition) + 'px';
	};

	/**
	 * @param  {number} time
	 */
	tick(time) { // used by main loop
		this.truss.tick(time);
	};
}
