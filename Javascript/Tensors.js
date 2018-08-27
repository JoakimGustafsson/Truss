/**
 * Tensor class
 * @class
 * @extends StoreableObject
 */
class Tensor extends StoreableObject {
	/**
	 * @param  {Node} node1
	 * @param  {Node} node2
	 * @param  {string} initialLabels
	 * @param  {object} valueObject
	 */
	constructor(node1, node2, initialLabels, valueObject) {
		let parent = undefined;
		if (node1) {
			parent = node1.world;
		}
		super(parent, initialLabels, valueObject);

		this.collideDistanceMapping = {};
		this.force = new Force(0, 0);

		/* this.properties = new PropertyList();
		this.collideDistanceMapping = {};
		this.force = new Force(0, 0);
		this.ghost = false;
		this.isTensor=true;
		this.color='white';
		this.labelString=initialLabels;
		this.visible=true;*/

		Object.defineProperty(this, 'degree2', {
			get: function() {
				return Math.round(this.angle2 * 180 / (Math.PI));
			},
			set: function(value) {
				if (value=='NaN') {
					this.angle2 = NaN;
				} else {
					this.angle2 = value * Math.PI / 180;
				}
			},
		});
		Object.defineProperty(this, 'degree1', {
			get: function() {
				return Math.round(this.angle1 * 180 / (Math.PI));
			},
			set: function(value) {
				if (value=='NaN') {
					this.angle1 = NaN;
				} else {
					this.angle1 = value * Math.PI / 180;
				}
			},
		});

		Object.defineProperty(this, 'node1', {
			get: function() {
				return this._node1;
			},
			set: function(value) {
				if (this._node1) {
					this._node1.removeTensor(this);
				}
				if (!value) {
					return;
				}
				this._node1 = value;
				// this.angle1 = angleSubstract(this.getTensorAngle(value), value.getAngle());
				value.addTensor(this);
			},
		});

		Object.defineProperty(this, 'node2', {
			get: function() {
				return this._node2;
			},
			set: function(value) {
				if (this._node2) {
					this._node2.removeTensor(this);
				}
				if (!value) {
					return;
				}
				this._node2 = value;
				// this.angle2 = angleSubstract(this.getTensorAngle(value), value.getAngle());
				value.addTensor(this);
			},
		});

		this.node1 = node1;
		this.node2 = node2;
		this.initialRefresh();
	}

	/**
	 * @param {Labels} value
	 */
	labelChange(value) {
		this.velocityBasedTensors = (0 >= this.labels.indexOf(this.world.labels.findLabel('absorblabel')));
		this.angleTensor=value.indexOf(this.world.labels.findLabel('angletensor'))>=0;
	}

	/**
	 * @param {Node} leftNode
	 * @return {Element}
	 */
	generateHTML(leftNode) {
		let sign;
		if (this.node1==leftNode) {
			sign='>';
		} else {
			sign='<';
		}
		let div = document.createElement('div');
		div.classList.add('trussButtonDiv');
		let leftButton=document.createElement('button');
		leftButton.classList.add('trussButton');
		leftButton.classList.add('tensorButtonLeft');
		leftButton.innerHTML = sign;
		div.appendChild(leftButton);

		let middleButton=document.createElement('button');
		middleButton.classList.add('trussButton');
		middleButton.classList.add('tensorButtonMiddle');
		if (this.color!='transparent') {
			middleButton.style.color=this.color;
		}
		middleButton.innerHTML = this.getName();
		this.registerOnClick(middleButton, this);
		div.appendChild(middleButton);

		let rightButton=document.createElement('button');
		rightButton.classList.add('trussButton');
		rightButton.classList.add('tensorButtonRight');
		rightButton.innerHTML = sign;

		div.appendChild(rightButton);

		let _this = this;
		this.attachFunction = function() {
			if (_this && universe.currentNode.selector && universe.selectedObject && universe.selectedObject.isNode) {
				_this.sensorAttach();
				_this = undefined;
			}
		};

		if (_this.node1 == leftNode) {
			leftButton.onclick = function(x) {
				_this.node1=universe.currentNode.selector;
				document.addEventListener('selectionEvent', _this.attachFunction, false);
			};
			rightButton.onclick = function(x) {
				_this.node2=universe.currentNode.selector;
				document.addEventListener('selectionEvent', _this.attachFunction, false);
			};
		} else {
			leftButton.onclick = function(x) {
				_this.node2=universe.currentNode.selector;
				document.addEventListener('selectionEvent', _this.attachFunction, false);
			};
			rightButton.onclick = function(x) {
				_this.node1=universe.currentNode.selector;
				document.addEventListener('selectionEvent', _this.attachFunction, false);
			};
		}

		return div;
	}


