/**
 *
 */

const TensorType = {
	UNDEFINED: 0,
	SPRING: 1,
	ABSORBER: 2,
	FIELD: 3,
};
/**
 * Tensor class
 */
class Tensor {
	/**
	 * @param  {Node} node1
	 * @param  {Node} node2
	 * @param  {number} constant=1
	 * @param  {TensorType} type=TensorType.UNDEFINED
	 */
	constructor(node1, node2, constant = 1, type = TensorType.UNDEFINED) {
		this.node1 = node1;
		this.node2 = node2;
		this.constant = constant;
		this.type = type;
		this.collideDistanceMapping = {};
		this.force = 0;
		this.ghost = false;
	}

	/**
	 * @return {string} The name of the tensor
	 */
	getName() {
		let name = '';
		if (this.node1) {
			name += this.node1.name;
		}
		name += '-';
		if (this.node2) {
			name += this.node2.name;
		}
		return name;
	}

	/**
	 * @param  {Node} node
	 */
	addNode1(node) {
		if (this.node1) {
			this.node1.removeTensor(this);
		}
		this.node1 = node;
		if (node) {
			node.addTensor(this);
		}
	};
	/**
	 * @param  {Node} node
	 */
	addNode2(node) {
		if (this.node2) {
			this.node2.removeTensor(this);
		}
		this.node2 = node;
		if (node) {
			node.addTensor(this);
		}
	};

	/**
	 * Makes sure the actual nodes will take this tensor into consideration
	 */
	addToTruss() {
		this.addNode1(this.node1);
		this.addNode2(this.node2);
	};


	/**
	 * @return {number}
	 */
	isGhost() {
		return this.ghost;
	};

	/**
	 * Makes sure the actual nodes will take this tensor into consideration
	 */
	ghostify() {
		this.ghost = true;
	};

	/**
	 *
	 */
	deghostify() {
		this.ghost = false;
	};

	/**
	 * Makes sure the nodes will NOT take this tensor into consideration
	 */
	removeFromTruss() {
		if (this.node2) {
			this.node2.removeTensor(this);
		}
		if (this.node1) {
			this.node1.removeTensor(this);
		}
		this.force = 0;
	};

	/**
	 * Is this a second node to the right of the first node?
	 * @return {number}
	 */
	rightNode() {
		return (this.node1.getPosition().x >= this.node2.getPosition().x);
	};

	/**
	 * Return the node with the highest x value, ie, the rightmost node of the tensor
	 * @return {Node}
	 */
	getRightNode() {
		if (this.rightNode()) {
			return this.node1;
		}
		return this.node2;
	};
	/**
	 * set or replace the node with the highest (rightmost) node
	 * @param  {Node} node
	 */
	setRightNode(node) {
		if (this.rightNode()) {
			this.addNode1(node);
		}
		this.addNode2(node);
	};

	/**
	 * Return the node with the lowest y value, ie, the topmost node of the tensor
	 * @return {Node}
	 */
	getTopNode() {
		if (this.node1.getPosition().y <= this.node2.getPosition().y) {
			return this.node1;
		}
		return this.node2;
	};

	/**
	 * Given a node of the tensor, this will return the opposite tensor
	 * @param  {Node} node
	 * @return {Node} Opposite node
	 */
	getOppositeNode(node) {
		if (this.node1 == node) {
			return this.node2;
		}
		return this.node1;
	};

	/**
	 * Returns the vertical distance between the nodes
	 * @return {number}
	 */
	getXLength() {
		return (this.node1.getPosition().x - this.node2.getPosition().x);
	};

	/**
	 * Returns the horizontal distance between the nodes
	 * @return {number}
	 */
	getYLength() {
		return (this.node1.getPosition().y - this.node2.getPosition().y);
	};

	/**
	 * Returns the distance between the nodes
	 * @return {number}
	 */
	getLength() {
		return Math.sqrt(this.getLengthSquare());
	};

	/**
	 * Returns the Vector representation of the Tensor.
	 * @return {Vector}
	 */
	getActual() {
		return new Vector(this.getXLength(), this.getYLength()); ;
	};

	/**
	 * Returns the squared length of the tensor. Used for efficiency reasons in some cases instead of getLength().
	 * @return {number} The squared length.
	 */
	getLengthSquare() {
		return Math.pow(this.getXLength(), 2) + Math.pow(this.getYLength(), 2);
	};

	/**
	 * Returns the force from this tensor acting on the input node.
	 * @param  {Node} node
	 * @return {number}
	 */
	getForce(node) {
		if (this.callback) {
			this.callback(this)
		}

		let directedforce = this.force;
		if (node == this.node2) {
			return directedforce;
		} else {
			return directedforce.opposite();
		}
	};

