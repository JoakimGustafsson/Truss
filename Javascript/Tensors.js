/**
<<<<<<< HEAD
 *
=======
 * Tensor class
 * @class
 * @extends StoreableObject
>>>>>>> newtestbranch
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


<<<<<<< HEAD
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
		this.tensorType = type;
		this.properties = new PropertyList();
		this.collideDistanceMapping = {};
		this.force = 0;
		this.ghost = false;
		this.isTensor=true;
		this.color='grey';

		this.addProperty(new Property(this,
			'constant', 'constant', 'Constant', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The links constant.'));
		this.addProperty(new Property(this,
			'tensorType', 'tensorType', 'Type', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The links type number.'));
		this.addProperty(new Property(this,
			'angle1', 'angle1', 'Angle 1', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The angle the node connects to the start node.'));
		this.addProperty(new Property(this,
			'angle2', 'angle2', 'Angle 2', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'The angle the node connects to the end node.'));
		this.addProperty(new Property(this,
			'color', 'color', 'Colour', ParameteType.STRING, ParameterCategory.CONTENT,
			'The colour of the tensor.'));
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
		middleButton.innerHTML = this.getName();
		this.registerOnClick(middleButton, this);
		div.appendChild(middleButton);

		let rightButton=document.createElement('button');
		rightButton.classList.add('trussButton');
		rightButton.classList.add('tensorButtonRight');
		rightButton.innerHTML = sign;
		/* rightButton.onclick= function(x) {
			if (_this.node1==leftNode) {
				_this.addNode2(sensor);
			} else {
				_this.addNode1(sensor);
			}
		};*/
		div.appendChild(rightButton);

		let _this = this;
		if (_this.node1 == leftNode) {
			leftButton.onclick = function(x) {
				_this.addNode1(sensor);
			};
			rightButton.onclick = function(x) {
				_this.addNode2(sensor);
			};
		} else {
			leftButton.onclick = function(x) {
				_this.addNode2(sensor);
			};
			rightButton.onclick = function(x) {
				_this.addNode1(sensor);
			};
		}

		this.selectionEventListener=document.addEventListener('selectionEvent',
			function(e) {
				if (_this && sensor && selectedObject && selectedObject.isNode) {
					_this.sensorAttach();
					_this = undefined;
				}
			}, false);

		return div;
	}


	/**
	 * @param {Tensor} tensor
	 */
	sensorAttach() {
		if (this.node1 == sensor) {
			this.addNode1(selectedObject);
		} else if (this.node2 == sensor) {
			this.addNode2(selectedObject);
		}
		if (this.selectionEventListener) {
			document.removeEventListener('selectionEvent', this.selectionEventListener);
		}
	}

	/**
=======
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
>>>>>>> newtestbranch
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

<<<<<<< HEAD
		let button0 = leftNode.generateHTML(this);
		div.appendChild(button0);
=======
		// let button0 = leftNode.generateHTML(this);
		// div.appendChild(button0);
>>>>>>> newtestbranch

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
<<<<<<< HEAD
			let previousSelectedObject = selectedObject;
			selectedObject = node1;
			let event = new CustomEvent('selectionEvent', {
				detail: {
					'selectedObject': selectedObject,
					'previousSelectedObject': previousSelectedObject,
					'truss': undefined,
=======
			let previousSelectedObject = universe.selectedObject;
			universe.selectedObject = node1;
			let event = new CustomEvent('selectionEvent', {
				detail: {
					'selectedObject': universe.selectedObject,
					'previousSelectedObject': previousSelectedObject,
					'trussNode': node1.parentNode,
>>>>>>> newtestbranch
				},
				bubbles: true,
				cancelable: true,
			});
<<<<<<< HEAD
			document.dispatchEvent(event);
=======
			universe.currentNode.element.dispatchEvent(event);
>>>>>>> newtestbranch
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
<<<<<<< HEAD
	 * @return {Property}
	 */
	populateProperties(element) {
		return this.properties.populateProperties(element);
	}

	/**
	 * @param  {Array} localNodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(localNodeList, tensorList) {
		let representation={'classname': 'Tensor'};
		representation.node1=localNodeList.indexOf(this.node1);
=======
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

		/* representation.node1=localNodeList.indexOf(this.node1);
>>>>>>> newtestbranch
		representation.node2=localNodeList.indexOf(this.node2);

		if (this.breakStartTensor) {
			representation.breakStartTensor=tensorList.indexOf(this.breakStartTensor);
		}
		if (this.breakEndTensor) {
			representation.breakEndTensor=tensorList.indexOf(this.breakEndTensor);
		}
		if (this.next) {
			representation.next=tensorList.indexOf(this.next);
		}
		if (this.previous) {
			representation.previous=tensorList.indexOf(this.previous);
		}

<<<<<<< HEAD
		representation.angle1=this.angle1;
		representation.angle2=this.angle2;
		representation.constant=this.constant;
		representation.tensorType=this.tensorType;
		representation.force=this.force;
		representation.ghost=this.ghost;
=======
		representation.angle1= isNaN(this.angle1) ? 'NaN' : this.angle1;
		representation.angle2= isNaN(this.angle2) ? 'NaN' : this.angle2;
		representation.force=this.force;
		representation.ghost=this.ghost;
		representation.isTensor=this.isTensor;
		representation.color=this.color;
		representation.labelString=this.labelString; */
