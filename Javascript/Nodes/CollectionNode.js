
/**
 * @class
 * @extends Node
 */
class CollectionNode extends Node {
	/**
	 * @param  {Truss} truss
	 * @param  {Position} startPosition
	 * @param  {number} mass
	 * @param  {string} name
	 * @param  {array} nodeCollection
	 * @param  {Function} positionFunction
	 * @param  {Function} showFunction
	 * @param  {number} velocityLoss
	 * @param  {number} torqueConstant
	 */
	constructor(truss, startPosition = new Position(0, 0), mass = 1, name = 'collectionNode', nodeCollection,
		positionFunction, showFunction, velocityLoss = 0.99, torqueConstant = 0) {
		super(truss, startPosition, mass, name, positionFunction, showFunction, velocityLoss, torqueConstant);
		this.nodeCollection=nodeCollection;

		this.addProperty(new Property(nodeCollection, 'nodeCollection', 'nodeCollection', 'Linked nodes', ParameteType.NODELIST,
			ParameterCategory.CONTENT, 'A list of nodes grouped together by this node.'));
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
		representationObject.classname = 'CollectionNode';

		representationObject.nodeCollection=serializeList(this.nodeCollection, superNodeList);
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
		this.nodeCollection= deserializeList(restoreObject.nodeCollection, superNodes);
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
		this.selectionEventListener=document.addEventListener('selectionEvent',
			function(e) {
				if (_this && sensor && universe.selectedObject && universe.selectedObject.isNode) {
					_this.sensorSelect();
					_this = undefined;
				}
			}, false);
	}


	/**
	 *
	 */
	sensorSelect() {
		this.nodeCollection.push(universe.selectedObject);
		if (this.selectionEventListener) {
			document.removeEventListener('selectionEvent', this.selectionEventListener);
		}
	}
}
