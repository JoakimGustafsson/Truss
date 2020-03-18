
/*jshint esversion:6 */
/* global control Tensor smallnodezoom debugEntity Behaviour BehaviourOverride*/

/** This sensor ensures that the node is always at the center of the screen
 * @class
 * @extends Behaviour
 */
class CenterDisplay extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.UPDATEPOSITION, CenterDisplay.prototype.updatePosition);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.UPDATEPOSITION, CenterDisplay.prototype.updatePosition);
	}

	/**
	 * set the offset of the view so it is centered on this node
	 *
	 */
	updatePosition() {
		universe.currentNode.worldOffset = 
			Vector.subtractVectors(
				this.localPosition,
				Vector.divideVector(universe.currentNode.worldSize,2)
			);	
	}
}