	/** Return {string} the HTML color of the tensor
	 * @return {string} the HTML color of the tensor
	 */
	getColour() {
		return 'grey';
	};
	/**
	 * clear a specific node from the list of nodes that have collided with the tensor.
	 * @param  {Node} node
	 */
	resetCollision(node) {
		this.collideDistanceMapping[node.name] = 0;
	};
	/**
	 * Give a specific node, check if it has collided with the tensor. If so, dispatch a "collisionEvent".
	 * @param  {Node} node
	 */
	checkCollision(node) {
		if (this.isGhost()) {
			return;
		}
		let oldDistance = this.collideDistanceMapping[node.name];
		let newDistance = getS(this.node1.getPosition(), this.node2.getPosition(), node.getPosition());
		let where = getT(this.node1.getPosition(), this.node2.getPosition(), node.getPosition());
		if ((where < 0) || (1 < where)) {
			newDistance = 0;
		}
		this.collideDistanceMapping[node.name] = newDistance;
		if (oldDistance * newDistance < 0) {
			if ((where >= 0) && (where <= 1)) {
				let event = new CustomEvent('collisionEvent', {
					detail: {
						'where': where,
						'from': oldDistance,
						'collider': node,
						'tensor': this,
					},
					bubbles: true,
					cancelable: true,
				});
				document.dispatchEvent(event);
			}
		}
	};
	/**
	 * Draws the tensor on a given Canvas. The graphicDebugLevel determines how many details that should be displayed
	 * @param  {Canvas} canvas
	 * @param  {number} graphicDebugLevel=0
	 */
	show(canvas, graphicDebugLevel = 0) {
		let ctx = canvas.context;
		let node1 = this.node1;
		let node2 = this.node2;
		if (!(this.isGhost()) && (!(this instanceof Field) || (graphicDebugLevel > 7))) {
			ctx.strokeStyle = this.getColour();
			ctx.lineWidth = 3;
			ctx.beginPath();
			canvas.drawLine(node1.getPosition(), node2.getPosition());
			ctx.stroke();
			if (graphicDebugLevel > 7) {
				ctx.beginPath();
				ctx.fillStyle = 'black';
				ctx.font = '20px Arial';
				ctx.textAlign = 'left';
				let textPos = subtractVectors(node1, divideVector(this.getActual(), 2));
				canvas.drawText(textPos, Math.trunc(10 * this.getLength()) / 10);
			}
		}
	};
}


/**
	 * @class
	 * @augments Tensor
	 */
class Spring extends Tensor {
	/**
	 * @param  {Node} node1
	 * @param  {Node} node2
	 * @param  {number} constant
	 * @param  {number} equilibriumLength
	 * @param  {TensorType} type
	 */
	constructor(node1, node2, constant = 1, equilibriumLength = 0, type = TensorType.SPRING) {
		super(node1, node2, constant, type);
		this.equilibriumLength = equilibriumLength;
		if (this.equilibriumLength <= 0 && node1 && node2) {
			this.equilibriumLength = this.getLength();
		}
	}
	/**
		 * Calculate the force in the Spring based on current length
		 */
	calculateForce() {
		// if (!this.node1 || !this.node2)
		//	return this.force=new Force(0,0);
		let actualVector = this.getActual();
		let normalized = normalizeVector(this.equilibriumLength, actualVector);
		let diffVector = subtractVectors(actualVector, normalized);
		this.force = multiplyVector(this.constant, diffVector);
	}
}

/** This is a spring that only pulls things together. think of a long, thin spring that would bend if you press the ends together
 * @class PullSpring
 * @augments Spring
 */
class PullSpring extends Spring {
	/** This is a spring that only pulls things together. think of a long, thin spring that would bend if you press the ends together
	* @param  {Node} node1
	* @param  {Node} node2
	* @param  {number} constant
	* @param  {number} equilibriumLength
	* @param  {TensorType} type
	*/
	constructor(node1, node2, constant = 1, equilibriumLength = 0, type = TensorType.SPRING) {
		super(node1, node2, constant, equilibriumLength, type);
	}

	/**
		 * Calculate the force in the Spring based on current length
		 */
	calculateForce() {
		let actualVector = this.getActual();
		if ((this.equilibriumLength > 0) && (length2(actualVector) < this.equilibriumLength * this.equilibriumLength)) {
			this.force = new Force(0, 0);
		} else {
			Spring.prototype.calculateForce.call(this);
		}
	}
}

// A normal field based on the square of the length between the nodes

/**
 * @class
 * @augments Tensor
 */
class Field extends Tensor {
/**
 * @param  {Node} node1
 * @param  {Node} node2
 * @param  {number} constant
 * @param  {TensorType} type
 */
	constructor(node1, node2, constant = 1, type = TensorType.FIELD) {
		super(node1, node2, constant, type);
	}

	/**
		 * Calculate the force in the Field based on distance between the nodes
		 */
	calculateForce() {
		let actualVector = this.getActual();
		let normalized = normalizeVector(1, actualVector);
		let forceSize = this.constant * this.node1.mass * this.node2.mass / this.getLengthSquare();
		this.force = multiplyVector(forceSize, normalized);
	}

	/**
	 * @return {string} the HTML color of the tensor
	 */
	getColour() {
		return 'blue';
	}
}

/**
 * An absorber work against the velocity between the nodes.
 * The higher the "parallell" velocity is, the higher the force
 * counteracting it will be.
 * @class
 * @augments Tensor
 */
class Absorber extends Tensor {
/**
 * @constructor
 * @param  {Node} node1
 * @param  {Node} node2
 * @param  {number} constant
 * @param  {TensorType} type
 */
	constructor(node1, node2, constant = 1, type = TensorType.ABSORBER) {
		super(node1, node2, constant, type);
	}

	/**
	 * Calculate the force in the Field based on the relative velocity between the nodes
	*/
	calculateForce() {
		let actualVector = this.getActual();
		let internalSpeed = subtractVectors(this.node1.velocity, this.node2.velocity);
		let parallellVelocity = multiplyVector(
			dotProduct(actualVector, internalSpeed),
			divideVector(actualVector, this.getLengthSquare()));
		this.force = multiplyVector(this.constant, parallellVelocity);
	}

	/**
	 * @return {string} the HTML color of the tensor
	 */
	getColour() {
		return 'green';
	}
}
