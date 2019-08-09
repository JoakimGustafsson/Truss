
// /**
//  * @class
//  * @extends Node
//  */
// class CollectionNode extends Node {
// 	/**
// 	 * @param  {Truss} parentTrussNode
// 	 * @param  {Position} startPosition
// 	 * @param  {number} mass
// 	 * @param  {string} name
// 	 * @param  {array} nodeCollection
// 	 * @param  {Function} positionFunction
// 	 * @param  {Function} showFunction
// 	 * @param  {number} velocityLoss
// 	 * @param  {number} torqueConstant
// 	 */
// 	constructor(parentTrussNode, startPosition = new Position(0, 0), mass = 1, name = 'collectionNode', nodeCollection,
// 		positionFunction, showFunction, velocityLoss = 0.99, torqueConstant = 0) {
// 		super(parentTrussNode, startPosition, mass, name, positionFunction, showFunction, velocityLoss, torqueConstant);
// 		this.nodeCollection=nodeCollection;
// 		this.collectionlabel=collectionlabel;
// 		this._collectionlabelString=_collectionlabelString;

// 		// this.addProperty(new Property(this, 'nodeCollection', 'nodeCollection', 'OLD: Linked nodes', ParameteType.NODELIST,
// 		// ParameterCategory.CONTENT, 'A list of nodes grouped together by this node.'));

// 		this.addProperty(new Property(this, 'collectionlabelString', 'collectionlabelString', 'Collection Label', ParameteType.LABEL,
// 			ParameterCategory.CONTENT, 'The label on the nodes grouped together by this node.'));

// 		Object.defineProperty(this, 'collectionlabelString', {
// 			get: function() {
// 				return this._collectionlabelString;
// 			},
// 			set: function(value) {
// 				this._collectionlabelString = value;
// 				this.collectionlabel=universe.currentWorld.labels.findLabel(value);
// 				this.nodeCollection=this.collectionlabel.getNodes();
// 			},
// 		});
// 	}

// 	/**
// 	 * @param  {array} nodeCollection
// 	 */
// 	setup(nodeCollection) {
// 		this.nodeCollection=nodeCollection;
// 	}


// 	/**
// 	 * @param  {Array} superNodeList
// 	 * @param  {Array} superTensorList
// 	 * @return {Object}
// 	 */
// 	serialize(superNodeList, superTensorList) {
// 		let representationObject = super.serialize(superNodeList, superTensorList);
// 		representationObject.classname = 'CollectionNode';
// 		representationObject._collectionlabelString=this._collectionlabelString;
// 		// representationObject.nodeCollection=serializeList(this.nodeCollection, superNodeList);
// 		return representationObject;
// 	}

// 	/**
// 	 * @param  {Object} restoreObject
// 	 * @param  {Array} superNodes
// 	 * @param  {Array} superTensors
// 	 */
// 	deSerialize(restoreObject, superNodes, superTensors) {
// 		super.deSerialize(restoreObject, superNodes, superTensors);
// 		// this.nodeCollection= deserializeList(restoreObject.nodeCollection, superNodes);
// 		this._collectionlabelString= restoreObject._collectionlabelString;
// 		return;
// 	}

// 	/** Displays the Truss's canvas at the correct position
// 	 * @param  {Truss} truss
// 	 * @param  {number} time
// 	 * @param  {number} graphicDebugLevel=0
// 	 */
// 	show(truss, time, graphicDebugLevel = 0) {
// 		super.show(truss, time, graphicDebugLevel);
// 		this.highLight(truss.view.context);

// 		let view = truss.view;
// 		let ctx = view.context;
// 		if ((this.highlighted) && (graphicDebugLevel >= 5)) {
// 			for (let node of this.nodeCollection) {
// 				ctx.strokeStyle='green';
// 				ctx.beginPath();
// 				view.drawLine(this.localPosition, node.getPosition());
// 				ctx.stroke();
// 			}
// 		}
// 	}

// 	/**
// 	 */
// 	bottonPressedToSelectNew() {
// 		let _this = this;
// 		this.selectionEventListener = function(e) {
// 			if (_this && sensor && universe.selectedObject && universe.selectedObject.isNode) {
// 				_this.sensorSelect();
// 				_this = undefined;
// 			}
// 		};
// 		document.addEventListener('selectionEvent', this.selectionEventListener, false);
// 	}


// 	/**
// 	 *
// 	 */
// 	sensorSelect() {
// 		this.nodeCollection.push(universe.selectedObject);
// 		if (this.selectionEventListener) {
// 			document.removeEventListener('selectionEvent', this.selectionEventListener);
// 		}
// 	}
// }
