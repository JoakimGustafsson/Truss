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
		this.outerElement = createConfigurationArea('EditParameterElement');
		this.propertyArea = this.outerElement.querySelectorAll('#configview')[0];
		this.parentTrussNode = parentTrussNode;
		this.parentTrussNode.element.appendChild(this.outerElement);
		/* this.PropertyUpdateNode = new PropertyUpdateNode(
			this.parentTrussNode.world,
			this.parentTrussNode,
			'propertyupdatenode',
			propertyArea); */
		let _this = this;
		this.eventListenerFunction = function(e) {
			if ((universe.currentNode==_this.parentTrussNode) || (e.detail.trussNode==_this.parentTrussNode)) {
				_this.createOrRemoveBanner.call(_this, e);

				movePropertyEdit('propertyConfigArea');
				openBottomPanel(e, 'propertiesDiv');
			}
		};
		this.parentTrussNode.element.addEventListener('selectionEvent', this.eventListenerFunction, false);
		// this.removeBanner();
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
			this.bannerNode.eventListenerFunction(selectionEvent);
		} else if (previousSelectedObject && !selectedObject) {
			this.removeBanner(truss);
		}
	}

	/**
	 */
	createBanner() {
		this.bannerNode = new BannerNode(this.parentTrussNode, this.outerElement, this.propertyArea);
		this.bannerNode.activate();
		this.banner = this.bannerNode.create(this.parentTrussNode);
	}

	/**
	 */
	removeBanner() {
		let trussNode = this.parentTrussNode;
		this.bannerNode.hide();
		this.bannerNode.close(); // Remove the event listener
		this.banner=undefined;
	}
}
