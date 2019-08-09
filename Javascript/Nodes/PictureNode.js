/* global warpMatrix*/
/**
 * @class
 * @extends CollectionNode
 */
class PictureNode extends Node {
	/**
	 * @param  {TrussNode} trussNode
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
	constructor(trussNode, startPosition, mass = 1, name = 'PictureNode', nodeCollection, pictureFileName='default.jpg',
		...args) {
		super(trussNode, startPosition, mass, name, nodeCollection, ...args);

		this.addProperty(new StringProperty(pictureFileName, 'pictureFileName', 'pictureFileName', 'Picture filename',
			ParameterCategory.CONTENT, 'The filename of the picture.'));

		Object.defineProperty(this, 'pictureFileName', {
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
		if (!this.parentTrussNode || !this.parentTrussNode.truss || !pictureReference) {
			return;
		}
		let oldElement=this.stretchElement;
		let oldPath;
		if (oldElement) {
			oldPath=oldElement.src;
		} else {
			oldPath='Resources/default.jpg';
		}
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
	}

	/**
	 * @param  {array} nodeCollection
	 */
	setup(nodeCollection) {
		this.nodeCollection=nodeCollection;
	}


	/**
	 * @param  {Array} superNodeList
	 * @param  {Array} superTensorList
	 * @return {Object}
	 */
	serialize(superNodeList, superTensorList) {
		let representationObject = super.serialize(superNodeList, superTensorList);
		representationObject.classname = 'PictureNode';

		representationObject.pictureFileName=this.pictureFileName;
		return representationObject;
	}

	/**
	 * @param  {Object} restoreObject
	 * @param  {Array} superNodes
	 * @param  {Array} superTensors
	 */
	deSerialize(restoreObject, superNodes, superTensors) {
		super.deSerialize(restoreObject, superNodes, superTensors);
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


		if (this.stretchElement && this.nodeCollection.length>=3) {
			warpMatrix(truss, this,
				this.localPosition,
				this.nodeCollection[0].getPosition(),
				this.nodeCollection[2].getPosition(),
				this.nodeCollection[1].getPosition(),
				this.width,
				this.height);
		}
	}
}
