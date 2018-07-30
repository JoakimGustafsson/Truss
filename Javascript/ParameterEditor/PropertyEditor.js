/**
 * @class
 */
class PropertyEditor {
	/**
	 * @param  {Truss} parentTrussNode
	 * @param  {Position} topScreenPos
	 * @param  {number} screenWidth
	 * @param  {number} screenHeight
	 */
	constructor(parentTrussNode, topScreenPos, screenWidth, screenHeight) {
		let outerElement = createConfigurationArea('EditParameterElement');
		let propertyArea = outerElement.querySelectorAll('#configview')[0];
		this.parentTrussNode = parentTrussNode;
		this.parentTrussNode.element.appendChild(outerElement);
		this.bannerNode = new BannerNode(this.parentTrussNode, outerElement);
		this.PropertyUpdateNode = new PropertyUpdateNode(
			this.parentTrussNode.world,
			this.parentTrussNode,
			'propertyupdatenode',
			propertyArea);
		let _this = this;
		this.eventListenerFunction = function(e) {
			if ((universe.currentNode==_this.parentTrussNode) || (e.detail.trussNode==_this.parentTrussNode)) {
				_this.createOrRemoveBanner.call(_this, e);

				movePropertyEdit('propertyConfigArea');
				openBottomPanel(e, 'propertiesDiv');
			}
		};
		this.parentTrussNode.element.addEventListener('selectionEvent', this.eventListenerFunction, false);
		this.removeBanner();
	}

	/**
	 * remove event listener
	 */
	close() {
		this.removeBanner();
		this.parentTrussNode.element.removeEventListener('selectionEvent', this.eventListenerFunction);
	}

	/**
	 * @param  {Event} selectionEvent
	 */
	createOrRemoveBanner(selectionEvent) {
		let truss = selectionEvent.detail.truss;
		let selectedObject = selectionEvent.detail.selectedObject;
		let previousSelectedObject = selectionEvent.detail.previousSelectedObject;
		if (!previousSelectedObject && selectedObject && !this.banner) {
			this.createBanner(truss);
			this.PropertyUpdateNode.eventListenerFunction(selectionEvent);
		} else if (previousSelectedObject && !selectedObject) {
			this.removeBanner(truss);
		}
	}

	/**
	 */
	createBanner() {
		let trussNode = this.parentTrussNode;
		this.PropertyUpdateNode.activate();
		trussNode.addNode(this.PropertyUpdateNode);
		this.banner = this.bannerNode.create(trussNode);
		trussNode.addNode(this.bannerNode);
	}

	/**
	 */
	removeBanner() {
		let trussNode = this.parentTrussNode;
		this.bannerNode.hide();
		trussNode.removeNode(this.bannerNode);
		this.PropertyUpdateNode.close(); // Remove the event listener
		trussNode.removeNode(this.PropertyUpdateNode);
		this.banner=undefined;
	}
}
