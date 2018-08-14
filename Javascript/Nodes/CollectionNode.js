
/**
 * @class
 * @extends Node
 */
class CollectionNode extends Node {
	/**
<<<<<<< HEAD
	 * @param  {Truss} truss
=======
	 * @param  {Truss} parentTrussNode
>>>>>>> newtestbranch
	 * @param  {Position} startPosition
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {array} nodeCollection
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 * @param  {number} torqueConstant
	 */
<<<<<<< HEAD
	constructor(truss, startPosition = new Position(0, 0), mass = 1, name = 'collectionNode', nodeCollection,
		positionFunction, showFunction, velocityLoss = 0.99, torqueConstant = 0) {
		super(truss, startPosition, mass, name, positionFunction, showFunction, velocityLoss, torqueConstant);
		this.nodeCollection=nodeCollection;

		this.addProperty(new Property(nodeCollection, 'nodeCollection', 'nodeCollection', 'Nodes', ParameteType.NODELIST,
			ParameterCategory.CONTENT, 'A list of nodes grouped together by this node.'));
=======
	constructor(parentTrussNode, startPosition = new Position(0, 0), mass = 1, name = 'collectionNode', nodeCollection,
		positionFunction, showFunction, velocityLoss = 0.99, torqueConstant = 0) {
		super(parentTrussNode, startPosition, mass, name, positionFunction, showFunction, velocityLoss, torqueConstant);
		this.nodeCollection=nodeCollection;
		this.collectionlabel=collectionlabel;
		this._collectionlabelString=_collectionlabelString;

		// this.addProperty(new Property(this, 'nodeCollection', 'nodeCollection', 'OLD: Linked nodes', ParameteType.NODELIST,
		// ParameterCategory.CONTENT, 'A list of nodes grouped together by this node.'));

		this.addProperty(new Property(this, 'collectionlabelString', 'collectionlabelString', 'Collection Label', ParameteType.LABEL,
			ParameterCategory.CONTENT, 'The label on the nodes grouped together by this node.'));

		Object.defineProperty(this, 'collectionlabelString', {
			get: function() {
				return this._collectionlabelString;
			},
			set: function(value) {
				this._collectionlabelString = value;
				this.collectionlabel=universe.currentWorld.labels.findLabel(value);
				this.nodeCollection=this.collectionlabel.getNodes();
			},
		});
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
		representationObject.classname = 'CollectionNode';

		representationObject.nodeCollection=serializeList(this.nodeCollection, superNodeList);
=======
	serialize(superNodeList, superTensorList) {
		let representationObject = super.serialize(superNodeList, superTensorList);
		representationObject.classname = 'CollectionNode';
		representationObject._collectionlabelString=this._collectionlabelString;
		// representationObject.nodeCollection=serializeList(this.nodeCollection, superNodeList);
>>>>>>> newtestbranch
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
		this.nodeCollection= deserializeList(restoreObject.nodeCollection, superNodes);
=======
	deserialize(restoreObject, superNodes, superTensors) {
		super.deserialize(restoreObject, superNodes, superTensors);
		// this.nodeCollection= deserializeList(restoreObject.nodeCollection, superNodes);
		this._collectionlabelString= restoreObject._collectionlabelString;
>>>>>>> newtestbranch
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
		if ((this.highlighted) && (graphicDebugLevel >= 5)) {
			for (let node of this.nodeCollection) {
				ctx.strokeStyle='green';
				ctx.beginPath();
				view.drawLine(this.localPosition, node.getPosition());
				ctx.stroke();
			}
		}
	}

	/**
	 */
	bottonPressedToSelectNew() {
		let _this = this;
<<<<<<< HEAD
		this.selectionEventListener=document.addEventListener('selectionEvent',
			function(e) {
				if (_this && sensor && selectedObject && selectedObject.isNode) {
					_this.sensorSelect();
					_this = undefined;
				}
			}, false);
=======
		this.selectionEventListener = function(e) {
			if (_this && sensor && universe.selectedObject && universe.selectedObject.isNode) {
				_this.sensorSelect();
				_this = undefined;
			}
		};
		document.addEventListener('selectionEvent', this.selectionEventListener, false);
>>>>>>> newtestbranch
	}


	/**
	 *
	 */
	sensorSelect() {
<<<<<<< HEAD
		this.nodeCollection.push(selectedObject);
=======
		this.nodeCollection.push(universe.selectedObject);
>>>>>>> newtestbranch
		if (this.selectionEventListener) {
			document.removeEventListener('selectionEvent', this.selectionEventListener);
		}
	}
}