>>>>>>> newtestbranch

		return representation;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Tensor}
<<<<<<< HEAD
	 */
	deserialize(restoreObject, nodeList, tensorList) {
		// super.deserialize(restoreObject);
=======
	 *
	deserialize(restoreObject, nodeList, tensorList) {
		super.deserialize(restoreObject);
>>>>>>> newtestbranch
		this.node1=nodeList[restoreObject.node1];
		this.node2=nodeList[restoreObject.node2];
		this.angle1=restoreObject.angle1;
		this.angle2=restoreObject.angle2;


		if (restoreObject.next) {
			this.next=tensorList[restoreObject.next];
		}
		if (restoreObject.previous) {
			this.previous=tensorList[restoreObject.previous];
		}
		if (restoreObject.breakStartTensor) {
			this.breakStartTensor=tensorList[restoreObject.breakStartTensor];
		}
		if (restoreObject.breakEndTensor) {
			this.breakEndTensor=tensorList[restoreObject.breakEndTensor];
		}

<<<<<<< HEAD
		this.constant=restoreObject.constant;

		this.tensorType=restoreObject.tensorType;
		this.force=restoreObject.force;
		this.ghost=restoreObject.ghost;

		return this;
	}
=======

		this.force=restoreObject.force;
		this.ghost=restoreObject.ghost;
		this.isTensor=restoreObject.isTensor;
		this.color=restoreObject.color;

		this.labelString = restoreObject.labelString;
		this.labels = this.world.labels.parse(this.labelString, this);

		return this;
	} */
>>>>>>> newtestbranch

	/**
	 * @return {string} The name of the tensor
	 */
	getName() {
<<<<<<< HEAD
=======
		if (this.labels && this.labels.length>0) {
			return this.labels[0].name;
		}
>>>>>>> newtestbranch
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

	/**
	 * @param  {Node} node
	 * @param  {number} angle
<<<<<<< HEAD
	 */
=======
	 *
>>>>>>> newtestbranch
	addNode1(node, angle) {
		if (this.node1) {
			this.node1.removeTensor(this);
		}
		this.node1 = node;
		if (angle ) {
			this.angle1 = angle;
		} else {
			this.angle1 = angleSubstract(this.getTensorAngle(node), node.getAngle());
		}
		if (node) {
			node.addTensor(this);
		}
	};

	/**
	 * @param  {Node} node
	 * @param  {number} angle
<<<<<<< HEAD
	 */
=======
	 *
>>>>>>> newtestbranch
	addNode2(node, angle) {
		if (this.node2) {
			this.node2.removeTensor(this);
		}
		this.node2 = node;
		if (angle) {
			this.angle2 = angle;
		} else {
			this.angle2 = angleSubstract(this.getTensorAngle(node), node.getAngle());
		}
		if (node) {
			node.addTensor(this);
		}
<<<<<<< HEAD
	};
=======
	}; */