	/**
	 * @param {Tensor} tensor
	 */
	sensorAttach() {
		if (this.node1 == universe.currentNode.selector) {
			this.node1=universe.selectedObject;
		} else if (this.node2 == universe.currentNode.selector) {
			this.node2=universe.selectedObject;
		}
		if (this.attachFunction) {
			document.removeEventListener('selectionEvent', this.attachFunction);
		}
	}

	/**
	 * @param {Node} left
	 * @return {string}
	 */
	generateconnectionHTML(left) {
		let leftNode=left;
		if (!leftNode) {
			leftNode=this.node1;
		}
		let rightNode= this.getOppositeNode(leftNode);

		let div = document.createElement('div'); // Create the element in memory

		// let button0 = leftNode.generateHTML(this);
		// div.appendChild(button0);

		let button1 = this.generateHTML(leftNode);
		div.appendChild(button1);

		let button2 = rightNode.generateHTML(this);
		div.appendChild(button2);

		return div;
	}

	/**
	 * @param  {buttonObject} but
	 * @param  {Node} node1
	 */
	registerOnClick(but, node1) {
		but.addEventListener('click', function() {
			let previousSelectedObject = universe.selectedObject;
			universe.selectedObject = node1;
			let event = new CustomEvent('selectionEvent', {
				detail: {
					'selectedObject': universe.selectedObject,
					'previousSelectedObject': previousSelectedObject,
					'trussNode': node1.parentNode,
				},
				bubbles: true,
				cancelable: true,
			});
			universe.currentNode.element.dispatchEvent(event);
		});
	}

	/** Handling properties
	 * @param  {Property} property
	 * @return {Property}
	 */
	addProperty(property) {
		return this.properties.addProperty(property);
	}

	/** Handling properties
	 * @return {Property}
	 */
	getProperties() {
		return this.properties;
	}

