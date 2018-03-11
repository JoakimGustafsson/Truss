
/**
 * @class
 * @extends Node
 */
class TrussNode extends Node {
	/** Create a node that can contain a Truss within itself.
	 * @param  {Truss} parentTruss
	 * @param  {Position} startPosition
	 * @param  {View} view
	 * @param  {number} timestep
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {Object} TrussClass
	 * @param  {Element} displayDivName
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 */
	constructor(parentTruss, startPosition = new Vector(0, 0), view, timestep = 0.016,
		mass = 1, name = 'trussNode', TrussClass = 'Truss', displayDivName, ...args) {
		super(parentTruss, startPosition, mass, name, ...args);
		this.displayDivName=displayDivName;

		this.canvas = document.createElement('canvas');
		this.handleCanvas();

		if (view) {
			this.truss = new TrussClass(this, view, timestep, displayDivName);
			this.truss.editWindow = new EditPropertyWindow(this.truss, new Position(100, 100), 500, 500);
			this.setView();
		}
	}

	/**
	 *
	 */
	handleCanvas() {
		this.canvas.name = this.name;
		this.canvas.style.top = this.localPosition.y + 'px';
		this.canvas.style.left = this.localPosition.x + 'px';
		this.canvas.style.position = 'absolute';
		this.canvas.style.border = '1px solid red';
		if (this.displayDivName) {
			this.element = document.getElementById(this.displayDivName);
			this.element.appendChild(this.canvas);
		}
	}

	/**
	 *
	 */
	clean() {
		if (this.element) {
			this.element.innerHTML='';
		}
	}

	/**
	 * @param  {View} view
	 */
	setView() {
		this.truss.view.context = this.canvas.getContext('2d');
		this.canvas.width = this.truss.view.screenSize.x;
		this.canvas.height = this.truss.view.screenSize.y;
		this.canvas.style.width = this.truss.view.screenSize.x + 'px';
		this.canvas.style.height = this.truss.view.screenSize.y + 'px';
	}

	/**
	 * @param  {Truss} truss
	 * @param  {Array} superNodeList
	 * @param  {Array} superTensorList
	 * @return {Object}
	 */
	serialize(truss, superNodeList, superTensorList) {
		let representationObject = super.serialize(truss, superNodeList, superTensorList);
		representationObject.classname = 'TrussNode';
		representationObject.truss = this.truss.serialize();
		representationObject.displayDivName=this.displayDivName;

		// save the canvas properties
		return representationObject;
	}

	/**
	 * @param  {Truss} truss
	 * @param  {Object} restoreObject
	 * @param  {Array} superNodes
	 * @param  {Array} superTensors
	 */
	deserialize(truss, restoreObject, superNodes, superTensors) {
		super.deserialize(truss, restoreObject, superNodes, superTensors);
		this.displayDivName=restoreObject.displayDivName;
		this.truss = objectFactory(truss, restoreObject.truss, superNodes, superTensors).deserialize(restoreObject.truss);
		this.handleCanvas();
		this.setView();
	}

	/**
	 * Pauses the position updates
	 */
	togglePause() {
		this.truss.togglePause();
	}
	/**
	 * Recursively call tick() on the sub-Truss and then update this nodes position
	 * @param {number} time
	 * @param {number} delta
	 */
	updatePosition(time, delta) {
		this.truss.tick(time, delta);
		super.updatePosition(time, delta); // Call parent in order to update this nodes position
	};

	/** Displays the Truss's canvas at the correct position
	 * @param  {Truss} truss
	 * @param  {number} time
	 * @param  {number} graphicDebugLevel=0
	 */
	show(truss, time, graphicDebugLevel = 0) {
		this.highLight(canvas.context);
		this.canvas.style.left = truss.view.x(this.localPosition) + 'px';
		this.canvas.style.top = truss.view.y(this.localPosition) + 'px';
	};

	/** used ONLY by main loop on the Top level TrussNode
	 * @param  {number} time
	 */
	tick(time) {
		this.truss.tick(time);
	};
}
