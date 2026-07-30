import { Node } from '../../Nodes/Node.js';
import { Tensor } from '../../Tensors.js';
import { warpMatrix } from '../Pictures.js';
import { universe } from '../../globals.js';
import { Position, Vector } from '../../Primitives.js';

/**
 * @class
 * @extends Node
 */
class BannerNode extends Node {
	/** This class displays a banner containing a HTML element.
	 * @param  {TrussNode} truss
	 * @param  {HTMLElement} editParameterElement
	 * @param  {HTMLElement} propertyElement
	 */
	constructor(truss, editParameterElement, propertyElement) {
		let anchorTrussNode = truss.parentTrussNode;
		if (!anchorTrussNode) {
			anchorTrussNode = truss;
		}
		let anchorWorld = anchorTrussNode.world;
		if (!anchorWorld) {
			anchorWorld = truss.world;
		}
		super(anchorWorld, anchorTrussNode, 'banner sensor');
		this.truss = truss;
		this.name = 'bannerNode';
		this.element = editParameterElement;
		this.propertyElement = propertyElement;
		this.isListening = false;
		let _this=this;

		this.eventListenerFunction = function(e) {
			if (universe.currentNode==_this.parentTrussNode) {
				_this.showPropertyElements(e);
			}
		};
	}

	/**
	 * @param  {TrussNode} truss
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

		// Convert screen positions to percentage coordinates
		// X: 0 = left, 100 = right; Y: 0 = bottom, 100 = top
		const canvasWidth = truss.view.screenSize.x;
		const canvasHeight = truss.view.screenSize.y;
		
		const topLeftPercentX = (topScreenPos.x / canvasWidth) * 100;
		const topLeftPercentY = 100 - (topScreenPos.y / canvasHeight) * 100;
		const topRightPercentX = ((topScreenPos.x + screenWidth) / canvasWidth) * 100;
		const centerPercentX = ((topScreenPos.x + screenWidth / 2) / canvasWidth) * 100;
		const centerPercentY = 100 - ((topScreenPos.y + screenHeight / 2) / canvasHeight) * 100;
		const bottomPercentY = 100 - ((topScreenPos.y + screenHeight) / canvasHeight) * 100;

		// Earth gravity well: calculate distance to Earth's center
		// 100% screen = 40 cm (physical)
		// 1% = 0.4 cm = 0.004 m
		// Earth's radius = 6,371 km = 6.371e6 m
		// Distance in percentages: (6.371e6 m / 0.004 m/%) = 1.59275e9 %
		const EARTH_CENTER_DISTANCE_PERCENT = -1.59275e9;  // Below display origin
		const GRAVITY_CONSTANT = -6.67e-11;  // Newton's gravitational constant for attractive force

		this.nail = new Node(this.world, this.parentTrussNode, 'node banner coordinatesystem', {
			'localPosition': truss.view.worldPosition(topScreenPos.x + screenWidth / 2, topScreenPos.y / 2),
			'name': 'nail',
			'mass': NaN,
			'velocityLoss': 1.0,
			'coordinatesystemProperty': 'display',
			'displayPositionX': centerPercentX,
			'displayPositionY': centerPercentY,
		});

		this.leftTopNode = new Node(this.world, this.parentTrussNode, 'node banner moveable coordinatesystem', {
			'localPosition': truss.view.worldPosition(topScreenPos.x, topScreenPos.y),
			'name': 'leftTop',
			'mass': 1,
			'velocityLoss': 0.9,
			'coordinatesystemProperty': 'display',
			'displayPositionX': topLeftPercentX,
			'displayPositionY': topLeftPercentY,
		});

		this.rightTopNode = new Node(this.world, this.parentTrussNode, 'node banner moveable coordinatesystem', {
			'localPosition': truss.view.worldPosition(topScreenPos.x + screenWidth, topScreenPos.y),
			'name': 'rightTop',
			'mass': 1,
			'velocityLoss': 0.9,
			'coordinatesystemProperty': 'display',
			'displayPositionX': topRightPercentX,
			'displayPositionY': topLeftPercentY,
		});

		this.bannerGravityWell = new Node(this.world, this.parentTrussNode, 'node banner coordinatesystem', {
			'localPosition': truss.view.worldPosition(screenWidth / 2, screenHeight * 1000),
			'name': 'bannerGravityWell',
			'mass': 5.972e24,  // Earth's mass
			'velocityLoss': 1.0,
			'coordinatesystemProperty': 'display',
			'displayPositionX': centerPercentX,
			'displayPositionY': EARTH_CENTER_DISTANCE_PERCENT,
		});

		this.leftBottomNode = new Node(this.world, this.parentTrussNode, 'node banner moveable coordinatesystem', {
			'localPosition': truss.view.worldPosition(topScreenPos.x, topScreenPos.y + screenHeight),
			'name': 'leftBottomNode',
			'mass': 3,
			'color': 'transparent',
			'velocityLoss': 0.9,
			'coordinatesystemProperty': 'display',
			'displayPositionX': topLeftPercentX,
			'displayPositionY': bottomPercentY,
		});

		this.rightBottomNode = new Node(this.world, this.parentTrussNode, 'node banner moveable banner coordinatesystem', {
			'localPosition': truss.view.worldPosition(topScreenPos.x + screenWidth, topScreenPos.y + screenHeight),
			'name': 'rightBottomNode',
			'mass': 3,
			'color': 'transparent',
			'velocityLoss': 0.9,
			'coordinatesystemProperty': 'display',
			'displayPositionX': topRightPercentX,
			'displayPositionY': bottomPercentY,
		});

		this.leftBottomField = new Tensor(this.leftBottomNode, this.bannerGravityWell, 'field banner coordinatesystem', {
			'constant': GRAVITY_CONSTANT,  // Newton's gravitational constant
			'color': 'transparent',
		});

		this.rightBottomField = new Tensor(this.rightBottomNode, this.bannerGravityWell, 'field banner coordinatesystem', {
			'constant': GRAVITY_CONSTANT,  // Newton's gravitational constant
			'color': 'transparent',
		});

		this.leftBand = new Tensor(this.leftTopNode, this.nail, 'absorber pullspring banner coordinatesystem', {
			'equilibriumLength': 6,
			'dampeningConstant': 10,
			'constant': 5000,
			'visible': 1,
		});

		this.rightBand = new Tensor(this.rightTopNode, this.nail, 'pullspring absorber banner coordinatesystem', {
			'equilibriumLength': 6,
			'dampeningConstant': 10,
			'constant': 5000,
			'visible': 1,
		});

		this.topBand = new Tensor(this.leftTopNode, this.rightTopNode, 'spring absorber banner coordinatesystem', {
			'equilibriumLength': 18,
			'dampeningConstant': 10,
			'constant': 3000,
		});


		this.leftSpring = new Tensor(this.leftTopNode, this.leftBottomNode, 'spring absorber banner coordinatesystem', {
			'equilibriumLength': 8,
			'dampeningConstant': 10,
			'constant': 2000,
			'color': 'transparent',
		});

		this.rightSpring =new Tensor(this.rightTopNode, this.rightBottomNode, 'spring absorber banner coordinatesystem', {
			'equilibriumLength': 8,
			'dampeningConstant': 10,
			'constant': 2000,
			'color': 'transparent',
		});

		// Note: bannerGravityWell is a display coordinate node that serves as an anchor point
		// Gravity effects for display coordinate nodes should be applied directly in the physics engine
		// rather than through tensor connections, to keep physics isolated per coordinate system

		this.visible = true;
		return this.nail;
	}

	/**
	 * @param  {TrussNode} truss
	 */
	hide() {
		if (!this.truss) {
			return;
		}
		this.element.style.display = 'none';
		let bannerWorld = this.truss.parentTrussNode && this.truss.parentTrussNode.world ? this.truss.parentTrussNode.world : this.world;
		let bannerLabel = bannerWorld.labels.findLabel('banner');

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
		console.error('The BannerNode should never be stored.');
		return {};
	}


