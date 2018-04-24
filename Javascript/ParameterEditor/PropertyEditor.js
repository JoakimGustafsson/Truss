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
		this.parentTrussNode.truss.element.appendChild(outerElement);
		this.bannerNode = new BannerNode(this.parentTrussNode, outerElement);
		this.banner = undefined;
		this.PropertyUpdateNode = new PropertyUpdateNode(this.parentTrussNode, propertyArea);
		let _this = this;
		this.eventListenerFunction = function(e) {
			if ((universe.currentNode==_this.parentTrussNode) || (e.detail.truss==_this.parentTrussNode.truss)) {
				_this.createOrRemoveBanner.call(_this, e);
			}
		};
		this.parentTrussNode.element.addEventListener('selectionEvent', this.eventListenerFunction, false);
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
		} else if (previousSelectedObject && !selectedObject) {
			this.removeBanner(truss);
		}
	}

	/**
	 */
	createBanner() {
		let truss = this.parentTrussNode.truss;
		this.banner = this.bannerNode.create(truss);
		truss.addNode(this.bannerNode);
		this.PropertyUpdateNode.activate();
		truss.addNode(this.PropertyUpdateNode);
	}

	/**
	 */
	removeBanner() {
		let truss = this.parentTrussNode.truss;
		this.bannerNode.hide();
		truss.removeNode(this.bannerNode);
		this.PropertyUpdateNode.close(); // Remove the event listener
		truss.removeNode(this.PropertyUpdateNode);
		this.banner=undefined;
	}
}
