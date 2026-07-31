import { Node } from '../../Nodes/Node.js';
import { Tensor } from '../../Tensors.js';
import { warpMatrix } from '../Pictures.js';
import { universe } from '../../globals.js';
import { Position, Vector } from '../../Primitives.js';

/**
 * @class
 * BannerNode manages banner UI and display coordinate physics nodes.
 * NOT a world node - it doesn't extend Node or get added to physics.
 */
class BannerNode {
	/** This class displays a banner containing a HTML element.
	 * @param  {TrussNode} truss
	 * @param  {HTMLElement} editParameterElement
	 * @param  {HTMLElement} propertyElement
	 */
	constructor(truss, editParameterElement, propertyElement) {
		this.truss = truss;
		this.name = 'bannerNode';
		this.element = editParameterElement;
		this.propertyElement = propertyElement;
		this.isListening = false;
		
		// Get world and parentTrussNode from truss for creating display nodes
		let anchorTrussNode = truss.parentTrussNode;
		if (!anchorTrussNode) {
			anchorTrussNode = truss;
		}
		let anchorWorld = anchorTrussNode.world;
		if (!anchorWorld) {
			anchorWorld = truss.world;
		}
		this.world = anchorWorld;
		this.parentTrussNode = anchorTrussNode;
		
		let _this=this;

		this.eventListenerFunction = function(e) {
			if (universe.currentNode==_this.parentTrussNode) {
				_this.showPropertyElements(e);
			}
		};
	}

