import { Node } from '../../Nodes/Node.js';
import { Tensor } from '../../Model/Tensors.js';
import { warpMatrix } from '../View/Pictures.js';
import { universe } from '../../Utils/globals.js';
import { Position, Vector } from '../../Model/Primitives.js';
import { updateBannerInspectorHeader } from './BannerInspector.js';

const EARTH_MASS_KG = 5.97219e24;
const EARTH_RADIUS_METERS = 6371e3;
const EARTH_GRAVITY_CONSTANT = 6.6743e-11;
const DISPLAY_METERS_PER_PERCENT = 0.004;
const DISPLAY_EARTH_RADIUS = EARTH_RADIUS_METERS / DISPLAY_METERS_PER_PERCENT;
const DISPLAY_GRAVITY_CONSTANT = -EARTH_GRAVITY_CONSTANT / Math.pow(DISPLAY_METERS_PER_PERCENT, 3);

/**
 * @class
 * @extends Node
 * 
 * TERMINOLOGY: "Banner"
 * A banner is a parameter editor window that pops up on the display plane
 * when a node or tensor is selected. It appears as a floating UI element
 * suspended by animated springs (banner nodes) and allows the user to view
 * and modify properties of the selected node or tensor in real-time.
 * The banner is positioned using physics simulation for smooth, natural movement.
 */
class BannerNode extends Node {
	/** This class displays a banner containing a HTML element.
	 * @param  {TrussNode} truss
	 * @param  {HTMLElement} bannerContainer
	 * @param  {HTMLElement} propertyElement
	 */
	constructor(truss, bannerContainer, propertyElement) {
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
		this.element = bannerContainer;
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
		this.element.classList.remove('hidden');
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

		const gravityWellY = bottomPercentY - DISPLAY_EARTH_RADIUS;

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
			'localPosition': new Position(centerPercentX, gravityWellY),
			'coordinateSystem': displayCoordinateSystem,
			'name': 'bannerGravityWell',
			'mass': EARTH_MASS_KG,
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
		  'name': 'hangerLeft',
			'dampeningConstant': 15,
			'constant': 500,
			'visible': 1,
		});

		this.rightBand = new Tensor(this.rightTopNode, this.nail, 'pullspring absorber banner', {
			'equilibriumLength': 20,
		  'name': 'hangerRight',
			'dampeningConstant': 15,
			'constant': 500,
			'visible': 1,
		});

		this.topBand = new Tensor(this.leftTopNode, this.rightTopNode, 'spring absorber banner', {
			'equilibriumLength': 40,
		  'name': 'hangerBar',
			'dampeningConstant': 12,
			'constant': 350,
		});


		this.leftSpring = new Tensor(this.leftTopNode, this.leftBottomNode, 'spring absorber banner', {
			'equilibriumLength': 50,
		  'name': 'bannerLeftGuard',
			'dampeningConstant': 13,
			'constant': 650,
			'color': 'transparent',
		});

		this.rightSpring =new Tensor(this.rightTopNode, this.rightBottomNode, 'spring absorber banner', {
			'equilibriumLength': 50,
		  'name': 'bannerRightGuard',
			'dampeningConstant': 13,
			'constant': 650,
			'color': 'transparent',
		});

		this.leftBottomField = new Tensor(this.bannerGravityWell, this.leftBottomNode, 'field banner', {
			'name': 'bannerLeftGravity',
			'constant': DISPLAY_GRAVITY_CONSTANT,
			'color': 'transparent',
			'visible': 0,
		});

		this.rightBottomField = new Tensor(this.bannerGravityWell, this.rightBottomNode, 'field banner', {
			'name': 'bannerRightGravity',
			'constant': DISPLAY_GRAVITY_CONSTANT,
			'color': 'transparent',
			'visible': 0,
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
		this.element.classList.add('hidden');
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
			this.iO.populateProperties(this.propertyElement, true);
		}
		updateBannerInspectorHeader(this.iO);
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
			this.iO.properties.updatePropertyValues(this.iO, true);
		}
	}
}

export { BannerNode };
