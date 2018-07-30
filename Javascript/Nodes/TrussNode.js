
/**
 * @class
 * @extends Node
 */
class TrussNode extends Node {
	/** Create a node that can contain a Truss within itself.
	 * @param  {World} world
	 * @param  {Truss} parentTrussNode
	 * @param  {Truss} initialLabels
	 * @param  {Object} valueObject
	 * @param  {Position} startPosition
	 * @param  {Position} viewSize
	 * @param  {number} timestep
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {Object} TrussClass
	 * @param  {Element} displayDivName
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 */
	constructor(world, parentTrussNode, initialLabels, valueObject,
		startPosition = new Vector(0, 0), viewSize = new Vector(0, 0), timestep = 0.016,
		mass = 1, name = 'trussNode', TrussClass = Truss, ...args) {
		super(world, parentTrussNode, initialLabels, valueObject, startPosition, mass, name, ...args);

		this.world=world;
		this.element = document.createElement('div');
		this.view= new View(viewSize, this);
		this.canvas = document.createElement('canvas');
		this.selector=this;
		if (!parentTrussNode) {
			this.parentTrussNode=this;
		}
		this.handleCanvas();
		this.truss = new TrussClass(this, this.view, timestep, world);
		this.setView();

		Object.defineProperty(this, 'fps', {
			get: function() {
				return this.truss.fps;
			},
			set: function(value) {
				this.truss.fps = parseInt(value);
			},
		}
		);

		Object.defineProperty(this, 'fpsTarget', {
			get: function() {
				return 1/this.truss.timestep;
			},
			set: function(value) {
				this.truss.timestep = 1/parseInt(value);
			},
		}
		);

		Object.defineProperty(this, 'worldSize', {
			get: function() {
				return this.truss.view.worldViewSize;
			},
		}
		);
		Object.defineProperty(this, 'screenSize', {
			get: function() {
				return this.truss.view.screenSize;
			},
		}
		);
		Object.defineProperty(this, 'setWorldOffset', {
			get: function() {
				return this.truss.view.offset;
			},
		}
		);

		this.addProperty(new Property(undefined,
			'screenSize', 'screenSize', 'Screen size', ParameteType.POSITION, ParameterCategory.CONTENT,
			'The size of the displayed screen in pixels.'));

		this.addProperty(new Property(undefined,
			'worldSize', 'worldSize', 'World display size', ParameteType.POSITION, ParameterCategory.CONTENT,
			'The size of the displayed worldview in that worlds measurement.'));

		this.addProperty(new Property(undefined,
			'setWorldOffset', 'setWorldOffset', 'View position', ParameteType.POSITION, ParameterCategory.CONTENT,
			'The world coordinates of the upper left corner.'));

		this.addProperty(new Property(undefined, 'fpsTarget', 'fpsTarget', 'Updates per second', ParameteType.NUMBER,
			ParameterCategory.CONTENT, 'Graphical update frequency aim.'));

		this.addProperty(new Property(undefined, 'fps', 'fps', 'Frames per Second', ParameteType.NUMBER,
			ParameterCategory.CONTENT, 'Graphical update frequency aim.'));

		this.propertyDiv = this.element.querySelectorAll('#configview')[0];
		this.debugLevel = this.element.querySelectorAll('#debugLevel')[0];
	}

	/**
	 * @param  {Array} superNodeList
	 * @param  {Array} superTensorList
	 * @return {Object}
	 */
	serialize(superNodeList=[], superTensorList=[]) {
		let representationObject = super.serialize(superNodeList, superTensorList);
		representationObject.classname = 'TrussNode';
		// representationObject.truss = this.truss.serialize(superNodeList, superTensorList);

		// save the canvas properties
		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} superNodes
	 * @param  {Array} superTensors
	 */
	deserialize(restoreObject, superNodes, superTensors) {
		super.deserialize(restoreObject, superNodes, superTensors);
		this.truss = objectFactory(undefined, restoreObject.truss).deserialize(restoreObject.truss, superNodes, superTensors, this);
		this.handleCanvas();
		this.setView();
	}

	/**
	 * @param  {ElementSelector} elementSelector
	 * @return {Element}
	 */
	getElement(elementSelector) {
		return this.element.querySelectorAll(elementSelector)[0];
	}

	/**
	 * @param  {ElementSelector} elementSelector
	 * @return {ElementList}
	 */
	getElements(elementSelector) {
		return this.element.querySelectorAll(elementSelector);
	}

	/**
	 *
	 */
	handleCanvas() {
		this.canvas.name = this.name;
		this.canvas.style.top = this.localPosition.y + 'px';
		this.canvas.style.left = this.localPosition.x + 'px';
		this.canvas.style.position = 'relative';
		this.element.appendChild(this.canvas);
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
	 * Call this before discarding to remove nodes and event listeners
	 */
	close() {
		this.truss.close();
		this.truss.editWindow.close();
	}

	/**
	 * @param  {View} view
	 */
	setView() {
		this.truss.view.context = this.canvas.getContext('2d');
		this.canvas.width = this.truss.view.screenSize.x;
		this.canvas.height = this.truss.view.screenSize.y;
		this.canvas.style.width = '100%'; // this.truss.view.screenSize.x + 'px';
		this.canvas.style.height = '100%'; // this.truss.view.screenSize.y + 'px';

		this.truss.editWindow = new PropertyEditor(this, new Position(100, 100), 500, 500);
	}
	/**
 */
	resize() {
		this.truss.view.resize();
		this.canvas.width = this.truss.view.screenSize.x;
		this.canvas.height = this.truss.view.screenSize.y;
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
