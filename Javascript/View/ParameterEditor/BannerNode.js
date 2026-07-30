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
		// Allow normal interaction with banner element (clicks, inputs)
		// Zoom won't work when fingers are over the banner, which is acceptable
		
		this.truss = truss;
		this.width = this.element.offsetWidth;
		this.height = this.element.offsetHeight;
		let screenWidth = this.element.offsetWidth;
		// Use the element height directly without the extra 500px padding
		let screenHeight = this.element.offsetHeight;
		if (!topScreenPos) {
			// Safety check: ensure view has screenSize
			if (!truss.view || !truss.view.screenSize) {
				console.warn(`⚠️ BannerNode.create(): truss.view or screenSize is undefined`);
				topScreenPos = new Position(0, 0);
			} else {
				topScreenPos = new Position(truss.view.screenSize.x - screenWidth, 0);
			}
		}
		
		console.log(`ℹ️ BannerNode creating banner at screenPos (${topScreenPos.x}, ${topScreenPos.y}), size ${screenWidth}x${screenHeight}`);

		// DISPLAY COORDINATE SYSTEM
		// Banner operates in display coordinates (screen-relative)
		// Positions are in SCREEN PIXELS (not scaled)
		// This keeps banner independent of zoom/pan transforms
		// Scale: only physics parameters (mass, springs) scaled 0.01x
		// Positions stay in screen pixels so they render at correct visual location
		const DISPLAY_SCALE = 0.01;  // Only for physics parameters, NOT positions
		
		// Positions stay in screen space (not scaled)
		// When rendering with displaycoordinates label, these are used directly as pixel coordinates
		const screenLeftTop = new Position(topScreenPos.x, topScreenPos.y);
		const screenRightTop = new Position(topScreenPos.x + screenWidth, topScreenPos.y);
		const screenLeftBottom = new Position(topScreenPos.x, topScreenPos.y + screenHeight);
		const screenRightBottom = new Position(topScreenPos.x + screenWidth, topScreenPos.y + screenHeight);
		const screenNailPos = new Position(topScreenPos.x + screenWidth / 2, topScreenPos.y / 2);
		
		console.log(`✓ Banner created in display coordinate space (zoom-independent):`);
		console.log(`  nail: (${screenNailPos.x.toFixed(2)}, ${screenNailPos.y.toFixed(2)})`);
		console.log(`  leftTop: (${screenLeftTop.x.toFixed(2)}, ${screenLeftTop.y.toFixed(2)})`);
		console.log(`  rightTop: (${screenRightTop.x.toFixed(2)}, ${screenRightTop.y.toFixed(2)})`);
		console.log(`  leftBottom: (${screenLeftBottom.x.toFixed(2)}, ${screenLeftBottom.y.toFixed(2)})`);
		console.log(`  rightBottom: (${screenRightBottom.x.toFixed(2)}, ${screenRightBottom.y.toFixed(2)})`);

		this.nail = new Node(this.world, this.parentTrussNode, 'node banner nogravity displaycoordinates', {
			'localPosition': screenNailPos,
			'name': 'nail',
			'mass': NaN,
		});

		this.leftTopNode = new Node(this.world, this.parentTrussNode, 'node banner moveable nogravity displaycoordinates', {
			'localPosition': screenLeftTop,
			'name': 'leftTop',
			'mass': 1,  // Physics scale handled separately below
			'velocityLoss': 0.9,
		});
		this.rightTopNode = new Node(this.world, this.parentTrussNode, 'node banner moveable nogravity displaycoordinates', {
			'localPosition': screenRightTop,
			'name': 'rightTop',
			'mass': 1,
			'velocityLoss': 0.9,
		});
		// NOTE: No synthetic bannerGravityWell created
		// Banner gravity is provided by Earth's gravity well (if it exists)
		// See gravity connections below

		this.leftBottomNode = new Node(this.world, this.parentTrussNode, 'node banner moveable velocityloss displaycoordinates', {
			'localPosition': screenLeftBottom,
			'name': 'leftBottomNode',
			'mass': 3,
			'color': 'transparent',
			'velocityLoss': 0.9999,
		});

		this.rightBottomNode = new Node(this.world, this.parentTrussNode, 'node banner moveable velocityloss displaycoordinates', {
			'localPosition': screenRightBottom,
			'name': 'rightBottomNode',
			'mass': 3,
			'color': 'transparent',
			'velocityLoss': 0.9999,
		});

		this.leftBand = new Tensor(this.leftTopNode, this.nail, 'absorber pullspring banner', {
			'equilibriumLength': 60,
			'dampeningConstant': 10,
			'constant': 50,
			'visible': 1,
		});

		this.rightBand = new Tensor(this.rightTopNode, this.nail, 'pullspring absorber banner', {
			'equilibriumLength': 60,
			'dampeningConstant': 10,
			'constant': 50,
			'visible': 1,
		});

		this.topBand = new Tensor(this.leftTopNode, this.rightTopNode, 'spring absorber banner', {
			'equilibriumLength': 200,
			'dampeningConstant': 10,
			'constant': 30000,
			'visible': 1,
		});


		this.leftSpring = new Tensor(this.leftTopNode, this.leftBottomNode, 'spring absorber banner', {
			'equilibriumLength': 108,
			'dampeningConstant': 40,
			'constant': 200000,
			'color': 'transparent',
			'visible': 1,
		});

		this.rightSpring = new Tensor(this.rightTopNode, this.rightBottomNode, 'spring absorber banner', {
			'equilibriumLength': 108,
			'dampeningConstant': 40,
			'constant': 200000,
			'color': 'transparent',
			'visible': 1,
		});

		// Banner bottom nodes (leftBottomNode, rightBottomNode) are in display coordinates
		// They don't connect to world-scale gravity (which would be the wrong scale)
		// Instead, they hang naturally due to spring forces and physics
		// Top nodes are marked with 'nogravity' so they stay anchored by springs

		// Display coordinate nodes operate independently from world nodes
		// No gravity field connection is created - springs alone create the hanging effect
		console.log(`✓ Banner: Created with displaycoordinates label (zoom-independent physics)`);
		

		this.visible = true;
		
		// Start logging banner corner positions every 10 seconds
		this.startPositionLogging();
		
		return this.nail;
	}

	/**
	 * Log the positions of the 4 corner nodes every 10 seconds to track physics changes
	 */
	startPositionLogging() {
		if (this.positionLoggingInterval) {
			clearInterval(this.positionLoggingInterval);
		}
		
		this.positionLoggingInterval = setInterval(() => {
			if (this.leftTopNode && this.rightTopNode && this.leftBottomNode && this.rightBottomNode && this.truss?.view) {
				const leftTop = this.leftTopNode.getPosition();
				const rightTop = this.rightTopNode.getPosition();
				const leftBottom = this.leftBottomNode.getPosition();
				const rightBottom = this.rightBottomNode.getPosition();
				
				const width = rightTop.x - leftTop.x;
				const height = leftBottom.y - leftTop.y;
				
				// Get zoom level (worldViewSize is the visible world area)
				const zoomLevel = this.truss.view.worldViewSize.x.toFixed(2);
				
				console.log(`📐 Banner at zoom=${zoomLevel} (every 10s):`);
				console.log(`  leftTop:     (${leftTop.x.toFixed(2)}, ${leftTop.y.toFixed(2)})`);
				console.log(`  rightTop:    (${rightTop.x.toFixed(2)}, ${rightTop.y.toFixed(2)})`);
				console.log(`  leftBottom:  (${leftBottom.x.toFixed(2)}, ${leftBottom.y.toFixed(2)})`);
				console.log(`  rightBottom: (${rightBottom.x.toFixed(2)}, ${rightBottom.y.toFixed(2)})`);
				console.log(`  Width: ${width.toFixed(2)}, Height: ${height.toFixed(2)}`);
			}
		}, 10000);
	}

	/**
	 * @param  {TrussNode} truss
	 */
	hide() {
		if (!this.truss) {
			return;
		}
		this.element.style.display = 'none';
		
		// Clean up position logging interval
		if (this.positionLoggingInterval) {
			clearInterval(this.positionLoggingInterval);
			this.positionLoggingInterval = null;
		}
		
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

		// Show all banner nodes and tensors (they're in display coordinates)
		if (this.nail) {
			this.nail.show(truss, time, graphicDebugLevel);
		}
		if (this.leftTopNode) {
			this.leftTopNode.show(truss, time, graphicDebugLevel);
		}
		if (this.rightTopNode) {
			this.rightTopNode.show(truss, time, graphicDebugLevel);
		}
		if (this.leftBottomNode) {
			this.leftBottomNode.show(truss, time, graphicDebugLevel);
		}
		if (this.rightBottomNode) {
			this.rightBottomNode.show(truss, time, graphicDebugLevel);
		}
		
		// Show all banner tensors
		if (this.leftBand) {
			this.leftBand.show(truss, graphicDebugLevel);
		}
		if (this.rightBand) {
			this.rightBand.show(truss, graphicDebugLevel);
		}
		if (this.topBand) {
			this.topBand.show(truss, graphicDebugLevel);
		}
		if (this.leftSpring) {
			this.leftSpring.show(truss, graphicDebugLevel);
		}
		if (this.rightSpring) {
			this.rightSpring.show(truss, graphicDebugLevel);
		}

		// Always apply position transform (both debug and normal mode)
		// warpMatrix handles displaycoordinates label to skip zoom/pan for display nodes
		if (this.element && this.leftTopNode && this.rightTopNode && this.leftBottomNode && this.rightBottomNode) {
			warpMatrix(truss, this,
				this.leftTopNode.getPosition(),
				this.rightTopNode.getPosition(),
				this.leftBottomNode.getPosition(),
				this.rightBottomNode.getPosition(),
				this.width,
				this.height);
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
