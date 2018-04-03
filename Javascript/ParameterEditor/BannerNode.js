
/**
 * @class
 * @extends Node
 */
class BannerNode extends Node {
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
	}

	/**
	 * @param  {Truss} truss
	 * @param  {Position} topScreenPos
	 */
	create(truss, topScreenPos) {
		this.element.style.display = 'block';
		this.truss = truss;
		let screenWidth = this.element.offsetWidth;
		let screenHeight = this.element.offsetHeight;
		if (!topScreenPos) {
			topScreenPos=new Position(truss.view.screenSize.x-screenWidth, 0);
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
	}


	/**
	 * @param  {Array} superNodeList
	 * @param  {Array} superTensorList
	 */
	serialize(superNodeList, superTensorList) {
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
				warpMatrix(truss, this.element,
					this.leftTopNode.getPosition(),
					this.rightTopNode.getPosition(),
					this.leftBottomNode.getPosition(),
					this.rightBottomNode.getPosition());
			}
		}
	};
}