	create(truss, topScreenPos) {
		this.element.style.display = 'block';
		this.truss = truss;
		this.width = this.element.offsetWidth;
		this.height = this.element.offsetHeight;
		let screenWidth = this.element.offsetWidth;
		let screenHeight = this.element.offsetHeight;
		if (!topScreenPos) {
			topScreenPos = new Position(truss.view.screenSize.x - screenWidth, 0);
		}

		// Get the pre-created display coordinate system from the view
		const displayCoordinateSystem = truss.view.displayCoordinateSystem;

		// Convert screen positions to percentage coordinates
		// X: 0 = left, 100 = right; Y: 0 = bottom, 100 = top
		const canvasWidth = truss.view.screenSize.x;
		const canvasHeight = truss.view.screenSize.y;
		
		const topLeftPercentX = 70;
		const topLeftPercentY = 90;
		const topRightPercentX = 95;
		const centerPercentX = 85;
		const centerPercentY = 100;
		const bottomPercentY = 20;

		// Earth gravity well: calculate distance to Earth's center
		// 100% screen = 40 cm (physical)
		// 1% = 0.4 cm = 0.004 m
		// Earth's radius = 6,371 km = 6.371e6 m
		// Distance in percentages: (6.371e6 m / 0.004 m/%) = 1.59275e9 %
		const EARTH_CENTER_DISTANCE_PERCENT = -1.59275e9;  // Below display origin
		// Gravity constant scaled for display coordinates (percentage-based, not meters)
		// This creates noticeable downward force on banner nodes
		const GRAVITY_CONSTANT = -0.001;  // Scaled for display coordinate space

		this.nail = new Node(this.world, this.parentTrussNode, 'node banner', {
			'localPosition': new Position(centerPercentX, centerPercentY),
			'coordinateSystem': displayCoordinateSystem,
			'name': 'nail',
			'mass': 1,
			'velocityLoss': 1.0,
		});

		this.leftTopNode = new Node(this.world, this.parentTrussNode, 'node banner moveable', {
			'localPosition': new Position(topLeftPercentX, topLeftPercentY),
			'coordinateSystem': displayCoordinateSystem,
			'name': 'leftTop',
			'mass': 1,
			'velocityLoss': 0.99,
		});

		this.rightTopNode = new Node(this.world, this.parentTrussNode, 'node banner moveable', {
			'localPosition': new Position(topRightPercentX, topLeftPercentY),
			'coordinateSystem': displayCoordinateSystem,
			'name': 'rightTop',
			'mass': 1,
			'velocityLoss': 0.99,
		});

		this.bannerGravityWell = new Node(this.world, this.parentTrussNode, 'node banner', {
			'localPosition': new Position(0, EARTH_CENTER_DISTANCE_PERCENT),
			'coordinateSystem': displayCoordinateSystem,
			'name': 'bannerGravityWell',
			'mass': 5.972e24,  // Earth's mass
			'velocityLoss': 1.0,
		});

		this.leftBottomNode = new Node(this.world, this.parentTrussNode, 'node banner moveable', {
			'localPosition': new Position(topLeftPercentX, bottomPercentY),
			'coordinateSystem': displayCoordinateSystem,
			'name': 'leftBottomNode',
			'mass': 3,
			'color': 'transparent',
			'velocityLoss': 0.9,
		});

		this.rightBottomNode = new Node(this.world, this.parentTrussNode, 'node banner moveable', {
			'localPosition': new Position(topRightPercentX, bottomPercentY),
			'coordinateSystem': displayCoordinateSystem,
			'name': 'rightBottomNode',
			'mass': 3,
			'color': 'transparent',
			'velocityLoss': 0.9,
		});

		this.leftBottomField = new Tensor(this.leftBottomNode, this.bannerGravityWell, 'field banner ', {
			'constant': GRAVITY_CONSTANT,  // Newton's gravitational constant
			'color': 'transparent',
		});

		this.rightBottomField = new Tensor(this.rightBottomNode, this.bannerGravityWell, 'field banner', {
			'constant': GRAVITY_CONSTANT,  // Newton's gravitational constant
			'color': 'transparent',
			'coordinatesystem': displayCoordinateSystem,
		});

		this.leftBand = new Tensor(this.leftTopNode, this.nail, 'absorber pullspring banner', {
			'equilibriumLength': 18,
			'dampeningConstant': 10,
			'constant': 5000,
			'visible': 1,
		});

		this.rightBand = new Tensor(this.rightTopNode, this.nail, 'pullspring absorber banner', {
			'equilibriumLength': 18,
			'dampeningConstant': 10,
			'constant': 5000,
			'visible': 1,
		});

		this.topBand = new Tensor(this.leftTopNode, this.rightTopNode, 'spring absorber banner', {
			'equilibriumLength': 54,
			'dampeningConstant': 10,
			'constant': 3000,
		});


		this.leftSpring = new Tensor(this.leftTopNode, this.leftBottomNode, 'spring absorber banner', {
			'equilibriumLength': 24,
			'dampeningConstant': 10,
			'constant': 2000,
			'color': 'rgba(100, 200, 100, 0.5)',  // Semi-transparent green
			'visible': 1,
		});

		this.rightSpring = new Tensor(this.rightTopNode, this.rightBottomNode, 'spring absorber banner', {
			'equilibriumLength': 24,
			'dampeningConstant': 10,
			'constant': 2000,
			'color': 'rgba(100, 200, 100, 0.5)',  // Semi-transparent green
			'visible': 1,
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
	/**
	 * Set visibility of the banner element
	 * @param {boolean} visible
	 */
	setVisible(visible) {
		if (this.element) {
			this.element.style.display = visible ? 'block' : 'none';
		}
	}

	show(truss, time, graphicDebugLevel = 0) {
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

		// Position banner content using DISPLAY coordinates (stays fixed on screen regardless of zoom/pan)
		if (this.element && this.leftTopNode && this.rightTopNode && this.leftBottomNode && this.rightBottomNode) {
			// Convert display percentages to screen pixels
			let screenWidth = truss.view.screenSize.x;
			let screenHeight = truss.view.screenSize.y;
			
			// Convert from display percentages (0-100%) to screen pixels
			let topLeftScreenPos = new Position(
				(this.leftTopNode.displayPositionX / 100) * screenWidth,
				screenHeight - (this.leftTopNode.displayPositionY / 100) * screenHeight
			);
			let topRightScreenPos = new Position(
				(this.rightTopNode.displayPositionX / 100) * screenWidth,
				screenHeight - (this.rightTopNode.displayPositionY / 100) * screenHeight
			);
			let bottomLeftScreenPos = new Position(
				(this.leftBottomNode.displayPositionX / 100) * screenWidth,
				screenHeight - (this.leftBottomNode.displayPositionY / 100) * screenHeight
			);
			let bottomRightScreenPos = new Position(
				(this.rightBottomNode.displayPositionX / 100) * screenWidth,
				screenHeight - (this.rightBottomNode.displayPositionY / 100) * screenHeight
			);
			
			// Pass screen positions to warpMatrix - we'll tell it to skip view transformation
			// by setting a label that marks this as display coordinates
			warpMatrix(truss, this,
				topLeftScreenPos,
				topRightScreenPos,
				bottomLeftScreenPos,
				bottomRightScreenPos,
				this.width,
				this.height);
		}

		if (graphicDebugLevel > 0) {
			// Additional debug rendering if needed
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
	 * Update property values continuously (called from render loop)
	 */
	updateProperties() {
		if (this.iO && this.iO.properties) {
			this.iO.properties.updatePropertyValues(this.iO);
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
