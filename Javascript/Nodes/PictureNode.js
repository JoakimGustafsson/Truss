
/**
 * @class
 * @extends CollectionNode
 */
class PictureNode extends CollectionNode {
	/**
	 * @param  {Truss} truss
	 * @param  {Position} startPosition
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {array} nodeCollection
	 * @param  {string} pictureFileName
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 * @param  {number} torqueConstant
	 */
	constructor(truss, startPosition, mass = 1, name = 'PictureNode', nodeCollection, pictureFileName='default.jpg',
		...args) {
		super(truss, startPosition, mass, name, nodeCollection, ...args);

		this.addProperty(new Property(pictureFileName, 'pictureFileName', 'pictureFileName', 'Picture filename', ParameteType.STRING,
			ParameterCategory.CONTENT, 'The filename of the picture.'));

		Object.defineProperty(this, 'picName', {
			get: function() {
				return this._pictureFileName;
			},
			set: function(value) {
				this._pictureFileName = value;
				this.createPicture(value);
			},
		});

		this.pictureFileName=pictureFileName;
	}

	/**
	 * @param {String} pictureReference
	 */
	createPicture(pictureReference) {
		if (!this.truss || !pictureReference) {
			return;
		}
		let oldElement=this.element;
		let oldPath;
		if (oldElement) {
			oldPath=oldElement.src;
		} else {
			oldPath='Resources/default.jpg';
		}
		this.element = document.createElement('img');
		this.element.style.position = 'absolute';
		this.element.style.left = 0;
		this.element.style.top = 0;
		this.element.style.zIndex = -1;
		this.element.onerror = function() {
			this.src=oldPath;
			return;
		};
		this.element.src = 'Resources/' + pictureReference;
		if (oldElement) {
			this.truss.element.removeChild(oldElement);
		}
		if (oldPath!=this.element.src) {
			this.truss.element.appendChild(this.element);
		}
	}

	/**
	 * @param  {array} nodeCollection
	 */
	setup(nodeCollection) {
		this.nodeCollection=nodeCollection;
	}


	/**
	 * @param  {Truss} truss
	 * @param  {Array} superNodeList
	 * @param  {Array} superTensorList
	 * @return {Object}
	 */
	serialize(truss, superNodeList, superTensorList) {
		let representationObject = super.serialize(truss, superNodeList, superTensorList);
		representationObject.classname = 'PictureNode';

		representationObject.pictureFileName=this.pictureFileName;
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
		this.pictureFileName= restoreObject.pictureFileName;
		this.createPicture(this.pictureReference);
		return;
	}

	/** Displays the Truss's canvas at the correct position
	 * @param  {Truss} truss
	 * @param  {number} time
	 * @param  {number} graphicDebugLevel=0
	 */
	show(truss, time, graphicDebugLevel = 0) {
		super.show(truss, time, graphicDebugLevel);
		this.highLight(truss.view.context);

		let view = truss.view;
		let ctx = view.context;

		if (this.element && this.nodeCollection.length>=3) {
			warpMatrix(truss, this.element,
				this.localPosition,
				this.nodeCollection[0].getPosition(),
				this.nodeCollection[2].getPosition(),
				this.nodeCollection[1].getPosition());
		}
	};
}