	/** Displays the Truss's canvas at the correct position
	 * @param  {TrussNode} truss
	 * @param  {number} time
	 * @param  {number} graphicDebugLevel=0
	 */
	show(truss, time, graphicDebugLevel = 0) {
		super.show(truss, time, graphicDebugLevel);
		this.highLight(truss.view.context);

		// Always render banner components (nodes and tensors)
		if (this.nail) this.nail.show(truss, time, 3);
		if (this.leftTopNode) this.leftTopNode.show(truss, time, 3);
		if (this.rightTopNode) this.rightTopNode.show(truss, time, 3);
		if (this.leftBottomNode) this.leftBottomNode.show(truss, time, 3);
		if (this.rightBottomNode) this.rightBottomNode.show(truss, time, 3);
		
		// Render tensors
		if (this.leftBand) this.leftBand.show(truss, 2);
		if (this.rightBand) this.rightBand.show(truss, 2);
		if (this.topBand) this.topBand.show(truss, 2);
		if (this.leftSpring) this.leftSpring.show(truss, 2);
		if (this.rightSpring) this.rightSpring.show(truss, 2);
		if (this.leftBottomField) this.leftBottomField.show(truss, 2);
		if (this.rightBottomField) this.rightBottomField.show(truss, 2);

		if (graphicDebugLevel > 0) {
			if (this.element && this.leftTopNode && this.rightTopNode && this.leftBottomNode && this.rightBottomNode) {
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
		if (this.isListening) {
			this.parentTrussNode.element.removeEventListener('selectionEvent', this.eventListenerFunction);
			this.isListening = false;
		}
	}

	/**
	 *
	 */
	activate() {
		if (!this.isListening) {
			this.parentTrussNode.element.addEventListener('selectionEvent', this.eventListenerFunction, false);
			this.isListening = true;
		}
	}

	/**
	 * Use sense in order to make pause work
	 * @param {number} deltaTime
	 * @param {TrussNode} truss
	 */
	sense(deltaTime, truss) {
		// super.updatePosition(time, deltaTime);
		if (this.iO) {
			this.iO.properties.updatePropertyValues(this.iO);
		}
	}
}

export { BannerNode };
