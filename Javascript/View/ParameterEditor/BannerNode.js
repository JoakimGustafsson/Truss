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

		// Debug: Log world positions being calculated
		let leftTop_world = truss.view && truss.view.worldPosition ? truss.view.worldPosition(topScreenPos.x, topScreenPos.y) : new Position(0, 0);
		let rightTop_world = truss.view && truss.view.worldPosition ? truss.view.worldPosition(topScreenPos.x + screenWidth, topScreenPos.y) : new Position(screenWidth, 0);
		let leftBottom_world = truss.view && truss.view.worldPosition ? truss.view.worldPosition(topScreenPos.x, topScreenPos.y + screenHeight) : new Position(0, screenHeight);
		let rightBottom_world = truss.view && truss.view.worldPosition ? truss.view.worldPosition(topScreenPos.x + screenWidth, topScreenPos.y + screenHeight) : new Position(screenWidth, screenHeight);
		
		console.log(`🔍 Banner node world positions:`);
		console.log(`  leftTop: (${leftTop_world.x.toFixed(2)}, ${leftTop_world.y.toFixed(2)})`);
		console.log(`  rightTop: (${rightTop_world.x.toFixed(2)}, ${rightTop_world.y.toFixed(2)})`);
		console.log(`  leftBottom: (${leftBottom_world.x.toFixed(2)}, ${leftBottom_world.y.toFixed(2)})`);
		console.log(`  rightBottom: (${rightBottom_world.x.toFixed(2)}, ${rightBottom_world.y.toFixed(2)})`);

		this.nail = new Node(this.world, this.parentTrussNode, 'node banner nogravity', {
			'localPosition': truss.view && truss.view.worldPosition ? truss.view.worldPosition(topScreenPos.x + screenWidth / 2, topScreenPos.y / 2) : new Position(0, 0),
			'name': 'nail',
			'mass': NaN,
		});

		this.leftTopNode = new Node(this.world, this.parentTrussNode, 'node banner moveable nogravity', {
			'localPosition': leftTop_world,
			'name': 'leftTop',
			'mass': 1,
			'velocityLoss': 0.9,
		});
		this.rightTopNode = new Node(this.world, this.parentTrussNode, 'node banner moveable nogravity', {
			'localPosition': rightTop_world,
			'name': 'rightTop',
			'mass': 1,
			'velocityLoss': 0.9,
		});
		// NOTE: No synthetic bannerGravityWell created
		// Banner gravity is provided by Earth's gravity well (if it exists)
		// See gravity connections below

		this.leftBottomNode = new Node(this.world, this.parentTrussNode, 'node banner moveable velocityloss', {
			'localPosition': leftBottom_world,
			'name': 'leftBottomNode',
			'mass': 3,
			'color': 'transparent',
			'velocityLoss': 0.9999,
		});

		this.rightBottomNode = new Node(this.world, this.parentTrussNode, 'node banner moveable velocityloss', {
			'localPosition': rightBottom_world,
			'name': 'rightBottomNode',
			'mass': 3,
			'color': 'transparent',
			'velocityLoss': 0.9999,
		});

		this.leftBand = new Tensor(this.leftTopNode, this.nail, 'absorber pullspring banner', {
			'equilibriumLength': 6,
			'dampeningConstant': 10,
			'constant': 50,
			'visible': 1,
		});

		this.rightBand = new Tensor(this.rightTopNode, this.nail, 'pullspring absorber banner', {
			'equilibriumLength': 6,
			'dampeningConstant': 10,
			'constant': 50,
			'visible': 1,
		});

		this.topBand = new Tensor(this.leftTopNode, this.rightTopNode, 'spring absorber banner', {
			'equilibriumLength': 18,
			'dampeningConstant': 10,
			'constant': 3000,
		});


		this.leftSpring = new Tensor(this.leftTopNode, this.leftBottomNode, 'spring absorber banner', {
			'equilibriumLength': 10.8,
			'dampeningConstant': 40,
			'constant': 20000,
			'color': 'transparent',
		});

		this.rightSpring = new Tensor(this.rightTopNode, this.rightBottomNode, 'spring absorber banner', {
			'equilibriumLength': 10.8,
			'dampeningConstant': 40,
			'constant': 20000,
			'color': 'transparent',
		});

		// Banner bottom nodes (leftBottomNode, rightBottomNode) are NOT marked with 'nogravity'
		// They will receive gravity field connections from Earth, allowing them to hang downward
		// Top nodes are marked with 'nogravity' so they stay anchored by springs instead of falling

		// CRITICAL: Connect bottom nodes to Earth's gravity well
		// These nodes need explicit gravity field tensors to experience gravitational force
		const gravityWellLabel = this.world.labels.findLabel('gravitywell');
		if (gravityWellLabel) {
			const gravityWells = gravityWellLabel.getNodes();
			if (gravityWells && gravityWells.length > 0) {
				const earthNode = gravityWells[0];
				const GRAVITY_CONSTANT = -6.67e-11;  // Negative for attraction (Newton's gravity)
				
				// Connect left bottom node to gravity
				this.gravityFieldLeft = new Tensor(earthNode, this.leftBottomNode, 'field', {
					'name': 'gravity-leftBottom',
					'constant': GRAVITY_CONSTANT,
					'visible': 0,  // Hide the gravity field lines
				});
				
				// Connect right bottom node to gravity
				this.gravityFieldRight = new Tensor(earthNode, this.rightBottomNode, 'field', {
					'name': 'gravity-rightBottom',
					'constant': GRAVITY_CONSTANT,
					'visible': 0,  // Hide the gravity field lines
				});
				
				console.log(`✓ Banner: Connected leftBottomNode and rightBottomNode to ${earthNode.name} gravity well`);
			} else {
				console.warn(`⚠️ Banner: No gravity well found. Bottom nodes won't experience gravity.`);
			}
		} else {
			console.warn(`⚠️ Banner: gravitywell label not found. Bottom nodes won't experience gravity.`);
		}

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
