/**
 * @class
 * @extends Node
 */
class BannerNode extends Node {
	/** This class displays a banner containing a HTML element.
	 * @param  {Truss} truss
	 * @param  {HTMLElement} element
	 */
	constructor(truss, element) {
		super(truss.parentTrussNode.world, truss.parentTrussNode, 'banner');
		this.name = 'bannerNode';
		this.element = element;
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

		this.nail = truss.addNode(new Node(this.world, this.parentTrussNode, 'node banner', {
			'localPosition': truss.view.worldPosition(topScreenPos.x + screenWidth / 2, topScreenPos.y / 2),
			'name': 'nail',
			'mass': NaN,
		}));

		this.leftTopNode = truss.addNode(new Node(this.world, this.parentTrussNode, 'node banner moveable', {
			'localPosition': truss.view.worldPosition(topScreenPos.x, topScreenPos.y),
			'name': 'leftTop',
			'mass': 1,
		}));
		this.rightTopNode = truss.addNode(new Node(this.world, this.parentTrussNode, 'node banner moveable', {
			'localPosition': truss.view.worldPosition(topScreenPos.x + screenWidth, topScreenPos.y),
			'name': 'rightTop',
			'mass': 1,
		}));
		this.bannerGravityWell = truss.addNode(new Node(this.world, this.parentTrussNode, 'node banner', {
			'localPosition': truss.view.worldPosition(screenWidth / 2, screenHeight * 1000),
			'name': 'bannerGravityWell',
		}));

		this.leftBottomNode = truss.addNode(new Node(this.world, this.parentTrussNode, 'node banner moveable', {
			'localPosition': truss.view.worldPosition(topScreenPos.x, topScreenPos.y + screenHeight),
			'name': 'leftBottomNode',
			'mass': 3,
			'color': 'transparent',
		}));

		this.rightBottomNode = truss.addNode(new Node(this.world, this.parentTrussNode, 'node banner moveable', {
			'localPosition': truss.view.worldPosition(topScreenPos.x + screenWidth, topScreenPos.y + screenHeight),
			'name': 'rightBottomNode',
			'mass': 3,
			'color': 'transparent',
		}));

		this.leftBand = truss.addTensor(new Tensor(this.leftTopNode, this.nail, 'pullspring absorber', {
			'equilibriumLength': 6,
			'dampeningConstant': 10,
			'constant': 5000,
		}));

		this.rightBand = truss.addTensor(new Tensor(this.rightTopNode, this.nail, 'pullspring absorber', {
			'equilibriumLength': 6,
			'dampeningConstant': 10,
			'constant': 5000,
		}));

		this.topBand = truss.addTensor(new Tensor(this.leftTopNode, this.rightTopNode, 'spring absorber', {
			'equilibriumLength': 18,
			'dampeningConstant': 10,
			'constant': 3000,
		}));


		this.leftSpring = truss.addTensor(new Tensor(this.leftTopNode, this.leftBottomNode, 'spring absorber', {
			'equilibriumLength': 6,
			'dampeningConstant': 10,
			'constant': 600,
			'color': 'transparent',
		}));

		this.rightSpring = truss.addTensor(new Tensor(this.rightTopNode, this.rightBottomNode, 'spring absorber', {
			'equilibriumLength': 6,
			'dampeningConstant': 10,
			'constant': 600,
			'color': 'transparent',
		}));

		this.leftBottomField = truss.addTensor(new Tensor(this.leftBottomNode, this.bannerGravityWell, 'pullspring', {
			'equilibriumLength': 0,
			'dampeningConstant': 10,
			'constant': 0.1,
			'color': 'transparent',
		}));

		this.rightBottomField = truss.addTensor(new Tensor(this.rightBottomNode, this.bannerGravityWell, 'pullspring', {
			'equilibriumLength': 0,
			'dampeningConstant': 10,
			'constant': 0.1,
			'color': 'transparent',
		}));

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
		this.truss.removeNode(this.bannerGravityWell);
	}


	/**
	 * @param  {Array} superNodeList
	 * @param  {Array} superTensorList
	 */
	serialize(superNodeList, superTensorList) {
		alert('The BannerNode should never be stored.');
		return;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} superNodes
	 * @param  {Array} superTensors
	 */
	deserialize(restoreObject, superNodes, superTensors) {
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
}
