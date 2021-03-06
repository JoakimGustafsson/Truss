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
	 * @param {Truss} parentTrussNode
	 * @param {string} initialLabels
	 * @param {Element} element - The HTML element that should display the edit area
	 */
	constructor(world, parentTrussNode, initialLabels, element) {
		super(world, parentTrussNode, initialLabels + ' sensor ');
		this.element=element;
		let _this = this;
		this.name = 'PropertyUpdateNode';
		this.eventListenerFunction = function(e) {
			if (universe.currentNode==_this.parentTrussNode) {
				_this.showPropertyElements(e);
			}
		};
		this.parentTrussNode.element.addEventListener('selectionEvent', this.eventListenerFunction, false);
	}

	/**
	 * @param  {Event} selectionEvent
	 */
	showPropertyElements(selectionEvent) {
		this.iO = selectionEvent.detail.selectedObject;

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
		this.parentTrussNode.element.removeEventListener('selectionEvent', this.eventListenerFunction);
	}

	/**
	 *
	 */
	activate() {
		this.parentTrussNode.element.addEventListener('selectionEvent', this.eventListenerFunction);
	}

	/**
	 * @param  {Array} nodeList
	 * @param  {Array} tensorList
	 */
	serialize(nodeList, tensorList) {
		alert('HTMLEditNode should never be serialized');
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
