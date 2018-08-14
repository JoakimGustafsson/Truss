
/**
 * @class
 * @extends CollectionNode
 */
class PictureNode extends CollectionNode {
	/**
<<<<<<< HEAD
	 * @param  {Truss} truss
=======
	 * @param  {TrussNode} trussNode
>>>>>>> newtestbranch
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
<<<<<<< HEAD
	constructor(truss, startPosition, mass = 1, name = 'PictureNode', nodeCollection, pictureFileName='default.jpg',
		...args) {
		super(truss, startPosition, mass, name, nodeCollection, ...args);
=======
	constructor(trussNode, startPosition, mass = 1, name = 'PictureNode', nodeCollection, pictureFileName='default.jpg',
		...args) {
		super(trussNode, startPosition, mass, name, nodeCollection, ...args);
>>>>>>> newtestbranch

		this.addProperty(new Property(pictureFileName, 'pictureFileName', 'pictureFileName', 'Picture filename', ParameteType.STRING,
			ParameterCategory.CONTENT, 'The filename of the picture.'));

<<<<<<< HEAD
		Object.defineProperty(this, 'picName', {
=======
		Object.defineProperty(this, 'pictureFileName', {
>>>>>>> newtestbranch
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
<<<<<<< HEAD
		if (!this.truss || !pictureReference) {
			return;
		}
		let oldElement=this.element;
=======
		if (!this.parentTrussNode || !this.parentTrussNode.truss || !pictureReference) {
			return;
		}
		let oldElement=this.stretchElement;
>>>>>>> newtestbranch
		let oldPath;
		if (oldElement) {
			oldPath=oldElement.src;
		} else {
			oldPath='Resources/default.jpg';
		}
<<<<<<< HEAD
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
=======
		this.stretchElement = document.createElement('img');
		this.stretchElement.style.position = 'absolute';
		this.stretchElement.style.display = 'none';
		this.stretchElement.style.left = 0;
		this.stretchElement.style.top = 0;
		this.stretchElement.style.zIndex = -1;
		this.stretchElement.onerror = function() {
			this.src=oldPath;
			return;
		};
		this.stretchElement.src = 'Resources/' + pictureReference;
		if (oldElement) {
			this.parentTrussNode.truss.element.removeChild(oldElement);
		}
		if (oldPath!=this.stretchElement.src) {
			this.parentTrussNode.truss.element.appendChild(this.stretchElement);
		}
		this.width=this.stretchElement.offsetWidth;
		this.height=this.stretchElement.offsetHeight;
>>>>>>> newtestbranch
	}

	/**
	 * @param  {array} nodeCollection
	 */
	setup(nodeCollection) {
		this.nodeCollection=nodeCollection;
	}


	/**
<<<<<<< HEAD
	 * @param  {Truss} truss
=======
>>>>>>> newtestbranch
	 * @param  {Array} superNodeList
	 * @param  {Array} superTensorList
	 * @return {Object}
	 */
<<<<<<< HEAD
	serialize(truss, superNodeList, superTensorList) {
		let representationObject = super.serialize(truss, superNodeList, superTensorList);
=======
	serialize(superNodeList, superTensorList) {
		let representationObject = super.serialize(superNodeList, superTensorList);
>>>>>>> newtestbranch
		representationObject.classname = 'PictureNode';

		representationObject.pictureFileName=this.pictureFileName;
		return representationObject;
	}

	/**
<<<<<<< HEAD
	 * @param  {Truss} truss
=======
>>>>>>> newtestbranch
	 * @param  {Object} restoreObject
	 * @param  {Array} superNodes
	 * @param  {Array} superTensors
	 */
<<<<<<< HEAD
	deserialize(truss, restoreObject, superNodes, superTensors) {
		super.deserialize(truss, restoreObject, superNodes, superTensors);
=======
	deserialize(restoreObject, superNodes, superTensors) {
		super.deserialize(restoreObject, superNodes, superTensors);
>>>>>>> newtestbranch
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

<<<<<<< HEAD
		if (this.element && this.nodeCollection.length>=3) {
			warpMatrix(truss, this.element,
				this.localPosition,
				this.nodeCollection[0].getPosition(),
				this.nodeCollection[2].getPosition(),
				this.nodeCollection[1].getPosition());
=======
		if (this.stretchElement && this.nodeCollection.length>=3) {
			warpMatrix(truss, this,
				this.localPosition,
				this.nodeCollection[0].getPosition(),
				this.nodeCollection[2].getPosition(),
				this.nodeCollection[1].getPosition(),
				this.width,
				this.height);
>>>>>>> newtestbranch
		}
	};
}
