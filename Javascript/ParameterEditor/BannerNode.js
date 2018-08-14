<<<<<<< HEAD

=======
>>>>>>> newtestbranch
/**
 * @class
 * @extends Node
 */
class BannerNode extends Node {
<<<<<<< HEAD
	/** This class displays a banner containing a HTML element. (Probably only used for property editing)
	 * @param  {Truss} truss
	 * @param  {HTMLElement} element
	 */
	constructor(truss, element) {
		super();
		this.element = element;

		Object.defineProperty(this, 'idString', {
			get: function() {
				if (this.element) {
					return this.element.id;
				}
			},
			set: function(value) {
				let oldElement = this.element;
				if (oldElement) {
					restoreMatrix(oldElement);
				}
				let newElement = document.getElementById(value);
				if (newElement) {
					this.element = newElement;
				} else {
					this.element = undefined;
				}
			},
		});

		this.addProperty(new Property(this,
			'idString', 'idString', 'Element id', ParameteType.STRING, ParameterCategory.CONTENT,
			'The HTML elements id.'));
=======
	/** This class displays a banner containing a HTML element.
	 * @param  {Truss} truss
	 * @param  {HTMLElement} editParameterElement
	 * @param  {HTMLElement} propertyElement
	 */
	constructor(truss, editParameterElement, propertyElement) {
		super(truss.parentTrussNode.world, truss.parentTrussNode, 'banner sensor');
		this.name = 'bannerNode';
		this.element = editParameterElement;
		this.propertyElement = propertyElement;
		let _this=this;

		this.eventListenerFunction = function(e) {
			if (universe.currentNode==_this.parentTrussNode) {
				_this.showPropertyElements(e);
			}
		};
		this.parentTrussNode.element.addEventListener('selectionEvent', this.eventListenerFunction, false);
>>>>>>> newtestbranch
	}

	/**
	 * @param  {Truss} truss
	 * @param  {Position} topScreenPos
<<<<<<< HEAD
=======
	 * @return {Node}
>>>>>>> newtestbranch
	 */
	create(truss, topScreenPos) {
		this.element.style.display = 'block';
		this.truss = truss;
<<<<<<< HEAD
		let screenWidth = this.element.offsetWidth;
		let screenHeight = this.element.offsetHeight;
		if (!topScreenPos) {
			topScreenPos=new Position(truss.view.screenSize.x-screenWidth, 0)
		}

		this.nail = truss.addNode(new Node(truss,
			truss.view.worldPosition(topScreenPos.x + screenWidth / 2, topScreenPos.y / 2), NaN, 'nail', 0, 0, 0.99));
		this.leftTopNode = truss.addNode(new Node(truss,
			truss.view.worldPosition(topScreenPos.x, topScreenPos.y), 1, 'leftTop', 0, 0, 0.99));
		this.rightTopNode = truss.addNode(new Node(truss,
			truss.view.worldPosition(topScreenPos.x + screenWidth, topScreenPos.y), 1, 'rightTop', 0, 0, 0.99));
		let {
			node,
			gravity,
		} = truss.addGravityNodeAndTensor(new Node(truss,
			truss.view.worldPosition(topScreenPos.x, topScreenPos.y + screenHeight), 10, 'leftBottom', 0, 0, 0.99));
		this.leftBottomNode = node;
		this.leftBottomField = gravity;
		let {
			'node': x,
			'gravity': y,
		} = truss.addGravityNodeAndTensor(new Node(truss,
			truss.view.worldPosition(topScreenPos.x + screenWidth, topScreenPos.y + screenHeight), 10, 'rightBottom', 0, 0, 0.99));
		this.rightBottomNode = x;
		this.rightBottomField = y;
		this.leftBand = truss.addTensor(new PullSpring(this.leftTopNode, this.nail, 2000));
		this.rightBand = truss.addTensor(new PullSpring(this.nail, this.rightTopNode, 2000));
		this.topBand = truss.addTensor(new Spring(this.leftTopNode, this.rightTopNode, 3000));
		this.leftSpring = truss.addTensor(new PullSpring(this.leftTopNode, this.leftBottomNode, 100));
		this.rightSpring = truss.addTensor(new PullSpring(this.rightTopNode, this.rightBottomNode, 100));
=======
		this.width = this.element.offsetWidth;
		this.height = this.element.offsetHeight;
		let screenWidth = this.element.offsetWidth;
		let screenHeight = this.element.offsetHeight + 500;
		if (!topScreenPos) {
			topScreenPos = new Position(truss.view.screenSize.x - screenWidth, 0);
		}

		this.nail = new Node(this.world, this.parentTrussNode, 'node banner', {
			'localPosition': truss.view.worldPosition(topScreenPos.x + screenWidth / 2, topScreenPos.y / 2),
			'name': 'nail',
			'mass': NaN,
		});

		this.leftTopNode = new Node(this.world, this.parentTrussNode, 'node banner moveable', {
			'localPosition': truss.view.worldPosition(topScreenPos.x, topScreenPos.y),
			'name': 'leftTop',
			'mass': 1,
			'velocityLoss': 0.9,
		});
		this.rightTopNode = new Node(this.world, this.parentTrussNode, 'node banner moveable', {
			'localPosition': truss.view.worldPosition(topScreenPos.x + screenWidth, topScreenPos.y),
			'name': 'rightTop',
			'mass': 1,
			'velocityLoss': 0.9,
		});
		this.bannerGravityWell = new Node(this.world, this.parentTrussNode, 'node banner', {
			'localPosition': truss.view.worldPosition(screenWidth / 2, screenHeight * 1000),
			'name': 'bannerGravityWell',
		});

		this.leftBottomNode = new Node(this.world, this.parentTrussNode, 'node banner moveable', {
			'localPosition': truss.view.worldPosition(topScreenPos.x, topScreenPos.y + screenHeight),
			'name': 'leftBottomNode',
			'mass': 3,
			'color': 'transparent',
			'velocityLoss': 0.9,
		});

		this.rightBottomNode = new Node(this.world, this.parentTrussNode, 'node banner moveable banner', {
			'localPosition': truss.view.worldPosition(topScreenPos.x + screenWidth, topScreenPos.y + screenHeight),
			'name': 'rightBottomNode',
			'mass': 3,
			'color': 'transparent',
			'velocityLoss': 0.9,
		});

		this.leftBand = new Tensor(this.leftTopNode, this.nail, 'absorber pullspring banner', {
			'equilibriumLength': 6,
			'dampeningConstant': 10,
			'constant': 5000,
			'visible': 1,
		});

		this.rightBand = new Tensor(this.rightTopNode, this.nail, 'pullspring absorber banner', {
			'equilibriumLength': 6,
			'dampeningConstant': 10,
			'constant': 5000,
			'visible': 1,
		});

		this.topBand = new Tensor(this.leftTopNode, this.rightTopNode, 'spring absorber banner', {
			'equilibriumLength': 18,
			'dampeningConstant': 10,
			'constant': 3000,
		});


		this.leftSpring = new Tensor(this.leftTopNode, this.leftBottomNode, 'spring absorber banner', {
			'equilibriumLength': 8,
			'dampeningConstant': 10,
			'constant': 600,
			'color': 'transparent',
		});

		this.rightSpring =new Tensor(this.rightTopNode, this.rightBottomNode, 'spring absorber banner', {
			'equilibriumLength': 8,
			'dampeningConstant': 10,
			'constant': 600,
			'color': 'transparent',
		});

		this.leftBottomField = new Tensor(this.leftBottomNode, this.bannerGravityWell, 'pullspring banner', {
			'equilibriumLength': 0,
			'dampeningConstant': 10,
			'constant': 0.1,
			'color': 'transparent',
		});

		this.rightBottomField = new Tensor(this.rightBottomNode, this.bannerGravityWell, 'pullspring banner', {
			'equilibriumLength': 0,
			'dampeningConstant': 10,
			'constant': 0.1,
			'color': 'transparent',
		});

		this.visible = true;
		return this.nail;
>>>>>>> newtestbranch
	}

	/**
	 * @param  {Truss} truss
	 */
	hide() {
		if (!this.truss) {
			return;
		}
		this.element.style.display = 'none';
<<<<<<< HEAD
		this.truss.removeTensor(this.leftBand);
		this.truss.removeTensor(this.rightBand);
		this.truss.removeTensor(this.topBand);
		this.truss.removeTensor(this.leftSpring);
		this.truss.removeTensor(this.rightSpring);
		this.truss.removeTensor(this.leftBottomField);
		this.truss.removeTensor(this.rightBottomField);

		this.truss.removeNode(this.nail);
		this.truss.removeNode(this.leftTopNode);
		this.truss.removeNode(this.rightTopNode);
		this.truss.removeNode(this.leftBottomNode);
		this.truss.removeNode(this.rightBottomNode);
=======
		let bannerLabel=this.truss.parentTrussNode.world.labels.findLabel('banner');

		let loop = bannerLabel.getReferences().slice();
		for (let reference of loop) {
			reference.unreference();
		}
>>>>>>> newtestbranch
	}


	/**
	 * @param  {Array} superNodeList
	 * @param  {Array} superTensorList
	 */
	serialize(superNodeList, superTensorList) {
<<<<<<< HEAD
		return;
		// let representationObject = super.serialize(superNodeList, superTensorList);
		// representationObject.classname = 'HTMLNode';
		// return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} superNodes
	 * @param  {Array} superTensors
	 */
	deserialize(restoreObject, superNodes, superTensors) {
		return;
	}
=======
		alert('The BannerNode should never be stored.');
		return;
	}

>>>>>>> newtestbranch

	/** Displays the Truss's canvas at the correct position
	 * @param  {Truss} truss
	 * @param  {number} time
	 * @param  {number} graphicDebugLevel=0
	 */
	show(truss, time, graphicDebugLevel = 0) {
		super.show(truss, time, graphicDebugLevel);
		this.highLight(truss.view.context);

		if (graphicDebugLevel > 0) {
			if (this.element) {
<<<<<<< HEAD
				warpMatrix(truss, this.element,
					this.leftTopNode.getPosition(),
					this.rightTopNode.getPosition(),
					this.leftBottomNode.getPosition(),
					this.rightBottomNode.getPosition());
			}
		}
	};
=======
				warpMatrix(truss, this,
					this.leftTopNode.getPosition(),
					this.rightTopNode.getPosition(),
					this.leftBottomNode.getPosition(),
					this.rightBottomNode.getPosition(),
					this.width,
					this.height);
			}
		}
	};

	/**
	 * @param  {Event} selectionEvent
	 */
	showPropertyElements(selectionEvent) {
		this.iO = selectionEvent.detail.selectedObject;

		this.propertyElement.innerHTML='';
		if (this.iO) {
			// this.iO.properties.populateProperties(this.element);
			this.iO.populateProperties(this.propertyElement);
		}
	}

	/**
	 * Call this before discarding to remove nodes and event listeners
	 */
	close() {
		this.parentTrussNode.element.removeEventListener('selectionEvent', this.eventListenerFunction);
	}

	/**
	 *
	 */
	activate() {
		this.parentTrussNode.element.addEventListener('selectionEvent', this.eventListenerFunction);
	}

	/**
	 * Use sense in order to make pause work
	 * @param {number} deltaTime
	 * @param {Truss} truss
	 */
	sense(deltaTime, truss) {
		// super.updatePosition(time, deltaTime);
		if (this.iO) {
			this.iO.properties.updatePropertyValues(this.iO);
		}
	}
>>>>>>> newtestbranch
}
