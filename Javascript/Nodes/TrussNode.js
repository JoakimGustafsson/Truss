
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

		this.addProperty(new Property(displayDivName, 'displayDivName', 'displayDivName', 'HTML container id', ParameteType.STRING,
			ParameterCategory.CONTENT, 'The identity of the HTML elemet containing the truss graphics.'));


		this.canvas = document.createElement('canvas');
		this.handleCanvas();

		if (view) {
			this.truss = new TrussClass(this, view, timestep, displayDivName);
			this.setView();
		}

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

		/*
		this.addProperty(new Property(nodes, 'nodes', 'nodes', 'All Nodes', ParameteType.STRING,
			ParameterCategory.CONTENT, 'All nodes in the Truss.'));

		this.addProperty(new Property(tensors, 'tensors', 'tensors', 'All Tensors', ParameteType.STRING,
			ParameterCategory.CONTENT, 'All tensors in the Truss.'));*/

		// this.addProperty(new Property(debugLevel, 'debugLevel', 'debugLevel', 'Debug level', ParameteType.STRING,
		//	ParameterCategory.CONTENT, 'Debug level.'));
	}

	/**
	 *
	 */
	handleCanvas() {
		this.canvas.name = this.name;
		this.canvas.style.top = this.localPosition.y + 'px';
		this.canvas.style.left = this.localPosition.x + 'px';
		this.canvas.style.position = 'relative';
		// this.canvas.style.border = '2px solid red';
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
		this.canvas.style.width = '100%'; // this.truss.view.screenSize.x + 'px';
		this.canvas.style.height = '100%'; // this.truss.view.screenSize.y + 'px';

		this.truss.editWindow = new EditPropertyWindow(this.truss, new Position(100, 100), 500, 500);
	}
	/**
 */
	resize() {
		this.truss.view.resize();
		this.canvas.width = this.truss.view.screenSize.x;
		this.canvas.height = this.truss.view.screenSize.y;
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