	/** Handling properties
	 * @param  {element} element
	 * @param  {number} ignoreLabels
	 * @return {Property}
	 */
	populateProperties(element, ignoreLabels) {
		return this.properties.populateProperties(element, this, ignoreLabels);
	}

	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		let representation = super.serialize(nodeList, tensorList);
		representation.classname='Tensor';
		return representation;
	}


	/**
	 * @return {string} The name of the tensor
	 */
	getName() {
		if (this.labels && this.labels.length>0) {
			return this.labels[0].name;
		}
		return this.constructor.name;
		/* if (this.node1) {
			name += this.node1.name;
		}
		name += '-';
		if (this.node2) {
			name += this.node2.name;
		}
		return name;*/
	}

	/** Returns the midpoint of the tensor
	 * @return {Position}
	 */
	getPosition() {
		if (this.node1 && this.node2) {
			let p1=this.node1.getPosition();
			let p2=this.node2.getPosition();
			return new Position((p2.x+p1.x)/2, (p2.y+p1.y)/2);
		}
		return new Position(0, 0);
	};


	/* Given a node. Return the angle that the tensor wants o have wrt to the node
	 * @param  {Node} node
	 * @return {number} wanted angle
	 *
	getIdealAngle(node) {
		if (node==this.node1) {
			return this.angle1;
		}
		return this.angle2;
	};


	/** Given one of the nodes of a tensor node.
	 * Return the torque.
	 * @param  {Node} node
	 * @return {number}
	 *
	getTorque(node) {
		let idealAngle = this.getIdealAngle(node);
		if (isNaN(idealAngle)) {
			return 0;
		}
		let tensorAngle = this.getTensorAngle(node);
		let theNodeShouldHaveAngle = tensorAngle-idealAngle;

		let nodeAngle = anglify(node.getAngle());
		let correctionAngle = anglify(theNodeShouldHaveAngle - nodeAngle);

		let torque= node.getTorqueConstant() * correctionAngle;
		if (node==this.node1) {
			this.torque1=-torque;
		} else {
			this.torque2=-torque;
		}
		return torque;
	};

	/* This retrieves a torque that has been previously calculated during the calculatetorque step.
	 * @param  {Node} node
	 * @return {number}
	 *
	getStoredTorque(node) {
		if (node==this.node1) {
			return this.torque1;
		}
		return this.torque2;
	} 

	/**
	 * Returns the force from this tensor resulting from the torque in the opposite node.
	 * @param  {Node} node
	 * @return {number}
	 *
	calculateTorqueForce(node) {
		let opposite = this.getOppositeNode(node);
		if (opposite.getTorqueConstant()==0) {
			return new Force(0, 0);
		}
		let torque = this.getStoredTorque(opposite);
		if (!torque) {
			return new Force(0, 0);
		}
		let forceLenth = torque * this.getLength();
		let actual = this.getActual();
		let perp = actual.perpendicular();
		let force = perp.normalizeVector(forceLenth);
		return force.opposite();
	}; */

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
	deGhostify() {
		this.ghost = false;
		this.collideDistanceMapping={};
	};

	/**
	 * Makes sure the nodes will NOT take this tensor into consideration
	 */
	unreference() {
		this.world.labels.clearOldReferences(this);
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
	 * Returns the trigonomitrical angle of the tensor.
	 * @param {Node} node Optional argument, that, if equal to node nr 2 adds PI
	 * @return {number}
	 */
	getTensorAngle(node) {
		let modifyIfNode2 = 0;
		if (node==this.node2) {
			modifyIfNode2 = Math.PI;
		}
		// let x = this.supportAngle() * 180/Math.PI;
		return anglify(getAngle(this.getXDifference(), this.getYDifference()) + modifyIfNode2);
	};

	/**
	 * Returns the vertical difference between the nodes
	 * @return {number}
	 */
	getXDifference() {
		return (this.node2.getPosition().x - this.node1.getPosition().x);
	};

	/**
	 * Returns the vertical distance between the nodes
	 * @return {number}
	 */
	getXLength() {
		return Math.abs(this.getXDifference());
	};

	/**
	 * Returns the horizontal difference between the nodes
	 * @return {number}
	 */
	getYDifference() {
		return this.node2.getPosition().y - this.node1.getPosition().y;
	};

	/**
	 * Returns the horizontal distance between the nodes
	 * @return {number}
	 */
	getYLength() {
		return Math.abs(this.getYDifference());
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
		return new Vector(this.getXDifference(), this.getYDifference()); ;
	};

	/**
	 * Returns the squared length of the tensor. Used for efficiency reasons in some cases instead of getLength().
	 * @return {number} The squared length.
	 */
	getLengthSquare() {
		return Math.pow(this.getXDifference(), 2) + Math.pow(this.getYDifference(), 2);
	};

	/**
	 * Returns the force from this tensor acting on the input node.
	 * @param  {Node} node
	 * @return {number}
	 */
	getForce(node) {
		let directedforce;
		let torqueForce;
		if (node == this.node2) {
			directedforce = this.force;
			torqueForce = this.torqueForce1;
		} else {
			directedforce = this.force.opposite();
			torqueForce = this.torqueForce2;
		}

		if (!torqueForce) {
			return directedforce;
		} else return Vector.addVectors(directedforce, torqueForce);
	};

	/** Return {string} the HTML color of the tensor
	 * @return {string} the HTML color of the tensor
	 */
	getColour() {
		if (this.color) {
			return this.color;
		} else return 'white';
	};
	/**
	 * clear a specific node from the list of nodes that have collided with the tensor.
	 * @param  {Node} node
	 */
	resetCollision(node) {
		delete this.collideDistanceMapping[node.name];
	};
	/**
	 * Give a specific node, check if it has collided with the tensor. If so, dispatch a "collisionEvent".
	 * @param  {Node} node
	 * @param  {Truss} truss
	 * @return {Object}
	 */
	checkCollision(node, truss) {
		let oldDistance = this.collideDistanceMapping[node.name];
		let newDistance = getS(this.node1.getPosition(), this.node2.getPosition(), node.getPosition());
		let where = getT(this.node1.getPosition(), this.node2.getPosition(), node.getPosition());
		if ((where < -0.0) || (1.0 < where)) {
			newDistance = 0;
		}
		this.collideDistanceMapping[node.name] = newDistance;
		if (oldDistance * newDistance < 0) {
			if ((where >= -0) && (where <= 1)) {
				let detail = {
					'where': where,
					'from': oldDistance,
					'collider': node,
					'tensor': this,
					'truss': truss,
				};
				let event = new CustomEvent('collisionEvent', {
					'detail': detail,
					'bubbles': true,
					'cancelable': true,
				});
				document.dispatchEvent(event);
				return detail;
			}
		}
	};


	/**
	 * @param  {number} type Where 0 is unselect, 1 means its pointed on and 2 is selected
	 */
	setHighlight(type) {
		this.highlighted=type;
	}

	/**
	 * Draws the tensor on a given Canvas. The graphicDebugLevel determines how many details that should be displayed
	 * @param  {truss} truss
	 * @param  {number} graphicDebugLevel=0
	 */
	show(truss, graphicDebugLevel = 0) {
		let result = super.show(truss, 0, graphicDebugLevel);
		if (result) {
			return result;
		}
		let view = truss.view;
		let ctx = view.context;
		let node1 = this.node1;
		let node2 = this.node2;
		if (this.isGhost() || !this.visible || this.visible=='0') {
			return;
		}
		if ( ( ((graphicDebugLevel >= 4) || graphicDebugLevel==2)) ||
			(graphicDebugLevel >= 6)) {
			this.highLight(ctx);
			ctx.beginPath();
			view.drawLine(node1.getPosition(), node2.getPosition());
			ctx.stroke();
			if (graphicDebugLevel >= 10) { // Show debug text
				ctx.beginPath();
				ctx.fillStyle = 'cyan';
				ctx.font = '20px Arial';
				ctx.textAlign = 'left';
				let textPos = Vector.addVectors(node1.getPosition(), Vector.divideVector(this.getActual(), 2));
				view.drawText(textPos, Math.trunc(10 * this.getLength()) / 10);
			}
		}
	};

	/**
	 * @param  {Context} ctx
	 */
	highLight(ctx) {
		ctx.strokeStyle = this.getColour();
		ctx.lineWidth = 3;
		if (!this.highlighted) {
			ctx.shadowBlur = 0;
			ctx.shadowColor = 'black';
		} else if (this.highlighted == 1) {
			ctx.shadowBlur = 40;
			ctx.lineWidth = 4;
			ctx.strokeStyle='orange';
			ctx.shadowColor = 'orange';
		} else {
			ctx.shadowBlur = 60;
			ctx.shadowColor = 'yellow';
			ctx.lineWidth = 6;
			ctx.strokeStyle='yellow';
		}
	}

	/**
	* Calculate the force 
	*/
	calculateForce() {
		super.calculateForce(0);
	}

	/**
	* Calculate the second stage of forces (probably only absorbers based 
		on velocity rather than position, to make the world 'calmer' ) 
	*/
	calculateForce2() {
		super.calculateForce(1);
	}

	/*
	* Calculate the force in the Spring based on current length
	*
	calculateForceSpring() {
		let actualVector = this.getActual();
		let normalized = actualVector.normalizeVector(this.equilibriumLength);
		let diffVector = Vector.subtractVectors(actualVector, normalized);
		this.force = Vector.multiplyVector(-this.constant, diffVector);
	}

	/**
	* Calculate the force in the Spring based on current length
	*
	calculateForcePull() {
		let actualVector = this.getActual();
		if ((this.equilibriumLength > 0) && (Vector.length2(actualVector) < this.equilibriumLength * this.equilibriumLength)) {
			this.force = new Force(0, 0);
		} else {
			this.calculateForceSpring();
		}
	}

	/**
	* Calculate the force in the Spring based on current length
	*
	calculateForcePush() {
		let actualVector = this.getActual();
		if ((this.equilibriumLength > 0) && (Vector.length2(actualVector) > this.equilibriumLength * this.equilibriumLength)) {
			this.force = new Force(0, 0);
		} else {
			this.calculateForceSpring();
		}
	}

	/**
	* Calculate the force in the Field based on distance and mass of the nodes
	*
	calculateForceField() {
		let actualVector = this.getActual();
		let normalized = actualVector.normalizeVector(1);
		let forceSize = this.constant * this.node1.mass * this.node2.mass / this.getLengthSquare();
		this.force = Vector.multiplyVector(-forceSize, normalized);
	} */

	/**
	* Calculate the force in the Absorber based on the relative speed between the nodes
	*
	calculateForceAbsorber() {
		let actualVector = this.getActual();
		let internalSpeed = Vector.subtractVectors(this.node1.velocity, this.node2.velocity);
		let parallellVelocity = Vector.multiplyVector(
			Vector.dotProduct(actualVector, internalSpeed),
			Vector.divideVector(actualVector, this.getLengthSquare()));
		this.force = Vector.multiplyVector(this.dampeningConstant, parallellVelocity);
	}*/

	/**
	* Using a space separated list, list the labels that should be added
	* @param  {string} labels
	*/
	addLabel(labels) {
		this.labelString+=labels+' ';
		this.labels =
				this.world.labels.parse(this.labelString, this);
	}
}

