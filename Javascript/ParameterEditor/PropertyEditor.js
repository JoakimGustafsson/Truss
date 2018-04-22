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
		this.banner = new BannerNode(this.parentTrussNode, outerElement);
		this.PropertyUpdateNode = new PropertyUpdateNode(this.parentTrussNode, propertyArea);
		let _this = this;
		this.eventListenerFunction = function(e) {
			if ((universe.currentNode==_this.parentTrussNode) || (e.detail.truss==_this.parentTrussNode.truss)) {
				_this.select.call(_this, e);
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
	select(selectionEvent) {
		let truss = selectionEvent.detail.truss;
		let selectedObject = selectionEvent.detail.selectedObject;
		let previousSelectedObject = selectionEvent.detail.previousSelectedObject;
		if (this.parentTrussNode.truss!=truss) {
			return;
		}
		if (!previousSelectedObject && selectedObject) {
			this.createBanner(truss);
		} else if (previousSelectedObject && !selectedObject) {
			this.removeBanner(truss);
		}
	}

	// Rundgång. nu finns inget som skapar eventlistenern i första hand

	/**
	 */
	createBanner() {
		let truss = this.parentTrussNode.truss;
		this.banner.create(truss);
		truss.addNode(this.banner);
		truss.addNode(this.PropertyUpdateNode);
	}

	/**
	 */
	removeBanner() {
		let truss = this.parentTrussNode.truss;
		this.banner.hide();
		// this.hammer.hide(truss);
		truss.removeNode(this.banner);
		this.PropertyUpdateNode.close(); // Remove the event listener
		truss.removeNode(this.PropertyUpdateNode);
	}
}
