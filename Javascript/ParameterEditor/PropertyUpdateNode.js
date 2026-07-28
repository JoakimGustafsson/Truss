import { SensorNode } from '../Nodes/Sensors.js';
import { universe } from '../globals.js';

/**
 *
 * @class
 * @augments SensorNode
 */
class PropertyUpdateNode extends SensorNode {
	/** This node is used to ensure that the property editing window 'element' is updated with the selected
	 * objects real time property values.
	 * @constructor
	 * @param {World} world
	 * @param {TrussNode} parentTrussNode
	 * @param {string} initialLabels
	 * @param {Element} element - The HTML element that should display the edit area
	 */
	constructor(world = undefined, parentTrussNode = undefined, initialLabels = '', element = undefined) {
		super(world, parentTrussNode, initialLabels ? initialLabels + ' sensor ' : 'sensor');
		this.element=element;
		let _this = this;
		this.name = 'PropertyUpdateNode';
		this.isListening = false;
		this.eventListenerFunction = function(e) {
			if (universe.currentNode==_this.parentTrussNode) {
				_this.showPropertyElements(e);
			}
		};
	}

	/**
	 * @param  {Event} selectionEvent
	 */
	showPropertyElements(selectionEvent) {
		this.iO = selectionEvent.detail.selectedObject;

		if (!this.element) {
			return;
		}
		this.element.innerHTML='';
		if (this.iO) {
			// this.iO.properties.populateProperties(this.element);
			this.iO.populateProperties(this.element, this);
		}
	}

	/**
	 * Call this before discarding to remove nodes and event listeners
	 */
	close() {
		if (this.isListening && this.parentTrussNode && this.parentTrussNode.element) {
			this.parentTrussNode.element.removeEventListener('selectionEvent', this.eventListenerFunction);
			this.isListening = false;
		}
	}

	/**
	 *
	 */
	activate() {
		if (!this.isListening && this.parentTrussNode && this.parentTrussNode.element) {
			this.parentTrussNode.element.addEventListener('selectionEvent', this.eventListenerFunction, false);
			this.isListening = true;
		}
	}

	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 */
	serialize(nodeList, tensorList) {
		console.error('HTMLEditNode should never be serialized');
		return {};
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

export { PropertyUpdateNode };
