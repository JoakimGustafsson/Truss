

/*jshint esversion:6 */
/* global control Tensor smallnodezoom debugEntity Behaviour BehaviourOverride*/


/** This behaviour sets the position according to a javascript snippet
 * @class
 * @extends Node
 */
class ScriptPosition extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.UPDATEPOSITION, ScriptPosition.prototype.updatePosition);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.UPDATEPOSITION, ScriptPosition.prototype.updatePosition);
	}

	/**
	 * Runs the script to calculate the position
	 * @param  {Object} args
	 */
	updatePosition(...args) {
		let oldPosition = new Position(this.getPosition().x, this.getPosition().y);
		let func = this.positionScript_Evaluated;
		if (func) {
			this.setPosition(func(...args));
			this.velocity = Vector.subtractVectors(this.getPosition(), oldPosition);
			return 1; // blocks all other position updates on this node.
		}
	}
}


/** This behaviour sets the position according to a javascript snippet
 * @class
 * @extends Node
 */
class ScriptShow extends Behaviour {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	attachTo(storeableObject) {
		storeableObject.registerOverride(BehaviourOverride.SHOW, ScriptShow.prototype.show);
	}

	/**
	 * @param {StoreableObject} storeableObject
	 */
	detachFrom(storeableObject) {
		storeableObject.unregisterOverride(BehaviourOverride.SHOW, ScriptShow.prototype.show);
	}

	/**
	 * Run the script to draw the object
	 * @param  {Object} args
	 * @return {number}
	 */
	show(...args) {
		let func = this.showScript_Evaluated;
		if (func) {
			func(...args);
			return 1; // blocks all other position updates on this node.
		}
	}

}