/**
 * A PictureSpring works like a spring but has an attached picture
 *
 *  * @class
 * @augments Spring
 */
class PictureSpring extends Tensor {
	/**
	 * @constructor
	 * @param  {Node} node1
	 * @param  {Node} node2
	 * @param  {number} constant
	 * @param  {String} pictureReference
	 * @param  {number} width
	 */
	constructor(node1, node2, constant = 1, pictureReference, width) {
		super(node1, node2, constant);
		this.pictureReference=pictureReference;
		this.width=width;
		this.stretch=1;
		this.length=this.equilibriumLength;

		this.addProperty(new Property(this,
			'pictureReference', 'pictureReference', 'Picture filename', ParameteType.STRING, ParameterCategory.CONTENT,
			'The picture filename.'));
		this.addProperty(new Property(this,
			'width', 'width', 'Width', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The picture width out from the tensor'));

		this.addProperty(new Property(this,
			'length', 'length', 'Picture length', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'How long should the picture be along the tensor length'));

		this.addProperty(new Property(this,
			'stretch', 'stretch', 'Stretch', ParameteType.SWITCH, ParameterCategory.CONTENT,
			'If active the picture will stretchout between the nodes, otherwise it '+
			'will keep its length and be clipped if the tensor gets too short.'));

		if (this.pictureReference) {
			this.createHTMLPicture(this.pictureReference);
		}

		this.addLabel('picture');
	}

	/**
	 * @param  {string} pictureReference
	 */
	createHTMLPicture(pictureReference) {
		this.element = document.createElement('img');
		this.element.style.position = 'absolute';
		this.element.src = 'Resources/' + pictureReference;
		this.element.style.zIndex = -1;
		this.element.style.width = '100%';
		this.element.style.height = '100%';
		this.element.style.left = 0;
		this.element.style.top = 0;
		this.node1.parentTrussNode.truss.element.appendChild(this.element);
		this.height=this.element.offsetHeight;
		this.width=this.element.offsetWidth;
	}

	/**
		 * @param  {Array} nodeList
		 * @param  {Array} tensorList
		 * @return {Object}
		 */
	serialize(nodeList, tensorList) {
		let representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname='PictureSpring';
		representationObject.pictureReference=this.pictureReference;
		representationObject.width=this.width;
		representationObject.stretch=this.stretch;
		representationObject.length=this.length;
		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Spring}
	 */
	deserialize(restoreObject, nodeList, tensorList) {
		super.deserialize(restoreObject, nodeList, tensorList);
		this.originalParent = tensorList[restoreObject.originalParent];
		this.pictureReference=restoreObject.pictureReference;
		this.width=restoreObject.width;
		this.stretch=restoreObject.stretch;
		this.length=restoreObject.length;


		this.createHTMLPicture(this.pictureReference);

		return this;
	}

	/**
	* @param {number} on
	*/
	setVisible(on) {
	}

	/**
	 * Draws the tensor on a given Canvas. The graphicDebugLevel determines how many details that should be displayed
	 * @param  {truss} truss
	 * @param  {number} graphicDebugLevel=0
	 */
	show(truss, graphicDebugLevel = 0) {
		super.show(truss, graphicDebugLevel);

		let a = Vector.addVectors(this.node1.getPosition(), this.getActual().perpendicular().normalizeVector(this.width / 2));
		let c = Vector.addVectors(this.node1.getPosition(), this.getActual().perpendicular(-1).normalizeVector(this.width / 2));
		let b=0;
		let d=0;

		if (this.stretch && this.stretch!='0') {
			b = Vector.addVectors(this.node2.getPosition(), this.getActual().perpendicular().normalizeVector(this.width / 2));
			d = Vector.addVectors(this.node2.getPosition(), this.getActual().perpendicular(-1).normalizeVector(this.width / 2));
		} else {
			let normVector = this.getActual().normalizeVector(this.length);
			let newnormal = Vector.addVectors(this.node1.getPosition(), normVector);

			b = Vector.addVectors(newnormal, this.getActual().perpendicular().normalizeVector(this.width / 2));
			d = Vector.addVectors(newnormal, this.getActual().perpendicular(-1).normalizeVector(this.width / 2));

			this.element.style.clip = 'rect(0px, ' +
				Math.round(this.width * this.getLength() / this.length) + 'px, 1000px, 0px)';
		}

		warpMatrix(truss, this, a, b, c, d, this.width, this.height);
	};
}

