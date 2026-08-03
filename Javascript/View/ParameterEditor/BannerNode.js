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
		
		const topLeftPercentX = 60;
		const topLeftPercentY = 80;
		const topRightPercentX = 99;
		const centerPercentX = 80;
		const centerPercentY = 99;
		const bottomPercentY = 30;

		// Gravity well: simulate Earth gravity (9.82 m/s²) at screen scale
		// Screen = 40 cm = 0.4 m physical
		// Gravity well positioned 2m below (500% units, since 100% = 0.4m)
		// Step 10 of 10: 5.89e10 kg (full Earth gravity)
		const GRAVITY_WELL_Y = -500;
		const GRAVITY_WELL_MASS = 5.89e10;

		// Get the pre-created display coordinate system from the view
		const displayCoordinateSystem = truss.view.displayCoordinateSystem;

		this.nail = new Node(this.world, this.parentTrussNode, 'banner node moveable plane anchor', {
			'localPosition': new Position(centerPercentX, centerPercentY),
			'coordinateSystem': displayCoordinateSystem,
			'name': 'nail',
			'mass': Infinity,
			'plane': 'display',
		});

		this.leftTopNode = new Node(this.world, this.parentTrussNode, 'banner node moveable plane', {
			'localPosition': new Position(topLeftPercentX, topLeftPercentY),
			'coordinateSystem': displayCoordinateSystem,
			'name': 'leftTop',
			'mass': 0.1,
			'velocityLoss': 0.9,
			'plane': 'display',
		});
		this.rightTopNode = new Node(this.world, this.parentTrussNode, 'banner node moveable plane', {
			'localPosition': new Position(topRightPercentX, topLeftPercentY),
			'coordinateSystem': displayCoordinateSystem,
			'name': 'rightTop',
			'mass': 0.1,
			'velocityLoss': 0.9,
			'plane': 'display',
		});
		this.bannerGravityWell = new Node(this.world, this.parentTrussNode, 'banner node moveable plane', {
			'localPosition': new Position(centerPercentX, GRAVITY_WELL_Y),
			'coordinateSystem': displayCoordinateSystem,
			'name': 'bannerGravityWell',
			'mass': GRAVITY_WELL_MASS,
			'velocityLoss': 1.0,
			'plane': 'display',
		});

		this.leftBottomNode = new Node(this.world, this.parentTrussNode, 'banner node moveable plane', {
			'localPosition': new Position(topLeftPercentX, bottomPercentY),
			'coordinateSystem': displayCoordinateSystem,
			'name': 'leftBottomNode',
			'mass': 0.3,
			'color': 'transparent',
			'velocityLoss': 0.9,
			'plane': 'display',
		});

		this.rightBottomNode = new Node(this.world, this.parentTrussNode, 'banner node moveable plane', {
			'localPosition': new Position(topRightPercentX, bottomPercentY),
			'coordinateSystem': displayCoordinateSystem,
			'name': 'rightBottomNode',
			'mass': 0.3,
			'color': 'transparent',
			'velocityLoss': 0.9,
			'plane': 'display',
		});

		this.leftBand = new Tensor(this.leftTopNode, this.nail, 'absorber pullspring banner', {
			'equilibriumLength': 20,
			'dampeningConstant': 15,
			'constant': 500,
			'visible': 1,
		});

		this.rightBand = new Tensor(this.rightTopNode, this.nail, 'pullspring absorber banner', {
			'equilibriumLength': 20,
			'dampeningConstant': 15,
			'constant': 500,
			'visible': 1,
		});

		this.topBand = new Tensor(this.leftTopNode, this.rightTopNode, 'spring absorber banner', {
			'equilibriumLength': 40,
			'dampeningConstant': 12,
			'constant': 350,
		});


		this.leftSpring = new Tensor(this.leftTopNode, this.leftBottomNode, 'spring absorber banner', {
			'equilibriumLength': 50,
			'dampeningConstant': 13,
			'constant': 650,
			'color': 'transparent',
		});

		this.rightSpring =new Tensor(this.rightTopNode, this.rightBottomNode, 'spring absorber banner', {
			'equilibriumLength': 50,
			'dampeningConstant': 13,
			'constant': 650,
			'color': 'transparent',
		});

		this.leftBottomField = new Tensor(this.leftBottomNode, this.bannerGravityWell, 'pullspring banner', {
			'equilibriumLength': 10,
			'dampeningConstant': 10,
			'constant': 1,  // Gravitational attraction constant
			'color': 'transparent',
		});

		this.rightBottomField = new Tensor(this.rightBottomNode, this.bannerGravityWell, 'pullspring banner', {
			'equilibriumLength': 10,
			'dampeningConstant': 10,
			'constant': 1,  // Gravitational attraction constant
			'color': 'transparent',
		});

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
					this.leftTopNode,
					this.rightTopNode,
					this.leftBottomNode,
					this.rightBottomNode,
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
