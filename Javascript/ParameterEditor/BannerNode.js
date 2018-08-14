/**
 * @class
 * @extends Node
 */
class BannerNode extends Node {
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
	}

	/**
	 * @param  {Truss} truss
	 * @param  {Position} topScreenPos
	 * @return {Node}
	 */
	create(truss, topScreenPos) {
		this.element.style.display = 'block';
		this.truss = truss;
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
	}

	/**
	 * @param  {Truss} truss
	 */
	hide() {
		if (!this.truss) {
			return;
		}
		this.element.style.display = 'none';
		let bannerLabel=this.truss.parentTrussNode.world.labels.findLabel('banner');

		let loop = bannerLabel.getReferences().slice();
		for (let reference of loop) {
			reference.unreference();
		}
	}


	/**
	 * @param  {Array} superNodeList
	 * @param  {Array} superTensorList
	 */
	serialize(superNodeList, superTensorList) {
		alert('The BannerNode should never be stored.');
		return;
	}


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
}