>>>>>>> newtestbranch

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


	/** Given a node. Return the angle that the tensor wants o have wrt to the node
	 * @param  {Node} node
	 * @return {number} wanted angle
	 */
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
	 */
	getTorque(node) {
		let idealAngle = this.getIdealAngle(node);
<<<<<<< HEAD
=======
		if (isNaN(idealAngle)) {
			return 0;
		}
>>>>>>> newtestbranch
		let tensorAngle = this.getTensorAngle(node);
		let theNodeShouldHaveAngle = tensorAngle-idealAngle;

		let nodeAngle = anglify(node.getAngle());
		let correctionAngle = anglify(theNodeShouldHaveAngle - nodeAngle);


		// let wantedAbsoluteAngle = relativeIdealAngle + nodeAngle;
		// let absoluteTensorAngle = this.getTensorAngle(node);
		// // let relativeTensorAngle = angleAdd(absoluteTensorAngle, nodeAngle);
		// let angleToCorrect = wantedAbsoluteAngle - absoluteTensorAngle;
		let torque= node.getTorqueConstant() * correctionAngle;
		if (node==this.node1) {
			this.torque1=-torque;
		} else {
			this.torque2=-torque;
		}
		return torque;
	};

	/** This retrieves a torque that has been previously calculated during the calculatetorque step.
	 * @param  {Node} node
	 * @return {number}
	 */
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
	 */
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
	};

	/**
	 * Makes sure the actual nodes will take this tensor into consideration
<<<<<<< HEAD
	 */
	addToTruss() {
		this.addNode1(this.node1);
		this.addNode2(this.node2);
	};
=======
	 *
	addToTruss() {
		return;
		alert('why?');
		this.addNode1(this.node1);
		this.addNode2(this.node2);
	}; */
>>>>>>> newtestbranch


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
<<<<<<< HEAD
	removeFromTruss() {
=======
	unreference() {
		this.world.labels.clearOldReferences(this);
>>>>>>> newtestbranch
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
		// if (this.callback) {
		//	this.callback(this);
		// }

		let directedforce;
		if (node == this.node2) {
			directedforce = this.force;
		} else {
			directedforce = this.force.opposite();
		}

		return Vector.addVectors(directedforce, this.calculateTorqueForce(node));
	};

	/** Return {string} the HTML color of the tensor
	 * @return {string} the HTML color of the tensor
	 */
	getColour() {
<<<<<<< HEAD
		return this.color;
=======
		if (this.color) {
			return this.color;
		} else return 'white';
>>>>>>> newtestbranch
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
				let event = new CustomEvent('collisionEvent', {
					detail: {
						'where': where,
						'from': oldDistance,
						'collider': node,
						'tensor': this,
						'truss': truss,
					},
					bubbles: true,
					cancelable: true,
				});
				document.dispatchEvent(event);
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
		let view = truss.view;
		let ctx = view.context;
		let node1 = this.node1;
		let node2 = this.node2;
<<<<<<< HEAD
		if (this.isGhost()) {
			return;
		}
		if ( (((graphicDebugLevel >= 4) || (graphicDebugLevel==2)) && (this.tensorType != TensorType.FIELD)) ||
=======
		if (this.isGhost() || !this.visible || this.visible=='0') {
			return;
		}
		if ( ( ((graphicDebugLevel >= 4) || graphicDebugLevel==2)) ||
>>>>>>> newtestbranch
			(graphicDebugLevel >= 6)) {
			this.highLight(ctx);
			ctx.beginPath();
			view.drawLine(node1.getPosition(), node2.getPosition());
			ctx.stroke();
<<<<<<< HEAD
			if (graphicDebugLevel >= 10) {
=======
			if (graphicDebugLevel >= 10) { // Show debug text
>>>>>>> newtestbranch
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

<<<<<<< HEAD

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
		this.addProperty(new Property(this,
			'equilibriumLength', 'equilibriumLength', 'Length', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'How long should the relaxed spring be.'));
	}

	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		let representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname='Spring';
		representationObject.equilibriumLength=this.equilibriumLength;
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
		this.equilibriumLength=restoreObject.equilibriumLength;
		return this;
	}

	/**
		 * Calculate the force in the Spring based on current length
		 */
	calculateForce() {
		// if (!this.node1 || !this.node2)
		//	return this.force=new Force(0,0);
=======
	/**
	* Calculate the force in the Spring based on current length
	*/
	calculateForceSpring() {
>>>>>>> newtestbranch
		let actualVector = this.getActual();
		let normalized = actualVector.normalizeVector(this.equilibriumLength);
		let diffVector = Vector.subtractVectors(actualVector, normalized);
		this.force = Vector.multiplyVector(-this.constant, diffVector);
	}
<<<<<<< HEAD
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
		this.originalParent = undefined; // To remember that this can be set by linebreakers
	}

	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		let representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname='PullSpring';
		representationObject.originalParent = tensorList.indexOf(this.originalParent);
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
		return this;
	}

	/**
		 * Calculate the force in the Spring based on current length
		 */
	calculateForce() {
		let actualVector = this.getActual();
		if ((this.equilibriumLength > 0) && (Vector.length2(actualVector) < this.equilibriumLength * this.equilibriumLength)) {
			this.force = new Force(0, 0);
		} else {
			Spring.prototype.calculateForce.call(this);
			// console.log(length(this.force));
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
		this.color='blue';
	}

	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 * @return {Object}
	 */
	serialize(nodeList, tensorList) {
		let representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname='Field';
		return representationObject;
	}

	/**
		 * Calculate the force in the Field based on distance between the nodes
		 */
	calculateForce() {
		let actualVector = this.getActual();
		let normalized = actualVector.normalizeVector(1);
		let forceSize = this.constant * this.node1.mass * this.node2.mass / this.getLengthSquare();
		this.force = Vector.multiplyVector(-forceSize, normalized);
=======

	/**
	* Calculate the force in the Spring based on current length
	*/
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
	*/
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
	*/
	calculateForceField() {
		let actualVector = this.getActual();
		let normalized = actualVector.normalizeVector(1);
		let forceSize = this.constant * this.node1.mass * this.node2.mass / this.getLengthSquare();
		this.force = Vector.multiplyVector(-forceSize, normalized);
	}

	/**
	* Calculate the force in the Absorber based on the relative speed between the nodes
	*/
	calculateForceAbsorber() {
		let actualVector = this.getActual();
		let internalSpeed = Vector.subtractVectors(this.node1.velocity, this.node2.velocity);
		let parallellVelocity = Vector.multiplyVector(
			Vector.dotProduct(actualVector, internalSpeed),
			Vector.divideVector(actualVector, this.getLengthSquare()));
		this.force = Vector.multiplyVector(this.dampeningConstant, parallellVelocity);
	}

	/**
	* Using a space separated list, list the labels that should be added
	* @param  {string} labels
	*/
	addLabel(labels) {
		this.labelString+=labels+' ';
		this.labels =
				this.world.labels.parse(this.labelString, this);
>>>>>>> newtestbranch
	}
}

/**
<<<<<<< HEAD
 * An absorber work against the velocity between the nodes.
 * The higher the "parallell" velocity is, the higher the force
 * counteracting it will be.
 * @class
 * @augments Tensor
 */
class Absorber extends Tensor {
=======
 * A PictureSpring works like a spring but has an attached picture
 *
 *  * @class
 * @augments Spring
 */
class PictureSpring extends Tensor {
>>>>>>> newtestbranch
	/**
	 * @constructor
	 * @param  {Node} node1
	 * @param  {Node} node2
	 * @param  {number} constant
<<<<<<< HEAD
	 * @param  {TensorType} type
	 */
	constructor(node1, node2, constant = 1, type = TensorType.ABSORBER) {
		super(node1, node2, constant, type);
		this.color='green';
	}

	/**
		 * @param  {Array} nodeList
		 * @param  {Array} tensorList
		 * @return {Object}
		 */
	serialize(nodeList, tensorList) {
		let representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname='Absorber';
		return representationObject;
	}

	/**
		 * Calculate the force in the Field based on the relative velocity between the nodes
		*/
	calculateForce() {
		let actualVector = this.getActual();
		let internalSpeed = Vector.subtractVectors(this.node1.velocity, this.node2.velocity);
		let parallellVelocity = Vector.multiplyVector(
			Vector.dotProduct(actualVector, internalSpeed),
			Vector.divideVector(actualVector, this.getLengthSquare()));
		this.force = Vector.multiplyVector(this.constant, parallellVelocity);
	}
}

/**
 * A PictureSpring works like a spring but has an attached picture
 *
 *  * @class
 * @augments Spring
 */
class PictureSpring extends Spring {
	/**
	 * @constructor
	 * @param  {Node} node1
	 * @param  {Node} node2
	 * @param  {number} constant
	 * @param  {String} pictureReference
	 * @param  {number} width
	 */
	constructor(node1, node2, constant = 1, pictureReference, width) {
		super(node1, node2, constant, TensorType.SPRING);
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
			'stretch', 'stretch', 'stretch or clip', ParameteType.NUMBER, ParameterCategory.CONTENT,
			'0 = clip, 1 = stretch'));

		/* TODO
		add option for swap picture direction. just modify call order to warp
		add option for putting picture above lineWidth
		add binary switch in settings
		add option for node picture.
		add an add&remove pic to all tensors. maybe a tensor modifier class.
		(add option for adjusting width)
		*/


		this.element = document.createElement('img');
		this.element.style.position='absolute';
		this.element.src='Resources/'+pictureReference;
		this.element.style.zIndex=-1;
		document.body.appendChild(this.element);
	}

=======
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

>>>>>>> newtestbranch
	/**
		 * @param  {Array} nodeList
		 * @param  {Array} tensorList
		 * @return {Object}
		 */
	serialize(nodeList, tensorList) {
		let representationObject = super.serialize(nodeList, tensorList);
		representationObject.classname='PictureSpring';
<<<<<<< HEAD
		alert('Picturespring not serialized');
=======
		representationObject.pictureReference=this.pictureReference;
		representationObject.width=this.width;
		representationObject.stretch=this.stretch;
		representationObject.length=this.length;
>>>>>>> newtestbranch
		return representationObject;
	}

	/**
<<<<<<< HEAD
=======
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
>>>>>>> newtestbranch
	 * Draws the tensor on a given Canvas. The graphicDebugLevel determines how many details that should be displayed
	 * @param  {truss} truss
	 * @param  {number} graphicDebugLevel=0
	 */
	show(truss, graphicDebugLevel = 0) {
		super.show(truss, graphicDebugLevel);

<<<<<<< HEAD
		this.a = Vector.addVectors(this.node1.getPosition(), this.getActual().perpendicular().normalizeVector(this.width / 2));
		this.c = Vector.addVectors(this.node1.getPosition(), this.getActual().perpendicular(-1).normalizeVector(this.width / 2));

		if (this.stretch && this.stretch!='0') {
			this.b = Vector.addVectors(this.node2.getPosition(), this.getActual().perpendicular().normalizeVector(this.width / 2));
			this.d = Vector.addVectors(this.node2.getPosition(), this.getActual().perpendicular(-1).normalizeVector(this.width / 2));
=======
		let a = Vector.addVectors(this.node1.getPosition(), this.getActual().perpendicular().normalizeVector(this.width / 2));
		let c = Vector.addVectors(this.node1.getPosition(), this.getActual().perpendicular(-1).normalizeVector(this.width / 2));
		let b=0;
		let d=0;

		if (this.stretch && this.stretch!='0') {
			b = Vector.addVectors(this.node2.getPosition(), this.getActual().perpendicular().normalizeVector(this.width / 2));
			d = Vector.addVectors(this.node2.getPosition(), this.getActual().perpendicular(-1).normalizeVector(this.width / 2));
>>>>>>> newtestbranch
		} else {
			let normVector = this.getActual().normalizeVector(this.length);
			let newnormal = Vector.addVectors(this.node1.getPosition(), normVector);

<<<<<<< HEAD
			this.b = Vector.addVectors(newnormal, this.getActual().perpendicular().normalizeVector(this.width / 2));
			this.d = Vector.addVectors(newnormal, this.getActual().perpendicular(-1).normalizeVector(this.width / 2));

			this.element.style.clip = 'rect(0px, ' +
				Math.round(this.element.offsetWidth * this.getLength() / this.length) + 'px, 1000px, 0px)';
		}

		warpMatrix(truss, this.element,
			this.a,
			this.b,
			this.c,
			this.d);
=======
			b = Vector.addVectors(newnormal, this.getActual().perpendicular().normalizeVector(this.width / 2));
			d = Vector.addVectors(newnormal, this.getActual().perpendicular(-1).normalizeVector(this.width / 2));

			this.element.style.clip = 'rect(0px, ' +
				Math.round(this.width * this.getLength() / this.length) + 'px, 1000px, 0px)';
		}

		warpMatrix(truss, this, a, b, c, d, this.width, this.height);
>>>>>>> newtestbranch
	};
}

